import { storage } from "./firebase";
import {
    ref,
    uploadBytesResumable,
    getDownloadURL,
    deleteObject,
} from "firebase/storage";

/**
 * Upload Service for Firebase Storage
 * Handles image uploads, compression, and deletion
 */

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
 * Upload image to Firebase Storage
 * @param {File} file - Image file to upload
 * @param {string} path - Storage path (e.g., 'hero-images', 'sevas')
 * @param {Function} onProgress - Progress callback (percent)
 * @returns {Promise<string>} Download URL
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
        const extension = file.name.split(".").pop();
        const filename = `${timestamp}_${randomString}.${extension}`;

        // Create storage reference
        const storageRef = ref(storage, `${path}/${filename}`);

        // Upload file
        console.log("Uploading to Firebase Storage...");
        const uploadTask = uploadBytesResumable(storageRef, compressedBlob);

        return new Promise((resolve, reject) => {
            uploadTask.on(
                "state_changed",
                (snapshot) => {
                    // Progress tracking
                    const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                    console.log(`Upload progress: ${progress.toFixed(2)}%`);

                    if (onProgress) {
                        onProgress(progress);
                    }
                },
                (error) => {
                    // Error handling
                    console.error("Upload error:", error);
                    reject(error);
                },
                async () => {
                    // Upload completed successfully
                    try {
                        const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
                        console.log("Upload successful! URL:", downloadURL);
                        resolve(downloadURL);
                    } catch (error) {
                        reject(error);
                    }
                }
            );
        });
    } catch (error) {
        console.error("Error in uploadImage:", error);
        throw error;
    }
};

/**
 * Delete image from Firebase Storage
 * @param {string} imageUrl - Full download URL of the image
 * @returns {Promise<boolean>} Success status
 */
export const deleteImage = async (imageUrl) => {
    try {
        if (!imageUrl) {
            return false;
        }

        // Extract path from URL
        // URL format: https://firebasestorage.googleapis.com/v0/b/{bucket}/o/{path}?alt=media&token={token}
        const urlParts = imageUrl.split("/o/");
        if (urlParts.length < 2) {
            console.error("Invalid Firebase Storage URL");
            return false;
        }

        const pathWithToken = urlParts[1];
        const path = decodeURIComponent(pathWithToken.split("?")[0]);

        // Create reference and delete
        const imageRef = ref(storage, path);
        await deleteObject(imageRef);

        console.log("Image deleted successfully:", path);
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
 * @returns {Promise<Array<string>>} Array of download URLs
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
