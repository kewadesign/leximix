 # Rewards Template

Diese Datei dient als Vorlage, um neue Belohnungen für den Season Pass zu erstellen.
Die Belohnungen werden in der Datei `constants.ts` definiert, spezifisch in der `generateSeasonRewards` Funktion oder im `SEASON_REWARDS` Array.

## Struktur einer Belohnung

Eine Belohnung besteht aus zwei Teilen: `free` (kostenlos für alle) und `premium` (nur für Premium-Nutzer).

```typescript
{
  level: 1, // Das Level, auf dem die Belohnung freigeschaltet wird
  free: {
    type: 'coins', // Art der Belohnung: 'coins', 'sticker', 'avatar', 'cosmetic', 'mystery', 'booster'
    amount: 100, // Menge (optional, z.B. bei Coins)
    name: 'Münzen', // Name der Belohnung
    icon: 'coin_pile' // Icon Name (intern verwendet)
  },
  premium: {
    type: 'avatar',
    value: 'avatar_id', // ID des Avatars oder Skins
    name: 'Super Avatar',
    preview: 'https://api.dicebear.com/...' // Vorschau-URL für Bilder
  }
}
```

## Wo einfügen?

Öffne `constants.ts` und suche nach `generateSeasonRewards`. Dort kannst du die Logik anpassen oder feste Belohnungen definieren.

## Kopiervorlage

Hier kannst du deine Belohnungen eintragen. Kopiere diesen Block und füge ihn in `constants.ts` ein oder ersetze die Generierungslogik.

```typescript
// Beispiel für Level 1-100
const MY_CUSTOM_REWARDS = [
  {
    level: 1,
    free: { type: 'coins', amount: 500, name: 'Starter Bonus' },
    premium: { type: 'avatar', value: 'neon_hero_1', name: 'Neon Hero', preview: '...' }
  },
  {
    level: 2,
    free: { type: 'coins', amount: 100, name: 'Münzen' },
    premium: { type: 'sticker', value: 'sticker_cool', name: 'Cool Sticker' }
  },
  // ... weitere Level hier einfügen
];
```

## Belohnungstypen

- **coins**: Währung im Spiel. Benötigt `amount`.
- **avatar**: Neuer Charakter. Benötigt `value` (ID) und `preview` (Bild-URL).
- **sticker**: Sammelsticker. Benötigt `value` (ID).
- **cosmetic**: Rahmen oder Effekte. Benötigt `value` (ID).
- **booster**: Hilfen im Spiel (z.B. Hinweis-Booster).
- **mystery**: Zufällige Belohnung (Mystery Box).

## Hinweise

- Achte darauf, dass `value` IDs eindeutig sind, damit Items korrekt gespeichert werden.
- Bilder sollten quadratisch sein und idealerweise als SVG oder PNG vorliegen.
