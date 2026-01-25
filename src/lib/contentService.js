import { db } from "./firebase";
import {
    collection,
    doc,
    getDoc,
    getDocs,
    setDoc,
    updateDoc,
    deleteDoc,
    query,
    orderBy,
    where,
} from "firebase/firestore";

/**
 * Content Service for managing dynamic content
 * Handles hero images, sevas, testimonials, etc.
 */

// Cache for content
const contentCache = new Map();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

/**
 * Clear content cache
 */
export const clearContentCache = () => {
    contentCache.clear();
};

// ==================== HERO IMAGES ====================

/**
 * Get all hero images
 * @returns {Promise<Array>} Array of hero image objects
 */
export const getHeroImages = async () => {
    try {
        // Check cache
        const cacheKey = "hero_images";
        const cached = contentCache.get(cacheKey);
        if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
            return cached.data;
        }

        // Fetch from Firestore
        const q = query(
            collection(db, "hero_images"),
            where("enabled", "==", true),
            orderBy("order", "asc")
        );

        const snapshot = await getDocs(q);
        const images = [];

        snapshot.forEach((doc) => {
            images.push({
                id: doc.id,
                ...doc.data(),
            });
        });

        // Update cache
        contentCache.set(cacheKey, {
            data: images,
            timestamp: Date.now(),
        });

        return images;
    } catch (error) {
        console.error("Error fetching hero images:", error);
        return [];
    }
};

/**
 * Get all hero images (including disabled) for admin
 * @returns {Promise<Array>} Array of all hero image objects
 */
export const getAllHeroImages = async () => {
    try {
        const q = query(collection(db, "hero_images"), orderBy("order", "asc"));
        const snapshot = await getDocs(q);
        const images = [];

        snapshot.forEach((doc) => {
            images.push({
                id: doc.id,
                ...doc.data(),
            });
        });

        return images;
    } catch (error) {
        console.error("Error fetching all hero images:", error);
        return [];
    }
};

/**
 * Add new hero image
 * @param {Object} imageData - Image data
 * @returns {Promise<string>} Document ID
 */
export const addHeroImage = async (imageData) => {
    try {
        const docRef = doc(collection(db, "hero_images"));

        await setDoc(docRef, {
            ...imageData,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        });

        clearContentCache();
        return docRef.id;
    } catch (error) {
        console.error("Error adding hero image:", error);
        throw error;
    }
};

/**
 * Update hero image
 * @param {string} id - Document ID
 * @param {Object} updates - Fields to update
 * @returns {Promise<boolean>} Success status
 */
export const updateHeroImage = async (id, updates) => {
    try {
        const docRef = doc(db, "hero_images", id);

        await updateDoc(docRef, {
            ...updates,
            updatedAt: new Date().toISOString(),
        });

        clearContentCache();
        return true;
    } catch (error) {
        console.error("Error updating hero image:", error);
        throw error;
    }
};

/**
 * Delete hero image
 * @param {string} id - Document ID
 * @returns {Promise<boolean>} Success status
 */
export const deleteHeroImage = async (id) => {
    try {
        const docRef = doc(db, "hero_images", id);
        await deleteDoc(docRef);

        clearContentCache();
        return true;
    } catch (error) {
        console.error("Error deleting hero image:", error);
        throw error;
    }
};

/**
 * Reorder hero images
 * @param {Array} images - Array of images with updated order
 * @returns {Promise<boolean>} Success status
 */
export const reorderHeroImages = async (images) => {
    try {
        const updatePromises = images.map((image, index) => {
            const docRef = doc(db, "hero_images", image.id);
            return updateDoc(docRef, {
                order: index,
                updatedAt: new Date().toISOString(),
            });
        });

        await Promise.all(updatePromises);
        clearContentCache();
        return true;
    } catch (error) {
        console.error("Error reordering hero images:", error);
        throw error;
    }
};

// ==================== SEVAS ====================

/**
 * Get all sevas
 * @returns {Promise<Array>} Array of seva objects
 */
export const getSevas = async () => {
    try {
        // Check cache
        const cacheKey = "sevas";
        const cached = contentCache.get(cacheKey);
        if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
            return cached.data;
        }

        // Fetch from Firestore
        const q = query(
            collection(db, "sevas"),
            where("enabled", "==", true),
            orderBy("order", "asc")
        );

        const snapshot = await getDocs(q);
        const sevas = [];

        snapshot.forEach((doc) => {
            sevas.push({
                id: doc.id,
                ...doc.data(),
            });
        });

        // Update cache
        contentCache.set(cacheKey, {
            data: sevas,
            timestamp: Date.now(),
        });

        return sevas;
    } catch (error) {
        console.error("Error fetching sevas:", error);
        return [];
    }
};

/**
 * Get all sevas (including disabled) for admin
 * @returns {Promise<Array>} Array of all seva objects
 */
export const getAllSevas = async () => {
    try {
        const q = query(collection(db, "sevas"), orderBy("order", "asc"));
        const snapshot = await getDocs(q);
        const sevas = [];

        snapshot.forEach((doc) => {
            sevas.push({
                id: doc.id,
                ...doc.data(),
            });
        });

        return sevas;
    } catch (error) {
        console.error("Error fetching all sevas:", error);
        return [];
    }
};

/**
 * Add new seva
 * @param {Object} sevaData - Seva data
 * @returns {Promise<string>} Document ID
 */
export const addSeva = async (sevaData) => {
    try {
        const docRef = doc(collection(db, "sevas"));

        await setDoc(docRef, {
            ...sevaData,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        });

        clearContentCache();
        return docRef.id;
    } catch (error) {
        console.error("Error adding seva:", error);
        throw error;
    }
};

/**
 * Update seva
 * @param {string} id - Document ID
 * @param {Object} updates - Fields to update
 * @returns {Promise<boolean>} Success status
 */
export const updateSeva = async (id, updates) => {
    try {
        const docRef = doc(db, "sevas", id);

        await updateDoc(docRef, {
            ...updates,
            updatedAt: new Date().toISOString(),
        });

        clearContentCache();
        return true;
    } catch (error) {
        console.error("Error updating seva:", error);
        throw error;
    }
};

/**
 * Delete seva
 * @param {string} id - Document ID
 * @returns {Promise<boolean>} Success status
 */
export const deleteSeva = async (id) => {
    try {
        const docRef = doc(db, "sevas", id);
        await deleteDoc(docRef);

        clearContentCache();
        return true;
    } catch (error) {
        console.error("Error deleting seva:", error);
        throw error;
    }
};

/**
 * Reorder sevas
 * @param {Array} sevas - Array of sevas with updated order
 * @returns {Promise<boolean>} Success status
 */
export const reorderSevas = async (sevas) => {
    try {
        const updatePromises = sevas.map((seva, index) => {
            const docRef = doc(db, "sevas", seva.id);
            return updateDoc(docRef, {
                order: index,
                updatedAt: new Date().toISOString(),
            });
        });

        await Promise.all(updatePromises);
        clearContentCache();
        return true;
    } catch (error) {
        console.error("Error reordering sevas:", error);
        throw error;
    }
};

// ==================== GALLERY IMAGES ====================

/**
 * Get gallery images (enabled only, optionally filtered by category)
 * @param {string|null} category - Optional category filter
 * @returns {Promise<Array>} Array of gallery image objects
 */
export const getGalleryImages = async (category = null) => {
    try {
        // Check cache
        const cacheKey = category ? `gallery_images_${category}` : "gallery_images";
        const cached = contentCache.get(cacheKey);
        if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
            return cached.data;
        }

        // Build query
        let q;
        if (category) {
            q = query(
                collection(db, "gallery_images"),
                where("enabled", "==", true),
                where("category", "==", category),
                orderBy("order", "asc")
            );
        } else {
            q = query(
                collection(db, "gallery_images"),
                where("enabled", "==", true),
                orderBy("order", "asc")
            );
        }

        const snapshot = await getDocs(q);
        const images = [];

        snapshot.forEach((doc) => {
            images.push({
                id: doc.id,
                ...doc.data(),
            });
        });

        // Update cache
        contentCache.set(cacheKey, {
            data: images,
            timestamp: Date.now(),
        });

        return images;
    } catch (error) {
        console.error("Error fetching gallery images:", error);
        return [];
    }
};

/**
 * Get all gallery images (including disabled) for admin
 * @returns {Promise<Array>} Array of all gallery image objects
 */
export const getAllGalleryImages = async () => {
    try {
        const q = query(collection(db, "gallery_images"), orderBy("order", "asc"));
        const snapshot = await getDocs(q);
        const images = [];

        snapshot.forEach((doc) => {
            images.push({
                id: doc.id,
                ...doc.data(),
            });
        });

        return images;
    } catch (error) {
        console.error("Error fetching all gallery images:", error);
        return [];
    }
};

/**
 * Add new gallery image
 * @param {Object} imageData - Image data
 * @returns {Promise<string>} Document ID
 */
export const addGalleryImage = async (imageData) => {
    try {
        const docRef = doc(collection(db, "gallery_images"));

        await setDoc(docRef, {
            ...imageData,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        });

        clearContentCache();
        return docRef.id;
    } catch (error) {
        console.error("Error adding gallery image:", error);
        throw error;
    }
};

/**
 * Update gallery image
 * @param {string} id - Document ID
 * @param {Object} updates - Fields to update
 * @returns {Promise<boolean>} Success status
 */
export const updateGalleryImage = async (id, updates) => {
    try {
        const docRef = doc(db, "gallery_images", id);

        await updateDoc(docRef, {
            ...updates,
            updatedAt: new Date().toISOString(),
        });

        clearContentCache();
        return true;
    } catch (error) {
        console.error("Error updating gallery image:", error);
        throw error;
    }
};

/**
 * Delete gallery image
 * @param {string} id - Document ID
 * @returns {Promise<boolean>} Success status
 */
export const deleteGalleryImage = async (id) => {
    try {
        const docRef = doc(db, "gallery_images", id);
        await deleteDoc(docRef);

        clearContentCache();
        return true;
    } catch (error) {
        console.error("Error deleting gallery image:", error);
        throw error;
    }
};

/**
 * Reorder gallery images
 * @param {Array} images - Array of images with updated order
 * @returns {Promise<boolean>} Success status
 */
export const reorderGalleryImages = async (images) => {
    try {
        const updatePromises = images.map((image, index) => {
            const docRef = doc(db, "gallery_images", image.id);
            return updateDoc(docRef, {
                order: index,
                updatedAt: new Date().toISOString(),
            });
        });

        await Promise.all(updatePromises);
        clearContentCache();
        return true;
    } catch (error) {
        console.error("Error reordering gallery images:", error);
        throw error;
    }
};

export default {
    // Hero Images
    getHeroImages,
    getAllHeroImages,
    addHeroImage,
    updateHeroImage,
    deleteHeroImage,
    reorderHeroImages,

    // Sevas
    getSevas,
    getAllSevas,
    addSeva,
    updateSeva,
    deleteSeva,
    reorderSevas,

    // Gallery Images
    getGalleryImages,
    getAllGalleryImages,
    addGalleryImage,
    updateGalleryImage,
    deleteGalleryImage,
    reorderGalleryImages,

    // Cache
    clearContentCache,
};
