import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  SafeAreaView,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Dimensions,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import SearchedProducts from "../screens/Products/SearchedProducts";

const productsData = require("../assets/data/products.json");

// Default navigation items - can be overridden via props
const DEFAULT_NAV_ITEMS = [
  { id: "home", label: "HOME", route: "home" },
  { id: "jewellery", label: "JEWELLERY", route: "jewellery" },
  { id: "engagement", label: "ENGAGEMENT", route: "engagement" },
  { id: "watches", label: "WATCHES", route: "watches" },
];

const Header = ({
  navigationItems = DEFAULT_NAV_ITEMS,
  onNavigate,
  scrollY: externalScrollY,
}) => {
  const [windowDimensions, setWindowDimensions] = useState(
    Dimensions.get("window")
  );
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [internalScrollY, setInternalScrollY] = useState(0);
  const [productsFiltered, setProductsFiltered] = useState([]);
  const [products, setProducts] = useState([]);

  // Use external scrollY if provided, otherwise use internal
  const scrollY =
    externalScrollY !== undefined ? externalScrollY : internalScrollY;

  // Load products on mount
  useEffect(() => {
    setProducts(productsData);
  }, []);

  // Filter products based on search query
  useEffect(() => {
    if (searchQuery.trim().length > 0) {
      const filtered = products.filter((product) => {
        const query = searchQuery.toLowerCase();
        return (
          product.name?.toLowerCase().includes(query) ||
          product.description?.toLowerCase().includes(query) ||
          product.brand?.toLowerCase().includes(query)
        );
      });
      setProductsFiltered(filtered);
    } else {
      setProductsFiltered([]);
    }
  }, [searchQuery, products]);

  // Set up resize listener for dynamic updates
  useEffect(() => {
    const subscription = Dimensions.addEventListener("change", ({ window }) => {
      setWindowDimensions(window);
      // Close menu when screen size changes to large
      if (window.width >= 768) {
        setMenuOpen(false);
      }
    });

    return () => subscription?.remove();
  }, []);

  // Simple scroll listener for header opacity
  useEffect(() => {
    if (Platform.OS === "web" && typeof window !== "undefined") {
      const handleScroll = () => {
        // Try multiple methods to get scroll position
        const currentScrollY =
          window.scrollY ||
          window.pageYOffset ||
          (document.documentElement && document.documentElement.scrollTop) ||
          (document.body && document.body.scrollTop) ||
          0;
        setInternalScrollY(currentScrollY);
      };

      // Set initial value
      handleScroll();

      // Use requestAnimationFrame for smoother updates
      let ticking = false;
      const optimizedScroll = () => {
        if (!ticking) {
          window.requestAnimationFrame(() => {
            handleScroll();
            ticking = false;
          });
          ticking = true;
        }
      };

      // Listen to scroll on window
      if (window.addEventListener) {
        window.addEventListener("scroll", optimizedScroll, { passive: true });
        window.addEventListener("wheel", optimizedScroll, { passive: true });
      }

      // Also listen on document for better compatibility
      if (document && document.addEventListener) {
        document.addEventListener("scroll", optimizedScroll, { passive: true });
      }

      return () => {
        if (window.removeEventListener) {
          window.removeEventListener("scroll", optimizedScroll);
          window.removeEventListener("wheel", optimizedScroll);
        }
        if (document && document.removeEventListener) {
          document.removeEventListener("scroll", optimizedScroll);
        }
      };
    }
  }, []);

  // Calculate opacity: 0.7 at top, 0.95 after 200px scroll
  const getOpacity = () => {
    const maxScroll = 200;
    const minOpacity = 0.7;
    const maxOpacity = 0.95;

    if (scrollY <= 0) return minOpacity;
    if (scrollY >= maxScroll) return maxOpacity;

    return minOpacity + (scrollY / maxScroll) * (maxOpacity - minOpacity);
  };

  const isSmallScreen = windowDimensions.width < 768;

  const getContainerPadding = () => {
    if (windowDimensions.width < 600) return 20;
    if (windowDimensions.width < 1024) return 30;
    return 40;
  };

  const getContainerPaddingVertical = () => {
    if (windowDimensions.width < 768) return 15; // Less vertical padding on small screens
    return 20; // Less padding on large screens
  };

  const getContainerPaddingTop = () => {
    if (windowDimensions.width < 768) return 50; // More top padding on mobile for status bar
    return 0; // No extra top padding on large screens
  };

  const getBrandNameStyle = () => {
    if (windowDimensions.width < 600) {
      return {
        fontSize: 20,
        minWidth: 0,
        flex: 1,
        letterSpacing: 1,
      };
    } else if (windowDimensions.width < 768) {
      return {
        fontSize: 24,
        minWidth: 0,
        flex: 1,
        letterSpacing: 1.5,
      };
    }
    return {};
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View
        style={[
          styles.container,
          {
            paddingHorizontal: getContainerPadding(),
            paddingTop:
              getContainerPaddingTop() || getContainerPaddingVertical(),
            paddingBottom: getContainerPaddingVertical(),
            backgroundColor: `rgba(0, 0, 0, ${getOpacity()})`,
            ...(Platform.OS === "web" && {
              // React Native Web supports CSS transitions as inline styles
              transition: "background-color 0.3s ease-out",
            }),
          },
        ]}
      >
        {/* Brand Name - Left */}
        <TouchableOpacity
          onPress={() => onNavigate && onNavigate("home")}
          activeOpacity={0.7}
        >
          <Text style={[styles.brandName, getBrandNameStyle()]}>
            BURMES & CO.
          </Text>
        </TouchableOpacity>

        {/* Navigation Menu - Center (hidden on small screens) */}
        {!isSmallScreen && navigationItems.length > 0 && (
          <View style={styles.navMenu}>
            {navigationItems.map((item, index) => (
              <TouchableOpacity
                key={item.id || index}
                onPress={() => onNavigate && onNavigate(item.route)}
              >
                <Text style={styles.navItem}>{item.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* Right Side - Icons or Menu Button */}
        <View style={styles.rightContainer}>
          {isSmallScreen ? (
            <View style={styles.mobileHeaderIcons}>
              <TouchableOpacity
                style={styles.iconButton}
                onPress={() => setSearchOpen(!searchOpen)}
              >
                <Ionicons name="search-outline" size={24} color="#ffffff" />
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.menuButton}
                onPress={() => setMenuOpen(!menuOpen)}
              >
                <Ionicons name="menu" size={24} color="#ffffff" />
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.iconsContainer}>
              <TouchableOpacity style={styles.iconButton}>
                <Ionicons name="person-outline" size={24} color="#ffffff" />
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.iconButton}
                onPress={() => setSearchOpen(!searchOpen)}
              >
                <Ionicons name="search-outline" size={24} color="#ffffff" />
              </TouchableOpacity>
              <TouchableOpacity style={styles.iconButton}>
                <Ionicons name="bag-outline" size={24} color="#ffffff" />
              </TouchableOpacity>
            </View>
          )}
        </View>
      </View>

      {/* Search Bar Dropdown - Should appear right after header */}
      {searchOpen && (
        <View
          style={[
            styles.searchBarContainer,
            {
              paddingHorizontal: isSmallScreen ? 15 : 20,
            },
          ]}
        >
          <View style={styles.searchBar} className="searchBar rounded">
            <Ionicons
              name="search"
              size={20}
              color="#666"
              style={styles.searchIcon}
            />
            <TextInput
              placeholder="Search products..."
              placeholderTextColor="#999"
              value={searchQuery}
              onChangeText={setSearchQuery}
              style={styles.searchInput}
              autoFocus={true}
            />
            <TouchableOpacity
              style={styles.closeSearchButton}
              onPress={() => {
                setSearchOpen(false);
                setSearchQuery("");
                setProductsFiltered([]);
              }}
            >
              <Ionicons name="close" size={20} color="#666" />
            </TouchableOpacity>
          </View>
          {/* Display search results */}
          {searchQuery.trim().length > 0 && (
            <View style={styles.searchResultsContainer}>
              <SearchedProducts
                productsFiltered={productsFiltered}
                onProductPress={(product) => {
                  // Handle product press - you can navigate to product detail page
                  console.log("Product selected:", product);
                  setSearchOpen(false);
                  setSearchQuery("");
                  setProductsFiltered([]);
                }}
              />
            </View>
          )}
        </View>
      )}

      {/* Mobile Menu Dropdown */}
      {isSmallScreen && menuOpen && (
        <View style={styles.mobileMenu}>
          {/* Close Button Header */}
          <View style={styles.mobileMenuHeader}>
            <Text style={styles.mobileMenuTitle}>MENU</Text>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => {
                setMenuOpen(false);
                setSearchOpen(false);
              }}
            >
              <Ionicons name="close" size={24} color="#ffffff" />
            </TouchableOpacity>
          </View>

          {navigationItems.map((item, index) => (
            <TouchableOpacity
              key={item.id || index}
              style={styles.mobileMenuItem}
              onPress={() => {
                setMenuOpen(false);
                onNavigate && onNavigate(item.route);
              }}
            >
              <Text style={styles.mobileMenuText}>{item.label}</Text>
            </TouchableOpacity>
          ))}
          <View style={styles.mobileMenuIcons}>
            <TouchableOpacity style={styles.mobileIconButton}>
              <Ionicons name="person-outline" size={24} color="#ffffff" />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.mobileIconButton}
              onPress={() => {
                setMenuOpen(false);
                setSearchOpen(true);
              }}
            >
              <Ionicons name="search-outline" size={24} color="#ffffff" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.mobileIconButton}>
              <Ionicons name="bag-outline" size={24} color="#ffffff" />
            </TouchableOpacity>
          </View>
        </View>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    zIndex: 1000,
    backgroundColor: "transparent",
  },
  container: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.1)",
    width: "100%",
    minHeight: 60,
  },
  brandName: {
    fontSize: 32,
    fontWeight: "600",
    color: "#ffffff",
    letterSpacing: 2,
    textTransform: "uppercase",
    minWidth: 280,
    fontFamily: "'Cinzel', 'Playfair Display', Georgia, serif",
    flexShrink: 1,
  },
  navMenu: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  navItem: {
    fontSize: 13,
    fontWeight: "500",
    color: "#ffffff",
    letterSpacing: 1.5,
    textTransform: "uppercase",
    marginHorizontal: 15,
  },
  rightContainer: {
    flexDirection: "row",
    alignItems: "center",
    flexShrink: 0,
  },
  iconsContainer: {
    flexDirection: "row",
    justifyContent: "flex-end",
    alignItems: "center",
  },
  iconButton: {
    padding: 8,
    marginLeft: 15,
  },
  menuButton: {
    padding: 8,
    marginLeft: 0,
  },
  mobileHeaderIcons: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  // Mobile Menu
  mobileMenu: {
    backgroundColor: "rgba(0, 0, 0, 0.95)",
    paddingVertical: 20,
    paddingHorizontal: 20,
    width: "100%",
  },
  mobileMenuHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255, 255, 255, 0.2)",
  },
  mobileMenuTitle: {
    fontSize: 16,
    fontWeight: "400",
    color: "#ffffff",
    letterSpacing: 2,
    textTransform: "uppercase",
  },
  closeButton: {
    padding: 5,
  },
  mobileMenuItem: {
    paddingVertical: 18,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255, 255, 255, 0.1)",
  },
  mobileMenuText: {
    fontSize: 15,
    fontWeight: "400",
    color: "#ffffff",
    letterSpacing: 2,
    textTransform: "uppercase",
  },
  mobileMenuIcons: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 20,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: "rgba(255, 255, 255, 0.1)",
  },
  mobileIconButton: {
    padding: 10,
    marginHorizontal: 15,
  },
  // Search Bar
  searchBarContainer: {
    width: "100%",
    backgroundColor: "rgba(0, 0, 0, 0.95)",
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderTopWidth: 1,
    borderTopColor: "rgba(255, 255, 255, 0.1)",
    position: "relative",
    zIndex: 999,
  },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#ffffff",
    borderRadius: 4,
    paddingHorizontal: 15,
    paddingVertical: 10,
    minHeight: 44,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: "#1a1a1a",
    padding: 0,
    margin: 0,
  },
  closeSearchButton: {
    padding: 5,
    marginLeft: 10,
  },
  searchResultsContainer: {
    backgroundColor: "#ffffff",
    maxHeight: 400,
    marginTop: 10,
    borderRadius: 4,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    borderWidth: 1,
    borderColor: "#e0e0e0",
  },
});

export default Header;
