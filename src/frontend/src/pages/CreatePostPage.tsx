import { useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { useCreatePost } from '../hooks/useCreatePost';
import { validateMedia } from '../lib/mediaValidation';
import { Button } from '../components/ui/button';
import { Textarea } from '../components/ui/textarea';
import { Label } from '../components/ui/label';
import { Input } from '../components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Alert, AlertDescription } from '../components/ui/alert';
import { Progress } from '../components/ui/progress';
import { X, Image as ImageIcon, Video, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

export default function CreatePostPage() {
  const navigate = useNavigate();
  const { mutate: createPost, isPending } = useCreatePost();

  const [caption, setCaption] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [filePreview, setFilePreview] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [validationError, setValidationError] = useState<string | null>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file
    const validation = validateMedia(file);
    if (!validation.valid) {
      setValidationError(validation.error || 'Invalid file');
      setSelectedFile(null);
      setFilePreview(null);
      return;
    }

    setValidationError(null);
    setSelectedFile(file);

    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setFilePreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveFile = () => {
    setSelectedFile(null);
    setFilePreview(null);
    setValidationError(null);
    setUploadProgress(0);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!caption.trim() && !selectedFile) {
      toast.error('Please add a caption or media');
      return;
    }

    try {
      await createPost(
        {
          caption: caption.trim(),
          file: selectedFile,
          onProgress: setUploadProgress,
        },
        {
          onSuccess: () => {
            toast.success('Post created successfully!');
            navigate({ to: '/' });
          },
          onError: (error) => {
            toast.error(error instanceof Error ? error.message : 'Failed to create post');
          },
        }
      );
    } catch (error) {
      console.error('Create post error:', error);
    }
  };

  const isSubmitDisabled = isPending || (!caption.trim() && !selectedFile);

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold">Create Post</h1>
        <p className="text-muted-foreground">Share your thoughts with the community</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>New Post</CardTitle>
          <CardDescription>Add a caption and optionally attach an image or video</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Caption */}
            <div className="space-y-2">
              <Label htmlFor="caption">Caption</Label>
              <Textarea
                id="caption"
                placeholder="What's on your mind?"
                value={caption}
                onChange={(e) => setCaption(e.target.value)}
                rows={4}
                className="resize-none"
              />
            </div>

            {/* Media Upload */}
            <div className="space-y-2">
              <Label htmlFor="media">Media (optional)</Label>
              {!selectedFile ? (
                <div className="flex gap-2">
                  <Input
                    id="media"
                    type="file"
                    accept="image/*,video/*"
                    onChange={handleFileSelect}
                    className="cursor-pointer"
                  />
                </div>
              ) : (
                <div className="space-y-3">
                  {/* Preview */}
                  <div className="relative overflow-hidden rounded-lg border border-border bg-muted">
                    {selectedFile.type.startsWith('image/') ? (
                      <img
                        src={filePreview || ''}
                        alt="Preview"
                        className="h-64 w-full object-cover"
                      />
                    ) : (
                      <video
                        src={filePreview || ''}
                        controls
                        className="h-64 w-full object-cover"
                      />
                    )}
                    <Button
                      type="button"
                      variant="destructive"
                      size="icon"
                      className="absolute right-2 top-2"
                      onClick={handleRemoveFile}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>

                  {/* File info */}
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    {selectedFile.type.startsWith('image/') ? (
                      <ImageIcon className="h-4 w-4" />
                    ) : (
                      <Video className="h-4 w-4" />
                    )}
                    <span>{selectedFile.name}</span>
                    <span>({(selectedFile.size / 1024 / 1024).toFixed(2)} MB)</span>
                  </div>
                </div>
              )}

              {validationError && (
                <Alert variant="destructive">
                  <AlertDescription>{validationError}</AlertDescription>
                </Alert>
              )}
            </div>

            {/* Upload Progress */}
            {isPending && uploadProgress > 0 && (
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Uploading...</span>
                  <span className="font-medium">{uploadProgress}%</span>
                </div>
                <Progress value={uploadProgress} />
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-3">
              <Button type="submit" disabled={isSubmitDisabled} className="flex-1">
                {isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating...
                  </>
                ) : (
                  'Create Post'
                )}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate({ to: '/' })}
                disabled={isPending}
              >
                Cancel
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
