// scripts/create_bulk_vouchers.ts
import { initializeApp } from 'firebase/app';
import { getDatabase, ref, set } from 'firebase/database';
import { createVoucher } from '../utils/firebase';

// -------------------------------------------------
// 1️⃣  Firebase‑Konfiguration – bitte mit deinen Werten ersetzen
// -------------------------------------------------
const firebaseConfig = {
    apiKey: 'YOUR_API_KEY',
    authDomain: 'YOUR_PROJECT_ID.firebaseapp.com',
    databaseURL: 'https://YOUR_PROJECT_ID.firebaseio.com',
    projectId: 'YOUR_PROJECT_ID',
    storageBucket: 'YOUR_PROJECT_ID.appspot.com',
    messagingSenderId: 'YOUR_SENDER_ID',
    appId: 'YOUR_APP_ID',
};

initializeApp(firebaseConfig);
getDatabase(); // initialise DB for utils/firebase

// -------------------------------------------------
// 2️⃣  Liste aller Codes (nach deinem Beitrag)
// -------------------------------------------------
const coinCodes = [
    'JBXVS6', 'YAFYKQ', 'HT1JEL', 'JTPBL6', '04JLYB', '6G7FA7',
    'W4J006', 'KUB406', '1UDR15', '1M91RS', 'NBUY18', '7NTMKP',
    'YPRASU', 'MZFN0M', '1RJGJW', 'LKCWY7', 'JD0LDD', 'NYKNU1',
    'RAFKS9', 'TSKZ74', 'NTBTN5', 'R24U3T', 'VHXXPY', 'T3DDDY',
    'ZDP0EW', '4GBYVM', 'KA2NZV', 'MHSQMA', '0AC55Q', 'CRZ86A'
];

const premiumCodes = [
    'LEXIMIX-JBXV-S6YA-FYKQ',
    'LEXIMIX-HT1J-ELJT-PBL6',
    'LEXIMIX-04JL-YB5F-WONX',
    'LEXIMIX-6G7F-A7W4-J006',
    'LEXIMIX-KUB4-061U-DR15',
    'LEXIMIX-NUYB-XI1M-91RS',
    'LEXIMIX-NBUY-18GN-EOBQ',
    'LEXIMIX-HPAI-SR9O-71HO',
    'LEXIMIX-7NTM-KPYP-RASU',
    'LEXIMIX-MZFN-0M1R-JGJW',
    'LEXIMIX-LKCW-Y709-2NZO',
    'LEXIMIX-JD0L-DDOQ-HP5I',
    'LEXIMIX-BTN5-OMZF-E68I',
    'LEXIMIX-I1C9-QSNY-KNU1',
    'LEXIMIX-RAFK-S9TS-KZ74',
    'LEXIMIX-NTBT-N5R2-4U3T',
    'LEXIMIX-VHXX-PYDI-0TP7',
    'LEXIMIX-T3DD-DYDC-IKSP',
    'LEXIMIX-SC9B-FOZD-P0EW',
    'LEXIMIX-4GBY-VMKA-2NZV',
    'LEXIMIX-MHSQ-MAIN-NAC3',
    'LEXIMIX-0AC5-5QCR-Z86A',
    'LEXIMIX-O115-X5CH-93QC',
    'LEXIMIX-JLKH-MDYH-5RBK',
    'LEXIMIX-JDWL-AGRL-6606',
    'LEXIMIX-RH2R-CN15-9WQ9',
    'LEXIMIX-X27F-FDJF-C8EC',
    'LEXIMIX-RY7J-V0LE-VQOY',
    'LEXIMIX-WCY0-QOCR-P3PL',
    'LEXIMIX-WC72-03TQ-0JB3'
];

// -------------------------------------------------
// 3️⃣  Helper: normalize (remove dashes, uppercase)
// -------------------------------------------------
const normalize = (code: string) => code.replace(/-/g, '').toUpperCase();

// -------------------------------------------------
// 4️⃣  Voucher creation
// -------------------------------------------------
async function createAll() {
    // 4a) 1000‑Coins‑Codes
    for (const raw of coinCodes) {
        const code = normalize(raw);
        const res = await createVoucher(code, 1000, `${code} – 1000 Coins`);
        console.log(`[✅] ${code}: ${res.success ? 'erstellt' : 'Fehler → ' + res.error}`);
    }

    // 4b) Premium‑Codes (0 Coins + premium flag)
    for (const raw of premiumCodes) {
        const code = normalize(raw);
        const res = await createVoucher(code, 0, `${code} – Premium freischalten`);
        if (res.success) {
            // add premium flag manually
            const db = getDatabase();
            const voucherRef = `vouchers/${code}`;
            await import('firebase/database').then(({ ref, set }) => {
                set(ref(db, voucherRef), {
                    coins: 0,
                    description: `${code} – Premium freischalten`,
                    premium: true,
                    claimedBy: null
                });
            });
        }
        console.log(`[✅] ${code} (Premium): ${res.success ? 'erstellt' : 'Fehler → ' + res.error}`);
    }

    console.log('🚀 Alle Gutscheine wurden angelegt.');
}

createAll().catch(err => console.error('❌ Fehler beim Anlegen:', err));
