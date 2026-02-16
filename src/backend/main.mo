import List "mo:core/List";
import Map "mo:core/Map";
import Text "mo:core/Text";
import Time "mo:core/Time";
import Iter "mo:core/Iter";
import Order "mo:core/Order";
import Runtime "mo:core/Runtime";
import Principal "mo:core/Principal";
import MixinAuthorization "authorization/MixinAuthorization";
import MixinStorage "blob-storage/Mixin";
import Storage "blob-storage/Storage";
import AccessControl "authorization/access-control";

actor {
  let accessControlState = AccessControl.initState();

  include MixinAuthorization(accessControlState);
  include MixinStorage();

  public type UserProfile = {
    displayName : Text;
    bio : Text;
    handle : Text;
  };

  type Post = {
    id : Text;
    author : Principal;
    content : Text;
    image : ?Storage.ExternalBlob;
    timestamp : Int;
  };

  let profiles = Map.empty<Principal, UserProfile>();
  let posts = Map.empty<Text, Post>();

  // Automatic profile creation helper
  private func ensureProfile(user : Principal) : UserProfile {
    switch (profiles.get(user)) {
      case (?profile) { profile };
      case (null) {
        // Auto-create profile with sensible defaults
        let defaultProfile = {
          displayName = "";
          bio = "";
          handle = user.toText();
        };
        profiles.add(user, defaultProfile);
        defaultProfile;
      };
    };
  };

  // Required frontend interface: Get caller's own profile
  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view profiles");
    };
    // Auto-create profile if it doesn't exist
    let profile = ensureProfile(caller);
    ?profile;
  };

  // Required frontend interface: Get any user's profile
  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    // Users can view their own profile, admins can view any profile
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };
    profiles.get(user);
  };

  // Required frontend interface: Save caller's profile
  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };
    profiles.add(caller, profile);
  };

  // Legacy function - kept for backward compatibility but uses new authorization
  public shared ({ caller }) func updateProfile(displayName : Text, bio : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can update profiles");
    };

    // Get existing profile or create default
    let existingProfile = ensureProfile(caller);
    
    let profileData = {
      displayName;
      bio;
      handle = existingProfile.handle;
    };

    profiles.add(caller, profileData);
  };

  // Public profile viewing (for social media context)
  public query ({ caller }) func getProfile(user : Principal) : async UserProfile {
    // In a social media app, profiles are typically public
    // But we still require at least guest access (any authenticated user)
    switch (profiles.get(user)) {
      case (null) {
        // Auto-create profile for the requested user
        ensureProfile(user);
      };
      case (?profile) { profile };
    };
  };

  // Create a new post - requires user role
  public shared ({ caller }) func createPost(content : Text, image : ?Storage.ExternalBlob) : async Text {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can create posts");
    };

    // Ensure the user has a profile (auto-create if needed)
    ignore ensureProfile(caller);

    let timestamp = Time.now();
    let postId = generateId(caller, timestamp);

    let post = {
      id = postId;
      author = caller;
      content;
      image;
      timestamp;
    };
    posts.add(postId, post);
    postId;
  };

  // Get a specific post - public access (social media context)
  public query ({ caller }) func getPost(postId : Text) : async Post {
    // Posts are publicly viewable in a social media context
    // No authorization check needed - even guests can view
    switch (posts.get(postId)) {
      case (null) { Runtime.trap("Post does not exist") };
      case (?post) { post };
    };
  };

  // Get all posts by a specific user - public access
  public query ({ caller }) func getUserPosts(user : Principal) : async [Post] {
    // Posts are publicly viewable in a social media context
    // No authorization check needed - even guests can view
    let userPostsIter = posts.values().filter(
      func(post) {
        post.author == user;
      }
    );
    userPostsIter.toArray();
  };

  // Delete a post - only author or admin can delete
  public shared ({ caller }) func deletePost(postId : Text) : async () {
    switch (posts.get(postId)) {
      case (null) { Runtime.trap("Post does not exist") };
      case (?post) {
        // Only the author or an admin can delete
        if (post.author != caller and not AccessControl.isAdmin(accessControlState, caller)) {
          Runtime.trap("Unauthorized: Only the post author or admin can delete this post");
        };
        posts.remove(postId);
      };
    };
  };

  // Get all posts (feed) - public access
  public query ({ caller }) func getAllPosts() : async [Post] {
    // Public feed - no authorization needed
    let allPosts = posts.values().toArray();
    allPosts;
  };

  // Helper function to generate unique post IDs
  func generateId(caller : Principal, timestamp : Int) : Text {
    caller.toText() # "_" # Int.toText(timestamp);
  };
};
