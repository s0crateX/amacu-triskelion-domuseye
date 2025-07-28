import ImageKit from 'imagekit';
import { getImageKitServerConfig } from '@/lib/imagekit';

const imagekit = new ImageKit(getImageKitServerConfig());

export async function POST() {
  try {
    const authenticationParameters = imagekit.getAuthenticationParameters();
    return Response.json(authenticationParameters);
  } catch (error) {
    console.error('ImageKit authentication error:', error);
    return Response.json({ error: 'Authentication failed' }, { status: 500 });
  }
}