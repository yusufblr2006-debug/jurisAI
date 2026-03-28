import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Speech from 'expo-speech';
import { Colors, Spacing, Radius, Shadow } from '../../src/utils/theme';
import ExpandableSection from '../../src/components/ExpandableSection';
import EmergencyButton from '../../src/components/EmergencyButton';
import FloatingNav from '../../src/components/FloatingNav';
import { api } from '../../src/utils/api';

export default function RightsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState('');
  const [speaking, setSpeaking] = useState('');

  useEffect(() => {
    loadRights();
    return () => { Speech.stop(); };
  }, []);

  const loadRights = async () => {
    try {
      const result = await api.getRights();
      setCategories(result);
      if (result.length > 0) setActiveCategory(result[0].id);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  const handleSpeak = (text: string, id: string) => {
    if (speaking === id) {
      Speech.stop();
      setSpeaking('');
      return;
    }
    setSpeaking(id);
    Speech.speak(text, {
      language: 'en-IN',
      rate: 0.85,
      onDone: () => setSpeaking(''),
      onStopped: () => setSpeaking(''),
    });
  };

  const activeData = categories.find(c => c.id === activeCategory);

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
          <Text style={styles.headerTitle}>Know Your Rights</Text>
          <Text style={styles.headerSub}>Indian Constitution & Laws</Text>
        </View>
      </View>

      {/* Category Filter */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterBar}
        contentContainerStyle={{ paddingHorizontal: Spacing.md, gap: 8 }}>
        {categories.map(cat => (
          <TouchableOpacity
            key={cat.id}
            style={[styles.filterChip, activeCategory === cat.id && styles.filterChipActive]}
            onPress={() => setActiveCategory(cat.id)}
          >
            <Ionicons name={cat.icon as any} size={14} color={activeCategory === cat.id ? '#FFF' : Colors.textPrimary} />
            <Text style={[styles.filterText, activeCategory === cat.id && styles.filterTextActive]}>
              {cat.category}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {activeData && (
          <>
            {/* Category Description */}
            <View style={styles.catDescCard}>
              <View style={styles.catDescIcon}>
                <Ionicons name={activeData.icon as any} size={22} color={Colors.accent} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.catDescTitle}>{activeData.category}</Text>
                <Text style={styles.catDescText}>{activeData.description}</Text>
              </View>
            </View>

            {/* Rights Cards */}
            {activeData.rights?.map((right: any, i: number) => (
              <ExpandableSection
                key={i}
                title={right.title}
                icon="shield-checkmark"
                iconColor={Colors.accent}
                badge={right.reference?.split(',')[0]}
                badgeColor="#6B7280"
              >
                {/* Simplified */}
                <View style={styles.simplifiedCard}>
                  <Ionicons name="bulb" size={16} color="#F59E0B" />
                  <Text style={styles.simplifiedText}>{right.simplified}</Text>
                </View>

                {/* Full Text */}
                <Text style={styles.fullText}>{right.full_text}</Text>

                {/* Legal Reference */}
                <View style={styles.refCard}>
                  <Ionicons name="book" size={14} color={Colors.accent} />
                  <Text style={styles.refText}>{right.reference}</Text>
                </View>

                {/* Actions */}
                <View style={styles.rightActions}>
                  <TouchableOpacity
                    style={[styles.rightActionBtn, speaking === `${activeCategory}-${i}` && { backgroundColor: '#FEE2E2' }]}
                    onPress={() => handleSpeak(`${right.title}. ${right.simplified}. ${right.full_text}`, `${activeCategory}-${i}`)}
                  >
                    <Ionicons name={speaking === `${activeCategory}-${i}` ? 'stop-circle' : 'volume-high'} size={16}
                      color={speaking === `${activeCategory}-${i}` ? '#DC2626' : Colors.accent} />
                    <Text style={[styles.rightActionText, speaking === `${activeCategory}-${i}` && { color: '#DC2626' }]}>
                      {speaking === `${activeCategory}-${i}` ? 'Stop' : 'Read Aloud'}
                    </Text>
                  </TouchableOpacity>
                </View>
              </ExpandableSection>
            ))}
          </>
        )}
        <View style={{ height: 100 }} />
      </ScrollView>
      <FloatingNav activeTab="rights" onTabPress={(tab) => {
        if (tab !== 'rights') router.push(`/(tabs)/${tab}` as any);
      }} />
      <EmergencyButton />
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.bgPrimary },
  header: { paddingHorizontal: Spacing.md, paddingVertical: 14, backgroundColor: Colors.bgSecondary },
  headerTitle: { fontSize: 24, fontWeight: '800', color: Colors.textPrimary },
  headerSub: { fontSize: 13, color: Colors.textSecondary, marginTop: 2 },
  filterBar: { maxHeight: 52, backgroundColor: Colors.bgSecondary, paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: Colors.border },
  filterChip: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: Colors.bgPrimary, borderRadius: Radius.pill,
    paddingHorizontal: 14, paddingVertical: 8,
  },
  filterChipActive: { backgroundColor: Colors.textPrimary },
  filterText: { fontSize: 12, fontWeight: '600', color: Colors.textPrimary },
  filterTextActive: { color: '#FFF' },
  scroll: { flex: 1 },
  scrollContent: { paddingHorizontal: Spacing.md, paddingTop: 16 },
  catDescCard: {
    flexDirection: 'row', alignItems: 'center', gap: 14,
    backgroundColor: Colors.bgSecondary, borderRadius: Radius.xxl, padding: 16, marginBottom: 14, ...Shadow.soft,
  },
  catDescIcon: { width: 44, height: 44, borderRadius: 22, backgroundColor: Colors.accentLight, alignItems: 'center', justifyContent: 'center' },
  catDescTitle: { fontSize: 16, fontWeight: '700', color: Colors.textPrimary },
  catDescText: { fontSize: 13, color: Colors.textSecondary, marginTop: 2 },
  simplifiedCard: {
    flexDirection: 'row', alignItems: 'flex-start', gap: 10,
    backgroundColor: '#FFFBEB', borderRadius: Radius.lg, padding: 12, marginBottom: 10,
  },
  simplifiedText: { fontSize: 14, color: '#92400E', flex: 1, lineHeight: 20, fontWeight: '500' },
  fullText: { fontSize: 13, color: Colors.textPrimary, lineHeight: 21, marginBottom: 10 },
  refCard: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: Colors.accentLight, borderRadius: Radius.lg, padding: 10, marginBottom: 10,
  },
  refText: { fontSize: 12, color: Colors.accent, fontWeight: '600', flex: 1 },
  rightActions: { flexDirection: 'row', gap: 8 },
  rightActionBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: Colors.bgPrimary, borderRadius: Radius.lg, paddingHorizontal: 12, paddingVertical: 8,
  },
  rightActionText: { fontSize: 12, fontWeight: '600', color: Colors.accent },
});
