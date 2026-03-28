import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors, Radius } from '../utils/theme';

type Props = {
  level: string;
};

export default function RiskBadge({ level }: Props) {
  const isLow = level === 'low';
  const isHigh = level === 'high';
  const bg = isLow ? '#DCFCE7' : isHigh ? '#FEE2E2' : '#FEF3C7';
  const color = isLow ? '#16A34A' : isHigh ? '#DC2626' : '#D97706';
  const label = isLow ? 'LOW RISK' : isHigh ? 'HIGH RISK' : 'MEDIUM RISK';

  return (
    <View testID="risk-badge" style={[styles.badge, { backgroundColor: bg }]}>
      <Text style={[styles.text, { color }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: Radius.pill,
    alignSelf: 'flex-start',
  },
  text: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
});
