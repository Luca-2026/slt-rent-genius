import { ScrollArea } from "@/components/ui/scroll-area";
import { useTranslation } from "react-i18next";

export function AGBScrollableText() {
  const { t } = useTranslation();

  return (
    <ScrollArea className="h-64 border border-border rounded-lg p-4 bg-muted/30 text-sm text-muted-foreground leading-relaxed">
      <div className="space-y-4 pr-4">
        <p className="font-semibold text-foreground">
          {t("agbText.heading")}
        </p>

        {/* I */}
        <div>
          <p className="font-semibold text-foreground mb-1">{t("agbText.i.title")}</p>
          <p>{t("agbText.i.p1")}</p>
          <p>{t("agbText.i.p2")}</p>
          <p>{t("agbText.i.p3")}</p>
        </div>

        {/* II */}
        <div>
          <p className="font-semibold text-foreground mb-1">{t("agbText.ii.title")}</p>
          {(["2_1","2_2","2_3","2_4","2_5","2_6","2_7","2_8","2_9","2_10","2_11"] as const).map(k => (
            <p key={k}><strong>{k.replace("_", ".")}</strong> {t(`agbText.ii.${k}`)}</p>
          ))}
        </div>

        {/* III */}
        <div>
          <p className="font-semibold text-foreground mb-1">{t("agbText.iii.title")}</p>
          {(["3_1","3_1a","3_2","3_3","3_4","3_5","3_6","3_7","3_8","3_9"] as const).map(k => (
            <p key={k}><strong>{k.replace("_", ".")}:</strong> {t(`agbText.iii.${k}`)}</p>
          ))}
        </div>

        {/* IV */}
        <div>
          <p className="font-semibold text-foreground mb-1">{t("agbText.iv.title")}</p>
          {(["4_1","4_2","4_3","4_4","4_5"] as const).map(k => (
            <p key={k}><strong>{k.replace("_", ".")}:</strong> {t(`agbText.iv.${k}`)}</p>
          ))}
        </div>

        {/* V */}
        <div>
          <p className="font-semibold text-foreground mb-1">{t("agbText.v.title")}</p>
          {(["5_1","5_2"] as const).map(k => (
            <p key={k}><strong>{k.replace("_", ".")}:</strong> {t(`agbText.v.${k}`)}</p>
          ))}
        </div>

        {/* VI */}
        <div>
          <p className="font-semibold text-foreground mb-1">{t("agbText.vi.title")}</p>
          {(["6_1","6_2","6_3","6_4","6_5"] as const).map(k => (
            <p key={k}><strong>{k.replace("_", ".")}:</strong> {t(`agbText.vi.${k}`)}</p>
          ))}
        </div>

        {/* VII */}
        <div>
          <p className="font-semibold text-foreground mb-1">{t("agbText.vii.title")}</p>
          {(["7_1","7_2","7_3","7_4","7_5","7_6","7_7","7_8"] as const).map(k => (
            <p key={k}><strong>{k.replace("_", ".")}:</strong> {t(`agbText.vii.${k}`)}</p>
          ))}
        </div>

        {/* VIII */}
        <div>
          <p className="font-semibold text-foreground mb-1">{t("agbText.viii.title")}</p>
          {(["8_1","8_2","8_3","8_4"] as const).map(k => (
            <p key={k}><strong>{k.replace("_", ".")}:</strong> {t(`agbText.viii.${k}`)}</p>
          ))}
        </div>

        {/* IX */}
        <div>
          <p className="font-semibold text-foreground mb-1">{t("agbText.ix.title")}</p>
          <p><strong>9.1–9.7:</strong> {t("agbText.ix.9_1")}</p>
        </div>

        {/* X */}
        <div>
          <p className="font-semibold text-foreground mb-1">{t("agbText.x.title")}</p>
          {(["10_1","10_2","10_3","10_4","10_5"] as const).map(k => (
            <p key={k}><strong>{k.replace("_", ".")}:</strong> {t(`agbText.x.${k}`)}</p>
          ))}
        </div>

        {/* XI */}
        <div>
          <p className="font-semibold text-foreground mb-1">{t("agbText.xi.title")}</p>
          {(["11_1","11_2","11_3","11_4","11_5","11_6","11_7"] as const).map(k => (
            <p key={k}><strong>{k.replace("_", ".")}:</strong> {t(`agbText.xi.${k}`)}</p>
          ))}
        </div>

        <p className="text-xs text-muted-foreground mt-4 pt-2 border-t border-border">
          {t("agbText.footer")}
        </p>
      </div>
    </ScrollArea>
  );
}
