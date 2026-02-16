# Specification

## Summary
**Goal:** Build a user-friendly social media app where users sign in with Internet Identity (auto-creating a profile on first login), create posts with optional image/video uploads, browse a global feed, and manage a basic profile.

**Planned changes:**
- Add Internet Identity sign-in with automatic user profile creation on first successful login (no separate signup UI).
- Implement backend data models and APIs for users and posts (caption, timestamps, author, optional media stored in-canister with size/MIME limits), including create/list (newest first)/get-by-id, with stable persistence across upgrades.
- Create a “Create Post” UI for signed-in users to submit caption-only posts or posts with one attached image/video, including client-side validation and server error display.
- Build a feed view that lists all users’ posts in reverse chronological order with caption/author/timestamp and inline media rendering (responsive images, playable videos), plus loading/empty/error states in English.
- Add a profile view for the signed-in user showing principal identity, editable display name and bio, and a post list/count.
- Apply a coherent warm neutral visual theme (avoid blue/purple) with clear navigation between Feed, Create Post, and Profile and accessible focus/hover states.

**User-visible outcome:** Users can sign in via Internet Identity and immediately use the app (no signup form) to create posts (with optional image/video), browse a global feed with inline media playback, and view/edit their basic profile with a count/list of their posts.
