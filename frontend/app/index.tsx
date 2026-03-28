import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TextInput, TouchableOpacity,
  KeyboardAvoidingView, Platform, ActivityIndicator, SafeAreaView,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, Radius, Shadow } from '../src/utils/theme';
import { api } from '../src/utils/api';

export default function LoginScreen() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [role, setRole] = useState<'user' | 'lawyer'>('user');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async () => {
    if (!name.trim()) {
      setError('Please enter your name');
      return;
    }
    setLoading(true);
    setError('');
    try {
      await api.login(name.trim(), role);
      router.replace('/(tabs)/home');
    } catch (e: any) {
      setError('Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}
      >
        <View style={styles.content}>
          <View style={styles.logoArea}>
            <View style={styles.logoCircle}>
              <Ionicons name="shield-checkmark" size={40} color={Colors.accent} />
            </View>
            <Text style={styles.appName}>JurisAI</Text>
            <Text style={styles.tagline}>AI-Powered Legal Assistant</Text>
          </View>

          <View style={styles.card}>
            <Text style={styles.cardTitle}>Get Started</Text>
            <Text style={styles.cardSubtitle}>Enter your name and select your role</Text>

            <View style={styles.inputContainer}>
              <Ionicons name="person-outline" size={20} color={Colors.textSecondary} />
              <TextInput
                testID="login-name-input"
                style={styles.input}
                placeholder="Your full name"
                placeholderTextColor={Colors.textSecondary}
                value={name}
                onChangeText={setName}
                autoCapitalize="words"
              />
            </View>

            <Text style={styles.roleLabel}>I am a</Text>
            <View style={styles.roleRow}>
              <TouchableOpacity
                testID="role-user-btn"
                style={[styles.roleBtn, role === 'user' && styles.roleBtnActive]}
                onPress={() => setRole('user')}
                activeOpacity={0.7}
              >
                <Ionicons name="person" size={20} color={role === 'user' ? Colors.textInverse : Colors.textPrimary} />
                <Text style={[styles.roleBtnText, role === 'user' && styles.roleBtnTextActive]}>Client</Text>
              </TouchableOpacity>
              <TouchableOpacity
                testID="role-lawyer-btn"
                style={[styles.roleBtn, role === 'lawyer' && styles.roleBtnActive]}
                onPress={() => setRole('lawyer')}
                activeOpacity={0.7}
              >
                <Ionicons name="briefcase" size={20} color={role === 'lawyer' ? Colors.textInverse : Colors.textPrimary} />
                <Text style={[styles.roleBtnText, role === 'lawyer' && styles.roleBtnTextActive]}>Lawyer</Text>
              </TouchableOpacity>
            </View>

            {error ? <Text style={styles.error}>{error}</Text> : null}

            <TouchableOpacity
              testID="login-submit-btn"
              style={styles.loginBtn}
              onPress={handleLogin}
              activeOpacity={0.8}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color={Colors.textInverse} />
              ) : (
                <Text style={styles.loginBtnText}>Continue</Text>
              )}
            </TouchableOpacity>
          </View>

          <Text style={styles.footer}>Built for Indian Legal System</Text>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.bgPrimary },
  container: { flex: 1 },
  content: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: Spacing.lg,
  },
  logoArea: {
    alignItems: 'center',
    marginBottom: 32,
  },
  logoCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.accentLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  appName: {
    fontSize: 36,
    fontWeight: '800',
    color: Colors.textPrimary,
    letterSpacing: -1,
  },
  tagline: {
    fontSize: 15,
    color: Colors.textSecondary,
    marginTop: 4,
  },
  card: {
    backgroundColor: Colors.bgSecondary,
    borderRadius: Radius.xxl,
    padding: 24,
    ...Shadow.soft,
  },
  cardTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: 4,
  },
  cardSubtitle: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginBottom: 20,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.bgPrimary,
    borderRadius: Radius.lg,
    paddingHorizontal: 16,
    paddingVertical: 14,
    gap: 10,
    marginBottom: 20,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: Colors.textPrimary,
  },
  roleLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.textSecondary,
    marginBottom: 10,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  roleRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  roleBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    borderRadius: Radius.lg,
    backgroundColor: Colors.bgPrimary,
  },
  roleBtnActive: {
    backgroundColor: Colors.accent,
  },
  roleBtnText: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  roleBtnTextActive: {
    color: Colors.textInverse,
  },
  error: {
    color: Colors.danger,
    fontSize: 13,
    marginBottom: 12,
    textAlign: 'center',
  },
  loginBtn: {
    backgroundColor: Colors.accent,
    borderRadius: Radius.lg,
    paddingVertical: 16,
    alignItems: 'center',
  },
  loginBtnText: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.textInverse,
  },
  footer: {
    textAlign: 'center',
    color: Colors.textSecondary,
    fontSize: 12,
    marginTop: 24,
  },
});
