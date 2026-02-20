import { ReactNode } from "react";
import { Header } from "./Header";
import { Footer } from "./Footer";
import { PublicChatAssistant } from "@/components/PublicChatAssistant";
import { RentwarePositioner } from "@/components/RentwarePositioner";

interface LayoutProps {
  children: ReactNode;
}

export function Layout({ children }: LayoutProps) {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">{children}</main>
      <Footer />
      {/* Spacer so floating buttons (chat + rentware) don't cover footer content on mobile */}
      <div className="h-0 md:hidden" aria-hidden="true" />
      <PublicChatAssistant />
      <RentwarePositioner />
    </div>
  );
}


