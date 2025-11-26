import React, { useEffect } from 'react';

export const BuyMeACoffeeWidget = () => {
    useEffect(() => {
        const script = document.createElement('script');
        script.src = "https://cdnjs.buymeacoffee.com/1.0.0/button.prod.min.js";
        script.setAttribute('data-name', 'bmc-button');
        script.setAttribute('data-slug', 'kewadesign');
        script.setAttribute('data-color', '#FF5F5F');
        script.setAttribute('data-emoji', '💰');
        script.setAttribute('data-font', 'Cookie');
        script.setAttribute('data-text', 'Get Premium');
        script.setAttribute('data-outline-color', '#000000');
        script.setAttribute('data-font-color', '#ffffff');
        script.setAttribute('data-coffee-color', '#FFDD00');

        // Append to a specific container to avoid global pollution if possible, 
        // but this script usually replaces itself with an iframe or button.
        // Let's append to a ref or just body if it's a fixed widget.
        // The user script seems to generate a button.

        const container = document.getElementById('bmc-container');
        if (container) {
            container.innerHTML = ''; // Clear previous
            container.appendChild(script);
        }

        // Cleanup is hard with these scripts as they often inject global styles/elements.
        // We'll try to just remove the container content.
        return () => {
            if (container) container.innerHTML = '';
        };
    }, []);

    return (
        <div id="bmc-container" className="flex justify-center my-4 min-h-[60px]">
            {/* Fallback in case script fails or is blocked */}
            <a href="https://www.buymeacoffee.com/kewadesign" target="_blank" rel="noreferrer" className="bmc-fallback-button hidden">
                <img src="https://cdn.buymeacoffee.com/buttons/v2/default-yellow.png" alt="Buy Me A Coffee" style={{ height: '60px', width: '217px' }} />
            </a>
        </div>
    );
};
