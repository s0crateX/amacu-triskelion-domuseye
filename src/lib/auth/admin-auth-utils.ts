import {
  signInWithEmailAndPassword,
  signOut,
  createUserWithEmailAndPassword,
  updateProfile,
} from "firebase/auth";
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { doc, getDoc, setDoc, deleteDoc, collection, getDocs } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";

export interface AdminData {
  uid: string;
  email: string;
  displayName: string;
  role: string;
  isActive: boolean;
  lastLogin: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface AdminLoginData {
  email: string;
  password: string;
}

export interface AgentData {
  uid: string;
  email: string;
  firstName: string;
  lastName: string;
  phone: string;
  userType: "agent";
  businessAddress: string;
  companyName: string;
  dateOfBirth: string;
  isOnline: boolean;
  lastSeen: string;
  profilePicture: string;
  propertyCount: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateAgentData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  password: string;
  companyName?: string;
  dateOfBirth?: string;
}

export interface UserDocument {
  id: string;
  uid: string;
  email: string;
  firstName: string;
  lastName: string;
  phone: string;
  userType: "tenant" | "landlord" | "agent";
  profilePicture?: string;
  createdAt: Date;
  updatedAt: Date;
  isOnline?: boolean;
  lastSeen?: string;
  companyName?: string;
  businessAddress?: string;
  currentAddress?: string;
  employmentStatus?: string;
  propertyCount?: string;
  dateOfBirth?: string;
}

// Login admin user
export const loginAdmin = async (
  loginData: AdminLoginData
): Promise<AdminData> => {
  try {
    const userCredential = await signInWithEmailAndPassword(
      auth,
      loginData.email,
      loginData.password
    );

    const user = userCredential.user;

    // Get admin data from Firestore admin collection
    const adminDoc = await getDoc(doc(db, "admin", user.uid));

    if (!adminDoc.exists()) {
      throw new Error("Admin account not found");
    }

    const adminData = adminDoc.data() as AdminData;

    // Check if admin is active
    if (!adminData.isActive) {
      throw new Error("Admin account is deactivated");
    }

    // Update last login timestamp
    await setDoc(
      doc(db, "admin", user.uid),
      {
        ...adminData,
        lastLogin: new Date(),
        updatedAt: new Date(),
      },
      { merge: true }
    );

    return {
      ...adminData,
      lastLogin: new Date(),
    };
  } catch (error: unknown) {
    console.error("Admin login error:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Admin login failed";
    throw new Error(errorMessage);
  }
};

// Get current admin data
export const getCurrentAdminData = async (
  uid: string
): Promise<AdminData | null> => {
  try {
    const adminDoc = await getDoc(doc(db, "admin", uid));

    if (!adminDoc.exists()) {
      return null;
    }

    return adminDoc.data() as AdminData;
  } catch (error) {
    console.error("Error fetching admin data:", error);
    return null;
  }
};

// Logout admin
export const logoutAdmin = async (): Promise<void> => {
  try {
    await signOut(auth);
  } catch (error: unknown) {
    console.error("Admin logout error:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Logout failed";
    throw new Error(errorMessage);
  }
};

// Get all users (tenants, landlords, agents)
export const getAllUsers = async (): Promise<UserDocument[]> => {
  try {
    const usersSnapshot = await getDocs(collection(db, "users"));
    const users = usersSnapshot.docs.map(
      (doc) =>
        ({
          id: doc.id,
          ...doc.data(),
        } as UserDocument)
    );
    return users;
  } catch (error) {
    console.error("Error fetching users:", error);
    throw new Error("Failed to fetch users");
  }
};

// Create new agent account
export const createAgentAccount = async (
  agentData: CreateAgentData
): Promise<AgentData> => {
  try {
    // Create a secondary Firebase app instance for agent creation
    // This prevents interfering with the admin's authentication state
    const secondaryApp = initializeApp(
      {
        apiKey:
          process.env.NEXT_PUBLIC_FIREBASE_API_KEY ||
          "AIzaSyCi28iY-aw-kBgisXuPYD61Rc0l6UP4UvY",
        authDomain:
          process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN ||
          "domuseye.firebaseapp.com",
        projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "domuseye",
        storageBucket:
          process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET ||
          "domuseye.firebasestorage.app",
        messagingSenderId:
          process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID ||
          "799708891427",
        appId:
          process.env.NEXT_PUBLIC_FIREBASE_APP_ID ||
          "1:799708891427:web:c473b3e4633ca063c3e496",
        measurementId:
          process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID || "G-QM0PEX81ZV",
      },
      `secondary-${Date.now()}`
    );

    const secondaryAuth = getAuth(secondaryApp);

    // Create user with email and password using secondary auth
    const userCredential = await createUserWithEmailAndPassword(
      secondaryAuth,
      agentData.email,
      agentData.password
    );

    const user = userCredential.user;

    // Update user profile with display name
    await updateProfile(user, {
      displayName: `${agentData.firstName} ${agentData.lastName}`,
    });

    // Prepare agent data for Firestore
    const firestoreAgentData: AgentData = {
      uid: user.uid,
      email: agentData.email,
      firstName: agentData.firstName,
      lastName: agentData.lastName,
      phone: agentData.phone,
      userType: "agent",
      businessAddress: "Purok 4, Saliganan St. Brgy. Apopong G.S.C",
      companyName: agentData.companyName || "",
      dateOfBirth: agentData.dateOfBirth || "",
      isOnline: false,
      lastSeen: "",
      profilePicture: "",
      propertyCount: "",
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    // Save agent data to Firestore users collection (using main db instance)
    await setDoc(doc(db, "users", user.uid), firestoreAgentData);

    // Sign out from secondary auth
    await signOut(secondaryAuth);

    return firestoreAgentData;
  } catch (error: unknown) {
    console.error("Agent creation error:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Agent creation failed";
    throw new Error(errorMessage);
  }
};

// Get users by type
export const getUsersByType = async (
  userType: "tenant" | "landlord" | "agent"
): Promise<UserDocument[]> => {
  try {
    const usersSnapshot = await getDocs(collection(db, "users"));
    const users = usersSnapshot.docs
      .map(
        (doc) =>
          ({
            id: doc.id,
            ...doc.data(),
          } as UserDocument)
      )
      .filter((user: UserDocument) => user.userType === userType);
    return users;
  } catch (error) {
    console.error(`Error fetching ${userType}s:`, error);
    throw new Error(`Failed to fetch ${userType}s`);
  }
};

// Get user statistics
export const getUserStatistics = async () => {
  try {
    const usersSnapshot = await getDocs(collection(db, "users"));
    const users = usersSnapshot.docs.map((doc) => doc.data() as UserDocument);

    const stats = {
      total: users.length,
      tenants: users.filter((user: UserDocument) => user.userType === "tenant")
        .length,
      landlords: users.filter(
        (user: UserDocument) => user.userType === "landlord"
      ).length,
      agents: users.filter((user: UserDocument) => user.userType === "agent")
        .length,
    };

    return stats;
  } catch (error) {
    console.error("Error fetching user statistics:", error);
    throw new Error("Failed to fetch user statistics");
  }
};

// Delete agent account with security measures
export const deleteAgentAccount = async (
  agentId: string,
  confirmationText: string
): Promise<void> => {
  try {
    // Security check: Ensure confirmation text matches
    if (confirmationText !== "DELETE AGENT") {
      throw new Error("Invalid confirmation text. Please type 'DELETE AGENT' to confirm.");
    }

    // Verify the user exists and is an agent
    const userDoc = await getDoc(doc(db, "users", agentId));
    
    if (!userDoc.exists()) {
      throw new Error("Agent account not found");
    }

    const userData = userDoc.data() as UserDocument;
    
    if (userData.userType !== "agent") {
      throw new Error("Cannot delete: User is not an agent account");
    }

    // Delete the agent document from Firestore
    await deleteDoc(doc(db, "users", agentId));

    console.log(`Agent account ${userData.email} has been successfully deleted`);
  } catch (error: unknown) {
    console.error("Agent deletion error:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Failed to delete agent account";
    throw new Error(errorMessage);
  }
};
