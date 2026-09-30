import * as React from "react";
import { Input } from "@/components/ui/input";

type Props = Omit<React.ComponentProps<typeof Input>, "value"> & { value: number | string | null | undefined };

/**
 * Zahlenfeld, das eine 0 nicht erzwingt: Leeres Feld bleibt leer (Platzhalter „0“),
 * sodass Rücktaste/Entfernen die Zahl ganz löschen können. Der onChange-Handler
 * bekommt weiterhin das normale Event (leerer Text → Number("") = 0).
 */
export const NumberInput = React.forwardRef<HTMLInputElement, Props>(
  ({ value, onChange, placeholder, ...rest }, ref) => {
    const toText = (v: Props["value"]) =>
      v === null || v === undefined || v === "" || Number(v) === 0 ? "" : String(v);
    const [text, setText] = React.useState(() => toText(value));

    React.useEffect(() => {
      const numeric = Number(value) || 0;
      if ((Number(text) || 0) !== numeric) setText(toText(value));
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [value]);

    return (
      <Input
        ref={ref}
        {...rest}
        inputMode="decimal"
        value={text}
        placeholder={placeholder ?? "0"}
        onChange={(e) => {
          setText(e.target.value);
          onChange?.(e);
        }}
      />
    );
  },
);
NumberInput.displayName = "NumberInput";
