import React, { useState, useEffect } from "react";
import { Link, Outlet, useNavigate, useLocation } from "react-router-dom";
import { auth } from "../../lib/firebase";
import {
  MdDashboard,
  MdPhotoLibrary,
  MdVideoLibrary,
  MdPeople,
  MdSettings,
  MdLogout,
  MdMenu,
  MdClose,
  MdChevronRight,
  MdChevronLeft,
  MdExpandMore,
  MdExpandLess,
  MdPersonAdd,
  MdHistory,
  MdTempleHindu,
  MdAdminPanelSettings,
  MdWeb,
  MdEmail,
  MdAttachMoney,
  MdImage,
  MdAccessTime, // Added MdAccessTime for the Clock icon
} from "react-icons/md";
import { useAdmin } from "../../context/AdminContext";

const Dashboard = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { isMainAdmin } = useAdmin();

  // Sidebar state - persist in localStorage
  const [isSidebarOpen, setIsSidebarOpen] = useState(() => {
    const saved = localStorage.getItem("adminSidebarOpen");
    return saved !== null ? JSON.parse(saved) : true;
  });

  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  // Dropdown states
  const [openDropdowns, setOpenDropdowns] = useState(() => {
    const saved = localStorage.getItem("adminDropdowns");
    return saved !== null
      ? JSON.parse(saved)
      : {
          donors: false,
          content: false,
          settings: false,
        };
  });

  // Persist sidebar state
  useEffect(() => {
    localStorage.setItem("adminSidebarOpen", JSON.stringify(isSidebarOpen));
  }, [isSidebarOpen]);

  // Persist dropdown states
  useEffect(() => {
    localStorage.setItem("adminDropdowns", JSON.stringify(openDropdowns));
  }, [openDropdowns]);

  const handleLogout = async () => {
    await auth.signOut();
    navigate("/temple-management/login");
  };

  const toggleDropdown = (key) => {
    setOpenDropdowns((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const toggleMobileSidebar = () => {
    setIsMobileSidebarOpen(!isMobileSidebarOpen);
  };

  // Close mobile sidebar when route changes
  useEffect(() => {
    setIsMobileSidebarOpen(false);
  }, [location.pathname]);

  // Check if current path matches
  const isActive = (path) => location.pathname === path;
  const isParentActive = (paths) =>
    paths.some((path) => location.pathname.startsWith(path));

  return (
    <div className="flex h-screen bg-[#FFF5E1] overflow-hidden">
      {/* Sidebar */}
      <aside
        className={`bg-mainColor text-white fixed inset-y-0 left-0 z-30 transform transition-all duration-300 ease-in-out shadow-2xl border-r-4 border-[#FFD700] ${
          isSidebarOpen ? "w-64" : "w-20"
        } ${
          isMobileSidebarOpen ? "translate-x-0" : "-translate-x-full"
        } lg:translate-x-0 lg:static flex flex-col`}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-[#8B0000]">
          {isSidebarOpen && (
            <h2 className="text-xl font-bold font-play truncate">
              Admin Panel
            </h2>
          )}
          <button
            onClick={toggleSidebar}
            className="hidden lg:block p-2 rounded-lg hover:bg-[#8B0000] transition-colors"
            title={isSidebarOpen ? "Collapse sidebar" : "Expand sidebar"}
          >
            {isSidebarOpen ? (
              <MdChevronLeft className="w-5 h-5" />
            ) : (
              <MdChevronRight className="w-5 h-5" />
            )}
          </button>
          <button
            onClick={toggleMobileSidebar}
            className="lg:hidden p-2 rounded-lg hover:bg-[#8B0000] transition-colors"
          >
            <MdClose className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-4 px-2 space-y-1 font-montserrat scrollbar-thin scrollbar-thumb-[#8B0000] scrollbar-track-transparent">
          {/* Dashboard Home */}
          <NavItem
            to="/temple-management"
            icon={<MdDashboard />}
            label="Dashboard"
            isActive={isActive("/temple-management")}
            isCollapsed={!isSidebarOpen}
          />

          {/* Manage Gallery */}
          <NavItem
            to="/temple-management/gallery"
            icon={<MdPhotoLibrary />}
            label="Gallery"
            isActive={isActive("/temple-management/gallery")}
            isCollapsed={!isSidebarOpen}
          />

          {/* Daily Schedule */}
          <NavItem
            to="/temple-management/daily-sevas"
            icon={<MdAccessTime />}
            label="Daily Schedule"
            isActive={isActive("/temple-management/daily-sevas")}
            isCollapsed={!isSidebarOpen}
          />

          {/* Manage Videos */}
          <NavItem
            to="/temple-management/videos"
            icon={<MdVideoLibrary />}
            label="Videos"
            isActive={isActive("/temple-management/videos")}
            isCollapsed={!isSidebarOpen}
          />

          {/* Manage Donors - Dropdown */}
          <DropdownMenu
            icon={<MdPeople />}
            label="Donors"
            isOpen={openDropdowns.donors}
            onToggle={() => toggleDropdown("donors")}
            isCollapsed={!isSidebarOpen}
            isActive={isParentActive(["/temple-management/donors"])}
          >
            <NavItem
              to="/temple-management/donors"
              icon={<MdPeople />}
              label="All Donors"
              isActive={isActive("/temple-management/donors")}
              isCollapsed={!isSidebarOpen}
              isSubItem
            />
            <NavItem
              to="/temple-management/donors/manual-entry"
              icon={<MdPersonAdd />}
              label="Manual Entry"
              isActive={isActive("/temple-management/donors/manual-entry")}
              isCollapsed={!isSidebarOpen}
              isSubItem
            />
            <NavItem
              to="/temple-management/donors/history"
              icon={<MdHistory />}
              label="History"
              isActive={isActive("/temple-management/donors/history")}
              isCollapsed={!isSidebarOpen}
              isSubItem
            />
          </DropdownMenu>

          {/* Manage Content - Dropdown */}
          <DropdownMenu
            icon={<MdWeb />}
            label="Content"
            isOpen={openDropdowns.content}
            onToggle={() => toggleDropdown("content")}
            isCollapsed={!isSidebarOpen}
            isActive={isParentActive([
              "/temple-management/hero-images",
              "/temple-management/gallery-images",
              "/temple-management/sevas",
              "/temple-management/site-content",
            ])}
          >
            <NavItem
              to="/temple-management/hero-images"
              icon={<MdImage />}
              label="Hero Images"
              isActive={isActive("/temple-management/hero-images")}
              isCollapsed={!isSidebarOpen}
              isSubItem
            />
            <NavItem
              to="/temple-management/gallery-images"
              icon={<MdPhotoLibrary />}
              label="Gallery Images"
              isActive={isActive("/temple-management/gallery-images")}
              isCollapsed={!isSidebarOpen}
              isSubItem
            />
            <NavItem
              to="/temple-management/sevas"
              icon={<MdTempleHindu />}
              label="Sevas"
              isActive={isActive("/temple-management/sevas")}
              isCollapsed={!isSidebarOpen}
              isSubItem
            />
            <NavItem
              to="/temple-management/site-content"
              icon={<MdWeb />}
              label="Site Content"
              isActive={isActive("/temple-management/site-content")}
              isCollapsed={!isSidebarOpen}
              isSubItem
            />
          </DropdownMenu>

          {/* Settings - Dropdown */}
          <DropdownMenu
            icon={<MdSettings />}
            label="Settings"
            isOpen={openDropdowns.settings}
            onToggle={() => toggleDropdown("settings")}
            isCollapsed={!isSidebarOpen}
            isActive={isParentActive([
              "/temple-management/sub-admins",
              "/temple-management/email",
              "/temple-management/payment",
            ])}
          >
            {isMainAdmin() && (
              <NavItem
                to="/temple-management/sub-admins"
                icon={<MdAdminPanelSettings />}
                label="Sub-Admins"
                isActive={isActive("/temple-management/sub-admins")}
                isCollapsed={!isSidebarOpen}
                isSubItem
              />
            )}
            <NavItem
              to="/temple-management/email-config"
              icon={<MdEmail />}
              label="Email Config"
              isActive={isActive("/temple-management/email-config")}
              isCollapsed={!isSidebarOpen}
              isSubItem
            />
            <NavItem
              to="/temple-management/site-settings"
              icon={<MdSettings />}
              label="Site Settings"
              isActive={isActive("/temple-management/site-settings")}
              isCollapsed={!isSidebarOpen}
              isSubItem
            />
          </DropdownMenu>
        </nav>

        {/* Logout Button */}
        <div className="p-4 border-t border-[#8B0000]">
          <button
            onClick={handleLogout}
            className={`w-full py-3 px-4 rounded-lg transition-all duration-200 bg-[#FFD700] text-mainColor font-bold hover:bg-yellow-400 flex items-center shadow-md ${
              isSidebarOpen ? "justify-center gap-2" : "justify-center"
            }`}
            title="Logout"
          >
            <MdLogout className="w-5 h-5" />
            {isSidebarOpen && <span>Logout</span>}
          </button>
        </div>
      </aside>

      {/* Mobile Overlay */}
      {isMobileSidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-20 lg:hidden"
          onClick={toggleMobileSidebar}
        />
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-white shadow-md p-4 flex justify-between items-center">
          <button
            onClick={toggleMobileSidebar}
            className="lg:hidden text-mainColor focus:outline-none focus:text-[#8B0000] p-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <MdMenu className="h-6 w-6" />
          </button>
          <span className="text-xl font-semibold text-mainColor font-play">
            {isSidebarOpen ? "" : "Admin Panel"}
          </span>
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <span className="hidden sm:inline">Welcome, Admin</span>
          </div>
        </header>

        {/* Content Body */}
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-[#FFF5E1] p-6 font-montserrat">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

// NavItem Component
const NavItem = ({
  to,
  icon,
  label,
  isActive,
  isCollapsed,
  isSubItem = false,
}) => {
  return (
    <Link
      to={to}
      className={`flex items-center gap-3 py-3 px-4 rounded-lg transition-all duration-200 ${
        isActive
          ? "bg-[#8B0000] text-white shadow-lg"
          : "hover:bg-[#8B0000] hover:bg-opacity-50 text-white"
      } ${isSubItem ? "ml-4" : ""} ${isCollapsed ? "justify-center" : ""}`}
      title={isCollapsed ? label : ""}
    >
      <span className="text-xl flex-shrink-0">{icon}</span>
      {!isCollapsed && <span className="truncate">{label}</span>}
    </Link>
  );
};

// DropdownMenu Component
const DropdownMenu = ({
  icon,
  label,
  isOpen,
  onToggle,
  isCollapsed,
  isActive,
  children,
}) => {
  return (
    <div>
      <button
        onClick={onToggle}
        className={`w-full flex items-center gap-3 py-3 px-4 rounded-lg transition-all duration-200 ${
          isActive
            ? "bg-[#8B0000] bg-opacity-70 text-white"
            : "hover:bg-[#8B0000] hover:bg-opacity-50 text-white"
        } ${isCollapsed ? "justify-center" : "justify-between"}`}
        title={isCollapsed ? label : ""}
      >
        <div className="flex items-center gap-3">
          <span className="text-xl flex-shrink-0">{icon}</span>
          {!isCollapsed && <span className="truncate">{label}</span>}
        </div>
        {!isCollapsed && (
          <span className="text-lg">
            {isOpen ? <MdExpandLess /> : <MdExpandMore />}
          </span>
        )}
      </button>
      {isOpen && !isCollapsed && (
        <div className="mt-1 space-y-1 animate-slideDown">{children}</div>
      )}
    </div>
  );
};

export default Dashboard;
