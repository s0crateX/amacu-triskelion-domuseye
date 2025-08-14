"use client";

import { useState, useEffect } from "react";
import {
  MessageSquare,
  Plus,
  Search,
  Building,
  Edit,
  Trash2,
  Send,
  Loader2,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { useAuth } from "@/lib/auth/auth-context";
import {
  collection,
  query,
  where,
  orderBy,
  onSnapshot,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  serverTimestamp,
  getDocs,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Property } from "@/types/property";

interface CommunityPost {
  id: string;
  propertyId: string;
  propertyTitle: string;
  title: string;
  content: string;
  type: "update" | "news" | "announcement" | "maintenance";
  landlordId: string;
  landlordName: string;
  createdAt: Date;
  updatedAt: Date;
}

interface PostFormData {
  propertyId: string;
  title: string;
  content: string;
  type: "update" | "news" | "announcement" | "maintenance";
}

const postTypes = [
  {
    value: "update",
    label: "Property Update",
    color: "bg-blue-100 text-blue-800",
  },
  { value: "news", label: "News", color: "bg-green-100 text-green-800" },
  {
    value: "announcement",
    label: "Announcement",
    color: "bg-purple-100 text-purple-800",
  },
  {
    value: "maintenance",
    label: "Maintenance Notice",
    color: "bg-orange-100 text-orange-800",
  },
];

export default function CommunityBoardPage() {
  const { user, userData } = useAuth();
  const [properties, setProperties] = useState<Property[]>([]);
  const [posts, setPosts] = useState<CommunityPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [postsLoading, setPostsLoading] = useState(false);
  const [deletingPostId, setDeletingPostId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [editingPost, setEditingPost] = useState<CommunityPost | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState<PostFormData>({
    propertyId: "",
    title: "",
    content: "",
    type: "update",
  });

  // Fetch landlord's properties
  useEffect(() => {
    if (!user) return;

    const propertiesQuery = query(
      collection(db, "properties"),
      where("landlordId", "==", user.uid),
      orderBy("datePosted", "desc")
    );

    const unsubscribe = onSnapshot(propertiesQuery, (snapshot) => {
      const propertiesData = snapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
        } as Property;
      });
      setProperties(propertiesData);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  // Fetch community posts for landlord's properties
  useEffect(() => {
    if (!user || properties.length === 0) return;

    const propertyIds = properties.map((p) => p.id);

    // Create a query for each property and combine results
    const fetchPosts = async () => {
      setPostsLoading(true);
      try {
        const allPosts: CommunityPost[] = [];

        for (const propertyId of propertyIds) {
          const postsQuery = query(
            collection(db, "properties", propertyId, "community-board"),
            orderBy("createdAt", "desc")
          );

          const snapshot = await getDocs(postsQuery);
          const propertyPosts = snapshot.docs.map((doc) => {
            const data = doc.data();
            return {
              id: doc.id,
              ...data,
              createdAt: data.createdAt?.toDate
                ? data.createdAt.toDate()
                : new Date(data.createdAt),
              updatedAt: data.updatedAt?.toDate
                ? data.updatedAt.toDate()
                : new Date(data.updatedAt),
            };
          }) as CommunityPost[];

          allPosts.push(...propertyPosts);
        }

        // Sort all posts by creation date
        allPosts.sort((a, b) => {
          return b.createdAt.getTime() - a.createdAt.getTime();
        });

        setPosts(allPosts);
      } catch (error) {
        console.error("Error fetching posts:", error);
        toast.error("Failed to load community posts");
      } finally {
        setPostsLoading(false);
      }
    };

    fetchPosts();
  }, [user, properties]);

  const handleCreatePost = async () => {
    if (!user || !userData) {
      toast.error("You must be logged in to create a post");
      return;
    }

    if (
      !formData.propertyId ||
      !formData.title.trim() ||
      !formData.content.trim()
    ) {
      toast.error("Please fill in all required fields");
      return;
    }

    setSubmitting(true);
    try {
      const selectedProperty = properties.find(
        (p) => p.id === formData.propertyId
      );

      const postData = {
        propertyId: formData.propertyId,
        propertyTitle: selectedProperty?.title || "Unknown Property",
        title: formData.title.trim(),
        content: formData.content.trim(),
        type: formData.type,
        landlordId: user.uid,
        landlordName: userData.firstName + " " + userData.lastName,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };

      await addDoc(
        collection(db, "properties", formData.propertyId, "community-board"),
        postData
      );

      // Add the new post to the current posts state
      const newPost: CommunityPost = {
        id: "temp-" + Date.now(), // Temporary ID until we get the real one
        ...postData,
        createdAt: new Date(),
        updatedAt: new Date(),
      } as CommunityPost;

      setPosts((prevPosts) => [newPost, ...prevPosts]);

      toast.success("Post created successfully!");
      setShowCreateForm(false);
      setFormData({
        propertyId: "",
        title: "",
        content: "",
        type: "update",
      });

      // Refresh posts to get the real data
      setTimeout(() => {
        const propertyIds = properties.map((p) => p.id);
        const fetchPosts = async () => {
          try {
            const allPosts: CommunityPost[] = [];
            for (const propertyId of propertyIds) {
              const postsQuery = query(
                collection(db, "properties", propertyId, "community-board"),
                orderBy("createdAt", "desc")
              );
              const snapshot = await getDocs(postsQuery);
              const propertyPosts = snapshot.docs.map((doc) => {
                const data = doc.data();
                return {
                  id: doc.id,
                  ...data,
                  createdAt: data.createdAt?.toDate
                    ? data.createdAt.toDate()
                    : new Date(data.createdAt),
                  updatedAt: data.updatedAt?.toDate
                    ? data.updatedAt.toDate()
                    : new Date(data.updatedAt),
                };
              }) as CommunityPost[];
              allPosts.push(...propertyPosts);
            }
            allPosts.sort(
              (a, b) => b.createdAt.getTime() - a.createdAt.getTime()
            );
            setPosts(allPosts);
          } catch (error) {
            console.error("Error refreshing posts:", error);
          }
        };
        fetchPosts();
      }, 1000);
    } catch (error) {
      console.error("Error creating post:", error);
      toast.error("Failed to create post");
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditPost = async () => {
    if (!editingPost || !formData.title.trim() || !formData.content.trim()) {
      toast.error("Please fill in all required fields");
      return;
    }

    setSubmitting(true);
    try {
      const postRef = doc(
        db,
        "properties",
        editingPost.propertyId,
        "community-board",
        editingPost.id
      );

      await updateDoc(postRef, {
        title: formData.title.trim(),
        content: formData.content.trim(),
        type: formData.type,
        updatedAt: serverTimestamp(),
      });

      // Update the post in the current posts state
      setPosts((prevPosts) =>
        prevPosts.map((post) =>
          post.id === editingPost.id
            ? {
                ...post,
                title: formData.title.trim(),
                content: formData.content.trim(),
                type: formData.type,
                updatedAt: new Date(),
              }
            : post
        )
      );

      toast.success("Post updated successfully!");
      setShowEditForm(false);
      setEditingPost(null);
      setFormData({
        propertyId: "",
        title: "",
        content: "",
        type: "update",
      });
    } catch (error) {
      console.error("Error updating post:", error);
      toast.error("Failed to update post");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeletePost = async (post: CommunityPost) => {
    if (!confirm("Are you sure you want to delete this post?")) return;

    setDeletingPostId(post.id);
    try {
      const postRef = doc(
        db,
        "properties",
        post.propertyId,
        "community-board",
        post.id
      );

      await deleteDoc(postRef);

      // Remove the post from the current posts state
      setPosts((prevPosts) => prevPosts.filter((p) => p.id !== post.id));

      toast.success("Post deleted successfully!");
    } catch (error) {
      console.error("Error deleting post:", error);
      toast.error("Failed to delete post");
    } finally {
      setDeletingPostId(null);
    }
  };

  const openEditForm = (post: CommunityPost) => {
    setEditingPost(post);
    setFormData({
      propertyId: post.propertyId,
      title: post.title,
      content: post.content,
      type: post.type,
    });
    setShowEditForm(true);
  };

  const filteredPosts = posts.filter(
    (post) =>
      post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      post.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
      post.propertyTitle.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getPostTypeInfo = (type: string) => {
    return postTypes.find((pt) => pt.value === type) || postTypes[0];
  };

  const formatDate = (timestamp: Date) => {
    if (!timestamp) return "Unknown date";

    let date: Date;
    if (timestamp instanceof Date) {
      date = timestamp;
    } else if (timestamp) {
      date = timestamp;
    } else {
      date = new Date(timestamp);
    }

    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };



  if (loading) {
    return (
      <div className="container mx-auto px-6 sm:px-8 lg:px-12 xl:px-16 py-4 sm:py-6 max-w-7xl">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading community board...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-6 sm:px-8 lg:px-12 xl:px-16 py-4 sm:py-6 max-w-7xl">
      {/* Header */}
      <div className="mb-6 sm:mb-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-2">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold flex items-center gap-2">
              <MessageSquare className="h-6 w-6 sm:h-8 sm:w-8" />
              Community Board
            </h1>
          </div>
          <Button
            onClick={() => setShowCreateForm(true)}
            className="flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            Create Post
          </Button>
        </div>
        <p className="text-sm sm:text-base text-muted-foreground">
          Share updates and news with your tenants
        </p>
      </div>

      {/* Search and Stats */}
      <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Search posts..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
          {searchTerm && (
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
              <div className="text-xs text-muted-foreground">
                {filteredPosts.length} result
                {filteredPosts.length !== 1 ? "s" : ""}
              </div>
            </div>
          )}
        </div>
        <div className="flex gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            <Building className="h-4 w-4" />
            {properties.length} Properties
          </div>
          <div className="flex items-center gap-1">
            <MessageSquare className="h-4 w-4" />
            {postsLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              posts.length
            )}{" "}
            Posts
          </div>
        </div>
      </div>

      {/* Posts List */}
      <div className="space-y-4">
        {postsLoading && posts.length === 0 ? (
          // Show circular spinner while posts are loading for the first time
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-muted-foreground">Loading posts...</p>
            </div>
          </div>
        ) : filteredPosts.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <MessageSquare className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No posts yet</h3>
              <p className="text-muted-foreground text-center mb-4">
                {posts.length === 0
                  ? "Create your first community post to share updates with your tenants."
                  : "No posts match your search criteria."}
              </p>
              {posts.length === 0 && (
                <Button onClick={() => setShowCreateForm(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Create First Post
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          filteredPosts.map((post) => {
            const typeInfo = getPostTypeInfo(post.type);
            const isDeleting = deletingPostId === post.id;
            return (
              <Card
                key={post.id}
                className={isDeleting ? "opacity-50 pointer-events-none" : ""}
              >
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Badge className={typeInfo.color}>
                          {typeInfo.label}
                        </Badge>
                        <span className="text-sm text-muted-foreground">
                          {formatDate(post.createdAt)}
                        </span>
                      </div>
                      <CardTitle className="text-xl">{post.title}</CardTitle>
                      <CardDescription className="flex items-center gap-1">
                        <Building className="h-4 w-4" />
                        {post.propertyTitle}
                      </CardDescription>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => openEditForm(post)}
                        disabled={isDeleting}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDeletePost(post)}
                        disabled={isDeleting}
                      >
                        {isDeleting ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Trash2 className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="whitespace-pre-wrap">{post.content}</p>
                  <div className="mt-4 pt-4 border-t flex items-center justify-between text-sm text-muted-foreground">
                    <span>By {post.landlordName}</span>
                    {post.updatedAt && post.updatedAt !== post.createdAt && (
                      <span>Updated {formatDate(post.updatedAt)}</span>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>

      {/* Create Post Dialog */}
      <Dialog open={showCreateForm} onOpenChange={setShowCreateForm}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Create Community Post</DialogTitle>
            <DialogDescription>
              Share updates, news, or announcements with your tenants.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="property">Select Property *</Label>
              <Select
                value={formData.propertyId}
                onValueChange={(value) =>
                  setFormData({ ...formData, propertyId: value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Choose a property" />
                </SelectTrigger>
                <SelectContent>
                  {properties.map((property) => (
                    <SelectItem key={property.id} value={property.id}>
                      {property.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="type">Post Type *</Label>
              <Select
                value={formData.type}
                onValueChange={(
                  value: "update" | "news" | "announcement" | "maintenance"
                ) => setFormData({ ...formData, type: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {postTypes.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="title">Title *</Label>
              <Input
                id="title"
                placeholder="Enter post title"
                value={formData.title}
                onChange={(e) =>
                  setFormData({ ...formData, title: e.target.value })
                }
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="content">Content *</Label>
              <Textarea
                id="content"
                placeholder="Write your message here..."
                value={formData.content}
                onChange={(e) =>
                  setFormData({ ...formData, content: e.target.value })
                }
                rows={6}
              />
            </div>

            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => {
                  setShowCreateForm(false);
                  setFormData({
                    propertyId: "",
                    title: "",
                    content: "",
                    type: "update",
                  });
                }}
              >
                Cancel
              </Button>
              <Button onClick={handleCreatePost} disabled={submitting}>
                {submitting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Creating...
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4 mr-2" />
                    Create Post
                  </>
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Post Dialog */}
      <Dialog open={showEditForm} onOpenChange={setShowEditForm}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Community Post</DialogTitle>
            <DialogDescription>
              Update your post content and settings.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Property</Label>
              <div className="p-3 bg-muted rounded-md">
                <div className="flex items-center gap-2">
                  <Building className="h-4 w-4" />
                  {editingPost?.propertyTitle}
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-type">Post Type *</Label>
              <Select
                value={formData.type}
                onValueChange={(
                  value: "update" | "news" | "announcement" | "maintenance"
                ) => setFormData({ ...formData, type: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {postTypes.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-title">Title *</Label>
              <Input
                id="edit-title"
                placeholder="Enter post title"
                value={formData.title}
                onChange={(e) =>
                  setFormData({ ...formData, title: e.target.value })
                }
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-content">Content *</Label>
              <Textarea
                id="edit-content"
                placeholder="Write your message here..."
                value={formData.content}
                onChange={(e) =>
                  setFormData({ ...formData, content: e.target.value })
                }
                rows={6}
              />
            </div>

            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => {
                  setShowEditForm(false);
                  setEditingPost(null);
                  setFormData({
                    propertyId: "",
                    title: "",
                    content: "",
                    type: "update",
                  });
                }}
              >
                Cancel
              </Button>
              <Button onClick={handleEditPost} disabled={submitting}>
                {submitting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Updating...
                  </>
                ) : (
                  <>
                    <Edit className="h-4 w-4 mr-2" />
                    Update Post
                  </>
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
