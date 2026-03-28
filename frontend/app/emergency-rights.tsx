import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator, Share, Platform } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Speech from 'expo-speech';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Colors, Spacing, Radius, Shadow } from '../src/utils/theme';
import ExpandableSection from '../src/components/ExpandableSection';
import { api } from '../src/utils/api';

export default function EmergencyRightsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { situation } = useLocalSearchParams();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [speaking, setSpeaking] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    loadRights();
    return () => { Speech.stop(); };
  }, [situation]);

  const loadRights = async () => {
    try {
      const result = await api.getEmergencyRights(situation as string);
      setData(result);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleSpeak = async () => {
    if (speaking) {
      Speech.stop();
      setSpeaking(false);
      return;
    }
    if (!data) return;
    setSpeaking(true);
    const text = `${data.title}. Your Rights: ${data.your_rights.join('. ')}. What you should say: ${data.what_to_say.join('. ')}. What not to do: ${data.what_not_to_do.join('. ')}. Immediate actions: ${data.immediate_actions.join('. ')}`;
    Speech.speak(text, {
      language: 'en-IN',
      rate: 0.85,
      onDone: () => setSpeaking(false),
      onStopped: () => setSpeaking(false),
    });
  };

  const handleShare = async () => {
    if (!data) return;
    const text = `EMERGENCY LEGAL RIGHTS - ${data.title}\n\nYOUR RIGHTS:\n${data.your_rights.map((r: string, i: number) => `${i+1}. ${r}`).join('\n')}\n\nWHAT TO SAY:\n${data.what_to_say.join('\n')}\n\nWHAT NOT TO DO:\n${data.what_not_to_do.join('\n')}\n\nIMMEDIATE ACTIONS:\n${data.immediate_actions.join('\n')}\n\n— JurisAI Legal Assistant`;
    try {
      await Share.share({ message: text, title: `Legal Rights - ${data.title}` });
    } catch (e) { console.error(e); }
  };

  const handleSaveOffline = async () => {
    if (!data) return;
    try {
      await AsyncStorage.setItem(`emergency_${situation}`, JSON.stringify(data));
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (e) { console.error(e); }
  };

  if (loading) {
    return (
      <View style={[styles.safe, { paddingTop: insets.top, justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color="#DC2626" />
        <Text style={styles.loadingText}>Loading your rights...</Text>
      </View>
    );
  }

  if (!data) {
    return (
      <View style={[styles.safe, { paddingTop: insets.top, justifyContent: 'center', alignItems: 'center' }]}>
        <Ionicons name="alert-circle" size={48} color="#DC2626" />
        <Text style={styles.errorText}>Could not load rights data</Text>
        <TouchableOpacity style={styles.retryBtn} onPress={loadRights}>
          <Text style={styles.retryText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={[styles.safe, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: data.color || '#DC2626' }]}>
        <TouchableOpacity testID="rights-back" onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={22} color="#FFF" />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Ionicons name={data.icon as any} size={20} color="#FFF" />
          <Text style={styles.headerTitle} numberOfLines={1}>{data.title}</Text>
        </View>
        <View style={{ width: 36 }} />
      </View>

      {/* Action Bar */}
      <View style={styles.actionBar}>
        <TouchableOpacity testID="tts-btn" style={[styles.actionBtn, speaking && styles.actionBtnActive]} onPress={handleSpeak}>
          <Ionicons name={speaking ? 'stop-circle' : 'volume-high'} size={18} color={speaking ? '#DC2626' : '#FAFAF9'} />
          <Text style={[styles.actionBtnText, speaking && { color: '#DC2626' }]}>{speaking ? 'Stop' : 'Read Aloud'}</Text>
        </TouchableOpacity>
        <TouchableOpacity testID="share-btn" style={styles.actionBtn} onPress={handleShare}>
          <Ionicons name="share-social" size={18} color="#FAFAF9" />
          <Text style={styles.actionBtnText}>Share</Text>
        </TouchableOpacity>
        <TouchableOpacity testID="save-btn" style={[styles.actionBtn, saved && styles.actionBtnSaved]} onPress={handleSaveOffline}>
          <Ionicons name={saved ? 'checkmark-circle' : 'download'} size={18} color={saved ? '#16A34A' : '#FAFAF9'} />
          <Text style={[styles.actionBtnText, saved && { color: '#16A34A' }]}>{saved ? 'Saved!' : 'Save Offline'}</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Your Rights */}
        <ExpandableSection title="Your Rights" icon="shield-checkmark" iconColor="#16A34A" badge={`${data.your_rights.length} rights`} badgeColor="#16A34A" defaultOpen={true}>
          {data.your_rights.map((r: string, i: number) => (
            <View key={i} style={styles.rightItem}>
              <View style={styles.rightDot}><Text style={styles.rightDotText}>{i+1}</Text></View>
              <Text style={styles.rightText}>{r}</Text>
            </View>
          ))}
        </ExpandableSection>

        {/* What to Say */}
        <ExpandableSection title="What You Should Say" icon="chatbubble-ellipses" iconColor="#2563EB" defaultOpen={true}>
          {data.what_to_say.map((s: string, i: number) => (
            <View key={i} style={styles.sayCard}>
              <Ionicons name="chatbubble" size={14} color="#2563EB" />
              <Text style={styles.sayText}>{s}</Text>
            </View>
          ))}
        </ExpandableSection>

        {/* What NOT to Do */}
        <ExpandableSection title="What NOT to Do" icon="close-circle" iconColor="#DC2626" borderColor="#DC2626">
          {data.what_not_to_do.map((d: string, i: number) => (
            <View key={i} style={styles.dontItem}>
              <Ionicons name="close" size={16} color="#DC2626" />
              <Text style={styles.dontText}>{d}</Text>
            </View>
          ))}
        </ExpandableSection>

        {/* Immediate Actions */}
        <ExpandableSection title="Immediate Actions" icon="flash" iconColor="#EA580C" badge="URGENT" badgeColor="#EA580C" defaultOpen={true}>
          {data.immediate_actions.map((a: string, i: number) => (
            <View key={i} style={styles.actionItem}>
              <View style={styles.actionNumber}><Text style={styles.actionNumberText}>{i+1}</Text></View>
              <Text style={styles.actionItemText}>{a}</Text>
            </View>
          ))}
        </ExpandableSection>

        {/* Legal References */}
        <ExpandableSection title="Legal References" icon="book" iconColor="#6B7280">
          {data.legal_references.map((l: string, i: number) => (
            <View key={i} style={styles.lawRef}>
              <Ionicons name="document-text" size={14} color={Colors.accent} />
              <Text style={styles.lawRefText}>{l}</Text>
            </View>
          ))}
        </ExpandableSection>

        {/* Escalate */}
        <TouchableOpacity style={styles.escalateCard} onPress={() => router.push('/(tabs)/lawyers' as any)}>
          <Ionicons name="people" size={22} color="#FFF" />
          <View style={{ flex: 1 }}>
            <Text style={styles.escalateTitle}>Need a Lawyer Now?</Text>
            <Text style={styles.escalateSub}>Connect with verified lawyers instantly</Text>
          </View>
          <Ionicons name="arrow-forward" size={20} color="rgba(255,255,255,0.7)" />
        </TouchableOpacity>

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.bgPrimary },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: Spacing.md, paddingVertical: 14,
  },
  backBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: 'rgba(255,255,255,0.2)', alignItems: 'center', justifyContent: 'center' },
  headerCenter: { flexDirection: 'row', alignItems: 'center', gap: 8, flex: 1, justifyContent: 'center' },
  headerTitle: { fontSize: 18, fontWeight: '800', color: '#FFF' },
  actionBar: {
    flexDirection: 'row', gap: 8, paddingHorizontal: Spacing.md, paddingVertical: 10,
    backgroundColor: Colors.bgSecondary, borderBottomWidth: 1, borderBottomColor: Colors.border,
  },
  actionBtn: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6,
    backgroundColor: Colors.textPrimary, borderRadius: Radius.lg, paddingVertical: 10,
  },
  actionBtnActive: { backgroundColor: '#FEE2E2' },
  actionBtnSaved: { backgroundColor: '#DCFCE7' },
  actionBtnText: { fontSize: 12, fontWeight: '600', color: '#FAFAF9' },
  scroll: { flex: 1 },
  scrollContent: { paddingHorizontal: Spacing.md, paddingTop: 16 },
  rightItem: { flexDirection: 'row', alignItems: 'flex-start', gap: 10, marginBottom: 10 },
  rightDot: { width: 22, height: 22, borderRadius: 11, backgroundColor: '#DCFCE7', alignItems: 'center', justifyContent: 'center' },
  rightDotText: { fontSize: 11, fontWeight: '700', color: '#16A34A' },
  rightText: { fontSize: 14, color: Colors.textPrimary, flex: 1, lineHeight: 20 },
  sayCard: {
    flexDirection: 'row', alignItems: 'flex-start', gap: 10,
    backgroundColor: '#EFF6FF', borderRadius: Radius.lg, padding: 12, marginBottom: 8,
  },
  sayText: { fontSize: 14, color: '#1E40AF', flex: 1, lineHeight: 20, fontStyle: 'italic' },
  dontItem: { flexDirection: 'row', alignItems: 'flex-start', gap: 10, marginBottom: 8 },
  dontText: { fontSize: 14, color: Colors.textPrimary, flex: 1, lineHeight: 20 },
  actionItem: { flexDirection: 'row', alignItems: 'flex-start', gap: 10, marginBottom: 10 },
  actionNumber: { width: 24, height: 24, borderRadius: 12, backgroundColor: '#EA580C', alignItems: 'center', justifyContent: 'center' },
  actionNumberText: { fontSize: 12, fontWeight: '700', color: '#FFF' },
  actionItemText: { fontSize: 14, color: Colors.textPrimary, flex: 1, lineHeight: 20 },
  lawRef: { flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: Colors.bgPrimary, borderRadius: Radius.lg, padding: 12, marginBottom: 6 },
  lawRefText: { fontSize: 13, color: Colors.textPrimary, flex: 1 },
  escalateCard: {
    flexDirection: 'row', alignItems: 'center', gap: 14,
    backgroundColor: '#DC2626', borderRadius: Radius.xxl, padding: 18, marginBottom: 16,
  },
  escalateTitle: { fontSize: 16, fontWeight: '700', color: '#FFF' },
  escalateSub: { fontSize: 12, color: 'rgba(255,255,255,0.7)' },
  loadingText: { fontSize: 14, color: Colors.textSecondary, marginTop: 12 },
  errorText: { fontSize: 16, color: Colors.textPrimary, marginTop: 12, fontWeight: '600' },
  retryBtn: { marginTop: 12, backgroundColor: '#DC2626', borderRadius: Radius.lg, paddingHorizontal: 24, paddingVertical: 12 },
  retryText: { fontSize: 14, fontWeight: '700', color: '#FFF' },
});
