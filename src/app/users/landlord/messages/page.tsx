"use client";

import React, { useState, useEffect, useRef, Suspense } from "react";
import Image from "next/image";
import { useAuth } from "@/lib/auth/auth-context";
import { useNotifications } from "@/contexts/notification-context";
import { useSearchParams, useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
} from "@/components/ui/alert-dialog";
import {
  MessageSquare,
  Inbox,
  Send,
  Users,
  Search,
  Plus,
  MoreVertical,
  Paperclip,
  Smile,
  Clock,
  Check,
  CheckCheck,
  Trash2,
  X,
  FileText,
  Download,
} from "lucide-react";
import {
  messageService,
  conversationService,
  createNewConversation,
} from "@/lib/database/messages";
import { Message, Conversation, Participant } from "@/types/message";
import { searchUsers, SearchUser } from "@/lib/database/users";
import { formatDistanceToNow } from "date-fns";
import { toast } from "sonner";

// Helper function to truncate text with ellipsis
const truncateText = (text: string, maxLength: number = 20): string => {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + "...";
};

function LandlordMessagesContent() {
  const { userData, loading: authLoading } = useAuth();
  const { unreadCount } = useNotifications();
  const router = useRouter();
  const searchParams = useSearchParams();
  const propertyId = searchParams.get("propertyId");
  const propertyTitle = searchParams.get("propertyTitle");
  const conversationId = searchParams.get("conversationId");
  const draftMessage = searchParams.get("draftMessage");
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] =
    useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);

  // New conversation states
  const [showNewConversation, setShowNewConversation] = useState(false);
  const [userSearchTerm, setUserSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState<SearchUser[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isCreatingConversation, setIsCreatingConversation] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedImage, setSelectedImage] = useState<{
    url: string;
    name: string;
  } | null>(null);

  // Scroll to bottom of messages
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // Load conversations
  useEffect(() => {
    if (!userData?.uid) return;

    setIsLoading(true);
    const unsubscribe = conversationService.subscribeToUserConversations(
      userData.uid,
      (fetchedConversations) => {
        setConversations(fetchedConversations);
        setIsLoading(false);
      }
    );

    return () => unsubscribe();
  }, [userData?.uid]);

  // Auto-select conversation when conversationId is provided
  useEffect(() => {
    if (conversationId && conversations.length > 0) {
      const targetConversation = conversations.find(
        (conv) => conv.id === conversationId
      );
      if (
        targetConversation &&
        (!selectedConversation || selectedConversation.id !== conversationId)
      ) {
        setSelectedConversation(targetConversation);
        // Immediately clear unread count for selected conversation
        if (targetConversation.unreadCount > 0) {
          setConversations((prevConversations) =>
            prevConversations.map((conv) =>
              conv.id === conversationId ? { ...conv, unreadCount: 0 } : conv
            )
          );
        }
      }
    }
  }, [conversationId, conversations.length]);

  // Clear unread count when conversation is selected
  useEffect(() => {
    if (selectedConversation && userData?.uid) {
      const currentConv = conversations.find(
        (conv) => conv.id === selectedConversation.id
      );
      if (currentConv && currentConv.unreadCount > 0) {
        setConversations((prevConversations) =>
          prevConversations.map((conv) =>
            conv.id === selectedConversation.id
              ? { ...conv, unreadCount: 0 }
              : conv
          )
        );
      }
    }
  }, [selectedConversation?.id, userData?.uid]);

  // Load messages for selected conversation
  useEffect(() => {
    if (!selectedConversation) {
      setMessages([]);
      return;
    }

    const unsubscribe = messageService.subscribeToMessages(
      selectedConversation.id,
      (fetchedMessages) => {
        setMessages(fetchedMessages);
        setTimeout(scrollToBottom, 100);
      }
    );

    // Mark messages as read
    if (userData?.uid) {
      messageService.markMessagesAsRead(selectedConversation.id, userData.uid);

      // Update local conversation state to set unread count to 0 only if needed
      const currentConv = conversations.find(
        (conv) => conv.id === selectedConversation.id
      );
      if (currentConv && currentConv.unreadCount > 0) {
        setConversations((prevConversations) =>
          prevConversations.map((conv) =>
            conv.id === selectedConversation.id
              ? { ...conv, unreadCount: 0 }
              : conv
          )
        );
      }
    }

    return () => unsubscribe();
  }, [selectedConversation?.id, userData?.uid]);

  // Populate message input with draft message from URL
  useEffect(() => {
    if (draftMessage) {
      setNewMessage(decodeURIComponent(draftMessage));
    }
  }, [draftMessage]);

  // Filter conversations based on search term and property context
  const filteredConversations = conversations.filter((conversation) => {
    if (!searchTerm) {
      // If coming from a property page, prioritize property-related conversations
      if (propertyId) {
        return (
          conversation.propertyId === propertyId || !conversation.propertyId
        );
      }
      return true;
    }

    const searchLower = searchTerm.toLowerCase();
    return (
      conversation.participants.some(
        (participant) =>
          participant.name.toLowerCase().includes(searchLower) ||
          participant.email.toLowerCase().includes(searchLower)
      ) || conversation.propertyTitle?.toLowerCase().includes(searchLower)
    );
  });

  // Sort conversations to show property-related ones first when coming from property page
  const sortedConversations = propertyId
    ? filteredConversations.sort((a, b) => {
        if (a.propertyId === propertyId && b.propertyId !== propertyId)
          return -1;
        if (b.propertyId === propertyId && a.propertyId !== propertyId)
          return 1;
        return (
          new Date(b.lastMessageTime).getTime() -
          new Date(a.lastMessageTime).getTime()
        );
      })
    : filteredConversations.sort(
        (a, b) =>
          new Date(b.lastMessageTime).getTime() -
          new Date(a.lastMessageTime).getTime()
      );

  // Send message
  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedConversation || !userData) return;

    setIsSending(true);
    try {
      await messageService.sendMessage(
        selectedConversation.id,
        userData.uid,
        `${userData.firstName} ${userData.lastName}` ||
          userData.email ||
          "landlord",
        "landlord",
        {
          content: newMessage.trim(),
          type: "text",
        }
      );
      setNewMessage("");
    } catch (error) {
      console.error("Error sending message:", error);
    } finally {
      setIsSending(false);
    }
  };

  // Handle Enter key press
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // Remove property attachment
  const handleRemovePropertyAttachment = () => {
    const newSearchParams = new URLSearchParams(searchParams.toString());
    newSearchParams.delete("propertyId");
    newSearchParams.delete("propertyTitle");
    newSearchParams.delete("conversationId");
    newSearchParams.delete("draftMessage");

    // Clear the message input field
    setNewMessage("");

    const newUrl = `/users/agent/messages${
      newSearchParams.toString() ? "?" + newSearchParams.toString() : ""
    }`;
    router.push(newUrl);
  };

  // Handle user search
  const handleUserSearch = async (term: string) => {
    setUserSearchTerm(term);
    if (!term.trim()) {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);
    try {
      const results = await searchUsers(term, ["tenant", "agent"], 10);
      setSearchResults(results);
    } catch (error) {
      console.error("Error searching users:", error);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  // Handle creating new conversation
  const handleCreateConversation = async (user: SearchUser) => {
    if (!userData) return;

    setIsCreatingConversation(true);
    try {
      const conversationId = await createNewConversation(
        userData.uid,
        `${userData.firstName} ${userData.lastName}`,
        user.uid,
        `${user.firstName} ${user.lastName}`,
        user.userType as "landlord" | "agent",
        propertyId || undefined,
        propertyTitle ? decodeURIComponent(propertyTitle) : undefined
      );

      // Find and select the new conversation
      const newConversation = conversations.find(
        (c) => c.id === conversationId
      );
      if (newConversation) {
        setSelectedConversation(newConversation);
      }

      // Close the new conversation modal
      setShowNewConversation(false);
      setUserSearchTerm("");
      setSearchResults([]);
    } catch (error) {
      console.error("Error creating conversation:", error);
    } finally {
      setIsCreatingConversation(false);
    }
  };

  // Get other participant in conversation
  const getOtherParticipant = (
    conversation: Conversation
  ): Participant | null => {
    return (
      conversation.participants.find((p) => p.id !== userData?.uid) || null
    );
  };

  // Format message time
  const formatMessageTime = (timestamp: Date) => {
    if (!timestamp || isNaN(timestamp.getTime())) {
      return "Just now";
    }
    try {
      return formatDistanceToNow(timestamp, { addSuffix: true });
    } catch (error) {
      console.error("Error formatting time:", error);
      return "Just now";
    }
  };

  // Delete conversation (dual-deletion logic)
  const handleDeleteConversation = async (conversationId: string) => {
    if (!userData?.uid) return;

    try {
      await conversationService.deleteConversation(
        conversationId,
        userData.uid,
        "landlord"
      );

      // Clear selected conversation if it was deleted
      if (selectedConversation?.id === conversationId) {
        setSelectedConversation(null);
        setMessages([]);
      }

      // Refresh conversations list
      const updatedConversations =
        await conversationService.getUserConversations(userData.uid);
      setConversations(updatedConversations);
      // Conversation deleted silently without showing success message
    } catch (error) {
      console.error("Error deleting conversation:", error);
      toast.error("Failed to delete conversation");
    }
  };

  // Delete message (unsend)
  const handleDeleteMessage = async (messageId: string) => {
    if (!userData?.uid) return;

    try {
      await messageService.deleteMessage(messageId, userData.uid);

      // Refresh messages
      if (selectedConversation) {
        const updatedMessages = await messageService.getMessages(
          selectedConversation.id
        );
        setMessages(updatedMessages);
      }

      // Refresh conversations list to update lastMessage display
      const updatedConversations =
        await conversationService.getUserConversations(userData.uid);
      setConversations(updatedConversations);
    } catch (error) {
      console.error("Error deleting message:", error);
      // You could add a toast notification here
    }
  };

  // Handle file upload
  const handleFileUpload = async (file: File) => {
    if (!selectedConversation || !userData) return;

    // Validate file type
    const allowedTypes = [
      "image/jpeg",
      "image/png",
      "image/gif",
      "image/webp",
      "application/pdf",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "application/vnd.ms-excel",
    ];
    if (!allowedTypes.includes(file.type)) {
      alert(
        "Please select a valid file type (images, PDF, DOCX, or Excel files)"
      );
      return;
    }

    // Validate file size (10MB limit)
    if (file.size > 10 * 1024 * 1024) {
      alert("File size must be less than 10MB");
      return;
    }

    setIsUploading(true);
    try {
      // Upload to ImageKit
      const formData = new FormData();
      formData.append("file", file);
      formData.append("fileName", file.name);
      formData.append("folder", "/chatMedia");

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Upload failed");
      }

      const uploadResult = await response.json();

      // Determine message type
      const messageType = file.type.startsWith("image/") ? "image" : "file";

      // Send message with attachment
      const messageInput = {
        content: messageType === "image" ? "Image" : `File: ${file.name}`,
        type: messageType as "image" | "file",
        attachmentUrl: uploadResult.url,
        attachmentName: file.name,
      };

      await messageService.sendMessage(
        selectedConversation.id,
        userData.uid,
        `${userData.firstName} ${userData.lastName}`,
        "landlord",
        messageInput
      );

      // Refresh messages
      const updatedMessages = await messageService.getMessages(
        selectedConversation.id
      );
      setMessages(updatedMessages);

      // Refresh conversations to update last message
      const updatedConversations =
        await conversationService.getUserConversations(userData.uid);
      setConversations(updatedConversations);
    } catch (error) {
      console.error("Error uploading file:", error);
      alert("Failed to upload file. Please try again.");
    } finally {
      setIsUploading(false);
    }
  };

  // Handle attachment button click
  const handleAttachmentClick = () => {
    fileInputRef.current?.click();
  };

  // Handle file input change
  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileUpload(file);
    }
    // Reset input value to allow selecting the same file again
    e.target.value = "";
  };

  // Handle emoji insertion
  const handleEmojiSelect = (emoji: string) => {
    setNewMessage((prev) => prev + emoji);
    setShowEmojiPicker(false);
  };

  if (authLoading) {
    return (
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="h-96 bg-gray-200 rounded"></div>
            <div className="lg:col-span-2 h-96 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-3">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Messages
          </h1>
          {unreadCount > 0 && (
            <Badge variant="destructive" className="text-sm px-2 py-1">
              {unreadCount} unread
            </Badge>
          )}
        </div>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          Communicate with tenants and landlord
        </p>
      </div>

      {/* Messages Interface */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-200px)]">
        {/* Conversations List */}
        <Card className="flex flex-col overflow-hidden">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center">
                <Inbox className="h-5 w-5 mr-2" />
                Conversations
              </div>
              <Dialog
                open={showNewConversation}
                onOpenChange={setShowNewConversation}
              >
                <DialogTrigger asChild>
                  <Button size="sm" className="flex items-center gap-2">
                    <Plus className="h-4 w-4" />
                    New
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-md">
                  <DialogHeader>
                    <DialogTitle>Start New Conversation</DialogTitle>
                    <DialogDescription>
                      Search for tenants or landlords to start a conversation.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                      <Input
                        placeholder="Search by name or email..."
                        value={userSearchTerm}
                        onChange={(e) => handleUserSearch(e.target.value)}
                        className="pl-10"
                      />
                    </div>

                    {isSearching && (
                      <div className="flex items-center justify-center py-4">
                        <div className="flex items-center gap-2 text-sm text-gray-500">
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                          Searching...
                        </div>
                      </div>
                    )}

                    {searchResults.length > 0 && (
                      <ScrollArea className="h-64">
                        <div className="space-y-2">
                          {searchResults.map((user) => (
                            <div
                              key={user.uid}
                              className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 cursor-pointer"
                              onClick={() => handleCreateConversation(user)}
                            >
                              <div className="flex items-center space-x-3">
                                <Avatar className="w-8 h-8">
                                  <AvatarImage src={user.profilePicture} />
                                  <AvatarFallback>
                                    {user.firstName?.charAt(0)?.toUpperCase() ||
                                      ""}
                                    {user.lastName?.charAt(0)?.toUpperCase() ||
                                      ""}
                                  </AvatarFallback>
                                </Avatar>
                                <div>
                                  <p className="font-medium text-sm">
                                    {user.firstName} {user.lastName}
                                  </p>
                                  <p className="text-xs text-gray-500">
                                    {user.userType} • {user.email}
                                  </p>
                                </div>
                              </div>
                              {isCreatingConversation && (
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                              )}
                            </div>
                          ))}
                        </div>
                      </ScrollArea>
                    )}

                    {userSearchTerm &&
                      !isSearching &&
                      searchResults.length === 0 && (
                        <div className="text-center py-4 text-sm text-gray-500">
                          No users found matching &quot;{userSearchTerm}&quot;
                        </div>
                      )}
                  </div>
                </DialogContent>
              </Dialog>
            </CardTitle>
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search conversations..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </CardHeader>
          <CardContent className="flex-1 p-0 overflow-hidden">
            <ScrollArea className="h-[calc(100vh-300px)]">
              {isLoading ? (
                <div className="p-4 space-y-3">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="animate-pulse">
                      <div className="flex items-center space-x-3 p-3">
                        <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
                        <div className="flex-1">
                          <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                          <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : filteredConversations.length === 0 ? (
                <div className="text-center py-8 px-4">
                  <MessageSquare className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                  <h3 className="text-lg font-semibold mb-2">
                    No Conversations
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 text-sm">
                    {searchTerm
                      ? "No conversations match your search."
                      : "Your conversations with clients will appear here."}
                  </p>
                </div>
              ) : (
                <div className="space-y-1">
                  {propertyId && propertyTitle && (
                    <div className="px-3 py-2 bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-500 mb-2 relative">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleRemovePropertyAttachment}
                        className="absolute top-1 right-1 h-6 w-6 p-0 hover:bg-blue-100 dark:hover:bg-blue-800"
                      >
                        <X className="h-3 w-3" />
                      </Button>
                      <p className="text-sm font-medium text-blue-800 dark:text-blue-200 pr-8">
                        Property: {decodeURIComponent(propertyTitle)}
                      </p>
                      <p className="text-xs text-blue-600 dark:text-blue-400">
                        Showing conversations for this property
                      </p>
                    </div>
                  )}
                  {sortedConversations.map((conversation) => {
                    const otherParticipant = getOtherParticipant(conversation);
                    const isSelected =
                      selectedConversation?.id === conversation.id;
                    const hasUnreadMessages =
                      conversation.unreadCount && conversation.unreadCount > 0;

                    const isPropertyRelated =
                      conversation.propertyId === propertyId;

                    return (
                      <div
                        key={conversation.id}
                        className={`flex items-center space-x-3 p-3 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors ${
                          isSelected
                            ? "bg-blue-50 dark:bg-blue-900/20 border-r-2 border-blue-500"
                            : ""
                        } ${
                          isPropertyRelated
                            ? "bg-green-50 dark:bg-green-900/20 border-l-2 border-green-500"
                            : ""
                        } ${
                          hasUnreadMessages && !isSelected && !isPropertyRelated
                            ? "bg-orange-50 dark:bg-orange-900/20 border-l-2 border-orange-500"
                            : ""
                        }`}
                      >
                        <div
                          onClick={() => {
                            setSelectedConversation(conversation);
                            // Update the conversation's unread count to 0 immediately
                            if (
                              conversation.unreadCount &&
                              conversation.unreadCount > 0
                            ) {
                              setConversations((prevConversations) =>
                                prevConversations.map((conv) =>
                                  conv.id === conversation.id
                                    ? { ...conv, unreadCount: 0 }
                                    : conv
                                )
                              );
                            }
                          }}
                          className="flex items-center space-x-3 flex-1 cursor-pointer"
                        >
                          <Avatar className="w-10 h-10">
                            {(() => {
                              const avatarSrc = otherParticipant?.avatar;
                              return avatarSrc ? (
                                <AvatarImage src={avatarSrc} />
                              ) : null;
                            })()}
                            <AvatarFallback>
                              {otherParticipant?.name
                                ?.charAt(0)
                                ?.toUpperCase() || "U"}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between">
                              <h4
                                className={`font-medium text-sm truncate ${
                                  hasUnreadMessages
                                    ? "font-bold text-orange-900 dark:text-orange-100"
                                    : ""
                                }`}
                              >
                                {truncateText(
                                  otherParticipant?.name || "Unknown User",
                                  20
                                )}
                              </h4>
                              <span className="text-xs text-gray-500">
                                {conversation.lastMessage &&
                                  formatMessageTime(
                                    conversation.lastMessage.timestamp
                                  )}
                              </span>
                            </div>
                            <div className="flex items-center justify-between">
                              <p
                                className={`text-sm truncate ${
                                  hasUnreadMessages
                                    ? "text-orange-800 dark:text-orange-200 font-medium"
                                    : "text-gray-600 dark:text-gray-400"
                                }`}
                              >
                                {truncateText(
                                  conversation.lastMessage?.content ||
                                    "No messages yet",
                                  20
                                )}
                              </p>
                              {conversation.unreadCount > 0 && !isSelected && (
                                <Badge
                                  variant="destructive"
                                  className="text-xs px-1.5 py-0.5 min-w-[20px] h-5 bg-orange-600 hover:bg-orange-700"
                                >
                                  {conversation.unreadCount}
                                </Badge>
                              )}
                            </div>
                            {conversation.propertyTitle && (
                              <p className="text-xs text-blue-600 dark:text-blue-400 truncate mt-1">
                                Re:{" "}
                                {truncateText(conversation.propertyTitle, 20)}
                              </p>
                            )}
                          </div>
                        </div>
                        <AlertDialog>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-8 w-8 p-0"
                              >
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <AlertDialogTrigger asChild>
                                <DropdownMenuItem className="text-red-600 focus:text-red-600">
                                  <Trash2 className="h-4 w-4 mr-2" />
                                  Delete Conversation
                                </DropdownMenuItem>
                              </AlertDialogTrigger>
                            </DropdownMenuContent>
                          </DropdownMenu>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>
                                Delete Conversation
                              </AlertDialogTitle>
                              <AlertDialogDescription>
                                Are you sure you want to delete this
                                conversation with {otherParticipant?.name}?
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() =>
                                  handleDeleteConversation(conversation.id)
                                }
                                className="bg-red-600 hover:bg-red-700"
                              >
                                Delete
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    );
                  })}
                </div>
              )}
            </ScrollArea>
          </CardContent>
        </Card>

        {/* Message Area */}
        <Card className="lg:col-span-2 flex flex-col h-full overflow-hidden">
          {selectedConversation ? (
            <>
              {/* Chat Header */}
              <CardHeader className="pb-3 border-b">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Avatar className="w-8 h-8">
                      {(() => {
                        const otherParticipant =
                          getOtherParticipant(selectedConversation);
                        const avatarSrc = otherParticipant?.avatar;
                        return avatarSrc ? (
                          <AvatarImage src={avatarSrc} />
                        ) : null;
                      })()}
                      <AvatarFallback>
                        {getOtherParticipant(selectedConversation)
                          ?.name?.charAt(0)
                          ?.toUpperCase() || "U"}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h3 className="font-semibold">
                        {getOtherParticipant(selectedConversation)?.name ||
                          "Unknown User"}
                      </h3>
                      <p className="text-sm text-gray-500">
                        {getOtherParticipant(selectedConversation)?.type ||
                          "User"}
                      </p>
                    </div>
                  </div>
                </div>
                {selectedConversation.propertyTitle && (
                  <div className="mt-2">
                    <Badge variant="outline" className="text-xs">
                      Property: {selectedConversation.propertyTitle}
                    </Badge>
                  </div>
                )}
              </CardHeader>

              {/* Messages */}
              <CardContent className="flex-1 p-0 overflow-hidden">
                <ScrollArea className="h-full p-4">
                  {messages.length === 0 ? (
                    <div className="text-center py-8">
                      <MessageSquare className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                      <p className="text-gray-600 dark:text-gray-400">
                        No messages yet. Start the conversation!
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {messages.map((message) => {
                        const isOwn = message.senderId === userData?.uid;

                        return (
                          <div
                            key={message.id}
                            className={`flex ${
                              isOwn ? "justify-end" : "justify-start"
                            } group`}
                          >
                            <div
                              className={`max-w-[70%] ${
                                isOwn ? "order-2" : "order-1"
                              } relative`}
                            >
                              {!isOwn && (
                                <div className="flex items-center space-x-2 mb-1">
                                  <Avatar className="w-6 h-6">
                                    {(() => {
                                      const sender =
                                        selectedConversation?.participants.find(
                                          (p) => p.id === message.senderId
                                        );
                                      const avatarSrc = sender?.avatar;
                                      return avatarSrc ? (
                                        <AvatarImage src={avatarSrc} />
                                      ) : null;
                                    })()}
                                    <AvatarFallback className="text-xs">
                                      {message.senderName
                                        ?.charAt(0)
                                        ?.toUpperCase() || "U"}
                                    </AvatarFallback>
                                  </Avatar>
                                  <span className="text-xs text-gray-500">
                                    {message.senderName}
                                  </span>
                                </div>
                              )}
                              <div className="flex items-start space-x-2">
                                <div
                                  className={`rounded-lg px-3 py-2 flex-1 ${
                                    isOwn
                                      ? "bg-blue-500 text-white"
                                      : "bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                                  }`}
                                >
                                  {message.type === "image" &&
                                  message.attachmentUrl ? (
                                    <div className="space-y-2">
                                      <Image
                                        src={message.attachmentUrl}
                                        alt={message.attachmentName || "Image"}
                                        width={256}
                                        height={192}
                                        className="w-64 h-48 object-cover rounded-lg cursor-pointer"
                                        onClick={() =>
                                          setSelectedImage({
                                            url: message.attachmentUrl!,
                                            name:
                                              message.attachmentName || "Image",
                                          })
                                        }
                                      />
                                      {message.content !== "Image" && (
                                        <p className="text-sm whitespace-pre-wrap break-words overflow-wrap-anywhere max-w-[240px] word-break-break-all">
                                          {message.content}
                                        </p>
                                      )}
                                    </div>
                                  ) : message.type === "file" &&
                                    message.attachmentUrl ? (
                                    <div className="space-y-2">
                                      <div className="flex items-center space-x-2 p-3 bg-white/10 rounded-lg border hover:bg-white/20 transition-colors">
                                        <FileText className="h-5 w-5 flex-shrink-0" />
                                        <div className="flex-1 min-w-0">
                                          <a
                                            href={message.attachmentUrl}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-sm hover:underline block truncate font-medium"
                                          >
                                            {message.attachmentName || "File"}
                                          </a>
                                          <p className="text-xs opacity-75">
                                            Click to download
                                          </p>
                                        </div>
                                        <Download className="h-4 w-4 flex-shrink-0 opacity-75" />
                                      </div>
                                      {message.content !==
                                        `File: ${message.attachmentName}` && (
                                        <p className="text-sm whitespace-pre-wrap break-words overflow-wrap-anywhere max-w-[240px] word-break-break-all">
                                          {message.content}
                                        </p>
                                      )}
                                    </div>
                                  ) : (
                                    <p className="text-sm whitespace-pre-wrap break-words overflow-wrap-anywhere max-w-[240px] word-break-break-all">
                                      {message.content}
                                    </p>
                                  )}
                                </div>
                                {isOwn && (
                                  <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                                      >
                                        <MoreVertical className="h-3 w-3" />
                                      </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end">
                                      <AlertDialog>
                                        <AlertDialogTrigger asChild>
                                          <DropdownMenuItem
                                            onSelect={(e) => e.preventDefault()}
                                          >
                                            <Trash2 className="h-4 w-4 mr-2" />
                                            Unsend Message
                                          </DropdownMenuItem>
                                        </AlertDialogTrigger>
                                        <AlertDialogContent>
                                          <AlertDialogHeader>
                                            <AlertDialogTitle>
                                              Unsend Message
                                            </AlertDialogTitle>
                                            <AlertDialogDescription>
                                              Are you sure you want to unsend
                                              this message? This action cannot
                                              be undone.
                                            </AlertDialogDescription>
                                          </AlertDialogHeader>
                                          <AlertDialogFooter>
                                            <AlertDialogCancel>
                                              Cancel
                                            </AlertDialogCancel>
                                            <AlertDialogAction
                                              onClick={() =>
                                                handleDeleteMessage(message.id)
                                              }
                                              className="bg-red-600 hover:bg-red-700"
                                            >
                                              Unsend
                                            </AlertDialogAction>
                                          </AlertDialogFooter>
                                        </AlertDialogContent>
                                      </AlertDialog>
                                    </DropdownMenuContent>
                                  </DropdownMenu>
                                )}
                              </div>
                              <div
                                className={`flex items-center mt-1 space-x-1 ${
                                  isOwn ? "justify-end" : "justify-start"
                                }`}
                              >
                                <span className="text-xs text-gray-500">
                                  {formatMessageTime(message.timestamp)}
                                </span>
                                {isOwn && (
                                  <div className="text-gray-500">
                                    {message.read ? (
                                      <CheckCheck className="h-3 w-3" />
                                    ) : (
                                      <Check className="h-3 w-3" />
                                    )}
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                      <div ref={messagesEndRef} />
                    </div>
                  )}
                </ScrollArea>
              </CardContent>

              {/* Message Input */}
              <div className="border-t p-4">
                <div className="flex items-end space-x-2">
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileInputChange}
                    accept="image/*,.pdf,.doc,.docx,.xls,.xlsx"
                    className="hidden"
                  />
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={handleAttachmentClick}
                    disabled={isUploading}
                  >
                    {isUploading ? (
                      <Clock className="h-4 w-4 animate-spin" />
                    ) : (
                      <Paperclip className="h-4 w-4" />
                    )}
                  </Button>
                  <div className="flex-1">
                    <Textarea
                      placeholder="Type your message..."
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      onKeyPress={handleKeyPress}
                      className="min-h-[40px] max-h-32 resize-none overflow-y-auto"
                      rows={1}
                      style={{
                        height: "auto",
                        minHeight: "40px",
                        maxHeight: "128px",
                      }}
                      onInput={(e) => {
                        const target = e.target as HTMLTextAreaElement;
                        target.style.height = "auto";
                        target.style.height =
                          Math.min(target.scrollHeight, 128) + "px";
                      }}
                    />
                  </div>
                  <DropdownMenu
                    open={showEmojiPicker}
                    onOpenChange={setShowEmojiPicker}
                  >
                    <DropdownMenuTrigger asChild>
                      <Button size="sm" variant="outline">
                        <Smile className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-64 p-2">
                      <div className="grid grid-cols-8 gap-1">
                        {[
                          "😀",
                          "😃",
                          "😄",
                          "😁",
                          "😆",
                          "😅",
                          "😂",
                          "🤣",
                          "😊",
                          "😇",
                          "🙂",
                          "🙃",
                          "😉",
                          "😌",
                          "😍",
                          "🥰",
                          "😘",
                          "😗",
                          "😙",
                          "😚",
                          "😋",
                          "😛",
                          "😝",
                          "😜",
                          "🤪",
                          "🤨",
                          "🧐",
                          "🤓",
                          "😎",
                          "🤩",
                          "🥳",
                          "😏",
                          "😒",
                          "😞",
                          "😔",
                          "😟",
                          "😕",
                          "🙁",
                          "☹️",
                          "😣",
                          "😖",
                          "😫",
                          "😩",
                          "🥺",
                          "😢",
                          "😭",
                          "😤",
                          "😠",
                          "😡",
                          "🤬",
                          "🤯",
                          "😳",
                          "🥵",
                          "🥶",
                          "😱",
                          "😨",
                          "😰",
                          "😥",
                          "😓",
                          "🤗",
                          "🤔",
                          "🤭",
                          "🤫",
                          "🤥",
                          "👍",
                          "👎",
                          "👌",
                          "✌️",
                          "🤞",
                          "🤟",
                          "🤘",
                          "🤙",
                          "👈",
                          "👉",
                          "👆",
                          "👇",
                          "☝️",
                          "✋",
                          "🤚",
                          "🖐️",
                          "🖖",
                          "👋",
                          "🤝",
                          "👏",
                          "🙌",
                          "👐",
                          "🤲",
                          "🙏",
                          "❤️",
                          "🧡",
                          "💛",
                          "💚",
                          "💙",
                          "💜",
                          "🖤",
                          "🤍",
                        ].map((emoji) => (
                          <button
                            key={emoji}
                            onClick={() => handleEmojiSelect(emoji)}
                            className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded text-lg transition-colors"
                          >
                            {emoji}
                          </button>
                        ))}
                      </div>
                    </DropdownMenuContent>
                  </DropdownMenu>
                  <Button
                    onClick={handleSendMessage}
                    disabled={!newMessage.trim() || isSending}
                    className="px-4"
                  >
                    {isSending ? (
                      <Clock className="h-4 w-4 animate-spin" />
                    ) : (
                      <Send className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>
            </>
          ) : (
            <CardContent className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <Users className="h-16 w-16 mx-auto text-gray-400 mb-4" />
                <h3 className="text-xl font-semibold mb-2">
                  Select a Conversation
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Choose a conversation from the list to start messaging.
                </p>
              </div>
            </CardContent>
          )}
        </Card>
      </div>

      {/* Image Preview Dialog */}
      <Dialog
        open={!!selectedImage}
        onOpenChange={() => setSelectedImage(null)}
      >
        <DialogContent className="max-w-[90vw] max-h-[90vh] p-0 overflow-hidden">
          <DialogHeader className="p-4 pb-0 flex-shrink-0">
            <DialogTitle className="truncate pr-8 text-sm">
              {selectedImage?.name}
            </DialogTitle>
          </DialogHeader>
          <div className="p-4 pt-2 flex-1 overflow-hidden flex items-center justify-center">
            {selectedImage && (
              <Image
                src={selectedImage.url}
                alt={selectedImage.name}
                width={800}
                height={600}
                className="max-w-full max-h-full object-contain rounded-lg"
              />
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default function AgentMessagesPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <LandlordMessagesContent />
    </Suspense>
  );
}
