import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  TextInput, ActivityIndicator, Animated,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors, Spacing, Radius, Shadow } from '../src/utils/theme';

const PAYMENT_METHODS = [
  { id: 'upi', icon: 'phone-portrait', label: 'UPI', desc: 'GPay, PhonePe, Paytm', popular: true },
  { id: 'card', icon: 'card', label: 'Credit/Debit Card', desc: 'Visa, Mastercard, RuPay', popular: false },
  { id: 'netbanking', icon: 'globe', label: 'Net Banking', desc: 'All major banks', popular: false },
];

export default function PaymentScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams();
  const [method, setMethod] = useState('upi');
  const [upiId, setUpiId] = useState('');
  const [processing, setProcessing] = useState(false);
  const [success, setSuccess] = useState(false);
  const checkAnim = useRef(new Animated.Value(0)).current;

  const lawyerName = params.lawyerName as string || 'Legal Consultant';
  const amount = params.amount as string || '2000';

  const handlePay = () => {
    setProcessing(true);
    // Mock payment processing
    setTimeout(() => {
      setProcessing(false);
      setSuccess(true);
      Animated.spring(checkAnim, { toValue: 1, friction: 3, useNativeDriver: true }).start();
    }, 2500);
  };

  if (success) {
    return (
      <View style={[styles.safe, { paddingTop: insets.top }]}>
        <View style={styles.successContainer}>
          <Animated.View style={[styles.successCircle, { transform: [{ scale: checkAnim }] }]}>
            <Ionicons name="checkmark" size={48} color="#FFF" />
          </Animated.View>
          <Text style={styles.successTitle}>Payment Successful!</Text>
          <Text style={styles.successAmount}>Rs {parseInt(amount).toLocaleString()}</Text>
          <Text style={styles.successDesc}>Your consultation with {lawyerName} has been booked successfully.</Text>

          <View style={styles.successCard}>
            <View style={styles.successRow}>
              <Text style={styles.successLabel}>Transaction ID</Text>
              <Text style={styles.successValue}>TXN{Date.now().toString().slice(-8)}</Text>
            </View>
            <View style={styles.successRow}>
              <Text style={styles.successLabel}>Method</Text>
              <Text style={styles.successValue}>{method === 'upi' ? 'UPI' : method === 'card' ? 'Card' : 'Net Banking'}</Text>
            </View>
            <View style={styles.successRow}>
              <Text style={styles.successLabel}>Status</Text>
              <View style={styles.successBadge}><Text style={styles.successBadgeText}>Confirmed</Text></View>
            </View>
          </View>

          <View style={styles.nextSteps}>
            <Text style={styles.nextStepsTitle}>What's Next?</Text>
            <View style={styles.nextStep}><View style={styles.nextNum}><Text style={styles.nextNumText}>1</Text></View><Text style={styles.nextText}>You'll receive a confirmation SMS & email</Text></View>
            <View style={styles.nextStep}><View style={styles.nextNum}><Text style={styles.nextNumText}>2</Text></View><Text style={styles.nextText}>Lawyer will contact you within 2 hours</Text></View>
            <View style={styles.nextStep}><View style={styles.nextNum}><Text style={styles.nextNumText}>3</Text></View><Text style={styles.nextText}>Use the chat to share case details</Text></View>
          </View>

          <TouchableOpacity style={styles.chatBtn} onPress={() => router.push('/chat' as any)}>
            <Ionicons name="chatbubbles" size={18} color="#FFF" />
            <Text style={styles.chatBtnText}>Start Chat with Lawyer</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.homeBtn} onPress={() => router.push('/(tabs)/home' as any)}>
            <Text style={styles.homeBtnText}>Go to Home</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.safe, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={22} color={Colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Payment</Text>
        <View style={styles.secureBadge}>
          <Ionicons name="lock-closed" size={12} color="#16A34A" />
          <Text style={styles.secureText}>Secure</Text>
        </View>
      </View>

      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Order Summary */}
        <View style={styles.orderCard}>
          <Text style={styles.orderLabel}>CONSULTATION FEE</Text>
          <View style={styles.orderRow}>
            <View>
              <Text style={styles.orderLawyer}>{lawyerName}</Text>
              <Text style={styles.orderDesc}>Legal Consultation (30 min)</Text>
            </View>
            <Text style={styles.orderAmount}>Rs {parseInt(amount).toLocaleString()}</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.orderRow}>
            <Text style={styles.totalLabel}>Total</Text>
            <Text style={styles.totalAmount}>Rs {parseInt(amount).toLocaleString()}</Text>
          </View>
        </View>

        {/* Payment Methods */}
        <Text style={styles.sectionLabel}>SELECT PAYMENT METHOD</Text>
        {PAYMENT_METHODS.map(pm => (
          <TouchableOpacity
            key={pm.id}
            style={[styles.methodCard, method === pm.id && styles.methodCardActive]}
            onPress={() => setMethod(pm.id)}
            activeOpacity={0.7}
          >
            <View style={styles.methodRadio}>
              <View style={[styles.radioOuter, method === pm.id && styles.radioOuterActive]}>
                {method === pm.id && <View style={styles.radioInner} />}
              </View>
            </View>
            <View style={[styles.methodIcon, method === pm.id && styles.methodIconActive]}>
              <Ionicons name={pm.icon as any} size={20} color={method === pm.id ? Colors.accent : Colors.textSecondary} />
            </View>
            <View style={{ flex: 1 }}>
              <View style={styles.methodLabelRow}>
                <Text style={[styles.methodLabel, method === pm.id && styles.methodLabelActive]}>{pm.label}</Text>
                {pm.popular && <View style={styles.popularBadge}><Text style={styles.popularText}>Popular</Text></View>}
              </View>
              <Text style={styles.methodDesc}>{pm.desc}</Text>
            </View>
          </TouchableOpacity>
        ))}

        {/* UPI Input */}
        {method === 'upi' && (
          <View style={styles.upiCard}>
            <Text style={styles.upiLabel}>Enter UPI ID</Text>
            <TextInput
              style={styles.upiInput}
              placeholder="yourname@upi"
              placeholderTextColor={Colors.textSecondary}
              value={upiId}
              onChangeText={setUpiId}
              autoCapitalize="none"
              keyboardType="email-address"
            />
            <View style={styles.upiApps}>
              {['GPay', 'PhonePe', 'Paytm', 'BHIM'].map(app => (
                <TouchableOpacity key={app} style={styles.upiAppBtn} onPress={() => setUpiId(`user@${app.toLowerCase()}`)}>
                  <Text style={styles.upiAppText}>{app}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        {/* Card Input */}
        {method === 'card' && (
          <View style={styles.upiCard}>
            <Text style={styles.upiLabel}>Card Number</Text>
            <TextInput style={styles.upiInput} placeholder="1234 5678 9012 3456" placeholderTextColor={Colors.textSecondary} keyboardType="numeric" />
            <View style={styles.cardRow}>
              <View style={{ flex: 1 }}>
                <Text style={styles.upiLabel}>Expiry</Text>
                <TextInput style={styles.upiInput} placeholder="MM/YY" placeholderTextColor={Colors.textSecondary} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.upiLabel}>CVV</Text>
                <TextInput style={styles.upiInput} placeholder="***" placeholderTextColor={Colors.textSecondary} secureTextEntry />
              </View>
            </View>
          </View>
        )}

        {/* Trust Badges */}
        <View style={styles.trustRow}>
          <View style={styles.trustItem}>
            <Ionicons name="shield-checkmark" size={16} color="#16A34A" />
            <Text style={styles.trustText}>256-bit SSL</Text>
          </View>
          <View style={styles.trustItem}>
            <Ionicons name="lock-closed" size={16} color="#16A34A" />
            <Text style={styles.trustText}>PCI Compliant</Text>
          </View>
          <View style={styles.trustItem}>
            <Ionicons name="refresh" size={16} color="#16A34A" />
            <Text style={styles.trustText}>Easy Refund</Text>
          </View>
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Pay Button */}
      <View style={[styles.bottomBar, { paddingBottom: insets.bottom + 12 }]}>
        <TouchableOpacity
          testID="pay-btn"
          style={[styles.payBtn, processing && { opacity: 0.7 }]}
          onPress={handlePay}
          disabled={processing}
          activeOpacity={0.8}
        >
          {processing ? (
            <>
              <ActivityIndicator size="small" color="#FFF" />
              <Text style={styles.payBtnText}>Processing...</Text>
            </>
          ) : (
            <>
              <Ionicons name="lock-closed" size={16} color="#FFF" />
              <Text style={styles.payBtnText}>Pay Rs {parseInt(amount).toLocaleString()}</Text>
            </>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.bgPrimary },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: Spacing.md, paddingVertical: 12, backgroundColor: Colors.bgSecondary, ...Shadow.soft },
  backBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: Colors.bgPrimary, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { fontSize: 18, fontWeight: '700', color: Colors.textPrimary },
  secureBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: '#DCFCE7', paddingHorizontal: 10, paddingVertical: 4, borderRadius: Radius.pill },
  secureText: { fontSize: 11, fontWeight: '600', color: '#16A34A' },
  scroll: { flex: 1 },
  scrollContent: { paddingHorizontal: Spacing.md, paddingTop: 16 },
  orderCard: { backgroundColor: Colors.bgSecondary, borderRadius: Radius.xxl, padding: 20, marginBottom: 16, ...Shadow.soft },
  orderLabel: { fontSize: 11, fontWeight: '700', color: Colors.textSecondary, letterSpacing: 0.5, marginBottom: 12 },
  orderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  orderLawyer: { fontSize: 16, fontWeight: '700', color: Colors.textPrimary },
  orderDesc: { fontSize: 13, color: Colors.textSecondary, marginTop: 2 },
  orderAmount: { fontSize: 18, fontWeight: '800', color: Colors.textPrimary },
  divider: { height: 1, backgroundColor: Colors.border, marginVertical: 14 },
  totalLabel: { fontSize: 14, fontWeight: '600', color: Colors.textPrimary },
  totalAmount: { fontSize: 22, fontWeight: '800', color: Colors.accent },
  sectionLabel: { fontSize: 11, fontWeight: '700', color: Colors.textSecondary, letterSpacing: 0.5, marginBottom: 10 },
  methodCard: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: Colors.bgSecondary, borderRadius: Radius.xl, padding: 16, marginBottom: 8, borderWidth: 2, borderColor: 'transparent', ...Shadow.soft },
  methodCardActive: { borderColor: Colors.accent, backgroundColor: Colors.accentLight },
  methodRadio: { padding: 2 },
  radioOuter: { width: 20, height: 20, borderRadius: 10, borderWidth: 2, borderColor: Colors.border, alignItems: 'center', justifyContent: 'center' },
  radioOuterActive: { borderColor: Colors.accent },
  radioInner: { width: 10, height: 10, borderRadius: 5, backgroundColor: Colors.accent },
  methodIcon: { width: 40, height: 40, borderRadius: 12, backgroundColor: Colors.bgPrimary, alignItems: 'center', justifyContent: 'center' },
  methodIconActive: { backgroundColor: Colors.accent + '20' },
  methodLabelRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  methodLabel: { fontSize: 15, fontWeight: '600', color: Colors.textPrimary },
  methodLabelActive: { color: Colors.accent },
  methodDesc: { fontSize: 12, color: Colors.textSecondary, marginTop: 2 },
  popularBadge: { backgroundColor: '#16A34A', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 },
  popularText: { fontSize: 9, fontWeight: '700', color: '#FFF' },
  upiCard: { backgroundColor: Colors.bgSecondary, borderRadius: Radius.xl, padding: 16, marginBottom: 12, ...Shadow.soft },
  upiLabel: { fontSize: 12, fontWeight: '600', color: Colors.textSecondary, marginBottom: 6 },
  upiInput: { backgroundColor: Colors.bgPrimary, borderRadius: Radius.lg, paddingHorizontal: 14, paddingVertical: 12, fontSize: 15, color: Colors.textPrimary, marginBottom: 10 },
  upiApps: { flexDirection: 'row', gap: 8 },
  upiAppBtn: { backgroundColor: Colors.bgPrimary, borderRadius: Radius.lg, paddingHorizontal: 14, paddingVertical: 8 },
  upiAppText: { fontSize: 12, fontWeight: '600', color: Colors.accent },
  cardRow: { flexDirection: 'row', gap: 12 },
  trustRow: { flexDirection: 'row', justifyContent: 'center', gap: 20, marginTop: 8 },
  trustItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  trustText: { fontSize: 11, color: '#16A34A', fontWeight: '500' },
  bottomBar: { paddingHorizontal: Spacing.md, paddingTop: 12, backgroundColor: Colors.bgSecondary, borderTopWidth: 1, borderTopColor: Colors.border },
  payBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10, backgroundColor: Colors.accent, borderRadius: Radius.xl, paddingVertical: 16 },
  payBtnText: { fontSize: 16, fontWeight: '700', color: '#FFF' },
  successContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: Spacing.md },
  successCircle: { width: 90, height: 90, borderRadius: 45, backgroundColor: '#16A34A', alignItems: 'center', justifyContent: 'center', marginBottom: 20 },
  successTitle: { fontSize: 24, fontWeight: '800', color: Colors.textPrimary, marginBottom: 4 },
  successAmount: { fontSize: 32, fontWeight: '800', color: Colors.accent, marginBottom: 8 },
  successDesc: { fontSize: 14, color: Colors.textSecondary, textAlign: 'center', marginBottom: 20 },
  successCard: { width: '100%', backgroundColor: Colors.bgSecondary, borderRadius: Radius.xl, padding: 16, marginBottom: 20, ...Shadow.soft },
  successRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: Colors.border },
  successLabel: { fontSize: 13, color: Colors.textSecondary },
  successValue: { fontSize: 14, fontWeight: '600', color: Colors.textPrimary },
  successBadge: { backgroundColor: '#DCFCE7', paddingHorizontal: 10, paddingVertical: 4, borderRadius: Radius.pill },
  successBadgeText: { fontSize: 12, fontWeight: '700', color: '#16A34A' },
  nextSteps: { width: '100%', marginBottom: 20 },
  nextStepsTitle: { fontSize: 16, fontWeight: '700', color: Colors.textPrimary, marginBottom: 12 },
  nextStep: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 10 },
  nextNum: { width: 24, height: 24, borderRadius: 12, backgroundColor: Colors.accent, alignItems: 'center', justifyContent: 'center' },
  nextNumText: { fontSize: 12, fontWeight: '700', color: '#FFF' },
  nextText: { fontSize: 14, color: Colors.textPrimary, flex: 1 },
  chatBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10, backgroundColor: Colors.accent, borderRadius: Radius.xl, paddingVertical: 16, width: '100%', marginBottom: 10 },
  chatBtnText: { fontSize: 16, fontWeight: '700', color: '#FFF' },
  homeBtn: { paddingVertical: 12 },
  homeBtnText: { fontSize: 14, fontWeight: '600', color: Colors.textSecondary },
});
