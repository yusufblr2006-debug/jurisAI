import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity,
  ActivityIndicator, SafeAreaView, KeyboardAvoidingView, Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, Radius, Shadow } from '../../src/utils/theme';
import { api } from '../../src/utils/api';
import FloatingNav from '../../src/components/FloatingNav';
import RiskBadge from '../../src/components/RiskBadge';

export default function AIScreen() {
  const router = useRouter();
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState('');

  const handleAnalyze = async () => {
    if (!input.trim()) return;
    setLoading(true);
    setError('');
    setResult(null);
    try {
      const data = await api.analyze(input.trim());
      setResult(data);
    } catch (e: any) {
      setError('Analysis failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerLeft}>
              <View style={styles.aiIconCircle}>
                <Ionicons name="sparkles" size={22} color={Colors.accent} />
              </View>
              <Text style={styles.headerTitle}>AI Legal Engine</Text>
            </View>
          </View>

          <Text style={styles.subtitle}>Describe your legal issue and get instant AI-powered analysis based on Indian law.</Text>

          {/* Input */}
          <View style={styles.inputCard}>
            <TextInput
              testID="ai-input-field"
              style={styles.textInput}
              placeholder="Describe your legal issue in detail..."
              placeholderTextColor={Colors.textSecondary}
              value={input}
              onChangeText={setInput}
              multiline
              textAlignVertical="top"
              numberOfLines={6}
            />
            <TouchableOpacity
              testID="ai-analyze-btn"
              style={[styles.analyzeBtn, !input.trim() && styles.analyzeBtnDisabled]}
              onPress={handleAnalyze}
              disabled={loading || !input.trim()}
              activeOpacity={0.8}
            >
              {loading ? (
                <ActivityIndicator color={Colors.textInverse} />
              ) : (
                <>
                  <Ionicons name="sparkles" size={18} color={Colors.textInverse} />
                  <Text style={styles.analyzeBtnText}>Analyze</Text>
                </>
              )}
            </TouchableOpacity>
          </View>

          {/* Quick Templates */}
          {!result && !loading && (
            <View style={styles.templates}>
              <Text style={styles.templateLabel}>Quick Templates</Text>
              {[
                'I have a property dispute with my neighbor over boundary walls',
                'My employer terminated me without notice period',
                'I received a defective product and the seller refuses to refund',
              ].map((t, i) => (
                <TouchableOpacity key={i} style={styles.templateChip} onPress={() => setInput(t)}>
                  <Ionicons name="flash-outline" size={14} color={Colors.accent} />
                  <Text style={styles.templateText} numberOfLines={1}>{t}</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}

          {error ? <Text style={styles.error}>{error}</Text> : null}

          {/* Results */}
          {result && (
            <View style={styles.results}>
              {/* Risk & Probability */}
              <View style={styles.resultRow}>
                <View style={styles.resultMiniCard}>
                  <Text style={styles.miniCardLabel}>Risk Level</Text>
                  <RiskBadge level={result.risk_level} />
                </View>
                <View style={styles.resultMiniCard}>
                  <Text style={styles.miniCardLabel}>Success Rate</Text>
                  <Text style={styles.successRate}>{result.success_probability}%</Text>
                </View>
              </View>

              {/* Summary */}
              <View style={styles.resultCard}>
                <View style={styles.resultCardHeader}>
                  <Ionicons name="document-text" size={18} color={Colors.accent} />
                  <Text style={styles.resultCardTitle}>Summary</Text>
                </View>
                <Text style={styles.resultCardBody}>{result.summary}</Text>
              </View>

              {/* Warnings */}
              {result.warnings?.length > 0 && (
                <View style={[styles.resultCard, { borderLeftWidth: 3, borderLeftColor: Colors.warning }]}>
                  <View style={styles.resultCardHeader}>
                    <Ionicons name="warning" size={18} color={Colors.warning} />
                    <Text style={styles.resultCardTitle}>Warnings</Text>
                  </View>
                  {result.warnings.map((w: string, i: number) => (
                    <View key={i} style={styles.bulletRow}>
                      <Text style={styles.bulletDot}>•</Text>
                      <Text style={styles.bulletText}>{w}</Text>
                    </View>
                  ))}
                </View>
              )}

              {/* Actions */}
              {result.actions?.length > 0 && (
                <View style={[styles.resultCard, { borderLeftWidth: 3, borderLeftColor: Colors.success }]}>
                  <View style={styles.resultCardHeader}>
                    <Ionicons name="checkmark-circle" size={18} color={Colors.success} />
                    <Text style={styles.resultCardTitle}>Recommended Actions</Text>
                  </View>
                  {result.actions.map((a: string, i: number) => (
                    <View key={i} style={styles.bulletRow}>
                      <Text style={[styles.bulletDot, { color: Colors.success }]}>•</Text>
                      <Text style={styles.bulletText}>{a}</Text>
                    </View>
                  ))}
                </View>
              )}

              {/* Strategies */}
              {result.strategies?.length > 0 && (
                <>
                  <Text style={styles.strategiesTitle}>Strategy Options</Text>
                  {result.strategies.map((s: any, i: number) => (
                    <View key={i} style={styles.strategyCard}>
                      <Text style={styles.strategyName}>{s.title}</Text>
                      <Text style={styles.strategyDesc}>{s.description}</Text>
                      <View style={styles.prosConsRow}>
                        <View style={styles.prosCol}>
                          <Text style={styles.prosLabel}>Pros</Text>
                          {(s.pros || []).map((p: string, j: number) => (
                            <Text key={j} style={styles.proItem}>+ {p}</Text>
                          ))}
                        </View>
                        <View style={styles.consCol}>
                          <Text style={styles.consLabel}>Cons</Text>
                          {(s.cons || []).map((c: string, j: number) => (
                            <Text key={j} style={styles.conItem}>- {c}</Text>
                          ))}
                        </View>
                      </View>
                    </View>
                  ))}
                </>
              )}
            </View>
          )}

          <View style={{ height: 100 }} />
        </ScrollView>
      </KeyboardAvoidingView>

      <FloatingNav activeTab="ai" onTabPress={(tab) => {
        if (tab !== 'ai') router.push(`/(tabs)/${tab}` as any);
      }} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.bgPrimary },
  scroll: { flex: 1 },
  scrollContent: { paddingHorizontal: Spacing.md, paddingTop: Spacing.md },
  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    marginBottom: 8,
  },
  headerLeft: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  aiIconCircle: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: Colors.accentLight, alignItems: 'center', justifyContent: 'center',
  },
  headerTitle: { fontSize: 24, fontWeight: '800', color: Colors.textPrimary, letterSpacing: -0.5 },
  subtitle: {
    fontSize: 14, color: Colors.textSecondary, lineHeight: 20, marginBottom: 20,
  },
  inputCard: {
    backgroundColor: Colors.bgSecondary, borderRadius: Radius.xxl,
    padding: 16, ...Shadow.soft, marginBottom: 16,
  },
  textInput: {
    fontSize: 15, color: Colors.textPrimary, minHeight: 120,
    lineHeight: 22, padding: 0,
  },
  analyzeBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    backgroundColor: Colors.accent, borderRadius: Radius.lg,
    paddingVertical: 14, marginTop: 12, gap: 8,
  },
  analyzeBtnDisabled: { opacity: 0.5 },
  analyzeBtnText: { fontSize: 16, fontWeight: '700', color: Colors.textInverse },
  templates: { marginBottom: 16 },
  templateLabel: {
    fontSize: 13, fontWeight: '600', color: Colors.textSecondary,
    textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 10,
  },
  templateChip: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: Colors.bgSecondary, borderRadius: Radius.lg,
    paddingHorizontal: 14, paddingVertical: 12, marginBottom: 8, ...Shadow.soft,
  },
  templateText: { fontSize: 13, color: Colors.textPrimary, flex: 1 },
  error: { color: Colors.danger, textAlign: 'center', marginBottom: 12 },
  results: { gap: 12 },
  resultRow: { flexDirection: 'row', gap: 12 },
  resultMiniCard: {
    flex: 1, backgroundColor: Colors.bgSecondary, borderRadius: Radius.xl,
    padding: 16, alignItems: 'center', gap: 10, ...Shadow.soft,
  },
  miniCardLabel: { fontSize: 12, color: Colors.textSecondary, fontWeight: '600' },
  successRate: { fontSize: 28, fontWeight: '800', color: Colors.accent },
  resultCard: {
    backgroundColor: Colors.bgSecondary, borderRadius: Radius.xl,
    padding: 16, ...Shadow.soft,
  },
  resultCardHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 10 },
  resultCardTitle: { fontSize: 16, fontWeight: '700', color: Colors.textPrimary },
  resultCardBody: { fontSize: 14, color: Colors.textSecondary, lineHeight: 22 },
  bulletRow: { flexDirection: 'row', gap: 8, marginTop: 6 },
  bulletDot: { fontSize: 16, color: Colors.warning, lineHeight: 20 },
  bulletText: { fontSize: 14, color: Colors.textSecondary, lineHeight: 20, flex: 1 },
  strategiesTitle: {
    fontSize: 18, fontWeight: '700', color: Colors.textPrimary, marginTop: 8,
  },
  strategyCard: {
    backgroundColor: Colors.bgSecondary, borderRadius: Radius.xl,
    padding: 16, ...Shadow.soft,
  },
  strategyName: { fontSize: 16, fontWeight: '700', color: Colors.textPrimary, marginBottom: 4 },
  strategyDesc: { fontSize: 13, color: Colors.textSecondary, lineHeight: 20, marginBottom: 12 },
  prosConsRow: { flexDirection: 'row', gap: 16 },
  prosCol: { flex: 1 },
  consCol: { flex: 1 },
  prosLabel: { fontSize: 12, fontWeight: '700', color: Colors.success, marginBottom: 4, textTransform: 'uppercase' },
  consLabel: { fontSize: 12, fontWeight: '700', color: Colors.danger, marginBottom: 4, textTransform: 'uppercase' },
  proItem: { fontSize: 13, color: Colors.success, lineHeight: 20 },
  conItem: { fontSize: 13, color: Colors.danger, lineHeight: 20 },
});
