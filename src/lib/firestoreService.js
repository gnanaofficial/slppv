import {
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  onSnapshot,
  serverTimestamp,
  writeBatch,
  setDoc,
} from "firebase/firestore";
import { db } from "./firebase";

// ============================================
// ADMINS COLLECTION
// ============================================

/**
 * Get admin by UID
 */
export const getAdminByUid = async (uid) => {
  try {
    const q = query(collection(db, "admins"), where("uid", "==", uid));
    const snapshot = await getDocs(q);
    if (snapshot.empty) return null;
    return { id: snapshot.docs[0].id, ...snapshot.docs[0].data() };
  } catch (error) {
    console.error("Error getting admin:", error);
    throw error;
  }
};

/**
 * Get all admins
 */
export const getAllAdmins = async () => {
  try {
    const snapshot = await getDocs(collection(db, "admins"));
    return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error("Error getting admins:", error);
    throw error;
  }
};

/**
 * Create new admin
 */
export const createAdmin = async (adminData) => {
  try {
    const docRef = await addDoc(collection(db, "admins"), {
      ...adminData,
      createdAt: serverTimestamp(),
      active: true,
    });
    return { id: docRef.id, ...adminData };
  } catch (error) {
    console.error("Error creating admin:", error);
    throw error;
  }
};

/**
 * Update admin
 */
export const updateAdmin = async (adminId, updates) => {
  try {
    const adminRef = doc(db, "admins", adminId);
    await updateDoc(adminRef, {
      ...updates,
      updatedAt: serverTimestamp(),
    });
    return true;
  } catch (error) {
    console.error("Error updating admin:", error);
    throw error;
  }
};

/**
 * Delete admin
 */
export const deleteAdmin = async (adminId) => {
  try {
    await deleteDoc(doc(db, "admins", adminId));
    return true;
  } catch (error) {
    console.error("Error deleting admin:", error);
    throw error;
  }
};

// ============================================
// DONORS COLLECTION
// ============================================

/**
 * Get donor by UID
 */
export const getDonorByUid = async (uid) => {
  try {
    const q = query(collection(db, "donors"), where("uid", "==", uid));
    const snapshot = await getDocs(q);
    if (snapshot.empty) return null;
    return { id: snapshot.docs[0].id, ...snapshot.docs[0].data() };
  } catch (error) {
    console.error("Error getting donor:", error);
    throw error;
  }
};

/**
 * Get all donors
 */
export const getAllDonors = async () => {
  try {
    const snapshot = await getDocs(
      query(collection(db, "donors"), orderBy("createdAt", "desc")),
    );
    return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error("Error getting donors:", error);
    throw error;
  }
};

/**
 * Create donor
 */
export const createDonor = async (donorData) => {
  try {
    const docRef = await addDoc(collection(db, "donors"), {
      ...donorData,
      createdAt: serverTimestamp(),
      active: true,
    });
    return { id: docRef.id, ...donorData };
  } catch (error) {
    console.error("Error creating donor:", error);
    throw error;
  }
};

/**
 * Update donor
 */
export const updateDonor = async (donorId, updates) => {
  try {
    const donorRef = doc(db, "donors", donorId);
    await updateDoc(donorRef, {
      ...updates,
      updatedAt: serverTimestamp(),
    });
    return true;
  } catch (error) {
    console.error("Error updating donor:", error);
    throw error;
  }
};

// ============================================
// DONATIONS COLLECTION
// ============================================

/**
 * Create donation record
 */
export const createDonation = async (donationData) => {
  try {
    const docRef = await addDoc(collection(db, "donations"), {
      ...donationData,
      createdAt: serverTimestamp(),
    });
    return { id: docRef.id, ...donationData };
  } catch (error) {
    console.error("Error creating donation:", error);
    throw error;
  }
};

/**
 * Get donations by donor ID
 */
export const getDonationsByDonor = async (donorId) => {
  try {
    const q = query(
      collection(db, "donations"),
      where("donorId", "==", donorId),
      // orderBy("createdAt", "desc"), // RE-ENABLE AFTER INDEX CREATION
    );
    const snapshot = await getDocs(q);
    const docs = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));

    // Sort client-side to avoid index issues during dev
    return docs.sort((a, b) => {
      const dateA = a.createdAt?.toDate
        ? a.createdAt.toDate()
        : new Date(a.createdAt);
      const dateB = b.createdAt?.toDate
        ? b.createdAt.toDate()
        : new Date(b.createdAt);
      return dateB - dateA;
    });
  } catch (error) {
    console.error("Error getting donations:", error);
    throw error;
  }
};

/**
 * Get all donations
 */
export const getAllDonations = async (limitCount = 100) => {
  try {
    const q = query(
      collection(db, "donations"),
      orderBy("createdAt", "desc"),
      limit(limitCount),
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error("Error getting donations:", error);
    throw error;
  }
};

/**
 * Get donation statistics
 */
export const getDonationStats = async () => {
  try {
    const snapshot = await getDocs(collection(db, "donations"));
    const donations = snapshot.docs.map((doc) => doc.data());

    const total = donations.reduce((sum, d) => sum + (d.amount || 0), 0);
    const successful = donations.filter((d) => d.status === "success").length;

    return {
      total,
      count: donations.length,
      successful,
      failed: donations.length - successful,
    };
  } catch (error) {
    console.error("Error getting donation stats:", error);
    throw error;
  }
};

// ============================================
// SEVAS COLLECTION
// ============================================

/**
 * Get all sevas
 */
export const getAllSevas = async () => {
  try {
    const snapshot = await getDocs(
      query(collection(db, "sevas"), orderBy("order", "asc")),
    );
    return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error("Error getting sevas:", error);
    throw error;
  }
};

/**
 * Get sevas by type
 */
export const getSevasByType = async (type) => {
  try {
    const q = query(
      collection(db, "sevas"),
      where("type", "==", type),
      where("active", "==", true),
      orderBy("order", "asc"),
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error("Error getting sevas by type:", error);
    throw error;
  }
};

/**
 * Create seva
 */
export const createSeva = async (sevaData) => {
  try {
    const docRef = await addDoc(collection(db, "sevas"), {
      ...sevaData,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      active: true,
    });
    return { id: docRef.id, ...sevaData };
  } catch (error) {
    console.error("Error creating seva:", error);
    throw error;
  }
};

/**
 * Update seva
 */
export const updateSeva = async (sevaId, updates) => {
  try {
    const sevaRef = doc(db, "sevas", sevaId);
    await updateDoc(sevaRef, {
      ...updates,
      updatedAt: serverTimestamp(),
    });
    return true;
  } catch (error) {
    console.error("Error updating seva:", error);
    throw error;
  }
};

/**
 * Delete seva
 */
export const deleteSeva = async (sevaId) => {
  try {
    await deleteDoc(doc(db, "sevas", sevaId));
    return true;
  } catch (error) {
    console.error("Error deleting seva:", error);
    throw error;
  }
};

// ============================================
// GALLERY COLLECTION
// ============================================

/**
 * Get all gallery items
 */
export const getAllGalleryItems = async () => {
  try {
    const snapshot = await getDocs(
      query(collection(db, "gallery"), orderBy("uploadedAt", "desc")),
    );
    return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error("Error getting gallery items:", error);
    throw error;
  }
};

/**
 * Get gallery items by category
 */
export const getGalleryByCategory = async (category) => {
  try {
    const q = query(
      collection(db, "gallery"),
      where("category", "==", category),
      orderBy("order", "asc"),
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error("Error getting gallery by category:", error);
    throw error;
  }
};

/**
 * Create gallery item
 */
export const createGalleryItem = async (itemData) => {
  try {
    const docRef = await addDoc(collection(db, "gallery"), {
      ...itemData,
      uploadedAt: serverTimestamp(),
    });
    return { id: docRef.id, ...itemData };
  } catch (error) {
    console.error("Error creating gallery item:", error);
    throw error;
  }
};

/**
 * Delete gallery item
 */
export const deleteGalleryItem = async (itemId) => {
  try {
    await deleteDoc(doc(db, "gallery", itemId));
    return true;
  } catch (error) {
    console.error("Error deleting gallery item:", error);
    throw error;
  }
};

// ============================================
// VIDEOS COLLECTION
// ============================================

/**
 * Get all videos
 */
export const getAllVideos = async () => {
  try {
    const snapshot = await getDocs(
      query(collection(db, "videos"), orderBy("uploadedAt", "desc")),
    );
    return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error("Error getting videos:", error);
    throw error;
  }
};

/**
 * Create video
 */
export const createVideo = async (videoData) => {
  try {
    const docRef = await addDoc(collection(db, "videos"), {
      ...videoData,
      uploadedAt: serverTimestamp(),
    });
    return { id: docRef.id, ...videoData };
  } catch (error) {
    console.error("Error creating video:", error);
    throw error;
  }
};

/**
 * Delete video
 */
export const deleteVideo = async (videoId) => {
  try {
    await deleteDoc(doc(db, "videos", videoId));
    return true;
  } catch (error) {
    console.error("Error deleting video:", error);
    throw error;
  }
};

// ============================================
// SITE CONTENT COLLECTION
// ============================================

/**
 * Get site content by ID
 */
export const getSiteContent = async (contentId) => {
  try {
    const docRef = doc(db, "siteContent", contentId);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() };
    }
    return null;
  } catch (error) {
    console.error("Error getting site content:", error);
    throw error;
  }
};

/**
 * Update site content
 */
export const updateSiteContent = async (contentId, data, updatedBy) => {
  try {
    const docRef = doc(db, "siteContent", contentId);
    await setDoc(
      docRef,
      {
        ...data,
        updatedAt: serverTimestamp(),
        updatedBy,
      },
      { merge: true },
    );
    return true;
  } catch (error) {
    console.error("Error updating site content:", error);
    throw error;
  }
};

// ============================================
// REAL-TIME LISTENERS
// ============================================

/**
 * Listen to donations in real-time
 */
export const listenToDonations = (callback, limitCount = 50) => {
  const q = query(
    collection(db, "donations"),
    orderBy("createdAt", "desc"),
    limit(limitCount),
  );

  return onSnapshot(q, (snapshot) => {
    const donations = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    callback(donations);
  });
};

/**
 * Listen to gallery items in real-time
 */
export const listenToGallery = (callback) => {
  const q = query(collection(db, "gallery"), orderBy("uploadedAt", "desc"));

  return onSnapshot(q, (snapshot) => {
    const items = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    callback(items);
  });
};
