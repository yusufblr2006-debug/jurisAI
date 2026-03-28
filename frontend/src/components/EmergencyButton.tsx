import React, { useEffect, useRef } from 'react';
import { TouchableOpacity, Text, StyleSheet, Animated, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

export default function EmergencyButton() {
  const router = useRouter();
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.15, duration: 800, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1, duration: 800, useNativeDriver: true }),
      ])
    );
    pulse.start();
    return () => pulse.stop();
  }, [pulseAnim]);

  return (
    <View style={styles.wrapper}>
      <Animated.View style={[styles.pulseRing, { transform: [{ scale: pulseAnim }] }]} />
      <TouchableOpacity
        testID="emergency-fab"
        style={styles.button}
        onPress={() => router.push('/emergency' as any)}
        activeOpacity={0.8}
      >
        <Ionicons name="shield" size={22} color="#FFF" />
        <Text style={styles.text}>SOS</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { position: 'absolute', bottom: 100, right: 16, zIndex: 999, alignItems: 'center', justifyContent: 'center' },
  pulseRing: { position: 'absolute', width: 64, height: 64, borderRadius: 32, backgroundColor: 'rgba(220, 38, 38, 0.25)' },
  button: {
    width: 56, height: 56, borderRadius: 28,
    backgroundColor: '#DC2626', alignItems: 'center', justifyContent: 'center',
    shadowColor: '#DC2626', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.4, shadowRadius: 8, elevation: 8,
  },
  text: { fontSize: 9, fontWeight: '800', color: '#FFF', marginTop: -2 },
});
