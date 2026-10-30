import { describe,it,expect } from 'vitest';
import { approvalReady,documentBytes } from '../../supabase/functions/_shared/onsite-b2b';
describe('Vor-Ort-B2B-Freigabe',()=>{
  it('verlangt tatsächliche E-Mail-Bestätigung',()=>expect(approvalReady(false,true,'private:a','private:b')).toBe(false));
  it('verlangt ein eigenes Passwort',()=>expect(approvalReady(true,false,'private:a','private:b')).toBe(false));
  it('verlangt Gewerbenachweis',()=>expect(approvalReady(true,true,null,'private:b')).toBe(false));
  it('verlangt SEPA-Mandat',()=>expect(approvalReady(true,true,'private:a',null)).toBe(false));
  it('erlaubt Freigabe mit beiden privaten Dokumenten und bestätigtem Zugang',()=>expect(approvalReady(true,true,'private:a','private:b')).toBe(true));
  it('weist eine falsche PDF-Datei zurück',()=>expect(()=>documentBytes(btoa('not PDF'),'application/pdf')).toThrow());
  it('erlaubt eine PDF mit gültiger Signatur',()=>expect(documentBytes(btoa('%PDF-1.7'),'application/pdf').length).toBe(8));
  it('begrenzt Dokumente auf 5 MB',()=>expect(()=>documentBytes('a'.repeat(7_000_001),'application/pdf')).toThrow());
});