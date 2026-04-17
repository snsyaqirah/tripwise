import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Compass, Loader2 } from 'lucide-react';

/**
 * Landing page for Google OAuth redirect.
 * Backend redirects here with: ?token=...&refresh=...&newUser=true/false
 */
export default function OAuthCallback() {
  const [params] = useSearchParams();
  const { setUserFromSession } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const token = params.get('token');
    const refresh = params.get('refresh');
    const newUser = params.get('newUser') === 'true';

    if (!token || !refresh) {
      navigate('/login?error=oauth_failed', { replace: true });
      return;
    }

    try {
      // Decode the JWT payload to get user info (no verification needed — backend signed it)
      const payload = JSON.parse(atob(token.split('.')[1]));
      const user = {
        id: payload.sub,
        email: payload.sub,
        name: payload.name || '',
        avatar: payload.avatar || '',
        authProvider: 'google' as const,
        onboardingCompleted: !newUser,
        currency: payload.currency || 'USD',
        country: payload.country || '',
      };

      setUserFromSession(user, token, refresh);
      navigate('/dashboard', { replace: true });
    } catch {
      navigate('/login?error=oauth_failed', { replace: true });
    }
  }, []);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-background">
      <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-primary text-primary-foreground">
        <Compass className="h-8 w-8" />
      </div>
      <div className="flex items-center gap-2 text-muted-foreground">
        <Loader2 className="h-4 w-4 animate-spin" />
        <span>Signing you in...</span>
      </div>
    </div>
  );
}
