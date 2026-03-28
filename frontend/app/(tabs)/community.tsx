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

const CATEGORIES = ['All', 'Property', 'Criminal', 'Consumer', 'Family', 'Corporate'];

export default function CommunityScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('All');

  const fetchPosts = async () => {
    try {
      const data = await api.getCommunityPosts(filter);
      setPosts(data);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchPosts(); }, [filter]);

  const formatTime = (ts: string) => {
    const d = new Date(ts);
    const now = new Date();
    const h = Math.floor((now.getTime() - d.getTime()) / 3600000);
    if (h < 1) return 'Just now';
    if (h < 24) return `${h}h ago`;
    return `${Math.floor(h / 24)}d ago`;
  };

  return (
    <View style={[styles.safe, { paddingTop: insets.top }]}>
      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={false} onRefresh={fetchPosts} tintColor={Colors.accent} />}>

        <View style={styles.header}>
          <Text style={styles.title}>Community</Text>
          <TouchableOpacity testID="create-post-btn" style={styles.createBtn} onPress={() => router.push('/community-create' as any)}>
            <Ionicons name="add" size={20} color={Colors.textInverse} />
          </TouchableOpacity>
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterRow} contentContainerStyle={{ gap: 8 }}>
          {CATEGORIES.map(cat => (
            <TouchableOpacity key={cat} testID={`community-filter-${cat.toLowerCase()}`}
              style={[styles.filterChip, filter === cat && styles.filterChipActive]}
              onPress={() => { setFilter(cat); setLoading(true); }}>
              <Text style={[styles.filterText, filter === cat && styles.filterTextActive]}>{cat}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {loading ? <ActivityIndicator size="large" color={Colors.accent} style={{ marginTop: 40 }} /> : (
          posts.length === 0 ? (
            <View style={styles.empty}>
              <Ionicons name="chatbubbles-outline" size={48} color={Colors.border} />
              <Text style={styles.emptyText}>No posts yet</Text>
              <Text style={styles.emptySubText}>Be the first to start a discussion</Text>
            </View>
          ) : posts.map(post => {
            const hasLawyerReply = post.replies?.some((r: any) => r.is_lawyer);
            return (
              <TouchableOpacity key={post.id} testID={`community-post-${post.id}`} style={styles.postCard} activeOpacity={0.7}>
                <View style={styles.postHeader}>
                  <View style={styles.postCategoryPill}>
                    <Text style={styles.postCategoryText}>{post.category}</Text>
                  </View>
                  {hasLawyerReply && (
                    <View style={styles.lawyerRepliedBadge}>
                      <Ionicons name="shield-checkmark" size={12} color={Colors.accent} />
                      <Text style={styles.lawyerRepliedText}>Lawyer Replied</Text>
                    </View>
                  )}
                </View>
                <Text style={styles.postTitle}>{post.title}</Text>
                <Text style={styles.postContent} numberOfLines={2}>{post.content}</Text>
                <View style={styles.postFooter}>
                  <View style={styles.postStat}>
                    <Ionicons name="heart-outline" size={14} color={Colors.textSecondary} />
                    <Text style={styles.postStatText}>{post.likes}</Text>
                  </View>
                  <View style={styles.postStat}>
                    <Ionicons name="chatbubble-outline" size={14} color={Colors.textSecondary} />
                    <Text style={styles.postStatText}>{post.replies?.length || 0}</Text>
                  </View>
                  <View style={styles.postStat}>
                    <Ionicons name="eye-outline" size={14} color={Colors.textSecondary} />
                    <Text style={styles.postStatText}>{post.views}</Text>
                  </View>
                  <Text style={styles.postTime}>{formatTime(post.created_at)}</Text>
                </View>
              </TouchableOpacity>
            );
          })
        )}
        <View style={{ height: 100 }} />
      </ScrollView>
      <FloatingNav activeTab="community" onTabPress={(tab) => {
        if (tab !== 'community') router.push(`/(tabs)/${tab}` as any);
      }} />
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.bgPrimary },
  scroll: { flex: 1 },
  scrollContent: { paddingHorizontal: Spacing.md, paddingTop: Spacing.md },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  title: { fontSize: 28, fontWeight: '800', color: Colors.textPrimary, letterSpacing: -0.5 },
  createBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: Colors.accent, alignItems: 'center', justifyContent: 'center' },
  filterRow: { marginBottom: 16 },
  filterChip: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: Radius.pill, backgroundColor: Colors.bgSecondary, ...Shadow.soft },
  filterChipActive: { backgroundColor: Colors.textPrimary },
  filterText: { fontSize: 13, fontWeight: '600', color: Colors.textPrimary },
  filterTextActive: { color: Colors.textInverse },
  empty: { alignItems: 'center', marginTop: 60, gap: 8 },
  emptyText: { fontSize: 16, fontWeight: '600', color: Colors.textPrimary },
  emptySubText: { fontSize: 13, color: Colors.textSecondary },
  postCard: { backgroundColor: Colors.bgSecondary, borderRadius: Radius.xxl, padding: 20, marginBottom: 12, ...Shadow.soft },
  postHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  postCategoryPill: { backgroundColor: Colors.accentLight, paddingHorizontal: 10, paddingVertical: 4, borderRadius: Radius.pill },
  postCategoryText: { fontSize: 11, fontWeight: '600', color: Colors.accent },
  lawyerRepliedBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: '#EFF6FF', paddingHorizontal: 8, paddingVertical: 3, borderRadius: Radius.pill },
  lawyerRepliedText: { fontSize: 10, fontWeight: '600', color: Colors.accent },
  postTitle: { fontSize: 16, fontWeight: '700', color: Colors.textPrimary, marginBottom: 6, lineHeight: 22 },
  postContent: { fontSize: 13, color: Colors.textSecondary, lineHeight: 20, marginBottom: 12 },
  postFooter: { flexDirection: 'row', alignItems: 'center', gap: 16 },
  postStat: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  postStatText: { fontSize: 12, color: Colors.textSecondary },
  postTime: { fontSize: 12, color: Colors.textSecondary, marginLeft: 'auto' },
});
