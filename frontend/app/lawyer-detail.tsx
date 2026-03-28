import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, ActivityIndicator } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors, Spacing, Radius, Shadow } from '../src/utils/theme';
import ExpandableSection from '../src/components/ExpandableSection';
import { api } from '../src/utils/api';

const TIER_MAP: Record<number, { label: string; bg: string; text: string }> = {
  1: { label: 'Platinum', bg: '#E0E7FF', text: '#4338CA' },
  2: { label: 'Gold', bg: '#FEF3C7', text: '#D97706' },
  3: { label: 'Silver', bg: '#F3F4F6', text: '#6B7280' },
};

export default function LawyerDetailScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams();
  const [lawyer, setLawyer] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadLawyer();
  }, [id]);

  const loadLawyer = async () => {
    try {
      const result = await api.getLawyer(id as string);
      setLawyer(result);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <View style={[styles.safe, { paddingTop: insets.top, justifyContent: 'center', alignItems: 'center' }]}><ActivityIndicator size="large" color={Colors.accent} /></View>;
  }

  if (!lawyer) {
    return (
      <View style={[styles.safe, { paddingTop: insets.top, justifyContent: 'center', alignItems: 'center' }]}>
        <Text style={{ color: Colors.textSecondary }}>Lawyer not found</Text>
        <TouchableOpacity onPress={() => router.back()} style={{ marginTop: 12 }}><Text style={{ color: Colors.accent }}>Go Back</Text></TouchableOpacity>
      </View>
    );
  }

  const tier = TIER_MAP[lawyer.tier] || TIER_MAP[3];
  const winRate = lawyer.total_cases > 0 ? Math.round((lawyer.cases_won / lawyer.total_cases) * 100) : 0;

  return (
    <View style={[styles.safe, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={22} color={Colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Lawyer Profile</Text>
        <View style={{ width: 36 }} />
      </View>

      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Profile Card */}
        <View style={styles.profileCard}>
          <Image source={{ uri: lawyer.avatar_url }} style={styles.avatar} />
          <Text style={styles.name}>{lawyer.name}</Text>
          <View style={styles.badgeRow}>
            <View style={[styles.tierBadge, { backgroundColor: tier.bg }]}>
              <Text style={[styles.tierText, { color: tier.text }]}>{tier.label}</Text>
            </View>
            {lawyer.verified && (
              <View style={styles.verifiedBadge}>
                <Ionicons name="checkmark-circle" size={14} color="#16A34A" />
                <Text style={styles.verifiedText}>Verified</Text>
              </View>
            )}
          </View>
          <Text style={styles.specialties}>{Array.isArray(lawyer.specialty) ? lawyer.specialty.join(' | ') : lawyer.specialty}</Text>
          <Text style={styles.location}><Ionicons name="location" size={14} color={Colors.textSecondary} /> {lawyer.location}</Text>
        </View>

        {/* Stats */}
        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{lawyer.rating}</Text>
            <Ionicons name="star" size={14} color="#F59E0B" />
            <Text style={styles.statLabel}>Rating</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{lawyer.experience_years}y</Text>
            <Text style={styles.statLabel}>Experience</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{winRate}%</Text>
            <Text style={styles.statLabel}>Win Rate</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{lawyer.total_cases}</Text>
            <Text style={styles.statLabel}>Cases</Text>
          </View>
        </View>

        {/* Why This Lawyer */}
        <ExpandableSection title="Why This Lawyer?" icon="help-circle" iconColor="#2563EB" defaultOpen={true}>
          <View style={styles.whyItem}><Ionicons name="checkmark" size={16} color="#16A34A" /><Text style={styles.whyText}>{tier.label} tier with {lawyer.experience_years}+ years of experience</Text></View>
          <View style={styles.whyItem}><Ionicons name="checkmark" size={16} color="#16A34A" /><Text style={styles.whyText}>{winRate}% win rate across {lawyer.total_cases} cases</Text></View>
          <View style={styles.whyItem}><Ionicons name="checkmark" size={16} color="#16A34A" /><Text style={styles.whyText}>Specializes in {Array.isArray(lawyer.specialty) ? lawyer.specialty.join(', ') : lawyer.specialty}</Text></View>
          <View style={styles.whyItem}><Ionicons name="checkmark" size={16} color="#16A34A" /><Text style={styles.whyText}>{lawyer.verified ? 'Bar Council verified' : 'Verification pending'}</Text></View>
        </ExpandableSection>

        {/* Bio */}
        <ExpandableSection title="About" icon="person" iconColor="#6B7280" defaultOpen={true}>
          <Text style={styles.bioText}>{lawyer.bio}</Text>
        </ExpandableSection>

        {/* Pricing */}
        <ExpandableSection title="Pricing" icon="card" iconColor="#16A34A" defaultOpen={true}>
          <View style={styles.priceRow}>
            <Text style={styles.priceLabel}>Consultation Fee</Text>
            <Text style={styles.priceValue}>Rs {lawyer.consultation_fee?.toLocaleString()}</Text>
          </View>
          <View style={styles.priceRow}>
            <Text style={styles.priceLabel}>Availability</Text>
            <Text style={[styles.priceValue, { color: Colors.accent }]}>{lawyer.availability}</Text>
          </View>
        </ExpandableSection>

        {/* Reviews */}
        <ExpandableSection title="Client Reviews" icon="chatbubbles" iconColor="#F59E0B" badge="5 reviews">
          {[{name: 'Rahul M.', rating: 5, text: 'Excellent advice on my property case. Very professional.'}, {name: 'Priya S.', rating: 5, text: 'Helped me understand my rights clearly. Highly recommended.'}, {name: 'Vikram K.', rating: 4, text: 'Good legal guidance. Resolved my issue quickly.'}].map((r, i) => (
            <View key={i} style={styles.reviewCard}>
              <View style={styles.reviewHeader}>
                <Text style={styles.reviewName}>{r.name}</Text>
                <View style={styles.reviewStars}>{Array.from({length: r.rating}).map((_, j) => <Ionicons key={j} name="star" size={12} color="#F59E0B" />)}</View>
              </View>
              <Text style={styles.reviewText}>{r.text}</Text>
            </View>
          ))}
        </ExpandableSection>

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Bottom CTA */}
      <View style={[styles.bottomBar, { paddingBottom: insets.bottom + 12 }]}>
        <View style={styles.feeDisplay}>
          <Text style={styles.feeLabel}>Consultation</Text>
          <Text style={styles.feeAmount}>Rs {lawyer.consultation_fee?.toLocaleString()}</Text>
        </View>
        <TouchableOpacity testID="book-lawyer" style={styles.bookBtn} onPress={() => router.push({ pathname: '/payment', params: { lawyerName: lawyer.name, amount: String(lawyer.consultation_fee || 2000) } } as any)}>
          <Ionicons name="videocam" size={18} color="#FFF" />
          <Text style={styles.bookBtnText}>Book Consultation</Text>
        </TouchableOpacity>
      </View>
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
  profileCard: { backgroundColor: Colors.bgSecondary, borderRadius: Radius.xxl, padding: 24, alignItems: 'center', marginBottom: 12, ...Shadow.soft },
  avatar: { width: 80, height: 80, borderRadius: 40, marginBottom: 12, backgroundColor: Colors.border },
  name: { fontSize: 22, fontWeight: '800', color: Colors.textPrimary, marginBottom: 8 },
  badgeRow: { flexDirection: 'row', gap: 8, marginBottom: 8 },
  tierBadge: { paddingHorizontal: 12, paddingVertical: 4, borderRadius: Radius.pill },
  tierText: { fontSize: 12, fontWeight: '700' },
  verifiedBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: '#DCFCE7', paddingHorizontal: 10, paddingVertical: 4, borderRadius: Radius.pill },
  verifiedText: { fontSize: 12, fontWeight: '600', color: '#16A34A' },
  specialties: { fontSize: 14, color: Colors.textSecondary, marginBottom: 4 },
  location: { fontSize: 13, color: Colors.textSecondary },
  statsRow: { flexDirection: 'row', gap: 8, marginBottom: 12 },
  statCard: { flex: 1, backgroundColor: Colors.bgSecondary, borderRadius: Radius.xl, padding: 14, alignItems: 'center', ...Shadow.soft, gap: 2 },
  statValue: { fontSize: 18, fontWeight: '800', color: Colors.textPrimary },
  statLabel: { fontSize: 11, color: Colors.textSecondary, fontWeight: '500' },
  whyItem: { flexDirection: 'row', alignItems: 'flex-start', gap: 10, marginBottom: 8 },
  whyText: { fontSize: 14, color: Colors.textPrimary, flex: 1, lineHeight: 20 },
  bioText: { fontSize: 14, color: Colors.textPrimary, lineHeight: 22 },
  priceRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: Colors.border },
  priceLabel: { fontSize: 14, color: Colors.textSecondary },
  priceValue: { fontSize: 16, fontWeight: '700', color: Colors.textPrimary },
  reviewCard: { backgroundColor: Colors.bgPrimary, borderRadius: Radius.lg, padding: 12, marginBottom: 8 },
  reviewHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
  reviewName: { fontSize: 14, fontWeight: '600', color: Colors.textPrimary },
  reviewStars: { flexDirection: 'row', gap: 2 },
  reviewText: { fontSize: 13, color: Colors.textSecondary, lineHeight: 19 },
  bottomBar: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: Spacing.md, paddingTop: 12, backgroundColor: Colors.bgSecondary, borderTopWidth: 1, borderTopColor: Colors.border, gap: 12 },
  feeDisplay: { flex: 1 },
  feeLabel: { fontSize: 12, color: Colors.textSecondary },
  feeAmount: { fontSize: 20, fontWeight: '800', color: Colors.textPrimary },
  bookBtn: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: Colors.accent, borderRadius: Radius.lg, paddingHorizontal: 20, paddingVertical: 14 },
  bookBtnText: { fontSize: 14, fontWeight: '700', color: '#FFF' },
});
