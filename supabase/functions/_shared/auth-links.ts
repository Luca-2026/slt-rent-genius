/** Public authentication links must not depend on the provider's default site URL. */
export const PORTAL_AUTH_ORIGIN = "https://app.slt-rental.de";
export const PASSWORD_RESET_URL = `${PORTAL_AUTH_ORIGIN}/b2b/passwort-zuruecksetzen/`;

export function recoveryLink(properties: { hashed_token?: string }): string {
  if (!properties.hashed_token) throw new Error("Password recovery token missing");
  const url = new URL(PASSWORD_RESET_URL);
  url.searchParams.set("token_hash", properties.hashed_token);
  url.searchParams.set("type", "recovery");
  return url.href;
}

/** Keep provider verification endpoints intact, but replace legacy app redirects. */
export function ownDomainAuthLink(value: string): string {
  const url = new URL(value);
  if (url.hostname === "slt-rent-genius.lovable.app") {
    url.hostname = "app.slt-rental.de";
    url.protocol = "https:";
    url.port = "";
  }
  const redirect = url.searchParams.get("redirect_to");
  if (redirect) {
    const target = new URL(redirect);
    if (target.hostname === "slt-rent-genius.lovable.app" || target.hostname === "www.slt-rental.de" || target.hostname === "slt-rental.de") {
      target.hostname = "app.slt-rental.de";
      target.protocol = "https:";
      target.port = "";
      url.searchParams.set("redirect_to", target.href);
    }
  }
  return url.href;
}