import React, { useState } from "react";
import { Container } from "@mui/material";
import { useNavigate, Link } from "react-router-dom";
import { useDonor } from "../../context/DonorContext";
import { useTranslation } from "react-i18next";

const DonorLogin = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { login, resetPassword } = useDonor();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [resetEmailSent, setResetEmailSent] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const result = await login(formData.email, formData.password);

    if (result.success) {
      navigate("/donor/dashboard");
    } else {
      setError(
        result.error ||
          t("donor.loginError", "Login failed. Please check your credentials."),
      );
    }

    setLoading(false);
  };

  const handleForgotPassword = async () => {
    if (!formData.email) {
      setError(t("donor.enterEmail", "Please enter your email address first."));
      return;
    }

    const result = await resetPassword(formData.email);

    if (result.success) {
      setResetEmailSent(true);
      setError("");
    } else {
      setError(
        result.error || t("donor.resetError", "Failed to send reset email."),
      );
    }
  };

  return (
    <Container
      maxWidth="xl"
      className="bg-[#FAAC2F] min-h-screen py-12 flex items-center justify-center"
    >
      <div className="bg-white rounded-lg shadow-2xl p-8 md:p-12 w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-[#8B0000] mb-2">
            {t("donor.loginTitle", "Donor Login")}
          </h1>
          <p className="text-gray-600">
            {t(
              "donor.loginSubtitle",
              "Access your donation history and profile",
            )}
          </p>
        </div>

        {/* Success Message */}
        {resetEmailSent && (
          <div className="mb-6 p-4 bg-green-100 border border-green-400 text-green-700 rounded-lg">
            {t(
              "donor.resetEmailSent",
              "Password reset email sent! Please check your inbox.",
            )}
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
            {error}
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              {t("donor.email", "Email Address")}
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#8B0000] focus:border-transparent transition"
              placeholder={t("donor.emailPlaceholder", "Enter your email")}
            />
          </div>

          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              {t("donor.password", "Password")}
            </label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#8B0000] focus:border-transparent transition"
              placeholder={t(
                "donor.passwordPlaceholder",
                "Enter your password",
              )}
            />
          </div>

          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={handleForgotPassword}
              className="text-sm text-[#8B0000] hover:underline"
            >
              {t("donor.forgotPassword", "Forgot Password?")}
            </button>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#8B0000] text-white py-3 px-4 rounded-lg font-semibold hover:bg-[#6B0000] transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading
              ? t("common.loading", "Loading...")
              : t("donor.loginButton", "Login")}
          </button>
        </form>

        {/* Additional Info */}
        <div className="mt-8 pt-6 border-t border-gray-200 text-center">
          <p className="text-sm text-gray-600">
            {t("donor.noAccount", "Don't have an account?")}
          </p>
          <p className="text-sm text-gray-700 mt-2">
            {t(
              "donor.contactAdmin",
              "Please contact the temple admin to create a donor account.",
            )}
          </p>
          <Link
            to="/"
            className="inline-block mt-4 text-[#8B0000] hover:underline font-medium"
          >
            ← {t("common.backToHome", "Back to Home")}
          </Link>
        </div>
      </div>
    </Container>
  );
};

export default DonorLogin;
