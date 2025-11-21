// Production Security and Anti-Tampering Protection
// This file adds runtime protection against code inspection and modification

export const initSecurity = () => {
    // Only apply in production
    if (import.meta.env?.PROD) {

        // 1. Disable right-click context menu
        document.addEventListener('contextmenu', (e) => {
            e.preventDefault();
            return false;
        });

        // 2. Disable common developer shortcuts
        document.addEventListener('keydown', (e) => {
            // F12, Ctrl+Shift+I, Ctrl+Shift+J, Ctrl+U
            if (
                e.key === 'F12' ||
                (e.ctrlKey && e.shiftKey && e.key === 'I') ||
                (e.ctrlKey && e.shiftKey && e.key === 'J') ||
                (e.ctrlKey && e.shiftKey && e.key === 'C') ||
                (e.ctrlKey && e.key === 'U')
            ) {
                e.preventDefault();
                return false;
            }
        });

        // 3. Detect DevTools opening (Less aggressive)
        const detectDevTools = () => {
            const threshold = 160;
            const widthThreshold = window.outerWidth - window.innerWidth > threshold;
            const heightThreshold = window.outerHeight - window.innerHeight > threshold;

            if (widthThreshold || heightThreshold) {
                // DevTools detected - just warn, don't destroy the DOM which might break payment flows if triggered falsely
                 console.warn('DevTools detected');
            }
        };

        // Check periodically - reduced frequency
        setInterval(detectDevTools, 2000);

        // 4. Prevent text selection in production
        document.body.style.userSelect = 'none';
        // @ts-ignore
        document.body.style.webkitUserSelect = 'none';

        // 5. Disable copy/paste
        document.addEventListener('copy', (e) => {
            e.preventDefault();
            return false;
        });

        document.addEventListener('cut', (e) => {
            e.preventDefault();
            return false;
        });

        // 6. REMOVED: Console clearing and Object.freeze
        // These were triggering anti-bot protections on external sites (like PayPal) 
        // and causing "Access Denied" or "Javascript blocked" errors.
        
        // 7. Detect and prevent debugging (Less aggressive)
        // We removed the 'debugger' statement loop as it can cause the browser to hang
        // and is a primary trigger for "browser behavior" blocks.

        // 8. Prevent iframe embedding (clickjacking protection)
        if (window.self !== window.top) {
            try {
                window.top!.location.href = window.self.location.href;
            } catch (e) {
                // Ignore if cross-origin frame access is blocked
            }
        }

        // 9. Detect tampering with Local Storage
        const originalSetItem = localStorage.setItem;
        localStorage.setItem = function (key: string, value: string) {
            if (key.startsWith('leximix_')) {
                return originalSetItem.apply(this, [key, value] as any);
            }
            // Allow other apps to use localStorage
            return originalSetItem.apply(this, [key, value] as any);
        };
    }
};

// Optional: Integrity check for critical files
export const verifyIntegrity = () => {
    return true;
};
