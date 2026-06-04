import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { MessageCircle, X, Send, Loader2, Bot, User, Phone, Sparkles } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "react-router-dom";

type Message = { role: "user" | "assistant"; content: string };

const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/public-chat`;

const SUGGESTED_QUESTIONS = [
  "Welches Gerät passt zu meinem Projekt?",
  "Wie läuft die Miete ab?",
  "Brauche ich einen Führerschein?",
  "Was kostet die Lieferung?",
];

const TEASER_DISMISSED_KEY = "renty_teaser_dismissed_v1";
const HERO_SCROLL_THRESHOLD = 400;

export function PublicChatAssistant() {
  const { toast } = useToast();
  const location = useLocation();
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [showTeaser, setShowTeaser] = useState(false);
  const [scrollY, setScrollY] = useState(0);
  const [isMobile, setIsMobile] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Track scroll position and viewport size for mobile-homepage hero logic
  useEffect(() => {
    const update = () => {
      setScrollY(window.scrollY);
      setIsMobile(window.innerWidth < 768);
    };
    update();
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, []);

  const isHomePage = location.pathname === "/";
  const isInHero = scrollY < HERO_SCROLL_THRESHOLD;
  const pulseOrange = isMobile && isHomePage && isInHero;

  // Teaser pop-up: appears after a short delay on first visit (per session)
  useEffect(() => {
    if (typeof window === "undefined") return;
    let dismissed = false;
    try {
      dismissed = sessionStorage.getItem(TEASER_DISMISSED_KEY) === "1";
    } catch {
      // ignore
    }
    if (dismissed) return;
    const t = setTimeout(() => {
      setShowTeaser(true);
    }, 3500);
    return () => clearTimeout(t);
  }, []);

  const dismissTeaser = () => {
    setShowTeaser(false);
    try {
      sessionStorage.setItem(TEASER_DISMISSED_KEY, "1");
    } catch {
      // ignore
    }
  };

  useEffect(() => {
    if (open && messages.length === 0) {
      setMessages([{
        role: "assistant",
        content:
          "Hi, ich bin **Renty** – die digitale Assistentin von SLT Rental. 👋\n\nIch helfe dir bei Fragen zu Geräten, Mietablauf, Anhängern, Lieferung und unseren Standorten. Wenn ich etwas nicht sicher beantworten kann, verweise ich dich auf das passende Team vor Ort. Wie kann ich dir helfen?",
      }]);
    }
  }, [open]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (open) {
      dismissTeaser();
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [open]);

  const sendMessage = async (text: string) => {
    if (!text.trim() || loading) return;

    const userMsg: Message = { role: "user", content: text.trim() };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch(CHAT_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ messages: newMessages }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: "Unbekannter Fehler" }));
        toast({
          title: "Fehler",
          description: err.error || "Renty ist momentan nicht erreichbar.",
          variant: "destructive",
        });
        setLoading(false);
        return;
      }

      // Stream tokens
      const reader = res.body!.getReader();
      const decoder = new TextDecoder();
      let buffer = "";
      let assistantText = "";

      setMessages(prev => [...prev, { role: "assistant", content: "" }]);

      const updateLast = (chunk: string) => {
        assistantText += chunk;
        setMessages(prev => {
          const updated = [...prev];
          updated[updated.length - 1] = { role: "assistant", content: assistantText };
          return updated;
        });
      };

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });

        let nl: number;
        while ((nl = buffer.indexOf("\n")) !== -1) {
          let line = buffer.slice(0, nl);
          buffer = buffer.slice(nl + 1);
          if (line.endsWith("\r")) line = line.slice(0, -1);
          if (!line.startsWith("data: ")) continue;
          const json = line.slice(6).trim();
          if (json === "[DONE]") break;
          try {
            const parsed = JSON.parse(json);
            const delta = parsed.choices?.[0]?.delta?.content;
            if (delta) updateLast(delta);
          } catch {
            buffer = line + "\n" + buffer;
            break;
          }
        }
      }
    } catch (e) {
      console.error("Chat error:", e);
      toast({ title: "Verbindungsfehler", description: "Bitte versuche es erneut.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input);
    }
  };

  // Very small inline markdown renderer for **bold** and [clickable links](https://...)
  // so assistant answers can provide direct product links without raw markdown.
  const renderInlineMarkdown = (text: string) => {
    const parts = text.split(/(\[[^\]]+\]\(https?:\/\/[^\s)]+\)|\*\*[^*]+\*\*)/g);
    return parts.map((part, idx) => {
      const linkMatch = part.match(/^\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)$/);
      if (linkMatch) {
        const [, label, href] = linkMatch;
        return (
          <a
            key={idx}
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className="font-semibold text-primary underline underline-offset-2 hover:text-primary/80"
          >
            {label}
          </a>
        );
      }
      if (part.startsWith("**") && part.endsWith("**")) {
        return <strong key={idx}>{part.slice(2, -2)}</strong>;
      }
      return <span key={idx}>{part}</span>;
    });
  };

  return (
    <>
      {/* Teaser pop-up (above the button) — first visit only */}
      {showTeaser && !open && (
        <div className="fixed bottom-24 right-6 z-50 max-w-[280px] animate-in slide-in-from-bottom-4 fade-in duration-500">
          <div className="relative bg-background border border-border rounded-2xl shadow-2xl p-4 pr-8">
            <button
              onClick={dismissTeaser}
              className="absolute top-2 right-2 text-muted-foreground hover:text-foreground transition-colors"
              aria-label="Teaser schließen"
            >
              <X className="h-3.5 w-3.5" />
            </button>
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
                <Sparkles className="h-4 w-4 text-primary-foreground" />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-foreground leading-tight mb-1">
                  Hi, ich bin Renty 👋
                </p>
                <p className="text-xs text-muted-foreground leading-snug mb-2">
                  Deine digitale Assistentin von SLT Rental. Frag mich zu Geräten, Lieferung & Mietablauf.
                </p>
                <button
                  onClick={() => setOpen(true)}
                  className="text-xs font-semibold text-primary hover:underline"
                >
                  Jetzt fragen →
                </button>
              </div>
            </div>
            {/* tail pointing down-right toward the button */}
            <div className="absolute -bottom-1.5 right-8 w-3 h-3 bg-background border-r border-b border-border rotate-45" />
          </div>
        </div>
      )}

      {/* Floating button – bottom-right on all devices */}
      <button
        onClick={() => setOpen(v => !v)}
        className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full bg-primary text-primary-foreground shadow-lg hover:bg-primary/90 transition-all flex items-center justify-center group"
        aria-label="Renty – KI-Assistentin öffnen"
      >
        {/* Orange highlight ring – draws fully around, then erases, then repeats */}
        {!open && (
          <>
            <style>{`
              @keyframes rentyRingDraw {
                0%   { stroke-dashoffset: 289; }
                50%  { stroke-dashoffset: 0; }
                100% { stroke-dashoffset: -289; }
              }
            `}</style>
            <span className="absolute inset-[-3px] pointer-events-none z-0">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                <circle
                  cx="50"
                  cy="50"
                  r="46"
                  fill="none"
                  stroke="#ff8e02"
                  strokeWidth="3"
                  strokeDasharray="289 289"
                  strokeLinecap="round"
                  style={{ animation: "rentyRingDraw 3s ease-in-out infinite" }}
                />
              </svg>
            </span>
          </>
        )}
        <span className="relative z-10">
          {open ? <X className="h-6 w-6" /> : <MessageCircle className="h-6 w-6" />}
        </span>
        {/* "Renty" label – visible on hover on desktop */}
        {!open && (
          <span className="hidden md:block absolute right-full mr-3 px-2.5 py-1 rounded-lg bg-foreground text-background text-xs font-semibold whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none shadow-md">
            Frag Renty
          </span>
        )}
      </button>

      {/* Chat panel */}
      {open && (
        <div
          className="fixed bottom-24 right-6 z-50 w-[calc(100vw-3rem)] max-w-[360px] bg-background border border-border rounded-2xl shadow-2xl flex flex-col overflow-hidden"
          style={{ height: "520px" }}
        >
          {/* Header */}
          <div className="bg-primary px-4 py-3 flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-primary-foreground/20 flex items-center justify-center flex-shrink-0">
              <Sparkles className="h-4 w-4 text-primary-foreground" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-primary-foreground font-semibold text-sm leading-tight">Renty</p>
              <p className="text-primary-foreground/70 text-xs leading-tight">Digitale Assistentin · SLT Rental</p>
            </div>
            <a
              href="tel:+4921514179904"
              className="flex items-center gap-1.5 bg-primary-foreground/20 hover:bg-primary-foreground/30 transition-colors rounded-lg px-2.5 py-1.5 text-primary-foreground text-xs font-medium"
              onClick={e => e.stopPropagation()}
              title="Direkt anrufen"
            >
              <Phone className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Anrufen</span>
            </a>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {messages.map((msg, i) => (
              <div key={i} className={`flex gap-2 ${msg.role === "user" ? "flex-row-reverse" : "flex-row"}`}>
                <div className={`w-7 h-7 rounded-full flex-shrink-0 flex items-center justify-center text-xs ${
                  msg.role === "user"
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground"
                }`}>
                  {msg.role === "user" ? <User className="h-3.5 w-3.5" /> : <Bot className="h-3.5 w-3.5" />}
                </div>
                <div className={`max-w-[80%] rounded-2xl px-3 py-2 text-sm leading-relaxed whitespace-pre-wrap ${
                  msg.role === "user"
                    ? "bg-primary text-primary-foreground rounded-tr-sm"
                    : "bg-muted text-foreground rounded-tl-sm"
                }`}>
                  {msg.content ? renderInlineMarkdown(msg.content) : (loading && i === messages.length - 1 ? (
                    <span className="flex gap-1 py-1">
                      <span className="w-1.5 h-1.5 bg-muted-foreground/50 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                      <span className="w-1.5 h-1.5 bg-muted-foreground/50 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                      <span className="w-1.5 h-1.5 bg-muted-foreground/50 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                    </span>
                  ) : "")}
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />

            {/* Suggested questions */}
            {messages.length === 1 && (
              <div className="space-y-2 pt-2">
                <p className="text-xs text-muted-foreground px-1">Häufige Fragen:</p>
                {SUGGESTED_QUESTIONS.map((q) => (
                  <button
                    key={q}
                    onClick={() => sendMessage(q)}
                    className="w-full text-left text-xs border border-border rounded-xl px-3 py-2 hover:bg-muted transition-colors"
                    disabled={loading}
                  >
                    {q}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Input */}
          <div className="border-t border-border p-3 flex gap-2">
            <input
              ref={inputRef}
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Frag Renty etwas…"
              disabled={loading}
              className="flex-1 text-sm bg-muted rounded-xl px-3 py-2 outline-none focus:ring-2 focus:ring-primary/30 placeholder:text-muted-foreground disabled:opacity-50"
            />
            <Button
              size="icon"
              onClick={() => sendMessage(input)}
              disabled={loading || !input.trim()}
              className="rounded-xl h-9 w-9 flex-shrink-0"
            >
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            </Button>
          </div>
        </div>
      )}
    </>
  );
}
