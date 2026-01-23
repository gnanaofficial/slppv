import { auth, db } from "./lib/firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";

/**
 * Manual Admin Creation Script
 * Run this in browser console if admin document wasn't created during setup
 */

async function createAdminDocument() {
  const user = auth.currentUser;

  if (!user) {
    console.error("No user logged in! Please login first.");
    return;
  }

  try {
    const adminData = {
      uid: user.uid,
      email: user.email,
      role: "main",
      permissions: {
        upload_media: true,
        manage_sevas: true,
        manage_donors: true,
        manage_admins: true,
        view_analytics: true,
      },
      createdAt: serverTimestamp(),
      createdBy: "manual_script",
      active: true,
    };

    const docRef = await addDoc(collection(db, "admins"), adminData);
    console.log("✅ Admin document created successfully! ID:", docRef.id);
    console.log("Admin data:", adminData);
    console.log("Please refresh the page and try uploading again.");

    return docRef.id;
  } catch (error) {
    console.error("❌ Error creating admin document:", error);
    console.error("Make sure Firestore rules allow writes!");
  }
}

// Export for use
window.createAdminDocument = createAdminDocument;

console.log("Admin creation script loaded!");
console.log("To create admin document, run: createAdminDocument()");
