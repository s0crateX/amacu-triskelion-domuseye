import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut, 
  User,
  updateProfile
} from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';

export interface UserData {
  uid: string;
  email: string;
  firstName: string;
  lastName: string;
  phone: string;
  userType: 'tenant' | 'landlord';
  // Tenant specific
  currentAddress?: string;
  employmentStatus?: string;
  // Landlord specific
  companyName?: string;
  businessAddress?: string;
  propertyCount?: string;
  // Metadata
  createdAt: Date;
  updatedAt: Date;
}

export interface RegisterData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  password: string;
  userType: 'tenant' | 'landlord';
  // Optional fields
  currentAddress?: string;
  employmentStatus?: string;
  companyName?: string;
  businessAddress?: string;
  propertyCount?: string;
}

export interface LoginData {
  email: string;
  password: string;
}

// Register new user
export const registerUser = async (userData: RegisterData): Promise<UserData> => {
  try {
    // Create user with email and password
    const userCredential = await createUserWithEmailAndPassword(
      auth, 
      userData.email, 
      userData.password
    );
    
    const user = userCredential.user;

    // Update user profile with display name
    await updateProfile(user, {
      displayName: `${userData.firstName} ${userData.lastName}`
    });

    // Prepare user data for Firestore
    const firestoreUserData: UserData = {
      uid: user.uid,
      email: userData.email,
      firstName: userData.firstName,
      lastName: userData.lastName,
      phone: userData.phone,
      userType: userData.userType,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    // Add type-specific fields
    if (userData.userType === 'tenant') {
      firestoreUserData.currentAddress = userData.currentAddress || '';
      firestoreUserData.employmentStatus = userData.employmentStatus || '';
    } else if (userData.userType === 'landlord') {
      firestoreUserData.companyName = userData.companyName || '';
      firestoreUserData.businessAddress = userData.businessAddress || '';
      firestoreUserData.propertyCount = userData.propertyCount || '';
    }

    // Save user data to Firestore
    await setDoc(doc(db, 'users', user.uid), firestoreUserData);

    return firestoreUserData;
  } catch (error: unknown) {
    console.error('Registration error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Registration failed';
    throw new Error(errorMessage);
  }
};

// Login user
export const loginUser = async (loginData: LoginData): Promise<UserData> => {
  try {
    const userCredential = await signInWithEmailAndPassword(
      auth, 
      loginData.email, 
      loginData.password
    );
    
    const user = userCredential.user;

    // Get user data from Firestore
    const userDoc = await getDoc(doc(db, 'users', user.uid));
    
    if (!userDoc.exists()) {
      throw new Error('User data not found');
    }

    const userData = userDoc.data() as UserData;
    
    // Update last login timestamp
    await setDoc(doc(db, 'users', user.uid), {
      ...userData,
      updatedAt: new Date()
    }, { merge: true });

    return userData;
  } catch (error: unknown) {
    console.error('Login error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Login failed';
    throw new Error(errorMessage);
  }
};

// Logout user
export const logoutUser = async (): Promise<void> => {
  try {
    await signOut(auth);
  } catch (error: unknown) {
    console.error('Logout error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Logout failed';
    throw new Error(errorMessage);
  }
};

// Get current user data
export const getCurrentUserData = async (user: User): Promise<UserData | null> => {
  try {
    const userDoc = await getDoc(doc(db, 'users', user.uid));
    
    if (!userDoc.exists()) {
      return null;
    }

    return userDoc.data() as UserData;
  } catch (error: unknown) {
    console.error('Get user data error:', error);
    return null;
  }
};

// Update user data
export const updateUserData = async (uid: string, updates: Partial<UserData>): Promise<void> => {
  try {
    await setDoc(doc(db, 'users', uid), {
      ...updates,
      updatedAt: new Date()
    }, { merge: true });
  } catch (error: unknown) {
    console.error('Update user data error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Update failed';
    throw new Error(errorMessage);
  }
};