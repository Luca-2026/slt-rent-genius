# Übergabe und automatische Auftragsbestätigung

## Umsetzung
- Übergabe und Rückgabe direkt unter den Dokumentaktionen, ohne Positionseditor.
- Übergabe eines aktuellen Angebots ohne vorherige AB oder Online-Annahme möglich.
- Kundenunterschrift bestätigt das Angebot über den vorhandenen Annahmelink. Gerätebelegung und Übergabe werden gemeinsam gespeichert; Geräte-Konflikte rollen die Annahme zurück.
- Automatische AB verwendet den bestehenden Renderer und Versand. Der geschützte Aufruf prüft die gespeicherte Unterschrift und den bestätigten Auftrag. Bestehende AB wird nicht nochmals automatisch versendet; Provider-Idempotenz verhindert Wiederholungen.
- Ausstehende AB kann im Protokollbereich erneut angestoßen werden. Nachträgliche digitale Kundenunterschrift nutzt denselben Ablauf.
- Ohne Kundenunterschrift bleibt die bisherige Voraussetzung eines angenommenen Angebots erhalten.

## Prüfung
- 32 Tests bestanden, einschließlich atomarer Annahme, Geräte-Konflikt-Rollback, Doppelübergabe, öffentlicher Ablauf abgelaufen gesperrt, nachträglicher Signatur und unberechtigtem Erfasser.
- Bestehende AB-Vorschau-/Zahlungsschutztests weiterhin erfolgreich.
- Echter Mitarbeiterzugang: Pascal Braun #9DFW9V, 1280/820/390 px. Protokollbuttons sichtbar und Dialog geöffnet; kein horizontaler Überlauf. Cookie-Hinweis während Protokollerfassung unterdrückt.
- Vorschau kompiliert fehlerfrei; send-order-confirmation, generate-rental-protocol und delivery-protocol-sign eingespielt.

## Grenzen
Keine echte Kundenunterschrift nachgebildet, kein produktiver Auftrag verändert und keine AB-Mail versendet. Vollständiges Speichern→automatisches AB-PDF→E-Mail→Wiederöffnen ist noch nicht live abgenommen. Website nicht veröffentlicht.