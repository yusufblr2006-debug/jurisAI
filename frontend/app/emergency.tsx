import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors, Spacing, Radius, Shadow } from '../src/utils/theme';
import { api } from '../src/utils/api';

const SITUATIONS = [
  { id: 'police_stop', icon: 'shield-checkmark', color: '#2563EB', label: 'Police Stopped Me' },
  { id: 'arrest', icon: 'lock-closed', color: '#DC2626', label: 'Arrest Situation' },
  { id: 'domestic_violence', icon: 'heart-dislike', color: '#9333EA', label: 'Domestic Violence' },
  { id: 'cyber_crime', icon: 'globe', color: '#0891B2', label: 'Cyber Crime' },
  { id: 'workplace', icon: 'briefcase', color: '#EA580C', label: 'Workplace Issue' },
  { id: 'property_dispute', icon: 'home', color: '#16A34A', label: 'Property Dispute' },
];

const HELPLINES = [
  { label: 'Police', number: '100', icon: 'call' },
  { label: 'Women Helpline', number: '181', icon: 'female' },
  { label: 'Cyber Crime', number: '1930', icon: 'globe' },
  { label: 'Legal Aid', number: '15100', icon: 'scale' },
];

export default function EmergencyScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.safe, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity testID="emergency-back" onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="close" size={24} color="#FFF" />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Ionicons name="shield" size={20} color="#FFF" />
          <Text style={styles.headerTitle}>Emergency Legal Aid</Text>
        </View>
        <View style={{ width: 36 }} />
      </View>

      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Alert Banner */}
        <View style={styles.alertBanner}>
          <Ionicons name="alert-circle" size={20} color="#FEF3C7" />
          <Text style={styles.alertText}>Stay calm. Know your rights. You are protected by the Indian Constitution.</Text>
        </View>

        {/* Situation Selection */}
        <Text style={styles.sectionLabel}>WHAT IS YOUR SITUATION?</Text>
        <View style={styles.grid}>
          {SITUATIONS.map((s) => (
            <TouchableOpacity
              key={s.id}
              testID={`situation-${s.id}`}
              style={styles.situationCard}
              onPress={() => router.push({ pathname: '/emergency-rights', params: { situation: s.id } } as any)}
              activeOpacity={0.7}
            >
              <View style={[styles.situationIcon, { backgroundColor: s.color + '15' }]}>
                <Ionicons name={s.icon as any} size={28} color={s.color} />
              </View>
              <Text style={styles.situationLabel}>{s.label}</Text>
              <Ionicons name="chevron-forward" size={16} color={Colors.textSecondary} />
            </TouchableOpacity>
          ))}
        </View>

        {/* Emergency Helplines */}
        <Text style={styles.sectionLabel}>EMERGENCY HELPLINES</Text>
        <View style={styles.helplinesRow}>
          {HELPLINES.map((h, i) => (
            <View key={i} style={styles.helplineCard}>
              <View style={[styles.helplineIcon, { backgroundColor: '#DC262615' }]}>
                <Ionicons name={h.icon as any} size={18} color="#DC2626" />
              </View>
              <Text style={styles.helplineLabel}>{h.label}</Text>
              <Text style={styles.helplineNumber}>{h.number}</Text>
            </View>
          ))}
        </View>

        {/* Safety Tips */}
        <View style={styles.tipsCard}>
          <View style={styles.tipsHeader}>
            <Ionicons name="information-circle" size={18} color={Colors.accent} />
            <Text style={styles.tipsTitle}>General Safety Tips</Text>
          </View>
          <View style={styles.tipItem}><Text style={styles.tipBullet}>1.</Text><Text style={styles.tipText}>Always stay calm and do not escalate the situation</Text></View>
          <View style={styles.tipItem}><Text style={styles.tipBullet}>2.</Text><Text style={styles.tipText}>Record or note down names, badge numbers, and details</Text></View>
          <View style={styles.tipItem}><Text style={styles.tipBullet}>3.</Text><Text style={styles.tipText}>Contact a lawyer or legal aid before making statements</Text></View>
          <View style={styles.tipItem}><Text style={styles.tipBullet}>4.</Text><Text style={styles.tipText}>You have the right to remain silent under Article 20(3)</Text></View>
          <View style={styles.tipItem}><Text style={styles.tipBullet}>5.</Text><Text style={styles.tipText}>If threatened, call 100 (Police) or 112 (Emergency)</Text></View>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#1C1917' },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: Spacing.md, paddingVertical: 14,
    backgroundColor: '#DC2626',
  },
  backBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: 'rgba(255,255,255,0.2)', alignItems: 'center', justifyContent: 'center' },
  headerCenter: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  headerTitle: { fontSize: 18, fontWeight: '800', color: '#FFF' },
  scroll: { flex: 1 },
  scrollContent: { paddingHorizontal: Spacing.md, paddingTop: 16 },
  alertBanner: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    backgroundColor: '#78350F', borderRadius: Radius.lg, padding: 14, marginBottom: 20,
  },
  alertText: { fontSize: 13, color: '#FEF3C7', flex: 1, lineHeight: 19 },
  sectionLabel: { fontSize: 11, fontWeight: '700', color: '#A8A29E', letterSpacing: 0.5, marginBottom: 10 },
  grid: { gap: 8, marginBottom: 24 },
  situationCard: {
    flexDirection: 'row', alignItems: 'center', gap: 14,
    backgroundColor: '#292524', borderRadius: Radius.xl, padding: 16,
  },
  situationIcon: { width: 48, height: 48, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  situationLabel: { flex: 1, fontSize: 16, fontWeight: '600', color: '#FAFAF9' },
  helplinesRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 24 },
  helplineCard: {
    width: '48%', backgroundColor: '#292524', borderRadius: Radius.lg,
    padding: 14, alignItems: 'center', gap: 6,
  },
  helplineIcon: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
  helplineLabel: { fontSize: 12, color: '#A8A29E', fontWeight: '600' },
  helplineNumber: { fontSize: 20, fontWeight: '800', color: '#FAFAF9' },
  tipsCard: { backgroundColor: '#292524', borderRadius: Radius.xl, padding: 16, marginBottom: 16 },
  tipsHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12 },
  tipsTitle: { fontSize: 15, fontWeight: '700', color: '#FAFAF9' },
  tipItem: { flexDirection: 'row', gap: 8, marginBottom: 8 },
  tipBullet: { fontSize: 13, color: Colors.accent, fontWeight: '700', width: 20 },
  tipText: { fontSize: 13, color: '#D6D3D1', flex: 1, lineHeight: 19 },
});
