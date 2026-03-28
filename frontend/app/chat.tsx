import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity,
  ActivityIndicator, KeyboardAvoidingView, Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors, Spacing, Radius, Shadow } from '../src/utils/theme';
import { api } from '../src/utils/api';

export default function ChatScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
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
    const tempMsg = { id: 'temp', case_id: 'general', sender: 'user', text, timestamp: new Date().toISOString() };
    setMessages(prev => [...prev, tempMsg]);
    try {
      const msg = await api.sendMessage('general', 'user', text);
      setMessages(prev => prev.map(m => m.id === 'temp' ? msg : m));
    } catch { setMessages(prev => prev.filter(m => m.id !== 'temp')); }
    finally { setSending(false); setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 100); }
  };

  const formatTime = (ts: string) => {
    const h = Math.floor((Date.now() - new Date(ts).getTime()) / 3600000);
    if (h < 1) return 'Just now';
    if (h < 24) return `${h}h`;
    return `${Math.floor(h / 24)}d`;
  };

  return (
    <View style={[styles.safe, { paddingTop: insets.top }]}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <View style={styles.header}>
          <TouchableOpacity testID="chat-back-btn" onPress={() => router.back()} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={22} color={Colors.textPrimary} />
          </TouchableOpacity>
          <View style={styles.chatIconCircle}>
            <Ionicons name="chatbubbles" size={18} color={Colors.accent} />
          </View>
          <Text style={styles.headerTitle}>Legal Team Chat</Text>
        </View>

        {loading ? <ActivityIndicator size="large" color={Colors.accent} style={{ marginTop: 40 }} /> : (
          <ScrollView ref={scrollRef} style={styles.messagesScroll} contentContainerStyle={styles.messagesContent}
            showsVerticalScrollIndicator={false}
            onContentSizeChange={() => scrollRef.current?.scrollToEnd({ animated: false })}>
            {messages.map((msg) => {
              const isUser = msg.sender === 'user';
              const isSystem = msg.sender === 'system';
              return (
                <View key={msg.id} style={[styles.msgRow, isUser && styles.msgRowUser]}>
                  {!isUser && (
                    <View style={[styles.msgAvatar, isSystem && { backgroundColor: Colors.textPrimary }]}>
                      <Ionicons name={isSystem ? 'shield-checkmark' : 'person'} size={12} color={Colors.textInverse} />
                    </View>
                  )}
                  <View style={styles.msgContent}>
                    <View style={[styles.msgBubble, isUser ? styles.msgBubbleUser : styles.msgBubbleOther]}>
                      <Text style={[styles.msgText, isUser && styles.msgTextUser]}>{msg.text}</Text>
                    </View>
                    <View style={[styles.msgMeta, isUser && { alignSelf: 'flex-end' }]}>
                      <Text style={styles.msgSender}>{isSystem ? 'System' : isUser ? 'You' : msg.sender}</Text>
                      <Text style={styles.msgTime}>{formatTime(msg.timestamp)}</Text>
                    </View>
                  </View>
                </View>
              );
            })}
            <View style={{ height: 20 }} />
          </ScrollView>
        )}

        <View style={styles.inputContainer}>
          <TouchableOpacity style={styles.attachBtn}>
            <Ionicons name="add" size={22} color={Colors.textSecondary} />
          </TouchableOpacity>
          <TextInput testID="chat-input-field" style={styles.chatInput} placeholder="Chat your legal team..."
            placeholderTextColor={Colors.textSecondary} value={input} onChangeText={setInput} multiline />
          <TouchableOpacity style={styles.micBtn}>
            <Ionicons name="mic-outline" size={20} color={Colors.textSecondary} />
          </TouchableOpacity>
          <TouchableOpacity testID="send-message-button"
            style={[styles.sendBtn, !input.trim() && styles.sendBtnDisabled]}
            onPress={handleSend} disabled={!input.trim() || sending}>
            <Ionicons name="arrow-up" size={18} color={Colors.textInverse} />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.bgPrimary },
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: Spacing.md, paddingVertical: 12, gap: 10, backgroundColor: Colors.bgSecondary, ...Shadow.soft },
  backBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: Colors.bgPrimary, alignItems: 'center', justifyContent: 'center' },
  chatIconCircle: { width: 32, height: 32, borderRadius: 16, backgroundColor: Colors.accentLight, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { fontSize: 18, fontWeight: '700', color: Colors.textPrimary },
  messagesScroll: { flex: 1 },
  messagesContent: { paddingHorizontal: Spacing.md, paddingTop: 16 },
  msgRow: { flexDirection: 'row', alignItems: 'flex-end', gap: 8, marginBottom: 16 },
  msgRowUser: { flexDirection: 'row-reverse' },
  msgAvatar: { width: 28, height: 28, borderRadius: 14, backgroundColor: Colors.accent, alignItems: 'center', justifyContent: 'center' },
  msgContent: { maxWidth: '75%' },
  msgBubble: { paddingHorizontal: 16, paddingVertical: 12, borderRadius: 20 },
  msgBubbleUser: { backgroundColor: Colors.accent, borderBottomRightRadius: 4 },
  msgBubbleOther: { backgroundColor: Colors.bgSecondary, borderBottomLeftRadius: 4, ...Shadow.soft },
  msgText: { fontSize: 14, color: Colors.textPrimary, lineHeight: 20 },
  msgTextUser: { color: Colors.textInverse },
  msgMeta: { flexDirection: 'row', gap: 8, marginTop: 4, paddingHorizontal: 4 },
  msgSender: { fontSize: 11, color: Colors.textSecondary, fontWeight: '500' },
  msgTime: { fontSize: 11, color: Colors.textSecondary },
  inputContainer: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: Spacing.md, paddingVertical: 10, backgroundColor: Colors.bgSecondary, ...Shadow.soft },
  attachBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: Colors.bgPrimary, alignItems: 'center', justifyContent: 'center' },
  chatInput: { flex: 1, fontSize: 14, color: Colors.textPrimary, maxHeight: 80, paddingVertical: 8 },
  micBtn: { padding: 6 },
  sendBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: Colors.accent, alignItems: 'center', justifyContent: 'center' },
  sendBtnDisabled: { opacity: 0.4 },
});
