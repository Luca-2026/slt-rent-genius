import { describe,it,expect } from 'vitest';
import { ownDomainAuthLink } from '../../supabase/functions/_shared/auth-links';
describe('B2B invitation links',()=>{
  it('keeps invitation on app.slt-rental.de and carries hashed OTP',()=>{
    const url=new URL(ownDomainAuthLink('https://auth.example.test/verify?token=test-hashed-otp&type=invite&redirect_to=https%3A%2F%2Fapp.slt-rental.de%2Fb2b%2Feinladung%2F'));
    expect(url.origin).toBe('https://app.slt-rental.de');
    expect(url.pathname).toBe('/b2b/einladung/');
    expect(url.searchParams.get('token_hash')).toBe('test-hashed-otp');
    expect(url.searchParams.get('type')).toBe('invite');
  });
  it('does not convert recovery into invitation',()=>expect(new URL(ownDomainAuthLink('https://auth.example.test/verify?token=test&type=recovery')).searchParams.get('type')).toBe('recovery'));
});