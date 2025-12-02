/**
 * LexiMix - API Service
 * Handles all communication with the IONOS backend
 * Replaces Firebase for authentication and data storage
 */

import { UserState } from '../types';

// API Configuration
// Using HTTP as HTTPS has SSL certificate issues on the server
const API_BASE = 'https://leximix.de/api';

// Session storage
let sessionToken: string | null = null;
let sessionExpiresAt: Date | null = null;

// ============================================
// SESSION MANAGEMENT
// ============================================

export const setSession = (token: string, expiresAt: string): void => {
    sessionToken = token;
    sessionExpiresAt = new Date(expiresAt);
    localStorage.setItem('leximix_session_token', token);
    localStorage.setItem('leximix_session_expires', expiresAt);
};

export const getSession = (): string | null => {
    if (sessionToken && sessionExpiresAt && new Date() < sessionExpiresAt) {
        return sessionToken;
    }
    
    // Try to restore from localStorage
    const storedToken = localStorage.getItem('leximix_session_token');
    const storedExpires = localStorage.getItem('leximix_session_expires');
    
    if (storedToken && storedExpires) {
        const expiresDate = new Date(storedExpires);
        if (new Date() < expiresDate) {
            sessionToken = storedToken;
            sessionExpiresAt = expiresDate;
            return sessionToken;
        }
    }
    
    return null;
};

export const clearSession = (): void => {
    sessionToken = null;
    sessionExpiresAt = null;
    localStorage.removeItem('leximix_session_token');
    localStorage.removeItem('leximix_session_expires');
};

export const isAuthenticated = (): boolean => {
    return getSession() !== null;
};

// ============================================
// API HELPERS
// ============================================

const apiRequest = async (
    endpoint: string,
    options: RequestInit = {}
): Promise<any> => {
    const token = getSession();
    
    const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        ...(options.headers as Record<string, string>),
    };
    
    if (token) {
        headers['X-Session-Token'] = token;
    }
    
    const response = await fetch(`${API_BASE}${endpoint}`, {
        ...options,
        headers,
    });
    
    const data = await response.json();
    
    if (!response.ok) {
        throw new Error(data.error || 'API request failed');
    }
    
    return data;
};

// ============================================
// AUTHENTICATION
// ============================================

export interface AuthResult {
    success: boolean;
    error?: string;
    needsUsername?: boolean;
    isNewUser?: boolean;
    sessionToken?: string;
    user?: {
        id: number;
        username: string;
        email: string;
        friendCode: string;
        isPremium: boolean;
    };
    userData?: UserState;
}

/**
 * Register a new user with email + password
 */
export const registerUser = async (
    email: string,
    password: string,
    username: string,
    initialData?: { language?: string; age?: number }
): Promise<AuthResult> => {
    try {
        const result = await apiRequest('/auth/register.php', {
            method: 'POST',
            body: JSON.stringify({
                email,
                password,
                username,
                language: initialData?.language || 'DE',
                age: initialData?.age || 18
            }),
        });
        
        if (result.success && result.sessionToken) {
            setSession(result.sessionToken, result.expiresAt);
        }
        
        return {
            success: true,
            sessionToken: result.sessionToken,
            user: result.user,
            userData: result.userData,
        };
    } catch (error: any) {
        return {
            success: false,
            error: error.message,
        };
    }
};

/**
 * Login with email + password
 */
export const loginUser = async (
    email: string,
    password: string
): Promise<AuthResult> => {
    try {
        const result = await apiRequest('/auth/login.php', {
            method: 'POST',
            body: JSON.stringify({ email, password }),
        });
        
        if (result.success && result.sessionToken) {
            setSession(result.sessionToken, result.expiresAt);
        }
        
        return {
            success: true,
            sessionToken: result.sessionToken,
            user: result.user,
            userData: result.userData,
        };
    } catch (error: any) {
        return {
            success: false,
            error: error.message,
        };
    }
};

/**
 * Request a magic link login (legacy - kept for compatibility)
 */
export const requestMagicLink = async (email: string): Promise<AuthResult> => {
    try {
        const result = await apiRequest('/auth/request-login.php', {
            method: 'POST',
            body: JSON.stringify({ email }),
        });
        
        return {
            success: true,
            isNewUser: result.isNewUser,
        };
    } catch (error: any) {
        return {
            success: false,
            error: error.message,
        };
    }
};

/**
 * Verify magic link token and create session (legacy)
 */
export const verifyMagicLink = async (
    token: string,
    username?: string
): Promise<AuthResult> => {
    try {
        const result = await apiRequest('/auth/verify-token.php', {
            method: 'POST',
            body: JSON.stringify({ token, username }),
        });
        
        if (result.success && result.sessionToken) {
            setSession(result.sessionToken, result.expiresAt);
        }
        
        return {
            success: true,
            sessionToken: result.sessionToken,
            user: result.user,
            userData: result.userData,
        };
    } catch (error: any) {
        return {
            success: false,
            error: error.message,
            needsUsername: error.message?.includes('Username erforderlich'),
        };
    }
};

/**
 * Check current session
 */
export const checkSession = async (): Promise<AuthResult> => {
    if (!getSession()) {
        return { success: false, error: 'Not authenticated' };
    }
    
    try {
        const result = await apiRequest('/auth/session.php', {
            method: 'GET',
        });
        
        return {
            success: true,
            user: result.user,
            userData: result.userData,
        };
    } catch (error: any) {
        clearSession();
        return {
            success: false,
            error: error.message,
        };
    }
};

/**
 * Logout
 */
export const logout = async (): Promise<void> => {
    try {
        await apiRequest('/auth/logout.php', {
            method: 'POST',
        });
    } catch (e) {
        // Ignore errors
    }
    clearSession();
};

/**
 * Delete user account permanently
 */
export const deleteAccount = async (password: string): Promise<{ success: boolean; error?: string }> => {
    try {
        const result = await apiRequest('/auth/delete-account.php', {
            method: 'POST',
            body: JSON.stringify({ password }),
        });
        
        if (result.success) {
            clearSession();
        }
        
        return { success: true };
    } catch (error: any) {
        return {
            success: false,
            error: error.message,
        };
    }
};

/**
 * Request password reset email
 */
export const requestPasswordReset = async (email: string): Promise<{ success: boolean; message?: string; error?: string }> => {
    try {
        const result = await apiRequest('/auth/request-password-reset.php', {
            method: 'POST',
            body: JSON.stringify({ email }),
        });
        
        return {
            success: true,
            message: result.message,
        };
    } catch (error: any) {
        return {
            success: false,
            error: error.message,
        };
    }
};

/**
 * Reset password with token
 */
export const resetPassword = async (token: string, password: string): Promise<{ success: boolean; message?: string; error?: string }> => {
    try {
        const result = await apiRequest('/auth/reset-password.php', {
            method: 'POST',
            body: JSON.stringify({ token, password }),
        });
        
        return {
            success: true,
            message: result.message,
        };
    } catch (error: any) {
        return {
            success: false,
            error: error.message,
        };
    }
};

// ============================================
// DATA SYNC
// ============================================

export interface SaveResult {
    success: boolean;
    error?: string;
    version?: number;
}

/**
 * Save user data to cloud
 */
export const saveUserData = async (
    username: string,
    userData: Partial<UserState>,
    version: number = 0
): Promise<SaveResult> => {
    try {
        const result = await apiRequest('/save.php', {
            method: 'POST',
            body: JSON.stringify({
                username,
                data: userData,
                version,
                timestamp: Date.now(),
            }),
        });
        
        return {
            success: true,
            version: result.version,
        };
    } catch (error: any) {
        if (error.message === 'conflict') {
            return {
                success: false,
                error: 'conflict',
            };
        }
        return {
            success: false,
            error: error.message,
        };
    }
};

/**
 * Load user data from cloud
 */
export const loadUserData = async (
    username: string
): Promise<{ success: boolean; data: UserState | null; version?: number; error?: string }> => {
    try {
        const result = await apiRequest(`/load.php?username=${encodeURIComponent(username)}`, {
            method: 'GET',
        });
        
        return {
            success: true,
            data: result.exists ? result.data : null,
            version: result.version,
        };
    } catch (error: any) {
        return {
            success: false,
            data: null,
            error: error.message,
        };
    }
};

// ============================================
// FRIENDS
// ============================================

export interface Friend {
    id: number;
    username: string;
    friendCode: string;
    isPremium: boolean;
    lastLogin: string;
    since: string;
}

export interface FriendRequest {
    requestId: number;
    id: number;
    username: string;
    friendCode: string;
    createdAt: string;
}

export interface FriendsResult {
    success: boolean;
    friends?: Friend[];
    pendingRequests?: FriendRequest[];
    sentRequests?: FriendRequest[];
    myFriendCode?: string;
    error?: string;
}

export const getFriends = async (): Promise<FriendsResult> => {
    try {
        const result = await apiRequest('/friends/list.php', {
            method: 'GET',
        });
        
        return {
            success: true,
            friends: result.friends,
            pendingRequests: result.pendingRequests,
            sentRequests: result.sentRequests,
            myFriendCode: result.myFriendCode,
        };
    } catch (error: any) {
        return {
            success: false,
            error: error.message,
        };
    }
};

export const addFriend = async (
    friendCode: string
): Promise<{ success: boolean; error?: string; message?: string; friendAdded?: boolean }> => {
    try {
        const result = await apiRequest('/friends/add.php', {
            method: 'POST',
            body: JSON.stringify({ friendCode }),
        });
        
        return {
            success: true,
            message: result.message,
            friendAdded: result.friendAdded,
        };
    } catch (error: any) {
        return {
            success: false,
            error: error.message,
        };
    }
};

export const respondToFriendRequest = async (
    requestId: number,
    action: 'accept' | 'reject'
): Promise<{ success: boolean; error?: string }> => {
    try {
        await apiRequest('/friends/respond.php', {
            method: 'POST',
            body: JSON.stringify({ requestId, action }),
        });
        
        return { success: true };
    } catch (error: any) {
        return {
            success: false,
            error: error.message,
        };
    }
};

// ============================================
// VOUCHERS
// ============================================

export interface VoucherResult {
    success: boolean;
    error?: string;
    coinsAwarded?: number;
    isPremium?: boolean;
    newCoins?: number;
}

export const redeemVoucher = async (code: string): Promise<VoucherResult> => {
    try {
        const result = await apiRequest('/voucher/redeem.php', {
            method: 'POST',
            body: JSON.stringify({ code }),
        });
        
        return {
            success: true,
            coinsAwarded: result.coinsAwarded,
            isPremium: result.isPremium,
            newCoins: result.newCoins,
        };
    } catch (error: any) {
        return {
            success: false,
            error: error.message,
        };
    }
};

// ============================================
// SYSTEM CONFIG
// ============================================

export interface SystemConfig {
    download_url?: string;
    app_version?: string;
    maintenance_mode?: boolean;
}

export const getSystemConfig = async (): Promise<SystemConfig> => {
    try {
        const result = await apiRequest('/config/system.php', {
            method: 'GET',
        });
        
        return result.config || {};
    } catch (error) {
        return {};
    }
};

// ============================================
// EXPORTS
// ============================================

export default {
    // Session
    setSession,
    getSession,
    clearSession,
    isAuthenticated,
    
    // Auth
    registerUser,
    loginUser,
    requestMagicLink,
    verifyMagicLink,
    checkSession,
    logout,
    
    // Data
    saveUserData,
    loadUserData,
    
    // Friends
    getFriends,
    addFriend,
    respondToFriendRequest,
    
    // Vouchers
    redeemVoucher,
    
    // Config
    getSystemConfig,
};
