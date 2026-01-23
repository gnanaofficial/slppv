import React, { useState } from "react";
import { seedAllData, downloadCredentials } from "../../lib/seedData";

const Seed = () => {
  const [loading, setLoading] = useState(false);
  const [logs, setLogs] = useState([]);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const addLog = (msg) => {
    setLogs((prev) => [...prev, `${new Date().toLocaleTimeString()} - ${msg}`]);
  };

  const handleSeed = async () => {
    if (!window.confirm("This will add sample data to Firestore. Continue?")) {
      return;
    }

    setLoading(true);
    setLogs([]);
    setError("");
    setSuccess(false);

    try {
      addLog("Starting seed process...");

      // Override console.log to capture logs
      const originalLog = console.log;
      console.log = (...args) => {
        originalLog(...args);
        // Clean up log message for display
        const msg = args
          .map((a) => (typeof a === "object" ? JSON.stringify(a) : String(a)))
          .join(" ");
        addLog(msg);
      };

      const credentials = await seedAllData();

      // Restore console.log
      console.log = originalLog;

      addLog("Seeding complete!");
      setSuccess(true);

      if (window.confirm("Seeding successful! Download credentials?")) {
        downloadCredentials(credentials);
      }
    } catch (err) {
      console.error(err);
      setError(err.message || "Failed to seed data");
      addLog(`ERROR: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-xl overflow-hidden">
        <div className="bg-mainColor text-white p-6">
          <h1 className="text-2xl font-bold">Database Seeder</h1>
          <p className="opacity-80">Use this tool to populate initial data</p>
        </div>

        <div className="p-6">
          <div className="mb-6 bg-blue-50 border-l-4 border-blue-500 p-4">
            <p className="text-sm text-blue-700">
              <strong>Note:</strong> This will create sample donors, admins, and
              transactions using the configuration in{" "}
              <code>src/lib/seedData.js</code>.
            </p>
          </div>

          {error && (
            <div className="mb-6 bg-red-50 border-l-4 border-red-500 p-4">
              <p className="text-red-700">{error}</p>
            </div>
          )}

          {success && (
            <div className="mb-6 bg-green-50 border-l-4 border-green-500 p-4">
              <p className="text-green-700">
                Data seeded successfully! You can now log in with the generated
                credentials.
              </p>
            </div>
          )}

          <div className="flex justify-center mb-8">
            <button
              onClick={handleSeed}
              disabled={loading}
              className={`px-8 py-4 rounded-lg text-white font-bold text-lg shadow-lg transform transition hover:-translate-y-1 ${
                loading
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-green-600 hover:bg-green-700"
              }`}
            >
              {loading ? (
                <span className="flex items-center">
                  <svg
                    className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Seeding Data...
                </span>
              ) : (
                "🌱 Start Seeding Data"
              )}
            </button>
          </div>

          <div className="bg-gray-900 rounded-lg p-4 font-mono text-xs h-64 overflow-y-auto">
            {logs.length === 0 ? (
              <p className="text-gray-500 italic text-center mt-20">
                Logs will appear here...
              </p>
            ) : (
              logs.map((log, i) => (
                <div
                  key={i}
                  className="mb-1 text-green-400 border-b border-gray-800 pb-1 last:border-0"
                >
                  {log}
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Seed;
