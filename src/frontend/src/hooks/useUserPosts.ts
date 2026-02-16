import { useQuery } from '@tanstack/react-query';
import { useActor } from './useActor';
import { useInternetIdentity } from './useInternetIdentity';
import { type Post } from '../backend';

export function useUserPosts() {
  const { actor, isFetching: actorFetching } = useActor();
  const { identity } = useInternetIdentity();

  return useQuery<Post[]>({
    queryKey: ['userPosts', identity?.getPrincipal().toString()],
    queryFn: async () => {
      if (!actor || !identity) return [];
      const posts = await actor.getUserPosts(identity.getPrincipal());
      // Sort by timestamp descending (newest first)
      return posts.sort((a, b) => Number(b.timestamp - a.timestamp));
    },
    enabled: !!actor && !!identity && !actorFetching,
    retry: 2,
  });
}
