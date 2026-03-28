import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Colors, Spacing, Radius, Shadow } from '../src/utils/theme';

const LANGUAGES = [
  { code: 'en', label: 'English', native: 'English', flag: '🇬🇧' },
  { code: 'hi', label: 'Hindi', native: 'हिन्दी', flag: '🇮🇳' },
  { code: 'kn', label: 'Kannada', native: 'ಕನ್ನಡ', flag: '🇮🇳' },
  { code: 'ta', label: 'Tamil', native: 'தமிழ்', flag: '🇮🇳' },
  { code: 'te', label: 'Telugu', native: 'తెలుగు', flag: '🇮🇳' },
  { code: 'mr', label: 'Marathi', native: 'मराठी', flag: '🇮🇳' },
  { code: 'bn', label: 'Bengali', native: 'বাংলা', flag: '🇮🇳' },
  { code: 'gu', label: 'Gujarati', native: 'ગુજરાતી', flag: '🇮🇳' },
];

export default function LanguageScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [selected, setSelected] = useState('en');
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem('app_language').then(lang => {
      if (lang) setSelected(lang);
    });
  }, []);

  const handleSelect = async (code: string) => {
    setSelected(code);
    await AsyncStorage.setItem('app_language', code);
    setSaved(true);
    setTimeout(() => setSaved(false), 1500);
  };

  return (
    <View style={[styles.safe, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={22} color={Colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Language</Text>
        {saved && <View style={styles.savedBadge}><Ionicons name="checkmark" size={14} color="#16A34A" /><Text style={styles.savedText}>Saved</Text></View>}
        {!saved && <View style={{ width: 60 }} />}
      </View>

      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent}>
        <Text style={styles.hint}>Select your preferred language for the app interface and AI responses.</Text>
        {LANGUAGES.map(lang => (
          <TouchableOpacity
            key={lang.code}
            style={[styles.langCard, selected === lang.code && styles.langCardActive]}
            onPress={() => handleSelect(lang.code)}
            activeOpacity={0.7}
          >
            <Text style={styles.langFlag}>{lang.flag}</Text>
            <View style={{ flex: 1 }}>
              <Text style={[styles.langLabel, selected === lang.code && styles.langLabelActive]}>{lang.label}</Text>
              <Text style={styles.langNative}>{lang.native}</Text>
            </View>
            <View style={[styles.radio, selected === lang.code && styles.radioActive]}>
              {selected === lang.code && <View style={styles.radioInner} />}
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.bgPrimary },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: Spacing.md, paddingVertical: 12, backgroundColor: Colors.bgSecondary, ...Shadow.soft },
  backBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: Colors.bgPrimary, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { fontSize: 18, fontWeight: '700', color: Colors.textPrimary },
  savedBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: '#DCFCE7', paddingHorizontal: 10, paddingVertical: 4, borderRadius: Radius.pill },
  savedText: { fontSize: 12, fontWeight: '600', color: '#16A34A' },
  scroll: { flex: 1 },
  scrollContent: { paddingHorizontal: Spacing.md, paddingTop: 16 },
  hint: { fontSize: 14, color: Colors.textSecondary, lineHeight: 20, marginBottom: 16 },
  langCard: { flexDirection: 'row', alignItems: 'center', gap: 14, backgroundColor: Colors.bgSecondary, borderRadius: Radius.xl, padding: 16, marginBottom: 8, borderWidth: 2, borderColor: 'transparent', ...Shadow.soft },
  langCardActive: { borderColor: Colors.accent, backgroundColor: Colors.accentLight },
  langFlag: { fontSize: 24 },
  langLabel: { fontSize: 16, fontWeight: '600', color: Colors.textPrimary },
  langLabelActive: { color: Colors.accent },
  langNative: { fontSize: 13, color: Colors.textSecondary, marginTop: 1 },
  radio: { width: 22, height: 22, borderRadius: 11, borderWidth: 2, borderColor: Colors.border, alignItems: 'center', justifyContent: 'center' },
  radioActive: { borderColor: Colors.accent },
  radioInner: { width: 12, height: 12, borderRadius: 6, backgroundColor: Colors.accent },
});
