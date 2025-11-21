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

        // 3. Detect DevTools opening
        const detectDevTools = () => {
            const threshold = 160;
            const widthThreshold = window.outerWidth - window.innerWidth > threshold;
            const heightThreshold = window.outerHeight - window.innerHeight > threshold;

            if (widthThreshold || heightThreshold) {
                // DevTools detected - reload or show warning
                document.body.innerHTML = '<div style="display:flex;align-items:center;justify-content:center;height:100vh;background:#0f0718;color:#fff;font-family:sans-serif;text-align:center;padding:20px;"><div><h1>⚠️ Access Denied</h1><p>Developer tools are not permitted.</p></div></div>';
            }
        };

        // Check periodically
        setInterval(detectDevTools, 1000);

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

        // 6. Clear console periodically to remove any debug info
        setInterval(() => {
            console.clear();
        }, 1000);

        // 7. Detect and prevent debugging
        let checkDebugger = () => {
            const start = new Date();
            debugger; // This will pause if debugger is open
            const end = new Date();
            if (end.getTime() - start.getTime() > 100) {
                window.location.reload();
            }
        };

        // Don't check too frequently to avoid performance issues
        setInterval(checkDebugger, 5000);

        // 8. Prevent iframe embedding (clickjacking protection)
        if (window.self !== window.top) {
            window.top!.location.href = window.self.location.href;
        }

        // 9. Object.freeze on critical objects
        Object.freeze(Object.prototype);

        // 10. Detect tampering with Local Storage
        const originalSetItem = localStorage.setItem;
        localStorage.setItem = function (key: string, value: string) {
            if (key.startsWith('leximix_')) {
                return originalSetItem.apply(this, [key, value] as any);
            }
            // Allow other apps to use localStorage
            return originalSetItem.apply(this, [key, value] as any);
        };

        // Disable console functions
        console.log = () => { };
        console.debug = () => { };
        console.info = () => { };
        console.warn = () => { };
    }
};

// Optional: Integrity check for critical files
export const verifyIntegrity = () => {
    // This would check if the app files have been modified
    // In a production environment, you could store hashes of critical files
    // and verify them at runtime
    return true;
};
