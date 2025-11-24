// Changelog data for LexiMix versions
export interface ChangelogEntry {
    version: string;
    date: string;
    changes: {
        added?: string[];
        fixed?: string[];
        changed?: string[];
        removed?: string[];
    };
}

export const CHANGELOG: ChangelogEntry[] = [
    {
        version: '2.6.6',
        date: '2025-11-24',
        changes: {
            added: [
                'Neues Login-System mit E-Mail Verifizierung',
                'Passwort-Sicherheit verbessert',
                'Automatische Cloud-Synchronisierung beim Start'
            ],
            fixed: [
                'Firebase Cloud-Speicherung optimiert (Debouncing & besseres Sync)',
                'Header-Buttons im Light Mode jetzt mit schwarzer Schrift auf weißem Hintergrund',
                'Rate Limiting für Cloud-Saves verbessert',
                'Fehlerhafte Speicherung von Userdaten korrigiert'
            ]
        }
    },
    {
        version: '2.6.5',
        date: '2025-11-24',
        changes: {
            fixed: [
                'Werbungsflächen-GIF wird jetzt lokal eingebettet (keine externe URL mehr)',
                'Verbesserte Offline-Funktionalität für Ad-Display'
            ]
        }
    },
    {
        version: '2.6.4',
        date: '2025-11-24',
        changes: {
            fixed: [
                'Season-Wechsel via Firebase funktioniert jetzt korrekt',
                'Initialisierungsfehler behoben'
            ]
        }
    },
    {
        version: '2.6.3',
        date: '2025-11-24',
        changes: {
            added: [
                'Dynamic Season System (Live-Updates)',
                'Wiederherstellung der Sprachauswahl bei Registrierung'
            ],
            fixed: [
                'Season Pass Rendering Bug behoben',
                'Verbesserte App-Initialisierung'
            ]
        }
    },
    {
        version: '2.6.2',
        date: '2025-11-24',
        changes: {
            fixed: [
                'Dark Mode funktioniert jetzt in allen Ansichten (Tailwind Config korrigiert)',
                'Gutschein-Modal vollständig übersetzt (DE/EN/ES)'
            ]
        }
    },
    {
        version: '2.6.1',
        date: '2025-11-24',
        changes: {
            fixed: [
                'Benutzername wird nun korrekt im Header angezeigt',
                'Premium-Modal Texte vollständig übersetzt (DE/EN/ES)'
            ]
        }
    },
    {
        version: '2.6.0',
        date: '2025-11-24',
        changes: {
            added: [
                'Neuer Spielmodus: Rätsel (Riddle Mode)',
                'Spanische Sprache (Español) hinzugefügt',
                'Dark Mode Button im Header wiederhergestellt'
            ],
            fixed: [
                'Layout-Optimierungen im Hauptmenü',
                'Season Pass Design wiederhergestellt (Orange)',
                'Sudoku Modus jetzt für alle verfügbar'
            ],
            changed: [
                'Challenge Modus erfordert Premium',
                'Verbesserte Darstellung der Spielkarten'
            ]
        }
    },
    {
        version: '2.4.0',
        date: '2025-11-24',
        changes: {
            added: [
                'Neuer Spielmodus: Rätsel (Riddle Mode)',
                'Premium-Dauer Anzeige im Hauptmenü',
                'Season-Dauer Anzeige im Hauptmenü'
            ],
            fixed: [
                'Optimierungen im Hauptmenü'
            ]
        }
    },
    {
        version: '2.3.0',
        date: '2025-11-23',
        changes: {
            added: [
                'Changelog-System in der App',
                'Firebase Mindestversions-Prüfung',
                'Verbesserte Mobile-Ansicht für Header-Buttons'
            ],
            fixed: [
                'Season Pass Button Textumbruch auf Smartphones',
                'Abgeschnittene Icons in der oberen rechten Ecke',
                'Shop-Icon Skalierung auf mobilen Geräten'
            ],
            changed: [
                'Header-Buttons stapeln sich vertikal auf Mobilgeräten',
                'Kleinere Icon-Größen für bessere mobile Darstellung'
            ]
        }
    },
    {
        version: '2.2.0',
        date: '2025-11-23',
        changes: {
            added: [
                'Force-Update Modal für veraltete App-Versionen',
                'APK Auto-Download Funktionalität',
                'Download-Button mit "NEU" Badge'
            ],
            changed: [
                'Domain auf leximix.de aktualisiert',
                'Verbesserte Update-Prüfung alle 30 Sekunden'
            ]
        }
    },
    {
        version: '2.1.0',
        date: '2025-11-23',
        changes: {
            added: [
                'Online-Only Modus mit Offline-Blockade',
                'Auto-Update System mit Versions-Prüfung',
                'Mobile-responsive Premium Modal'
            ],
            fixed: [
                'Premium Modal Skalierung auf Smartphones',
                'Scrolling in Modals auf kleinen Bildschirmen'
            ]
        }
    }
];
