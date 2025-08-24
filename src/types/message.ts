export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  senderName: string;
  senderType: 'agent' | 'landlord' | 'tenant';
  content: string;
  timestamp: Date;
  read: boolean;
  type: 'text' | 'image' | 'file';
  attachmentUrl?: string;
  attachmentName?: string;
  replyToId?: string;
  replyToMessage?: {
    id: string;
    content: string;
    senderName: string;
    senderType: 'agent' | 'landlord' | 'tenant';
  };
}

export interface Conversation {
  id: string;
  participants: Participant[];
  participantIds: string[];
  lastMessage?: Message;
  lastMessageTime: Date;
  unreadCount: number;
  createdAt: Date;
  updatedAt: Date;
  propertyId?: string;
  propertyTitle?: string;
  hiddenFrom?: string[]; // Array of user IDs who have hidden this conversation
  deletedBy?: string[]; // Array of user IDs who have requested deletion (for dual-deletion)
  deletionHistory?: DeletionRecord[]; // Track deletion attempts for audit purposes
}

export interface DeletionRecord {
  userId: string;
  userType: 'agent' | 'landlord' | 'tenant';
  action: 'hide' | 'permanent_delete';
  timestamp: Date;
  reason?: string;
}

export interface Participant {
  id: string;
  name: string;
  email: string;
  type: 'agent' | 'landlord' | 'tenant';
  avatar?: string | null;
  online?: boolean;
  lastSeen?: Date;
}

export interface MessageInput {
  content: string;
  type: 'text' | 'image' | 'file';
  attachmentUrl?: string;
  attachmentName?: string;
  replyToId?: string;
  replyToMessage?: {
    id: string;
    content: string;
    senderName: string;
    senderType: 'agent' | 'landlord' | 'tenant';
  };
}

export interface ConversationFilter {
  searchTerm?: string;
  participantType?: 'agent' | 'landlord' | 'tenant';
  unreadOnly?: boolean;
}