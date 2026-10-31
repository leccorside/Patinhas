export const APP_NAME = 'Patinhas';

export const MOBILE_APP_MAX_WIDTH_PX = 430;

export const PROXIMITY_RADII_KM = [5, 10, 25, 50, 100, 200] as const;

export const WARM_PAWS_COLORS = {
  primary: '#FF7043',
  primaryGradientStart: '#FF8A65',
  primaryGradientEnd: '#FF7043',
  secondary: '#4DB6AC',
  tertiary: '#FFF3E0',
  surface: '#FFFFFF',
  background: '#FAFAF8',
  backgroundDesktop: '#EDEDEB',
  textPrimary: '#263238',
  textSecondary: '#78909C',
  error: '#BA1A1A',
  success: '#2E7D32',
} as const;

export function formatDistanceKm(meters: number): string {
  if (meters < 1000) {
    return `${Math.round(meters)} m`;
  }
  return `${(meters / 1000).toFixed(1)} km`;
}

