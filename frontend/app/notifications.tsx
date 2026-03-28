import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors, Spacing, Radius, Shadow } from '../src/utils/theme';
import { api } from '../src/utils/api';

const ICONS: Record<string, keyof typeof Ionicons.glyphMap> = {
  case_update: 'briefcase', message: 'chatbubble', document: 'document-text',
  community: 'chatbubbles', analysis: 'sparkles',
};

const ICON_COLORS: Record<string, string> = {
  case_update: Colors.accent, message: Colors.success, document: '#D97706',
  community: '#7C3AED', analysis: Colors.accent,
};

export default function NotificationsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [notifs, setNotifs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getNotifications().then(setNotifs).catch(console.error).finally(() => setLoading(false));
  }, []);

  const handleMarkAllRead = async () => {
    try {
      await api.markAllRead();
      setNotifs(prev => prev.map(n => ({ ...n, read: true })));
    } catch (e) { console.error(e); }
  };

  const unread = notifs.filter(n => !n.read).length;

  return (
    <View style={[styles.safe, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <TouchableOpacity testID="notif-back-btn" onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={22} color={Colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.title}>Notifications</Text>
        {unread > 0 && (
          <TouchableOpacity testID="mark-all-read-btn" onPress={handleMarkAllRead}>
            <Text style={styles.markAll}>Mark all read</Text>
          </TouchableOpacity>
        )}
      </View>

      {loading ? <ActivityIndicator size="large" color={Colors.accent} style={{ marginTop: 40 }} /> : (
        <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          {notifs.length === 0 ? (
            <View style={styles.empty}>
              <Ionicons name="notifications-off-outline" size={48} color={Colors.border} />
              <Text style={styles.emptyText}>No notifications</Text>
            </View>
          ) : notifs.map(n => (
            <TouchableOpacity key={n.id} testID={`notif-${n.id}`}
              style={[styles.notifCard, !n.read && styles.notifCardUnread]}
              onPress={async () => {
                if (!n.read) {
                  await api.markNotifRead(n.id).catch(console.error);
                  setNotifs(prev => prev.map(x => x.id === n.id ? { ...x, read: true } : x));
                }
              }}>
              <View style={[styles.notifIcon, { backgroundColor: (ICON_COLORS[n.type] || Colors.accent) + '15' }]}>
                <Ionicons name={ICONS[n.type] || 'notifications'} size={20} color={ICON_COLORS[n.type] || Colors.accent} />
              </View>
              <View style={styles.notifContent}>
                <Text style={styles.notifTitle}>{n.title}</Text>
                <Text style={styles.notifMessage} numberOfLines={2}>{n.message}</Text>
              </View>
              {!n.read && <View style={styles.unreadDot} />}
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.bgPrimary },
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: Spacing.md, paddingVertical: 12, gap: 12 },
  backBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: Colors.bgSecondary, alignItems: 'center', justifyContent: 'center', ...Shadow.soft },
  title: { fontSize: 22, fontWeight: '800', color: Colors.textPrimary, flex: 1 },
  markAll: { fontSize: 13, color: Colors.accent, fontWeight: '600' },
  scroll: { flex: 1 },
  scrollContent: { paddingHorizontal: Spacing.md },
  empty: { alignItems: 'center', marginTop: 60, gap: 12 },
  emptyText: { fontSize: 15, color: Colors.textSecondary },
  notifCard: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: Colors.bgSecondary, borderRadius: Radius.xl, padding: 16, marginBottom: 8, ...Shadow.soft },
  notifCardUnread: { borderLeftWidth: 3, borderLeftColor: Colors.accent },
  notifIcon: { width: 40, height: 40, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  notifContent: { flex: 1 },
  notifTitle: { fontSize: 14, fontWeight: '600', color: Colors.textPrimary },
  notifMessage: { fontSize: 13, color: Colors.textSecondary, marginTop: 2, lineHeight: 18 },
  unreadDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: Colors.accent },
});
