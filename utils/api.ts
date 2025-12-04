import { UserState, Language, VoucherRedemptionResult } from '../types';

// Configuration
// CHANGE THIS URL TO YOUR IONOS SERVER URL AFTER DEPLOYMENT
const API_BASE_URL = 'https://leximix.de/api';
// For local testing with PHP built-in server, you might use: http://localhost:8000/api

export const registerUser = async (email: string, password: string, username: string, initialData?: Partial<UserState>): Promise<{ success: boolean; error?: string; user?: any }> => {
    try {
        const response = await fetch(`${API_BASE_URL}/register.php`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password, username, ...initialData })
        });
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('API Register Error:', error);
        return { success: false, error: 'Verbindungsfehler' };
    }
};

export const loginUser = async (email: string, password: string): Promise<{ success: boolean; error?: string; username?: string; friendCode?: string; saveData?: any }> => {
    try {
        const response = await fetch(`${API_BASE_URL}/login.php`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('API Login Error:', error);
        return { success: false, error: 'Verbindungsfehler' };
    }
};

export const saveToCloud = async (username: string, userState: any): Promise<boolean> => {
    try {
        const response = await fetch(`${API_BASE_URL}/save_cloud.php`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, saveData: userState })
        });
        const data = await response.json();
        return data.success;
    } catch (error) {
        console.error('API Save Error:', error);
        return false;
    }
};

export const loadFromCloud = async (username: string): Promise<any | null> => {
    try {
        const response = await fetch(`${API_BASE_URL}/load_cloud.php?username=${encodeURIComponent(username)}`);
        const data = await response.json();
        if (data.success) {
            return data.data;
        }
        return null;
    } catch (error) {
        console.error('API Load Error:', error);
        return null;
    }
};

export const redeemVoucher = async (username: string, voucherCode: string): Promise<VoucherRedemptionResult> => {
    try {
        const response = await fetch(`${API_BASE_URL}/voucher.php`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, voucherCode })
        });
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('API Voucher Error:', error);
        return { success: false, error: 'Verbindungsfehler' };
    }
};

export const addFriendByCode = async (username: string, friendCode: string): Promise<{ success: boolean; error?: string }> => {
    try {
        const response = await fetch(`${API_BASE_URL}/friends.php`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ action: 'add_friend', username, friendCode })
        });
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('API Friend Error:', error);
        return { success: false, error: 'Verbindungsfehler' };
    }
};

// Placeholder for other functions to match Firebase interface if needed
export const resetPassword = async (email: string): Promise<{ success: boolean; error?: string }> => {
    // Not implemented in PHP yet
    return { success: false, error: 'Funktion noch nicht verfügbar' };
};
