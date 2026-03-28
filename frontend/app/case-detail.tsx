import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Circle } from 'react-native-svg';
import { Colors, Spacing, Radius, Shadow } from '../src/utils/theme';
import ExpandableSection from '../src/components/ExpandableSection';
import { api } from '../src/utils/api';

function MiniRing({ pct, size = 48, color = Colors.accent }: { pct: number; size?: number; color?: string }) {
  const sw = 4; const r = (size - sw) / 2; const c = 2 * Math.PI * r;
  return (
    <View style={{ alignItems: 'center' }}>
      <Svg width={size} height={size}>
        <Circle cx={size/2} cy={size/2} r={r} stroke={Colors.border} strokeWidth={sw} fill="none" />
        <Circle cx={size/2} cy={size/2} r={r} stroke={color} strokeWidth={sw} fill="none"
          strokeDasharray={`${c}`} strokeDashoffset={c - (pct/100)*c} strokeLinecap="round"
          transform={`rotate(-90 ${size/2} ${size/2})`} />
      </Svg>
      <View style={{ position: 'absolute', width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
        <Text style={{ fontSize: size*0.25, fontWeight: '800', color: Colors.textPrimary }}>{pct}%</Text>
      </View>
    </View>
  );
}

export default function CaseDetailScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams();
  const [caseData, setCaseData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => { loadCase(); }, [id]);

  const loadCase = async () => {
    try {
      const result = await api.getCase(id as string);
      setCaseData(result);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  const handleStepComplete = async (index: number) => {
    if (!caseData) return;
    try {
      const res = await api.updateCaseStep(caseData.id, index);
      setCaseData({ ...caseData, timeline: res.timeline, progress_percentage: res.progress_percentage });
    } catch (e) { console.error(e); }
  };

  if (loading) return <View style={[styles.safe, { paddingTop: insets.top, justifyContent: 'center', alignItems: 'center' }]}><ActivityIndicator size="large" color={Colors.accent} /></View>;
  if (!caseData) return <View style={[styles.safe, { paddingTop: insets.top, justifyContent: 'center', alignItems: 'center' }]}><Text style={{ color: Colors.textSecondary }}>Case not found</Text></View>;

  const riskColor = caseData.risk_level === 'HIGH' ? '#DC2626' : caseData.risk_level === 'LOW' ? '#16A34A' : '#D97706';
  const riskBg = caseData.risk_level === 'HIGH' ? '#FEE2E2' : caseData.risk_level === 'LOW' ? '#DCFCE7' : '#FEF3C7';

  return (
    <View style={[styles.safe, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={22} color={Colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={1}>Case Detail</Text>
        <View style={{ width: 36 }} />
      </View>

      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Case Summary */}
        <View style={styles.summaryCard}>
          <View style={styles.summaryTop}>
            <View style={{ flex: 1 }}>
              <Text style={styles.caseNumber}>#{caseData.case_number}</Text>
              <Text style={styles.caseTitle}>{caseData.title}</Text>
              <Text style={styles.caseCat}>{caseData.category}</Text>
            </View>
            <View style={[styles.riskBadge, { backgroundColor: riskBg }]}>
              <Text style={[styles.riskText, { color: riskColor }]}>{caseData.risk_level}</Text>
            </View>
          </View>
          <Text style={styles.caseDesc}>{caseData.description}</Text>
          <View style={styles.metaRow}>
            <View style={styles.metaItem}>
              <Ionicons name="person" size={14} color={Colors.textSecondary} />
              <Text style={styles.metaText}>{caseData.assigned_lawyer}</Text>
            </View>
            <View style={[styles.statusBadge, { backgroundColor: caseData.status === 'Active' ? Colors.accent + '20' : '#FEF3C7' }]}>
              <Text style={[styles.statusText, { color: caseData.status === 'Active' ? Colors.accent : '#D97706' }]}>{caseData.status}</Text>
            </View>
          </View>
        </View>

        {/* Metrics */}
        <View style={styles.metricsRow}>
          <View style={styles.metricCard}>
            <MiniRing pct={caseData.progress_percentage} color={Colors.accent} />
            <Text style={styles.metricLabel}>Progress</Text>
          </View>
          <View style={styles.metricCard}>
            <MiniRing pct={caseData.success_probability} color="#16A34A" />
            <Text style={styles.metricLabel}>Success Rate</Text>
          </View>
        </View>

        {/* Timeline / Progress Tracker */}
        <ExpandableSection title="Case Timeline" icon="git-branch" iconColor={Colors.accent} badge={`${caseData.timeline?.filter((t:any)=>t.status==='completed').length}/${caseData.timeline?.length}`} defaultOpen={true}>
          {caseData.timeline?.map((step: any, i: number) => {
            const isDone = step.status === 'completed';
            const isCurrent = step.status === 'in_progress';
            return (
              <View key={i} style={styles.timelineItem}>
                <View style={styles.timelineLine}>
                  <View style={[styles.timelineDot, isDone && styles.dotDone, isCurrent && styles.dotCurrent]} >
                    {isDone && <Ionicons name="checkmark" size={12} color="#FFF" />}
                    {isCurrent && <View style={styles.dotPulse} />}
                  </View>
                  {i < (caseData.timeline?.length || 0) - 1 && <View style={[styles.timelineConnector, isDone && styles.connectorDone]} />}
                </View>
                <View style={styles.timelineContent}>
                  <Text style={[styles.timelineStep, isDone && styles.stepDone]}>{step.step}</Text>
                  {step.date ? <Text style={styles.timelineDate}>{step.date}</Text> : null}
                  {!isDone && step.status === 'pending' && (
                    <TouchableOpacity style={styles.markDoneBtn} onPress={() => handleStepComplete(i)}>
                      <Ionicons name="checkmark-circle-outline" size={14} color={Colors.accent} />
                      <Text style={styles.markDoneText}>Mark Complete</Text>
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            );
          })}
        </ExpandableSection>

        {/* Documents */}
        <ExpandableSection title="Required Documents" icon="document-attach" iconColor="#6B7280" badge="5 docs">
          {['Identity Proof (Aadhaar/PAN)', 'Property Documents / Sale Deed', 'Bank Statements', 'FIR Copy (if applicable)', 'Correspondence / Notices'].map((d, i) => (
            <View key={i} style={styles.docItem}>
              <Ionicons name="document" size={16} color={Colors.accent} />
              <Text style={styles.docText}>{d}</Text>
              <View style={[styles.docStatus, i < 3 ? { backgroundColor: '#DCFCE7' } : { backgroundColor: '#FEF3C7' }]}>
                <Text style={[styles.docStatusText, i < 3 ? { color: '#16A34A' } : { color: '#D97706' }]}>{i < 3 ? 'Uploaded' : 'Pending'}</Text>
              </View>
            </View>
          ))}
        </ExpandableSection>

        {/* AI Analysis */}
        <TouchableOpacity style={styles.aiCard} onPress={() => router.push('/ai-engine' as any)}>
          <Ionicons name="sparkles" size={20} color="#FFF" />
          <View style={{ flex: 1 }}>
            <Text style={styles.aiCardTitle}>Run AI Analysis</Text>
            <Text style={styles.aiCardSub}>Get detailed legal analysis for this case</Text>
          </View>
          <Ionicons name="arrow-forward" size={18} color="rgba(255,255,255,0.7)" />
        </TouchableOpacity>

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.bgPrimary },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: Spacing.md, paddingVertical: 12, backgroundColor: Colors.bgSecondary, ...Shadow.soft },
  backBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: Colors.bgPrimary, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { fontSize: 18, fontWeight: '700', color: Colors.textPrimary },
  scroll: { flex: 1 },
  scrollContent: { paddingHorizontal: Spacing.md, paddingTop: 16 },
  summaryCard: { backgroundColor: Colors.bgSecondary, borderRadius: Radius.xxl, padding: 20, marginBottom: 12, ...Shadow.soft },
  summaryTop: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  caseNumber: { fontSize: 12, color: Colors.textSecondary, fontWeight: '600' },
  caseTitle: { fontSize: 18, fontWeight: '800', color: Colors.textPrimary, marginTop: 2, marginBottom: 4 },
  caseCat: { fontSize: 13, color: Colors.accent, fontWeight: '600' },
  riskBadge: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: Radius.pill, alignSelf: 'flex-start' },
  riskText: { fontSize: 12, fontWeight: '800' },
  caseDesc: { fontSize: 14, color: Colors.textSecondary, lineHeight: 21, marginBottom: 12 },
  metaRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  metaItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  metaText: { fontSize: 13, color: Colors.textSecondary },
  statusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: Radius.pill },
  statusText: { fontSize: 12, fontWeight: '700' },
  metricsRow: { flexDirection: 'row', gap: 10, marginBottom: 12 },
  metricCard: { flex: 1, backgroundColor: Colors.bgSecondary, borderRadius: Radius.xl, padding: 16, alignItems: 'center', ...Shadow.soft, gap: 8 },
  metricLabel: { fontSize: 12, color: Colors.textSecondary, fontWeight: '600' },
  timelineItem: { flexDirection: 'row', minHeight: 60 },
  timelineLine: { alignItems: 'center', width: 30 },
  timelineDot: { width: 22, height: 22, borderRadius: 11, backgroundColor: Colors.border, alignItems: 'center', justifyContent: 'center', zIndex: 1 },
  dotDone: { backgroundColor: Colors.accent },
  dotCurrent: { backgroundColor: '#FEF3C7', borderWidth: 2, borderColor: '#D97706' },
  dotPulse: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#D97706' },
  timelineConnector: { width: 2, flex: 1, backgroundColor: Colors.border, marginVertical: 2 },
  connectorDone: { backgroundColor: Colors.accent },
  timelineContent: { flex: 1, paddingLeft: 12, paddingBottom: 16 },
  timelineStep: { fontSize: 14, fontWeight: '600', color: Colors.textPrimary },
  stepDone: { color: Colors.textSecondary },
  timelineDate: { fontSize: 12, color: Colors.textSecondary, marginTop: 2 },
  markDoneBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 6 },
  markDoneText: { fontSize: 12, color: Colors.accent, fontWeight: '600' },
  docItem: { flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: Colors.bgPrimary, borderRadius: Radius.lg, padding: 12, marginBottom: 6 },
  docText: { fontSize: 13, color: Colors.textPrimary, flex: 1 },
  docStatus: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: Radius.pill },
  docStatusText: { fontSize: 10, fontWeight: '700' },
  aiCard: { flexDirection: 'row', alignItems: 'center', gap: 14, backgroundColor: Colors.accent, borderRadius: Radius.xxl, padding: 18, marginBottom: 12 },
  aiCardTitle: { fontSize: 16, fontWeight: '700', color: '#FFF' },
  aiCardSub: { fontSize: 12, color: 'rgba(255,255,255,0.7)' },
});
