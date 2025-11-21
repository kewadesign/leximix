import React, { useEffect, useRef } from 'react';

interface PayPalButtonProps {
    amount: string;
    onSuccess: (details: any) => void;
}

export const PayPalButton: React.FC<PayPalButtonProps> = ({ amount, onSuccess }) => {
    const buttonRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!buttonRef.current || !(window as any).paypal) return;

        // Clear previous buttons if any
        buttonRef.current.innerHTML = '';

        (window as any).paypal.Buttons({
            style: {
                layout: 'horizontal',
                color: 'gold',
                shape: 'pill',
                label: 'pay',
                height: 40
            },
            createOrder: (data: any, actions: any) => {
                return actions.order.create({
                    purchase_units: [{
                        amount: {
                            value: amount
                        }
                    }]
                });
            },
            onApprove: async (data: any, actions: any) => {
                const details = await actions.order.capture();
                onSuccess(details);
            },
            onError: (err: any) => {
                console.error("PayPal Error:", err);
                alert("Payment failed. Please try again.");
            }
        }).render(buttonRef.current);

    }, [amount]);

    return <div ref={buttonRef} className="w-full flex justify-center z-0 relative"></div>;
};
