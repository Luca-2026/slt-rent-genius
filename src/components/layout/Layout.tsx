import { ReactNode } from "react";
import { useLocation } from "react-router-dom";
import { Header } from "./Header";
import { Footer } from "./Footer";
import { PublicChatAssistant } from "@/components/PublicChatAssistant";
import { RentwareLoader } from "@/components/RentwareLoader";
import { CookieConsentBanner } from "@/components/CookieConsentBanner";
import { isPortalPath, isPortalHost } from "@/lib/portalDomain";

interface LayoutProps {
  children: ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const location = useLocation();
  const isPortal = isPortalPath(location.pathname) || isPortalHost();

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">{children}</main>
      <Footer />
      {/* Spacer so floating buttons (chat + rentware) don't cover footer content on mobile */}
      <div className="h-0 md:hidden" aria-hidden="true" />
      {!isPortal && <PublicChatAssistant />}
      <RentwareLoader />
      <CookieConsentBanner />
    </div>
  );
}



