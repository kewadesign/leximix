
import { useState } from 'react';

const validGutscheinCodes = [
    'JBXVS6', 'YAFYKQ', 'HT1JEL', 'JTPBL6', '04JLYB', '6G7FA7',
    'W4J006', 'KUB406', '1UDR15', '1M91RS', 'NBUY18', '7NTMKP',
    'YPRASU', 'MZFN0M', '1RJGJW', 'LKCWY7', 'JD0LDD', 'NYKNU1',
    'RAFKS9', 'TSKZ74', 'NTBTN5', 'R24U3T', 'VHXXPY', 'T3DDDY',
    'ZDP0EW', '4GBYVM', 'KA2NZV', 'MHSQMA', '0AC55Q', 'CRZ86A'
];

export const useGutschein = () => {
    const [redeemedCodes, setRedeemedCodes] = useState<string[]>([]);

    const redeemGutschein = (code: string) => {
        if (validGutscheinCodes.includes(code) && !redeemedCodes.includes(code)) {
            setRedeemedCodes([...redeemedCodes, code]);
            // Here I will add the logic to add 1000 coins to the user
            return true;
        }
        return false;
    };

    return { redeemGutschein };
};
