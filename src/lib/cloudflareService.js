import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
  ListObjectsV2Command,
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

/**
 * Upload image to Cloudflare R2 with organized folder structure
 * @param {File} file - The file to upload
 * @param {string} category - Category: 'photo_gallery', 'home_hero', 'sevas', 'videos', 'other'
 * @param {string} customPath - Optional custom path, if not provided will auto-generate
 * @returns {Promise<{success: boolean, url?: string, error?: any, mock?: boolean}>}
 */
export const uploadImage = async (
  file,
  category = "other",
  customPath = null,
) => {
  if (!r2) {
    console.warn("R2 is not configured. Returning mock success.");
    return {
      success: true,
      url: URL.createObjectURL(file), // Local blob URL for preview
      mock: true,
    };
  }

  // Validate file type
  if (!file.type.startsWith("image/")) {
    return { success: false, error: { message: "File must be an image" } };
  }

  // Generate organized path: category/YYYY/MM/timestamp_filename
  let path = customPath;
  if (!path) {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const timestamp = Date.now();
    const sanitizedFileName = file.name.replace(/[^a-zA-Z0-9.-]/g, "_");
    path = `${category}/${year}/${month}/${timestamp}_${sanitizedFileName}`;
  }

  try {
    const arrayBuffer = await file.arrayBuffer();
    const command = new PutObjectCommand({
      Bucket: import.meta.env.VITE_R2_BUCKET_NAME,
      Key: path,
      Body: new Uint8Array(arrayBuffer),
      ContentType: file.type,
    });

    await r2.send(command);
    const publicUrl = `${import.meta.env.VITE_R2_PUBLIC_URL}/${path}`;
    return { success: true, url: publicUrl, path };
  } catch (error) {
    console.error("Error uploading to R2:", error);
    return { success: false, error };
  }
};

/**
 * Upload video to Cloudflare R2
 * @param {File} file - The video file to upload
 * @param {string} category - Category: 'video_gallery', 'home', 'other'
 * @param {Function} onProgress - Progress callback (percentage)
 * @returns {Promise<{success: boolean, url?: string, error?: any}>}
 */
export const uploadVideo = async (
  file,
  category = "video_gallery",
  onProgress = null,
) => {
  if (!r2) {
    console.warn("R2 is not configured. Returning mock success.");
    return {
      success: true,
      url: URL.createObjectURL(file),
      mock: true,
    };
  }

  // Validate file type
  if (!file.type.startsWith("video/")) {
    return { success: false, error: { message: "File must be a video" } };
  }

  // Generate path
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const timestamp = Date.now();
  const sanitizedFileName = file.name.replace(/[^a-zA-Z0-9.-]/g, "_");
  const path = `${category}/${year}/${month}/${timestamp}_${sanitizedFileName}`;

  try {
    const arrayBuffer = await file.arrayBuffer();

    // For large files, we could implement multipart upload
    // For now, using simple upload
    const command = new PutObjectCommand({
      Bucket: import.meta.env.VITE_R2_BUCKET_NAME,
      Key: path,
      Body: new Uint8Array(arrayBuffer),
      ContentType: file.type,
    });

    await r2.send(command);

    if (onProgress) onProgress(100);

    const publicUrl = `${import.meta.env.VITE_R2_PUBLIC_URL}/${path}`;
    return { success: true, url: publicUrl, path };
  } catch (error) {
    console.error("Error uploading video to R2:", error);
    return { success: false, error };
  }
};

/**
 * Delete file from Cloudflare R2
 * @param {string} path - The path/key of the file to delete
 * @returns {Promise<{success: boolean, error?: any}>}
 */
export const deleteFile = async (path) => {
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

/**
 * List files in a specific category/prefix
 * @param {string} prefix - The prefix to list (e.g., 'photo_gallery/')
 * @returns {Promise<{success: boolean, files?: Array, error?: any}>}
 */
export const listFiles = async (prefix = "") => {
  if (!r2) {
    console.warn("R2 is not configured. Returning empty list.");
    return { success: true, files: [], mock: true };
  }

  const command = new ListObjectsV2Command({
    Bucket: import.meta.env.VITE_R2_BUCKET_NAME,
    Prefix: prefix,
  });

  try {
    const response = await r2.send(command);
    const files = (response.Contents || []).map((item) => ({
      key: item.Key,
      size: item.Size,
      lastModified: item.LastModified,
      url: `${import.meta.env.VITE_R2_PUBLIC_URL}/${item.Key}`,
    }));
    return { success: true, files };
  } catch (error) {
    console.error("Error listing files from R2:", error);
    return { success: false, error };
  }
};

/**
 * Bulk upload multiple files
 * @param {Array<File>} files - Array of files to upload
 * @param {string} category - Category for all files
 * @param {Function} onProgress - Progress callback (current, total)
 * @returns {Promise<Array<{file: File, success: boolean, url?: string, error?: any}>>}
 */
export const bulkUpload = async (files, category, onProgress = null) => {
  const results = [];

  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    const isVideo = file.type.startsWith("video/");
    const uploadFn = isVideo ? uploadVideo : uploadImage;

    const result = await uploadFn(file, category);
    results.push({ file, ...result });

    if (onProgress) {
      onProgress(i + 1, files.length);
    }
  }

  return results;
};

// Legacy export for backward compatibility
export const deleteImage = deleteFile;

export default r2;
