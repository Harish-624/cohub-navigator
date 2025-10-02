import { Clock, RefreshCw } from 'lucide-react';
import { formatDistanceToNow, format } from 'date-fns';
import { useData } from '@/contexts/DataContext';
import { Button } from '@/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

export function LastFetchTimestamp() {
  const { lastUpload, refreshData, loading } = useData();

  if (!lastUpload) {
    return (
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Clock className="h-4 w-4" />
        <span>No data uploaded yet</span>
      </div>
    );
  }

  const timestamp = new Date(lastUpload.timestamp);
  const now = new Date();
  const hoursSinceUpload = (now.getTime() - timestamp.getTime()) / (1000 * 60 * 60);

  const statusColor = hoursSinceUpload < 24 
    ? 'bg-primary/10 text-primary border-primary/20' 
    : hoursSinceUpload < 168 
    ? 'bg-warning/10 text-warning border-warning/20'
    : 'bg-muted text-muted-foreground border-border';

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className={cn(
            "flex items-center gap-2 px-3 py-1.5 rounded-lg border transition-smooth cursor-help",
            statusColor
          )}>
            <Clock className="h-4 w-4" />
            <div className="flex flex-col">
              <span className="text-xs font-medium">
                Last fetched: {formatDistanceToNow(timestamp, { addSuffix: true })}
              </span>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6"
              onClick={(e) => {
                e.stopPropagation();
                refreshData();
              }}
              disabled={loading}
            >
              <RefreshCw className={cn("h-3 w-3", loading && "animate-spin")} />
            </Button>
          </div>
        </TooltipTrigger>
        <TooltipContent className="max-w-xs">
          <div className="space-y-2">
            <div className="flex items-center justify-between gap-4">
              <span className="text-xs text-muted-foreground">Full timestamp:</span>
              <span className="text-xs font-mono">{format(timestamp, 'PPpp')}</span>
            </div>
            <div className="flex items-center justify-between gap-4">
              <span className="text-xs text-muted-foreground">Source file:</span>
              <span className="text-xs font-mono">{lastUpload.filename}</span>
            </div>
            <div className="flex items-center justify-between gap-4">
              <span className="text-xs text-muted-foreground">Records:</span>
              <span className="text-xs">{lastUpload.recordCount.toLocaleString()}</span>
            </div>
            <div className="flex items-center justify-between gap-4">
              <span className="text-xs text-muted-foreground">Processing time:</span>
              <span className="text-xs">{(lastUpload.processingTime / 1000).toFixed(2)}s</span>
            </div>
            <div className="flex items-center justify-between gap-4">
              <span className="text-xs text-muted-foreground">Status:</span>
              <Badge variant={lastUpload.status === 'success' ? 'default' : 'destructive'} className="text-xs">
                {lastUpload.status}
              </Badge>
            </div>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
