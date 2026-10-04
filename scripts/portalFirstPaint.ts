import type { Plugin } from "vite";
import { PORTAL_HOST, PUBLIC_HOST, LEGACY_PUBLISHED_HOST } from "../src/lib/portalHosts";

/** Runs in the head before either the fallback body or React can paint. */
export function portalFirstPaintHead(): string {
  return `<script data-portal-first-paint>if(window.location.hostname.toLowerCase()===${JSON.stringify(LEGACY_PUBLISHED_HOST)}){document.documentElement.setAttribute("data-custom-domain-redirect","");var u=new URL(window.location.href);var recovery=u.hash.indexOf("type=recovery")!==-1;var portal=u.pathname==="/b2b"||u.pathname.indexOf("/b2b/")===0||recovery;u.hostname=portal?${JSON.stringify(PORTAL_HOST)}:${JSON.stringify(PUBLIC_HOST)};u.protocol="https:";u.port="";if(recovery&&u.pathname.indexOf("/b2b/")!==0){u.pathname="/b2b/passwort-zuruecksetzen/";}window.location.replace(u.href);}if(window.location.hostname.toLowerCase()===${JSON.stringify(PORTAL_HOST)}){document.documentElement.setAttribute("data-portal-first-paint","");}</script>
<style data-custom-domain-redirect>html[data-custom-domain-redirect] body{display:none!important;}</style>
<style data-portal-first-paint>html[data-portal-first-paint] #root [data-prerender-hero]{display:none!important;}</style>`;
}

export function portalFirstPaintPlugin(): Plugin {
  return {
    name: "portal-first-paint",
    transformIndexHtml: {
      order: "pre",
      handler: (html) => html.replace(/<head>/i, `<head>\n${portalFirstPaintHead()}`),
    },
  };
}