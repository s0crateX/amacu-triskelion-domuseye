"use client"

import { useState, useEffect, useRef, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useAuth } from '@/lib/auth/auth-context'
import { useNotifications } from '@/contexts/notification-context'
import { messageService, conversationService } from '@/lib/database/messages'
import { Message, Conversation, Participant } from '@/types/message'
import { searchUsers, SearchUser } from '@/lib/database/users'
import { formatDistanceToNow } from 'date-fns'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
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
} from '@/components/ui/alert-dialog'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Search,
  Send,
  Plus,
  MoreVertical,
  Trash2,
  Paperclip,
  Image as ImageIcon,
  Smile,
  X,
  MessageSquare,
  FileText,
  Download,
} from 'lucide-react'
import Image from 'next/image'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'

// Helper function to wrap text at specified character limit
const wrapText = (text: string, maxCharsPerLine: number = 30): string => {
  const words = text.split(' ');
  const lines: string[] = [];
  let currentLine = '';

  for (const word of words) {
    // If word is longer than maxCharsPerLine, break it
    if (word.length > maxCharsPerLine) {
      if (currentLine) {
        lines.push(currentLine);
        currentLine = '';
      }
      // Break long word into chunks
      for (let i = 0; i < word.length; i += maxCharsPerLine) {
        lines.push(word.substring(i, i + maxCharsPerLine));
      }
    } else if (currentLine.length + word.length + 1 <= maxCharsPerLine) {
      currentLine += (currentLine ? ' ' : '') + word;
    } else {
      if (currentLine) {
        lines.push(currentLine);
      }
      currentLine = word;
    }
  }
  
  if (currentLine) {
    lines.push(currentLine);
  }
  
  return lines.join('\n');
};

function TenantMessagesContent() {
  const { userData, loading: authLoading } = useAuth()
  const router = useRouter()
  const searchParams = useSearchParams()
  const propertyId = searchParams.get('propertyId')
  const propertyTitle = searchParams.get('propertyTitle')
  const conversationId = searchParams.get('conversationId')
  const draftMessage = searchParams.get('draftMessage')
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [isSending, setIsSending] = useState(false)
  
  // New conversation states
  const [showNewConversation, setShowNewConversation] = useState(false)
  const [userSearchTerm, setUserSearchTerm] = useState('')
  const [searchResults, setSearchResults] = useState<SearchUser[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [isCreatingConversation, setIsCreatingConversation] = useState(false)
  const [showEmojiPicker, setShowEmojiPicker] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const [isUploading, setIsUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [selectedImage, setSelectedImage] = useState<{url: string, name: string} | null>(null)

  // Load conversations with real-time updates
  useEffect(() => {
    if (!userData?.uid) return

    setIsLoading(true)
    const unsubscribe = conversationService.subscribeToUserConversations(
      userData.uid,
      (fetchedConversations) => {
        setConversations(fetchedConversations)
        setIsLoading(false)
      }
    )

    return () => unsubscribe()
  }, [userData?.uid])

  // Handle URL parameters
  useEffect(() => {
    if (conversationId && conversations.length > 0) {
      const conversation = conversations.find(c => c.id === conversationId)
      if (conversation) {
        setSelectedConversation(conversation)
        // Immediately clear unread count for selected conversation
        if (conversation.unreadCount > 0) {
          setConversations(prevConversations => 
            prevConversations.map(conv => 
              conv.id === conversationId 
                ? { ...conv, unreadCount: 0 }
                : conv
            )
          )
        }
      }
    }
  }, [conversationId, conversations])

  // Clear unread count when conversation is selected
  useEffect(() => {
    if (selectedConversation && userData?.uid) {
      setConversations(prevConversations => 
        prevConversations.map(conv => 
          conv.id === selectedConversation.id 
            ? { ...conv, unreadCount: 0 }
            : conv
        )
      )
    }
  }, [selectedConversation?.id, userData?.uid])

  // Set draft message
  useEffect(() => {
    if (draftMessage) {
      setNewMessage(decodeURIComponent(draftMessage))
    }
  }, [draftMessage])

  // Load messages with real-time updates when conversation is selected
  useEffect(() => {
    if (!selectedConversation) {
      setMessages([])
      return
    }

    const unsubscribe = messageService.subscribeToMessages(
      selectedConversation.id,
      (fetchedMessages) => {
        setMessages(fetchedMessages)
        setTimeout(scrollToBottom, 100)
      }
    )

    // Mark messages as read
    if (userData?.uid) {
      messageService.markMessagesAsRead(selectedConversation.id, userData.uid)
      
      // Update local conversation state to set unread count to 0
      setConversations(prevConversations => 
        prevConversations.map(conv => 
          conv.id === selectedConversation.id 
            ? { ...conv, unreadCount: 0 }
            : conv
        )
      )
    }

    return () => unsubscribe()
  }, [selectedConversation, userData?.uid])

  // Auto-scroll to bottom of messages
  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const loadConversations = async () => {
    if (!userData?.uid) return
    
    try {
      const userConversations = await conversationService.getUserConversations(userData.uid)
      setConversations(userConversations)
    } catch (error) {
      console.error('Error loading conversations:', error)
      toast.error('Failed to load conversations')
    } finally {
      setIsLoading(false)
    }
  }

  const loadMessages = async (conversationId: string) => {
    try {
      const conversationMessages = await messageService.getMessages(conversationId)
      setMessages(conversationMessages)
      
      // Mark messages as read
      if (userData?.uid) {
        await messageService.markMessagesAsRead(conversationId, userData.uid)
      }
    } catch (error) {
      console.error('Error loading messages:', error)
      toast.error('Failed to load messages')
    }
  }

  // Send message
  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedConversation || !userData) return

    setIsSending(true)
    try {
      await messageService.sendMessage(
        selectedConversation.id,
        userData.uid,
        `${userData.firstName} ${userData.lastName}` || userData.email || 'Tenant',
        'tenant',
        {
          content: newMessage.trim(),
          type: 'text'
        }
      )
      setNewMessage('')
      toast.success('Message sent successfully')
    } catch (error) {
      console.error('Error sending message:', error)
      toast.error('Failed to send message')
    } finally {
      setIsSending(false)
    }
  }

  // Handle Enter key press
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  // Handle file upload
  const handleFileUpload = async (file: File) => {
    if (!selectedConversation || !userData) return

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'application/msword', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'application/vnd.ms-excel']
    if (!allowedTypes.includes(file.type)) {
      toast.error('Please select a valid file type (images, PDF, DOCX, or Excel files)')
      return
    }

    // Validate file size (10MB limit)
    if (file.size > 10 * 1024 * 1024) {
      toast.error('File size must be less than 10MB')
      return
    }

    setIsUploading(true)
    try {
      // Upload to ImageKit
      const formData = new FormData()
      formData.append('file', file)
      formData.append('fileName', file.name)
      formData.append('folder', '/chatMedia')

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        throw new Error('Upload failed')
      }

      const uploadResult = await response.json()
      
      // Determine message type
      const messageType = file.type.startsWith('image/') ? 'image' : 'file'
      
      // Send message with attachment
      const messageInput = {
        content: messageType === 'image' ? 'Image' : `File: ${file.name}`,
        type: messageType as 'image' | 'file',
        attachmentUrl: uploadResult.url,
        attachmentName: file.name
      }

      await messageService.sendMessage(
        selectedConversation.id,
        userData.uid,
        `${userData.firstName} ${userData.lastName}` || userData.email || 'Tenant',
        'tenant',
        messageInput
      )

      toast.success('File uploaded successfully')
    } catch (error) {
      console.error('Error uploading file:', error)
      toast.error('Failed to upload file. Please try again.')
    } finally {
      setIsUploading(false)
    }
  }

  // Handle attachment button click
  const handleAttachmentClick = () => {
    fileInputRef.current?.click()
  }

  // Handle file input change
  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      handleFileUpload(file)
    }
    // Reset input value to allow selecting the same file again
    e.target.value = ''
  }

  // Handle emoji insertion
  const handleEmojiSelect = (emoji: string) => {
    setNewMessage(prev => prev + emoji)
    setShowEmojiPicker(false)
  }

  // Search users for new conversation
  const handleUserSearch = async (searchTerm: string) => {
    if (!searchTerm.trim()) {
      setSearchResults([])
      return
    }

    setIsSearching(true)
    try {
      // Tenants can message agents and landlords
      const results = await searchUsers(searchTerm, ['agent', 'landlord'])
      setSearchResults(results)
    } catch (error) {
      console.error('Error searching users:', error)
      toast.error('Failed to search users')
    } finally {
      setIsSearching(false)
    }
  }

  // Create new conversation
  const handleCreateConversation = async (otherUser: SearchUser) => {
    if (!userData?.uid) return

    setIsCreatingConversation(true)
    try {
      const conversationId = await conversationService.createNewConversation(
        userData.uid,
        `${userData.firstName} ${userData.lastName}`,
        otherUser.uid,
        `${otherUser.firstName} ${otherUser.lastName}`,
        otherUser.userType as 'agent' | 'landlord',
        propertyId || undefined,
        propertyTitle || undefined
      )

      // Refresh conversations and select the new one
      await loadConversations()
      const newConversation = conversations.find(c => c.id === conversationId)
      if (newConversation) {
        setSelectedConversation(newConversation)
      }
      
      setShowNewConversation(false)
      setUserSearchTerm('')
      setSearchResults([])
      toast.success('Conversation created successfully')
    } catch (error) {
      console.error('Error creating conversation:', error)
      toast.error('Failed to create conversation')
    } finally {
      setIsCreatingConversation(false)
    }
  }

  // Get other participant in conversation
  const getOtherParticipant = (conversation: Conversation): Participant | undefined => {
    return conversation.participants.find(p => p.id !== userData?.uid)
  }

  // Filter conversations based on search
  const filteredConversations = conversations.filter(conversation => {
    const otherParticipant = getOtherParticipant(conversation)
    return otherParticipant?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
           conversation.propertyTitle?.toLowerCase().includes(searchTerm.toLowerCase())
  })

  // Delete conversation (dual-deletion logic)
  const handleDeleteConversation = async (conversationId: string) => {
    if (!userData?.uid) return
    
    try {
      await conversationService.deleteConversation(conversationId, userData.uid, 'tenant')
      
      // Clear selected conversation if it was deleted
      if (selectedConversation?.id === conversationId) {
        setSelectedConversation(null)
        setMessages([])
      }
      
      // Refresh conversations list
      const updatedConversations = await conversationService.getUserConversations(userData.uid)
      setConversations(updatedConversations)
      // Conversation deleted silently without showing success message
    } catch (error) {
      console.error('Error deleting conversation:', error)
      toast.error('Failed to delete conversation')
    }
  }

  // Delete message (unsend)
  const handleDeleteMessage = async (messageId: string) => {
    if (!userData?.uid) return
    
    try {
      await messageService.deleteMessage(messageId, userData.uid)
      
      // Refresh messages
      if (selectedConversation) {
        const updatedMessages = await messageService.getMessages(selectedConversation.id)
        setMessages(updatedMessages)
      }
      
      // Refresh conversations list to update lastMessage display
      const updatedConversations = await conversationService.getUserConversations(userData.uid)
      setConversations(updatedConversations)
      toast.success('Message deleted successfully')
    } catch (error) {
      console.error('Error deleting message:', error)
      toast.error('Failed to delete message')
    }
  }

  if (authLoading || isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Messages
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          Communicate with your agents and landlords
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-200px)]">
        {/* Conversations List */}
        <Card className="flex flex-col overflow-hidden">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">Conversations</CardTitle>
              <Dialog open={showNewConversation} onOpenChange={setShowNewConversation}>
                <DialogTrigger asChild>
                  <Button size="sm" className="h-8 w-8 p-0">
                    <Plus className="h-4 w-4" />
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Start New Conversation</DialogTitle>
                    <DialogDescription>
                      Search for agents or landlords to start a conversation
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Search users..."
                        value={userSearchTerm}
                        onChange={(e) => {
                          setUserSearchTerm(e.target.value)
                          handleUserSearch(e.target.value)
                        }}
                        className="pl-10"
                      />
                    </div>
                    
                    {isSearching && (
                      <div className="flex items-center justify-center py-4">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                      </div>
                    )}
                    
                    {searchResults.length > 0 && (
                      <div className="space-y-2 max-h-60 overflow-y-auto">
                        {searchResults.map((user) => (
                          <div
                            key={user.uid}
                            className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 cursor-pointer"
                            onClick={() => handleCreateConversation(user)}
                          >
                            <div className="flex items-center space-x-3">
                              <Avatar className="w-8 h-8">
                                {user.profilePicture && (
                                  <AvatarImage src={user.profilePicture} />
                                )}
                                <AvatarFallback>
                                  {user.firstName?.charAt(0)?.toUpperCase() || 'U'}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <p className="font-medium">
                                  {user.firstName} {user.lastName}
                                </p>
                                <p className="text-sm text-muted-foreground">
                                  {user.userType}
                                </p>
                              </div>
                            </div>
                            <Badge variant="outline">
                              {user.userType}
                            </Badge>
                          </div>
                        ))}
                      </div>
                    )}
                    
                    {userSearchTerm && !isSearching && searchResults.length === 0 && (
                      <p className="text-center text-muted-foreground py-4">
                        No users found
                      </p>
                    )}
                  </div>
                </DialogContent>
              </Dialog>
            </div>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search conversations..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </CardHeader>
          <CardContent className="flex-1 p-0">
            <ScrollArea className="h-full">
              {filteredConversations.length === 0 ? (
                <div className="p-4 text-center text-muted-foreground">
                  {conversations.length === 0 ? 'No conversations yet' : 'No conversations match your search'}
                </div>
              ) : (
                <div className="space-y-1">
                  {filteredConversations.map((conversation) => {
                    const otherParticipant = getOtherParticipant(conversation)
                    const isSelected = selectedConversation?.id === conversation.id
                    const hasUnreadMessages = conversation.unreadCount && conversation.unreadCount > 0
                    
                    return (
                      <div
                        key={conversation.id}
                        className={cn(
                          "flex items-center space-x-3 p-3 hover:bg-muted/50 cursor-pointer border-l-2 transition-colors overflow-hidden min-w-0",
                          isSelected ? "bg-muted border-l-primary" : "border-l-transparent",
                          hasUnreadMessages && !isSelected ? "bg-blue-50 border-l-blue-500" : ""
                        )}
                        onClick={() => {
                          setSelectedConversation(conversation)
                          // Update the conversation's unread count to 0 immediately
                          if (conversation.unreadCount && conversation.unreadCount > 0) {
                            setConversations(prevConversations => 
                              prevConversations.map(conv => 
                                conv.id === conversation.id 
                                  ? { ...conv, unreadCount: 0 }
                                  : conv
                              )
                            )
                          }
                        }}
                      >
                        <Avatar className="w-10 h-10">
                          {otherParticipant?.avatar && (
                            <AvatarImage src={otherParticipant.avatar} />
                          )}
                          <AvatarFallback>
                            {otherParticipant?.name?.charAt(0)?.toUpperCase() || 'U'}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between min-w-0">
                            <p className={cn(
                              "font-medium flex-1 min-w-0 mr-2",
                              hasUnreadMessages ? "font-bold text-blue-900" : ""
                            )}>
                              {(() => {
                                const name = otherParticipant?.name || 'Unknown User';
                                return name.length > 20 ? `${name.substring(0, 20)}...` : name;
                              })()}
                            </p>
                            <div className="flex items-center space-x-2 flex-shrink-0">
                              {conversation.unreadCount > 0 && !isSelected && (
                                <Badge variant="default" className="bg-blue-600 text-white text-xs px-2 py-1">
                                  {conversation.unreadCount}
                                </Badge>
                              )}
                              <Badge variant="outline" className="text-xs">
                                {otherParticipant?.type}
                              </Badge>
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-6 w-6 p-0"
                                    onClick={(e) => e.stopPropagation()}
                                  >
                                    <MoreVertical className="h-3 w-3" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <AlertDialog>
                                    <AlertDialogTrigger asChild>
                                      <DropdownMenuItem
                                        className="text-red-600 focus:text-red-600"
                                        onSelect={(e) => e.preventDefault()}
                                      >
                                        <Trash2 className="h-4 w-4 mr-2" />
                                        Delete Conversation
                                      </DropdownMenuItem>
                                    </AlertDialogTrigger>
                                    <AlertDialogContent>
                                      <AlertDialogHeader>
                                        <AlertDialogTitle>Delete Conversation</AlertDialogTitle>
                                        <AlertDialogDescription>
                                          Are you sure you want to delete this conversation?.
                                        </AlertDialogDescription>
                                      </AlertDialogHeader>
                                      <AlertDialogFooter>
                                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                                        <AlertDialogAction
                                          onClick={() => handleDeleteConversation(conversation.id)}
                                          className="bg-red-600 hover:bg-red-700"
                                        >
                                          Delete
                                        </AlertDialogAction>
                                      </AlertDialogFooter>
                                    </AlertDialogContent>
                                  </AlertDialog>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </div>
                          </div>
                          {conversation.propertyTitle && (
                            <p className="text-xs text-muted-foreground">
                              Property: {conversation.propertyTitle.length > 20 
                                ? `${conversation.propertyTitle.substring(0, 20)}...` 
                                : conversation.propertyTitle}
                            </p>
                          )}
                          {conversation.lastMessage && (
                            <p className={cn(
                              "text-sm",
                              hasUnreadMessages ? "text-blue-800 font-medium" : "text-muted-foreground"
                            )}>
                              {conversation.lastMessage.content.length > 20 
                                ? `${conversation.lastMessage.content.substring(0, 20)}...` 
                                : conversation.lastMessage.content}
                            </p>
                          )}
                          {conversation.lastMessageTime && (
                            <p className="text-xs text-muted-foreground">
                              {formatDistanceToNow(conversation.lastMessageTime, { addSuffix: true })}
                            </p>
                          )}
                        </div>
                      </div>
                    )
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
                        const otherParticipant = getOtherParticipant(selectedConversation);
                        const avatarSrc = otherParticipant?.avatar;
                        return avatarSrc ? <AvatarImage src={avatarSrc} /> : null;
                      })()}
                      <AvatarFallback>
                        {getOtherParticipant(selectedConversation)?.name?.charAt(0)?.toUpperCase() || 'U'}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h3 className="font-semibold">
                        {getOtherParticipant(selectedConversation)?.name || 'Unknown User'}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        {getOtherParticipant(selectedConversation)?.type}
                      </p>
                    </div>
                  </div>
                  {selectedConversation.propertyTitle && (
                    <Badge variant="outline">
                      {selectedConversation.propertyTitle}
                    </Badge>
                  )}
                </div>
              </CardHeader>

              {/* Messages */}
              <CardContent className="flex-1 p-4 overflow-hidden">
                <ScrollArea className="h-full pr-4">
                  <div className="space-y-4">
                    {messages.map((message) => {
                      const isOwnMessage = message.senderId === userData?.uid
                      
                      return (
                        <div
                          key={message.id}
                          className={cn(
                            "flex w-full",
                            isOwnMessage ? "justify-end" : "justify-start"
                          )}
                        >
                          <div
                            className={cn(
                              "flex max-w-[70%] items-start space-x-2",
                              isOwnMessage && "flex-row-reverse space-x-reverse"
                            )}
                          >
                            <Avatar className="w-8 h-8 flex-shrink-0">
                              {(() => {
                                const avatarSrc = isOwnMessage ? userData?.profilePicture : getOtherParticipant(selectedConversation)?.avatar;
                                return avatarSrc ? <AvatarImage src={avatarSrc} /> : null;
                              })()}
                              <AvatarFallback>
                                {isOwnMessage 
                                  ? userData?.firstName?.charAt(0)?.toUpperCase() || 'T'
                                  : getOtherParticipant(selectedConversation)?.name?.charAt(0)?.toUpperCase() || 'U'
                                }
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex flex-col min-w-0 flex-1">
                              <div
                                className={cn(
                                  "rounded-2xl px-4 py-2 shadow-sm relative group overflow-hidden",
                                  isOwnMessage
                                    ? "bg-primary text-primary-foreground rounded-tr-none"
                                    : "bg-muted text-muted-foreground rounded-tl-none"
                                )}
                              >
                                {message.type === 'image' && message.attachmentUrl ? (
                                  <div className="space-y-2">
                                    <Image
                                      src={message.attachmentUrl}
                                      alt={message.attachmentName || 'Image'}
                                      width={300}
                                      height={200}
                                      className="rounded-lg cursor-pointer"
                                      onClick={() => setSelectedImage({
                                        url: message.attachmentUrl!,
                                        name: message.attachmentName || 'Image'
                                      })}
                                    />
                                    {message.content !== 'Image' && (
                                      <p className="text-sm">{message.content}</p>
                                    )}
                                  </div>
                                ) : message.type === 'file' && message.attachmentUrl ? (
                                  <div className="space-y-2">
                                    <div className="flex items-center space-x-2 p-3 bg-white/10 rounded-lg border hover:bg-white/20 transition-colors">
                                      <FileText className="h-5 w-5 flex-shrink-0" />
                                      <div className="flex-1 min-w-0">
                                        <a 
                                          href={message.attachmentUrl} 
                                          target="_blank" 
                                          rel="noopener noreferrer"
                                          className="text-sm font-medium hover:underline truncate block"
                                        >
                                          {message.attachmentName || 'File'}
                                        </a>
                                      </div>
                                      <a 
                                        href={message.attachmentUrl} 
                                        download={message.attachmentName}
                                        className="p-1 hover:bg-white/10 rounded transition-colors"
                                      >
                                        <Download className="h-4 w-4" />
                                      </a>
                                    </div>
                                    {message.content !== `File: ${message.attachmentName}` && (
                                      <p className="text-sm whitespace-pre-wrap break-words overflow-wrap-anywhere">{wrapText(message.content)}</p>
                                    )}
                                  </div>
                                ) : (
                                  <p className="text-sm whitespace-pre-wrap break-words overflow-wrap-anywhere">{wrapText(message.content)}</p>
                                )}
                                
                                {/* Message options */}
                                {isOwnMessage && (
                                  <div className="absolute -top-2 -right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <DropdownMenu>
                                      <DropdownMenuTrigger asChild>
                                        <Button
                                          variant="ghost"
                                          size="sm"
                                          className="h-6 w-6 p-0 bg-background border shadow-sm"
                                        >
                                          <MoreVertical className="h-3 w-3" />
                                        </Button>
                                      </DropdownMenuTrigger>
                                      <DropdownMenuContent align="end">
                                        <AlertDialog>
                                          <AlertDialogTrigger asChild>
                                            <DropdownMenuItem
                                              className="text-red-600 focus:text-red-600"
                                              onSelect={(e) => e.preventDefault()}
                                            >
                                              <Trash2 className="h-4 w-4 mr-2" />
                                              Unsend Message
                                            </DropdownMenuItem>
                                          </AlertDialogTrigger>
                                          <AlertDialogContent>
                                            <AlertDialogHeader>
                                              <AlertDialogTitle>Unsend Message</AlertDialogTitle>
                                              <AlertDialogDescription>
                                                Are you sure you want to unsend this message? This action cannot be undone.
                                              </AlertDialogDescription>
                                            </AlertDialogHeader>
                                            <AlertDialogFooter>
                                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                                              <AlertDialogAction
                                                onClick={() => handleDeleteMessage(message.id)}
                                                className="bg-red-600 hover:bg-red-700"
                                              >
                                                Unsend
                                              </AlertDialogAction>
                                            </AlertDialogFooter>
                                          </AlertDialogContent>
                                        </AlertDialog>
                                      </DropdownMenuContent>
                                    </DropdownMenu>
                                  </div>
                                )}
                              </div>
                              <span
                                className={cn(
                                  "text-xs text-muted-foreground mt-1",
                                  isOwnMessage ? "text-right" : "text-left"
                                )}
                              >
                                {formatDistanceToNow(message.timestamp, { addSuffix: true })}
                              </span>
                            </div>
                          </div>
                        </div>
                      )
                    })}
                    <div ref={messagesEndRef} />
                  </div>
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
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
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
                      className="min-h-[40px] max-h-32 resize-none"
                      rows={1}
                    />
                  </div>
                  <DropdownMenu open={showEmojiPicker} onOpenChange={setShowEmojiPicker}>
                    <DropdownMenuTrigger asChild>
                      <Button size="sm" variant="outline">
                        <Smile className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-64 p-2">
                      <div className="grid grid-cols-8 gap-1">
                        {[
                          '😀', '😃', '😄', '😁', '😆', '😅', '😂', '🤣',
                          '😊', '😇', '🙂', '🙃', '😉', '😌', '😍', '🥰',
                          '😘', '😗', '😙', '😚', '😋', '😛', '😝', '😜',
                          '🤪', '🤨', '🧐', '🤓', '😎', '🤩', '🥳', '😏',
                          '😒', '😞', '😔', '😟', '😕', '🙁', '☹️', '😣',
                          '😖', '😫', '😩', '🥺', '😢', '😭', '😤', '😠',
                          '😡', '🤬', '🤯', '😳', '🥵', '🥶', '😱', '😨',
                          '😰', '😥', '😓', '🤗', '🤔', '🤭', '🤫', '🤥',
                          '👍', '👎', '👌', '✌️', '🤞', '🤟', '🤘', '🤙',
                          '👈', '👉', '👆', '👇', '☝️', '✋', '🤚', '🖐️',
                          '🖖', '👋', '🤝', '👏', '🙌', '👐', '🤲', '🙏',
                          '❤️', '🧡', '💛', '💚', '💙', '💜', '🖤', '🤍'
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
                    size="sm"
                  >
                    {isSending ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    ) : (
                      <Send className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium text-muted-foreground mb-2">
                  Select a conversation
                </h3>
                <p className="text-sm text-muted-foreground">
                  Choose a conversation from the list to start messaging
                </p>
              </div>
            </div>
          )}
        </Card>
      </div>

      {/* Image Preview Dialog */}
      <Dialog open={!!selectedImage} onOpenChange={() => setSelectedImage(null)}>
        <DialogContent className="max-w-4xl">
          <DialogTitle className="mb-4">{selectedImage?.name}</DialogTitle>
          <div className="flex items-center justify-center">
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
  )
}

export default function TenantMessagesPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <TenantMessagesContent />
    </Suspense>
  )
}