import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  ActivityIndicator, RefreshControl,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Circle } from 'react-native-svg';
import { Colors, Spacing, Radius, Shadow } from '../../src/utils/theme';
import { api } from '../../src/utils/api';
import FloatingNav from '../../src/components/FloatingNav';
import EmergencyButton from '../../src/components/EmergencyButton';

function SuccessRing({ pct, size = 110 }: { pct: number; size?: number }) {
  const sw = 8; const r = (size - sw) / 2; const c = 2 * Math.PI * r;
  return (
    <View style={{ alignItems: 'center' }}>
      <Svg width={size} height={size}>
        <Circle cx={size/2} cy={size/2} r={r} stroke="#E5E7EB" strokeWidth={sw} fill="none" />
        <Circle cx={size/2} cy={size/2} r={r} stroke={Colors.accent} strokeWidth={sw} fill="none"
          strokeDasharray={`${c}`} strokeDashoffset={c - (pct/100)*c} strokeLinecap="round"
          transform={`rotate(-90 ${size/2} ${size/2})`} />
      </Svg>
      <View style={{ position: 'absolute', width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
        <Text style={{ fontSize: 28, fontWeight: '800', color: Colors.textPrimary }}>{pct}%</Text>
        <Text style={{ fontSize: 11, color: Colors.textSecondary }}>Win Rate</Text>
      </View>
    </View>
  );
}

export default function HomeScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [cases, setCases] = useState<any[]>([]);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadData = async () => {
    try {
      const [c, n] = await Promise.all([api.getCases(), api.getNotifications()]);
      setCases(c || []);
      setNotifications(n || []);
    } catch (e) { console.error(e); }
    finally { setLoading(false); setRefreshing(false); }
  };

  useEffect(() => { loadData(); }, []);

  const heroCase = cases[0];
  const otherCases = cases.slice(1);
  const unreadCount = notifications.filter((n: any) => !n.is_read).length;

  if (loading) {
    return (
      <View style={[styles.safe, { paddingTop: insets.top, justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color={Colors.accent} />
      </View>
    );
  }

  return (
    <View style={[styles.safe, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>JurisAI</Text>
          <Text style={styles.subtitle}>Your Legal Assistant</Text>
        </View>
        <TouchableOpacity testID="notif-btn" style={styles.notifBtn} onPress={() => router.push('/notifications' as any)}>
          <Ionicons name="notifications-outline" size={22} color={Colors.textPrimary} />
          {unreadCount > 0 && <View style={styles.notifDot}><Text style={styles.notifDotText}>{unreadCount}</Text></View>}
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); loadData(); }} />}>

        {/* Emergency + AI Banners */}
        <TouchableOpacity testID="emergency-banner" style={styles.emergencyBanner} onPress={() => router.push('/emergency' as any)}>
          <View style={styles.emergencyIcon}><Ionicons name="shield" size={16} color="#FFF" /></View>
          <Text style={styles.emergencyText}>Emergency Legal Aid</Text>
          <Ionicons name="chevron-forward" size={16} color="rgba(255,255,255,0.7)" />
        </TouchableOpacity>

        <TouchableOpacity testID="ai-cta" style={styles.aiCta} onPress={() => router.push('/ai-engine' as any)}>
          <View style={styles.aiCtaIcon}><Ionicons name="sparkles" size={16} color="#FFF" /></View>
          <View style={{ flex: 1 }}>
            <Text style={styles.aiCtaTitle}>AI Legal Engine</Text>
            <Text style={styles.aiCtaSub}>Get instant legal analysis</Text>
          </View>
          <Ionicons name="arrow-forward-circle" size={24} color="rgba(255,255,255,0.7)" />
        </TouchableOpacity>

        {/* Hero Case - Two Column Layout */}
        {heroCase && (
          <>
            <View style={styles.twoCol}>
              {/* Left: Case Progress Timeline */}
              <TouchableOpacity style={styles.progressCard} onPress={() => router.push({ pathname: '/case-detail', params: { id: heroCase.id } } as any)} activeOpacity={0.7}>
                <View style={styles.progressHeader}>
                  <View style={styles.progressIcon}><Ionicons name="checkmark-circle" size={16} color={Colors.accent} /></View>
                  <Text style={styles.progressTitle} numberOfLines={1}>Case Progress</Text>
                </View>
                <Text style={styles.progressSummary}>
                  {heroCase.timeline?.filter((t: any) => t.status === 'completed').length || 0} of {heroCase.timeline?.length || 0} Completed  <Text style={styles.progressPct}>{heroCase.progress_percentage}%</Text>
                </Text>
                <View style={styles.progressBar}>
                  <View style={[styles.progressBarFill, { width: `${heroCase.progress_percentage}%` }]} />
                </View>
                {/* Timeline */}
                {heroCase.timeline?.map((step: any, i: number) => {
                  const done = step.status === 'completed';
                  const isLast = i === (heroCase.timeline?.length || 0) - 1;
                  return (
                    <View key={i} style={styles.timelineRow}>
                      <View style={styles.timelineLeft}>
                        <View style={[styles.tlDot, done && styles.tlDotDone]}>
                          {done && <Ionicons name="checkmark" size={10} color="#FFF" />}
                        </View>
                        {!isLast && <View style={[styles.tlLine, done && styles.tlLineDone]} />}
                      </View>
                      <View style={styles.timelineRight}>
                        <Text style={[styles.tlStep, !done && styles.tlStepPending]}>{step.step}</Text>
                        <Text style={styles.tlStatus}>{done ? 'Completed' : 'Pending'}</Text>
                      </View>
                    </View>
                  );
                })}
              </TouchableOpacity>

              {/* Right: Success Probability */}
              <View style={styles.successCard}>
                <View style={styles.successHeader}>
                  <Text style={styles.successTitle}>Success{'\n'}Probability</Text>
                  <View style={[styles.riskTag, {
                    backgroundColor: heroCase.risk_level === 'HIGH' ? '#FEE2E2' : heroCase.risk_level === 'LOW' ? '#DCFCE7' : '#FEF3C7'
                  }]}>
                    <Text style={[styles.riskTagText, {
                      color: heroCase.risk_level === 'HIGH' ? '#DC2626' : heroCase.risk_level === 'LOW' ? '#16A34A' : '#D97706'
                    }]}>{heroCase.risk_level || 'Medium'}</Text>
                  </View>
                </View>
                <SuccessRing pct={heroCase.success_probability || 72} />
                {/* Evidence Scores */}
                <View style={styles.evidenceList}>
                  {[
                    { label: 'Medical evi...', pct: 92 },
                    { label: 'Witness sta...', pct: 56 },
                    { label: 'Documenta...', pct: 84 },
                  ].map((e, i) => (
                    <View key={i} style={styles.evidenceRow}>
                      <Text style={styles.evidenceLabel}>{e.label}</Text>
                      <Text style={styles.evidencePct}>{e.pct}%</Text>
                    </View>
                  ))}
                </View>
              </View>
            </View>
          </>
        )}

        {/* Other Cases */}
        {otherCases.length > 0 && (
          <>
            <Text style={styles.sectionTitle}>Other Cases</Text>
            {otherCases.map((c: any) => {
              const rl = (c.risk_level || 'MEDIUM').toUpperCase();
              const riskColor = rl === 'HIGH' ? '#DC2626' : rl === 'LOW' ? '#16A34A' : '#D97706';
              const riskBg = rl === 'HIGH' ? '#FEE2E2' : rl === 'LOW' ? '#DCFCE7' : '#FEF3C7';
              const iconBg = rl === 'HIGH' ? '#FEF3C7' : '#DCFCE7';
              const iconColor = rl === 'HIGH' ? '#D97706' : '#16A34A';
              return (
                <TouchableOpacity key={c.id} style={styles.caseRow} activeOpacity={0.7}
                  onPress={() => router.push({ pathname: '/case-detail', params: { id: c.id } } as any)}>
                  <View style={[styles.caseIcon, { backgroundColor: iconBg }]}>
                    <Ionicons name="document-text" size={18} color={iconColor} />
                  </View>
                  <View style={styles.caseInfo}>
                    <Text style={styles.caseTitle} numberOfLines={1}>{c.title}</Text>
                    <Text style={styles.caseSub}>{c.assigned_lawyer} · #{c.case_number}</Text>
                  </View>
                  <View style={[styles.riskPill, { backgroundColor: riskBg }]}>
                    <Text style={[styles.riskPillText, { color: riskColor }]}>
                      {rl.charAt(0) + rl.slice(1).toLowerCase()}
                    </Text>
                  </View>
                </TouchableOpacity>
              );
            })}
          </>
        )}

        {/* Quick Actions */}
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        <View style={styles.quickRow}>
          {[
            { icon: 'sparkles', label: 'AI Analysis', color: Colors.accent, route: '/ai-engine' },
            { icon: 'shield-checkmark', label: 'My Rights', color: '#16A34A', route: '/(tabs)/rights' },
            { icon: 'people', label: 'Lawyers', color: '#9333EA', route: '/(tabs)/lawyers' },
            { icon: 'chatbubbles', label: 'Chat', color: '#EA580C', route: '/chat' },
          ].map((q, i) => (
            <TouchableOpacity key={i} style={styles.quickCard} onPress={() => router.push(q.route as any)}>
              <View style={[styles.quickIcon, { backgroundColor: q.color + '15' }]}>
                <Ionicons name={q.icon as any} size={20} color={q.color} />
              </View>
              <Text style={styles.quickLabel}>{q.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>

      <FloatingNav activeTab="home" onTabPress={(tab) => {
        if (tab !== 'home') router.push(`/(tabs)/${tab}` as any);
      }} />
      <EmergencyButton />
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.bgPrimary },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: Spacing.md, paddingVertical: 12, backgroundColor: Colors.bgSecondary,
  },
  greeting: { fontSize: 22, fontWeight: '800', color: Colors.textPrimary },
  subtitle: { fontSize: 12, color: Colors.textSecondary, marginTop: 1 },
  notifBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: Colors.bgPrimary, alignItems: 'center', justifyContent: 'center' },
  notifDot: { position: 'absolute', top: 2, right: 2, width: 18, height: 18, borderRadius: 9, backgroundColor: '#DC2626', alignItems: 'center', justifyContent: 'center' },
  notifDotText: { fontSize: 10, fontWeight: '700', color: '#FFF' },
  scroll: { flex: 1 },
  scrollContent: { paddingHorizontal: Spacing.md, paddingTop: 12 },
  emergencyBanner: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    backgroundColor: '#DC2626', borderRadius: Radius.lg, padding: 12, marginBottom: 8,
  },
  emergencyIcon: { width: 30, height: 30, borderRadius: 15, backgroundColor: 'rgba(255,255,255,0.2)', alignItems: 'center', justifyContent: 'center' },
  emergencyText: { flex: 1, fontSize: 14, fontWeight: '700', color: '#FFF' },
  aiCta: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    backgroundColor: Colors.accent, borderRadius: Radius.lg, padding: 12, marginBottom: 14,
  },
  aiCtaIcon: { width: 30, height: 30, borderRadius: 15, backgroundColor: 'rgba(255,255,255,0.2)', alignItems: 'center', justifyContent: 'center' },
  aiCtaTitle: { fontSize: 14, fontWeight: '700', color: '#FFF' },
  aiCtaSub: { fontSize: 11, color: 'rgba(255,255,255,0.7)' },
  twoCol: { flexDirection: 'row', gap: 10, marginBottom: 16 },
  progressCard: {
    flex: 1, backgroundColor: Colors.bgSecondary, borderRadius: Radius.xxl,
    padding: 14, ...Shadow.soft,
  },
  progressHeader: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 8 },
  progressIcon: { width: 24, height: 24, borderRadius: 12, backgroundColor: Colors.accentLight, alignItems: 'center', justifyContent: 'center' },
  progressTitle: { fontSize: 14, fontWeight: '700', color: Colors.textPrimary, flex: 1 },
  progressSummary: { fontSize: 12, color: Colors.textSecondary, marginBottom: 6 },
  progressPct: { fontWeight: '800', color: Colors.textPrimary },
  progressBar: { height: 4, backgroundColor: '#E5E7EB', borderRadius: 2, marginBottom: 12, overflow: 'hidden' },
  progressBarFill: { height: '100%', backgroundColor: Colors.accent, borderRadius: 2 },
  timelineRow: { flexDirection: 'row', minHeight: 36 },
  timelineLeft: { alignItems: 'center', width: 20, marginRight: 8 },
  tlDot: { width: 16, height: 16, borderRadius: 8, borderWidth: 2, borderColor: '#D1D5DB', alignItems: 'center', justifyContent: 'center', backgroundColor: '#FFF', zIndex: 1 },
  tlDotDone: { backgroundColor: '#16A34A', borderColor: '#16A34A' },
  tlLine: { width: 2, flex: 1, backgroundColor: '#D1D5DB', marginVertical: 1 },
  tlLineDone: { backgroundColor: '#16A34A' },
  timelineRight: { flex: 1, paddingBottom: 4 },
  tlStep: { fontSize: 12, fontWeight: '600', color: Colors.textPrimary },
  tlStepPending: { color: Colors.textSecondary },
  tlStatus: { fontSize: 10, color: Colors.textSecondary },
  successCard: {
    width: 150, backgroundColor: Colors.bgSecondary, borderRadius: Radius.xxl,
    padding: 14, alignItems: 'center', ...Shadow.soft,
  },
  successHeader: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', width: '100%', marginBottom: 8 },
  successTitle: { fontSize: 13, fontWeight: '700', color: Colors.textPrimary, lineHeight: 17 },
  riskTag: { paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6 },
  riskTagText: { fontSize: 10, fontWeight: '700' },
  evidenceList: { width: '100%', marginTop: 10, gap: 4 },
  evidenceRow: { flexDirection: 'row', justifyContent: 'space-between' },
  evidenceLabel: { fontSize: 11, color: Colors.textSecondary },
  evidencePct: { fontSize: 11, fontWeight: '700', color: Colors.textPrimary },
  sectionTitle: { fontSize: 18, fontWeight: '800', color: Colors.textPrimary, marginBottom: 10 },
  caseRow: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    backgroundColor: Colors.bgSecondary, borderRadius: Radius.xl, padding: 14, marginBottom: 8, ...Shadow.soft,
  },
  caseIcon: { width: 40, height: 40, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  caseInfo: { flex: 1 },
  caseTitle: { fontSize: 14, fontWeight: '600', color: Colors.textPrimary },
  caseSub: { fontSize: 12, color: Colors.textSecondary, marginTop: 2 },
  riskPill: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: Radius.pill },
  riskPillText: { fontSize: 11, fontWeight: '700' },
  quickRow: { flexDirection: 'row', gap: 8, marginBottom: 16 },
  quickCard: { flex: 1, backgroundColor: Colors.bgSecondary, borderRadius: Radius.xl, padding: 14, alignItems: 'center', gap: 8, ...Shadow.soft },
  quickIcon: { width: 40, height: 40, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  quickLabel: { fontSize: 11, fontWeight: '600', color: Colors.textPrimary },
});
