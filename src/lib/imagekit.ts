// ImageKit configuration
export const imageKitConfig = {
  publicKey: process.env.NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY || "public_rXn5iH9r3Oe5OyPB43pyMIt+o08=",
  privateKey: process.env.IMAGEKIT_PRIVATE_KEY || "private_N+n1Pb9oCUVG5DsMAHNKfOZdX70=",
  urlEndpoint: process.env.NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT || "https://ik.imagekit.io/domuseye",
};

// ImageKit client configuration for server-side usage
export const getImageKitServerConfig = () => ({
  publicKey: imageKitConfig.publicKey,
  privateKey: imageKitConfig.privateKey,
  urlEndpoint: imageKitConfig.urlEndpoint,
});

// ImageKit client configuration for client-side usage
export const getImageKitClientConfig = () => ({
  publicKey: imageKitConfig.publicKey,
  urlEndpoint: imageKitConfig.urlEndpoint,
});

export default imageKitConfig;