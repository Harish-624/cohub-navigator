import { ReactNode } from 'react';
import { LastFetchTimestamp } from './LastFetchTimestamp';

interface PageHeaderProps {
  title: string;
  description?: string;
  actions?: ReactNode;
}

export function PageHeader({ title, description, actions }: PageHeaderProps) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6 pb-4 border-b border-border">
      <div className="flex-1">
        <h1 className="text-3xl font-bold text-foreground mb-1">{title}</h1>
        {description && (
          <p className="text-muted-foreground">{description}</p>
        )}
      </div>
      <div className="flex items-center gap-3">
        {actions}
        <LastFetchTimestamp />
      </div>
    </div>
  );
}
