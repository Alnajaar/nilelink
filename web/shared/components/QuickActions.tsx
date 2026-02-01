import React from 'react';
import { Button } from './Button';
import { Card } from './Card';

interface QuickAction {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  onClick: () => void;
  variant?: 'primary' | 'secondary' | 'ghost';
}

interface QuickActionsProps {
  actions: QuickAction[];
  title?: string;
  columns?: number;
}

export const QuickActions: React.FC<QuickActionsProps> = ({
  actions,
  title = "Quick Actions",
  columns = 2,
}) => {
  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold mb-4">{title}</h3>
      <div
        className={`grid gap-4`}
        style={{
          gridTemplateColumns: `repeat(${columns}, 1fr)`,
        }}
      >
        {actions.map((action) => (
          <Button
            key={action.id}
            variant={action.variant || 'ghost'}
            onClick={action.onClick}
            className="h-auto p-4 flex flex-col items-start gap-2 hover:bg-gray-50"
          >
            <div className="flex items-center gap-3 w-full">
              <div className="text-xl">{action.icon}</div>
              <div className="flex-1 text-left">
                <div className="font-medium">{action.title}</div>
                <div className="text-sm text-gray-600 mt-1">
                  {action.description}
                </div>
              </div>
            </div>
          </Button>
        ))}
      </div>
    </Card>
  );
};