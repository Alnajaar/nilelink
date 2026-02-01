import React from 'react';

interface NotificationBadgeProps {
  count: number;
  isVisible?: boolean;
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left';
}

export const NotificationBadge: React.FC<NotificationBadgeProps> = ({
  count,
  isVisible = true,
  position = 'top-right'
}) => {
  if (!isVisible || count <= 0) return null;

  const positionClasses = {
    'top-right': 'top-0 right-0',
    'top-left': 'top-0 left-0',
    'bottom-right': 'bottom-0 right-0',
    'bottom-left': 'bottom-0 left-0'
  };

  return (
    <div className={`absolute ${positionClasses[position]} transform translate-x-1/2 -translate-y-1/2`}>
      <span className="flex items-center justify-center w-5 h-5 bg-error-500 text-white text-[10px] font-black rounded-full shadow-lg">
        {count > 9 ? '9+' : count}
      </span>
    </div>
  );
};