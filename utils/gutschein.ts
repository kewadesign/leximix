import { useState } from 'react';
import { redeemVoucher } from './firebase'; // Pfad ggf. anpassen, z.B. '../services/firebase'

export const useGutschein = () => {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [successMsg, setSuccessMsg] = useState<string | null>(null);

    /**
     * Versucht einen Gutschein einzulösen.
     * @param code Der eingegebene Code
     * @param username Der aktuelle Benutzername des Spielers
     */
    const redeemGutschein = async (code: string, username: string): Promise<boolean> => {
        // Reset states
        setIsLoading(true);
        setError(null);
        setSuccessMsg(null);

        if (!code || code.length < 3) {
            setError("Code ist zu kurz.");
            setIsLoading(false);
            return false;
        }

        if (!username) {
            setError("Nicht eingeloggt.");
            setIsLoading(false);
            return false;
        }

        try {
            // Wir rufen die Firebase-Funktion auf
            const result = await redeemVoucher(username, code);

            if (result.success) {
                setSuccessMsg(`Erfolg! Du hast ${result.coinsAwarded} Coins erhalten.`);
                setIsLoading(false);
                return true;
            } else {
                // Fehlermeldung von Firebase (z.B. "Schade! Jemand war schneller.")
                setError(result.error || 'Unbekannter Fehler.');
                setIsLoading(false);
                return false;
            }
        } catch (err) {
            setError('Verbindungsfehler. Bitte prüfe dein Internet.');
            setIsLoading(false);
            return false;
        }
    };

    // Hilfsfunktion, um Meldungen manuell zu löschen (z.B. beim Schließen eines Modals)
    const clearMessages = () => {
        setError(null);
        setSuccessMsg(null);
    };

    return {
        redeemGutschein,
        isLoading,
        error,
        successMsg,
        clearMessages
    };
};