import { createClient } from 'npm:@supabase/supabase-js@2';
import { corsHeaders } from 'npm:@supabase/supabase-js@2/cors';
import { z } from 'npm:zod@3';
import { approvalReady, documentBytes } from '../_shared/onsite-b2b.ts';

const schema = z.object({
  action: z.enum(['create','info','upload','resend','approve']),
  customer_id: z.string().uuid(),
  legal_form: z.string().max(40).optional(),
  kind: z.enum(['business','sepa']).optional(),
  filename: z.string().min(1).max(160).optional(),
  mime: z.enum(['application/pdf','image/jpeg','image/png']).optional(),
  base64: z.string().max(7_000_000).optional(),
});
const INVITE_URL = 'https://app.slt-rental.de/b2b/einladung/';

Deno.serve(async req => {
  const reply = (data: unknown, status=200) => new Response(JSON.stringify(data), {status,headers:{...corsHeaders,'Content-Type':'application/json'}});
  if(req.method==='OPTIONS') return new Response('ok',{headers:corsHeaders});
  if(req.method!=='POST') return reply({error:'Methode nicht erlaubt'},405);
  try {
    const url=Deno.env.get('SUPABASE_URL'); const anon=Deno.env.get('SUPABASE_ANON_KEY'); const key=Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    if(!url || !anon || !key) return reply({error:'Konfiguration fehlt'},500);
    const authorization=req.headers.get('Authorization') ?? '';
    const caller=createClient(url,anon,{global:{headers:{Authorization:authorization}}});
    const {data:{user},error:authError}=await caller.auth.getUser();
    if(authError || !user) return reply({error:'Bitte anmelden'},401);
    const parsed=schema.safeParse(await req.json());
    if(!parsed.success) return reply({error:'Ungültige Eingaben'},400);
    const b=parsed.data; const service=createClient(url,key);
    const {data:customer,error:crmError}=await service.from('crm_customers').select('*').eq('id',b.customer_id).single();
    if(crmError || !customer) return reply({error:'Kunde nicht gefunden'},404);
    const {data:allowed,error:permissionError}=await caller.rpc('can_manage_b2b_onboarding',{_actor:user.id,_location:customer.location});
    if(permissionError || !allowed) return reply({error:'Nur Admin oder aktive Niederlassungsleitung am Kundenstandort'},403);
    const audit=async (action:string,profileId:string) => {
      const {error}=await service.from('admin_audit_log').insert({actor_user_id:user.id,actor_email:user.email,actor_role:'staff',action,entity_type:'b2b_profiles',entity_id:profileId,entity_label:customer.company_name,changes:{customer_id:customer.id}});
      if(error) throw new Error('Verlauf konnte nicht gespeichert werden.');
    };
    if(b.action==='create' && !customer.b2b_profile_id) {
      if(!customer.company_name || !customer.first_name || !customer.last_name || !customer.email || !customer.phone || !customer.street || !customer.postal_code || !customer.city) return reply({error:'Bitte Firma, Name, E-Mail, Telefon und Adresse vollständig angeben.'},400);
      const email=z.string().email().parse(customer.email.trim().toLowerCase());
      const {data:created,error:createError}=await service.auth.admin.createUser({email,email_confirm:false});
      if(createError || !created.user) return reply({error:'Die E-Mail wird bereits verwendet oder der Zugang konnte nicht angelegt werden. Bestehende Konten werden nicht verändert.'},409);
      const {data:profile,error:profileError}=await service.rpc('link_onsite_b2b_profile',{_customer:customer.id,_user:created.user.id,_actor:user.id,_legal_form:b.legal_form || null});
      if(profileError || !profile) {
        await service.auth.admin.deleteUser(created.user.id);
        return reply({error:'B2B-Verknüpfung fehlgeschlagen. Bitte Kundenakte erneut öffnen.'},409);
      }
      const {error:inviteError}=await service.auth.admin.inviteUserByEmail(email,{redirectTo:INVITE_URL});
      if(!inviteError) await service.from('b2b_profiles').update({invitation_sent_at:new Date().toISOString()}).eq('id',profile);
      await audit('onsite_b2b_created',profile);
      return reply({profile_id:profile,email_sent:!inviteError,warning:inviteError?'Konto angelegt, Einladung nicht versendet. Bitte erneut senden.':null});
    }
    if(!customer.b2b_profile_id) return reply({error:'Noch kein B2B-Profil vorhanden'},404);
    const {data:p,error:profileError}=await service.from('b2b_profiles').select('*').eq('id',customer.b2b_profile_id).single();
    if(profileError || !p) return reply({error:'B2B-Profil fehlt'},404);
    const {data:profileAllowed}=await caller.rpc('can_manage_b2b_onboarding',{_actor:user.id,_location:p.assigned_location});
    if(!profileAllowed) return reply({error:'Keine Berechtigung für diesen B2B-Standort'},403);
    const {data:auth}=await service.auth.admin.getUserById(p.user_id);
    if(!auth.user) return reply({error:'Zugang nicht gefunden'},404);
    const {data:passwordSet}=await service.rpc('onsite_b2b_password_set',{_user:p.user_id});
    if(b.action==='info' || b.action==='create') {
      const signed=async (value:string|null) => {
        if(!value) return null;
        const marker='/b2b-documents/';
        const path=value.startsWith('private:')?value.slice(8):value.includes(marker)?decodeURIComponent(value.split(marker)[1].split('?')[0]):null;
        if(!path) return null;
        const {data,error}=await service.storage.from('b2b-documents').createSignedUrl(path,300);
        if(error) throw new Error('Dokument konnte nicht geöffnet werden');
        return data.signedUrl;
      };
      return reply({profile_id:p.id,status:p.status,email:auth.user.email,email_confirmed:Boolean(auth.user.email_confirmed_at),password_set:Boolean(passwordSet),ready:approvalReady(Boolean(auth.user.email_confirmed_at),Boolean(passwordSet),p.document_url,p.sepa_mandate_url),business_filename:p.document_filename,sepa_filename:p.sepa_mandate_filename,business_url:await signed(p.document_url),sepa_url:await signed(p.sepa_mandate_url),invitation_sent_at:p.invitation_sent_at});
    }
    if(b.action==='resend') {
      if(auth.user.email_confirmed_at) return reply({error:'E-Mail bereits bestätigt. Passwort bei Bedarf über „Passwort vergessen“ zurücksetzen.'},409);
      if(p.invitation_sent_at && Date.now()-new Date(p.invitation_sent_at).getTime()<60_000) return reply({error:'Bitte vor erneutem Versand eine Minute warten.'},429);
      const {error}=await service.auth.admin.inviteUserByEmail(auth.user.email ?? p.contact_email,{redirectTo:INVITE_URL});
      if(error) return reply({error:'Einladung konnte nicht versendet werden.'},502);
      const {error:updateError}=await service.from('b2b_profiles').update({invitation_sent_at:new Date().toISOString()}).eq('id',p.id);
      if(updateError) throw updateError;
      await audit('onsite_b2b_invitation_resent',p.id);
      return reply({success:true});
    }
    if(b.action==='upload') {
      if(!b.kind || !b.filename || !b.mime || !b.base64) return reply({error:'Datei fehlt'},400);
      const bytes=documentBytes(b.base64,b.mime);
      const ext=b.mime==='application/pdf'?'pdf':b.mime==='image/png'?'png':'jpg';
      const path=`${p.user_id}/onsite/${b.kind}-${crypto.randomUUID()}.${ext}`;
      const {error:uploadError}=await service.storage.from('b2b-documents').upload(path,bytes,{contentType:b.mime,upsert:false});
      if(uploadError) throw new Error('Hochladen fehlgeschlagen');
      const update=b.kind==='business'?{document_url:`private:${path}`,document_filename:b.filename}:{sepa_mandate_url:`private:${path}`,sepa_mandate_filename:b.filename};
      const {error:updateError}=await service.from('b2b_profiles').update(update).eq('id',p.id);
      if(updateError) { await service.storage.from('b2b-documents').remove([path]); throw new Error('Dokument konnte nicht zugeordnet werden'); }
      await audit(`onsite_b2b_${b.kind}_uploaded`,p.id);
      return reply({success:true});
    }
    const {error}=await caller.rpc('approve_onsite_b2b_profile',{_profile:p.id});
    if(error) return reply({error:error.message},400);
    return reply({success:true});
  } catch(error) {
    return reply({error:error instanceof Error?error.message:'Vorgang fehlgeschlagen'},400);
  }
});