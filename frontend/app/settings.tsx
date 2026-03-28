import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Switch } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors, Spacing, Radius, Shadow } from '../src/utils/theme';

export default function SettingsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [pushNotifs, setPushNotifs] = React.useState(true);
  const [biometric, setBiometric] = React.useState(false);
  const [darkMode, setDarkMode] = React.useState(false);

  return (
    <View style={[styles.safe, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={22} color={Colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Settings</Text>
        <View style={{ width: 36 }} />
      </View>

      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent}>
        <Text style={styles.sectionLabel}>NOTIFICATIONS</Text>
        <View style={styles.settingRow}>
          <View style={styles.settingLeft}>
            <Ionicons name="notifications" size={20} color={Colors.accent} />
            <Text style={styles.settingLabel}>Push Notifications</Text>
          </View>
          <Switch value={pushNotifs} onValueChange={setPushNotifs} trackColor={{ true: Colors.accent }} />
        </View>

        <Text style={styles.sectionLabel}>SECURITY</Text>
        <View style={styles.settingRow}>
          <View style={styles.settingLeft}>
            <Ionicons name="finger-print" size={20} color={Colors.accent} />
            <Text style={styles.settingLabel}>Biometric Login</Text>
          </View>
          <Switch value={biometric} onValueChange={setBiometric} trackColor={{ true: Colors.accent }} />
        </View>

        <Text style={styles.sectionLabel}>APPEARANCE</Text>
        <View style={styles.settingRow}>
          <View style={styles.settingLeft}>
            <Ionicons name="moon" size={20} color={Colors.accent} />
            <Text style={styles.settingLabel}>Dark Mode</Text>
          </View>
          <Switch value={darkMode} onValueChange={setDarkMode} trackColor={{ true: Colors.accent }} />
        </View>

        <Text style={styles.sectionLabel}>DATA</Text>
        <TouchableOpacity style={styles.menuItem}>
          <Ionicons name="cloud-download" size={20} color={Colors.accent} />
          <Text style={styles.menuLabel}>Export Data</Text>
          <Ionicons name="chevron-forward" size={18} color={Colors.textSecondary} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.menuItem}>
          <Ionicons name="trash" size={20} color="#DC2626" />
          <Text style={[styles.menuLabel, { color: '#DC2626' }]}>Delete Account</Text>
          <Ionicons name="chevron-forward" size={18} color={Colors.textSecondary} />
        </TouchableOpacity>

        <Text style={styles.sectionLabel}>ABOUT</Text>
        <View style={styles.aboutCard}>
          <Text style={styles.aboutTitle}>JurisAI</Text>
          <Text style={styles.aboutVersion}>Version 1.0.0</Text>
          <Text style={styles.aboutDesc}>AI-Powered Legal Assistant for India</Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.bgPrimary },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: Spacing.md, paddingVertical: 12, backgroundColor: Colors.bgSecondary, ...Shadow.soft },
  backBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: Colors.bgPrimary, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { fontSize: 18, fontWeight: '700', color: Colors.textPrimary },
  scroll: { flex: 1 },
  scrollContent: { paddingHorizontal: Spacing.md, paddingTop: 16, paddingBottom: 40 },
  sectionLabel: { fontSize: 11, fontWeight: '700', color: Colors.textSecondary, letterSpacing: 0.5, marginBottom: 8, marginTop: 12 },
  settingRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: Colors.bgSecondary, borderRadius: Radius.xl, padding: 16, marginBottom: 6, ...Shadow.soft },
  settingLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  settingLabel: { fontSize: 15, fontWeight: '600', color: Colors.textPrimary },
  menuItem: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: Colors.bgSecondary, borderRadius: Radius.xl, padding: 16, marginBottom: 6, ...Shadow.soft },
  menuLabel: { flex: 1, fontSize: 15, fontWeight: '600', color: Colors.textPrimary },
  aboutCard: { backgroundColor: Colors.bgSecondary, borderRadius: Radius.xl, padding: 20, alignItems: 'center', ...Shadow.soft },
  aboutTitle: { fontSize: 20, fontWeight: '800', color: Colors.accent },
  aboutVersion: { fontSize: 13, color: Colors.textSecondary, marginTop: 4 },
  aboutDesc: { fontSize: 13, color: Colors.textSecondary, marginTop: 2 },
});
