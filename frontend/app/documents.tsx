import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors, Spacing, Radius, Shadow } from '../src/utils/theme';
import { api } from '../src/utils/api';

const DOC_ICONS: Record<string, { icon: string; color: string }> = {
  'ID Proof': { icon: 'card', color: '#2563EB' },
  'Agreement': { icon: 'document-text', color: '#16A34A' },
  'FIR Copy': { icon: 'shield', color: '#DC2626' },
  'Evidence': { icon: 'camera', color: '#9333EA' },
  default: { icon: 'document', color: '#6B7280' },
};

export default function DocumentsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [docs, setDocs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDocs();
  }, []);

  const loadDocs = async () => {
    try {
      const result = await api.getDocuments();
      setDocs(result || []);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  // Fallback mock docs if API returns empty
  const displayDocs = docs.length > 0 ? docs : [
    { id: '1', name: 'Aadhaar Card', type: 'ID Proof', size: '2.3 MB', uploaded_at: 'Mar 15, 2025', status: 'verified' },
    { id: '2', name: 'Property Sale Deed', type: 'Agreement', size: '5.1 MB', uploaded_at: 'Mar 10, 2025', status: 'verified' },
    { id: '3', name: 'Police FIR - Case #PD-12345', type: 'FIR Copy', size: '1.8 MB', uploaded_at: 'Feb 28, 2025', status: 'pending' },
    { id: '4', name: 'Witness Statement', type: 'Evidence', size: '890 KB', uploaded_at: 'Feb 20, 2025', status: 'verified' },
    { id: '5', name: 'Legal Notice Draft', type: 'Agreement', size: '340 KB', uploaded_at: 'Feb 15, 2025', status: 'pending' },
  ];

  if (loading) return <View style={[styles.safe, { paddingTop: insets.top, justifyContent: 'center', alignItems: 'center' }]}><ActivityIndicator size="large" color={Colors.accent} /></View>;

  return (
    <View style={[styles.safe, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={22} color={Colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Documents</Text>
        <TouchableOpacity style={styles.addBtn}>
          <Ionicons name="add" size={20} color={Colors.accent} />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent}>
        {/* Stats */}
        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{displayDocs.length}</Text>
            <Text style={styles.statLabel}>Total</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={[styles.statValue, { color: '#16A34A' }]}>{displayDocs.filter(d => d.status === 'verified').length}</Text>
            <Text style={styles.statLabel}>Verified</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={[styles.statValue, { color: '#D97706' }]}>{displayDocs.filter(d => d.status === 'pending').length}</Text>
            <Text style={styles.statLabel}>Pending</Text>
          </View>
        </View>

        {/* Document List */}
        {displayDocs.map((doc, i) => {
          const di = DOC_ICONS[doc.type] || DOC_ICONS.default;
          return (
            <View key={doc.id || i} style={styles.docCard}>
              <View style={[styles.docIcon, { backgroundColor: di.color + '15' }]}>
                <Ionicons name={di.icon as any} size={20} color={di.color} />
              </View>
              <View style={styles.docInfo}>
                <Text style={styles.docName} numberOfLines={1}>{doc.name}</Text>
                <Text style={styles.docMeta}>{doc.type} · {doc.size} · {doc.uploaded_at}</Text>
              </View>
              <View style={[styles.docStatus, { backgroundColor: doc.status === 'verified' ? '#DCFCE7' : '#FEF3C7' }]}>
                <Text style={[styles.docStatusText, { color: doc.status === 'verified' ? '#16A34A' : '#D97706' }]}>
                  {doc.status === 'verified' ? 'Verified' : 'Pending'}
                </Text>
              </View>
            </View>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.bgPrimary },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: Spacing.md, paddingVertical: 12, backgroundColor: Colors.bgSecondary, ...Shadow.soft },
  backBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: Colors.bgPrimary, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { fontSize: 18, fontWeight: '700', color: Colors.textPrimary },
  addBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: Colors.accentLight, alignItems: 'center', justifyContent: 'center' },
  scroll: { flex: 1 },
  scrollContent: { paddingHorizontal: Spacing.md, paddingTop: 16, paddingBottom: 40 },
  statsRow: { flexDirection: 'row', gap: 8, marginBottom: 16 },
  statCard: { flex: 1, backgroundColor: Colors.bgSecondary, borderRadius: Radius.xl, padding: 14, alignItems: 'center', ...Shadow.soft },
  statValue: { fontSize: 20, fontWeight: '800', color: Colors.textPrimary },
  statLabel: { fontSize: 12, color: Colors.textSecondary, marginTop: 2 },
  docCard: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: Colors.bgSecondary, borderRadius: Radius.xl, padding: 14, marginBottom: 8, ...Shadow.soft },
  docIcon: { width: 40, height: 40, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  docInfo: { flex: 1 },
  docName: { fontSize: 14, fontWeight: '600', color: Colors.textPrimary },
  docMeta: { fontSize: 11, color: Colors.textSecondary, marginTop: 2 },
  docStatus: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: Radius.pill },
  docStatusText: { fontSize: 10, fontWeight: '700' },
});
