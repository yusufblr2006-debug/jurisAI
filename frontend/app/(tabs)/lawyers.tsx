import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  ActivityIndicator, SafeAreaView, Image, TextInput,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, Radius, Shadow } from '../../src/utils/theme';
import { api } from '../../src/utils/api';
import FloatingNav from '../../src/components/FloatingNav';

const TIER_MAP: Record<number, { label: string; bg: string; text: string }> = {
  1: { label: 'Platinum', bg: '#E0E7FF', text: '#4338CA' },
  2: { label: 'Gold', bg: '#FEF3C7', text: '#D97706' },
  3: { label: 'Silver', bg: '#F3F4F6', text: '#6B7280' },
};

export default function LawyersScreen() {
  const router = useRouter();
  const [lawyers, setLawyers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('All');

  useEffect(() => {
    api.getLawyers().then(setLawyers).catch(console.error).finally(() => setLoading(false));
  }, []);

  const specialties = ['All', ...new Set(lawyers.flatMap(l => Array.isArray(l.specialty) ? l.specialty : [l.specialty]))];

  const filtered = lawyers.filter(l => {
    const specStr = Array.isArray(l.specialty) ? l.specialty.join(', ') : l.specialty;
    const matchSearch = l.name.toLowerCase().includes(search.toLowerCase()) ||
      specStr.toLowerCase().includes(search.toLowerCase());
    const matchFilter = filter === 'All' || (Array.isArray(l.specialty) ? l.specialty.includes(filter) : l.specialty === filter);
    return matchSearch && matchFilter;
  });

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
      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>Lawyer Marketplace</Text>
        <Text style={styles.subtitle}>Find the best legal experts across India</Text>

        {/* Search */}
        <View style={styles.searchBar}>
          <Ionicons name="search" size={18} color={Colors.textSecondary} />
          <TextInput
            testID="lawyer-search-input"
            style={styles.searchInput}
            placeholder="Search by name or specialty..."
            placeholderTextColor={Colors.textSecondary}
            value={search}
            onChangeText={setSearch}
          />
        </View>

        {/* Filter Chips */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterRow} contentContainerStyle={{ gap: 8 }}>
          {specialties.map(s => (
            <TouchableOpacity
              key={s}
              testID={`filter-${s.toLowerCase().replace(/\s/g, '-')}`}
              style={[styles.filterChip, filter === s && styles.filterChipActive]}
              onPress={() => setFilter(s)}
            >
              <Text style={[styles.filterText, filter === s && styles.filterTextActive]}>{s}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Lawyer Cards */}
        {filtered.map(lawyer => {
          const tier = TIER_MAP[lawyer.tier] || TIER_MAP[3];
          return (
            <View key={lawyer.id} testID={`lawyer-card-${lawyer.id}`} style={styles.lawyerCard}>
              <View style={styles.lawyerTop}>
                <View style={styles.avatarContainer}>
                  <Image source={{ uri: lawyer.avatar_url }} style={styles.lawyerAvatar} />
                </View>
                <View style={styles.lawyerInfo}>
                  <View style={styles.nameRow}>
                    <Text style={styles.lawyerName}>{lawyer.name}</Text>
                    <View style={[styles.tierBadge, { backgroundColor: tier.bg }]}>
                      <Text style={[styles.tierText, { color: tier.text }]}>{tier.label}</Text>
                    </View>
                  </View>
                  <Text style={styles.lawyerSpecialty}>{Array.isArray(lawyer.specialty) ? lawyer.specialty.join(' • ') : lawyer.specialty}</Text>
                  <View style={styles.statsRow}>
                    <View style={styles.stat}>
                      <Ionicons name="star" size={14} color="#F59E0B" />
                      <Text style={styles.statText}>{lawyer.rating}</Text>
                    </View>
                    <Text style={styles.statSep}>•</Text>
                    <Text style={styles.statText}>{lawyer.experience_years}y exp</Text>
                    <Text style={styles.statSep}>•</Text>
                    <Text style={styles.statText}>{lawyer.location}</Text>
                  </View>
                </View>
              </View>
              <View style={styles.lawyerBottom}>
                <View style={styles.winRate}>
                  <Ionicons name="trophy" size={14} color={Colors.success} />
                  <Text style={styles.winRateText}>{lawyer.cases_won}/{lawyer.total_cases} won</Text>
                </View>
                <TouchableOpacity testID={`consult-${lawyer.id}`} style={styles.consultBtn}>
                  <Text style={styles.consultBtnText}>Consult</Text>
                  <Ionicons name="arrow-forward" size={14} color={Colors.textInverse} />
                </TouchableOpacity>
              </View>
            </View>
          );
        })}

        <View style={{ height: 100 }} />
      </ScrollView>

      <FloatingNav activeTab="lawyers" onTabPress={(tab) => {
        if (tab !== 'lawyers') router.push(`/(tabs)/${tab}` as any);
      }} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.bgPrimary },
  loadingContainer: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  scroll: { flex: 1 },
  scrollContent: { paddingHorizontal: Spacing.md, paddingTop: Spacing.md },
  title: { fontSize: 28, fontWeight: '800', color: Colors.textPrimary, letterSpacing: -0.5 },
  subtitle: { fontSize: 14, color: Colors.textSecondary, marginBottom: 16, marginTop: 4 },
  searchBar: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    backgroundColor: Colors.bgSecondary, borderRadius: Radius.xl,
    paddingHorizontal: 16, paddingVertical: 12, ...Shadow.soft, marginBottom: 12,
  },
  searchInput: { flex: 1, fontSize: 15, color: Colors.textPrimary },
  filterRow: { marginBottom: 16 },
  filterChip: {
    paddingHorizontal: 16, paddingVertical: 8, borderRadius: Radius.pill,
    backgroundColor: Colors.bgSecondary, ...Shadow.soft,
  },
  filterChipActive: { backgroundColor: Colors.textPrimary },
  filterText: { fontSize: 13, fontWeight: '600', color: Colors.textPrimary },
  filterTextActive: { color: Colors.textInverse },
  lawyerCard: {
    backgroundColor: Colors.bgSecondary, borderRadius: Radius.xxl,
    padding: 16, marginBottom: 12, ...Shadow.soft,
  },
  lawyerTop: { flexDirection: 'row', gap: 14, marginBottom: 14 },
  avatarContainer: {
    width: 64, height: 64, borderRadius: 20, overflow: 'hidden',
    backgroundColor: Colors.bgPrimary,
  },
  lawyerAvatar: { width: 64, height: 64 },
  lawyerInfo: { flex: 1 },
  nameRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 2 },
  lawyerName: { fontSize: 16, fontWeight: '700', color: Colors.textPrimary },
  tierBadge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: Radius.pill },
  tierText: { fontSize: 11, fontWeight: '700' },
  lawyerSpecialty: { fontSize: 13, color: Colors.textSecondary, marginBottom: 6 },
  statsRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  stat: { flexDirection: 'row', alignItems: 'center', gap: 3 },
  statText: { fontSize: 12, color: Colors.textSecondary },
  statSep: { fontSize: 12, color: Colors.border },
  lawyerBottom: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    borderTopWidth: 1, borderTopColor: Colors.border, paddingTop: 12,
  },
  winRate: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  winRateText: { fontSize: 13, color: Colors.success, fontWeight: '600' },
  consultBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: Colors.accent, borderRadius: Radius.lg,
    paddingHorizontal: 16, paddingVertical: 10,
  },
  consultBtnText: { fontSize: 14, fontWeight: '700', color: Colors.textInverse },
});
