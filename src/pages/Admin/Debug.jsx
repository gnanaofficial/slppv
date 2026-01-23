import React, { useState, useEffect } from "react";
import { auth, db } from "../../lib/firebase";
import { onAuthStateChanged } from "firebase/auth";
import {
  collection,
  query,
  where,
  getDocs,
  getDoc,
  doc,
} from "firebase/firestore";

const Debug = () => {
  const [user, setUser] = useState(null);
  const [adminDoc, setAdminDoc] = useState(null);
  const [donors, setDonors] = useState([]);
  const [logs, setLogs] = useState([]);

  const addLog = (msg) =>
    setLogs((prev) => [...prev, `${new Date().toLocaleTimeString()} - ${msg}`]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (u) => {
      setUser(u);
      if (u) {
        addLog(`Auth User UID: ${u.uid}`);
        addLog(`Auth User Email: ${u.email}`);

        try {
          // Check Admin Doc
          addLog("Fetching Admin Doc...");
          const q = query(collection(db, "admins"), where("uid", "==", u.uid));
          const snapshot = await getDocs(q);
          if (snapshot.empty) {
            addLog("❌ No Admin document found for this UID!");
            setAdminDoc("NOT FOUND");
          } else {
            const docData = snapshot.docs[0].data();
            addLog("✅ Admin document found.");
            setAdminDoc(docData);
            addLog(`Role: ${docData.role}`);
            addLog(`Permissions: ${JSON.stringify(docData.permissions)}`);
          }

          // Check Donors
          addLog("Fetching Donors...");
          const donorsShot = await getDocs(collection(db, "donors"));
          const donorList = donorsShot.docs.map((d) => ({
            id: d.id,
            ...d.data(),
          }));
          setDonors(donorList);
          addLog(`✅ Fetched ${donorList.length} donors.`);
        } catch (e) {
          addLog(`❌ Error: ${e.message}`);
          console.error(e);
        }
      } else {
        addLog("No user logged in.");
      }
    });
    return unsubscribe;
  }, []);

  return (
    <div className="p-8 bg-gray-100 min-h-screen font-mono">
      <h1 className="text-2xl font-bold mb-4">Debug Console</h1>

      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white p-4 rounded shadow">
          <h2 className="font-bold mb-2">Auth User</h2>
          <pre className="text-sm overflow-auto">
            {JSON.stringify(user, null, 2)}
          </pre>
        </div>

        <div className="bg-white p-4 rounded shadow">
          <h2 className="font-bold mb-2">Firestore Admin Doc</h2>
          <pre className="text-sm overflow-auto">
            {JSON.stringify(adminDoc, null, 2)}
          </pre>
        </div>
      </div>

      <div className="bg-black text-green-400 p-4 rounded shadow mt-4 h-64 overflow-auto">
        {logs.map((l, i) => (
          <div key={i}>{l}</div>
        ))}
      </div>

      <div className="bg-white p-4 rounded shadow mt-4">
        <h2 className="font-bold mb-2">Donors List ({donors.length})</h2>
        <pre className="text-xs overflow-auto max-h-64">
          {JSON.stringify(donors, null, 2)}
        </pre>
      </div>
    </div>
  );
};

export default Debug;
