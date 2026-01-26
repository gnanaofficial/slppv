import React, { useState, useEffect, useRef } from "react";
import {
  AppBar,
  Box,
  Toolbar,
  createTheme,
  Button,
  Container,
  Popper,
  Paper,
  Grow,
  MenuList,
  MenuItem,
  Divider,
  Typography,
  Drawer,
  IconButton,
  List,
  ListItemButton,
  ListItemText,
  Collapse,
  ListItemIcon,
} from "@mui/material";

import ammavaru from "@/assets/Cover/ammavaruHeader.png";
import HomeIcon from "@mui/icons-material/Home";
import MenuIcon from "@mui/icons-material/Menu";
import CloseIcon from "@mui/icons-material/Close";
import ExpandLess from "@mui/icons-material/ExpandLess";
import ExpandMore from "@mui/icons-material/ExpandMore";
import { useNavigate, useLocation, Link } from "react-router-dom";
import bannerImg from "@/assets/banner.png";
import LanguageToggle from "../LanguageToggle";
import { useTranslation } from "react-i18next";
import { useDonor } from "../../../context/DonorContext";
import PersonIcon from "@mui/icons-material/Person";

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useTranslation();
  const { donor, isAuthenticated, logout } = useDonor();
  const [isScrolled, setIsScrolled] = useState(false);
  const [openSevasMenu, setOpenSevasMenu] = useState(false);
  const [activeItem, setActiveItem] = useState(null);
  const sevasAnchorRef = useRef(null);

  // Mobile Menu State
  const [mobileOpen, setMobileOpen] = useState(false);
  const [mobileSevasOpen, setMobileSevasOpen] = useState(false);


  const theme = createTheme({
    breakpoints: {
      values: {
        "2xs": 0,
        xs: 425,
        sm: 640,
        md: 768,
        lg: 1024,
        xl: 1280,
        "2xl": 1536,
      },
    },
  });

  const sevasSubmenuGroups = [
    {
      items: [
        { id: 1, text: t("sevas.daily"), path: "/sevas/daily-sevas" },
        { id: 2, text: t("sevas.weekly"), path: "/sevas/weekly-sevas" },
        { id: 3, text: t("sevas.monthly"), path: "/sevas/monthly-sevas" },
        {
          id: 4,
          text: t("sevas.auspicious"),
          path: "/sevas/auspicious-sevas",
        },
      ],
    },
  ];

  const navItems = [
    {
      id: 1,
      text: "",
      icon: <HomeIcon />,
      path: "/",
      type: "page",
    },
    {
      id: 2,
      text: t("nav.about"),
      path: "/about",
      type: "page",
    },
    {
      id: 3,
      text: t("nav.sevas"),
      path: "/sevas",
      type: "section",
      hasSubmenu: true,
    },
    {
      id: 4,
      text: t("nav.contact"),
      path: "/contact",
      type: "page",
    },
    {
      id: 5,
      text: t("nav.trust"),
      path: "/trust-details",
      type: "page",
    },
    {
      id: 6,
      text: t("nav.gallery"),
      path: "/photo-gallery",
      type: "page",
    },
    {
      id: 7,
      text: t("nav.donate"),
      path: "/donate",
      type: "page",
    },
    {
      id: 8,
      text: "FeedBack",
      path: "/feedback",
      type: "page",
    },
  ];

  const handleNavigation = (item) => {
    setActiveItem(item.id);

    if (item.hasSubmenu) {
      setOpenSevasMenu(!openSevasMenu);
    } else {
      navigate(item.path);
    }
  };

  const handleSevasSubmenuItem = (path) => {
    navigate(path);
    setOpenSevasMenu(false);
  };

  const handleSevasMouseEnter = () => {
    setOpenSevasMenu(true);
  };

  const handleSevasMouseLeave = (e) => {
    const relatedTarget = e.relatedTarget;
    const submenu = document.getElementById("sevas-submenu");

    if (submenu && !submenu.contains(relatedTarget)) {
      setOpenSevasMenu(false);
    }
  };

  const handleSubmenuMouseEnter = () => {
    setOpenSevasMenu(true);
  };

  const handleSubmenuMouseLeave = () => {
    setOpenSevasMenu(false);
  };

  useEffect(() => {
    if (location.pathname === "/") {
      setActiveItem(1);
    } else {
      let matchFound = false;

      for (const item of navItems) {
        if (
          item.type === "page" &&
          location.pathname.startsWith(item.path) &&
          item.path !== "/"
        ) {
          setActiveItem(item.id);
          matchFound = true;
          break;
        }
      }

      if (!matchFound && location.pathname.startsWith("/sevas/")) {
        setActiveItem(3);
      }
    }
  }, [location]);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleMobileSevasClick = (e) => {
    e.stopPropagation();
    setMobileSevasOpen(!mobileSevasOpen);
  };

  const drawer = (
    <Box sx={{ width: 250, bgcolor: "#8B0000", height: "100%", color: "white" }}>
      <Box sx={{ display: "flex", justifyContent: "flex-end", p: 1 }}>
        <IconButton onClick={handleDrawerToggle} sx={{ color: "white" }}>
          <CloseIcon />
        </IconButton>
      </Box>
      <Divider sx={{ borderColor: "rgba(255,255,255,0.2)" }} />
      <List>
        {navItems.map((item) => (
          <React.Fragment key={item.id}>
            <ListItemButton
              onClick={(e) => {
                if (item.hasSubmenu) {
                  handleMobileSevasClick(e);
                } else {
                  handleNavigation(item);
                  setMobileOpen(false);
                }
              }}
              sx={{
                bgcolor: activeItem === item.id ? "rgba(0,0,0,0.2)" : "transparent"
              }}
            >
              {item.icon && <ListItemIcon sx={{ color: "white", minWidth: 40 }}>{item.icon}</ListItemIcon>}
              <ListItemText primary={item.text} />
              {item.hasSubmenu ? (mobileSevasOpen ? <ExpandLess /> : <ExpandMore />) : null}
            </ListItemButton>

            {item.hasSubmenu && (
              <Collapse in={mobileSevasOpen} timeout="auto" unmountOnExit>
                <List component="div" disablePadding sx={{ bgcolor: "rgba(0,0,0,0.1)" }}>
                  {sevasSubmenuGroups[0].items.map((subItem) => (
                    <ListItemButton
                      key={subItem.id}
                      sx={{ pl: 4 }}
                      onClick={() => {
                        handleSevasSubmenuItem(subItem.path);
                        setMobileOpen(false);
                      }}
                    >
                      <ListItemText primary={subItem.text} primaryTypographyProps={{ fontSize: '0.9rem' }} />
                    </ListItemButton>
                  ))}
                  <ListItemButton
                    sx={{ pl: 4, bgcolor: "rgba(0,0,0,0.2)" }}
                    onClick={() => {
                      handleSevasSubmenuItem("/sevas/booking");
                      setMobileOpen(false);
                    }}
                  >
                    <ListItemText primary="Book a Seva Online" primaryTypographyProps={{ fontSize: '0.9rem', fontWeight: 'bold' }} />
                  </ListItemButton>
                </List>
              </Collapse>
            )}
            <Divider sx={{ borderColor: "rgba(255,255,255,0.1)" }} />
          </React.Fragment>
        ))}
      </List>
    </Box>
  );


  return (
    <div className="mt-3 mb-4 md:mt-6 md:mb-6">
      <img
        src={bannerImg}
        className="flex justify-center items-center mx-auto 3xl:scale-90"
      />

      {/* Language Toggle and Donor Login */}
      <div className="hidden md:flex justify-end items-center gap-3 px-4 md:px-8 py-2">
        {isAuthenticated ? (
          <div className="flex items-center gap-2">
            <Button
              onClick={() => navigate("/donor/dashboard")}
              startIcon={<PersonIcon />}
              sx={{
                color: "#8B0000",
                bgcolor: "#FAAC2F",
                fontSize: { xs: "11px", sm: "13px" },
                padding: { xs: "4px 12px", sm: "6px 16px" },
                textTransform: "none",
                fontWeight: "bold",
                borderRadius: "20px",
                "&:hover": {
                  bgcolor: "#E09B28",
                },
              }}
            >
              {donor?.name || t("donor.myAccount", "My Account")}
            </Button>
            <Button
              onClick={logout}
              sx={{
                color: "#8B0000",
                fontSize: { xs: "11px", sm: "13px" },
                padding: { xs: "4px 12px", sm: "6px 16px" },
                textTransform: "none",
                border: "1px solid #8B0000",
                borderRadius: "20px",
                "&:hover": {
                  bgcolor: "rgba(139, 0, 0, 0.1)",
                },
              }}
            >
              {t("common.logout", "Logout")}
            </Button>
          </div>
        ) : (
          <Button
            onClick={() => navigate("/donor/login")}
            startIcon={<PersonIcon />}
            sx={{
              color: "#8B0000",
              bgcolor: "#FAAC2F",
              fontSize: { xs: "11px", sm: "13px" },
              padding: { xs: "4px 12px", sm: "6px 16px" },
              textTransform: "none",
              fontWeight: "bold",
              borderRadius: "20px",
              "&:hover": {
                bgcolor: "#E09B28",
              },
            }}
          >
            {t("donor.login", "Donor Login")}
          </Button>
        )}
        <LanguageToggle />
      </div>

      <AppBar
        position="static"
        className="border-t-2 border-[#FAAC2F]"
        sx={{
          bgcolor: "#8B0000",
          zIndex: 999,
        }}
      >
        <Container maxWidth="lg">
          <div className="h-10 px-0 flex justify-center items-center">

            {/* Mobile Menu Icon - Visible on XS/SM, Hidden on MD+ */}
            <Box sx={{ display: { xs: 'flex', md: 'none' }, width: '100%', justifyContent: 'space-between', alignItems: 'center', pl: 1, pr: 1 }}>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <IconButton
                  color="inherit"
                  aria-label="open drawer"
                  edge="start"
                  onClick={handleDrawerToggle}
                >
                  <MenuIcon />
                </IconButton>
                <Typography variant="h6" sx={{ ml: 1, fontSize: '1rem', fontWeight: 'bold' }}>
                  MENU
                </Typography>
              </Box>

              {/* Mobile Right Side Controls */}
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                {isAuthenticated ? (
                  <IconButton
                    onClick={() => navigate("/donor/dashboard")}
                    sx={{ color: "white" }}
                  >
                    <PersonIcon />
                  </IconButton>
                ) : (
                  <IconButton
                    onClick={() => navigate("/donor/login")}
                    sx={{ color: "white" }}
                  >
                    <PersonIcon />
                  </IconButton>
                )}

                <LanguageToggle className="!bg-transparent !shadow-none !p-1 !text-white hover:!bg-white/10" />
              </Box>
            </Box>

            {/* Desktop Menu - Hidden on XS/SM, Visible on MD+ */}
            <Box
              sx={{
                display: { xs: "none", md: "flex" },
                width: { md: "80%", lg: "60%" },
                height: "100%",
                overflowX: "visible",
                justifyContent: "center"
              }}
            >
              {navItems.map((item) => (
                <Button
                  key={item.id}
                  onClick={() => handleNavigation(item)}
                  onMouseEnter={
                    item.hasSubmenu ? handleSevasMouseEnter : undefined
                  }
                  onMouseLeave={
                    item.hasSubmenu ? handleSevasMouseLeave : undefined
                  }
                  ref={item.hasSubmenu ? sevasAnchorRef : null}
                  sx={{
                    height: "100%",
                    color: "#FFFFFF",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: { sm: "14px", md: "15px" },
                    textTransform: "none",
                    padding: { sm: "0 12px", md: "0 15px" },
                    borderRadius: 0,
                    borderRight: "2px solid #FAAC2F",
                    fontWeight: item.isHighlighted ? "bold" : "normal",
                    bgcolor:
                      activeItem === item.id
                        ? "rgba(0,0,0,0.2)"
                        : item.isHighlighted
                          ? "#8B0000"
                          : "transparent",
                    "&:hover": {
                      bgcolor: "rgba(0,0,0,0.2)",
                    },
                    flexGrow: item.isHighlighted ? 0 : 1,
                    minWidth: item.icon ? "40px" : "auto",
                    whiteSpace: "nowrap",
                    flexShrink: 0,
                  }}
                >
                  {item.icon || item.text}
                </Button>
              ))}

              {openSevasMenu && (
                <Popper
                  id="sevas-submenu"
                  open={openSevasMenu}
                  anchorEl={sevasAnchorRef.current}
                  placement="bottom-start"
                  transition
                  disablePortal
                  style={{ zIndex: 999 }}
                  onMouseEnter={handleSubmenuMouseEnter}
                  onMouseLeave={handleSubmenuMouseLeave}
                >
                  {({ TransitionProps }) => (
                    <Grow
                      {...TransitionProps}
                      style={{ transformOrigin: "top center" }}
                      timeout={200}
                    >
                      <Paper
                        sx={{
                          bgcolor: "#8B0000",
                          color: "#fff",
                          minWidth: "250px",
                          borderRadius: 0,
                          boxShadow: "0 8px 16px rgba(0,0,0,0.3)",
                          border: "1px solid #6B0000",
                          mt: 0,
                        }}
                        elevation={3}
                      >
                        <MenuList
                          sx={{ p: 1 }}
                          onMouseEnter={handleSubmenuMouseEnter}
                          onMouseLeave={handleSubmenuMouseLeave}
                        >
                          {sevasSubmenuGroups.map((group, index) => (
                            <React.Fragment key={index}>
                              {group.items.map((item, index) => (
                                <MenuItem
                                  key={index}
                                  onClick={() =>
                                    handleSevasSubmenuItem(item.path)
                                  }
                                  sx={{
                                    py: 0.7,
                                    px: 2,
                                    pl: 2,
                                    fontSize: "14px",
                                    "&:hover": {
                                      bgcolor: "rgba(255,255,255,0.1)",
                                    },
                                  }}
                                >
                                  {item.text}
                                </MenuItem>
                              ))}
                            </React.Fragment>
                          ))}
                          <Divider
                            sx={{
                              my: 1,
                              borderColor: "rgba(255,255,255,0.2)",
                            }}
                          />
                          <MenuItem
                            onClick={() => handleSevasSubmenuItem("/sevas/booking")}
                            sx={{
                              py: 1,
                              px: 2,
                              fontSize: "14px",
                              fontWeight: "bold",
                              color: "#FFFFFF",
                              bgcolor: "rgba(0,0,0,0.2)",
                              "&:hover": {
                                bgcolor: "rgba(0,0,0,0.3)",
                              },
                            }}
                          >
                            Book a Seva Online
                          </MenuItem>
                        </MenuList>
                      </Paper>
                    </Grow>
                  )}
                </Popper>
              )}
            </Box>
          </div>
        </Container>
      </AppBar>

      {/* Mobile Drawer */}
      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={handleDrawerToggle}
        ModalProps={{
          keepMounted: true, // Better open performance on mobile.
        }}
        sx={{
          display: { xs: 'block', md: 'none' },
          '& .MuiDrawer-paper': { boxSizing: 'border-box', width: 250, bgcolor: "#8B0000" },
        }}
      >
        {drawer}
      </Drawer>
    </div>
  );
};

export default Navbar;
