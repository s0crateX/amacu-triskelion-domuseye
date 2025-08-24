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
import { Message, Conversation, MessageInput, Participant, DeletionRecord } from '@/types/message';
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
  // Send a new message with permission validation
  async sendMessage(
    conversationId: string,
    senderId: string,
    senderName: string,
    senderType: 'agent' | 'landlord' | 'tenant',
    messageInput: MessageInput
  ): Promise<string> {
    try {
      // Validate that the sender is part of the conversation
      const conversationDoc = await getDoc(doc(db, CONVERSATIONS_COLLECTION, conversationId));
      if (!conversationDoc.exists()) {
        throw new Error('Conversation not found');
      }

      const conversation = conversationDoc.data() as Conversation;
      const isParticipant = conversation.participants.some(p => p.id === senderId);
      
      if (!isParticipant) {
        throw new Error('User is not a participant in this conversation');
      }

      // Validate conversation permissions between participants
      const otherParticipant = conversation.participants.find(p => p.id !== senderId);
      if (otherParticipant) {
        const isValidConversation = conversationService.validateConversationPermissions(senderType, otherParticipant.type);
        if (!isValidConversation) {
          throw new Error(`${senderType} users cannot send messages to ${otherParticipant.type} users`);
        }
      }

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

      // Check if this is the first message in the conversation BEFORE adding it
      // If so, make conversation visible to other participants
      await this.makeConversationVisibleOnFirstMessage(conversationId, senderId);
      
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

  // Make conversation visible to other participants when first message is sent
  async makeConversationVisibleOnFirstMessage(conversationId: string, senderId: string): Promise<void> {
    try {
      const conversationRef = doc(db, CONVERSATIONS_COLLECTION, conversationId);
      const conversationDoc = await getDoc(conversationRef);
      
      if (!conversationDoc.exists()) {
        return;
      }
      
      const conversationData = conversationDoc.data();
      const currentHiddenFrom = conversationData.hiddenFrom || [];
      
      // Check if there are any existing messages in this conversation
      const messagesQuery = query(
        collection(db, MESSAGES_COLLECTION),
        where('conversationId', '==', conversationId),
        limit(1)
      );
      
      const existingMessages = await getDocs(messagesQuery);
      
      // If this is the first message, remove other participants from hiddenFrom
      if (existingMessages.size === 0) {
        const updatedHiddenFrom = currentHiddenFrom.filter((userId: string) => userId === senderId);
        
        await updateDoc(conversationRef, {
          hiddenFrom: updatedHiddenFrom,
          updatedAt: Timestamp.now()
        });
      }
    } catch (error) {
      console.error('Error making conversation visible:', error);
      // Don't throw error to avoid breaking message sending
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

  // Get unread message count for a user
  async getUnreadMessageCount(userId: string): Promise<number> {
    try {
      // Get all unread messages where user is not the sender
      const unreadMessagesQuery = query(
        collection(db, MESSAGES_COLLECTION),
        where('senderId', '!=', userId),
        where('read', '==', false)
      );
      
      const unreadMessagesSnapshot = await getDocs(unreadMessagesQuery);
      
      // Get user's conversations to filter messages
      const conversationsQuery = query(
        collection(db, CONVERSATIONS_COLLECTION),
        where('participantIds', 'array-contains', userId)
      );
      
      const conversationsSnapshot = await getDocs(conversationsQuery);
      const userConversationIds = new Set(conversationsSnapshot.docs.map(doc => doc.id));
      
      // Count unread messages in user's conversations
      let totalUnreadCount = 0;
      unreadMessagesSnapshot.forEach((messageDoc) => {
        const messageData = messageDoc.data();
        if (userConversationIds.has(messageData.conversationId)) {
          totalUnreadCount++;
        }
      });
      
      return totalUnreadCount;
    } catch (error) {
      console.error('Error getting unread message count:', error);
      return 0;
    }
  },

  // Subscribe to unread message count changes
  subscribeToUnreadCount(
    userId: string,
    callback: (count: number) => void
  ): () => void {
    // Listen to messages where the user is not the sender and messages are unread
    const unreadMessagesQuery = query(
      collection(db, MESSAGES_COLLECTION),
      where('senderId', '!=', userId),
      where('read', '==', false)
    );
    
    const unsubscribeMessages = onSnapshot(unreadMessagesQuery, async (messagesSnapshot) => {
      // Get user's conversations to filter messages
      const conversationsQuery = query(
        collection(db, CONVERSATIONS_COLLECTION),
        where('participantIds', 'array-contains', userId)
      );
      
      const conversationsSnapshot = await getDocs(conversationsQuery);
      const userConversationIds = new Set(conversationsSnapshot.docs.map(doc => doc.id));
      
      // Count unread messages in user's conversations
      let totalUnreadCount = 0;
      messagesSnapshot.forEach((messageDoc) => {
        const messageData = messageDoc.data();
        if (userConversationIds.has(messageData.conversationId)) {
          totalUnreadCount++;
        }
      });
      
      callback(totalUnreadCount);
    });
    
    return unsubscribeMessages;
  },


};

// Conversation Operations
export const conversationService = {
  // Create a new conversation
  async createConversation(
    participants: Participant[],
    propertyId?: string,
    propertyTitle?: string,
    creatorId?: string
  ): Promise<string> {
    try {
      const participantIds = participants.map(p => p.id);
      
      // Initially hide conversation from other participants (not the creator)
      // This ensures conversations only appear to others after first message is sent
      const hiddenFrom = creatorId ? participantIds.filter(id => id !== creatorId) : [];
      
      const conversationData = {
        participants,
        participantIds,
        lastMessageTime: Timestamp.now(),
        unreadCount: 0,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
        hiddenFrom, // Hide from other participants initially
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

  // Get conversations for a user (filtered by hiddenFrom)
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
        
        // Filter out conversations hidden by the current user
        const hiddenFrom = data.hiddenFrom || [];
        if (!hiddenFrom.includes(userId)) {
          conversations.push({
            id: doc.id,
            ...data,
            lastMessageTime: convertTimestamp(data.lastMessageTime),
            createdAt: convertTimestamp(data.createdAt),
            updatedAt: convertTimestamp(data.updatedAt),
            hiddenFrom: data.hiddenFrom || [],
            deletionHistory: data.deletionHistory ? data.deletionHistory.map((record: DeletionRecord) => ({
              ...record,
              timestamp: convertTimestamp(record.timestamp)
            })) : [],
            ...(data.lastMessage && {
              lastMessage: {
                ...data.lastMessage,
                timestamp: convertTimestamp(data.lastMessage.timestamp),
              },
            }),
          } as Conversation);
        }
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

  // Subscribe to user conversations in real-time (filtered by hiddenFrom)
  subscribeToUserConversations(
    userId: string,
    callback: (conversations: Conversation[]) => void
  ): () => void {
    const q = query(
      collection(db, CONVERSATIONS_COLLECTION),
      where('participantIds', 'array-contains', userId),
      orderBy('lastMessageTime', 'desc')
    );

    return onSnapshot(q, async (querySnapshot) => {
      const conversations: Conversation[] = [];
      
      // Process each conversation and calculate unread count
      for (const docSnapshot of querySnapshot.docs) {
        const data = docSnapshot.data();
        
        // Filter out conversations hidden by the current user
        const hiddenFrom = data.hiddenFrom || [];
        if (!hiddenFrom.includes(userId)) {
          // Calculate unread count for this conversation
          const unreadMessagesQuery = query(
            collection(db, MESSAGES_COLLECTION),
            where('conversationId', '==', docSnapshot.id),
            where('senderId', '!=', userId),
            where('read', '==', false)
          );
          
          const unreadSnapshot = await getDocs(unreadMessagesQuery);
          const unreadCount = unreadSnapshot.size;
          
          conversations.push({
            id: docSnapshot.id,
            ...data,
            unreadCount, // Use calculated unread count
            lastMessageTime: convertTimestamp(data.lastMessageTime),
            createdAt: convertTimestamp(data.createdAt),
            updatedAt: convertTimestamp(data.updatedAt),
            hiddenFrom: data.hiddenFrom || [],
            deletionHistory: data.deletionHistory ? data.deletionHistory.map((record: DeletionRecord) => ({
              ...record,
              timestamp: convertTimestamp(record.timestamp)
            })) : [],
            ...(data.lastMessage && {
              lastMessage: {
                ...data.lastMessage,
                timestamp: convertTimestamp(data.lastMessage.timestamp),
              },
            }),
          } as Conversation);
        }
      }
      
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

  // Create a new conversation between any two users with permission validation
  async createNewConversation(
    userId: string,
    userName: string,
    otherUserId: string,
    otherUserName: string,
    otherUserType: 'agent' | 'tenant' | 'landlord',
    propertyId?: string,
    propertyTitle?: string
  ): Promise<string> {
    try {
      // Check if conversation already exists
      const existingConversation = await this.findConversation([userId, otherUserId]);
      if (existingConversation) {
        return existingConversation.id;
      }

      // Fetch user data for both participants
      const [userData, otherUserData] = await Promise.all([
        getUserById(userId),
        getUserById(otherUserId)
      ]);

      if (!userData || !otherUserData) {
        throw new Error('Unable to fetch user data for participants');
      }

      // Validate conversation permissions
      const userType = userData.userType as 'agent' | 'tenant' | 'landlord';
      const isValidConversation = this.validateConversationPermissions(userType, otherUserType);
      
      if (!isValidConversation) {
        throw new Error(`${userType} users cannot start conversations with ${otherUserType} users`);
      }

      // Create participants array with complete user data
      const participants: Participant[] = [
        {
          id: userId,
          name: `${userData.firstName} ${userData.lastName}`,
          email: userData.email,
          type: userType,
          avatar: userData.profilePicture || null
        },
        {
          id: otherUserId,
          name: `${otherUserData.firstName} ${otherUserData.lastName}`,
          email: otherUserData.email,
          type: otherUserType,
          avatar: otherUserData.profilePicture || null
        }
      ];

      // Create new conversation (initially hidden from other user)
      const conversationId = await this.createConversation(
        participants,
        propertyId,
        propertyTitle,
        userId // Pass creator ID to hide conversation from other user initially
      );
      
      return conversationId;
    } catch (error) {
      console.error('Error creating new conversation:', error);
      throw error;
    }
  },

  // Validate conversation permissions based on user types
  validateConversationPermissions(
    userType: 'agent' | 'tenant' | 'landlord',
    otherUserType: 'agent' | 'tenant' | 'landlord'
  ): boolean {
    // Define allowed conversation patterns
    const allowedConversations = {
      agent: ['tenant', 'landlord'], // Agents can message tenants and landlords
      tenant: ['agent', 'landlord'], // Tenants can message agents and landlords
      landlord: ['agent', 'tenant']  // Landlords can message agents and tenants
    };

    return allowedConversations[userType]?.includes(otherUserType) || false;
  },

  // Role-based conversation deletion
  async deleteConversation(conversationId: string, userId: string, userType: 'agent' | 'landlord' | 'tenant'): Promise<void> {
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
      
      // Implement dual-deletion logic for all users (agents, tenants, and landlords)
      const currentDeletedBy = conversationData.deletedBy || [];
      const currentHiddenFrom = conversationData.hiddenFrom || [];
      const currentDeletionHistory = conversationData.deletionHistory || [];
      
      // Add user to deletedBy array if not already present
      if (!currentDeletedBy.includes(userId)) {
        const updatedDeletedBy = [...currentDeletedBy, userId];
        
        // Hide conversation from user's view
        const updatedHiddenFrom = currentHiddenFrom.includes(userId) 
          ? currentHiddenFrom 
          : [...currentHiddenFrom, userId];
        
        // Create deletion record for audit purposes
        const deletionRecord: DeletionRecord = {
          userId,
          userType,
          action: 'hide',
          timestamp: new Date(),
          reason: `Conversation marked for deletion by ${userType}`
        };
        
        const updatedDeletionHistory = [...currentDeletionHistory, deletionRecord];
        
        // Update conversation with deletion tracking
        await updateDoc(conversationRef, {
          deletedBy: updatedDeletedBy,
          hiddenFrom: updatedHiddenFrom,
          deletionHistory: updatedDeletionHistory,
          updatedAt: Timestamp.now()
        });
        
        // Check if both users have now marked the conversation for deletion
        await this.checkAndPermanentlyDelete(conversationId, updatedDeletedBy, conversationData.participantIds);
      }
    } catch (error) {
      console.error('Error deleting conversation:', error);
      throw error;
    }
  },

  // Hide conversation from specific user's view (for tenants)
  async hideConversation(conversationId: string, userId: string, userType: 'agent' | 'landlord' | 'tenant'): Promise<void> {
    try {
      const conversationRef = doc(db, CONVERSATIONS_COLLECTION, conversationId);
      const conversationDoc = await getDoc(conversationRef);
      
      if (!conversationDoc.exists()) {
        throw new Error('Conversation not found');
      }
      
      const conversationData = conversationDoc.data();
      const currentHiddenFrom = conversationData.hiddenFrom || [];
      const currentDeletionHistory = conversationData.deletionHistory || [];
      
      // Add user to hiddenFrom array if not already present
      if (!currentHiddenFrom.includes(userId)) {
        const updatedHiddenFrom = [...currentHiddenFrom, userId];
        
        // Create deletion record for audit purposes
        const deletionRecord: DeletionRecord = {
          userId,
          userType,
          action: 'hide',
          timestamp: new Date(),
          reason: `Conversation hidden by ${userType}`
        };
        
        const updatedDeletionHistory = [...currentDeletionHistory, deletionRecord];
        
        await updateDoc(conversationRef, {
          hiddenFrom: updatedHiddenFrom,
          deletionHistory: updatedDeletionHistory,
          updatedAt: Timestamp.now()
        });
      }
    } catch (error) {
      console.error('Error hiding conversation:', error);
      throw error;
    }
  },

  // Permanently delete conversation (for agents only)
  // Check if both users have marked conversation for deletion and permanently delete if so
  async checkAndPermanentlyDelete(conversationId: string, deletedBy: string[], participantIds: string[]): Promise<void> {
    try {
      // Check if all participants have marked the conversation for deletion
      const allParticipantsDeleted = participantIds.every(participantId => 
        deletedBy.includes(participantId)
      );
      
      if (allParticipantsDeleted && participantIds.length > 0) {
        // All participants have requested deletion - permanently delete the conversation
        const conversationRef = doc(db, CONVERSATIONS_COLLECTION, conversationId);
        const conversationDoc = await getDoc(conversationRef);
        
        if (conversationDoc.exists()) {
          const conversationData = conversationDoc.data();
          const currentDeletionHistory = conversationData.deletionHistory || [];
          
          // Create final deletion record
          const finalDeletionRecord: DeletionRecord = {
            userId: 'system',
            userType: 'agent',
            action: 'permanent_delete',
            timestamp: new Date(),
            reason: 'Conversation permanently deleted - all participants requested deletion'
          };
          
          const updatedDeletionHistory = [...currentDeletionHistory, finalDeletionRecord];
          
          // Update conversation with final deletion record before deleting
          await updateDoc(conversationRef, {
            deletionHistory: updatedDeletionHistory,
            updatedAt: Timestamp.now()
          });
          
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
        }
      }
    } catch (error) {
      console.error('Error checking and permanently deleting conversation:', error);
      throw error;
    }
  },

  async permanentlyDeleteConversation(conversationId: string, userId: string, userType: 'agent' | 'landlord' | 'tenant'): Promise<void> {
    try {
      const conversationRef = doc(db, CONVERSATIONS_COLLECTION, conversationId);
      const conversationDoc = await getDoc(conversationRef);
      
      if (!conversationDoc.exists()) {
        throw new Error('Conversation not found');
      }
      
      // Only agents can permanently delete
      if (userType !== 'agent') {
        throw new Error('Only agents can permanently delete conversations');
      }
      
      const conversationData = conversationDoc.data();
      const currentDeletionHistory = conversationData.deletionHistory || [];
      
      // Create deletion record for audit purposes
      const deletionRecord: DeletionRecord = {
        userId,
        userType,
        action: 'permanent_delete',
        timestamp: new Date(),
        reason: 'Conversation permanently deleted by agent'
      };
      
      const updatedDeletionHistory = [...currentDeletionHistory, deletionRecord];
      
      // Update conversation with deletion record before deleting
      await updateDoc(conversationRef, {
        deletionHistory: updatedDeletionHistory,
        updatedAt: Timestamp.now()
      });
      
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
      console.error('Error permanently deleting conversation:', error);
      throw error;
    }
  },
};

// Export the createNewConversation function separately for easier import
export const createNewConversation = conversationService.createNewConversation.bind(conversationService);