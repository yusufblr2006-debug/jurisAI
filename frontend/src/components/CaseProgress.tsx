import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Shadow, Radius } from '../utils/theme';

type TimelineItem = {
  step: string;
  status: string;
  date: string;
};

type Props = {
  items: TimelineItem[];
  totalSteps?: number;
};

export default function CaseProgress({ items, totalSteps }: Props) {
  const completed = items.filter(i => i.status === 'completed').length;
  const total = totalSteps || items.length;
  const pct = Math.round((completed / total) * 100);

  return (
    <View testID="case-progress-card" style={styles.card}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <View style={styles.iconCircle}>
            <Ionicons name="shield-checkmark" size={18} color={Colors.accent} />
          </View>
          <Text style={styles.title}>Case Progress</Text>
        </View>
        <Ionicons name="ellipsis-horizontal" size={20} color={Colors.textSecondary} />
      </View>

      <View style={styles.progressRow}>
        <Text style={styles.progressLabel}>Overall Progress</Text>
        <Text style={styles.progressStats}>{completed} of {total} Completed</Text>
        <Text style={styles.progressPct}>{pct}%</Text>
      </View>
      <View style={styles.progressBarBg}>
        <View style={[styles.progressBarFill, { width: `${pct}%` }]} />
      </View>

      <View style={styles.timeline}>
        {items.map((item, idx) => {
          const isLast = idx === items.length - 1;
          const isCompleted = item.status === 'completed';
          const isActive = item.status === 'in_progress';

          return (
            <View key={idx} style={styles.timelineItem}>
              <View style={styles.timelineLeft}>
                <View style={[
                  styles.dot,
                  isCompleted && styles.dotCompleted,
                  isActive && styles.dotActive,
                  !isCompleted && !isActive && styles.dotPending,
                ]}>
                  {isCompleted && <Ionicons name="checkmark" size={12} color={Colors.textInverse} />}
                </View>
                {!isLast && (
                  <View style={[
                    styles.line,
                    isCompleted && styles.lineCompleted,
                  ]} />
                )}
              </View>
              <View style={styles.timelineContent}>
                <Text style={[styles.stepText, !isCompleted && !isActive && styles.stepTextPending]}>
                  {item.step}
                </Text>
                <Text style={styles.stepStatus}>
                  {isCompleted ? 'Completed' : isActive ? 'In Progress' : 'Pending'}
                </Text>
              </View>
              {item.date ? (
                <Text style={styles.stepDate}>{item.date.split('-').slice(1).join('/')}</Text>
              ) : null}
            </View>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
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
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  iconCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.accentLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  progressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 8,
  },
  progressLabel: {
    fontSize: 13,
    color: Colors.textSecondary,
    flex: 1,
  },
  progressStats: {
    fontSize: 13,
    color: Colors.textSecondary,
  },
  progressPct: {
    fontSize: 14,
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  progressBarBg: {
    height: 6,
    backgroundColor: Colors.border,
    borderRadius: 3,
    marginBottom: 20,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: Colors.accent,
    borderRadius: 3,
  },
  timeline: { gap: 0 },
  timelineItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    minHeight: 48,
  },
  timelineLeft: {
    alignItems: 'center',
    width: 24,
    marginRight: 12,
  },
  dot: {
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dotCompleted: {
    backgroundColor: Colors.success,
  },
  dotActive: {
    backgroundColor: Colors.accent,
  },
  dotPending: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: Colors.border,
  },
  line: {
    width: 2,
    flex: 1,
    backgroundColor: Colors.border,
    marginVertical: 2,
  },
  lineCompleted: {
    backgroundColor: Colors.success,
  },
  timelineContent: {
    flex: 1,
    paddingBottom: 16,
  },
  stepText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  stepTextPending: {
    color: Colors.textSecondary,
  },
  stepStatus: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  stepDate: {
    fontSize: 12,
    color: Colors.accent,
    fontWeight: '500',
  },
});
