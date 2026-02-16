import { useFeed } from '../hooks/useFeed';
import PostCard from '../components/posts/PostCard';
import { Loader2 } from 'lucide-react';
import { Alert, AlertDescription } from '../components/ui/alert';

export default function FeedPage() {
  const { data: posts, isLoading, error } = useFeed();

  if (isLoading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">Loading feed...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertDescription>
          Failed to load posts. Please try refreshing the page.
        </AlertDescription>
      </Alert>
    );
  }

  if (!posts || posts.length === 0) {
    return (
      <div className="flex min-h-[500px] flex-col items-center justify-center gap-6 text-center">
        <img
          src="/assets/generated/empty-feed-illustration.dim_1200x600.png"
          alt="Empty feed"
          className="w-full max-w-md rounded-2xl opacity-80"
        />
        <div className="space-y-2">
          <h2 className="text-2xl font-semibold">No posts yet</h2>
          <p className="text-muted-foreground">
            Be the first to share something with the community!
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold">Feed</h1>
        <p className="text-muted-foreground">
          Discover what's happening in the community
        </p>
      </div>

      <div className="space-y-4">
        {posts.map((post) => (
          <PostCard key={post.id} post={post} />
        ))}
      </div>
    </div>
  );
}
