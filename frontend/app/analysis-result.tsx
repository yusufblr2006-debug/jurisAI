import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Circle } from 'react-native-svg';
import { Colors, Spacing, Radius, Shadow } from '../src/utils/theme';

function RingGauge({ percentage, size = 100, strokeWidth = 8, color = Colors.accent }: { percentage: number; size?: number; strokeWidth?: number; color?: string }) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;
  return (
    <View style={{ alignItems: 'center' }}>
      <Svg width={size} height={size}>
        <Circle cx={size / 2} cy={size / 2} r={radius} stroke={Colors.border} strokeWidth={strokeWidth} fill="none" />
        <Circle cx={size / 2} cy={size / 2} r={radius} stroke={color} strokeWidth={strokeWidth} fill="none"
          strokeDasharray={`${circumference}`} strokeDashoffset={strokeDashoffset} strokeLinecap="round"
          transform={`rotate(-90 ${size / 2} ${size / 2})`} />
      </Svg>
      <View style={{ position: 'absolute', width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
        <Text style={{ fontSize: size * 0.28, fontWeight: '800', color: Colors.textPrimary }}>{percentage}%</Text>
      </View>
    </View>
  );
}

export default function AnalysisResultScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams();
  const [activeSection, setActiveSection] = useState('overview');

  let result: any = {};
  let query = '';
  try {
    result = JSON.parse(params.data as string);
    query = params.query as string || '';
  } catch { }

  const riskLevel = (result.risk_level || 'MEDIUM').toUpperCase();
  const successProb = result.success_probability || 50;
  const riskColor = riskLevel === 'LOW' ? Colors.success : riskLevel === 'HIGH' ? Colors.danger : Colors.warning;
  const riskBg = riskLevel === 'LOW' ? '#DCFCE7' : riskLevel === 'HIGH' ? '#FEE2E2' : '#FEF3C7';

  const sections = ['overview', 'risk', 'outcomes', 'strategy', 'laws'];

  return (
    <View style={[styles.safe, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity testID="result-back-btn" onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={22} color={Colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Analysis Report</Text>
        <TouchableOpacity testID="result-share-btn" style={styles.shareBtn}>
          <Ionicons name="share-outline" size={20} color={Colors.textPrimary} />
        </TouchableOpacity>
      </View>

      {/* Section Tabs */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.sectionTabs}
        contentContainerStyle={{ paddingHorizontal: Spacing.md, gap: 8 }}>
        {sections.map(s => (
          <TouchableOpacity key={s} testID={`section-${s}`}
            style={[styles.sectionTab, activeSection === s && styles.sectionTabActive]}
            onPress={() => setActiveSection(s)}>
            <Text style={[styles.sectionTabText, activeSection === s && styles.sectionTabTextActive]}>
              {s === 'overview' ? 'Overview' : s === 'risk' ? 'Risk' : s === 'outcomes' ? 'Outcomes' : s === 'strategy' ? 'Strategy' : 'Laws'}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* ═══ OVERVIEW ═══ */}
        {activeSection === 'overview' && (
          <>
            {/* Summary Card */}
            <View style={styles.card}>
              <View style={styles.cardHeader}>
                <View style={styles.cardIconCircle}>
                  <Ionicons name="document-text" size={18} color={Colors.accent} />
                </View>
                <Text style={styles.cardTitle}>Summary</Text>
              </View>
              <Text style={styles.summaryText}>{result.summary || 'No summary available'}</Text>
            </View>

            {/* Key Metrics Row */}
            <View style={styles.metricsRow}>
              <View style={styles.metricCard}>
                <RingGauge percentage={successProb} size={80} color={Colors.accent} />
                <Text style={styles.metricLabel}>Success Rate</Text>
              </View>
              <View style={styles.metricCard}>
                <View style={[styles.riskCircle, { backgroundColor: riskBg }]}>
                  <Ionicons name="shield" size={28} color={riskColor} />
                </View>
                <Text style={[styles.riskLevelText, { color: riskColor }]}>{riskLevel}</Text>
                <Text style={styles.metricLabel}>Risk Level</Text>
              </View>
              <View style={styles.metricCard}>
                <View style={styles.timeCircle}>
                  <Ionicons name="time" size={28} color={Colors.accent} />
                </View>
                <Text style={styles.timeText}>{result.timeline_estimate || 'N/A'}</Text>
                <Text style={styles.metricLabel}>Timeline</Text>
              </View>
            </View>

            {/* Warnings */}
            {result.warnings && result.warnings.length > 0 && (
              <View style={[styles.card, { borderLeftWidth: 3, borderLeftColor: Colors.warning }]}>
                <View style={styles.cardHeader}>
                  <Ionicons name="warning" size={18} color={Colors.warning} />
                  <Text style={styles.cardTitle}>Warnings</Text>
                </View>
                {result.warnings.map((w: string, i: number) => (
                  <View key={i} style={styles.warningItem}>
                    <View style={styles.warningDot} />
                    <Text style={styles.warningText}>{w}</Text>
                  </View>
                ))}
              </View>
            )}

            {/* Recommended Actions */}
            {result.actions && result.actions.length > 0 && (
              <View style={styles.card}>
                <View style={styles.cardHeader}>
                  <Ionicons name="checkmark-circle" size={18} color={Colors.success} />
                  <Text style={styles.cardTitle}>Recommended Actions</Text>
                </View>
                {result.actions.map((a: string, i: number) => (
                  <View key={i} style={styles.actionItem}>
                    <View style={styles.actionNumber}>
                      <Text style={styles.actionNumberText}>{i + 1}</Text>
                    </View>
                    <Text style={styles.actionText}>{a}</Text>
                  </View>
                ))}
              </View>
            )}
          </>
        )}

        {/* ═══ RISK ═══ */}
        {activeSection === 'risk' && (
          <>
            <View style={styles.card}>
              <View style={styles.cardHeader}>
                <Ionicons name="shield-checkmark" size={18} color={Colors.accent} />
                <Text style={styles.cardTitle}>Risk Assessment</Text>
              </View>
              <View style={styles.riskOverview}>
                <View style={[styles.bigRiskBadge, { backgroundColor: riskBg }]}>
                  <Text style={[styles.bigRiskText, { color: riskColor }]}>{riskLevel} RISK</Text>
                </View>
                <Text style={styles.riskDesc}>
                  {riskLevel === 'HIGH' ? 'This case has significant risk factors that require immediate attention.'
                    : riskLevel === 'LOW' ? 'This case has favorable conditions with manageable risk factors.'
                    : 'This case has moderate risk factors. Careful strategy is recommended.'}
                </Text>
              </View>
            </View>

            {/* Risk Factors */}
            {result.risk_factors && result.risk_factors.length > 0 && (
              <View style={styles.card}>
                <View style={styles.cardHeader}>
                  <Ionicons name="analytics" size={18} color={Colors.accent} />
                  <Text style={styles.cardTitle}>Risk Factors</Text>
                </View>
                {result.risk_factors.map((rf: any, i: number) => {
                  const score = Math.round((rf.score || 0.5) * 100);
                  const factorColor = rf.impact === 'HIGH' ? Colors.danger : rf.impact === 'LOW' ? Colors.success : Colors.warning;
                  return (
                    <View key={i} style={styles.riskFactorCard}>
                      <View style={styles.riskFactorHeader}>
                        <Text style={styles.riskFactorName}>{rf.factor}</Text>
                        <View style={[styles.impactBadge, { backgroundColor: factorColor + '20' }]}>
                          <Text style={[styles.impactText, { color: factorColor }]}>{rf.impact}</Text>
                        </View>
                      </View>
                      <Text style={styles.riskFactorDesc}>{rf.description}</Text>
                      <View style={styles.scoreBar}>
                        <View style={styles.scoreBarBg}>
                          <View style={[styles.scoreBarFill, { width: `${score}%`, backgroundColor: factorColor }]} />
                        </View>
                        <Text style={[styles.scoreText, { color: factorColor }]}>{score}%</Text>
                      </View>
                    </View>
                  );
                })}
              </View>
            )}
          </>
        )}

        {/* ═══ OUTCOMES ═══ */}
        {activeSection === 'outcomes' && (
          <>
            <View style={styles.card}>
              <View style={styles.cardHeader}>
                <Ionicons name="trending-up" size={18} color={Colors.accent} />
                <Text style={styles.cardTitle}>Outcome Predictions</Text>
              </View>
              {result.outcome_predictions && result.outcome_predictions.map((op: any, i: number) => {
                const prob = op.probability || 50;
                const opColor = prob >= 60 ? Colors.success : prob >= 30 ? Colors.warning : Colors.danger;
                return (
                  <View key={i} style={styles.outcomeCard}>
                    <View style={styles.outcomeHeader}>
                      <RingGauge percentage={prob} size={56} strokeWidth={5} color={opColor} />
                      <View style={styles.outcomeInfo}>
                        <Text style={styles.outcomeName}>{op.outcome}</Text>
                        <Text style={styles.outcomeDesc}>{op.description}</Text>
                      </View>
                    </View>
                  </View>
                );
              })}
            </View>

            <View style={styles.card}>
              <View style={styles.cardHeader}>
                <Ionicons name="time" size={18} color={Colors.accent} />
                <Text style={styles.cardTitle}>Estimated Timeline</Text>
              </View>
              <View style={styles.timelineCard}>
                <View style={styles.timelineIconCircle}>
                  <Ionicons name="calendar" size={24} color={Colors.accent} />
                </View>
                <Text style={styles.timelineEstimate}>{result.timeline_estimate || 'Varies based on complexity'}</Text>
                <Text style={styles.timelineNote}>This is an estimated timeframe based on similar cases in Indian courts.</Text>
              </View>
            </View>
          </>
        )}

        {/* ═══ STRATEGY ═══ */}
        {activeSection === 'strategy' && (
          <>
            {result.strategies && result.strategies.map((s: any, i: number) => (
              <View key={i} style={[styles.card, i === 0 && { borderWidth: 2, borderColor: Colors.accent }]}>
                <View style={styles.strategyHeader}>
                  <View style={[styles.strategyBadge, i === 0 && { backgroundColor: Colors.accent }]}>
                    <Text style={[styles.strategyBadgeText, i === 0 && { color: Colors.textInverse }]}>
                      {s.option || String.fromCharCode(65 + i)}
                    </Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.strategyTitle}>{s.title}</Text>
                    {i === 0 && <Text style={styles.recommendedTag}>Recommended</Text>}
                  </View>
                </View>
                <Text style={styles.strategyDesc}>{s.description}</Text>

                {/* Pros */}
                {s.pros && s.pros.length > 0 && (
                  <View style={styles.prosConsSection}>
                    <Text style={styles.prosLabel}>Advantages</Text>
                    {s.pros.map((p: string, j: number) => (
                      <View key={j} style={styles.proItem}>
                        <Ionicons name="checkmark-circle" size={16} color={Colors.success} />
                        <Text style={styles.proText}>{p}</Text>
                      </View>
                    ))}
                  </View>
                )}

                {/* Cons */}
                {s.cons && s.cons.length > 0 && (
                  <View style={styles.prosConsSection}>
                    <Text style={styles.consLabel}>Disadvantages</Text>
                    {s.cons.map((c: string, j: number) => (
                      <View key={j} style={styles.conItem}>
                        <Ionicons name="close-circle" size={16} color={Colors.danger} />
                        <Text style={styles.conText}>{c}</Text>
                      </View>
                    ))}
                  </View>
                )}

                {/* Steps */}
                {s.steps && s.steps.length > 0 && (
                  <View style={styles.stepsSection}>
                    <Text style={styles.stepsLabel}>Steps to Execute</Text>
                    {s.steps.map((step: string, j: number) => (
                      <View key={j} style={styles.stepItem}>
                        <View style={styles.stepNumber}>
                          <Text style={styles.stepNumberText}>{j + 1}</Text>
                        </View>
                        <Text style={styles.stepText}>{step}</Text>
                      </View>
                    ))}
                  </View>
                )}
              </View>
            ))}
          </>
        )}

        {/* ═══ LAWS ═══ */}
        {activeSection === 'laws' && (
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Ionicons name="book" size={18} color={Colors.accent} />
              <Text style={styles.cardTitle}>Applicable Laws</Text>
            </View>
            {result.applicable_laws && result.applicable_laws.map((law: string, i: number) => (
              <View key={i} style={styles.lawItem}>
                <View style={styles.lawIcon}>
                  <Ionicons name="document-text" size={16} color={Colors.accent} />
                </View>
                <Text style={styles.lawText}>{law}</Text>
              </View>
            ))}
          </View>
        )}

        {/* CTA */}
        <View style={styles.ctaCard}>
          <Text style={styles.ctaTitle}>Need Expert Guidance?</Text>
          <Text style={styles.ctaSubtitle}>Connect with verified lawyers for detailed consultation</Text>
          <View style={styles.ctaButtons}>
            <TouchableOpacity testID="cta-lawyers" style={styles.ctaPrimary}
              onPress={() => router.push('/(tabs)/lawyers' as any)}>
              <Ionicons name="people" size={18} color={Colors.textInverse} />
              <Text style={styles.ctaPrimaryText}>Find a Lawyer</Text>
            </TouchableOpacity>
            <TouchableOpacity testID="cta-new-analysis" style={styles.ctaSecondary}
              onPress={() => router.back()}>
              <Ionicons name="refresh" size={18} color={Colors.accent} />
              <Text style={styles.ctaSecondaryText}>New Analysis</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.bgPrimary },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: Spacing.md, paddingVertical: 12, backgroundColor: Colors.bgSecondary, ...Shadow.soft,
  },
  backBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: Colors.bgPrimary, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { fontSize: 18, fontWeight: '700', color: Colors.textPrimary },
  shareBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: Colors.bgPrimary, alignItems: 'center', justifyContent: 'center' },
  sectionTabs: { maxHeight: 52, backgroundColor: Colors.bgSecondary, paddingVertical: 8 },
  sectionTab: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: Radius.pill, backgroundColor: Colors.bgPrimary },
  sectionTabActive: { backgroundColor: Colors.textPrimary },
  sectionTabText: { fontSize: 13, fontWeight: '600', color: Colors.textPrimary },
  sectionTabTextActive: { color: Colors.textInverse },
  scroll: { flex: 1 },
  scrollContent: { paddingHorizontal: Spacing.md, paddingTop: Spacing.md },
  card: { backgroundColor: Colors.bgSecondary, borderRadius: Radius.xxl, padding: 20, marginBottom: 12, ...Shadow.soft },
  cardHeader: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 14 },
  cardIconCircle: { width: 32, height: 32, borderRadius: 16, backgroundColor: Colors.accentLight, alignItems: 'center', justifyContent: 'center' },
  cardTitle: { fontSize: 17, fontWeight: '700', color: Colors.textPrimary },
  summaryText: { fontSize: 15, color: Colors.textPrimary, lineHeight: 24 },
  metricsRow: { flexDirection: 'row', gap: 10, marginBottom: 12 },
  metricCard: { flex: 1, backgroundColor: Colors.bgSecondary, borderRadius: Radius.xxl, padding: 16, alignItems: 'center', ...Shadow.soft, gap: 8 },
  metricLabel: { fontSize: 11, color: Colors.textSecondary, fontWeight: '600' },
  riskCircle: { width: 60, height: 60, borderRadius: 30, alignItems: 'center', justifyContent: 'center' },
  riskLevelText: { fontSize: 14, fontWeight: '800' },
  timeCircle: { width: 60, height: 60, borderRadius: 30, backgroundColor: Colors.accentLight, alignItems: 'center', justifyContent: 'center' },
  timeText: { fontSize: 11, fontWeight: '700', color: Colors.textPrimary, textAlign: 'center' },
  warningItem: { flexDirection: 'row', alignItems: 'flex-start', gap: 10, marginBottom: 8 },
  warningDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: Colors.warning, marginTop: 7 },
  warningText: { fontSize: 14, color: Colors.textPrimary, flex: 1, lineHeight: 20 },
  actionItem: { flexDirection: 'row', alignItems: 'flex-start', gap: 12, marginBottom: 10 },
  actionNumber: { width: 24, height: 24, borderRadius: 12, backgroundColor: Colors.accent, alignItems: 'center', justifyContent: 'center' },
  actionNumberText: { fontSize: 12, fontWeight: '700', color: Colors.textInverse },
  actionText: { fontSize: 14, color: Colors.textPrimary, flex: 1, lineHeight: 20 },
  riskOverview: { alignItems: 'center', gap: 12, marginBottom: 8 },
  bigRiskBadge: { paddingHorizontal: 24, paddingVertical: 12, borderRadius: Radius.pill },
  bigRiskText: { fontSize: 18, fontWeight: '800', letterSpacing: 1 },
  riskDesc: { fontSize: 14, color: Colors.textSecondary, textAlign: 'center', lineHeight: 20 },
  riskFactorCard: { backgroundColor: Colors.bgPrimary, borderRadius: Radius.xl, padding: 16, marginBottom: 10 },
  riskFactorHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
  riskFactorName: { fontSize: 15, fontWeight: '600', color: Colors.textPrimary, flex: 1 },
  impactBadge: { paddingHorizontal: 10, paddingVertical: 3, borderRadius: Radius.pill },
  impactText: { fontSize: 11, fontWeight: '700' },
  riskFactorDesc: { fontSize: 13, color: Colors.textSecondary, lineHeight: 19, marginBottom: 10 },
  scoreBar: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  scoreBarBg: { flex: 1, height: 6, backgroundColor: Colors.border, borderRadius: 3, overflow: 'hidden' },
  scoreBarFill: { height: '100%', borderRadius: 3 },
  scoreText: { fontSize: 12, fontWeight: '700' },
  outcomeCard: { backgroundColor: Colors.bgPrimary, borderRadius: Radius.xl, padding: 16, marginBottom: 10 },
  outcomeHeader: { flexDirection: 'row', alignItems: 'center', gap: 16 },
  outcomeInfo: { flex: 1 },
  outcomeName: { fontSize: 16, fontWeight: '700', color: Colors.textPrimary, marginBottom: 4 },
  outcomeDesc: { fontSize: 13, color: Colors.textSecondary, lineHeight: 19 },
  timelineCard: { alignItems: 'center', gap: 8, paddingVertical: 12 },
  timelineIconCircle: { width: 56, height: 56, borderRadius: 28, backgroundColor: Colors.accentLight, alignItems: 'center', justifyContent: 'center' },
  timelineEstimate: { fontSize: 22, fontWeight: '800', color: Colors.textPrimary },
  timelineNote: { fontSize: 13, color: Colors.textSecondary, textAlign: 'center' },
  strategyHeader: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 12 },
  strategyBadge: { width: 36, height: 36, borderRadius: 18, backgroundColor: Colors.bgPrimary, alignItems: 'center', justifyContent: 'center' },
  strategyBadgeText: { fontSize: 16, fontWeight: '800', color: Colors.textPrimary },
  strategyTitle: { fontSize: 17, fontWeight: '700', color: Colors.textPrimary },
  recommendedTag: { fontSize: 11, color: Colors.accent, fontWeight: '600', marginTop: 2 },
  strategyDesc: { fontSize: 14, color: Colors.textSecondary, lineHeight: 21, marginBottom: 14 },
  prosConsSection: { marginBottom: 12 },
  prosLabel: { fontSize: 12, fontWeight: '700', color: Colors.success, marginBottom: 6, letterSpacing: 0.5 },
  proItem: { flexDirection: 'row', alignItems: 'flex-start', gap: 8, marginBottom: 4 },
  proText: { fontSize: 13, color: Colors.textPrimary, flex: 1, lineHeight: 19 },
  consLabel: { fontSize: 12, fontWeight: '700', color: Colors.danger, marginBottom: 6, letterSpacing: 0.5 },
  conItem: { flexDirection: 'row', alignItems: 'flex-start', gap: 8, marginBottom: 4 },
  conText: { fontSize: 13, color: Colors.textPrimary, flex: 1, lineHeight: 19 },
  stepsSection: { borderTopWidth: 1, borderTopColor: Colors.border, paddingTop: 12 },
  stepsLabel: { fontSize: 12, fontWeight: '700', color: Colors.textSecondary, marginBottom: 8, letterSpacing: 0.5 },
  stepItem: { flexDirection: 'row', alignItems: 'flex-start', gap: 10, marginBottom: 8 },
  stepNumber: { width: 22, height: 22, borderRadius: 11, backgroundColor: Colors.accentLight, alignItems: 'center', justifyContent: 'center' },
  stepNumberText: { fontSize: 11, fontWeight: '700', color: Colors.accent },
  stepText: { fontSize: 13, color: Colors.textPrimary, flex: 1, lineHeight: 19 },
  lawItem: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: Colors.bgPrimary, borderRadius: Radius.lg, padding: 14, marginBottom: 8 },
  lawIcon: { width: 32, height: 32, borderRadius: 10, backgroundColor: Colors.accentLight, alignItems: 'center', justifyContent: 'center' },
  lawText: { fontSize: 14, fontWeight: '500', color: Colors.textPrimary, flex: 1 },
  ctaCard: { backgroundColor: Colors.accent, borderRadius: Radius.xxl, padding: 24, marginBottom: 12, alignItems: 'center' },
  ctaTitle: { fontSize: 18, fontWeight: '800', color: Colors.textInverse, marginBottom: 6 },
  ctaSubtitle: { fontSize: 13, color: 'rgba(255,255,255,0.8)', textAlign: 'center', marginBottom: 16 },
  ctaButtons: { flexDirection: 'row', gap: 10, width: '100%' },
  ctaPrimary: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: Radius.lg, paddingVertical: 14 },
  ctaPrimaryText: { fontSize: 14, fontWeight: '700', color: Colors.textInverse },
  ctaSecondary: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: Colors.bgSecondary, borderRadius: Radius.lg, paddingVertical: 14 },
  ctaSecondaryText: { fontSize: 14, fontWeight: '700', color: Colors.accent },
});
