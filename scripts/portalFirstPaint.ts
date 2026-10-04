import type { Plugin } from "vite";
import { PORTAL_HOST } from "../src/lib/portalHosts";

/** Runs in the head before either the fallback body or React can paint. */
export function portalFirstPaintHead(): string {
  return `<script data-portal-first-paint>if(window.location.hostname.toLowerCase()===${JSON.stringify(PORTAL_HOST)}){document.documentElement.setAttribute("data-portal-first-paint","");}</script>
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