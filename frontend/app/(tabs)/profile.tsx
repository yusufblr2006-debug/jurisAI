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
  const [user, setUser] = useState<any>(null);
  const [cases, setCases] = useState<any[]>([]);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [u, c, n] = await Promise.all([api.getMe(), api.getCases(), api.getNotifications()]);
      setUser(u);
      setCases(c || []);
      setNotifications(n || []);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  const activeCases = cases.filter((c: any) => c.status === 'Active');
  const unread = notifications.filter((n: any) => !n.is_read).length;
  const initials = user ? user.name.split(' ').map((w: string) => w[0]).join('').toUpperCase() : 'U';

  if (loading) {
    return <View style={[styles.safe, { paddingTop: insets.top, justifyContent: 'center', alignItems: 'center' }]}><ActivityIndicator size="large" color={Colors.accent} /></View>;
  }

  return (
    <View style={[styles.safe, { paddingTop: insets.top }]}>
      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Profile Card */}
        <View style={styles.profileCard}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{initials}</Text>
          </View>
          <Text style={styles.name}>{user?.name || 'User'}</Text>
          <Text style={styles.email}>{user?.email}</Text>
          <Text style={styles.phone}>+91 98765 43210</Text>
        </View>

        {/* Stats Row */}
        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{cases.length}</Text>
            <Text style={styles.statLabel}>Cases</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{activeCases.length}</Text>
            <Text style={styles.statLabel}>Active</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{unread}</Text>
            <Text style={styles.statLabel}>Unread</Text>
          </View>
        </View>

        {/* Legal Activity */}
        <Text style={styles.sectionLabel}>LEGAL ACTIVITY</Text>
        {[
          { icon: 'notifications-outline', label: 'Notifications', route: '/notifications', color: Colors.accent },
          { icon: 'sparkles-outline', label: 'AI Legal Engine', route: '/ai-engine', color: Colors.accent },
          { icon: 'chatbubble-outline', label: 'Chat', route: '/chat', color: Colors.accent },
          { icon: 'document-text-outline', label: 'Documents', route: '/documents', color: Colors.accent },
        ].map((item, i) => (
          <TouchableOpacity key={i} style={styles.menuItem} onPress={() => router.push(item.route as any)} activeOpacity={0.7}>
            <View style={[styles.menuIcon, { backgroundColor: item.color + '12' }]}>
              <Ionicons name={item.icon as any} size={20} color={item.color} />
            </View>
            <Text style={styles.menuLabel}>{item.label}</Text>
            <Ionicons name="chevron-forward" size={18} color={Colors.textSecondary} />
          </TouchableOpacity>
        ))}

        {/* Account */}
        <Text style={styles.sectionLabel}>ACCOUNT</Text>
        {[
          { icon: 'settings-outline', label: 'Settings', route: '/settings' },
          { icon: 'language-outline', label: 'Language', route: '/language' },
          { icon: 'help-circle-outline', label: 'Help & Support', route: '/chat' },
        ].map((item, i) => (
          <TouchableOpacity key={i} style={styles.menuItem} onPress={() => router.push(item.route as any)} activeOpacity={0.7}>
            <View style={[styles.menuIcon, { backgroundColor: Colors.textSecondary + '12' }]}>
              <Ionicons name={item.icon as any} size={20} color={Colors.textSecondary} />
            </View>
            <Text style={styles.menuLabel}>{item.label}</Text>
            <Ionicons name="chevron-forward" size={18} color={Colors.textSecondary} />
          </TouchableOpacity>
        ))}

        {/* Case History */}
        {cases.length > 0 && (
          <>
            <Text style={styles.sectionLabel}>CASE HISTORY</Text>
            {cases.slice(0, 3).map((c: any, i: number) => {
              const riskColor = c.risk_level === 'HIGH' ? '#DC2626' : c.risk_level === 'LOW' ? '#16A34A' : '#D97706';
              return (
                <TouchableOpacity key={i} style={styles.caseItem}
                  onPress={() => router.push({ pathname: '/case-detail', params: { id: c.id } } as any)}>
                  <View style={styles.caseItemLeft}>
                    <Text style={styles.caseItemTitle} numberOfLines={1}>{c.title}</Text>
                    <Text style={styles.caseItemMeta}>{c.status} · {c.category}</Text>
                  </View>
                  <View style={[styles.caseRiskDot, { backgroundColor: riskColor }]} />
                </TouchableOpacity>
              );
            })}
          </>
        )}

        {/* Logout */}
        <TouchableOpacity style={styles.logoutBtn} onPress={() => {
          api.setAuthToken('');
          router.replace('/');
        }}>
          <Ionicons name="log-out-outline" size={18} color="#DC2626" />
          <Text style={styles.logoutText}>Logout</Text>
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
  scrollContent: { paddingHorizontal: Spacing.md, paddingTop: 16 },
  profileCard: {
    backgroundColor: Colors.bgSecondary, borderRadius: Radius.xxl,
    padding: 24, alignItems: 'center', marginBottom: 12, ...Shadow.soft,
  },
  avatar: {
    width: 72, height: 72, borderRadius: 36,
    backgroundColor: Colors.accent, alignItems: 'center', justifyContent: 'center', marginBottom: 12,
  },
  avatarText: { fontSize: 26, fontWeight: '800', color: '#FFF' },
  name: { fontSize: 20, fontWeight: '800', color: Colors.textPrimary },
  email: { fontSize: 13, color: Colors.textSecondary, marginTop: 2 },
  phone: { fontSize: 13, color: Colors.textSecondary, marginTop: 2 },
  statsRow: { flexDirection: 'row', gap: 8, marginBottom: 16 },
  statCard: {
    flex: 1, backgroundColor: Colors.bgSecondary, borderRadius: Radius.xl,
    padding: 14, alignItems: 'center', ...Shadow.soft,
  },
  statValue: { fontSize: 22, fontWeight: '800', color: Colors.textPrimary },
  statLabel: { fontSize: 12, color: Colors.textSecondary, marginTop: 2 },
  sectionLabel: { fontSize: 11, fontWeight: '700', color: Colors.textSecondary, letterSpacing: 0.5, marginBottom: 8, marginTop: 8 },
  menuItem: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    backgroundColor: Colors.bgSecondary, borderRadius: Radius.xl,
    padding: 14, marginBottom: 6, ...Shadow.soft,
  },
  menuIcon: { width: 36, height: 36, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  menuLabel: { flex: 1, fontSize: 15, fontWeight: '600', color: Colors.textPrimary },
  caseItem: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    backgroundColor: Colors.bgSecondary, borderRadius: Radius.xl, padding: 14, marginBottom: 6, ...Shadow.soft,
  },
  caseItemLeft: { flex: 1 },
  caseItemTitle: { fontSize: 14, fontWeight: '600', color: Colors.textPrimary },
  caseItemMeta: { fontSize: 12, color: Colors.textSecondary, marginTop: 2 },
  caseRiskDot: { width: 10, height: 10, borderRadius: 5 },
  logoutBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    backgroundColor: '#FEE2E2', borderRadius: Radius.xl, padding: 14, marginTop: 12,
  },
  logoutText: { fontSize: 15, fontWeight: '600', color: '#DC2626' },
});
