import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors, Spacing, Radius, Shadow } from '../../src/utils/theme';
import { api } from '../../src/utils/api';
import FloatingNav from '../../src/components/FloatingNav';
import EmergencyButton from '../../src/components/EmergencyButton';

export default function ProfileScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [notifications, setNotifications] = useState<any[]>([]);
  const [cases, setCases] = useState<any[]>([]);

  useEffect(() => {
    api.getNotifications().then(setNotifications).catch(console.error);
    api.getCases().then(setCases).catch(console.error);
  }, []);

  const unread = notifications.filter(n => !n.read).length;

  const menuItems = [
    { icon: 'notifications-outline' as const, label: 'Notifications', badge: unread, onPress: () => router.push('/notifications' as any) },
    { icon: 'sparkles-outline' as const, label: 'AI Legal Engine', onPress: () => router.push('/ai-engine' as any) },
    { icon: 'chatbubble-outline' as const, label: 'Chat', onPress: () => router.push('/chat' as any) },
    { icon: 'document-text-outline' as const, label: 'Documents', onPress: () => {} },
    { icon: 'settings-outline' as const, label: 'Settings', onPress: () => {} },
    { icon: 'language-outline' as const, label: 'Language', onPress: () => {} },
    { icon: 'help-circle-outline' as const, label: 'Help & Support', onPress: () => {} },
  ];

  return (
    <View style={[styles.safe, { paddingTop: insets.top }]}>
      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Profile Header */}
        <View style={styles.profileHeader}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>AS</Text>
          </View>
          <Text style={styles.userName}>Arjun Sharma</Text>
          <Text style={styles.userEmail}>arjun@test.com</Text>
          <Text style={styles.userPhone}>+91 98765 43210</Text>
        </View>

        {/* Stats */}
        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{cases.length}</Text>
            <Text style={styles.statLabel}>Cases</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{cases.filter(c => c.status === 'Active').length}</Text>
            <Text style={styles.statLabel}>Active</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{unread}</Text>
            <Text style={styles.statLabel}>Unread</Text>
          </View>
        </View>

        {/* Legal Activity */}
        <Text style={styles.sectionLabel}>LEGAL ACTIVITY</Text>
        {menuItems.slice(0, 4).map((item, i) => (
          <TouchableOpacity key={i} testID={`profile-menu-${item.label.toLowerCase().replace(/\s/g, '-')}`}
            style={styles.menuItem} onPress={item.onPress} activeOpacity={0.7}>
            <View style={styles.menuLeft}>
              <View style={styles.menuIcon}>
                <Ionicons name={item.icon} size={20} color={Colors.accent} />
              </View>
              <Text style={styles.menuLabel}>{item.label}</Text>
            </View>
            <View style={styles.menuRight}>
              {item.badge ? (
                <View style={styles.badgePill}>
                  <Text style={styles.badgeText}>{item.badge}</Text>
                </View>
              ) : null}
              <Ionicons name="chevron-forward" size={18} color={Colors.textSecondary} />
            </View>
          </TouchableOpacity>
        ))}

        {/* Account */}
        <Text style={styles.sectionLabel}>ACCOUNT</Text>
        {menuItems.slice(4).map((item, i) => (
          <TouchableOpacity key={i} style={styles.menuItem} onPress={item.onPress} activeOpacity={0.7}>
            <View style={styles.menuLeft}>
              <View style={styles.menuIcon}>
                <Ionicons name={item.icon} size={20} color={Colors.textSecondary} />
              </View>
              <Text style={styles.menuLabel}>{item.label}</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={Colors.textSecondary} />
          </TouchableOpacity>
        ))}

        {/* Case History */}
        <Text style={styles.sectionLabel}>CASE HISTORY</Text>
        {cases.length > 0 ? cases.slice(0, 3).map((c: any, i: number) => {
          const riskColor = c.risk_level === 'HIGH' ? '#DC2626' : c.risk_level === 'LOW' ? '#16A34A' : '#D97706';
          return (
            <TouchableOpacity key={i} style={styles.caseHistoryItem}
              onPress={() => router.push({ pathname: '/case-detail', params: { id: c.id } } as any)}>
              <View style={styles.caseHistoryLeft}>
                <Text style={styles.caseHistoryTitle} numberOfLines={1}>{c.title}</Text>
                <Text style={styles.caseHistoryMeta}>{c.status} • {c.category}</Text>
              </View>
              <View style={[styles.riskDot, { backgroundColor: riskColor }]} />
            </TouchableOpacity>
          );
        }) : (
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>No cases yet</Text>
          </View>
        )}

        {/* Logout */}
        <TouchableOpacity testID="logout-btn" style={styles.logoutBtn} onPress={() => router.replace('/')}>
          <Ionicons name="log-out-outline" size={20} color={Colors.danger} />
          <Text style={styles.logoutText}>Sign Out</Text>
        </TouchableOpacity>

        <View style={{ height: 100 }} />
      </ScrollView>
      <FloatingNav activeTab="profile" onTabPress={(tab) => {
        if (tab !== 'profile') router.push(`/(tabs)/${tab}` as any);
      }} />
      <EmergencyButton />
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.bgPrimary },
  scroll: { flex: 1 },
  scrollContent: { paddingHorizontal: Spacing.md, paddingTop: Spacing.md },
  profileHeader: { alignItems: 'center', paddingVertical: 24, backgroundColor: Colors.bgSecondary, borderRadius: Radius.xxl, ...Shadow.soft, marginBottom: 16 },
  avatar: { width: 72, height: 72, borderRadius: 36, backgroundColor: Colors.accent, alignItems: 'center', justifyContent: 'center', marginBottom: 12 },
  avatarText: { fontSize: 24, fontWeight: '800', color: Colors.textInverse },
  userName: { fontSize: 20, fontWeight: '700', color: Colors.textPrimary },
  userEmail: { fontSize: 14, color: Colors.textSecondary, marginTop: 2 },
  userPhone: { fontSize: 13, color: Colors.textSecondary, marginTop: 2 },
  statsRow: { flexDirection: 'row', gap: 10, marginBottom: 20 },
  statCard: { flex: 1, backgroundColor: Colors.bgSecondary, borderRadius: Radius.xl, padding: 16, alignItems: 'center', ...Shadow.soft },
  statNumber: { fontSize: 22, fontWeight: '800', color: Colors.textPrimary },
  statLabel: { fontSize: 12, color: Colors.textSecondary, marginTop: 2 },
  sectionLabel: { fontSize: 11, fontWeight: '700', color: Colors.textSecondary, letterSpacing: 0.5, marginBottom: 8, marginTop: 8 },
  menuItem: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: Colors.bgSecondary, borderRadius: Radius.xl, padding: 14, marginBottom: 8, ...Shadow.soft },
  menuLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  menuIcon: { width: 36, height: 36, borderRadius: 12, backgroundColor: Colors.accentLight, alignItems: 'center', justifyContent: 'center' },
  menuLabel: { fontSize: 15, fontWeight: '500', color: Colors.textPrimary },
  menuRight: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  badgePill: { backgroundColor: Colors.danger, width: 22, height: 22, borderRadius: 11, alignItems: 'center', justifyContent: 'center' },
  badgeText: { fontSize: 11, fontWeight: '700', color: Colors.textInverse },
  logoutBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, marginTop: 16, paddingVertical: 14, backgroundColor: '#FEE2E2', borderRadius: Radius.xl },
  logoutText: { fontSize: 15, fontWeight: '600', color: Colors.danger },
  caseHistoryItem: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    backgroundColor: Colors.bgSecondary, borderRadius: Radius.xl, padding: 14, marginBottom: 8, ...Shadow.soft,
  },
  caseHistoryLeft: { flex: 1 },
  caseHistoryTitle: { fontSize: 14, fontWeight: '600', color: Colors.textPrimary },
  caseHistoryMeta: { fontSize: 12, color: Colors.textSecondary, marginTop: 2 },
  riskDot: { width: 10, height: 10, borderRadius: 5 },
  emptyState: { backgroundColor: Colors.bgSecondary, borderRadius: Radius.xl, padding: 24, alignItems: 'center' as const, marginBottom: 8 },
  emptyText: { fontSize: 14, color: Colors.textSecondary },
});
