import { collection, query, where, getDocs, orderBy, limit } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { UserData } from '@/lib/auth/auth-utils';

export interface SearchUser {
  uid: string;
  firstName: string;
  lastName: string;
  email: string;
  userType: 'tenant' | 'landlord' | 'agent';
  profilePicture?: string;
}

/**
 * Search for users (tenants and landlords) by name
 * @param searchTerm - The search term to match against first name, last name, or email
 * @param userTypes - Array of user types to search for (default: ['tenant', 'landlord'])
 * @param maxResults - Maximum number of results to return (default: 10)
 * @returns Promise<SearchUser[]>
 */
export const searchUsers = async (
  searchTerm: string,
  userTypes: ('tenant' | 'landlord' | 'agent')[] = ['tenant', 'landlord'],
  maxResults: number = 10
): Promise<SearchUser[]> => {
  if (!searchTerm.trim()) {
    return [];
  }

  const users: SearchUser[] = [];
  const usersRef = collection(db, 'users');
  
  try {
    // Search by user type and order by firstName
    for (const userType of userTypes) {
      const q = query(
        usersRef,
        where('userType', '==', userType),
        orderBy('firstName'),
        limit(maxResults)
      );
      
      const querySnapshot = await getDocs(q);
      
      querySnapshot.forEach((doc) => {
        const userData = doc.data() as UserData;
        const fullName = `${userData.firstName} ${userData.lastName}`.toLowerCase();
        const searchLower = searchTerm.toLowerCase();
        
        // Check if search term matches first name, last name, full name, or email
        if (
          userData.firstName.toLowerCase().includes(searchLower) ||
          userData.lastName.toLowerCase().includes(searchLower) ||
          fullName.includes(searchLower) ||
          userData.email.toLowerCase().includes(searchLower)
        ) {
          users.push({
            uid: userData.uid,
            firstName: userData.firstName,
            lastName: userData.lastName,
            email: userData.email,
            userType: userData.userType,
            profilePicture: userData.profilePicture
          });
        }
      });
    }
    
    // Remove duplicates and limit results
    const uniqueUsers = users.filter((user, index, self) => 
      index === self.findIndex(u => u.uid === user.uid)
    );
    
    return uniqueUsers.slice(0, maxResults);
  } catch (error) {
    console.error('Error searching users:', error);
    throw error;
  }
};

/**
 * Get user details by UID
 * @param uid - User ID
 * @returns Promise<SearchUser | null>
 */
export const getUserById = async (uid: string): Promise<SearchUser | null> => {
  try {
    const usersRef = collection(db, 'users');
    const q = query(usersRef, where('uid', '==', uid), limit(1));
    const querySnapshot = await getDocs(q);
    
    if (querySnapshot.empty) {
      return null;
    }
    
    const userData = querySnapshot.docs[0].data() as UserData;
    return {
      uid: userData.uid,
      firstName: userData.firstName,
      lastName: userData.lastName,
      email: userData.email,
      userType: userData.userType,
      profilePicture: userData.profilePicture
    };
  } catch (error) {
    console.error('Error getting user by ID:', error);
    throw error;
  }
};