import { useGetCallerUserProfile } from './useQueries';

export function useCurrentUser() {
  const { data: profile, isLoading, isFetched, error } = useGetCallerUserProfile();

  return {
    profile,
    isLoading,
    isFetched,
    error,
  };
}
