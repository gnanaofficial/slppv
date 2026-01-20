import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
} from "@aws-sdk/client-s3";

// Helper to check if R2 is configured
const isR2Configured = () => {
  return (
    import.meta.env.VITE_R2_ENDPOINT &&
    import.meta.env.VITE_R2_ACCESS_KEY_ID &&
    import.meta.env.VITE_R2_SECRET_ACCESS_KEY &&
    import.meta.env.VITE_R2_BUCKET_NAME
  );
};

let r2 = null;
if (isR2Configured()) {
  r2 = new S3Client({
    region: "auto",
    endpoint: import.meta.env.VITE_R2_ENDPOINT,
    credentials: {
      accessKeyId: import.meta.env.VITE_R2_ACCESS_KEY_ID,
      secretAccessKey: import.meta.env.VITE_R2_SECRET_ACCESS_KEY,
    },
  });
}

export const uploadImage = async (file, path) => {
  if (!r2) {
    console.warn("R2 is not configured. Returning mock success.");
    return {
      success: true,
      url: URL.createObjectURL(file), // Local blob URL for preview
      mock: true,
    };
  }

  const arrayBuffer = await file.arrayBuffer();
  const command = new PutObjectCommand({
    Bucket: import.meta.env.VITE_R2_BUCKET_NAME,
    Key: path,
    Body: new Uint8Array(arrayBuffer),
    ContentType: file.type,
  });

  try {
    await r2.send(command);
    // Construct public URL. Requires setup of custom domain or public bucket access.
    // Assuming custom domain is set in ENV.
    const publicUrl = `${import.meta.env.VITE_R2_PUBLIC_URL}/${path}`;
    return { success: true, url: publicUrl };
  } catch (error) {
    console.error("Error uploading to R2:", error);
    return { success: false, error };
  }
};

export const deleteImage = async (path) => {
  if (!r2) {
    console.warn("R2 is not configured. Mocking delete.");
    return { success: true, mock: true };
  }
  const command = new DeleteObjectCommand({
    Bucket: import.meta.env.VITE_R2_BUCKET_NAME,
    Key: path,
  });
  try {
    await r2.send(command);
    return { success: true };
  } catch (error) {
    console.error("Error deleting from R2:", error);
    return { success: false, error };
  }
};

export default r2;
