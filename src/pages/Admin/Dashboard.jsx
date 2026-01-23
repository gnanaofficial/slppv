import React, { useState } from "react";
import { Link, Outlet, useNavigate } from "react-router-dom";
import { auth } from "../../lib/firebase";

const Dashboard = () => {
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const handleLogout = async () => {
    await auth.signOut();
    navigate("/admin/login");
  };

  return (
    <div className="flex h-screen bg-[#FFF5E1]">
      {/* Sidebar */}
      <aside
        className={`bg-mainColor text-white w-64 space-y-6 py-7 px-2 absolute inset-y-0 left-0 transform ${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        } md:relative md:translate-x-0 transition duration-200 ease-in-out z-20 shadow-xl border-r-4 border-[#FFD700]`}
      >
        <div className="px-4">
          <h2 className="text-2xl font-bold text-center font-play">
            Admin Panel
          </h2>
        </div>
        <nav className="space-y-2 font-montserrat">
          <Link
            to="/admin"
            className="block py-2.5 px-4 rounded transition duration-200 hover:bg-[#8B0000] hover:text-white"
          >
            Dashboard Home
          </Link>
          <Link
            to="/admin/gallery"
            className="block py-2.5 px-4 rounded transition duration-200 hover:bg-[#8B0000] hover:text-white"
          >
            Manage Gallery
          </Link>
          <Link
            to="/admin/videos"
            className="block py-2.5 px-4 rounded transition duration-200 hover:bg-[#8B0000] hover:text-white"
          >
            Manage Videos
          </Link>
          <Link
            to="/admin/donors"
            className="block py-2.5 px-4 rounded transition duration-200 hover:bg-[#8B0000] hover:text-white"
          >
            Manage Donors
          </Link>
          <Link
            to="/admin/donors/manual-entry"
            className="block py-2.5 px-4 rounded transition duration-200 hover:bg-[#8B0000] hover:text-white pl-8"
          >
            ↳ Manual Entry
          </Link>
          <Link
            to="/admin/donors/history"
            className="block py-2.5 px-4 rounded transition duration-200 hover:bg-[#8B0000] hover:text-white pl-8"
          >
            ↳ Donor History
          </Link>
          <Link
            to="/admin/sevas"
            className="block py-2.5 px-4 rounded transition duration-200 hover:bg-[#8B0000] hover:text-white"
          >
            Manage Sevas
          </Link>
          <Link
            to="/admin/sub-admins"
            className="block py-2.5 px-4 rounded transition duration-200 hover:bg-[#8B0000] hover:text-white"
          >
            Sub-Admins
          </Link>
          <Link
            to="/admin/site-content"
            className="block py-2.5 px-4 rounded transition duration-200 hover:bg-[#8B0000] hover:text-white"
          >
            Site Content
          </Link>
        </nav>
        <div className="px-4 mt-auto">
          <button
            onClick={handleLogout}
            className="w-full py-2.5 px-4 rounded transition duration-200 bg-[#FFD700] text-mainColor font-bold hover:bg-yellow-400 flex items-center justify-center shadow-md"
          >
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header (Mobile toggle) */}
        <header className="bg-white shadow-md p-4 flex justify-between items-center md:hidden">
          <button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="text-mainColor focus:outline-none focus:text-[#8B0000]"
          >
            <svg
              className="h-6 w-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M4 6h16M4 12h16M4 18h16"
              />
            </svg>
          </button>
          <span className="text-xl font-semibold text-mainColor font-play">
            Admin Panel
          </span>
        </header>

        {/* Content Body */}
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-[#FFF5E1] p-6 font-montserrat">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default Dashboard;
