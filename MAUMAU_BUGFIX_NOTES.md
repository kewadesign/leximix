# Mau Mau Bugfix Dokumentation

## Problem
Nach dem Start eines Mau Mau Spiels wurde nur der Hintergrund angezeigt, aber keine Karten oder UI-Elemente.

## Ursache
In der Datei `components/SkatMauMauGame.tsx` wurden zwei Funktionen verwendet, die **nicht definiert** waren:

### 1. `renderSuitIcon(suit)` - Zeile ~570
Diese Funktion wird im "Wunsch"-Indikator verwendet, um das Symbol der gewünschten Kartenfarbe anzuzeigen.

### 2. `handleAddFriend(code)` - Zeile ~660
Diese Funktion wird als Prop an die `FriendsModal` Komponente übergeben.

**Fehlende Funktionen verursachen einen Runtime-Fehler**, der das Rendern der gesamten Komponente verhindert. React zeigt dann nur den Hintergrund an.

## Lösung
Die fehlenden Funktionen wurden in `components/SkatMauMauGame.tsx` hinzugefügt:

```typescript
// Helper to render suit icon
const renderSuitIcon = (suit: CardSuit) => {
  const symbol = getSuitSymbol(suit);
  const isRed = suit === CardSuit.HEARTS || suit === CardSuit.DIAMONDS;
  return (
    <span style={{ fontSize: '32px', color: isRed ? '#FF006E' : '#000' }}>
      {symbol}
    </span>
  );
};

// Placeholder for friend handling
const handleAddFriend = (code: string) => {
  console.log('Add friend:', code);
};
```

## Debugging-Tipps für ähnliche Probleme

### 1. Browser-Konsole prüfen
Öffne die Developer Tools (F12) und schau in die Console. Fehlende Funktionen zeigen Fehler wie:
```
Uncaught ReferenceError: renderSuitIcon is not defined
```

### 2. Debug-Overlay hinzufügen
Füge temporär ein Debug-Overlay hinzu, um zu sehen ob die Komponente überhaupt mounted:

```tsx
return (
  <div style={{ border: '5px solid red' }}>
    {/* Debug Info */}
    <div className="absolute top-0 left-0 bg-black text-white p-2 z-[999]">
      DEBUG: Component Mounted<br/>
      Deck: {deck.length}<br/>
      Player: {playerHand.length}
    </div>
    {/* Rest der Komponente */}
  </div>
);
```

### 3. Linter/TypeScript prüfen
```bash
npm run build
```
Build-Fehler zeigen oft fehlende Funktionen oder Typen an.

### 4. Häufige Ursachen für "nur Hintergrund sichtbar"
- **Fehlende Funktionen** die im JSX verwendet werden
- **Fehler in useEffect** die das Rendern blockieren
- **Leere State-Arrays** (z.B. `deck.length === 0`) ohne Fallback-UI
- **z-index Probleme** - Elemente könnten unter anderen versteckt sein

## Dateien die betroffen waren
- `components/SkatMauMauGame.tsx` - Hauptkomponente für Mau Mau

## Datum
29. November 2025

