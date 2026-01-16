import React, { useState, useEffect } from "react";
import {
  View,
  StyleSheet,
  Text,
  Dimensions,
} from "react-native";
import MostPopularCard from "./MostPopularCard";

const productsData = require("../../assets/data/products.json");

const MostPopularSection = ({ onProductPress }) => {
  const [windowDimensions, setWindowDimensions] = useState(
    Dimensions.get("window")
  );
  const [popularProducts, setPopularProducts] = useState([]);

  const isSmallScreen = windowDimensions.width < 768;

  useEffect(() => {
    // Set up resize listener
    const subscription = Dimensions.addEventListener("change", ({ window }) => {
      setWindowDimensions(window);
    });

    // Randomize products
    const randomized = [...productsData]
      .sort(() => Math.random() - 0.5)
      .slice(0, 4); // Show 4 random products
    setPopularProducts(randomized);

    return () => subscription?.remove();
  }, []);

  const getContainerPadding = () => {
    if (windowDimensions.width < 600) return 20;
    if (windowDimensions.width < 1024) return 40;
    return 80;
  };

  return (
    <View
      style={[
        styles.section,
        {
          paddingHorizontal: getContainerPadding(),
          paddingTop: isSmallScreen ? 60 : 80,
          paddingBottom: isSmallScreen ? 60 : 100,
          backgroundColor: "#f5f5f5",
        },
      ]}
    >
      <View style={styles.sectionHeader}>
        <Text
          style={[
            styles.sectionSubtitle,
            { fontSize: isSmallScreen ? 12 : 14 },
          ]}
        >
          SHOP OUR
        </Text>
        <Text
          style={[
            styles.sectionTitle,
            { fontSize: isSmallScreen ? 28 : 36 },
          ]}
        >
          Most Popular
        </Text>
        <View style={styles.underline} />
      </View>

      <View style={styles.productsContainer}>
        {popularProducts.length > 0 ? (
          <View style={styles.productsGrid}>
            {popularProducts.map((item, index) => (
              <MostPopularCard
                key={item._id?.$oid || item.id || `popular-${index}`}
                item={item}
                onPress={onProductPress}
                isSmallScreen={isSmallScreen}
              />
            ))}
          </View>
        ) : (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No products available</Text>
          </View>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  section: {
    width: "100%",
    paddingTop: 80,
    paddingBottom: 100,
  },
  sectionHeader: {
    alignItems: "center",
    marginBottom: 50,
  },
  sectionSubtitle: {
    fontSize: 14,
    fontWeight: "400",
    color: "#1a1a1a",
    textAlign: "center",
    letterSpacing: 1,
    marginBottom: 8,
    fontFamily: "sans-serif",
  },
  sectionTitle: {
    fontSize: 36,
    fontWeight: "700",
    color: "#1a1a1a",
    textAlign: "center",
    letterSpacing: 1,
    marginBottom: 12,
    fontFamily: "sans-serif",
  },
  underline: {
    width: 100,
    height: 2,
    backgroundColor: "#1a1a1a",
    marginTop: 8,
  },
  productsContainer: {
    width: "100%",
  },
  productsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    alignItems: "flex-start",
    width: "100%",
  },
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 16,
    color: "#757575",
    fontFamily: "sans-serif",
  },
});

export default MostPopularSection;
