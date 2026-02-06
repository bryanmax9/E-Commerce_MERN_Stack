import React, { useEffect, useState } from "react";
import { StatusBar } from "expo-status-bar";
import { StyleSheet, Text, View, Platform } from "react-native";
import ProductContainer from "./screens/Products/ProductContainer";
import SingleProduct from "./screens/Products/SingleProduct";
import LandingPage from "./screens/LandingPage";
import Collections from "./screens/Collections";
import MadeForYou from "./screens/MadeForYou";
import Header from "./Shared/Header";

// Set default font family for all Text components - industry standard approach
Text.defaultProps = Text.defaultProps || {};
Text.defaultProps.style = {
  fontFamily: "'Playfair Display', Georgia, 'Times New Roman', serif",
};

export default function App() {
  const [scrollY, setScrollY] = useState(0);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [showProducts, setShowProducts] = useState(false);
  const [showCollections, setShowCollections] = useState(false);
  const [showMadeForYou, setShowMadeForYou] = useState(false);
  const [showSingleProduct, setShowSingleProduct] = useState(false);

  // Load Google Fonts for web
  useEffect(() => {
    if (typeof document !== "undefined") {
      // Load Playfair Display for general text
      const playfairLink = document.createElement("link");
      playfairLink.href =
        "https://fonts.googleapis.com/css2?family=Playfair+Display:wght@300;400;500;600;700&display=swap";
      playfairLink.rel = "stylesheet";
      document.head.appendChild(playfairLink);

      // Load Cinzel for fancy jewelry logo (elegant serif font)
      const cinzelLink = document.createElement("link");
      cinzelLink.href =
        "https://fonts.googleapis.com/css2?family=Cinzel:wght@400;500;600;700&display=swap";
      cinzelLink.rel = "stylesheet";
      document.head.appendChild(cinzelLink);
    }
  }, []);

  const handleCategorySelect = (category) => {
    setSelectedCategory(category);
    setShowProducts(true);
    // Scroll to top when navigating to products (web only)
    if (
      Platform.OS === "web" &&
      typeof window !== "undefined" &&
      window.scrollTo
    ) {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handleNavigate = (route) => {
    if (route === "home") {
      setShowProducts(false);
      setShowCollections(false);
      setShowMadeForYou(false);
      setShowSingleProduct(false);
      setSelectedCategory(null);
      setSelectedProduct(null);
      // Scroll to top when navigating to home (web only)
      if (
        Platform.OS === "web" &&
        typeof window !== "undefined" &&
        window.scrollTo
      ) {
        window.scrollTo({ top: 0, behavior: "smooth" });
      }
    }
  };

  const handleProductSelect = (product) => {
    setSelectedProduct(product);
    setShowSingleProduct(true);
    setShowProducts(false);
    // Scroll to top when navigating to product (web only)
    if (
      Platform.OS === "web" &&
      typeof window !== "undefined" &&
      window.scrollTo
    ) {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handleBackFromProduct = () => {
    setShowSingleProduct(false);
    setShowProducts(true);
    // Scroll to top when going back (web only)
    if (
      Platform.OS === "web" &&
      typeof window !== "undefined" &&
      window.scrollTo
    ) {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handleShopCollections = () => {
    setShowCollections(true);
    setShowProducts(false);
    setShowMadeForYou(false);
    // Scroll to top when navigating to collections (web only)
    if (
      Platform.OS === "web" &&
      typeof window !== "undefined" &&
      window.scrollTo
    ) {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handleMadeForYou = () => {
    setShowMadeForYou(true);
    setShowCollections(false);
    setShowProducts(false);
    // Scroll to top when navigating to MadeForYou (web only)
    if (
      Platform.OS === "web" &&
      typeof window !== "undefined" &&
      window.scrollTo
    ) {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  return (
    <View style={styles.container}>
      <Header scrollY={scrollY} onNavigate={handleNavigate} />
      {showSingleProduct ? (
        <SingleProduct
          product={selectedProduct}
          onBack={handleBackFromProduct}
          onNavigate={handleNavigate}
          onProductPress={handleProductSelect}
        />
      ) : showProducts ? (
        <ProductContainer
          onScroll={setScrollY}
          selectedCategory={selectedCategory}
          onProductPress={handleProductSelect}
        />
      ) : showCollections ? (
        <Collections onCategorySelect={handleCategorySelect} onNavigate={handleNavigate} />
      ) : showMadeForYou ? (
        <MadeForYou onNavigate={handleNavigate} />
      ) : (
        <LandingPage
          onCategorySelect={handleCategorySelect}
          onShopCollections={handleShopCollections}
          onMadeForYou={handleMadeForYou}
          onNavigate={handleNavigate}
          onProductPress={handleProductSelect}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    width: "100%",
  },
});
