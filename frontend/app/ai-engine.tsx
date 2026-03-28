import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity,
  ActivityIndicator, KeyboardAvoidingView, Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors, Spacing, Radius, Shadow } from '../src/utils/theme';
import { api } from '../src/utils/api';
import VoiceInput from '../src/components/VoiceInput';

const TEMPLATES = [
  { icon: 'home-outline' as const, label: 'Property Dispute', text: 'I have a property dispute regarding ancestral land partition between family members. The property is located in Delhi and involves 3 siblings.' },
  { icon: 'card-outline' as const, label: 'Consumer Complaint', text: 'I purchased a product online worth Rs 50,000 that was defective. The seller is refusing to provide refund or replacement despite multiple complaints.' },
  { icon: 'shield-outline' as const, label: 'Cyber Fraud', text: 'I am a victim of online banking fraud. Unauthorized transactions worth Rs 2 lakhs were made from my account. I have filed a complaint but need legal guidance.' },
  { icon: 'people-outline' as const, label: 'Family Law', text: 'I am going through a divorce and need guidance on child custody rights, alimony, and division of joint property under Indian law.' },
  { icon: 'business-outline' as const, label: 'Corporate Law', text: 'I am a startup founder and need legal advice regarding company incorporation, investor agreements, and intellectual property protection.' },
  { icon: 'receipt-outline' as const, label: 'Employment Issue', text: 'My employer terminated me without proper notice or compensation as required under the Industrial Disputes Act. I want to know my legal options.' },
];

export default function AIEngineScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleAnalyze = async () => {
    if (!text.trim() || loading) return;
    setLoading(true);
    setError('');
    try {
      const result = await api.analyze(text.trim());
      router.push({
        pathname: '/analysis-result',
        params: { data: JSON.stringify(result), query: text.trim() },
      } as any);
    } catch (e: any) {
      setError('Analysis failed. Please try again.');
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={[styles.safe, { paddingTop: insets.top }]}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity testID="ai-back-btn" onPress={() => router.back()} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={22} color={Colors.textPrimary} />
          </TouchableOpacity>
          <View style={styles.headerCenter}>
            <View style={styles.aiIconCircle}>
              <Ionicons name="sparkles" size={18} color={Colors.accent} />
            </View>
            <Text style={styles.headerTitle}>AI Legal Engine</Text>
          </View>
          <View style={{ width: 36 }} />
        </View>

        <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
          {/* Hero */}
          <View style={styles.heroCard}>
            <View style={styles.heroBadge}>
              <Ionicons name="flash" size={14} color={Colors.accent} />
              <Text style={styles.heroBadgeText}>Powered by GPT-4o</Text>
            </View>
            <Text style={styles.heroTitle}>Describe your legal issue</Text>
            <Text style={styles.heroSubtitle}>
              Get AI-powered analysis with risk assessment, success probability, applicable Indian laws, and strategy recommendations.
            </Text>
          </View>

          {/* Voice Input - For people who can't type */}
          <VoiceInput onResult={(voiceText) => setText(voiceText)} />

          {/* Text Input */}
          <View style={styles.inputCard}>
            <TextInput
              testID="ai-text-input"
              style={styles.textInput}
              placeholder="Describe your legal situation in detail..."
              placeholderTextColor={Colors.textSecondary}
              value={text}
              onChangeText={setText}
              multiline
              textAlignVertical="top"
              numberOfLines={6}
            />
            <View style={styles.inputFooter}>
              <Text style={styles.charCount}>{text.length} characters</Text>
              <TouchableOpacity
                testID="analyze-btn"
                style={[styles.analyzeBtn, (!text.trim() || loading) && styles.analyzeBtnDisabled]}
                onPress={handleAnalyze}
                disabled={!text.trim() || loading}
                activeOpacity={0.7}
              >
                {loading ? (
                  <ActivityIndicator size="small" color={Colors.textInverse} />
                ) : (
                  <>
                    <Ionicons name="sparkles" size={16} color={Colors.textInverse} />
                    <Text style={styles.analyzeBtnText}>Analyze</Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
          </View>

          {error ? (
            <View style={styles.errorCard}>
              <Ionicons name="alert-circle" size={18} color={Colors.danger} />
              <Text style={styles.errorText}>{error}</Text>
            </View>
          ) : null}

          {/* Loading State */}
          {loading && (
            <View style={styles.loadingCard}>
              <ActivityIndicator size="large" color={Colors.accent} />
              <Text style={styles.loadingTitle}>Analyzing your legal issue...</Text>
              <Text style={styles.loadingSubtitle}>Reviewing Indian statutes, case law, and precedents</Text>
              <View style={styles.loadingSteps}>
                {['Identifying applicable laws', 'Assessing risk factors', 'Predicting outcomes', 'Generating strategies'].map((step, i) => (
                  <View key={i} style={styles.loadingStep}>
                    <Ionicons name="checkmark-circle" size={16} color={i < 2 ? Colors.success : Colors.border} />
                    <Text style={[styles.loadingStepText, i >= 2 && { color: Colors.textSecondary }]}>{step}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          {/* Quick Templates */}
          {!loading && (
            <>
              <Text style={styles.templatesLabel}>QUICK TEMPLATES</Text>
              <View style={styles.templatesGrid}>
                {TEMPLATES.map((t, i) => (
                  <TouchableOpacity
                    key={i}
                    testID={`template-${i}`}
                    style={styles.templateCard}
                    onPress={() => setText(t.text)}
                    activeOpacity={0.7}
                  >
                    <View style={styles.templateIcon}>
                      <Ionicons name={t.icon} size={20} color={Colors.accent} />
                    </View>
                    <Text style={styles.templateLabel}>{t.label}</Text>
                    <Ionicons name="arrow-forward" size={14} color={Colors.textSecondary} />
                  </TouchableOpacity>
                ))}
              </View>
            </>
          )}

          <View style={{ height: 40 }} />
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.bgPrimary },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: Spacing.md, paddingVertical: 12, backgroundColor: Colors.bgSecondary,
    ...Shadow.soft,
  },
  backBtn: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: Colors.bgPrimary, alignItems: 'center', justifyContent: 'center',
  },
  headerCenter: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  aiIconCircle: {
    width: 32, height: 32, borderRadius: 16,
    backgroundColor: Colors.accentLight, alignItems: 'center', justifyContent: 'center',
  },
  headerTitle: { fontSize: 18, fontWeight: '700', color: Colors.textPrimary },
  scroll: { flex: 1 },
  scrollContent: { paddingHorizontal: Spacing.md, paddingTop: Spacing.md },
  heroCard: {
    backgroundColor: Colors.bgSecondary, borderRadius: Radius.xxl, padding: 24,
    marginBottom: 16, ...Shadow.soft,
  },
  heroBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: Colors.accentLight, paddingHorizontal: 12, paddingVertical: 6,
    borderRadius: Radius.pill, alignSelf: 'flex-start', marginBottom: 12,
  },
  heroBadgeText: { fontSize: 12, fontWeight: '600', color: Colors.accent },
  heroTitle: { fontSize: 22, fontWeight: '800', color: Colors.textPrimary, marginBottom: 8, letterSpacing: -0.5 },
  heroSubtitle: { fontSize: 14, color: Colors.textSecondary, lineHeight: 21 },
  inputCard: {
    backgroundColor: Colors.bgSecondary, borderRadius: Radius.xxl, padding: 16,
    marginBottom: 16, ...Shadow.soft,
  },
  textInput: {
    fontSize: 15, color: Colors.textPrimary, minHeight: 130, lineHeight: 22,
    padding: 0, marginBottom: 12,
  },
  inputFooter: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    borderTopWidth: 1, borderTopColor: Colors.border, paddingTop: 12,
  },
  charCount: { fontSize: 12, color: Colors.textSecondary },
  analyzeBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: Colors.accent, borderRadius: Radius.lg,
    paddingHorizontal: 20, paddingVertical: 12,
  },
  analyzeBtnDisabled: { opacity: 0.4 },
  analyzeBtnText: { fontSize: 14, fontWeight: '700', color: Colors.textInverse },
  errorCard: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: '#FEE2E2', borderRadius: Radius.lg, padding: 12, marginBottom: 16,
  },
  errorText: { fontSize: 13, color: Colors.danger, flex: 1 },
  loadingCard: {
    backgroundColor: Colors.bgSecondary, borderRadius: Radius.xxl, padding: 24,
    alignItems: 'center', marginBottom: 16, ...Shadow.soft,
  },
  loadingTitle: { fontSize: 16, fontWeight: '700', color: Colors.textPrimary, marginTop: 16, marginBottom: 4 },
  loadingSubtitle: { fontSize: 13, color: Colors.textSecondary, marginBottom: 20 },
  loadingSteps: { gap: 10, width: '100%' },
  loadingStep: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  loadingStepText: { fontSize: 14, color: Colors.textPrimary },
  templatesLabel: {
    fontSize: 11, fontWeight: '700', color: Colors.textSecondary,
    letterSpacing: 0.5, marginBottom: 10,
  },
  templatesGrid: { gap: 8 },
  templateCard: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    backgroundColor: Colors.bgSecondary, borderRadius: Radius.xl,
    padding: 16, ...Shadow.soft,
  },
  templateIcon: {
    width: 40, height: 40, borderRadius: 12,
    backgroundColor: Colors.accentLight, alignItems: 'center', justifyContent: 'center',
  },
  templateLabel: { flex: 1, fontSize: 15, fontWeight: '600', color: Colors.textPrimary },
});
