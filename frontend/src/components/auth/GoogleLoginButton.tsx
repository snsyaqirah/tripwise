import { Button } from '@/components/ui/button';
import { Chrome } from 'lucide-react';

interface GoogleLoginButtonProps {
  onError?: (error: Error) => void;
  disabled?: boolean;
}

export function GoogleLoginButton({ onError, disabled }: GoogleLoginButtonProps) {
  const handleGoogleLogin = async () => {
    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8080';
      window.location.href = `${apiUrl}/api/auth/google`;
    } catch (error) {
      if (onError) {
        onError(error as Error);
      }
    }
  };

  return (
    <Button
      variant="outline"
      className="w-full"
      onClick={handleGoogleLogin}
      disabled={disabled}
      type="button"
    >
      <Chrome className="mr-2 h-4 w-4" />
      Continue with Google
    </Button>
  );
}
