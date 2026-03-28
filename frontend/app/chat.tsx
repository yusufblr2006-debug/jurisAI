import React, { useState, useRef, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  TextInput, ActivityIndicator, KeyboardAvoidingView, Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors, Spacing, Radius, Shadow } from '../src/utils/theme';
import ExpandableSection from '../src/components/ExpandableSection';
import { api } from '../src/utils/api';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  structured?: {
    summary?: string;
    risk_level?: string;
    success_probability?: number;
    applicable_laws?: string[];
    warnings?: string[];
    actions?: string[];
    strategies?: any[];
  };
}

const SUGGESTED_QUESTIONS = [
  'What are my rights if police stop me?',
  'How do I file a consumer complaint?',
  'What is the process for bail in India?',
  'How to file an FIR for cyber fraud?',
  'What are my rights as a tenant?',
  'How to get a divorce in India?',
];

const QUICK_REPLIES = [
  { label: 'Explain simply', icon: 'bulb-outline' },
  { label: 'Show legal references', icon: 'book-outline' },
  { label: 'What are my options?', icon: 'options-outline' },
  { label: 'Estimated timeline?', icon: 'time-outline' },
];

export default function ChatScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const scrollRef = useRef<ScrollView>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [showSimple, setShowSimple] = useState(true);
  const [showRefs, setShowRefs] = useState(false);

  useEffect(() => {
    // Welcome message
    setMessages([{
      id: '0',
      role: 'assistant',
      content: 'Welcome to JurisAI Legal Assistant! I can help you understand your legal rights, analyze your situation, and suggest the best course of action under Indian law.\n\nDescribe your legal issue or choose a question below.',
      timestamp: new Date(),
    }]);
  }, []);

  const sendMessage = async (text: string) => {
    if (!text.trim() || loading) return;
    const userMsg: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: text.trim(),
      timestamp: new Date(),
    };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 100);

    try {
      const result = await api.analyze(text.trim());
      const aiMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: result.summary || 'Analysis complete.',
        timestamp: new Date(),
        structured: {
          summary: result.summary,
          risk_level: result.risk_level,
          success_probability: result.success_probability,
          applicable_laws: result.applicable_laws,
          warnings: result.warnings,
          actions: result.actions,
          strategies: result.strategies,
        },
      };
      setMessages(prev => [...prev, aiMsg]);
    } catch (e: any) {
      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: 'Sorry, I encountered an error. Please try again.',
        timestamp: new Date(),
      }]);
    } finally {
      setLoading(false);
      setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 200);
    }
  };

  const renderStructuredMessage = (msg: Message) => {
    const s = msg.structured;
    if (!s) return null;

    const riskColor = s.risk_level === 'HIGH' ? '#DC2626' : s.risk_level === 'LOW' ? '#16A34A' : '#D97706';
    const riskBg = s.risk_level === 'HIGH' ? '#FEE2E2' : s.risk_level === 'LOW' ? '#DCFCE7' : '#FEF3C7';

    return (
      <View style={styles.structuredContainer}>
        {/* Summary */}
        {showSimple && s.summary && (
          <View style={styles.summaryBubble}>
            <Text style={styles.summaryText}>{s.summary}</Text>
          </View>
        )}

        {/* Risk & Probability Row */}
        {(s.risk_level || s.success_probability) && (
          <View style={styles.metricsRow}>
            {s.risk_level && (
              <View style={[styles.metricChip, { backgroundColor: riskBg }]}>
                <Ionicons name="shield" size={14} color={riskColor} />
                <Text style={[styles.metricText, { color: riskColor }]}>{s.risk_level} Risk</Text>
              </View>
            )}
            {s.success_probability !== undefined && (
              <View style={[styles.metricChip, { backgroundColor: '#EFF6FF' }]}>
                <Ionicons name="trending-up" size={14} color={Colors.accent} />
                <Text style={[styles.metricText, { color: Colors.accent }]}>{s.success_probability}% Success</Text>
              </View>
            )}
          </View>
        )}

        {/* Warnings */}
        {s.warnings && s.warnings.length > 0 && (
          <ExpandableSection title="Warnings" icon="warning" iconColor="#D97706" badge={`${s.warnings.length}`} badgeColor="#D97706">
            {s.warnings.map((w, i) => (
              <View key={i} style={styles.bulletItem}>
                <View style={[styles.bulletDot, { backgroundColor: '#D97706' }]} />
                <Text style={styles.bulletText}>{w}</Text>
              </View>
            ))}
          </ExpandableSection>
        )}

        {/* Actions */}
        {s.actions && s.actions.length > 0 && (
          <ExpandableSection title="Recommended Actions" icon="checkmark-circle" iconColor="#16A34A" defaultOpen={true}>
            {s.actions.map((a, i) => (
              <View key={i} style={styles.actionStep}>
                <View style={styles.actionNum}><Text style={styles.actionNumText}>{i + 1}</Text></View>
                <Text style={styles.actionStepText}>{a}</Text>
              </View>
            ))}
          </ExpandableSection>
        )}

        {/* Laws */}
        {showRefs && s.applicable_laws && s.applicable_laws.length > 0 && (
          <ExpandableSection title="Legal References" icon="book" iconColor={Colors.accent} defaultOpen={true}>
            {s.applicable_laws.map((l, i) => (
              <View key={i} style={styles.lawChip}>
                <Ionicons name="document-text" size={12} color={Colors.accent} />
                <Text style={styles.lawChipText}>{l}</Text>
              </View>
            ))}
          </ExpandableSection>
        )}

        {/* Strategies */}
        {s.strategies && s.strategies.length > 0 && (
          <ExpandableSection title="Strategy Options" icon="bulb" iconColor="#9333EA">
            {s.strategies.map((st: any, i: number) => (
              <View key={i} style={styles.strategyCard}>
                <Text style={styles.strategyTitle}>{st.title || `Strategy ${String.fromCharCode(65 + i)}`}</Text>
                <Text style={styles.strategyDesc}>{st.description}</Text>
              </View>
            ))}
          </ExpandableSection>
        )}
      </View>
    );
  };

  return (
    <View style={[styles.safe, { paddingTop: insets.top }]}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={22} color={Colors.textPrimary} />
          </TouchableOpacity>
          <View style={styles.headerCenter}>
            <View style={styles.aiDot} />
            <Text style={styles.headerTitle}>AI Legal Assistant</Text>
          </View>
          <View style={styles.toggleRow}>
            <TouchableOpacity
              style={[styles.toggleBtn, showSimple && styles.toggleActive]}
              onPress={() => setShowSimple(!showSimple)}
            >
              <Ionicons name="bulb" size={14} color={showSimple ? '#FFF' : Colors.textSecondary} />
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.toggleBtn, showRefs && styles.toggleActive]}
              onPress={() => setShowRefs(!showRefs)}
            >
              <Ionicons name="book" size={14} color={showRefs ? '#FFF' : Colors.textSecondary} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Messages */}
        <ScrollView ref={scrollRef} style={styles.scroll} contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
          {messages.map((msg) => (
            <View key={msg.id} style={[styles.msgRow, msg.role === 'user' && styles.msgRowUser]}>
              {msg.role === 'assistant' && (
                <View style={styles.aiAvatar}>
                  <Ionicons name="sparkles" size={14} color={Colors.accent} />
                </View>
              )}
              <View style={[styles.msgBubble, msg.role === 'user' ? styles.userBubble : styles.aiBubble]}>
                <Text style={[styles.msgText, msg.role === 'user' && styles.userMsgText]}>{msg.content}</Text>
                {msg.structured && renderStructuredMessage(msg)}
              </View>
            </View>
          ))}

          {loading && (
            <View style={styles.msgRow}>
              <View style={styles.aiAvatar}>
                <Ionicons name="sparkles" size={14} color={Colors.accent} />
              </View>
              <View style={[styles.msgBubble, styles.aiBubble, styles.loadingBubble]}>
                <ActivityIndicator size="small" color={Colors.accent} />
                <Text style={styles.loadingText}>Analyzing with AI...</Text>
              </View>
            </View>
          )}

          {/* Suggested Questions (only show at start) */}
          {messages.length <= 1 && !loading && (
            <View style={styles.suggestedSection}>
              <Text style={styles.suggestedLabel}>SUGGESTED QUESTIONS</Text>
              {SUGGESTED_QUESTIONS.map((q, i) => (
                <TouchableOpacity key={i} style={styles.suggestedCard} onPress={() => sendMessage(q)}>
                  <Text style={styles.suggestedText}>{q}</Text>
                  <Ionicons name="arrow-forward" size={14} color={Colors.accent} />
                </TouchableOpacity>
              ))}
            </View>
          )}

          {/* Quick Replies (show after AI response) */}
          {messages.length > 1 && !loading && messages[messages.length - 1]?.role === 'assistant' && (
            <View style={styles.quickReplies}>
              {QUICK_REPLIES.map((qr, i) => (
                <TouchableOpacity key={i} style={styles.quickReplyBtn} onPress={() => sendMessage(qr.label)}>
                  <Ionicons name={qr.icon as any} size={14} color={Colors.accent} />
                  <Text style={styles.quickReplyText}>{qr.label}</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}

          <View style={{ height: 20 }} />
        </ScrollView>

        {/* Input */}
        <View style={[styles.inputBar, { paddingBottom: insets.bottom + 8 }]}>
          <TextInput
            style={styles.textInput}
            value={input}
            onChangeText={setInput}
            placeholder="Describe your legal issue..."
            placeholderTextColor={Colors.textSecondary}
            multiline
            maxLength={2000}
          />
          <TouchableOpacity
            style={[styles.sendBtn, (!input.trim() || loading) && styles.sendBtnDisabled]}
            onPress={() => sendMessage(input)}
            disabled={!input.trim() || loading}
          >
            <Ionicons name="send" size={18} color="#FFF" />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.bgPrimary },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: Spacing.md, paddingVertical: 12,
    backgroundColor: Colors.bgSecondary, ...Shadow.soft,
  },
  backBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: Colors.bgPrimary, alignItems: 'center', justifyContent: 'center' },
  headerCenter: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  aiDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#16A34A' },
  headerTitle: { fontSize: 16, fontWeight: '700', color: Colors.textPrimary },
  toggleRow: { flexDirection: 'row', gap: 6 },
  toggleBtn: { width: 30, height: 30, borderRadius: 15, backgroundColor: Colors.bgPrimary, alignItems: 'center', justifyContent: 'center' },
  toggleActive: { backgroundColor: Colors.accent },
  scroll: { flex: 1 },
  scrollContent: { paddingHorizontal: Spacing.md, paddingTop: 16 },
  msgRow: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 14, gap: 8 },
  msgRowUser: { justifyContent: 'flex-end' },
  aiAvatar: { width: 28, height: 28, borderRadius: 14, backgroundColor: Colors.accentLight, alignItems: 'center', justifyContent: 'center', marginTop: 4 },
  msgBubble: { maxWidth: '80%', borderRadius: Radius.xl, padding: 14 },
  userBubble: { backgroundColor: Colors.accent, borderBottomRightRadius: 4 },
  aiBubble: { backgroundColor: Colors.bgSecondary, borderBottomLeftRadius: 4, ...Shadow.soft },
  msgText: { fontSize: 14, color: Colors.textPrimary, lineHeight: 21 },
  userMsgText: { color: '#FFF' },
  loadingBubble: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 16 },
  loadingText: { fontSize: 13, color: Colors.textSecondary },
  structuredContainer: { marginTop: 10, gap: 8 },
  summaryBubble: { backgroundColor: Colors.bgPrimary, borderRadius: Radius.lg, padding: 12 },
  summaryText: { fontSize: 13, color: Colors.textPrimary, lineHeight: 20 },
  metricsRow: { flexDirection: 'row', gap: 8, flexWrap: 'wrap' },
  metricChip: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 10, paddingVertical: 6, borderRadius: Radius.pill },
  metricText: { fontSize: 12, fontWeight: '700' },
  bulletItem: { flexDirection: 'row', alignItems: 'flex-start', gap: 8, marginBottom: 4 },
  bulletDot: { width: 6, height: 6, borderRadius: 3, marginTop: 6 },
  bulletText: { fontSize: 13, color: Colors.textPrimary, flex: 1, lineHeight: 19 },
  actionStep: { flexDirection: 'row', alignItems: 'flex-start', gap: 10, marginBottom: 6 },
  actionNum: { width: 20, height: 20, borderRadius: 10, backgroundColor: Colors.accent, alignItems: 'center', justifyContent: 'center' },
  actionNumText: { fontSize: 10, fontWeight: '700', color: '#FFF' },
  actionStepText: { fontSize: 13, color: Colors.textPrimary, flex: 1, lineHeight: 19 },
  lawChip: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: Colors.bgPrimary, borderRadius: Radius.lg, padding: 10, marginBottom: 4 },
  lawChipText: { fontSize: 12, color: Colors.accent, flex: 1, fontWeight: '500' },
  strategyCard: { backgroundColor: Colors.bgPrimary, borderRadius: Radius.lg, padding: 12, marginBottom: 6 },
  strategyTitle: { fontSize: 14, fontWeight: '600', color: Colors.textPrimary, marginBottom: 4 },
  strategyDesc: { fontSize: 12, color: Colors.textSecondary, lineHeight: 18 },
  suggestedSection: { marginTop: 8 },
  suggestedLabel: { fontSize: 11, fontWeight: '700', color: Colors.textSecondary, letterSpacing: 0.5, marginBottom: 8 },
  suggestedCard: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    backgroundColor: Colors.bgSecondary, borderRadius: Radius.lg, padding: 14, marginBottom: 6, ...Shadow.soft,
  },
  suggestedText: { fontSize: 14, color: Colors.textPrimary, flex: 1 },
  quickReplies: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 4 },
  quickReplyBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: Colors.accentLight, borderRadius: Radius.pill, paddingHorizontal: 12, paddingVertical: 8,
  },
  quickReplyText: { fontSize: 12, fontWeight: '600', color: Colors.accent },
  inputBar: {
    flexDirection: 'row', alignItems: 'flex-end', gap: 8,
    paddingHorizontal: Spacing.md, paddingTop: 10,
    backgroundColor: Colors.bgSecondary, borderTopWidth: 1, borderTopColor: Colors.border,
  },
  textInput: {
    flex: 1, backgroundColor: Colors.bgPrimary, borderRadius: Radius.xl,
    paddingHorizontal: 16, paddingVertical: 10, fontSize: 14, color: Colors.textPrimary,
    maxHeight: 100,
  },
  sendBtn: {
    width: 42, height: 42, borderRadius: 21,
    backgroundColor: Colors.accent, alignItems: 'center', justifyContent: 'center',
  },
  sendBtnDisabled: { opacity: 0.4 },
});
