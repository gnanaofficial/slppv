import {
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
} from "firebase/auth";
import { auth } from "./firebase";
import { createDonor, updateDonor } from "./firestoreService";

/**
 * Generate secure random password
 */
export const generateDonorPassword = () => {
  const length = 12;
  const charset =
    "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*";
  let password = "";

  // Ensure at least one of each type
  password += "ABCDEFGHIJKLMNOPQRSTUVWXYZ"[Math.floor(Math.random() * 26)];
  password += "abcdefghijklmnopqrstuvwxyz"[Math.floor(Math.random() * 26)];
  password += "0123456789"[Math.floor(Math.random() * 10)];
  password += "!@#$%^&*"[Math.floor(Math.random() * 8)];

  // Fill the rest
  for (let i = password.length; i < length; i++) {
    password += charset[Math.floor(Math.random() * charset.length)];
  }

  // Shuffle the password
  return password
    .split("")
    .sort(() => Math.random() - 0.5)
    .join("");
};

/**
 * Create Firebase Auth account for donor
 */
export const createDonorAccount = async (email, password) => {
  try {
    const userCredential = await createUserWithEmailAndPassword(
      auth,
      email,
      password,
    );
    return userCredential.user;
  } catch (error) {
    console.error("Error creating donor account:", error);

    // If user already exists, that's okay
    if (error.code === "auth/email-already-in-use") {
      console.log("Donor account already exists");
      return null;
    }

    throw error;
  }
};

/**
 * Create donor with authentication
 */
export const createDonorWithAuth = async (donorData, password = null) => {
  try {
    // Generate password if not provided
    const donorPassword = password || generateDonorPassword();

    // Create Firebase Auth account
    const user = await createDonorAccount(donorData.email, donorPassword);

    // Create donor record in Firestore
    const donor = await createDonor({
      ...donorData,
      uid: user?.uid || null,
      hasAuthAccount: !!user,
    });

    return {
      donor,
      password: donorPassword,
      authCreated: !!user,
    };
  } catch (error) {
    console.error("Error creating donor with auth:", error);
    throw error;
  }
};

/**
 * Link existing donor to Firebase Auth
 */
export const linkDonorToAuth = async (donorId, email) => {
  try {
    const password = generateDonorPassword();
    const user = await createDonorAccount(email, password);

    if (user) {
      await updateDonor(donorId, {
        uid: user.uid,
        hasAuthAccount: true,
      });

      return {
        success: true,
        password,
      };
    }

    return {
      success: false,
      message: "Account already exists",
    };
  } catch (error) {
    console.error("Error linking donor to auth:", error);
    throw error;
  }
};

/**
 * Send password reset email to donor
 */
export const sendDonorPasswordReset = async (email) => {
  try {
    await sendPasswordResetEmail(auth, email);
    return true;
  } catch (error) {
    console.error("Error sending password reset:", error);
    throw error;
  }
};

/**
 * Send credentials email (simulated - in production, use a backend service)
 */
export const sendCredentialsEmail = async (email, password) => {
  // In a real application, this would call a backend API to send an email
  // For now, we'll just log it and return the credentials
  console.log("=== DONOR CREDENTIALS ===");
  console.log(`Email: ${email}`);
  console.log(`Password: ${password}`);
  console.log("========================");

  return {
    email,
    password,
    message:
      "Credentials generated. In production, these would be emailed to the donor.",
  };
};

/**
 * Validate donor credentials
 */
export const validateDonorCredentials = (email, password) => {
  const errors = {};

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    errors.email = "Valid email is required";
  }

  if (!password || password.length < 8) {
    errors.password = "Password must be at least 8 characters";
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};
