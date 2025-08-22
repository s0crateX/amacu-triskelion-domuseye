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
}

export interface Participant {
  id: string;
  name: string;
  email: string;
  type: 'agent' | 'landlord' | 'tenant';
  avatar?: string;
  online?: boolean;
  lastSeen?: Date;
}

export interface MessageInput {
  content: string;
  type: 'text' | 'image' | 'file';
  attachmentUrl?: string;
  attachmentName?: string;
}

export interface ConversationFilter {
  searchTerm?: string;
  participantType?: 'agent' | 'landlord' | 'tenant';
  unreadOnly?: boolean;
}