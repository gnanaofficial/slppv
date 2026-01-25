import React, { useState } from "react";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth } from "../../lib/firebase";
import { createAdmin } from "../../lib/firestoreService";
import { useNavigate } from "react-router-dom";

/**
 * Admin Setup Component
 * This is a one-time setup page to create the first main admin account
 * After the first admin is created, this page should be disabled or protected
 */
const Setup = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    // Validation
    if (!formData.email || !formData.password || !formData.confirmPassword) {
      setError("All fields are required");
      return;
    }

    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setLoading(true);

    try {
      // Create Firebase Auth user
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        formData.email,
        formData.password,
      );

      const user = userCredential.user;

      // Create admin document in Firestore
      await createAdmin({
        uid: user.uid,
        email: formData.email,
        role: "main",
        permissions: {
          upload_media: true,
          manage_sevas: true,
          manage_donors: true,
          manage_admins: true,
          view_analytics: true,
        },
        createdBy: "system",
      });

      // Initialize default configuration
      const { initializeDefaultConfig } = await import("../../lib/configService");
      await initializeDefaultConfig();
      console.log("Default configuration initialized");

      setSuccess(true);

      // Redirect to login after 2 seconds
      setTimeout(() => {
        navigate("/temple-management/login");
      }, 2000);
    } catch (error) {
      console.error("Setup error:", error);

      if (error.code === "auth/email-already-in-use") {
        setError(
          "This email is already registered. Please use the login page.",
        );
      } else if (error.code === "auth/invalid-email") {
        setError("Invalid email address");
      } else if (error.code === "auth/weak-password") {
        setError("Password is too weak");
      } else {
        setError(error.message || "Failed to create admin account");
      }
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-yellow-50 flex items-center justify-center p-4">
        <div className="bg-white p-8 rounded-lg shadow-xl max-w-md w-full text-center">
          <div className="mb-4">
            <svg
              className="w-16 h-16 text-green-500 mx-auto"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-green-600 mb-2">
            Setup Complete!
          </h2>
          <p className="text-gray-600 mb-4">
            Main admin account created successfully.
          </p>
          <p className="text-sm text-gray-500">Redirecting to login page...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-yellow-50 flex items-center justify-center p-4">
      <div className="bg-white p-8 rounded-lg shadow-xl max-w-md w-full">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-mainColor mb-2 font-play">
            Admin Setup
          </h1>
          <p className="text-gray-600">Create the first main admin account</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email Address
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-mainColor focus:border-transparent"
              placeholder="admin@example.com"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Password
            </label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-mainColor focus:border-transparent"
              placeholder="Minimum 6 characters"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Confirm Password
            </label>
            <input
              type="password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-mainColor focus:border-transparent"
              placeholder="Re-enter password"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`w-full py-3 px-4 rounded-lg text-white font-semibold ${loading
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-mainColor hover:bg-red-700"
              } transition`}
          >
            {loading ? "Creating Account..." : "Create Main Admin"}
          </button>
        </form>

        <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-sm text-blue-800">
            <strong>Note:</strong> This page creates the first main admin
            account. After setup, you can create additional sub-admins from the
            admin dashboard.
          </p>
        </div>

        <div className="mt-4 text-center">
          <button
            onClick={() => navigate("/temple-management/login")}
            className="text-mainColor hover:underline text-sm"
          >
            Already have an account? Login here
          </button>
        </div>
      </div>
    </div>
  );
};

export default Setup;
