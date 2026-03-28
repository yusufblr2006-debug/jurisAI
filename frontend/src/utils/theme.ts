export const Colors = {
  bgPrimary: '#F0F2F5',
  bgSecondary: '#FFFFFF',
  accent: '#2563EB',
  accentLight: '#EFF6FF',
  navPill: '#111827',
  navPillActive: '#2563EB',
  textPrimary: '#111827',
  textSecondary: '#6B7280',
  textInverse: '#FFFFFF',
  success: '#10B981',
  warning: '#F59E0B',
  danger: '#DC2626',
  border: '#E5E7EB',
  overlayStart: 'rgba(17, 24, 39, 0.9)',
  overlayEnd: 'rgba(17, 24, 39, 0)',
};

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 40,
};

export const Radius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  pill: 100,
};

export const Shadow = {
  soft: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 2,
  } as const,
  medium: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 4,
  } as const,
};
