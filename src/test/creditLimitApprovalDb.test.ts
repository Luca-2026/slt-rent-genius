import { PGlite } from '@electric-sql/pglite';
import { readFileSync } from 'node:fs';
import { beforeAll, afterAll, expect, it } from 'vitest';
const db = new PGlite();
const branch = '11111111-1111-4111-8111-111111111111';
const admin = '22222222-2222-4222-8222-222222222222';
const customer = '33333333-3333-4333-8333-333333333333';
const actor = async (id: string) => db.query("SELECT set_config('request.jwt.claim.sub',$1,false)",[id]);
beforeAll(async () => {
  await db.exec(`CREATE ROLE anon; CREATE ROLE authenticated; CREATE ROLE service_role; CREATE SCHEMA auth;
    CREATE FUNCTION auth.uid() RETURNS uuid LANGUAGE sql AS $$ SELECT nullif(current_setting('request.jwt.claim.sub',true),'')::uuid $$;
    CREATE FUNCTION has_role(uuid,text) RETURNS boolean LANGUAGE sql AS $$ SELECT $1='${admin}'::uuid AND $2='admin' $$;
    CREATE FUNCTION is_staff_member(uuid) RETURNS boolean LANGUAGE sql AS $$ SELECT $1 IN ('${admin}'::uuid,'${branch}'::uuid) $$;
    CREATE FUNCTION can_manage_b2b_onboarding(uuid,text) RETURNS boolean LANGUAGE sql AS $$ SELECT is_staff_member($1) AND ($1='${admin}'::uuid OR $2='bonn') $$;
    CREATE TABLE b2b_profiles(id uuid PRIMARY KEY,status text,assigned_location text,company_name text,credit_limit numeric,credit_limit_requested_at timestamptz);
    CREATE TABLE staff_profiles(user_id uuid,first_name text,last_name text);
    CREATE TABLE staff_todo_lists(id uuid PRIMARY KEY DEFAULT gen_random_uuid(),title text,description text,location text,status text,priority text,due_date date,created_by uuid,created_by_name text,assigned_name text,sent_at timestamptz,completed_at timestamptz);
    CREATE TABLE staff_todo_items(id uuid PRIMARY KEY DEFAULT gen_random_uuid(),list_id uuid,title text,sort_order integer,is_done boolean DEFAULT false,done_at timestamptz,done_by uuid);
    INSERT INTO b2b_profiles VALUES('${customer}','approved','bonn','TEST Kreditfreigabe',500,NULL);`);
  await db.exec(readFileSync('drizzle/migrations/0156_credit_limit_admin_approval_tasks.sql','utf8'));
  await db.exec(readFileSync('drizzle/migrations/0157_credit_approval_invoker_guard.sql','utf8'));
  await db.exec(readFileSync('drizzle/migrations/0158_protect_credit_approval_task_points.sql','utf8'));
},30000);
afterAll(()=>db.close());
let task: string;
it('branch may grant exactly 2000 EUR, never 2000.01 EUR', async()=>{
  await db.query('SELECT apply_staff_credit_limit($1,$2,2000)',[branch,customer]);
  expect(Number((await db.query<{credit_limit:string}>('SELECT credit_limit FROM b2b_profiles')).rows[0].credit_limit)).toBe(2000);
  await expect(db.query('SELECT apply_staff_credit_limit($1,$2,2000.01)',[branch,customer])).rejects.toThrow();
});
it('request above 2000 preserves limit, creates one shared admin task and retries deduplicate', async()=>{
  await actor(branch);
  task=(await db.query<{id:string}>('SELECT request_credit_limit_approval($1,3000) AS id',[customer])).rows[0].id;
  expect((await db.query<{id:string}>('SELECT request_credit_limit_approval($1,3000) AS id',[customer])).rows[0].id).toBe(task);
  expect((await db.query('SELECT * FROM staff_todo_lists')).rows).toHaveLength(1);
  expect(Number((await db.query<{credit_limit:string}>('SELECT credit_limit FROM b2b_profiles')).rows[0].credit_limit)).toBe(2000);
  expect((await db.query<{ok:boolean}>('SELECT can_access_todo_list($1,$2) AS ok',[task,admin])).rows[0].ok).toBe(true);
  expect((await db.query<{ok:boolean}>('SELECT can_access_todo_list($1,$2) AS ok',[task,branch])).rows[0].ok).toBe(false);
});
it('only explicit admin approval grants requested amount and duplicate decisions fail',async()=>{
  await actor('');
  await expect(db.query('SELECT apply_staff_credit_limit($1,$2,3000,$3)',[branch,customer,task])).rejects.toThrow();
  await expect(db.query('SELECT apply_staff_credit_limit($1,$2,3000)',[admin,customer])).rejects.toThrow();
  await db.query('SELECT apply_staff_credit_limit($1,$2,3000,$3)',[admin,customer,task]);
  expect(Number((await db.query<{credit_limit:string}>('SELECT credit_limit FROM b2b_profiles')).rows[0].credit_limit)).toBe(3000);
  expect((await db.query<{credit_request_status:string}>('SELECT credit_request_status FROM staff_todo_lists WHERE id=$1',[task])).rows[0].credit_request_status).toBe('approved');
  await expect(db.query('SELECT apply_staff_credit_limit($1,$2,3000,$3)',[admin,customer,task])).rejects.toThrow();
});
it('rejection keeps existing limit and branch cannot reject',async()=>{
  await actor(branch);
  const tid=(await db.query<{id:string}>('SELECT request_credit_limit_approval($1,4000) AS id',[customer])).rows[0].id;
  await expect(db.query('SELECT reject_credit_limit_approval($1)',[tid])).rejects.toThrow();
  await actor(admin); await db.query('SELECT reject_credit_limit_approval($1)',[tid]);
  expect(Number((await db.query<{credit_limit:string}>('SELECT credit_limit FROM b2b_profiles')).rows[0].credit_limit)).toBe(3000);
  expect((await db.query<{credit_request_status:string}>('SELECT credit_request_status FROM staff_todo_lists WHERE id=$1',[tid])).rows[0].credit_request_status).toBe('rejected');
});
it('own location and threshold are enforced on request',async()=>{
  await actor(branch);
  await expect(db.query('SELECT request_credit_limit_approval($1,2000)',[customer])).rejects.toThrow();
  await db.exec("UPDATE b2b_profiles SET assigned_location='krefeld'");
  await expect(db.query('SELECT request_credit_limit_approval($1,5000)',[customer])).rejects.toThrow();
});