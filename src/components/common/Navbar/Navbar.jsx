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
} from "@mui/material";

import ammavaru from "@/assets/Cover/ammavaruHeader.png";
import HomeIcon from "@mui/icons-material/Home";
import { useNavigate, useLocation, Link } from "react-router-dom";
import bannerImg from "@/assets/banner.png";

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isScrolled, setIsScrolled] = useState(false);
  const [openSevasMenu, setOpenSevasMenu] = useState(false);
  const [activeItem, setActiveItem] = useState(null);
  const sevasAnchorRef = useRef(null);

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
        { id: 1, text: "Daily Sevas", path: "/sevas/daily-sevas" },
        { id: 2, text: "Weekly Sevas", path: "/sevas/weekly-sevas" },
        { id: 3, text: "Monthly Sevas", path: "/sevas/monthly-sevas" },
        {
          id: 4,
          text: "Auspicious",
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
      text: "About",
      path: "/about",
      type: "page",
    },
    {
      id: 3,
      text: "Sevas",
      path: "/sevas", // Changed from '#sevas'
      type: "section",
      hasSubmenu: true,
    },
    {
      id: 4,
      text: "Contact",
      path: "/contact",
      type: "page",
    },
    {
      id: 5,
      text: "Trust",
      path: "/trust-details",
      type: "page",
    },
    {
      id: 6,
      text: "Photo Gallery",
      path: "/photo-gallery",
      type: "page",
    },
    {
      id: 7,
      text: "Donate",
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
      // If the item has a submenu, toggle the submenu
      setOpenSevasMenu(!openSevasMenu);
    } else {
      // For regular navigation
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
      setActiveItem(1); // Home
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

  return (
    <div className="mt-3 mb-4 md:mt-6 md:mb-6">
      {/* <Box
        sx={{
          backgroundImage: `url(${bannerImg})`,
          backgroundSize: "contain",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
          py: 1,
          px: { xs: 2, md: 5 },
          height: { xs: 120, sm: 120, md: 120, lg: 150 },
        }}
      ></Box> */}
      <img
        src={bannerImg}
        className="flex justify-center items-center mx-auto 3xl:scale-90"
      />

      <AppBar
        position="static"
        className="border-t-2 border-[#FAAC2F]"
        sx={{
          bgcolor: "#8B0000",
          zIndex: 999,
        }}
      >
        <Container maxWidth="lg">
          <div className="h-10 px-0 flex justify-center">
            <Box
              sx={{
                display: "flex",
                width: { xs: "100%", sm: "90%", md: "80%", lg: "60%" },
                height: "100%",
                overflowX: { xs: "auto", md: "visible" },
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
                    fontSize: { xs: "12px", sm: "14px", md: "15px" },
                    textTransform: "none",
                    padding: { xs: "0 8px", sm: "0 12px", md: "0 15px" },
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
    </div>
  );
};

export default Navbar;
