import { useState } from 'react';
import { useProfile, useUpdateProfile } from '../hooks/useProfile';
import { useUserPosts } from '../hooks/useUserPosts';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import ProfileHeader from '../components/profile/ProfileHeader';
import PostCard from '../components/posts/PostCard';
import LoginButton from '../components/auth/LoginButton';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Textarea } from '../components/ui/textarea';
import { Label } from '../components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Separator } from '../components/ui/separator';
import { Loader2, Edit2, Save, X } from 'lucide-react';
import { toast } from 'sonner';

export default function ProfilePage() {
  const { identity } = useInternetIdentity();
  const { data: profile, isLoading: profileLoading } = useProfile();
  const { data: posts, isLoading: postsLoading } = useUserPosts();
  const { mutate: updateProfile, isPending: isUpdating } = useUpdateProfile();

  const [isEditing, setIsEditing] = useState(false);
  const [displayName, setDisplayName] = useState('');
  const [bio, setBio] = useState('');

  const handleEdit = () => {
    setDisplayName(profile?.displayName || '');
    setBio(profile?.bio || '');
    setIsEditing(true);
  };

  const handleCancel = () => {
    setIsEditing(false);
    setDisplayName('');
    setBio('');
  };

  const handleSave = () => {
    updateProfile(
      { displayName: displayName.trim(), bio: bio.trim() },
      {
        onSuccess: () => {
          toast.success('Profile updated successfully!');
          setIsEditing(false);
        },
        onError: (error) => {
          toast.error(error instanceof Error ? error.message : 'Failed to update profile');
        },
      }
    );
  };

  if (profileLoading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (!identity || !profile) {
    return (
      <div className="flex min-h-[400px] flex-col items-center justify-center gap-6 text-center">
        <h2 className="text-2xl font-semibold">Profile not found</h2>
        <p className="text-muted-foreground">Please sign in to view your profile</p>
        <LoginButton />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Profile Header */}
      <ProfileHeader profile={profile} principal={identity.getPrincipal()} />

      {/* Edit Profile Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Profile Information</CardTitle>
              <CardDescription>Manage your public profile details</CardDescription>
            </div>
            {!isEditing && (
              <Button onClick={handleEdit} variant="outline" size="sm">
                <Edit2 className="mr-2 h-4 w-4" />
                Edit
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {isEditing ? (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="displayName">Display Name</Label>
                <Input
                  id="displayName"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="Your name"
                  maxLength={50}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="bio">Bio</Label>
                <Textarea
                  id="bio"
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="Tell us about yourself"
                  rows={3}
                  maxLength={200}
                  className="resize-none"
                />
                <p className="text-xs text-muted-foreground">{bio.length}/200 characters</p>
              </div>

              <div className="flex gap-2">
                <Button onClick={handleSave} disabled={isUpdating}>
                  {isUpdating ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" />
                      Save Changes
                    </>
                  )}
                </Button>
                <Button onClick={handleCancel} variant="outline" disabled={isUpdating}>
                  <X className="mr-2 h-4 w-4" />
                  Cancel
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div>
                <Label className="text-muted-foreground">Display Name</Label>
                <p className="mt-1 text-base">
                  {profile.displayName || <span className="italic text-muted-foreground">Not set</span>}
                </p>
              </div>
              <div>
                <Label className="text-muted-foreground">Bio</Label>
                <p className="mt-1 text-base">
                  {profile.bio || <span className="italic text-muted-foreground">Not set</span>}
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Separator />

      {/* User Posts */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-semibold">Your Posts</h2>
          <span className="text-sm text-muted-foreground">
            {posts?.length || 0} {posts?.length === 1 ? 'post' : 'posts'}
          </span>
        </div>

        {postsLoading ? (
          <div className="flex min-h-[200px] items-center justify-center">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          </div>
        ) : !posts || posts.length === 0 ? (
          <Card>
            <CardContent className="flex min-h-[200px] items-center justify-center">
              <p className="text-muted-foreground">You haven't created any posts yet</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {posts.map((post) => (
              <PostCard key={post.id} post={post} showActions />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
