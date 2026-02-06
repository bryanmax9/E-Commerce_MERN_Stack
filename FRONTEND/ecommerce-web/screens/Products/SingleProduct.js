import React, { useEffect, useMemo, useState } from "react";
import {
  View,
  StyleSheet,
  Text,
  Image,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  useWindowDimensions,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Footer from "../../Shared/Footer";
import ProductCard from "./ProductCard";

const productsData = require("../../assets/data/products.json");

const getId = (x) => x?._id?.$oid || x?._id || x?.id;
const getCat = (x) => x?.category?.$oid || x?.category;

const toSource = (img) => {
  if (!img) return null;
  if (typeof img === "number") return img; // require(...)
  if (typeof img === "string" && /^https?:\/\//i.test(img)) return { uri: img }; // remote URL
  return null; // prevent broken {uri:"../assets/.."}
};

export default function SingleProduct({ product, onBack, onNavigate, onProductPress }) {
  const { width } = useWindowDimensions();
  const isSmall = width < 768;
  const isMobile = width < 600;
  const padding = width < 600 ? 20 : width < 1024 ? 40 : 80;

  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(false);
  const [related, setRelated] = useState([]);

  useEffect(() => {
    setSelectedImageIndex(0);
    setQuantity(1);

    if (!product) return setRelated([]);

    const cat = getCat(product);
    const pid = getId(product);

    setRelated(
      productsData
        .filter((p) => getCat(p) === cat && getId(p) !== pid && (p.countInStock || 0) > 0)
        .slice(0, 4)
    );
  }, [product]);

  const stock = Number(product?.countInStock) || 0;

  const images = useMemo(() => {
    if (!product) return [];
    if (Array.isArray(product.images) && product.images.length) return product.images;
    return product.image ? [product.image] : [];
  }, [product]);

  const mainSource = useMemo(() => {
    const selected = images[selectedImageIndex] || product?.image;
    return toSource(selected) || toSource(product?.image);
  }, [images, selectedImageIndex, product]);

  const formatPrice = (price) => {
    if (price == null) return "Price on request";
    const n = Number(price);
    if (Number.isNaN(n)) return "Price on request";
    return `$${n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const changeQty = (d) => {
    const next = quantity + d;
    if (next >= 1 && next <= stock) setQuantity(next);
  };

  const addToCart = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      Alert.alert("Added to cart", `Added ${quantity} ${product?.name} to cart!`);
    }, 400);
  };

  if (!product) {
    return (
      <View style={styles.center}>
        <Ionicons name="alert-circle-outline" size={64} color="#ccc" />
        <Text style={styles.muted}>Product not found</Text>
        {!!onBack && (
          <TouchableOpacity style={styles.simpleBtn} onPress={onBack}>
            <Text style={styles.simpleBtnText}>Go Back</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 24 }}>
      {!!onBack && (
        <TouchableOpacity
          style={[styles.backBtn, { top: isSmall ? 60 : 120, left: padding }]}
          onPress={onBack}
        >
          <Ionicons name="arrow-back" size={22} color="#1a1a1a" />
        </TouchableOpacity>
      )}

      <View
        style={[
          styles.row,
          {
            paddingHorizontal: padding,
            paddingTop: isSmall ? 90 : 150,
            flexDirection: isMobile ? "column" : "row",
          },
        ]}
      >
        <View style={{ width: isMobile ? "100%" : "50%", marginRight: isMobile ? 0 : 28 }}>
          <View style={styles.imageBox}>
            {mainSource ? (
              <Image source={mainSource} style={styles.image} resizeMode="contain" />
            ) : (
              <View style={styles.center}>
                <Ionicons name="image-outline" size={48} color="#bbb" />
                <Text style={styles.muted}>Image unavailable</Text>
              </View>
            )}
            {stock === 0 && (
              <View style={styles.overlay}>
                <Text style={styles.overlayText}>Out of Stock</Text>
              </View>
            )}
          </View>

          {images.length > 1 && (
            <View style={styles.thumbs}>
              {images.map((img, i) => {
                const src = toSource(img);
                return (
                  <TouchableOpacity
                    key={`${i}`}
                    style={[styles.thumb, i === selectedImageIndex && styles.thumbActive, !src && { opacity: 0.5 }]}
                    onPress={() => src && setSelectedImageIndex(i)}
                    disabled={!src}
                  >
                    {src ? (
                      <Image source={src} style={styles.thumbImg} />
                    ) : (
                      <View style={styles.thumbFallback}>
                        <Ionicons name="image-outline" size={18} color="#bbb" />
                      </View>
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>
          )}
        </View>

        <View style={{ width: isMobile ? "100%" : "50%", marginTop: isMobile ? 18 : 0 }}>
          {!!product.brand && <Text style={styles.brand}>{String(product.brand).toUpperCase()}</Text>}
          <Text style={[styles.title, { fontSize: isSmall ? 28 : 36 }]}>{product.name}</Text>

          <Text style={styles.price}>{formatPrice(product.price)}</Text>

          {!!product.description && <Text style={styles.desc}>{product.description}</Text>}

          <Text style={[styles.stock, { color: stock > 0 ? "#2E7D32" : "#D32F2F" }]}>
            {stock > 0 ? `In Stock (${stock})` : "Out of Stock"}
          </Text>

          {stock > 0 && (
            <>
              <View style={styles.qtyRow}>
                <TouchableOpacity onPress={() => changeQty(-1)} disabled={quantity <= 1} style={styles.qtyBtn}>
                  <Ionicons name="remove" size={18} color={quantity <= 1 ? "#ccc" : "#111"} />
                </TouchableOpacity>
                <Text style={styles.qtyVal}>{quantity}</Text>
                <TouchableOpacity onPress={() => changeQty(1)} disabled={quantity >= stock} style={styles.qtyBtn}>
                  <Ionicons name="add" size={18} color={quantity >= stock ? "#ccc" : "#111"} />
                </TouchableOpacity>
              </View>

              <TouchableOpacity style={styles.cartBtn} onPress={addToCart} disabled={loading}>
                {loading ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <Text style={styles.cartBtnText}>Add to Cart</Text>
                )}
              </TouchableOpacity>
            </>
          )}
        </View>
      </View>

      {related.length > 0 && (
        <View style={{ paddingHorizontal: padding, paddingTop: 24 }}>
          <Text style={styles.relatedTitle}>You May Also Like</Text>
          <View style={styles.grid}>
            {related.map((item, idx) => (
              <View key={getId(item) || `r-${idx}`} style={{ width: isMobile ? "48%" : "23%" }}>
                <ProductCard
                  name={item.name}
                  image={item.image}
                  price={item.price}
                  countInStock={item.countInStock}
                  onPress={() => onProductPress?.(item)}
                />
              </View>
            ))}
          </View>
        </View>
      )}

      <Footer onNavigate={onNavigate} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  row: { width: "100%" },

  backBtn: {
    position: "absolute",
    zIndex: 10,
    backgroundColor: "#fff",
    borderRadius: 25,
    width: 46,
    height: 46,
    justifyContent: "center",
    alignItems: "center",
    elevation: 5,
  },

  imageBox: {
    width: "100%",
    aspectRatio: 1,
    backgroundColor: "#f8f8f8",
    borderRadius: 8,
    overflow: "hidden",
    justifyContent: "center",
    alignItems: "center",
  },
  image: { width: "100%", height: "100%" },

  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.45)",
    justifyContent: "center",
    alignItems: "center",
  },
  overlayText: { color: "#fff", fontSize: 16, fontWeight: "700", textTransform: "uppercase" },

  thumbs: { flexDirection: "row", flexWrap: "wrap", marginTop: 12, gap: 10 },
  thumb: { width: 64, height: 64, borderRadius: 8, overflow: "hidden", borderWidth: 2, borderColor: "transparent" },
  thumbActive: { borderColor: "#111" },
  thumbImg: { width: "100%", height: "100%" },
  thumbFallback: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#f3f3f3" },

  brand: { color: "#757575", letterSpacing: 1.5, fontSize: 12, marginBottom: 8 },
  title: { fontWeight: "700", color: "#111", marginBottom: 10 },
  price: { fontSize: 26, fontWeight: "800", marginBottom: 12 },
  desc: { color: "#555", lineHeight: 22, marginBottom: 12 },
  stock: { fontWeight: "600", marginBottom: 12 },

  qtyRow: {
    flexDirection: "row",
    alignItems: "center",
    width: 130,
    borderWidth: 1,
    borderColor: "#e0e0e0",
    borderRadius: 6,
    marginBottom: 14,
  },
  qtyBtn: { padding: 10 },
  qtyVal: { flex: 1, textAlign: "center", fontWeight: "700" },

  cartBtn: { backgroundColor: "#111", borderRadius: 6, paddingVertical: 14, alignItems: "center" },
  cartBtnText: { color: "#fff", fontWeight: "800", letterSpacing: 1, textTransform: "uppercase" },

  relatedTitle: { fontSize: 20, fontWeight: "800", marginBottom: 14 },
  grid: { flexDirection: "row", flexWrap: "wrap", justifyContent: "space-between", rowGap: 14 },

  center: { flex: 1, justifyContent: "center", alignItems: "center", padding: 24 },
  muted: { marginTop: 10, color: "#757575" },

  simpleBtn: { marginTop: 14, paddingVertical: 10, paddingHorizontal: 16, borderWidth: 1, borderRadius: 8 },
  simpleBtnText: { fontWeight: "700" },
});
