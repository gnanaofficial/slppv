import { S3Client, PutObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";
import { Upload } from "@aws-sdk/lib-storage";

/**
 * Upload Service for Cloudflare R2
 * Handles image uploads, compression, and deletion using R2 S3-compatible API
 */

// Initialize R2 Client
const r2Client = new S3Client({
    region: "auto",
    endpoint: import.meta.env.VITE_R2_ENDPOINT,
    credentials: {
        accessKeyId: import.meta.env.VITE_R2_ACCESS_KEY_ID,
        secretAccessKey: import.meta.env.VITE_R2_SECRET_ACCESS_KEY,
    },
});

const BUCKET_NAME = import.meta.env.VITE_R2_BUCKET_NAME;
const PUBLIC_URL = import.meta.env.VITE_R2_PUBLIC_URL;

/**
 * Compress image before upload
 * @param {File} file - Image file to compress
 * @param {number} maxWidth - Maximum width (default 1920)
 * @param {number} quality - Quality 0-1 (default 0.8)
 * @returns {Promise<Blob>} Compressed image blob
 */
export const compressImage = async (file, maxWidth = 1920, quality = 0.8) => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);

        reader.onload = (event) => {
            const img = new Image();
            img.src = event.target.result;

            img.onload = () => {
                const canvas = document.createElement("canvas");
                let width = img.width;
                let height = img.height;

                // Calculate new dimensions
                if (width > maxWidth) {
                    height = (height * maxWidth) / width;
                    width = maxWidth;
                }

                canvas.width = width;
                canvas.height = height;

                const ctx = canvas.getContext("2d");
                ctx.drawImage(img, 0, 0, width, height);

                canvas.toBlob(
                    (blob) => {
                        resolve(blob);
                    },
                    "image/jpeg",
                    quality
                );
            };

            img.onerror = reject;
        };

        reader.onerror = reject;
    });
};

/**
 * Validate image file
 * @param {File} file - File to validate
 * @returns {Object} { valid: boolean, error: string }
 */
export const validateImage = (file) => {
    const validTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
    const maxSize = 5 * 1024 * 1024; // 5MB

    if (!validTypes.includes(file.type)) {
        return {
            valid: false,
            error: "Invalid file type. Please upload JPG, PNG, or WebP images.",
        };
    }

    if (file.size > maxSize) {
        return {
            valid: false,
            error: "File size too large. Maximum size is 5MB.",
        };
    }

    return { valid: true, error: null };
};

/**
 * Upload image to Cloudflare R2
 * @param {File} file - Image file to upload
 * @param {string} path - Storage path (e.g., 'hero-images', 'sevas', 'gallery')
 * @param {Function} onProgress - Progress callback (percent)
 * @returns {Promise<string>} Public URL
 */
export const uploadImage = async (file, path, onProgress = null) => {
    try {
        // Validate file
        const validation = validateImage(file);
        if (!validation.valid) {
            throw new Error(validation.error);
        }

        // Compress image
        console.log("Compressing image...");
        const compressedBlob = await compressImage(file);

        // Generate unique filename
        const timestamp = Date.now();
        const randomString = Math.random().toString(36).substring(7);
        const extension = "jpg"; // Always use jpg since we compress to JPEG
        const filename = `${timestamp}_${randomString}.${extension}`;
        const key = `${path}/${filename}`;

        console.log("Uploading to Cloudflare R2...");

        // Convert blob to Uint8Array for upload
        const arrayBuffer = await compressedBlob.arrayBuffer();
        const uint8Array = new Uint8Array(arrayBuffer);

        // Upload to R2 using multipart upload for progress tracking
        const upload = new Upload({
            client: r2Client,
            params: {
                Bucket: BUCKET_NAME,
                Key: key,
                Body: uint8Array,
                ContentType: "image/jpeg",
            },
        });

        // Track progress
        upload.on("httpUploadProgress", (progress) => {
            if (progress.loaded && progress.total) {
                const percent = (progress.loaded / progress.total) * 100;
                console.log(`Upload progress: ${percent.toFixed(2)}%`);
                if (onProgress) {
                    onProgress(percent);
                }
            }
        });

        // Wait for upload to complete
        await upload.done();

        // Construct public URL
        const publicUrl = `${PUBLIC_URL}/${key}`;
        console.log("Upload successful! URL:", publicUrl);

        return publicUrl;
    } catch (error) {
        console.error("Error in uploadImage:", error);
        throw error;
    }
};

/**
 * Delete image from Cloudflare R2
 * @param {string} imageUrl - Full public URL of the image
 * @returns {Promise<boolean>} Success status
 */
export const deleteImage = async (imageUrl) => {
    try {
        if (!imageUrl) {
            return false;
        }

        // Extract key from public URL
        // URL format: https://pub-xxx.r2.dev/path/filename.jpg
        const urlObj = new URL(imageUrl);
        const key = urlObj.pathname.substring(1); // Remove leading slash

        if (!key) {
            console.error("Invalid R2 URL");
            return false;
        }

        // Delete from R2
        const command = new DeleteObjectCommand({
            Bucket: BUCKET_NAME,
            Key: key,
        });

        await r2Client.send(command);

        console.log("Image deleted successfully:", key);
        return true;
    } catch (error) {
        console.error("Error deleting image:", error);
        // Don't throw error, just return false
        // Image might already be deleted or URL might be invalid
        return false;
    }
};

/**
 * Upload multiple images
 * @param {FileList|Array} files - Files to upload
 * @param {string} path - Storage path
 * @param {Function} onProgress - Progress callback
 * @returns {Promise<Array<string>>} Array of public URLs
 */
export const uploadMultipleImages = async (files, path, onProgress = null) => {
    const uploadPromises = Array.from(files).map((file, index) => {
        return uploadImage(file, path, (progress) => {
            if (onProgress) {
                onProgress(index, progress);
            }
        });
    });

    return Promise.all(uploadPromises);
};

export default {
    uploadImage,
    deleteImage,
    uploadMultipleImages,
    compressImage,
    validateImage,
};
