import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { Layout } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { Eye, EyeOff, LogIn, Building2 } from "lucide-react";

export default function B2BLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { signIn, user, isAdmin, loading: authLoading } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  // Redirect already-authenticated users based on role
  useEffect(() => {
    if (!authLoading && user) {
      navigate(isAdmin ? "/b2b/admin" : "/b2b/dashboard", { replace: true });
    }
  }, [user, authLoading, isAdmin, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      toast({
        title: "Fehler",
        description: "Bitte fülle alle Felder aus.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    const { error } = await signIn(email, password);
    setIsLoading(false);

    if (error) {
      toast({
        title: "Login fehlgeschlagen",
        description: error.message === "Invalid login credentials" 
          ? "Ungültige E-Mail oder Passwort."
          : error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Erfolgreich angemeldet",
        description: "Willkommen im B2B-Portal!",
      });
      // Redirect happens via useEffect based on isAdmin state
    }
  };

  return (
    <Layout>
      <Helmet><meta name="robots" content="noindex, nofollow" /></Helmet>
      <section className="py-12 lg:py-20 bg-surface-light min-h-[calc(100vh-200px)]">
        <div className="section-container">
          <div className="max-w-md mx-auto">
            <Card>
              <CardHeader className="text-center">
                <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Building2 className="h-8 w-8 text-primary" />
                </div>
                <CardTitle className="text-2xl">B2B-Portal Login</CardTitle>
                <CardDescription>
                  Melde dich an, um auf dein Firmenkonto zuzugreifen.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-headline mb-1.5">
                      E-Mail
                    </label>
                    <Input
                      type="email"
                      placeholder="firma@beispiel.de"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-headline mb-1.5">
                      Passwort
                    </label>
                    <div className="relative">
                      <Input
                        type={showPassword ? "text" : "password"}
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-headline"
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-sm">
                    <Link to="/b2b/passwort-vergessen" className="text-primary hover:underline">
                      Passwort vergessen?
                    </Link>
                  </div>

                  <Button
                    type="submit"
                    className="w-full bg-accent text-accent-foreground hover:bg-cta-orange-hover"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      "Wird angemeldet..."
                    ) : (
                      <>
                        <LogIn className="h-4 w-4 mr-2" />
                        Anmelden
                      </>
                    )}
                  </Button>
                </form>

                <div className="mt-6 pt-6 border-t border-border text-center">
                  <p className="text-sm text-muted-foreground mb-3">
                    Noch kein B2B-Konto?
                  </p>
                  <Link to="/b2b/registrieren">
                    <Button variant="outline" className="w-full">
                      Jetzt als Geschäftskunde registrieren
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
    </Layout>
  );
}
