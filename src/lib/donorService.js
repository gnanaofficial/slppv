import {
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "./firebase";
import { getDonationsByDonor } from "./firestoreService";

/**
 * Generate unique donor ID
 * Format: DNR-YYYYMMDD-XXXX
 */
export const generateDonorId = async () => {
  const today = new Date();
  const dateStr = today.toISOString().slice(0, 10).replace(/-/g, "");

  // Get count of donors created today
  const startOfDay = new Date(today.setHours(0, 0, 0, 0));
  const endOfDay = new Date(today.setHours(23, 59, 59, 999));

  try {
    const q = query(
      collection(db, "donors"),
      where("createdAt", ">=", startOfDay),
      where("createdAt", "<=", endOfDay),
    );

    const snapshot = await getDocs(q);
    const count = snapshot.size + 1;
    const paddedCount = String(count).padStart(4, "0");

    return `DNR-${dateStr}-${paddedCount}`;
  } catch (error) {
    console.error("Error generating donor ID:", error);
    // Fallback to random if query fails
    const randomNum = Math.floor(Math.random() * 10000);
    return `DNR-${dateStr}-${String(randomNum).padStart(4, "0")}`;
  }
};

/**
 * Search donors by name, email, phone, or donor ID
 */
export const searchDonors = async (searchQuery, allDonors) => {
  try {
    if (!searchQuery || searchQuery.trim() === "") {
      return allDonors;
    }

    const searchLower = searchQuery.toLowerCase().trim();

    return allDonors.filter((donor) => {
      return (
        donor.name?.toLowerCase().includes(searchLower) ||
        donor.email?.toLowerCase().includes(searchLower) ||
        donor.phone?.includes(searchQuery) ||
        donor.donorId?.toLowerCase().includes(searchLower)
      );
    });
  } catch (error) {
    console.error("Error searching donors:", error);
    throw error;
  }
};

/**
 * Filter donors by various criteria
 */
export const filterDonors = (donors, filters) => {
  try {
    let filtered = [...donors];

    // Filter by date range
    if (filters.startDate) {
      filtered = filtered.filter(
        (d) => d.createdAt?.toDate() >= new Date(filters.startDate),
      );
    }
    if (filters.endDate) {
      filtered = filtered.filter(
        (d) => d.createdAt?.toDate() <= new Date(filters.endDate),
      );
    }

    // Filter by status
    if (filters.status !== undefined) {
      filtered = filtered.filter((d) => d.active === filters.status);
    }

    return filtered;
  } catch (error) {
    console.error("Error filtering donors:", error);
    throw error;
  }
};

/**
 * Soft delete donor (move to deleted_donors collection)
 */
export const softDeleteDonor = async (donorId, deletedBy) => {
  try {
    const donorRef = doc(db, "donors", donorId);
    const donorSnap = await getDoc(donorRef);

    if (!donorSnap.exists()) {
      throw new Error("Donor not found");
    }

    const donorData = { id: donorSnap.id, ...donorSnap.data() };

    // Get all donations for this donor
    const donations = await getDonationsByDonor(donorId);

    // Add to deleted_donors collection
    await addDoc(collection(db, "deleted_donors"), {
      ...donorData,
      deletedAt: serverTimestamp(),
      deletedBy,
      donations: donations,
    });

    // Delete from donors collection
    await deleteDoc(donorRef);

    return true;
  } catch (error) {
    console.error("Error soft deleting donor:", error);
    throw error;
  }
};

/**
 * Get all deleted donors
 */
export const getDeletedDonors = async () => {
  try {
    const snapshot = await getDocs(
      query(collection(db, "deleted_donors"), orderBy("deletedAt", "desc")),
    );
    return snapshot.docs.map((doc) => ({ ...doc.data(), id: doc.id }));
  } catch (error) {
    console.error("Error getting deleted donors:", error);
    throw error;
  }
};

/**
 * Restore deleted donor
 */
export const restoreDonor = async (deletedDonorId) => {
  try {
    const deletedRef = doc(db, "deleted_donors", deletedDonorId);
    const deletedSnap = await getDoc(deletedRef);

    if (!deletedSnap.exists()) {
      throw new Error("Deleted donor not found");
    }

    const donorData = deletedSnap.data();
    const { deletedAt, deletedBy, donations, ...restoreData } = donorData;

    // Use the original ID if present in restoreData
    // In softDeleteDonor we did: const donorData = { id: donorSnap.id, ...donorSnap.data() };
    // So restoreData.id should be the original ID.
    const originalId = restoreData.id;

    if (originalId) {
      // Restore with original ID
      await setDoc(doc(db, "donors", originalId), {
        ...restoreData,
        active: true, // Ensure donor is active upon restoration
        restoredAt: serverTimestamp(),
      });
    } else {
      // Fallback to addDoc if ID is missing (should not happen)
      await addDoc(collection(db, "donors"), {
        ...restoreData,
        restoredAt: serverTimestamp(),
      });
    }

    // Remove from deleted_donors collection
    await deleteDoc(deletedRef);

    return true;
  } catch (error) {
    console.error("Error restoring donor:", error);
    throw error;
  }
};

/**
 * Get donor statistics
 */
export const getDonorStats = async (donorId) => {
  try {
    const donations = await getDonationsByDonor(donorId);

    const successfulDonations = donations.filter((d) => d.status === "success");
    const totalAmount = successfulDonations.reduce(
      (sum, d) => sum + (d.amount || 0),
      0,
    );
    const averageAmount =
      successfulDonations.length > 0
        ? totalAmount / successfulDonations.length
        : 0;

    const firstDonation =
      donations.length > 0 ? donations[donations.length - 1] : null;
    const lastDonation = donations.length > 0 ? donations[0] : null;

    return {
      totalDonations: successfulDonations.length,
      totalAmount,
      averageAmount,
      firstDonationDate: firstDonation?.createdAt,
      lastDonationDate: lastDonation?.createdAt,
      allDonations: donations,
    };
  } catch (error) {
    console.error("Error getting donor stats:", error);
    throw error;
  }
};

/**
 * Delete donor permanently
 */
export const deleteDonorPermanently = async (donorId) => {
  try {
    await deleteDoc(doc(db, "donors", donorId));
    return true;
  } catch (error) {
    console.error("Error deleting donor:", error);
    throw error;
  }
};

/**
 * Format donor ID for display
 */
export const formatDonorId = (id) => {
  if (!id) return "N/A";
  return id.toUpperCase();
};

/**
 * Generate donor avatar from initials
 */
export const generateDonorAvatar = (name) => {
  if (!name) return "?";
  const parts = name.trim().split(" ");
  if (parts.length >= 2) {
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }
  return name.substring(0, 2).toUpperCase();
};

/**
 * Validate donor data
 */
export const validateDonorData = (data) => {
  const errors = {};

  if (!data.name || data.name.trim() === "") {
    errors.name = "Name is required";
  }

  if (!data.email || data.email.trim() === "") {
    errors.email = "Email is required";
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
    errors.email = "Invalid email format";
  }

  if (!data.phone || data.phone.trim() === "") {
    errors.phone = "Phone is required";
  } else if (!/^[0-9]{10}$/.test(data.phone)) {
    errors.phone = "Phone must be 10 digits";
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};
