/// <reference types="vite/client" />

// Rentware Web Components
declare global {
  namespace JSX {
    interface IntrinsicElements {
      "rtr-cart-button": React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement>;
      "rtr-checkout": React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement>;
      "rtr-article-booking": React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement> & { "article-id"?: string; view?: string }, HTMLElement>;
    }
  }
}

export {};
