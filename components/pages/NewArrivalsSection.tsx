import React, { useMemo, useRef, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  FlatList,
  Pressable,
  I18nManager,
  Platform,
} from "react-native";
import { Image } from "expo-image";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";

type Product = {
  id: string;
  title: string;
  image: any; // require(...) | {uri:string}
  price: number; // 할인 후
  originalPrice?: number; // 정가
  discountLabel?: string; // "20% OFF"
};

const { width: SCREEN_W } = Dimensions.get("window");
const PADDING_H = 16;
const GAP = 14;

const currency = (v: number) =>
  new Intl.NumberFormat(undefined, { style: "currency", currency: "INR", maximumFractionDigits: 0 })
    .format(v)
    .replace(/\u00A0/g, " ");

const DATA: Product[] = [
  {
    id: "1",
    title: "Exoblanc PDRN Mask",
    image: require("@/assets/images/partial-react-logo.png"), // 임시: 프로젝트에 이미지 추가
    price: 2000,
    originalPrice: 2500,
    discountLabel: "20% OFF",
  },
  {
    id: "2",
    title: "Medisco SkinGlow Mask",
    image: require("@/assets/images/partial-react-logo.png"),
    price: 3800,
  },
  {
    id: "3",
    title: "Collagen Recovery Pack",
    image: require("@/assets/images/partial-react-logo.png"),
    price: 2990,
    originalPrice: 3490,
    discountLabel: "15% OFF",
  },
];

export default function NewArrivalsSection() {
  // 카드 너비를 화면에 맞춰 반응형으로 설정
  const CARD_WIDTH = useMemo(
    () => (SCREEN_W - PADDING_H * 2 - GAP) / 2,
    []
  );

  const SNAP = CARD_WIDTH + GAP;

  const ref = useRef<FlatList>(null);
  const [index, setIndex] = useState(0);

  const toIndex = (next: number) => {
    const clamped = Math.max(0, Math.min(DATA.length - 1, next));
    ref.current?.scrollToOffset({ offset: clamped * SNAP, animated: true });
    setIndex(clamped);
  };

  return (
  <View style={styles.wrap}>
      <View style={styles.headerRow}>
        <Text style={styles.title}>
          <Text style={{ fontSize: 16 }}>🍀</Text> New Arrivals
        </Text>
        <Pressable onPress={() => toIndex(0)} style={styles.viewAllBtn}>
          <Text style={styles.viewAllText}>View All</Text>
        </Pressable>
      </View>

      <View>
        {/* 화살표는 그대로 사용해도 되고 필요 없으면 제거 */}
        {/* <Pressable onPress={() => toIndex(index - 1)} style={[styles.fab, { left: 6 }]}>
          <Ionicons name={I18nManager.isRTL ? "chevron-forward" : "chevron-back"} size={18} color="#0f172a" />
        </Pressable>
        <Pressable onPress={() => toIndex(index + 1)} style={[styles.fab, { right: 6 }]}>
          <Ionicons name={I18nManager.isRTL ? "chevron-back" : "chevron-forward"} size={18} color="#0f172a" />
        </Pressable> */}

        <FlatList
          ref={ref}
          horizontal
          data={DATA}
          keyExtractor={(it) => it.id}
          showsHorizontalScrollIndicator={false}
          // ✅ 한 카드 단위로 스냅
          snapToInterval={SNAP}
          decelerationRate={Platform.OS === "ios" ? "fast" : 0.98}
          // ✅ 좌우 패딩
          contentContainerStyle={{ paddingHorizontal: PADDING_H }}
          onMomentumScrollEnd={(e) => {
            const i = Math.round(e.nativeEvent.contentOffset.x / SNAP);
            setIndex(i);
          }}
          // ✅ 성능 최적화(선택)
          getItemLayout={(_, i) => ({
            length: SNAP,
            offset: SNAP * i,
            index: i,
          })}
          renderItem={({ item }) => <Card product={item} width={CARD_WIDTH} />}
          ItemSeparatorComponent={() => <View style={{ width: GAP }} />}
        />
      </View>
    </View>
  );
}

function Card({ product, width }: { product: Product; width: number }) {
  return (
    <View style={[styles.card, { width }]}>
      {/* 이미지 */}
      <View style={styles.imageWrap}>
        <Image
          source={product.image}
          style={styles.image}
          contentFit="cover"
          transition={200}
        />
        {/* 상단 라벨/뱃지 */}
        {!!product.discountLabel && (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{product.discountLabel}</Text>
          </View>
        )}
      </View>

      {/* Add to Cart */}
      <Pressable style={styles.cartBtn} android_ripple={{ color: "#00000010" }}>
        <Ionicons name="cart-outline" size={16} color="#0b1320" />
        <Text style={styles.cartBtnText}>Add to Cart</Text>
      </Pressable>

      {/* 상품명/가격 */}
      <Text numberOfLines={1} style={styles.name}>
        {product.title}
      </Text>

      <View style={styles.priceRow}>
        {!!product.originalPrice && (
          <Text style={styles.originalPrice}>{currency(product.originalPrice)}</Text>
        )}
        <Text style={[styles.price, { marginLeft: !!product.originalPrice ? 6 : 0 }]}>
          {currency(product.price)}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {  marginBottom: 4 },
  headerRow: {
    paddingBottom: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  title: {
    fontSize: 18,
    fontWeight: "800",
    color: "#0b1320",
  },
  viewAllBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: "#e2e8f0",
  },
  viewAllText: { color: "#0b1320", 
    fontWeight: "600",
     fontSize: 12 },

  card: {
    backgroundColor: "#fff",
    borderRadius: 18,
    overflow: "hidden",
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "#e5e7eb",
    elevation: 2,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 6 },
  },

  imageWrap: {
    height: 180,
    backgroundColor: "#f2f5f9",
  },
  image: { width: "100%", height: "100%" },

  badge: {
    position: "absolute",
    top: 10,
    left: 10,
    backgroundColor: "#ef4444",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
  },
  badgeText: { color: "#fff", fontWeight: "800", fontSize: 12 },

  cartBtn: {
    marginHorizontal: 12,
    marginTop: 12,
    borderRadius: 12,
    paddingVertical: 12,
    backgroundColor: "#f1f5f9",
    flexDirection: "row",
    gap: 8,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "#e2e8f0",
  },
  cartBtnText: { color: "#0b1320", fontWeight: "500", fontSize:12},

  name: {
    marginTop: 10,
    marginHorizontal: 12,
    color: "#0b1320",
    fontWeight: "700",
    fontSize:12
  },
  priceRow: {
    flexDirection: "row",
    alignItems: "baseline",
    paddingHorizontal: 12,
    marginBottom: 14,
    marginTop: 4,
    
  },
  originalPrice: {
    color: "#9ca3af",
    textDecorationLine: "line-through",
  },
  price: { color: "#ef4444", fontSize: 16, fontWeight: "900" },

  fab: {
    position: "absolute",
    top: 130,
    zIndex: 10,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#ffffffcc",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "#e2e8f0",
  },
});
