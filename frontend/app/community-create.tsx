import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity,
  KeyboardAvoidingView, Platform, ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors, Spacing, Radius, Shadow } from '../src/utils/theme';
import { api } from '../src/utils/api';

const CATEGORIES = ['Property', 'Criminal', 'Consumer', 'Family', 'Corporate', 'General'];

export default function CommunityCreateScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState('General');
  const [loading, setLoading] = useState(false);

  const handlePost = async () => {
    if (!title.trim() || !content.trim()) return;
    setLoading(true);
    try {
      await api.createCommunityPost(title.trim(), category, content.trim());
      router.back();
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={[styles.safe, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <TouchableOpacity testID="create-post-back-btn" onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={22} color={Colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.title}>New Post</Text>
        <TouchableOpacity testID="submit-post-btn" style={[styles.postBtn, (!title.trim() || !content.trim()) && { opacity: 0.4 }]}
          onPress={handlePost} disabled={loading || !title.trim() || !content.trim()}>
          {loading ? <ActivityIndicator size="small" color={Colors.textInverse} /> : <Text style={styles.postBtnText}>Post</Text>}
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
        <TextInput testID="post-title-input" style={styles.titleInput} placeholder="Title" placeholderTextColor={Colors.textSecondary}
          value={title} onChangeText={setTitle} />

        <Text style={styles.label}>CATEGORY</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8, marginBottom: 16 }}>
          {CATEGORIES.map(cat => (
            <TouchableOpacity key={cat} style={[styles.catChip, category === cat && styles.catChipActive]}
              onPress={() => setCategory(cat)}>
              <Text style={[styles.catText, category === cat && styles.catTextActive]}>{cat}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <TextInput testID="post-content-input" style={styles.contentInput} placeholder="Describe your legal question..."
          placeholderTextColor={Colors.textSecondary} value={content} onChangeText={setContent}
          multiline textAlignVertical="top" numberOfLines={8} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.bgPrimary },
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: Spacing.md, paddingVertical: 12, gap: 12 },
  backBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: Colors.bgSecondary, alignItems: 'center', justifyContent: 'center', ...Shadow.soft },
  title: { fontSize: 20, fontWeight: '700', color: Colors.textPrimary, flex: 1 },
  postBtn: { backgroundColor: Colors.accent, borderRadius: Radius.lg, paddingHorizontal: 20, paddingVertical: 10 },
  postBtnText: { fontSize: 14, fontWeight: '700', color: Colors.textInverse },
  scroll: { flex: 1 },
  scrollContent: { paddingHorizontal: Spacing.md },
  titleInput: { fontSize: 18, fontWeight: '600', color: Colors.textPrimary, backgroundColor: Colors.bgSecondary, borderRadius: Radius.xl, padding: 16, marginBottom: 16, ...Shadow.soft },
  label: { fontSize: 11, fontWeight: '700', color: Colors.textSecondary, letterSpacing: 0.5, marginBottom: 8 },
  catChip: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: Radius.pill, backgroundColor: Colors.bgSecondary, ...Shadow.soft },
  catChipActive: { backgroundColor: Colors.accent },
  catText: { fontSize: 13, fontWeight: '600', color: Colors.textPrimary },
  catTextActive: { color: Colors.textInverse },
  contentInput: { fontSize: 15, color: Colors.textPrimary, backgroundColor: Colors.bgSecondary, borderRadius: Radius.xl, padding: 16, minHeight: 200, lineHeight: 22, ...Shadow.soft },
});
