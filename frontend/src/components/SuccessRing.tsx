import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import { Colors, Shadow, Radius } from '../utils/theme';

type Props = {
  percentage: number;
  label?: string;
  size?: number;
  strokeWidth?: number;
};

export default function SuccessRing({ percentage, label = 'Win Rate', size = 120, strokeWidth = 10 }: Props) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <View testID="success-probability-chart" style={styles.container}>
      <View style={styles.card}>
        <View style={styles.header}>
          <Text style={styles.title}>Success Probability</Text>
          <View style={[styles.badge, percentage >= 70 ? styles.badgeHigh : percentage >= 40 ? styles.badgeMedium : styles.badgeLow]}>
            <Text style={[styles.badgeText, percentage >= 70 ? styles.badgeTextHigh : percentage >= 40 ? styles.badgeTextMedium : styles.badgeTextLow]}>
              {percentage >= 70 ? 'High' : percentage >= 40 ? 'Medium' : 'Low'}
            </Text>
          </View>
        </View>
        <View style={styles.ringContainer}>
          <Svg width={size} height={size}>
            <Circle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              stroke={Colors.border}
              strokeWidth={strokeWidth}
              fill="none"
            />
            <Circle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              stroke={Colors.accent}
              strokeWidth={strokeWidth}
              fill="none"
              strokeDasharray={`${circumference}`}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              transform={`rotate(-90 ${size / 2} ${size / 2})`}
            />
          </Svg>
          <View style={[styles.ringLabel, { width: size, height: size }]}>
            <Text style={styles.ringPercent}>{percentage}%</Text>
            <Text style={styles.ringSubtext}>{label}</Text>
          </View>
        </View>
        <View style={styles.metrics}>
          <MetricRow label="Medical evidence strength" value={92} />
          <MetricRow label="Witness statements" value={56} />
          <MetricRow label="Documentation completeness" value={84} />
        </View>
      </View>
    </View>
  );
}

function MetricRow({ label, value }: { label: string; value: number }) {
  return (
    <View style={styles.metricRow}>
      <Text style={styles.metricLabel} numberOfLines={1}>{label}</Text>
      <Text style={styles.metricValue}>{value}%</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  card: {
    backgroundColor: Colors.bgSecondary,
    borderRadius: Radius.xxl,
    padding: 20,
    ...Shadow.soft,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 100,
  },
  badgeHigh: { backgroundColor: '#DCFCE7' },
  badgeMedium: { backgroundColor: '#FEF3C7' },
  badgeLow: { backgroundColor: '#FEE2E2' },
  badgeText: { fontSize: 12, fontWeight: '600' },
  badgeTextHigh: { color: '#16A34A' },
  badgeTextMedium: { color: '#D97706' },
  badgeTextLow: { color: '#DC2626' },
  ringContainer: {
    alignItems: 'center',
    marginBottom: 16,
  },
  ringLabel: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  ringPercent: {
    fontSize: 32,
    fontWeight: '800',
    color: Colors.textPrimary,
    letterSpacing: -1,
  },
  ringSubtext: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  metrics: { gap: 10 },
  metricRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  metricLabel: {
    fontSize: 13,
    color: Colors.textSecondary,
    flex: 1,
  },
  metricValue: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
});
