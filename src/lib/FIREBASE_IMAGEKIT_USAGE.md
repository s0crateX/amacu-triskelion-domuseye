# Firebase and ImageKit Integration

This document explains how to use the Firebase and ImageKit configurations in your DomusEye application.

## Firebase Usage

### Authentication
```typescript
import { auth } from '@/lib/firebase';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';

// Sign in user
const signIn = async (email: string, password: string) => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    return userCredential.user;
  } catch (error) {
    console.error('Sign in error:', error);
    throw error;
  }
};

// Create new user
const signUp = async (email: string, password: string) => {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    return userCredential.user;
  } catch (error) {
    console.error('Sign up error:', error);
    throw error;
  }
};
```

### Firestore Database
```typescript
import { db } from '@/lib/firebase';
import { collection, addDoc, getDocs, doc, getDoc } from 'firebase/firestore';

// Add document
const addProperty = async (propertyData: any) => {
  try {
    const docRef = await addDoc(collection(db, 'properties'), propertyData);
    return docRef.id;
  } catch (error) {
    console.error('Error adding property:', error);
    throw error;
  }
};

// Get documents
const getProperties = async () => {
  try {
    const querySnapshot = await getDocs(collection(db, 'properties'));
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error('Error getting properties:', error);
    throw error;
  }
};
```

### Storage
```typescript
import { storage } from '@/lib/firebase';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

// Upload file
const uploadImage = async (file: File, path: string) => {
  try {
    const storageRef = ref(storage, path);
    const snapshot = await uploadBytes(storageRef, file);
    const downloadURL = await getDownloadURL(snapshot.ref);
    return downloadURL;
  } catch (error) {
    console.error('Error uploading image:', error);
    throw error;
  }
};
```

## ImageKit Usage

### Client-side React Component
```typescript
import { IKImage, IKUpload } from 'imagekitio-react';
import { getImageKitClientConfig } from '@/lib/imagekit';

const ImageComponent = () => {
  const config = getImageKitClientConfig();

  return (
    <div>
      {/* Display optimized image */}
      <IKImage
        urlEndpoint={config.urlEndpoint}
        path="/property-images/sample.jpg"
        transformation={[{
          height: 300,
          width: 400,
          crop: 'maintain_ratio'
        }]}
        alt="Property image"
      />

      {/* Upload component */}
      <IKUpload
        publicKey={config.publicKey}
        urlEndpoint={config.urlEndpoint}
        onError={(error) => console.error('Upload error:', error)}
        onSuccess={(response) => console.log('Upload success:', response)}
      />
    </div>
  );
};
```

### Server-side API Route
```typescript
// pages/api/imagekit-auth.ts or app/api/imagekit-auth/route.ts
import ImageKit from 'imagekit';
import { getImageKitServerConfig } from '@/lib/imagekit';

const imagekit = new ImageKit(getImageKitServerConfig());

export async function POST() {
  try {
    const authenticationParameters = imagekit.getAuthenticationParameters();
    return Response.json(authenticationParameters);
  } catch (error) {
    return Response.json({ error: 'Authentication failed' }, { status: 500 });
  }
}
```

## Environment Variables

Make sure to set up your environment variables in `.env.local`:

```env
# Firebase Configuration
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_auth_domain
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_storage_bucket
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=your_measurement_id

# ImageKit Configuration
NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY=your_public_key
IMAGEKIT_PRIVATE_KEY=your_private_key
NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT=your_url_endpoint
```

## Security Notes

- Firebase API keys are safe to expose in client-side code as they identify your project, not authenticate users
- ImageKit public key is safe to expose, but keep the private key secure on the server
- Use Firebase Security Rules to protect your data
- Use ImageKit's access control features for sensitive images