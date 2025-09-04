import { Dimensions, PixelRatio } from 'react-native';
import { DeviceInterface } from "@constants/Types";
const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// Base dimensions (iPhone 14 Pro as reference: 393x852)
const BASE_WIDTH = 393;
const BASE_HEIGHT = 852;

// Get screen scale factor
const scale = SCREEN_WIDTH / BASE_WIDTH;
const verticalScale = SCREEN_HEIGHT / BASE_HEIGHT;

/**
 * Responsive font size based on screen width
 * @param size - Base font size
 * @returns Scaled font size
 */
export const rf = (size: number): number => {
  const scaledSize = size * scale;
  
  // Ensure minimum readability and maximum size limits
  const minSize = size * 0.85; // Don't go below 85% of original
  const maxSize = size * 1.25; // Don't go above 125% of original
  
  return Math.max(minSize, Math.min(scaledSize, maxSize));
};

/**
 * Responsive spacing/padding/margin based on screen width
 * @param size - Base spacing size
 * @returns Scaled spacing
 */
export const rs = (size: number): number => {
  return size * scale;
};

/**
 * Responsive height based on screen height
 * @param size - Base height size
 * @returns Scaled height
 */
export const rh = (size: number): number => {
  return size * verticalScale;
};

/**
 * Get pixel ratio for crisp borders and small elements
 */
export const hairlineWidth = PixelRatio.roundToNearestPixel(0.5);

// Font Sizes - Responsive Typography Scale
export const FontSizes = {
  // Display sizes (for large headings)
  display: {
    large: rf(32),   // Hero titles
    medium: rf(28),  // Section headers
    small: rf(24),   // Sub headers
  },
  
  // Heading sizes
  heading: {
    h1: rf(22),      // Page titles
    h2: rf(20),      // Section titles
    h3: rf(18),      // Subsection titles
    h4: rf(16),      // Card titles
    h5: rf(14),      // Small titles
    h6: rf(12),      // Tiny titles
  },
  
  // Body text sizes
  body: {
    large: rf(14),   // Primary content
    medium: rf(12),  // Secondary content
    small: rf(10),   // Captions, labels
    tiny: rf(8),    // Fine print
  },
  
  // Button text sizes
  button: {
    large: rf(16),
    medium: rf(14),
    small: rf(12),
  },
  
  // Special purpose
  price: rf(16),     // Product prices
  badge: rf(10),     // Small badges
  tab: rf(12),       // Tab labels
};

// Spacing System - Responsive Spacing Scale
export const Spacing = {
  // Base spacing units
  xs: rs(4),    // 4px base
  sm: rs(8),    // 8px base
  md: rs(12),   // 12px base
  lg: rs(16),   // 16px base
  xl: rs(20),   // 20px base
  xxl: rs(24),  // 24px base
  xxxl: rs(32), // 32px base
  
  // Semantic spacing
  padding: {
    screen: rs(16),        // Screen edge padding
    container: rs(16),     // Container padding
    card: rs(12),          // Card inner padding
    button: rs(12),        // Button padding
    section: rs(20),       // Between sections
  },
  
  margin: {
    tiny: rs(4),
    small: rs(8),
    medium: rs(12),
    large: rs(16),
    xlarge: rs(24),
    section: rs(32),       // Between major sections
  },
  
  gap: {
    tiny: rs(4),
    small: rs(8),
    medium: rs(12),
    large: rs(16),
    xlarge: rs(20),
  },
  
  // Component specific
  card: {
    borderRadius: rs(7),
    imageHeight: rh(180),
    minWidth: rs(160),     // Minimum card width
  },
  
  button: {
    borderRadius: rs(7),
    height: rh(44),        // Standard touch target
  },
  
  header: {
    height: rh(60),        // Standard header height
  },
};

// Layout helpers
export const Layout = {
  // Screen dimensions
  screen: {
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT,
  },
  
  // Breakpoints for different screen sizes
  breakpoints: {
    small: 320,    // Small phones
    medium: 375,   // Standard phones
    large: 414,    // Large phones
    xlarge: 480,   // Very large phones/small tablets
  },
  
  // Check if device is small
  isSmallDevice: SCREEN_WIDTH < 350,
  isLargeDevice: SCREEN_WIDTH > 400,
  
  // Card calculations for grids
  getCardWidth: (paddingHorizontal: number, gap: number, columns: number = 2) => {
    return (SCREEN_WIDTH - (paddingHorizontal * 2) - (gap * (columns - 1))) / columns;
  },
  
  // Get number of columns based on screen width
  getOptimalColumns: (): number => {
    if (SCREEN_WIDTH < 350) return 1;  // Very small screens
    if (SCREEN_WIDTH < 420) return 2;  // Standard phones
    return 3;  // Large phones/tablets
  },
};
  
  // Device type detection
  export const Device: DeviceInterface = {
    isSmallPhone: SCREEN_WIDTH < 350,
    isStandardPhone: SCREEN_WIDTH >= 350 && SCREEN_WIDTH < 420,
    isLargePhone: SCREEN_WIDTH >= 420,
  
    // Adjust values based on device type
    scale: {
      font: SCREEN_WIDTH < 350 ? 0.9 : SCREEN_WIDTH >= 420 ? 1.1 : 1,
      spacing: SCREEN_WIDTH < 350 ? 0.85 : SCREEN_WIDTH >= 420 ? 1.15 : 1,
    },
  };