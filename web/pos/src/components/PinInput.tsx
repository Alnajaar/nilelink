'use client';

import React from 'react';

interface PinInputProps {
    length?: number;
    value: string;
    onChange: (value: string) => void;
    onComplete?: (value: string) => void;
    disabled?: boolean;
}

export const PinInput: React.FC<PinInputProps> = ({
    length = 4,
    value,
    onChange,
    onComplete,
    disabled = false
}) => {
    const inputRefs = React.useRef<(HTMLInputElement | null)[]>([]);

    const handleChange = (index: number, digit: string) => {
        if (!/^\d*$/.test(digit)) return;

        const newValue = value.split('');
        newValue[index] = digit;
        const newPin = newValue.join('').slice(0, length);

        onChange(newPin);

        // Auto-focus next input
        if (digit && index < length - 1) {
            inputRefs.current[index + 1]?.focus();
        }

        // Call onComplete when all digits entered
        if (newPin.length === length && onComplete) {
            onComplete(newPin);
        }
    };

    const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
        if (e.key === 'Backspace' && !value[index] && index > 0) {
            inputRefs.current[index - 1]?.focus();
        }
    };

    const handlePaste = (e: React.ClipboardEvent) => {
        e.preventDefault();
        const pastedData = e.clipboardData.getData('text').slice(0, length);
        if (/^\d+$/.test(pastedData)) {
            onChange(pastedData);
            if (pastedData.length === length && onComplete) {
                onComplete(pastedData);
            }
        }
    };

    return (
        <div className="flex gap-3 justify-center">
            {Array.from({ length }).map((_, index) => (
                <input
                    key={index}
                    ref={(el) => {
                        inputRefs.current[index] = el;
                    }}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={value[index] || ''}
                    onChange={(e) => handleChange(index, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(index, e)}
                    onPaste={handlePaste}
                    disabled={disabled}
                    className="w-14 h-14 text-center text-2xl font-bold border-2 border-border-subtle rounded-lg focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    autoFocus={index === 0}
                />
            ))}
        </div>
    );
};
