import { type ReactNode } from 'react';
import { useInternetIdentity } from '../../hooks/useInternetIdentity';
import LoginButton from './LoginButton';
import { Loader2 } from 'lucide-react';

interface AuthGateProps {
  children: ReactNode;
}

export default function AuthGate({ children }: AuthGateProps) {
  const { identity, loginStatus } = useInternetIdentity();

  const isAuthenticated = !!identity;
  const isInitializing = loginStatus === 'initializing';

  // Show loading state during initialization
  if (isInitializing) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  // Show login screen if not authenticated
  if (!isAuthenticated) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4">
        <div className="w-full max-w-md space-y-8 text-center">
          <div className="space-y-4">
            <img
              src="/assets/generated/logo-mark.dim_512x512.png"
              alt="App Logo"
              className="mx-auto h-24 w-24 rounded-2xl"
            />
            <h1 className="text-4xl font-bold tracking-tight">Welcome</h1>
            <p className="text-lg text-muted-foreground">
              Share your moments with the world. Sign in to get started.
            </p>
          </div>
          <div className="pt-4">
            <LoginButton />
          </div>
        </div>
      </div>
    );
  }

  // User is authenticated, show app content
  return <>{children}</>;
}
