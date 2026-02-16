import { type Post } from '../../backend';
import { Card, CardContent, CardFooter, CardHeader } from '../ui/card';
import { Avatar, AvatarFallback } from '../ui/avatar';
import { Button } from '../ui/button';
import { Trash2, Loader2 } from 'lucide-react';
import { useDeletePost } from '../../hooks/useDeletePost';
import { useInternetIdentity } from '../../hooks/useInternetIdentity';
import { toast } from 'sonner';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '../ui/alert-dialog';

interface PostCardProps {
  post: Post;
  showActions?: boolean;
}

export default function PostCard({ post, showActions = false }: PostCardProps) {
  const { identity } = useInternetIdentity();
  const { mutate: deletePost, isPending: isDeleting } = useDeletePost();

  const isAuthor = identity?.getPrincipal().toString() === post.author.toString();
  const canDelete = showActions && isAuthor;

  const formatDate = (timestamp: bigint) => {
    const date = new Date(Number(timestamp) / 1_000_000);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  const getInitials = (principal: string) => {
    return principal.slice(0, 2).toUpperCase();
  };

  const handleDelete = () => {
    deletePost(post.id, {
      onSuccess: () => {
        toast.success('Post deleted successfully');
      },
      onError: (error) => {
        toast.error(error instanceof Error ? error.message : 'Failed to delete post');
      },
    });
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <Avatar>
              <AvatarFallback className="bg-primary text-primary-foreground">
                {getInitials(post.author.toString())}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="text-sm font-medium leading-none">
                {post.author.toString().slice(0, 12)}...
              </p>
              <p className="mt-1 text-xs text-muted-foreground">{formatDate(post.timestamp)}</p>
            </div>
          </div>

          {canDelete && (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="ghost" size="icon" disabled={isDeleting}>
                  {isDeleting ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Trash2 className="h-4 w-4" />
                  )}
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete Post</AlertDialogTitle>
                  <AlertDialogDescription>
                    Are you sure you want to delete this post? This action cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={handleDelete}>Delete</AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}
        </div>
      </CardHeader>

      {post.content && (
        <CardContent>
          <p className="whitespace-pre-wrap break-words text-base">{post.content}</p>
        </CardContent>
      )}

      {post.image && (
        <CardContent className="pt-0">
          {(() => {
            const url = post.image.getDirectURL();
            const isVideo = url.includes('video') || url.includes('.mp4') || url.includes('.webm');

            return isVideo ? (
              <video
                src={url}
                controls
                className="w-full rounded-lg border border-border"
                style={{ maxHeight: '500px' }}
              />
            ) : (
              <img
                src={url}
                alt="Post media"
                className="w-full rounded-lg border border-border object-cover"
                style={{ maxHeight: '500px' }}
              />
            );
          })()}
        </CardContent>
      )}
    </Card>
  );
}
