import React from 'react';

interface SwitchProps {
    checked?: boolean;
    defaultChecked?: boolean;
    onCheckedChange?: (checked: boolean) => void;
    disabled?: boolean;
    className?: string;
}

export const Switch: React.FC<SwitchProps> = ({
    checked,
    defaultChecked = false,
    onCheckedChange,
    disabled = false,
    className = ''
}) => {
    const isChecked = checked !== undefined ? checked : defaultChecked;
    return (
        <button
            type="button"
            role="switch"
            aria-checked={isChecked}
            disabled={disabled}
            onClick={() => onCheckedChange?.(!isChecked)}
            className={`
                relative inline-flex h-6 w-11 items-center rounded-full transition-colors
                ${isChecked ? 'bg-primary' : 'bg-surface border border-primary'}
                ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
                ${className}
            `}
        >
            <span
                className={`
                    inline-block h-4 w-4 transform rounded-full bg-background transition-transform
                    ${isChecked ? 'translate-x-6' : 'translate-x-1'}
                `}
            />
        </button>
    );
};