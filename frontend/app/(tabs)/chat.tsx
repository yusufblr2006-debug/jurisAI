import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity,
  ActivityIndicator, SafeAreaView, KeyboardAvoidingView, Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, Radius, Shadow } from '../../src/utils/theme';
import { api } from '../../src/utils/api';
import FloatingNav from '../../src/components/FloatingNav';

export default function ChatScreen() {
  const router = useRouter();
  const [messages, setMessages] = useState<any[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const scrollRef = useRef<ScrollView>(null);

  useEffect(() => {
    api.getMessages('general').then(setMessages).catch(console.error).finally(() => setLoading(false));
  }, []);

  const handleSend = async () => {
    if (!input.trim() || sending) return;
    const text = input.trim();
    setInput('');
    setSending(true);

    // Optimistic add
    const tempMsg = { id: 'temp', case_id: 'general', sender: 'user', text, timestamp: new Date().toISOString() };
    setMessages(prev => [...prev, tempMsg]);

    try {
      const msg = await api.sendMessage('general', 'user', text);
      setMessages(prev => prev.map(m => m.id === 'temp' ? msg : m));
    } catch {
      setMessages(prev => prev.filter(m => m.id !== 'temp'));
    } finally {
      setSending(false);
      setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 100);
    }
  };

  const formatTime = (ts: string) => {
    const d = new Date(ts);
    const now = new Date();
    const diff = Math.floor((now.getTime() - d.getTime()) / 3600000);
    if (diff < 1) return 'Just now';
    if (diff < 24) return `${diff}h`;
    return `${Math.floor(diff / 24)}d`;
  };

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <View style={styles.chatIcon}>
              <Ionicons name="chatbubbles" size={20} color={Colors.accent} />
            </View>
            <Text style={styles.headerTitle}>Chat</Text>
          </View>
          <TouchableOpacity style={styles.expandBtn}>
            <Ionicons name="expand-outline" size={20} color={Colors.textPrimary} />
          </TouchableOpacity>
        </View>

        {/* Messages */}
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={Colors.accent} />
          </View>
        ) : (
          <ScrollView
            ref={scrollRef}
            style={styles.messagesScroll}
            contentContainerStyle={styles.messagesContent}
            showsVerticalScrollIndicator={false}
            onContentSizeChange={() => scrollRef.current?.scrollToEnd({ animated: false })}
          >
            {messages.map((msg) => {
              const isUser = msg.sender === 'user';
              const isSystem = msg.sender === 'system';

              return (
                <View key={msg.id} style={[styles.msgRow, isUser && styles.msgRowUser]}>
                  {!isUser && (
                    <View style={[styles.msgAvatar, isSystem && { backgroundColor: Colors.textPrimary }]}>
                      <Ionicons
                        name={isSystem ? 'shield-checkmark' : 'person'}
                        size={14}
                        color={Colors.textInverse}
                      />
                    </View>
                  )}
                  <View style={styles.msgContent}>
                    <View style={[styles.msgBubble, isUser ? styles.msgBubbleUser : styles.msgBubbleOther]}>
                      <Text style={[styles.msgText, isUser && styles.msgTextUser]}>{msg.text}</Text>
                    </View>
                    <View style={[styles.msgMeta, isUser && { alignSelf: 'flex-end' }]}>
                      <Text style={styles.msgSender}>
                        {isSystem ? 'System' : isUser ? 'You' : msg.sender}
                      </Text>
                      <Text style={styles.msgTime}>{formatTime(msg.timestamp)}</Text>
                    </View>
                  </View>
                </View>
              );
            })}
            <View style={{ height: 20 }} />
          </ScrollView>
        )}

        {/* Input */}
        <View style={styles.inputContainer}>
          <TouchableOpacity style={styles.attachBtn}>
            <Ionicons name="add" size={22} color={Colors.textSecondary} />
          </TouchableOpacity>
          <TextInput
            testID="chat-input-field"
            style={styles.chatInput}
            placeholder="Chat your legal team..."
            placeholderTextColor={Colors.textSecondary}
            value={input}
            onChangeText={setInput}
            multiline
          />
          <TouchableOpacity style={styles.micBtn}>
            <Ionicons name="mic-outline" size={20} color={Colors.textSecondary} />
          </TouchableOpacity>
          <TouchableOpacity
            testID="send-message-button"
            style={[styles.sendBtn, !input.trim() && styles.sendBtnDisabled]}
            onPress={handleSend}
            disabled={!input.trim() || sending}
          >
            <Ionicons name="arrow-up" size={18} color={Colors.textInverse} />
          </TouchableOpacity>
        </View>
        <View style={{ height: 80 }} />
      </KeyboardAvoidingView>

      <FloatingNav activeTab="chat" onTabPress={(tab) => {
        if (tab !== 'chat') router.push(`/(tabs)/${tab}` as any);
      }} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.bgPrimary },
  loadingContainer: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: Spacing.md, paddingVertical: 12,
    backgroundColor: Colors.bgSecondary, ...Shadow.soft,
  },
  headerLeft: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  chatIcon: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: Colors.accentLight, alignItems: 'center', justifyContent: 'center',
  },
  headerTitle: { fontSize: 22, fontWeight: '800', color: Colors.textPrimary },
  expandBtn: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: Colors.bgPrimary, alignItems: 'center', justifyContent: 'center',
  },
  messagesScroll: { flex: 1 },
  messagesContent: { paddingHorizontal: Spacing.md, paddingTop: 16 },
  msgRow: {
    flexDirection: 'row', alignItems: 'flex-end', gap: 8, marginBottom: 16,
  },
  msgRowUser: { flexDirection: 'row-reverse' },
  msgAvatar: {
    width: 32, height: 32, borderRadius: 16,
    backgroundColor: Colors.accent, alignItems: 'center', justifyContent: 'center',
  },
  msgContent: { maxWidth: '75%' },
  msgBubble: {
    paddingHorizontal: 16, paddingVertical: 12, borderRadius: 20,
  },
  msgBubbleUser: {
    backgroundColor: Colors.accent,
    borderBottomRightRadius: 4,
  },
  msgBubbleOther: {
    backgroundColor: Colors.bgSecondary,
    borderBottomLeftRadius: 4,
    ...Shadow.soft,
  },
  msgText: { fontSize: 14, color: Colors.textPrimary, lineHeight: 20 },
  msgTextUser: { color: Colors.textInverse },
  msgMeta: {
    flexDirection: 'row', gap: 8, marginTop: 4, paddingHorizontal: 4,
  },
  msgSender: { fontSize: 11, color: Colors.textSecondary, fontWeight: '500' },
  msgTime: { fontSize: 11, color: Colors.textSecondary },
  inputContainer: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    paddingHorizontal: Spacing.md, paddingVertical: 10,
    backgroundColor: Colors.bgSecondary, ...Shadow.soft,
  },
  attachBtn: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: Colors.bgPrimary, alignItems: 'center', justifyContent: 'center',
  },
  chatInput: {
    flex: 1, fontSize: 14, color: Colors.textPrimary,
    maxHeight: 80, paddingVertical: 8,
  },
  micBtn: { padding: 6 },
  sendBtn: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: Colors.accent, alignItems: 'center', justifyContent: 'center',
  },
  sendBtnDisabled: { opacity: 0.4 },
});
