import React from "react";
import {
  View,
  StyleSheet,
  Text,
  Image,
  TouchableOpacity,
  Dimensions,
} from "react-native";

const MostPopularCard = ({ item, onPress, isSmallScreen }) => {
  const windowDimensions = Dimensions.get("window");
  const isMobile = windowDimensions.width < 600;
  const isTablet = windowDimensions.width >= 600 && windowDimensions.width < 1024;

  // Format price - convert to £ format
  const formatPrice = (price) => {
    if (!price) return "";
    const formattedPrice = `£${price.toLocaleString("en-GB", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
    return formattedPrice;
  };

  const getCardWidth = () => {
    if (isMobile) return "100%";
    if (isTablet) return "48%";
    // For desktop: 4 cards with space-between, so each card takes ~24% width
    return "24%";
  };

  return (
    <TouchableOpacity
      style={[
        styles.card,
        {
          width: getCardWidth(),
          marginBottom: isMobile ? 20 : 0,
        },
      ]}
      onPress={() => onPress && onPress(item)}
      activeOpacity={0.9}
    >
      <View style={styles.imageContainer}>
        <Image
          source={{
            uri: item.image
              ? item.image
              : "https://bobbywhite.com/cdn/shop/products/Lionfront.jpg?v=1635864807&width=1080",
          }}
          style={styles.image}
          resizeMode="cover"
        />
      </View>
      <View style={styles.contentContainer}>
        <Text style={styles.productName} numberOfLines={2}>
          {item.name?.toUpperCase() || "PRODUCT NAME"}
        </Text>
        <Text style={styles.price}>
          {item.price ? formatPrice(item.price) : "Price on request"}
        </Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#ffffff",
    marginBottom: 20,
  },
  imageContainer: {
    width: "100%",
    aspectRatio: 1,
    backgroundColor: "#f5f5f5",
    overflow: "hidden",
    marginBottom: 12,
  },
  image: {
    width: "100%",
    height: "100%",
  },
  contentContainer: {
    paddingHorizontal: 4,
    paddingBottom: 8,
  },
  productName: {
    fontSize: 13,
    fontWeight: "400",
    color: "#1a1a1a",
    marginBottom: 8,
    letterSpacing: 0.5,
    lineHeight: 18,
    fontFamily: "sans-serif",
  },
  price: {
    fontSize: 14,
    fontWeight: "400",
    color: "#1a1a1a",
    letterSpacing: 0.5,
    fontFamily: "sans-serif",
  },
});

export default MostPopularCard;
