import { useQuery } from '@tanstack/react-query';
import { useActor } from './useActor';
import { type Post } from '../backend';

export function useFeed() {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<Post[]>({
    queryKey: ['feed'],
    queryFn: async () => {
      if (!actor) return [];
      const posts = await actor.getAllPosts();
      // Sort by timestamp descending (newest first)
      return posts.sort((a, b) => Number(b.timestamp - a.timestamp));
    },
    enabled: !!actor && !actorFetching,
    retry: 2,
  });
}
