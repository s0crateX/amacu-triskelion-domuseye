import {
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  getDocs,
  getDoc,
  query,
  where,
  orderBy,
  limit,
  onSnapshot,
  Timestamp,
  writeBatch,

  DocumentData,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Message, Conversation, MessageInput, Participant } from '@/types/message';
import { getUserById } from './users';

// Collections
const MESSAGES_COLLECTION = 'messages';
const CONVERSATIONS_COLLECTION = 'conversations';

// Helper function to convert Firestore timestamp to Date
const convertTimestamp = (timestamp: Timestamp | Date | string | number | null | undefined): Date => {
  if (!timestamp) {
    return new Date();
  }
  if (timestamp instanceof Timestamp) {
    return timestamp.toDate();
  }
  const date = new Date(timestamp as string | number | Date);
  // Check if the date is valid
  if (isNaN(date.getTime())) {
    return new Date();
  }
  return date;
};

// Message Operations
export const messageService = {
  // Send a new message
  async sendMessage(
    conversationId: string,
    senderId: string,
    senderName: string,
    senderType: 'agent' | 'landlord' | 'tenant',
    messageInput: MessageInput
  ): Promise<string> {
    try {
      const messageData = {
        conversationId,
        senderId,
        senderName,
        senderType,
        content: messageInput.content,
        timestamp: Timestamp.now(),
        read: false,
        type: messageInput.type,
        ...(messageInput.attachmentUrl && { attachmentUrl: messageInput.attachmentUrl }),
        ...(messageInput.attachmentName && { attachmentName: messageInput.attachmentName }),
      };

      const docRef = await addDoc(collection(db, MESSAGES_COLLECTION), messageData);
      
      // Update conversation's last message
      await this.updateConversationLastMessage(conversationId, {
        id: docRef.id,
        ...messageData,
        timestamp: messageData.timestamp.toDate(),
      } as Message);

      return docRef.id;
    } catch (error) {
      console.error('Error sending message:', error);
      throw error;
    }
  },

  // Get messages for a conversation
  async getMessages(conversationId: string, limitCount: number = 50): Promise<Message[]> {
    try {
      const q = query(
        collection(db, MESSAGES_COLLECTION),
        where('conversationId', '==', conversationId),
        orderBy('timestamp', 'desc'),
        limit(limitCount)
      );

      const querySnapshot = await getDocs(q);
      const messages: Message[] = [];

      querySnapshot.forEach((doc) => {
        const data = doc.data();
        messages.push({
          id: doc.id,
          ...data,
          timestamp: convertTimestamp(data.timestamp),
        } as Message);
      });

      return messages.reverse(); // Return in chronological order
    } catch (error) {
      console.error('Error getting messages:', error);
      throw error;
    }
  },

  // Mark messages as read
  async markMessagesAsRead(conversationId: string, userId: string): Promise<void> {
    try {
      const q = query(
        collection(db, MESSAGES_COLLECTION),
        where('conversationId', '==', conversationId),
        where('senderId', '!=', userId),
        where('read', '==', false)
      );

      const querySnapshot = await getDocs(q);
      const batch = writeBatch(db);

      querySnapshot.forEach((doc) => {
        batch.update(doc.ref, { read: true });
      });

      await batch.commit();
    } catch (error) {
      console.error('Error marking messages as read:', error);
      throw error;
    }
  },

  // Listen to messages in real-time
  subscribeToMessages(
    conversationId: string,
    callback: (messages: Message[]) => void,
    limitCount: number = 50
  ): () => void {
    const q = query(
      collection(db, MESSAGES_COLLECTION),
      where('conversationId', '==', conversationId),
      orderBy('timestamp', 'desc'),
      limit(limitCount)
    );

    return onSnapshot(q, (querySnapshot) => {
      const messages: Message[] = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        messages.push({
          id: doc.id,
          ...data,
          timestamp: convertTimestamp(data.timestamp),
        } as Message);
      });
      callback(messages.reverse());
    });
  },

  // Update conversation's last message
  async updateConversationLastMessage(conversationId: string, message: Message): Promise<void> {
    try {
      const conversationRef = doc(db, CONVERSATIONS_COLLECTION, conversationId);
      await updateDoc(conversationRef, {
        lastMessage: {
          id: message.id,
          content: message.content,
          timestamp: message.timestamp,
          senderName: message.senderName,
          senderType: message.senderType,
        },
        lastMessageTime: Timestamp.fromDate(message.timestamp),
        updatedAt: Timestamp.now(),
      });
    } catch (error) {
      console.error('Error updating conversation last message:', error);
      throw error;
    }
  },

  // Delete a message (unsend)
  async deleteMessage(messageId: string, userId: string): Promise<void> {
    try {
      const messageRef = doc(db, MESSAGES_COLLECTION, messageId);
      const messageDoc = await getDoc(messageRef);
      
      if (!messageDoc.exists()) {
        throw new Error('Message not found');
      }
      
      const messageData = messageDoc.data();
      
      // Only allow the sender to delete their own message
      if (messageData.senderId !== userId) {
        throw new Error('You can only delete your own messages');
      }
      
      const conversationId = messageData.conversationId;
      
      // Delete the message
      await deleteDoc(messageRef);
      
      // Update conversation's lastMessage with the most recent remaining message
      const remainingMessagesQuery = query(
        collection(db, MESSAGES_COLLECTION),
        where('conversationId', '==', conversationId),
        orderBy('timestamp', 'desc'),
        limit(1)
      );
      
      const remainingMessagesSnapshot = await getDocs(remainingMessagesQuery);
      const conversationRef = doc(db, CONVERSATIONS_COLLECTION, conversationId);
      
      if (remainingMessagesSnapshot.empty) {
        // No messages left, clear lastMessage
        await updateDoc(conversationRef, {
          lastMessage: null,
          lastMessageTime: null
        });
      } else {
        // Update with the most recent remaining message
        const latestMessage = remainingMessagesSnapshot.docs[0].data();
        await updateDoc(conversationRef, {
          lastMessage: latestMessage.content,
          lastMessageTime: latestMessage.timestamp
        });
      }
    } catch (error) {
      console.error('Error deleting message:', error);
      throw error;
    }
  },


};

// Conversation Operations
export const conversationService = {
  // Create a new conversation
  async createConversation(
    participants: Participant[],
    propertyId?: string,
    propertyTitle?: string
  ): Promise<string> {
    try {
      const participantIds = participants.map(p => p.id);
      const conversationData = {
        participants,
        participantIds,
        lastMessageTime: Timestamp.now(),
        unreadCount: 0,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
        ...(propertyId && { propertyId }),
        ...(propertyTitle && { propertyTitle }),
      };

      const docRef = await addDoc(collection(db, CONVERSATIONS_COLLECTION), conversationData);
      return docRef.id;
    } catch (error) {
      console.error('Error creating conversation:', error);
      throw error;
    }
  },

  // Get conversations for a user
  async getUserConversations(userId: string): Promise<Conversation[]> {
    try {
      const q = query(
        collection(db, CONVERSATIONS_COLLECTION),
        where('participantIds', 'array-contains', userId),
        orderBy('lastMessageTime', 'desc')
      );

      const querySnapshot = await getDocs(q);
      const conversations: Conversation[] = [];

      querySnapshot.forEach((doc) => {
        const data = doc.data();
        conversations.push({
          id: doc.id,
          ...data,
          lastMessageTime: convertTimestamp(data.lastMessageTime),
          createdAt: convertTimestamp(data.createdAt),
          updatedAt: convertTimestamp(data.updatedAt),
          ...(data.lastMessage && {
            lastMessage: {
              ...data.lastMessage,
              timestamp: convertTimestamp(data.lastMessage.timestamp),
            },
          }),
        } as Conversation);
      });

      return conversations;
    } catch (error) {
      console.error('Error getting user conversations:', error);
      throw error;
    }
  },

  // Find existing conversation between participants
  async findConversation(participantIds: string[]): Promise<Conversation | null> {
    try {
      const q = query(
        collection(db, CONVERSATIONS_COLLECTION),
        where('participants', 'array-contains-any', participantIds.map(id => ({ id })))
      );

      const querySnapshot = await getDocs(q);
      
      for (const doc of querySnapshot.docs) {
        const data = doc.data();
        const conversation = data as DocumentData;
        
        // Check if all participant IDs match
        const conversationParticipantIds = conversation.participants.map((p: Participant) => p.id);
        const hasAllParticipants = participantIds.every(id => conversationParticipantIds.includes(id));
        
        if (hasAllParticipants && conversationParticipantIds.length === participantIds.length) {
          return {
            id: doc.id,
            ...data,
            lastMessageTime: convertTimestamp(data.lastMessageTime),
            createdAt: convertTimestamp(data.createdAt),
            updatedAt: convertTimestamp(data.updatedAt),
            ...(data.lastMessage && {
              lastMessage: {
                ...data.lastMessage,
                timestamp: convertTimestamp(data.lastMessage.timestamp),
              },
            }),
          } as Conversation;
        }
      }
      
      return null;
    } catch (error) {
      console.error('Error finding conversation:', error);
      throw error;
    }
  },

  // Subscribe to user conversations in real-time
  subscribeToUserConversations(
    userId: string,
    callback: (conversations: Conversation[]) => void
  ): () => void {
    const q = query(
      collection(db, CONVERSATIONS_COLLECTION),
      where('participantIds', 'array-contains', userId),
      orderBy('lastMessageTime', 'desc')
    );

    return onSnapshot(q, (querySnapshot) => {
      const conversations: Conversation[] = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        conversations.push({
          id: doc.id,
          ...data,
          lastMessageTime: convertTimestamp(data.lastMessageTime),
          createdAt: convertTimestamp(data.createdAt),
          updatedAt: convertTimestamp(data.updatedAt),
          ...(data.lastMessage && {
            lastMessage: {
              ...data.lastMessage,
              timestamp: convertTimestamp(data.lastMessage.timestamp),
            },
          }),
        } as Conversation);
      });
      callback(conversations);
    });
  },

  // Update unread count
  async updateUnreadCount(conversationId: string, count: number): Promise<void> {
    try {
      const conversationRef = doc(db, CONVERSATIONS_COLLECTION, conversationId);
      await updateDoc(conversationRef, {
        unreadCount: count,
        updatedAt: Timestamp.now(),
      });
    } catch (error) {
      console.error('Error updating unread count:', error);
      throw error;
    }
  },

  // Create a new conversation between an agent and another user
  async createNewConversation(
    agentId: string,
    agentName: string,
    otherUserId: string,
    otherUserName: string,
    otherUserType: 'tenant' | 'landlord',
    propertyId?: string,
    propertyTitle?: string
  ): Promise<string> {
    try {
      // Check if conversation already exists
      const existingConversation = await this.findConversation([agentId, otherUserId]);
      if (existingConversation) {
        return existingConversation.id;
      }

      // Fetch user data for both participants
      const [agentData, otherUserData] = await Promise.all([
        getUserById(agentId),
        getUserById(otherUserId)
      ]);

      if (!agentData || !otherUserData) {
        throw new Error('Unable to fetch user data for participants');
      }

      // Create participants array with complete user data
      const participants: Participant[] = [
        {
          id: agentId,
          name: `${agentData.firstName} ${agentData.lastName}`,
          email: agentData.email,
          type: 'agent',
          avatar: agentData.profilePicture
        },
        {
          id: otherUserId,
          name: `${otherUserData.firstName} ${otherUserData.lastName}`,
          email: otherUserData.email,
          type: otherUserType,
          avatar: otherUserData.profilePicture
        }
      ];

      // Create new conversation
      const conversationId = await this.createConversation(
        participants,
        propertyId,
        propertyTitle
      );
      
      return conversationId;
    } catch (error) {
      console.error('Error creating new conversation:', error);
      throw error;
    }
  },

  // Delete a conversation
  async deleteConversation(conversationId: string, userId: string): Promise<void> {
    try {
      const conversationRef = doc(db, CONVERSATIONS_COLLECTION, conversationId);
      const conversationDoc = await getDoc(conversationRef);
      
      if (!conversationDoc.exists()) {
        throw new Error('Conversation not found');
      }
      
      const conversationData = conversationDoc.data();
      
      // Check if user is a participant in the conversation
      const isParticipant = conversationData.participantIds?.includes(userId);
      if (!isParticipant) {
        throw new Error('You can only delete conversations you are part of');
      }
      
      // Delete all messages in the conversation first
      const messagesQuery = query(
        collection(db, MESSAGES_COLLECTION),
        where('conversationId', '==', conversationId)
      );
      
      const messagesSnapshot = await getDocs(messagesQuery);
      const batch = writeBatch(db);
      
      // Add all message deletions to batch
      messagesSnapshot.docs.forEach((doc) => {
        batch.delete(doc.ref);
      });
      
      // Add conversation deletion to batch
      batch.delete(conversationRef);
      
      // Execute all deletions
      await batch.commit();
    } catch (error) {
      console.error('Error deleting conversation:', error);
      throw error;
    }
  },
};

// Export the createNewConversation function separately for easier import
export const createNewConversation = conversationService.createNewConversation.bind(conversationService);