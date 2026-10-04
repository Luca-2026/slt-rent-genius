import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Lock, CheckCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { PasswordStrengthIndicator } from "@/components/b2b/PasswordStrengthIndicator";

export default function ResetPassword() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [sessionReady, setSessionReady] = useState(false);
  const [linkError, setLinkError] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    // Listen for the PASSWORD_RECOVERY event
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY") {
        setSessionReady(true);
      }
    });

    let active = true;
    const tokenHash = new URLSearchParams(window.location.search).get("token_hash");
    if (tokenHash) {
      // Remove the single-use token from history before verifying; never log it.
      const cleanUrl = new URL(window.location.href);
      cleanUrl.searchParams.delete("token_hash");
      cleanUrl.searchParams.delete("type");
      window.history.replaceState(window.history.state, "", cleanUrl.pathname + cleanUrl.search + cleanUrl.hash);
      supabase.auth.verifyOtp({ token_hash: tokenHash, type: "recovery" }).then(({ error }) => {
        if (!active) return;
        if (error) { setLinkError(true); setSessionReady(false); }
        else setSessionReady(true);
      }).catch(() => { if (active) setLinkError(true); });
    } else {
      // Existing provider links deliver their session through the URL hash.
      supabase.auth.getSession().then(({ data: { session } }) => {
        if (active && session) setSessionReady(true);
      });
    }

    return () => { active = false; subscription.unsubscribe(); };
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password.length < 6) {
      toast({ title: "Fehler", description: "Das Passwort muss mindestens 6 Zeichen lang sein.", variant: "destructive" });
      return;
    }

    if (password !== confirmPassword) {
      toast({ title: "Fehler", description: "Die Passwörter stimmen nicht überein.", variant: "destructive" });
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({ password });
      if (error) throw error;
      setSuccess(true);
      setTimeout(() => navigate("/b2b/login"), 3000);
    } catch (error: any) {
      toast({
        title: "Fehler",
        description: error.message || "Passwort konnte nicht geändert werden.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Neues Passwort festlegen</CardTitle>
          <CardDescription>
            {success
              ? "Ihr Passwort wurde erfolgreich geändert."
              : "Geben Sie Ihr neues Passwort ein."}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {success ? (
            <div className="text-center space-y-4">
              <CheckCircle className="h-12 w-12 text-primary mx-auto" />
              <p className="text-sm text-muted-foreground">
                Sie werden in Kürze zum Login weitergeleitet...
              </p>
            </div>
          ) : !sessionReady ? (
            <div className="text-center space-y-4">
              <p className="text-sm text-muted-foreground">
                {linkError ? "Dieser Link ist ungültig oder abgelaufen. Bitte fordern Sie einen neuen Passwortlink an." : "Bitte klicken Sie auf den Link in Ihrer E-Mail, um Ihr Passwort zurückzusetzen."}
              </p>
              {linkError && <Button variant="outline" onClick={() => navigate("/b2b/passwort-vergessen/")}>Neuen Link anfordern</Button>}
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="password">Neues Passwort</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="password"
                    type="password"
                    placeholder="Mindestens 6 Zeichen"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10"
                    required
                    minLength={6}
                  />
                </div>
                <PasswordStrengthIndicator password={password} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Passwort bestätigen</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="confirmPassword"
                    type="password"
                    placeholder="Passwort wiederholen"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="pl-10"
                    required
                  />
                </div>
              </div>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Wird gespeichert..." : "Passwort ändern"}
              </Button>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
