import {
  collection,
  query,
  where,
  getDocs,
  orderBy,
  limit,
  Timestamp,
  onSnapshot,
  doc,
  updateDoc,
  getDoc
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Property } from '@/types/property';
import { Conversation, Participant } from '@/types/message';

export interface AgentStats {
  totalProperties: number;
  verifiedProperties: number;
  pendingProperties: number;
  rejectedProperties: number;
  activeClients: number;
  totalMessages: number;
  unreadMessages: number;
  monthlyViews: number;
  monthlyInquiries: number;
  conversionRate: number;
}

export interface PropertyPerformance {
  id: string;
  title: string;
  views: number;
  inquiries: number;
  applications: number;
  lastActivity: Date;
  status: string;
}

export interface ClientActivity {
  clientId: string;
  clientName: string;
  clientEmail: string;
  clientType: 'tenant' | 'landlord';
  lastInteraction: Date;
  totalMessages: number;
  activeConversations: number;
  profilePicture?: string;
}

/**
 * Get comprehensive analytics for an agent
 */
export const getAgentAnalytics = async (agentId: string): Promise<AgentStats> => {
  try {
    // Get all properties handled/verified by this agent
    const propertiesQuery = query(
      collection(db, 'properties'),
      where('verifiedBy', '==', agentId)
    );
    const propertiesSnapshot = await getDocs(propertiesQuery);
    const properties = propertiesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Property));

    // Calculate property statistics
    const totalProperties = properties.length;
    const verifiedProperties = properties.filter(p => p.status === 'verified').length;
    const pendingProperties = properties.filter(p => p.status === 'pending').length;
    const rejectedProperties = properties.filter(p => p.status === 'rejected').length;

    // Get conversations where agent is a participant
    const conversationsQuery = query(
      collection(db, 'conversations'),
      where('participantIds', 'array-contains', agentId)
    );
    const conversationsSnapshot = await getDocs(conversationsQuery);
    const conversations = conversationsSnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        participants: data.participants || [],
        participantIds: data.participantIds || [],
        lastMessageTime: data.lastMessageTime || new Date(),
        unreadCount: data.unreadCount || 0,
        createdAt: data.createdAt || new Date(),
        updatedAt: data.updatedAt || new Date(),
        lastMessage: data.lastMessage,
        propertyId: data.propertyId,
        propertyTitle: data.propertyTitle,
        hiddenFrom: data.hiddenFrom,
        deletedBy: data.deletedBy,
        deletionHistory: data.deletionHistory
      } as Conversation;
    });

    // Calculate client and message statistics
    const uniqueClients = new Set();
    let totalMessages = 0;
    let unreadMessages = 0;

    for (const conversation of conversations) {
      // Add other participants as clients
      conversation.participants?.forEach((participant: Participant) => {
        if (participant.id !== agentId) {
          uniqueClients.add(participant.id);
        }
      });

      // Get messages for this conversation
      const messagesQuery = query(
        collection(db, 'messages'),
        where('conversationId', '==', conversation.id)
      );
      const messagesSnapshot = await getDocs(messagesQuery);
      totalMessages += messagesSnapshot.size;

      // Count unread messages (messages not sent by agent and not read)
      messagesSnapshot.docs.forEach(messageDoc => {
        const message = messageDoc.data();
        if (message.senderId !== agentId && !message.readBy?.includes(agentId)) {
          unreadMessages++;
        }
      });
    }

    // Calculate monthly statistics
    const currentMonth = new Date();
    currentMonth.setDate(1);
    currentMonth.setHours(0, 0, 0, 0);

    let monthlyViews = 0;
    let monthlyInquiries = 0;

    // Get monthly views and inquiries for agent's properties
    for (const property of properties) {
      // For now, we'll use the views field directly
      // In a real implementation, you'd have a separate analytics collection
      monthlyViews += property.views || 0;
      monthlyInquiries += property.inquiries || 0;
    }

    // Calculate conversion rate (applications / inquiries)
    const conversionRate = monthlyInquiries > 0 ? (monthlyInquiries * 0.15) / monthlyInquiries : 0; // Assuming 15% conversion

    return {
      totalProperties,
      verifiedProperties,
      pendingProperties,
      rejectedProperties,
      activeClients: uniqueClients.size,
      totalMessages,
      unreadMessages,
      monthlyViews,
      monthlyInquiries,
      conversionRate: Math.round(conversionRate * 100) / 100
    };
  } catch (error) {
    console.error('Error fetching agent analytics:', error);
    throw error;
  }
};

/**
 * Get property performance data for an agent
 */
export const getPropertyPerformance = async (agentId: string, limit_count: number = 10): Promise<PropertyPerformance[]> => {
  try {
    const propertiesQuery = query(
      collection(db, 'properties'),
      where('verifiedBy', '==', agentId),
      orderBy('views', 'desc'),
      limit(limit_count)
    );
    
    const snapshot = await getDocs(propertiesQuery);
    
    const performanceData: PropertyPerformance[] = [];
    
    for (const doc of snapshot.docs) {
      const property = { id: doc.id, ...doc.data() } as Property;
      
      // Get applications count for this property
      const applicationsQuery = query(
        collection(db, 'applications'),
        where('propertyId', '==', property.id)
      );
      const applicationsSnapshot = await getDocs(applicationsQuery);
      
      performanceData.push({
        id: property.id,
        title: property.title,
        views: property.views || 0,
        inquiries: property.inquiries || 0,
        applications: applicationsSnapshot.size,
        lastActivity: property.updatedAt ? new Date(property.updatedAt as string) : new Date(),
        status: property.status
      });
    }
    
    return performanceData;
  } catch (error) {
    console.error('Error fetching property performance:', error);
    throw error;
  }
};

/**
 * Get active client information for an agent
 */
export const getActiveClients = async (agentId: string, limit_count: number = 10): Promise<ClientActivity[]> => {
  try {
    const conversationsQuery = query(
      collection(db, 'conversations'),
      where('participantIds', 'array-contains', agentId),
      orderBy('lastMessageTime', 'desc')
    );
    
    const conversationsSnapshot = await getDocs(conversationsQuery);
    const clientMap = new Map<string, ClientActivity>();
    
    for (const conversationDoc of conversationsSnapshot.docs) {
      const conversationData = conversationDoc.data();
      const conversation: Conversation = {
        id: conversationDoc.id,
        participants: conversationData.participants || [],
        participantIds: conversationData.participantIds || [],
        lastMessageTime: conversationData.lastMessageTime || new Date(),
        unreadCount: conversationData.unreadCount || 0,
        createdAt: conversationData.createdAt || new Date(),
        updatedAt: conversationData.updatedAt || new Date(),
        lastMessage: conversationData.lastMessage,
        propertyId: conversationData.propertyId,
        propertyTitle: conversationData.propertyTitle,
        hiddenFrom: conversationData.hiddenFrom,
        deletedBy: conversationData.deletedBy,
        deletionHistory: conversationData.deletionHistory
      };
      
      // Find the other participant (client)
      const otherParticipant = conversation.participants?.find((p: Participant) => p.id !== agentId);
      
      if (otherParticipant) {
        const clientId = otherParticipant.id;
        const lastInteractionTime = conversation.lastMessageTime instanceof Timestamp ? conversation.lastMessageTime.toDate() : (conversation.lastMessageTime instanceof Date ? conversation.lastMessageTime : new Date());
        
        // Count messages in this conversation
        const messagesQuery = query(
          collection(db, 'messages'),
          where('conversationId', '==', conversation.id)
        );
        const messagesSnapshot = await getDocs(messagesQuery);
        const messageCount = messagesSnapshot.size;
        
        if (clientMap.has(clientId)) {
          // Update existing client data
          const existingClient = clientMap.get(clientId)!;
          existingClient.totalMessages += messageCount;
          existingClient.activeConversations += 1;
          
          // Update last interaction if this conversation is more recent
          if (lastInteractionTime > existingClient.lastInteraction) {
            existingClient.lastInteraction = lastInteractionTime;
          }
        } else {
          // Get client details for new client
          const clientDoc = await getDoc(doc(db, 'users', clientId));
          const clientData = clientDoc.data();
          
          if (clientData) {
            clientMap.set(clientId, {
              clientId: clientId,
              clientName: `${clientData.firstName} ${clientData.lastName}`,
              clientEmail: clientData.email,
              clientType: clientData.userType,
              lastInteraction: lastInteractionTime,
              totalMessages: messageCount,
              activeConversations: 1,
              profilePicture: clientData.profilePicture
            });
          }
        }
      }
    }
    
    // Convert map to array and sort by last interaction
    const clientActivities = Array.from(clientMap.values())
      .sort((a, b) => b.lastInteraction.getTime() - a.lastInteraction.getTime())
      .slice(0, limit_count);
    
    return clientActivities;
  } catch (error) {
    console.error('Error fetching active clients:', error);
    throw error;
  }
};

/**
 * Update property status (approve, reject, handle)
 */
export const updatePropertyStatus = async (
  propertyId: string,
  agentId: string,
  agentName: string,
  status: 'verified' | 'rejected' | 'handling',
  reason?: string
): Promise<void> => {
  try {
    const propertyRef = doc(db, 'properties', propertyId);
    const updateData: {
      status: string;
      updatedAt: Timestamp;
      verifiedBy?: string;
      verifiedByName?: string;
      verifiedAt?: Timestamp;
      rejectedBy?: string;
      rejectedByName?: string;
      rejectedAt?: Timestamp;
      rejectionReason?: string;
      handledBy?: string;
      handledByName?: string;
      handledAt?: Timestamp;
    } = {
      status,
      updatedAt: Timestamp.now()
    };

    if (status === 'verified') {
      updateData.verifiedBy = agentId;
      updateData.verifiedByName = agentName;
      updateData.verifiedAt = Timestamp.now();
    } else if (status === 'rejected') {
      updateData.rejectedBy = agentId;
      updateData.rejectedByName = agentName;
      updateData.rejectedAt = Timestamp.now();
      if (reason) {
        updateData.rejectionReason = reason;
      }
    } else if (status === 'handling') {
      updateData.handledBy = agentId;
      updateData.handledByName = agentName;
      updateData.handledAt = Timestamp.now();
    }

    await updateDoc(propertyRef, updateData);
  } catch (error) {
    console.error('Error updating property status:', error);
    throw error;
  }
};

/**
 * Subscribe to real-time agent analytics
 */
export const subscribeToAgentAnalytics = (
  agentId: string,
  callback: (stats: AgentStats) => void
) => {
  // Subscribe to properties changes
  const propertiesQuery = query(
    collection(db, 'properties'),
    where('verifiedBy', '==', agentId)
  );
  
  return onSnapshot(propertiesQuery, async () => {
    try {
      const stats = await getAgentAnalytics(agentId);
      callback(stats);
    } catch (error) {
      console.error('Error in analytics subscription:', error);
    }
  });
};