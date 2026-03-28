import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  ActivityIndicator, RefreshControl,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors, Spacing, Radius, Shadow } from '../../src/utils/theme';
import { api } from '../../src/utils/api';
import FloatingNav from '../../src/components/FloatingNav';
import RiskBadge from '../../src/components/RiskBadge';

export default function CasesScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [cases, setCases] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('Active');

  const fetchCases = async () => {
    try {
      const data = await api.getCases();
      setCases(data);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchCases(); }, []);

  const filtered = cases.filter(c => {
    if (activeTab === 'Active') return c.status === 'Active' || c.status === 'In Progress';
    if (activeTab === 'Pending') return c.status === 'Pending' || c.status === 'Review';
    return true;
  });

  return (
    <View style={[styles.safe, { paddingTop: insets.top }]}>
      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={false} onRefresh={fetchCases} tintColor={Colors.accent} />}>
        <Text style={styles.title}>My Cases</Text>
        <Text style={styles.subtitle}>{cases.length} cases total</Text>

        <View style={styles.tabRow}>
          {['Active', 'Pending', 'All'].map(tab => (
            <TouchableOpacity key={tab} testID={`cases-tab-${tab.toLowerCase()}`}
              style={[styles.tabPill, activeTab === tab && styles.tabPillActive]}
              onPress={() => setActiveTab(tab)}>
              <Text style={[styles.tabText, activeTab === tab && styles.tabTextActive]}>{tab}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {loading ? <ActivityIndicator size="large" color={Colors.accent} style={{ marginTop: 40 }} /> : (
          filtered.length === 0 ? (
            <View style={styles.empty}>
              <Ionicons name="folder-open-outline" size={48} color={Colors.border} />
              <Text style={styles.emptyText}>No cases found</Text>
            </View>
          ) : filtered.map(c => (
            <View key={c.id} testID={`case-card-${c.id}`} style={styles.caseCard}>
              <View style={styles.caseHeader}>
                <View style={styles.caseCategory}>
                  <Ionicons name="document-text" size={16} color={Colors.accent} />
                  <Text style={styles.caseCategoryText}>{c.category}</Text>
                </View>
                <RiskBadge level={c.risk_level?.toLowerCase()} />
              </View>
              <Text style={styles.caseTitle}>{c.title}</Text>
              <Text style={styles.caseDesc} numberOfLines={2}>{c.description}</Text>
              <View style={styles.caseMeta}>
                <View style={styles.caseMetaItem}>
                  <Ionicons name="person-outline" size={14} color={Colors.textSecondary} />
                  <Text style={styles.caseMetaText}>{c.assigned_lawyer}</Text>
                </View>
                <Text style={styles.caseMetaSep}>•</Text>
                <Text style={styles.caseMetaText}>#{c.case_number}</Text>
              </View>
              <View style={styles.progressRow}>
                <View style={styles.progressBarBg}>
                  <View style={[styles.progressBarFill, { width: `${c.progress_percentage}%` }]} />
                </View>
                <Text style={styles.progressText}>{c.progress_percentage}%</Text>
              </View>
              <View style={styles.caseFooter}>
                <View style={styles.confidenceChip}>
                  <Ionicons name="sparkles" size={12} color={Colors.accent} />
                  <Text style={styles.confidenceText}>{c.success_probability}% confidence</Text>
                </View>
                <View style={[styles.statusBadge, c.status === 'Active' ? styles.statusActive : styles.statusPending]}>
                  <Text style={[styles.statusText, c.status === 'Active' ? styles.statusTextActive : styles.statusTextPending]}>{c.status}</Text>
                </View>
              </View>
            </View>
          ))
        )}
        <View style={{ height: 100 }} />
      </ScrollView>
      <FloatingNav activeTab="cases" onTabPress={(tab) => {
        if (tab !== 'cases') router.push(`/(tabs)/${tab}` as any);
      }} />
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.bgPrimary },
  scroll: { flex: 1 },
  scrollContent: { paddingHorizontal: Spacing.md, paddingTop: Spacing.md },
  title: { fontSize: 28, fontWeight: '800', color: Colors.textPrimary, letterSpacing: -0.5 },
  subtitle: { fontSize: 14, color: Colors.textSecondary, marginTop: 4, marginBottom: 16 },
  tabRow: { flexDirection: 'row', gap: 8, marginBottom: 16 },
  tabPill: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: Radius.pill, backgroundColor: Colors.bgSecondary, ...Shadow.soft },
  tabPillActive: { backgroundColor: Colors.textPrimary },
  tabText: { fontSize: 13, fontWeight: '600', color: Colors.textPrimary },
  tabTextActive: { color: Colors.textInverse },
  empty: { alignItems: 'center', marginTop: 60, gap: 12 },
  emptyText: { fontSize: 15, color: Colors.textSecondary },
  caseCard: { backgroundColor: Colors.bgSecondary, borderRadius: Radius.xxl, padding: 20, marginBottom: 12, ...Shadow.soft },
  caseHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  caseCategory: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  caseCategoryText: { fontSize: 12, fontWeight: '600', color: Colors.accent },
  caseTitle: { fontSize: 17, fontWeight: '700', color: Colors.textPrimary, marginBottom: 4 },
  caseDesc: { fontSize: 13, color: Colors.textSecondary, lineHeight: 20, marginBottom: 12 },
  caseMeta: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 12 },
  caseMetaItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  caseMetaText: { fontSize: 12, color: Colors.textSecondary },
  caseMetaSep: { fontSize: 12, color: Colors.border },
  progressRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 12 },
  progressBarBg: { flex: 1, height: 5, backgroundColor: Colors.border, borderRadius: 3, overflow: 'hidden' },
  progressBarFill: { height: '100%', backgroundColor: Colors.accent, borderRadius: 3 },
  progressText: { fontSize: 12, fontWeight: '700', color: Colors.textPrimary },
  caseFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  confidenceChip: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: Colors.accentLight, paddingHorizontal: 10, paddingVertical: 4, borderRadius: Radius.pill },
  confidenceText: { fontSize: 11, fontWeight: '600', color: Colors.accent },
  statusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: Radius.pill },
  statusActive: { backgroundColor: '#DCFCE7' },
  statusPending: { backgroundColor: '#FEF3C7' },
  statusText: { fontSize: 11, fontWeight: '700' },
  statusTextActive: { color: '#16A34A' },
  statusTextPending: { color: '#D97706' },
});
