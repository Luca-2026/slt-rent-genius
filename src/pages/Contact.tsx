import { useState } from "react";
import { Layout } from "@/components/layout";
import { SEO, SLT_BREADCRUMB_JSONLD } from "@/components/SEO";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Phone, Mail, MapPin, Clock, MessageCircle, Send, CheckCircle, Loader2 } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AnimatedSection } from "@/components/ui/animated-section";
import { locationData } from "@/data/locationData";
import { useTranslation } from "react-i18next";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export default function Contact() {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState("");

  const contactInfo = [
    { icon: Phone, title: t("contact.phoneTitle"), primary: t("contact.phoneNumber"), secondary: t("contact.phoneHours"), href: "tel:+49021514179904" },
    { icon: Mail, title: t("contact.emailTitle"), primary: t("contact.emailAddress"), secondary: t("contact.emailResponse"), href: "mailto:mieten@slt-rental.de" },
    { icon: MessageCircle, title: t("contact.whatsappTitle"), primary: "+49 1578 9150872", secondary: t("contact.whatsappDesc"), href: "https://wa.me/4915789150872" },
  ];

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);

    const form = e.currentTarget;
    const formData = new FormData(form);

    try {
      const { error } = await supabase.functions.invoke("send-contact-email", {
        body: {
          firstName: formData.get("firstName"),
          lastName: formData.get("lastName"),
          email: formData.get("email"),
          phone: formData.get("phone"),
          subject: formData.get("subject"),
          message: formData.get("message"),
          location: selectedLocation,
        },
      });

      if (error) throw error;

      setIsSuccess(true);
      form.reset();
    } catch (err) {
      console.error("Contact form error:", err);
      toast({
        title: "Fehler",
        description: "Die Nachricht konnte nicht gesendet werden. Bitte versuche es erneut.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Layout>
      <SEO
        title="Kontakt – SLT Rental"
        description="Kontaktieren Sie SLT Rental: Telefon, E-Mail oder WhatsApp. 3 Standorte in Krefeld, Bonn und Mülheim. Persönliche Beratung für Ihre Mietanfrage."
        canonical="/kontakt"
        jsonLd={SLT_BREADCRUMB_JSONLD([{ name: "Home", url: "/" }, { name: "Kontakt", url: "/kontakt" }])}
      />
      {/* Hero */}
      <section className="bg-primary py-12 lg:py-16">
        <div className="section-container">
          <AnimatedSection animation="fade-in-up">
            <h1 className="text-3xl lg:text-4xl font-bold text-primary-foreground mb-4">{t("contact.heroTitle")}</h1>
            <p className="text-primary-foreground/80 max-w-2xl">{t("contact.heroDesc")}</p>
          </AnimatedSection>
        </div>
      </section>

      {/* Contact Options */}
      <section className="py-12 lg:py-16">
        <div className="section-container">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            {contactInfo.map((info, index) => (
              <AnimatedSection key={info.title} animation="scale-in" delay={index * 120}>
                <a href={info.href} target="_blank" rel="noopener noreferrer">
                  <Card className="h-full hover:shadow-lg transition-all duration-300 group hover:-translate-y-1">
                    <CardContent className="p-6 text-center">
                      <div className="w-14 h-14 bg-accent/10 rounded-xl flex items-center justify-center mx-auto mb-4 group-hover:bg-accent group-hover:scale-110 transition-all duration-300">
                        <info.icon className="h-7 w-7 text-accent group-hover:text-accent-foreground transition-colors" />
                      </div>
                      <h3 className="font-semibold text-headline mb-1">{info.title}</h3>
                      <p className="text-primary font-medium">{info.primary}</p>
                      <p className="text-sm text-muted-foreground">{info.secondary}</p>
                    </CardContent>
                  </Card>
                </a>
              </AnimatedSection>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Contact Form */}
            <AnimatedSection animation="slide-in-left" delay={0}>
              <div>
                <h2 className="text-2xl font-bold text-headline mb-6">{t("contact.formTitle")}</h2>
                {isSuccess ? (
                  <Card className="border-primary/20 bg-primary/5">
                    <CardContent className="py-12 text-center">
                      <CheckCircle className="h-12 w-12 text-primary mx-auto mb-4" />
                      <h3 className="text-xl font-bold text-foreground mb-2">Nachricht gesendet!</h3>
                      <p className="text-muted-foreground mb-6">
                        Vielen Dank für Ihre Anfrage. Wir melden uns schnellstmöglich bei Ihnen.
                      </p>
                      <Button variant="outline" onClick={() => setIsSuccess(false)}>
                        Neue Nachricht senden
                      </Button>
                    </CardContent>
                  </Card>
                ) : (
                  <>
                    <form className="space-y-4" onSubmit={handleSubmit}>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-headline mb-1.5">{t("contact.firstName")} *</label>
                          <Input name="firstName" placeholder="Max" required />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-headline mb-1.5">{t("contact.lastName")} *</label>
                          <Input name="lastName" placeholder="Mustermann" required />
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-headline mb-1.5">{t("contact.email")} *</label>
                        <Input name="email" type="email" placeholder="max@beispiel.de" required />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-headline mb-1.5">{t("contact.phone")} *</label>
                        <Input name="phone" type="tel" placeholder="0151 123 456 78" required />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-headline mb-1.5">Standort *</label>
                        <Select name="location" required>
                          <SelectTrigger>
                            <SelectValue placeholder="Standort wählen" />
                          </SelectTrigger>
                          <SelectContent>
                            {locationData.map((loc) => (
                              <SelectItem key={loc.id} value={loc.id}>
                                {loc.name} {loc.subtitle === "Hauptsitz" ? "(Hauptsitz)" : ""}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-headline mb-1.5">{t("contact.subject")} *</label>
                        <Input name="subject" placeholder="Anfrage zu Minibagger" required />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-headline mb-1.5">{t("contact.message")} *</label>
                        <Textarea name="message" placeholder="..." rows={5} required />
                      </div>
                      <div className="flex items-start gap-2">
                        <input type="checkbox" id="privacy" className="mt-1" required />
                        <label htmlFor="privacy" className="text-sm text-muted-foreground">
                          {t("contact.privacy").split("<link>")[0]}
                          <Link to="/datenschutz" className="text-primary hover:underline">
                            {t("contact.privacy").split("<link>")[1]?.split("</link>")[0]}
                          </Link>
                          {t("contact.privacy").split("</link>")[1]}
                        </label>
                      </div>
                      <Button type="submit" disabled={isSubmitting} className="w-full sm:w-auto bg-accent text-accent-foreground hover:bg-cta-orange-hover">
                        {isSubmitting ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Send className="h-4 w-4 mr-2" />}
                        {isSubmitting ? "Wird gesendet..." : t("contact.send")}
                      </Button>
                    </form>
                    <p className="text-xs text-muted-foreground mt-4">{t("contact.required")}</p>
                  </>
                )}
              </div>
            </AnimatedSection>

            {/* Locations Overview */}
            <AnimatedSection animation="slide-in-right" delay={200}>
              <div>
                <h2 className="text-2xl font-bold text-headline mb-6">{t("contact.locationsTitle")}</h2>
                <div className="space-y-4">
                  {locationData.map((loc) => (
                    <Card key={loc.id} className="hover:shadow-md transition-all duration-300">
                      <CardContent className="p-4">
                        <h3 className="font-semibold text-headline mb-2">
                          {loc.name} {loc.subtitle === "Hauptsitz" && `(${t("contact.hq")})`}
                        </h3>
                        <div className="flex items-start gap-2 text-sm text-muted-foreground mb-1">
                          <MapPin className="h-4 w-4 mt-0.5 shrink-0" />
                          <span>{loc.address}, {loc.city}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm mb-1">
                          <Phone className="h-4 w-4 text-muted-foreground shrink-0" />
                          <a href={`tel:${loc.phone.replace(/\s/g, "")}`} className="text-primary hover:text-accent">{loc.phone}</a>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <Mail className="h-4 w-4 text-muted-foreground shrink-0" />
                          <a href={`mailto:${loc.email}`} className="text-primary hover:text-accent">{loc.email}</a>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                <AnimatedSection animation="fade-in-up" delay={400}>
                  <div className="mt-6 p-4 bg-surface-light rounded-xl">
                    <div className="flex items-center gap-2 text-headline font-medium mb-2">
                      <Clock className="h-5 w-5 text-primary" />
                      {t("contact.openingHoursTitle")}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {t("contact.openingHoursMf")}<br />
                      {t("contact.openingHoursSa")}<br />
                      {t("contact.openingHoursSu")}
                    </p>
                    <p className="text-xs text-muted-foreground mt-2">{t("contact.openingHoursNote")}</p>
                  </div>
                </AnimatedSection>

                <div className="mt-6">
                  <Link to="/standorte">
                    <Button variant="outline" className="w-full">{t("contact.allLocations")}</Button>
                  </Link>
                </div>
              </div>
            </AnimatedSection>
          </div>
        </div>
      </section>

      {/* B2B Teaser */}
      <section className="py-12 lg:py-16 bg-primary">
        <div className="section-container text-center">
          <AnimatedSection animation="fade-in-up">
            <h2 className="text-2xl lg:text-3xl font-bold text-primary-foreground mb-4">{t("contact.b2bTitle")}</h2>
            <p className="text-primary-foreground/80 max-w-xl mx-auto mb-6">{t("contact.b2bDesc")}</p>
            <Link to="/b2b">
              <Button className="bg-accent text-accent-foreground hover:bg-cta-orange-hover">{t("contact.b2bCta")}</Button>
            </Link>
          </AnimatedSection>
        </div>
      </section>
    </Layout>
  );
}
