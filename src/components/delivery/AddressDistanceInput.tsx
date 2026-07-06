import { useEffect, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, MapPin, Check } from "lucide-react";

export type LocationOriginId = "krefeld" | "bonn" | "muelheim";

interface Suggestion {
  placeId: string;
  text: string;
  mainText?: string;
  secondaryText?: string;
}

interface Props {
  locationId: LocationOriginId;
  onDistance: (roundedKm: number, exactKm: number, addressLabel: string) => void;
  label?: string;
  placeholder?: string;
  /** If true, compute distances from all 3 SLT locations and pick the closest one. */
  autoPickNearest?: boolean;
}

const LOCATION_LABELS: Record<string, string> = {
  krefeld: "Krefeld",
  bonn: "Bonn",
  muelheim: "Mülheim an der Ruhr",
};

// Simple session token (used by Google Places for billing grouping).
function makeSessionToken() {
  return crypto.randomUUID();
}

export function AddressDistanceInput({
  locationId,
  onDistance,
  label = "Lieferadresse",
  placeholder = "Straße Hausnummer, PLZ Ort",
  autoPickNearest = false,
}: Props) {
  const [input, setInput] = useState("");
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [loading, setLoading] = useState(false);
  const [calcLoading, setCalcLoading] = useState(false);
  const [selected, setSelected] = useState<Suggestion | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const [switchNotice, setSwitchNotice] = useState<string | null>(null);
  const sessionTokenRef = useRef<string>(makeSessionToken());
  const debounceRef = useRef<number | null>(null);

  useEffect(() => {
    // Reset when location changes
    setSelected(null);
    setSuggestions([]);
    setSwitchNotice(null);
  }, [locationId]);

  useEffect(() => {
    if (selected && input === selected.text) return;
    if (input.trim().length < 3) {
      setSuggestions([]);
      return;
    }
    if (debounceRef.current) window.clearTimeout(debounceRef.current);
    debounceRef.current = window.setTimeout(async () => {
      setLoading(true);
      setError(null);
      try {
        const { data, error } = await supabase.functions.invoke("geo-address", {
          body: {
            action: "autocomplete",
            input,
            sessionToken: sessionTokenRef.current,
          },
        });
        if (error) throw error;
        setSuggestions(data?.suggestions ?? []);
        setOpen(true);
      } catch (e) {
        setError("Adresssuche gerade nicht verfügbar – bitte Slider unten nutzen.");
        setSuggestions([]);
      } finally {
        setLoading(false);
      }
    }, 300);
    return () => {
      if (debounceRef.current) window.clearTimeout(debounceRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [input]);

  const pickSuggestion = async (s: Suggestion) => {
    setSelected(s);
    setInput(s.text);
    setSuggestions([]);
    setOpen(false);
    setCalcLoading(true);
    setError(null);
    setSwitchNotice(null);
    try {
      const { data, error } = await supabase.functions.invoke("geo-address", {
        body: {
          action: autoPickNearest ? "distanceAll" : "distance",
          locationId,
          placeId: s.placeId,
        },
      });
      if (error) throw error;

      if (autoPickNearest && data?.results) {
        const best = data.best;
        const preferred = data.results.find(
          (r: any) => r.locationId === locationId,
        );
        if (best && preferred && best.locationId !== preferred.locationId) {
          // Only switch if meaningfully closer (>=5 km shorter driving distance)
          if (preferred.distanceKm - best.distanceKm >= 5) {
            setSwitchNotice(
              `Näher von ${LOCATION_LABELS[best.locationId]} (${Math.round(best.distanceKm)} km) statt ${LOCATION_LABELS[preferred.locationId]} (${Math.round(preferred.distanceKm)} km) – wir berechnen ab ${LOCATION_LABELS[best.locationId]}.`,
            );
            onDistance(best.roundedKm, best.distanceKm, s.text);
          } else {
            onDistance(preferred.roundedKm, preferred.distanceKm, s.text);
          }
        } else if (preferred) {
          onDistance(preferred.roundedKm, preferred.distanceKm, s.text);
        } else if (best) {
          onDistance(best.roundedKm, best.distanceKm, s.text);
        }
      } else if (data?.roundedKm) {
        onDistance(data.roundedKm, data.distanceKm, s.text);
      } else {
        setError("Route konnte nicht berechnet werden – bitte Slider unten nutzen.");
      }
      // Start new session for next lookup
      sessionTokenRef.current = makeSessionToken();
    } catch (e) {
      setError("Entfernung konnte nicht berechnet werden – bitte Slider unten nutzen.");
    } finally {
      setCalcLoading(false);
    }
  };

  return (
    <div className="space-y-2 relative">
      <Label className="text-sm font-medium flex items-center gap-2">
        <MapPin className="h-4 w-4 text-primary" /> {label}
      </Label>
      <div className="relative">
        <Input
          value={input}
          onChange={(e) => {
            setInput(e.target.value);
            setSelected(null);
          }}
          onFocus={() => suggestions.length > 0 && setOpen(true)}
          onBlur={() => setTimeout(() => setOpen(false), 150)}
          placeholder={placeholder}
          autoComplete="off"
        />
        {(loading || calcLoading) && (
          <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin text-muted-foreground" />
        )}
        {selected && !loading && !calcLoading && (
          <Check className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-green-600" />
        )}
        {open && suggestions.length > 0 && (
          <ul className="absolute z-50 mt-1 w-full bg-popover border border-border rounded-md shadow-lg max-h-64 overflow-auto">
            {suggestions.map((s) => (
              <li key={s.placeId}>
                <button
                  type="button"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => pickSuggestion(s)}
                  className="w-full text-left px-3 py-2 hover:bg-accent/10 text-sm border-b border-border last:border-b-0"
                >
                  <div className="font-medium">{s.mainText ?? s.text}</div>
                  {s.secondaryText && (
                    <div className="text-xs text-muted-foreground">{s.secondaryText}</div>
                  )}
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
      {error && <p className="text-xs text-destructive">{error}</p>}
      {switchNotice && (
        <p className="text-xs bg-accent/10 text-accent-foreground border border-accent/30 rounded-md px-2 py-1.5 flex items-start gap-1">
          <MapPin className="h-3.5 w-3.5 mt-0.5 shrink-0 text-accent" />
          <span>{switchNotice}</span>
        </p>
      )}
      <p className="text-xs text-muted-foreground">
        Powered by Google Maps – wir berechnen die tatsächliche Fahrstrecke.
      </p>
    </div>
  );
}
