import React, { useCallback, useMemo, useRef, useState, useEffect} from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Pressable,
  I18nManager,
  Platform,
} from "react-native";
import { Image } from "expo-image";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";

// Import our responsive utilities
import { FontSizes, Spacing, Layout, hairlineWidth, rf, rs } from "@constants/Responsive";
import { useDynamicSafeArea, getSafeAreaPadding } from "@constants/SafeAreaUtils";
import apiService from "@/api";
import { getEncryptedData, toDeviceUrl } from "@/hooks/secureUtility";
import { Colors } from "@/constants/Colors";

type Product = {
  id: number;
  name: string;
  main_image?: any; // require(...) | {uri:string}
  price: number| string; // 할인 후
  originalPrice?: number; // 정가
  discount_price?: string; // "20% OFF"
};

const currency = (v: number) =>
  new Intl.NumberFormat(undefined, { 
    style: "currency", 
    currency: "INR", 
    maximumFractionDigits: 0 
  })
    .format(v)
    .replace(/\u00A0/g, " ");


export default function NewArrivalsSection() {
  const safeArea = useDynamicSafeArea();
  const [products, setProducts] = useState<Product[]>([]);
const [loading, setLoading] = useState(false);
  // Responsive card width calculation
  const CARD_WIDTH = useMemo(
    () => Layout.getCardWidth(Spacing.padding.screen, Spacing.gap.large),
    []
  );

  const SNAP = CARD_WIDTH + Spacing.gap.large;

  const ref = useRef<FlatList>(null);
  const [index, setIndex] = useState(0);

  const toIndex = (next: number) => {
    const clamped = Math.max(0, Math.min(DATA.length - 1, next));
    ref.current?.scrollToOffset({ offset: clamped * SNAP, animated: true });
    setIndex(clamped);
  };
  const getNewArrivalsProducts = useCallback(async () => {
    try {
      setLoading(true);
      const data = {
        category: "skincare",
        subcategory_name:'all'
      };
      const bodyData = getEncryptedData(data);
      const res = await apiService.fetchNewArrivalProducts(bodyData);
      if (res.header.api_status===200 && res.body) {
        setProducts(res.body.products);
      } else {
        console.error("❌ Failed to load products:", res.header.api_msg);
      }
    } catch (err) {
      console.error("❌ getNewArrivalsProducts error:", err);
    } finally {
      setLoading(false);
    }
  }, []);
  useEffect(() => {
    getNewArrivalsProducts();
  }, [getNewArrivalsProducts]);

  console.log('products', products)
  return (
    <SafeAreaView edges={['top']} style={styles.safeArea}>
      <View style={styles.wrap}>
        <View style={styles.headerRow}>
          <Text style={styles.title}>
            <Text style={{ fontSize: FontSizes.body.medium }}>🍀</Text> New Arrivals
          </Text>
          <Pressable onPress={() => toIndex(0)} style={styles.viewAllBtn}>
            <Text style={styles.viewAllText}>View All</Text>
          </Pressable>
        </View>

        <View>
        

          <FlatList
            ref={ref}
            horizontal
            data={products}
            keyExtractor={(it) => it.id}
            showsHorizontalScrollIndicator={false}
            snapToInterval={SNAP}
            decelerationRate={Platform.OS === "ios" ? "fast" : 0.98}
            contentContainerStyle={{ 
              paddingHorizontal: Spacing.padding.screen,
              // Add extra padding for safe area if needed
              paddingRight: Spacing.padding.screen + safeArea.right,
            }}
            onMomentumScrollEnd={(e) => {
              const i = Math.round(e.nativeEvent.contentOffset.x / SNAP);
              setIndex(i);
            }}
            getItemLayout={(_, i) => ({
              length: SNAP,
              offset: SNAP * i,
              index: i,
            })}
            renderItem={({ item }) => <Card product={item} width={CARD_WIDTH} />}
            ItemSeparatorComponent={() => <View style={{ width: Spacing.gap.large }} />}
          />
        </View>
      </View>
    </SafeAreaView>
  );
}


function Card({ product, width }: { product: Product; width: number }) {
  console.log("product", product)
  return (
    <View style={[styles.card, { width }]}>
      {/* Image */}
      <View style={styles.imageWrap}>
        <Image
          source={product.main_image}
          style={styles.image}
          contentFit="cover"
          transition={200}
        />
        {/* Discount Badge */}
        {!!product.discountLabel && (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{product.discountLabel}</Text>
          </View>
        )}
      </View>

    
      {/* Product Info */}
      <Text numberOfLines={1} style={styles.name}>
        {product.name}
      </Text>

      <View style={styles.priceRow}>
        {!!product.originalPrice && (
          <Text style={styles.originalPrice}>{currency(product.originalPrice)}</Text>
        )}
        <Text style={[styles.price, { 
          marginLeft: !!product.originalPrice ? Spacing.xs : 0 
        }]}>
          {currency(product.price)}
        </Text>
      </View>
      <View style={{marginBottom:Spacing.margin.small}}> 
          {/* Add to Cart Button */}
      <Pressable style={styles.cartBtn} android_ripple={{ color: "#00000010" }}>
        <Ionicons name="cart-outline" size={rf(16)} color="#0b1320" />
        <Text style={styles.cartBtnText}>Add to Cart</Text>
      </Pressable>

      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    backgroundColor: '#fff',
  },
  
  wrap: { 
    marginBottom: Spacing.margin.tiny,
  },
  
  headerRow: {
    paddingBottom: Spacing.padding.card,
    paddingHorizontal: Spacing.padding.screen,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  
  title: {
    fontSize: FontSizes.heading.h3,
    fontWeight: "800",
    color: "#0b1320",
  },
  
  viewAllBtn: {
    paddingHorizontal: Spacing.padding.card,
    paddingVertical: Spacing.xs,
    borderRadius: rs(999),
    backgroundColor: "#e2e8f0",
  },
  
  viewAllText: { 
    color: "#0b1320", 
    fontWeight: "600",
    fontSize: FontSizes.body.small,
  },

  card: {
    backgroundColor: "#fff",
    borderRadius: Spacing.card.borderRadius,
    overflow: "hidden",
    borderWidth: hairlineWidth,
    borderColor: "#e5e7eb",
    elevation: 2,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: rs(10),
    shadowOffset: { width: 0, height: rs(6) },
  },

  imageWrap: {
    height: Spacing.card.imageHeight,
    backgroundColor: "#f2f5f9",
  },
  
  image: { 
    width: "100%", 
    height: "100%" 
  },

  badge: {
    position: "absolute",
    top: Spacing.sm,
    left: Spacing.sm,
    backgroundColor: "#ef4444",
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: rs(10),
  },
  
  badgeText: { 
    color: "#fff", 
    fontWeight: "800", 
    fontSize: FontSizes.badge,
  },

  cartBtn: {
    marginHorizontal: Spacing.padding.card,
    marginTop: Spacing.padding.card,
    borderRadius: Spacing.button.borderRadius,
    paddingVertical: Spacing.padding.card,
    backgroundColor: Colors.btnBg,
    flexDirection: "row",
    gap: Spacing.gap.small,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: hairlineWidth,
    borderColor: Colors.borderColor,
  },
  
  cartBtnText: { 
    color: Colors.gray900, 
    fontWeight: "500", 
    fontSize: FontSizes.button.small,
  },

  name: {
    marginTop: Spacing.sm,
    marginHorizontal: Spacing.padding.card,
    color: Colors.gray900,
    fontWeight: "500",
    fontSize: FontSizes.body.small,
  },
  
  priceRow: {
    flexDirection: "row",
    alignItems: "baseline",
    paddingHorizontal: Spacing.padding.card,
   
    marginTop: Spacing.margin.tiny,
  },
  
  originalPrice: {
    color: Colors.gray800, 
    textDecorationLine: "line-through",
    fontSize: FontSizes.body.small,
  },
  
  price: { 
    color: Colors.gray800, 
    fontSize: FontSizes.price, 
    fontWeight: "700" 
  },

  fab: {
    position: "absolute",
    top: rs(130),
    zIndex: 10,
    width: rs(36),
    height: rs(36),
    borderRadius: rs(18),
    backgroundColor: "#ffffffcc",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: hairlineWidth,
    borderColor: "#e2e8f0",
  },
});