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
