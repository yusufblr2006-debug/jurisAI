import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  ActivityIndicator, SafeAreaView, RefreshControl, Image,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, Radius, Shadow } from '../../src/utils/theme';
import { api } from '../../src/utils/api';
import FloatingNav from '../../src/components/FloatingNav';
import HeroCaseCard from '../../src/components/HeroCaseCard';
import CaseProgress from '../../src/components/CaseProgress';
import SuccessRing from '../../src/components/SuccessRing';

type TabName = 'Overview' | 'Documents' | 'Tasks';

export default function HomeScreen() {
  const router = useRouter();
  const [cases, setCases] = useState<any[]>([]);
  const [documents, setDocuments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState<TabName>('Overview');

  const fetchData = async () => {
    try {
      const [casesData, docsData] = await Promise.all([api.getCases(), api.getDocuments()]);
      setCases(casesData);
      setDocuments(docsData);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const activeCase = cases[0];
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning!' : hour < 17 ? 'Good afternoon!' : 'Good evening!';

  if (loading) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.accent} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchData(); }} tintColor={Colors.accent} />}
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <View style={styles.logoIcon}>
              <Ionicons name="shield-checkmark" size={22} color={Colors.accent} />
            </View>
            <Text style={styles.logoText}>JurisAI</Text>
          </View>
          <View style={styles.headerRight}>
            <View style={styles.notifBadge}>
              <TouchableOpacity testID="notif-btn" onPress={() => router.push('/notifications' as any)}>
                <Ionicons name="notifications-outline" size={20} color={Colors.textPrimary} />
                <View style={styles.notifDot} />
              </TouchableOpacity>
            </View>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>S</Text>
            </View>
          </View>
        </View>

        {/* Greeting */}
        <Text style={styles.greetingSub}>Hello, User</Text>
        <Text style={styles.greetingMain}>{greeting}</Text>

        {/* AI CTA Banner */}
        <TouchableOpacity testID="ai-engine-cta" style={styles.aiCta} onPress={() => router.push('/ai-engine' as any)} activeOpacity={0.8}>
          <View style={styles.aiCtaLeft}>
            <View style={styles.aiCtaIcon}>
              <Ionicons name="sparkles" size={22} color={Colors.textInverse} />
            </View>
            <View style={styles.aiCtaText}>
              <Text style={styles.aiCtaTitle}>AI Legal Engine</Text>
              <Text style={styles.aiCtaSub}>Get instant legal analysis</Text>
            </View>
          </View>
          <Ionicons name="arrow-forward-circle" size={28} color="rgba(255,255,255,0.7)" />
        </TouchableOpacity>

        {/* Tabs */}
        <View style={styles.tabRow}>
          <TouchableOpacity testID="tab-search" style={styles.searchPill}>
            <Ionicons name="search" size={18} color={Colors.textSecondary} />
          </TouchableOpacity>
          {(['Overview', 'Documents', 'Tasks'] as TabName[]).map(tab => (
            <TouchableOpacity
              key={tab}
              testID={`tab-${tab.toLowerCase()}`}
              style={[styles.tabPill, activeTab === tab && styles.tabPillActive]}
              onPress={() => setActiveTab(tab)}
            >
              <Text style={[styles.tabText, activeTab === tab && styles.tabTextActive]}>{tab}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {activeTab === 'Overview' && (
          <>
            {/* Hero Case Card */}
            {activeCase && (
              <HeroCaseCard
                title={activeCase.title}
                status={activeCase.status}
                lawyerName={activeCase.assigned_lawyer}
                caseNumber={activeCase.case_number}
                riskLevel={activeCase.risk_level}
                imageUrl="https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=600"
              />
            )}

            {/* Bento Grid */}
            <View style={styles.bentoGrid}>
              <View style={styles.bentoLeft}>
                {activeCase && <CaseProgress items={activeCase.timeline} totalSteps={activeCase.timeline?.length || 5} />}
              </View>
              <View style={styles.bentoRight}>
                <SuccessRing percentage={activeCase?.success_probability || 72} />
              </View>
            </View>

            {/* Cases List */}
            {cases.length > 1 && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Other Cases</Text>
                {cases.slice(1).map((c) => (
                  <View key={c.id} style={styles.caseRow}>
                    <View style={[styles.caseIcon, { backgroundColor: c.risk_level?.toUpperCase() === 'LOW' ? '#DCFCE7' : '#FEF3C7' }]}>
                      <Ionicons name="document-text" size={18} color={c.risk_level?.toUpperCase() === 'LOW' ? Colors.success : Colors.warning} />
                    </View>
                    <View style={styles.caseInfo}>
                      <Text style={styles.caseTitle} numberOfLines={1}>{c.title}</Text>
                      <Text style={styles.caseSub}>{c.assigned_lawyer} • #{c.case_number}</Text>
                    </View>
                    <View style={[styles.riskPill, { backgroundColor: c.risk_level?.toUpperCase() === 'LOW' ? '#DCFCE7' : c.risk_level?.toUpperCase() === 'HIGH' ? '#FEE2E2' : '#FEF3C7' }]}>
                      <Text style={[styles.riskPillText, { color: c.risk_level?.toUpperCase() === 'LOW' ? '#16A34A' : c.risk_level?.toUpperCase() === 'HIGH' ? '#DC2626' : '#D97706' }]}>
                        {(c.risk_level || 'Medium').charAt(0).toUpperCase() + (c.risk_level || 'Medium').slice(1).toLowerCase()}
                      </Text>
                    </View>
                  </View>
                ))}
              </View>
            )}
          </>
        )}

        {activeTab === 'Documents' && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <View style={styles.sectionHeaderLeft}>
                <Ionicons name="document-text" size={20} color={Colors.accent} />
                <Text style={styles.sectionTitle}>Documents</Text>
              </View>
            </View>
            {documents.map((doc) => (
              <View key={doc.id} style={styles.docRow}>
                <View style={styles.docIconCircle}>
                  <Ionicons name="document" size={20} color={Colors.success} />
                </View>
                <View style={styles.docInfo}>
                  <Text style={styles.docTitle} numberOfLines={1}>{doc.title}</Text>
                  <Text style={styles.docSub}>{doc.file_type} • {doc.file_size} • {doc.uploaded_at}</Text>
                </View>
                <View style={styles.docActions}>
                  <TouchableOpacity style={styles.docAction}>
                    <Ionicons name="eye-outline" size={18} color={Colors.textSecondary} />
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.docAction}>
                    <Ionicons name="download-outline" size={18} color={Colors.textSecondary} />
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </View>
        )}

        {activeTab === 'Tasks' && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Upcoming Tasks</Text>
            {[
              { title: 'Upload identity documents', due: 'Due Mar 30', icon: 'cloud-upload-outline' as const, urgent: true },
              { title: 'Review case summary', due: 'Due Apr 5', icon: 'reader-outline' as const, urgent: false },
              { title: 'Attend mediation session', due: 'Due Apr 15', icon: 'videocam-outline' as const, urgent: false },
            ].map((task, i) => (
              <View key={i} style={styles.taskRow}>
                <View style={[styles.taskIcon, task.urgent && { backgroundColor: '#FEE2E2' }]}>
                  <Ionicons name={task.icon} size={18} color={task.urgent ? Colors.danger : Colors.accent} />
                </View>
                <View style={styles.taskInfo}>
                  <Text style={styles.taskTitle}>{task.title}</Text>
                  <Text style={[styles.taskDue, task.urgent && { color: Colors.danger }]}>{task.due}</Text>
                </View>
                <Ionicons name="chevron-forward" size={18} color={Colors.textSecondary} />
              </View>
            ))}
          </View>
        )}

        <View style={{ height: 100 }} />
      </ScrollView>

      <FloatingNav activeTab="home" onTabPress={(tab) => {
        if (tab !== 'home') router.push(`/(tabs)/${tab}` as any);
      }} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.bgPrimary },
  loadingContainer: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  scroll: { flex: 1 },
  scrollContent: { paddingHorizontal: Spacing.md, paddingTop: Spacing.md },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  headerLeft: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  logoIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.textPrimary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoText: { fontSize: 20, fontWeight: '800', color: Colors.textPrimary },
  headerRight: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  notifBadge: { position: 'relative' },
  notifDot: {
    position: 'absolute', top: -2, right: -2,
    width: 8, height: 8, borderRadius: 4, backgroundColor: Colors.danger,
  },
  avatar: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: Colors.accent, alignItems: 'center', justifyContent: 'center',
  },
  avatarText: { fontSize: 14, fontWeight: '700', color: Colors.textInverse },
  greetingSub: { fontSize: 14, color: Colors.textSecondary },
  greetingMain: {
    fontSize: 32, fontWeight: '800', color: Colors.textPrimary,
    letterSpacing: -1, marginBottom: 16,
  },
  tabRow: {
    flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 20,
  },
  searchPill: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: Colors.bgSecondary, alignItems: 'center', justifyContent: 'center',
    ...Shadow.soft,
  },
  tabPill: {
    paddingHorizontal: 16, paddingVertical: 10, borderRadius: Radius.pill,
    backgroundColor: Colors.bgSecondary, ...Shadow.soft,
  },
  tabPillActive: { backgroundColor: Colors.textPrimary },
  tabText: { fontSize: 14, fontWeight: '600', color: Colors.textPrimary },
  tabTextActive: { color: Colors.textInverse },
  bentoGrid: {
    flexDirection: 'row', gap: 12, marginTop: 16,
  },
  bentoLeft: { flex: 1.2 },
  bentoRight: { flex: 1 },
  section: { marginTop: 20 },
  sectionHeader: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    marginBottom: 12,
  },
  sectionHeaderLeft: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  sectionTitle: {
    fontSize: 18, fontWeight: '700', color: Colors.textPrimary, marginBottom: 12,
  },
  caseRow: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: Colors.bgSecondary, borderRadius: Radius.xl,
    padding: 16, marginBottom: 10, ...Shadow.soft, gap: 12,
  },
  caseIcon: {
    width: 40, height: 40, borderRadius: 12,
    alignItems: 'center', justifyContent: 'center',
  },
  caseInfo: { flex: 1 },
  caseTitle: { fontSize: 14, fontWeight: '600', color: Colors.textPrimary },
  caseSub: { fontSize: 12, color: Colors.textSecondary, marginTop: 2 },
  riskPill: {
    paddingHorizontal: 10, paddingVertical: 4, borderRadius: Radius.pill,
  },
  riskPillText: { fontSize: 11, fontWeight: '700' },
  docRow: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: Colors.bgSecondary, borderRadius: Radius.xl,
    padding: 16, marginBottom: 10, ...Shadow.soft, gap: 12,
  },
  docIconCircle: {
    width: 40, height: 40, borderRadius: 12,
    backgroundColor: '#DCFCE7', alignItems: 'center', justifyContent: 'center',
  },
  docInfo: { flex: 1 },
  docTitle: { fontSize: 14, fontWeight: '600', color: Colors.textPrimary },
  docSub: { fontSize: 12, color: Colors.textSecondary, marginTop: 2 },
  docActions: { flexDirection: 'row', gap: 8 },
  docAction: {
    width: 32, height: 32, borderRadius: 16,
    backgroundColor: Colors.bgPrimary, alignItems: 'center', justifyContent: 'center',
  },
  taskRow: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: Colors.bgSecondary, borderRadius: Radius.xl,
    padding: 16, marginBottom: 10, ...Shadow.soft, gap: 12,
  },
  taskIcon: {
    width: 40, height: 40, borderRadius: 12,
    backgroundColor: Colors.accentLight, alignItems: 'center', justifyContent: 'center',
  },
  taskInfo: { flex: 1 },
  taskTitle: { fontSize: 14, fontWeight: '600', color: Colors.textPrimary },
  taskDue: { fontSize: 12, color: Colors.textSecondary, marginTop: 2 },
  aiCta: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    backgroundColor: Colors.accent, borderRadius: Radius.xxl,
    padding: 18, marginBottom: 16,
  },
  aiCtaLeft: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  aiCtaIcon: {
    width: 44, height: 44, borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.2)', alignItems: 'center', justifyContent: 'center',
  },
  aiCtaText: {},
  aiCtaTitle: { fontSize: 16, fontWeight: '700', color: Colors.textInverse },
  aiCtaSub: { fontSize: 12, color: 'rgba(255,255,255,0.7)', marginTop: 2 },
});
