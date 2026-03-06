import { DEV_MODE } from '@/lib/devMode';
import { type ReconcileResult } from '@/lib/reconcile';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertTriangle } from 'lucide-react';

interface ReconciliationBannerProps {
  result: ReconcileResult;
}

/**
 * DEV-only banner that surfaces reconciliation mismatches.
 * Never renders in production. Does not block user interaction.
 */
export function ReconciliationBanner({ result }: ReconciliationBannerProps) {
  if (!DEV_MODE || !result.hasMismatch) return null;

  return (
    <Alert variant="destructive" className="mb-4">
      <AlertTriangle className="h-4 w-4" />
      <AlertTitle>Data mismatch detected (DEV)</AlertTitle>
      <AlertDescription>
        <ul className="list-disc pl-4 text-xs mt-1 space-y-0.5">
          {result.details.slice(0, 3).map((d, i) => (
            <li key={i}>{d}</li>
          ))}
        </ul>
      </AlertDescription>
    </Alert>
  );
}
