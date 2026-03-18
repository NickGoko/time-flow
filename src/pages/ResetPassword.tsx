import { useState } from 'react';
import { Clock } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useCurrentUser } from '@/contexts/UserContext';
import { Navigate, useNavigate } from 'react-router-dom';

export default function ResetPassword() {
  const { currentUser, isLoading, recoveryMode } = useCurrentUser();
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  // If not in recovery mode and not loading, send them to sign-in
  if (!isLoading && !recoveryMode && !done) {
    return <Navigate to="/sign-in" replace />;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirm) { setError('Passwords do not match'); return; }
    if (password.length < 8) { setError('Password must be at least 8 characters'); return; }
    setError(null);
    setSubmitting(true);

    const { error: authError } = await supabase.auth.updateUser({ password });
    if (authError) {
      setError(authError.message);
      setSubmitting(false);
      return;
    }

    setDone(true);
    // Give the USER_UPDATED event time to clear recoveryMode, then navigate
    setTimeout(() => {
      const target = currentUser?.appRole === 'admin' || currentUser?.appRole === 'super_admin'
        ? '/admin/reports/overview'
        : '/';
      navigate(target, { replace: true });
    }, 1500);
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4">
      <div className="mb-8 flex flex-col items-center gap-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary">
          <Clock className="h-6 w-6 text-primary-foreground" />
        </div>
        <h1 className="text-2xl font-bold tracking-tight">TimeTrack</h1>
      </div>

      <Card className="w-full max-w-sm">
        <CardHeader className="text-center">
          <CardTitle className="text-lg">Set New Password</CardTitle>
          <CardDescription>
            {currentUser ? `Setting password for ${currentUser.email}` : 'Choose a new password for your account'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {done ? (
            <p className="text-center text-sm text-emerald-600 font-medium">
              Password updated successfully! Redirecting…
            </p>
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="rp-password">New Password</Label>
                <Input
                  id="rp-password"
                  type="password"
                  required
                  minLength={8}
                  placeholder="Minimum 8 characters"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="rp-confirm">Confirm Password</Label>
                <Input
                  id="rp-confirm"
                  type="password"
                  required
                  minLength={8}
                  placeholder="Repeat your new password"
                  value={confirm}
                  onChange={e => setConfirm(e.target.value)}
                />
              </div>
              {error && <p className="text-sm text-destructive">{error}</p>}
              <Button type="submit" disabled={submitting || password.length < 8} className="w-full">
                {submitting ? 'Updating…' : 'Set Password'}
              </Button>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
