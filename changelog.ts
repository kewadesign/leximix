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
        version: '4.0.1',
        date: '2025-12-02',
        changes: {
            added: [
                '🔒 SSL-Zertifikat für HTTPS aktiviert'
            ],
            fixed: [
                '🌐 HTTPS funktioniert jetzt auf leximix.de',
                '🌐 Automatische HTTP zu HTTPS Weiterleitung'
            ]
        }
    },
    {
        version: '4.0.0',
        date: '2025-11-30',
        changes: {
            added: [
                '🚀 MAJOR UPDATE: Vollständige Migration von Firebase zu IONOS Server',
                '☁️ Cloud Save: Jetzt vollständig über IONOS API',
                '🎮 Multiplayer: Polling-basiertes System für alle Spiele',
                '🔍 Matchmaking: Server-seitiges System mit atomaren Operationen',
                '👥 Friends System: Komplett über IONOS API',
                '🎫 Voucher System: Über IONOS API',
                '📱 Version Management: Über IONOS API'
            ],
            changed: [
                '⚡ Multiplayer: 1.5s Polling-Intervall statt Firebase Real-time',
                '🔒 Sicherheit: Alle Daten jetzt auf eigenem IONOS Server',
                '🌐 Unabhängigkeit: Keine Firebase-Abhängigkeit mehr'
            ],
            removed: [
                '🗑️ Firebase komplett entfernt',
                '🗑️ Firebase Package aus Dependencies entfernt'
            ]
        }
    },
    {
        version: '3.8.0',
        date: '2025-11-30',
        changes: {
            added: [
                '⚔️ Kartenschmiede: Neuer Roguelike Deckbuilder Spielmodus',
                '🃏 188 einzigartige Karten mit 5 Elementen',
                '👹 70 Gegner (40 Normal, 15 Elite, 15 Bosse)',
                '🗺️ 250 Floors in 5 thematischen Akten',
                '☁️ Hybrides Cloud-System: Robustere Datenspeicherung'
            ],
            fixed: [
                '☁️ Cloud Sync: Verbesserte Zuverlässigkeit bei Multi-Device Login',
                '☁️ Cloud Sync: Konflikt-Handling und Offline-Queue',
                '💾 Spielstände werden nicht mehr verloren bei Gerätewechsel'
            ]
        }
    },
    {
        version: '3.4.1',
        date: '2025-11-29',
        changes: {
            added: [
                '✨ Neue Idle-Animationen: Float, Pulse, Glow, Sparkle',
                '🎯 Mühle: Responsive Skalierung für PC-Bildschirme',
                '🎮 "Dein Zug" Puls-Animation in allen Spielmodi',
                '🏠 Home-Screen: Animierte UI-Elemente',
                '💫 Modal-Einblendungen mit Scale-Animation'
            ],
            fixed: [
                '🌙 Dark Mode: Fixes in Mühle & Changelog Modals',
                '🌙 Dark Mode: Season Timer & Premium Status Karten',
                '📏 Mühle: Spielsteine skalieren korrekt mit Board'
            ],
            changed: [
                '🎨 15+ neue CSS Animation Utilities',
                '🎮 Verbesserte Turn-Indicator Animationen',
                '🖼️ Konsistentere Modal-Styles'
            ]
        }
    },
    {
        version: '3.4.0',
        date: '2025-11-29',
        changes: {
            added: [
                '🎭 Season Pass Mega Update: Sticker Album mit 72 Stickern',
                '🖼️ Profile Editor: Rahmen, Schriften & Effekte',
                '🎁 Neue Season Rewards: Frames, Fonts, Sticker Packs',
                '🃏 Neue Spielkarten-Assets für Rommé & Mau Mau',
                '🌈 Google Fonts Integration für Profil-Namen'
            ],
            changed: [
                '🎨 Schräge Design-Elemente in Schach, Dame, Skat',
                '🏆 Überarbeitete Season Pass Reward-Verteilung'
            ]
        }
    },
    {
        version: '3.3.0',
        date: '2025-11-29',
        changes: {
            added: [
                '🎴 Rommé: Komplett neues Bold Neo-Brutalist Design',
                '✨ Rommé: Dynamische Hover-Animationen für Karten',
                '📱 Rommé: Vollständig responsive Mobile-Ansicht',
                '🌙 Dark Mode: Wiederhergestellt und funktioniert global'
            ],
            fixed: [
                '🐞 Dark Mode Toggle Button wiederhergestellt',
                '🐞 Theme-Variablen in allen Views korrigiert',
                '🐞 Rommé: Mobile Layout komplett überarbeitet'
            ],
            changed: [
                '🎨 Rommé: Buntere, boldere UI-Elemente',
                '🎨 Rommé: Schräge Elemente für mehr Dynamik'
            ]
        }
    },
    {
        version: '3.2.0',
        date: '2025-11-29',
        changes: {
            added: [
                '🎴 Rommé: Neues Neo-Brutalism Design',
                '🃏 Mau Mau: Komplett überarbeitetes UI im Neo-Brutalism Stil'
            ],
            fixed: [
                '🐞 Mau Mau: Spiel lädt jetzt korrekt (fehlende Funktionen hinzugefügt)',
                '🐞 Rommé: Scrolling-Problem behoben',
                '🐞 Stabilere Spielinitialisierung'
            ]
        }
    },
    {
        version: '3.1.1',
        date: '2025-11-26',
        changes: {
            added: [
                '🌍 Neuer Slogan: "Spielspaß mit Köpfchen" (DE) / "Smart Fun" (EN)',
                '♟️ Multiplayer: Schach Einladungen zeigen nun korrekt "Schach" an'
            ]
        }
    },
    {
        version: '3.1.0',
        date: '2025-11-26',
        changes: {
            added: [
                '♟️ Neuer Spielmodus: SCHACH (Chess)!',
                '🎮 Singleplayer vs AI (Einfach/Mittel/Schwer)',
                '🌍 Multiplayer Schach über Freundesystem'
            ]
        }
    },
    {
        version: '3.0.3',
        date: '2025-11-26',
        changes: {
            fixed: [
                '🐞 Chain Game: Spanische Sonderzeichen (Ñ) jetzt eingebbar',
                '🌍 Chain Game: Vollständige Übersetzung aller Texte (DE/EN/ES)',
                '💾 Chain Game: Levelfortschritt wird nun korrekt gespeichert'
            ]
        }
    },
    {
        version: '3.0.2',
        date: '2025-11-26',
        changes: {
            added: [
                '🎨 Brand Update: Neues Logo & Favicon',
                '🌍 Onboarding: Englisch als Standard ausgewählt',
                '✨ UI Polish: Onboarding Modal Layout optimiert'
            ]
        }
    },
    {
        version: '3.0.1',
        date: '2025-11-26',
        changes: {
            added: [
                '🎨 MAJOR REDESIGN: Neo-Brutalist Style!',
                '🌈 Animierte Hintergründe & Globaler Grain-Effekt',
                '🎴 Mau Mau: Komplettes visuelles Redesign',
                '⏩ Ads: Skip-Funktion (mit Coins bezahlen)',
                '🎁 Rewards: Fix für Belohnungen in allen Modi'
            ],
            changed: [
                'Komplette UI-Überarbeitung mit fetten Rahmen & Schatten',
                'Verbesserte Navigation & Back-Buttons'
            ]
        }
    },
    {
        version: '2.7.0',
        date: '2025-11-25',
        changes: {
            added: [
                'Globales Freundesystem mit einzigartigen Freundescodes',
                'Multiplayer-Vorbereitung für alle Spiele',
                'Freundescode im Profil sichtbar und kopierbar',
                'Neuer Spielmodus: Mau Mau (Karten)',
                'Belohnungen (XP & Coins) für Mau Mau Siege'
            ],
            changed: [
                'Skat Mau Mau zu "Mau Mau" umbenannt',
                'Visuelles Update für das Kartenspiel (Dark Mode)',
                'Optimierte Ladezeiten beim Start'
            ],
            fixed: [
                'Anzeige-Fehler im Kartenspiel behoben',
                'Diverse kleine UI-Verbesserungen'
            ]
        }
    },
    {
        version: '2.6.8',
        date: '2025-11-24',
        changes: {
            changed: [
                'Update-Hinweis Text angepasst ("NICE!")',
                'Optimierungen am Authentifizierungsprozess'
            ]
        }
    },
    {
        version: '2.6.7',
        date: '2025-11-24',
        changes: {
            changed: [
                'Anmeldebildschirm überarbeitet: Direktes Login/Registrieren statt Button',
                'Authentifizierung ist nun nach Sprachwahl der erste Schritt'
            ]
        }
    },
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
