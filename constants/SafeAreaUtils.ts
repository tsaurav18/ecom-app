import { Platform, StatusBar } from 'react-native';

/**
 * Get fallback safe area values
 * These are static values that work without SafeAreaProvider
 */
export const getFallbackSafeArea = () => {
  const fallbackTop = Platform.OS === 'ios' ? 44 : StatusBar.currentHeight || 24;
  const fallbackBottom = Platform.OS === 'ios' ? 34 : 0;
  
  return {
    top: fallbackTop,
    bottom: fallbackBottom,
    left: 0,
    right: 0,
  };
};

/**
 * Hook to get safe area insets with fallbacks
 * Only use this if SafeAreaProvider is properly set up
 */
export const useDynamicSafeArea = () => {
  // For now, just return fallback values to prevent errors
  // This can be enhanced later when SafeAreaProvider is set up
  return getFallbackSafeArea();
};

/**
 * Get safe area aware padding - STATIC VERSION
 * Use this when you can't use hooks (outside components)
 */
export const getStaticSafeAreaPadding = (
  includeTop: boolean = true,
  includeBottom: boolean = true,
  includeHorizontal: boolean = false
) => {
  const safeArea = getFallbackSafeArea();
  
  return {
    paddingTop: includeTop ? safeArea.top : 0,
    paddingBottom: includeBottom ? safeArea.bottom : 0,
    paddingLeft: includeHorizontal ? safeArea.left : 0,
    paddingRight: includeHorizontal ? safeArea.right : 0,
  };
};

/**
 * Get safe area aware padding - HOOK VERSION
 * Use this inside React components
 */
export const getSafeAreaPadding = (
  includeTop: boolean = true,
  includeBottom: boolean = true,
  includeHorizontal: boolean = false
) => {
  const safeArea = useDynamicSafeArea();
  
  return {
    paddingTop: includeTop ? safeArea.top : 0,
    paddingBottom: includeBottom ? safeArea.bottom : 0,
    paddingLeft: includeHorizontal ? safeArea.left : 0,
    paddingRight: includeHorizontal ? safeArea.right : 0,
  };
};

/**
 * Check if device has notch/dynamic island (basic detection)
 */
export const hasNotch = (): boolean => {
  const safeArea = getFallbackSafeArea();
  
  // iPhone X and newer have top inset > 20
  if (Platform.OS === 'ios' && safeArea.top > 20) return true;
  
  // Android devices with notch
  if (Platform.OS === 'android' && safeArea.top > 24) return true;
  
  return false;
};

/**
 * Get status bar height for the current device
 */
export const getStatusBarHeight = (): number => {
  if (Platform.OS === 'ios') {
    return getFallbackSafeArea().top;
  } else {
    return StatusBar.currentHeight || 24;
  }
};

/**
 * Get static safe area styles - FUNCTION VERSION
 * Call this function to get styles with safe area padding
 */
export const getStaticSafeAreaStyles = () => {
  const safeArea = getFallbackSafeArea();
  
  return {
    // Full screen container with safe areas
    screen: {
      flex: 1,
      paddingTop: safeArea.top,
      paddingBottom: safeArea.bottom,
    },
    
    // Header container
    header: {
      paddingTop: safeArea.top,
    },
    
    // Content container (excludes top safe area)
    content: {
      flex: 1,
      paddingBottom: safeArea.bottom,
    },
    
    // Modal container
    modal: {
      flex: 1,
      paddingTop: safeArea.top,
      paddingBottom: safeArea.bottom,
    },
    
    // Bottom sheet/tab bar
    bottom: {
      paddingBottom: safeArea.bottom,
    },
  };
};

/**
 * Safe area aware container styles - HOOK VERSION
 * Use this inside React components with dynamic values
 */
export const SafeAreaStyles = () => {
  const safeArea = useDynamicSafeArea();
  
  return {
    // Full screen container with safe areas
    screen: {
      flex: 1,
      paddingTop: safeArea.top,
      paddingBottom: safeArea.bottom,
    },
    
    // Header container
    header: {
      paddingTop: safeArea.top,
    },
    
    // Content container (excludes top safe area)
    content: {
      flex: 1,
      paddingBottom: safeArea.bottom,
    },
    
    // Modal container
    modal: {
      flex: 1,
      paddingTop: safeArea.top,
      paddingBottom: safeArea.bottom,
    },
    
    // Bottom sheet/tab bar
    bottom: {
      paddingBottom: safeArea.bottom,
    },
  };
};