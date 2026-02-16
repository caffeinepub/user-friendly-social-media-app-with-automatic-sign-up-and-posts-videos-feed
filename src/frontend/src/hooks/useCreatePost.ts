import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import { ExternalBlob } from '../backend';

interface CreatePostParams {
  caption: string;
  file: File | null;
  onProgress?: (percentage: number) => void;
}

export function useCreatePost() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ caption, file, onProgress }: CreatePostParams) => {
      if (!actor) throw new Error('Actor not available');

      let blob: ExternalBlob | null = null;

      if (file) {
        const arrayBuffer = await file.arrayBuffer();
        const uint8Array = new Uint8Array(arrayBuffer);
        blob = ExternalBlob.fromBytes(uint8Array);

        if (onProgress) {
          blob = blob.withUploadProgress(onProgress);
        }
      }

      return actor.createPost(caption, blob);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['feed'] });
      queryClient.invalidateQueries({ queryKey: ['userPosts'] });
    },
  });
}
