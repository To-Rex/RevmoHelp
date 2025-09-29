/**
 * Centralized Color Scheme Management
 * 
 * This utility allows you to change the entire application's color scheme
 * with a single function call.
 */

import { getGlobalColorScheme, updateGlobalColorScheme, subscribeToGlobalSettings } from '../lib/globalSettings';
import type { GlobalColorScheme } from '../lib/globalSettings';

export type ColorScheme = 'default' | 'blue' | 'green' | 'purple' | 'orange' | 'teal' | 'red';

export interface CustomColorScheme {
  id: string;
  name: string;
  primary: string;
  primaryHover: string;
  primaryActive: string;
  primaryHover: string;
  primaryActive: string;
  description: string;
  isCustom: true;
  createdAt: string;
}

export interface ColorSchemeConfig {
  name: string;
  primary: string;
  primaryHover: string;
  primaryActive: string;
  background: string;
  items: string;
  description: string;
  isCustom?: boolean;
}

export const colorSchemes: Record<ColorScheme, ColorSchemeConfig> = {
  default: {
    name: 'Revmohelp (Default)',
    primary: '#90978C',
    primaryHover: '#7A8177',
    primaryActive: '#6B7268',
    background: '#CAD8D6',
    items: '#FFFFFF',
    description: 'Original brand colors'
  },
  blue: {
    name: 'Ocean Blue',
    primary: '#3B82F6',
    primaryHover: '#2563EB',
    primaryActive: '#1D4ED8',
    background: '#CAD8D6',
    items: '#FFFFFF',
    description: 'Professional blue theme'
  },
  green: {
    name: 'Medical Green',
    primary: '#10B981',
    primaryHover: '#059669',
    primaryActive: '#047857',
    background: '#CAD8D6',
    items: '#FFFFFF',
    description: 'Healthcare green theme'
  },
  purple: {
    name: 'Royal Purple',
    primary: '#8B5CF6',
    primaryHover: '#7C3AED',
    primaryActive: '#6D28D9',
    background: '#CAD8D6',
    items: '#FFFFFF',
    description: 'Premium purple theme'
  },
  orange: {
    name: 'Warm Orange',
    primary: '#F59E0B',
    primaryHover: '#D97706',
    primaryActive: '#B45309',
    background: '#CAD8D6',
    items: '#FFFFFF',
    description: 'Energetic orange theme'
  },
  teal: {
    name: 'Fresh Teal',
    primary: '#14B8A6',
    primaryHover: '#0D9488',
    primaryActive: '#0F766E',
    background: '#CAD8D6',
    items: '#FFFFFF',
    description: 'Modern teal theme'
  },
  red: {
    name: 'Medical Red',
    primary: '#EF4444',
    primaryHover: '#DC2626',
    primaryActive: '#B91C1C',
    background: '#CAD8D6',
    items: '#FFFFFF',
    description: 'Emergency red theme'
  }
};

/**
 * Get custom color schemes from localStorage
 */
export const getCustomColorSchemes = (): Record<string, CustomColorScheme> => {
  try {
    const saved = localStorage.getItem('revmoinfo-custom-color-schemes');
    return saved ? JSON.parse(saved) : {};
  } catch (error) {
    console.error('Error loading custom color schemes:', error);
    return {};
  }
};

/**
 * Save custom color scheme
 */
export const saveCustomColorScheme = (scheme: Omit<CustomColorScheme, 'id' | 'isCustom' | 'createdAt'> & { 
  primaryHover: string; 
  primaryActive: string; 
  background: string; 
  items: string; 
}): string => {
  const customSchemes = getCustomColorSchemes();
  const id = `custom-${Date.now()}`;
  
  const newScheme: CustomColorScheme = {
    ...scheme,
    id,
    isCustom: true,
    createdAt: new Date().toISOString()
  };
  
  customSchemes[id] = newScheme;
  localStorage.setItem('revmoinfo-custom-color-schemes', JSON.stringify(customSchemes));
  
  console.log(`✅ Custom color scheme saved: ${scheme.name}`);
  return id;
};

/**
 * Delete custom color scheme
 */
export const deleteCustomColorScheme = (id: string): boolean => {
  try {
    const customSchemes = getCustomColorSchemes();
    if (customSchemes[id]) {
      delete customSchemes[id];
      localStorage.setItem('revmoinfo-custom-color-schemes', JSON.stringify(customSchemes));
      console.log(`✅ Custom color scheme deleted: ${id}`);
      return true;
    }
    return false;
  } catch (error) {
    console.error('Error deleting custom color scheme:', error);
    return false;
  }
};

/**
 * Get all color schemes (built-in + custom)
 */
export const getAllColorSchemes = (): Record<string, ColorSchemeConfig | CustomColorScheme> => {
  const customSchemes = getCustomColorSchemes();
  return { ...colorSchemes, ...customSchemes };
};

/**
 * Generate hover and active colors from primary color
 */
export const generateColorVariants = (primaryColor: string): { hover: string; active: string } => {
  const rgb = hexToRgb(primaryColor);
  
  // Darken by 15% for hover
  const hoverRgb = {
    r: Math.max(0, Math.floor(rgb.r * 0.85)),
    g: Math.max(0, Math.floor(rgb.g * 0.85)),
    b: Math.max(0, Math.floor(rgb.b * 0.85))
  };
  
  // Darken by 25% for active
  const activeRgb = {
    r: Math.max(0, Math.floor(rgb.r * 0.75)),
    g: Math.max(0, Math.floor(rgb.g * 0.75)),
    b: Math.max(0, Math.floor(rgb.b * 0.75))
  };
  
  return {
    hover: `#${hoverRgb.r.toString(16).padStart(2, '0')}${hoverRgb.g.toString(16).padStart(2, '0')}${hoverRgb.b.toString(16).padStart(2, '0')}`,
    active: `#${activeRgb.r.toString(16).padStart(2, '0')}${activeRgb.g.toString(16).padStart(2, '0')}${activeRgb.b.toString(16).padStart(2, '0')}`
  };
};

/**
 * Apply colors directly to DOM from GlobalColorScheme
 */
export const applyGlobalColorScheme = (colorScheme: GlobalColorScheme): void => {
  console.log(`🎨 Applying global color scheme: ${colorScheme.name}`);
  
  const root = document.documentElement;

  // Update ALL CSS custom properties for immediate effect
  root.style.setProperty('--bg-primary', colorScheme.background);
  root.style.setProperty('--items-bg', colorScheme.items);
  root.style.setProperty('--bg-secondary', colorScheme.items);
  
  root.style.setProperty('--color-primary-500', colorScheme.primary);
  root.style.setProperty('--color-primary-600', colorScheme.primaryHover);
  root.style.setProperty('--color-primary-700', colorScheme.primaryActive);
  
  // Button and interactive colors
  root.style.setProperty('--bg-tertiary', colorScheme.primaryHover);
  root.style.setProperty('--bg-quaternary', colorScheme.primaryActive);
  
  // Text colors
  root.style.setProperty('--accent-primary', colorScheme.primary);
  root.style.setProperty('--accent-secondary', colorScheme.primaryHover);
  root.style.setProperty('--accent-hover', colorScheme.primaryActive);
  
  // Button colors
  root.style.setProperty('--btn-primary-bg', colorScheme.primary);
  root.style.setProperty('--btn-primary-hover', colorScheme.primaryHover);
  root.style.setProperty('--btn-primary-active', colorScheme.primaryActive);
  
  // Link colors
  root.style.setProperty('--link-color', colorScheme.primary);
  root.style.setProperty('--link-hover', colorScheme.primaryHover);
  
  // Focus colors
  root.style.setProperty('--focus-ring', colorScheme.primary);
  
  // Border colors (lighter versions)
  const primaryRgb = hexToRgb(colorScheme.primary);
  const borderColor = `rgba(${primaryRgb.r}, ${primaryRgb.g}, ${primaryRgb.b}, 0.3)`;
  const borderSecondaryColor = `rgba(${primaryRgb.r}, ${primaryRgb.g}, ${primaryRgb.b}, 0.2)`;
  
  root.style.setProperty('--border-primary', borderColor);
  root.style.setProperty('--border-secondary', borderSecondaryColor);
  
  // Shadow colors
  const shadowColor = `rgba(${primaryRgb.r}, ${primaryRgb.g}, ${primaryRgb.b}, 0.15)`;
  root.style.setProperty('--shadow-sm', shadowColor);
  root.style.setProperty('--shadow-md', `rgba(${primaryRgb.r}, ${primaryRgb.g}, ${primaryRgb.b}, 0.25)`);
  root.style.setProperty('--shadow-lg', `rgba(${primaryRgb.r}, ${primaryRgb.g}, ${primaryRgb.b}, 0.35)`);
  
  console.log(`✅ Global color scheme applied: ${colorScheme.name}`);
};

/**
 * Apply a color scheme to the application
 * @param scheme - The color scheme to apply
 * @param saveToServer - Whether to save the scheme to server for all users  
 * @param adminId - Admin ID for server operations
 */
export const applyColorScheme = (scheme: ColorScheme | string, saveToServer: boolean = false, adminId?: string): void => {
  const allSchemes = getAllColorSchemes();
  const config = allSchemes[scheme];
  
  if (!config) {
    console.error(`Color scheme not found: ${scheme}`);
    return;
  }
  
  // Convert to GlobalColorScheme format
  const globalScheme: GlobalColorScheme = {
    scheme: scheme,
    name: config.name,
    background: config.background || '#CAD8D6',
    primary: config.primary,
    primaryHover: config.primaryHover,
    primaryActive: config.primaryActive,
    items: config.items || '#FFFFFF',
    appliedAt: new Date().toISOString(),
    appliedBy: 'user'
  };
  
  // Apply colors immediately
  applyGlobalColorScheme(globalScheme);
  
  // Save preference to localStorage (personal preference)
  if (!saveToServer) {
    localStorage.setItem('revmohelp-color-scheme', scheme);
  }
  
  // If admin is applying globally, save to server
  if (saveToServer) {
    saveGlobalColorSchemeToServer(globalScheme, adminId);
  }
  
  console.log(`✅ Color scheme changed to: ${config.name}`);
};

/**
 * Save global color scheme to server (admin only)
 */
const saveGlobalColorSchemeToServer = async (colorScheme: GlobalColorScheme, adminId?: string): Promise<void> => {
  try {
    const { error } = await updateGlobalColorScheme(colorScheme, adminId);
    if (error) {
      console.error('❌ Error saving global color scheme:', error);
    } else {
      console.log(`🌍 Global color scheme saved to server: ${colorScheme.name}`);
    }
  } catch (error) {
    console.error('❌ Error saving global color scheme:', error);
  }
};

/**
 * Load and apply global color scheme from server
 */
export const loadGlobalColorScheme = async (): Promise<void> => {
  try {
    const { data: globalScheme } = await getGlobalColorScheme();
    if (globalScheme) {
      applyGlobalColorScheme(globalScheme);
      console.log(`🌍 Global color scheme loaded and applied: ${globalScheme.name}`);
    }
  } catch (error) {
    console.error('❌ Error loading global color scheme:', error);
    // Fallback to default
    const defaultScheme: GlobalColorScheme = {
      scheme: 'default',
      name: 'Revmoinfo Default',
      background: '#CAD8D6',
      primary: '#90978C',
      primaryHover: '#7A8177',
      primaryActive: '#6B7268',
      items: '#FFFFFF',
      appliedAt: new Date().toISOString(),
      appliedBy: 'system'
    };
    applyGlobalColorScheme(defaultScheme);
  }
};

/**
 * Initialize global color scheme subscription
 */
export const initializeGlobalColorScheme = (): (() => void) | null => {
  // Load initial global color scheme
  loadGlobalColorScheme();
  
  // Subscribe to changes
  const subscription = subscribeToGlobalSettings((newColorScheme) => {
    console.log('🔄 Global color scheme changed, applying to all users...');
    applyGlobalColorScheme(newColorScheme);
    
    // Show notification to user
    if (typeof window !== 'undefined') {
      const notification = document.createElement('div');
      notification.innerHTML = `
        <div style="
          position: fixed;
          top: 20px;
          right: 20px;
          background: ${newColorScheme.primary};
          color: white;
          padding: 12px 20px;
          border-radius: 8px;
          box-shadow: 0 4px 12px rgba(0,0,0,0.15);
          z-index: 9999;
          font-family: Inter, sans-serif;
          font-size: 14px;
          font-weight: 500;
        ">
          🎨 Sayt ranglari yangilandi: ${newColorScheme.name}
        </div>
      `;
      document.body.appendChild(notification);
      
      // Remove notification after 3 seconds
      setTimeout(() => {
        if (notification.parentNode) {
          notification.parentNode.removeChild(notification);
        }
      }, 3000);
    }
  });
  
  // Return cleanup function
  return () => {
    if (subscription) {
      subscription.unsubscribe();
    }
  };
};

/**
 * Apply a custom color scheme with 4 separate colors
 */
export const applyCustomColorScheme = (
  background: string,
  primary: string,
  primaryHover: string,
  primaryActive: string,
  items: string,
  saveGlobally: boolean = false,
  adminId?: string
): void => {
  const customScheme: GlobalColorScheme = {
    scheme: 'custom',
    name: 'Custom Color Scheme',
    background,
    primary,
    primaryHover,
    primaryActive,
    items,
    appliedAt: new Date().toISOString(),
    appliedBy: 'admin'
  };
  
  // Apply colors immediately
  applyGlobalColorScheme(customScheme);
  
  // Save globally if requested
  if (saveGlobally) {
    saveGlobalColorSchemeToServer(customScheme, adminId);
  } else {
    // Save as personal preference
    localStorage.setItem('revmoinfo-personal-color-scheme', JSON.stringify(customScheme));
  }
  
  console.log(`✅ Custom color scheme applied ${saveGlobally ? 'globally' : 'personally'}`);
};

/**
 * Convert hex color to RGB values
 */
const hexToRgb = (hex: string): { r: number; g: number; b: number } => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : { r: 144, g: 151, b: 140 }; // fallback to default
};

/**
 * Get the current color scheme from localStorage
 */
export const getCurrentColorScheme = (): string => {
  const saved = localStorage.getItem('revmohelp-color-scheme');
  const allSchemes = getAllColorSchemes();
  return saved && saved in allSchemes ? saved : 'default';
};

/**
 * Initialize color scheme on app load
 */
export const initializeColorScheme = (): void => {
  const currentScheme = getCurrentColorScheme();
  applyColorScheme(currentScheme);
};

/**
 * Quick color scheme switcher for development/admin
 * Usage: window.switchColorScheme('blue')
 */
if (typeof window !== 'undefined') {
  (window as any).switchColorScheme = applyColorScheme;
  (window as any).availableColorSchemes = Object.keys(colorSchemes);
  
  console.log('🎨 Color scheme utilities loaded:');
  console.log('- window.switchColorScheme(scheme) - Change color scheme');
  console.log('- window.availableColorSchemes - List available schemes');
  console.log('Available schemes:', Object.keys(colorSchemes));
}