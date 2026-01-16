import React from "react";
import { StyleSheet, View, Image, Text } from "react-native";

const ProductCard = (props) => {
  const { name, image, price, countInStock } = props;

  return (
    <View style={styles.container}>
      <View style={styles.imageContainer}>
        <Image
          style={styles.image}
          source={{
            uri: image
              ? image
              : "https://bobbywhite.com/cdn/shop/products/Lionfront.jpg?v=1635864807&width=1080",
          }}
          resizeMode="contain"
        />
        {countInStock === 0 && (
          <View style={styles.outOfStockOverlay}>
            <Text style={styles.outOfStockText}>Out of Stock</Text>
          </View>
        )}
      </View>
      <View style={styles.contentContainer}>
        <Text style={styles.title} numberOfLines={2}>
          {name}
        </Text>
        <Text style={styles.price}>${price}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: "100%",
    backgroundColor: "#f5f5f5",
    marginBottom: 30,
  },
  imageContainer: {
    width: "100%",
    aspectRatio: 1,
    backgroundColor: "#ffffff",
    position: "relative",
    overflow: "hidden",
    justifyContent: "center",
    alignItems: "center",
  },
  image: {
    width: "100%",
    height: "100%",
    backgroundColor: "transparent",
  },
  outOfStockOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  outOfStockText: {
    color: "#ffffff",
    fontSize: 12,
    fontWeight: "500",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  contentContainer: {
    paddingTop: 12,
    paddingBottom: 12,
    paddingHorizontal: 0,
    alignItems: "flex-start",
    backgroundColor: "#f5f5f5",
  },
  title: {
    fontSize: 13,
    fontWeight: "400",
    color: "#1a1a1a",
    marginBottom: 6,
    lineHeight: 18,
    letterSpacing: 0,
  },
  price: {
    fontSize: 14,
    fontWeight: "400",
    color: "#1a1a1a",
    letterSpacing: 0,
  },
});

export default ProductCard;
