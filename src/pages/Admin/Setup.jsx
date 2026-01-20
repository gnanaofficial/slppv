import React, { useState } from "react";
import { auth, db } from "../../lib/firebase";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { collection, addDoc, getDocs } from "firebase/firestore";

const Setup = () => {
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(false);

  const initialSevas = [
    {
      title: "DAILY",
      bgClass: "bg-sevaImg",
      path: "/sevas/daily-sevas",
      description:
        "Experience divine connection through daily rituals that bring peace, protection, and positive energy",
    },
    {
      title: "WEEKLY",
      bgClass: "bg-sevaImg2",
      path: "/sevas/weekly-sevas",
      description:
        "Participate in weekly sevas to align your spiritual path with the energies of the days.",
    },
    {
      title: "MONTHLY",
      bgClass: "bg-sevaImg3",
      path: "/sevas/monthly-sevas",
      description:
        "Monthly sevas provide an opportunity to connect deeply with the divine on spiritually significant days.",
    },
    {
      title: "AUSPICIOUS",
      bgClass: "bg-sevaImg4",
      path: "/sevas/auspicious-sevas",
      description:
        "Celebrate festivals and special occasions with grand sevas that amplify divine grace.",
    },
  ];

  const handleSetup = async () => {
    setLoading(true);
    setStatus("Startin setup...");

    // 1. Create Admin User
    try {
      setStatus("Creating Admin User...");
      await createUserWithEmailAndPassword(
        auth,
        "gnana@slppv.org",
        "Gnana@8179",
      );
      setStatus(
        (prev) =>
          prev + "\n✅ Admin user 'gnana@slppv.org' created successfully.",
      );
    } catch (error) {
      if (error.code === "auth/email-already-in-use") {
        setStatus(
          (prev) => prev + "\n⚠️ User already starts. Skipping creation.",
        );
      } else {
        setStatus(
          (prev) => prev + "\n❌ Error creating user: " + error.message,
        );
      }
    }

    // 2. Seed Database
    try {
      setStatus((prev) => prev + "\nChecking Database...");
      const sevasRef = collection(db, "sevas");
      const snapshot = await getDocs(sevasRef);

      if (snapshot.empty) {
        setStatus((prev) => prev + "\nSeeding 'sevas' collection...");
        for (const seva of initialSevas) {
          await addDoc(sevasRef, seva);
        }
        setStatus((prev) => prev + "\n✅ Database seeded with initial Sevas.");
      } else {
        setStatus(
          (prev) => prev + "\n⚠️ Database already has data. Skipping seed.",
        );
      }
    } catch (error) {
      setStatus(
        (prev) => prev + "\n❌ Error seeding database: " + error.message,
      );
    }

    setLoading(false);
    setStatus(
      (prev) =>
        prev +
        "\n\n🎉 SETUP COMPLETE. You can now go to /admin-slppv and login.",
    );
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 p-4">
      <div className="bg-white p-8 rounded shadow-md max-w-lg w-full">
        <h1 className="text-2xl font-bold mb-4 text-center">System Setup</h1>
        <p className="mb-4 text-gray-600 text-sm">
          This utility will create the admin user (gnana@slppv.org) and
          initialize the database.
        </p>

        <div className="bg-gray-900 text-green-400 p-4 rounded h-64 overflow-auto font-mono text-sm mb-4 whitespace-pre-wrap">
          {status || "Ready to setup..."}
        </div>

        <button
          onClick={handleSetup}
          disabled={loading}
          className="w-full bg-blue-600 text-white py-3 rounded font-bold hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? "Running Setup..." : "Run Setup"}
        </button>
      </div>
    </div>
  );
};

export default Setup;
