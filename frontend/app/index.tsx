import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TextInput, TouchableOpacity,
  KeyboardAvoidingView, Platform, ActivityIndicator, ScrollView,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors, Spacing, Radius, Shadow } from '../src/utils/theme';
import { api, setAuthToken } from '../src/utils/api';

export default function LoginScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [isRegister, setIsRegister] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'user' | 'lawyer'>('user');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async () => {
    if (isRegister && !name.trim()) { setError('Name is required'); return; }
    if (!email.trim() || !password.trim()) { setError('Email and password required'); return; }
    setLoading(true);
    setError('');
    try {
      let data;
      if (isRegister) {
        data = await api.register(name.trim(), email.trim().toLowerCase(), password, role);
      } else {
        data = await api.login(email.trim().toLowerCase(), password);
      }
      if (data.token) {
        setAuthToken(data.token);
      }
      router.replace('/(tabs)/home');
    } catch (e: any) {
      const msg = e.message || '';
      if (msg.includes('400')) setError('Email already registered');
      else if (msg.includes('401')) setError('Invalid email or password');
      else setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={[styles.container, { paddingTop: insets.top }]}
    >
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
        <View style={styles.logoArea}>
          <View style={styles.logoCircle}>
            <Ionicons name="shield-checkmark" size={40} color={Colors.accent} />
          </View>
          <Text style={styles.appName}>JurisAI</Text>
          <Text style={styles.tagline}>AI-Powered Legal Assistant</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>{isRegister ? 'Create Account' : 'Welcome Back'}</Text>
          <Text style={styles.cardSubtitle}>
            {isRegister ? 'Sign up to get started' : 'Sign in to continue'}
          </Text>

          {isRegister && (
            <View style={styles.inputContainer}>
              <Ionicons name="person-outline" size={20} color={Colors.textSecondary} />
              <TextInput
                testID="auth-name-input"
                style={styles.input}
                placeholder="Full name"
                placeholderTextColor={Colors.textSecondary}
                value={name}
                onChangeText={setName}
                autoCapitalize="words"
              />
            </View>
          )}

          <View style={styles.inputContainer}>
            <Ionicons name="mail-outline" size={20} color={Colors.textSecondary} />
            <TextInput
              testID="auth-email-input"
              style={styles.input}
              placeholder="Email address"
              placeholderTextColor={Colors.textSecondary}
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>

          <View style={styles.inputContainer}>
            <Ionicons name="lock-closed-outline" size={20} color={Colors.textSecondary} />
            <TextInput
              testID="auth-password-input"
              style={styles.input}
              placeholder="Password"
              placeholderTextColor={Colors.textSecondary}
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />
          </View>

          {isRegister && (
            <>
              <Text style={styles.roleLabel}>I AM A</Text>
              <View style={styles.roleRow}>
                <TouchableOpacity
                  testID="role-user-btn"
                  style={[styles.roleBtn, role === 'user' && styles.roleBtnActive]}
                  onPress={() => setRole('user')}
                >
                  <Ionicons name="person" size={18} color={role === 'user' ? Colors.textInverse : Colors.textPrimary} />
                  <Text style={[styles.roleBtnText, role === 'user' && styles.roleBtnTextActive]}>Client</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  testID="role-lawyer-btn"
                  style={[styles.roleBtn, role === 'lawyer' && styles.roleBtnActive]}
                  onPress={() => setRole('lawyer')}
                >
                  <Ionicons name="briefcase" size={18} color={role === 'lawyer' ? Colors.textInverse : Colors.textPrimary} />
                  <Text style={[styles.roleBtnText, role === 'lawyer' && styles.roleBtnTextActive]}>Lawyer</Text>
                </TouchableOpacity>
              </View>
            </>
          )}

          {error ? <Text style={styles.error}>{error}</Text> : null}

          <TouchableOpacity
            testID="auth-submit-btn"
            style={styles.submitBtn}
            onPress={handleSubmit}
            disabled={loading}
            activeOpacity={0.8}
          >
            {loading ? (
              <ActivityIndicator color={Colors.textInverse} />
            ) : (
              <Text style={styles.submitBtnText}>{isRegister ? 'Create Account' : 'Sign In'}</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            testID="auth-toggle-btn"
            style={styles.toggleBtn}
            onPress={() => { setIsRegister(!isRegister); setError(''); }}
          >
            <Text style={styles.toggleText}>
              {isRegister ? 'Already have an account? ' : "Don't have an account? "}
              <Text style={styles.toggleLink}>{isRegister ? 'Sign In' : 'Sign Up'}</Text>
            </Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.footer}>Built for Indian Legal System</Text>

        {/* Quick login hint */}
        <View style={styles.hintCard}>
          <Ionicons name="information-circle-outline" size={16} color={Colors.accent} />
          <Text style={styles.hintText}>Demo: arjun@test.com / test123</Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bgPrimary },
  scrollContent: { flexGrow: 1, justifyContent: 'center', paddingHorizontal: Spacing.lg, paddingBottom: 40 },
  logoArea: { alignItems: 'center', marginBottom: 28 },
  logoCircle: {
    width: 76, height: 76, borderRadius: 38,
    backgroundColor: Colors.accentLight, alignItems: 'center', justifyContent: 'center', marginBottom: 14,
  },
  appName: { fontSize: 34, fontWeight: '800', color: Colors.textPrimary, letterSpacing: -1 },
  tagline: { fontSize: 14, color: Colors.textSecondary, marginTop: 4 },
  card: {
    backgroundColor: Colors.bgSecondary, borderRadius: Radius.xxl, padding: 24, ...Shadow.soft,
  },
  cardTitle: { fontSize: 22, fontWeight: '700', color: Colors.textPrimary, marginBottom: 4 },
  cardSubtitle: { fontSize: 14, color: Colors.textSecondary, marginBottom: 20 },
  inputContainer: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.bgPrimary,
    borderRadius: Radius.lg, paddingHorizontal: 16, paddingVertical: 14, gap: 10, marginBottom: 12,
  },
  input: { flex: 1, fontSize: 15, color: Colors.textPrimary },
  roleLabel: { fontSize: 11, fontWeight: '700', color: Colors.textSecondary, letterSpacing: 0.5, marginBottom: 8, marginTop: 4 },
  roleRow: { flexDirection: 'row', gap: 12, marginBottom: 16 },
  roleBtn: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 8, paddingVertical: 12, borderRadius: Radius.lg, backgroundColor: Colors.bgPrimary,
  },
  roleBtnActive: { backgroundColor: Colors.accent },
  roleBtnText: { fontSize: 14, fontWeight: '600', color: Colors.textPrimary },
  roleBtnTextActive: { color: Colors.textInverse },
  error: { color: Colors.danger, fontSize: 13, marginBottom: 12, textAlign: 'center' },
  submitBtn: {
    backgroundColor: Colors.accent, borderRadius: Radius.lg, paddingVertical: 16, alignItems: 'center', marginTop: 4,
  },
  submitBtnText: { fontSize: 16, fontWeight: '700', color: Colors.textInverse },
  toggleBtn: { marginTop: 16, alignItems: 'center' },
  toggleText: { fontSize: 14, color: Colors.textSecondary },
  toggleLink: { color: Colors.accent, fontWeight: '600' },
  footer: { textAlign: 'center', color: Colors.textSecondary, fontSize: 12, marginTop: 20 },
  hintCard: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6,
    marginTop: 12, paddingVertical: 8,
  },
  hintText: { fontSize: 12, color: Colors.accent },
});
