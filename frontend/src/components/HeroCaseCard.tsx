import React from 'react';
import { View, Text, StyleSheet, ImageBackground } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors, Radius, Shadow } from '../utils/theme';

type Props = {
  title: string;
  status: string;
  lawyerName: string;
  caseNumber: string;
  riskLevel: string;
  imageUrl?: string;
};

export default function HeroCaseCard({ title, status, lawyerName, caseNumber, riskLevel, imageUrl }: Props) {
  const riskColor = riskLevel === 'low' ? Colors.success : riskLevel === 'high' ? Colors.danger : Colors.warning;
  const riskBg = riskLevel === 'low' ? '#DCFCE7' : riskLevel === 'high' ? '#FEE2E2' : '#FEF3C7';

  return (
    <View testID="hero-case-card" style={styles.container}>
      <ImageBackground
        source={{ uri: imageUrl || 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=600' }}
        style={styles.image}
        imageStyle={{ borderRadius: Radius.xxl }}
      >
        <LinearGradient
          colors={['transparent', 'rgba(17,24,39,0.85)']}
          style={styles.gradient}
        >
          <View style={styles.topRow}>
            <View style={styles.statusPill}>
              <View style={[styles.statusDot, { backgroundColor: riskColor }]} />
              <Text style={styles.statusText}>{status}</Text>
            </View>
            <View style={[styles.riskBadge, { backgroundColor: riskBg }]}>
              <Text style={[styles.riskText, { color: riskColor }]}>
                {riskLevel.charAt(0).toUpperCase() + riskLevel.slice(1)} Risk
              </Text>
            </View>
          </View>

          <View style={styles.bottomContent}>
            <Text style={styles.caseTitle}>{title}</Text>
            <View style={styles.metaRow}>
              <Text style={styles.metaText}>{lawyerName}</Text>
              <Text style={styles.metaSeparator}>•</Text>
              <Text style={styles.metaText}>#{caseNumber}</Text>
            </View>
          </View>
        </LinearGradient>
      </ImageBackground>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: Radius.xxl,
    overflow: 'hidden',
    ...Shadow.medium,
  },
  image: {
    height: 280,
    justifyContent: 'flex-end',
  },
  gradient: {
    flex: 1,
    borderRadius: Radius.xxl,
    justifyContent: 'space-between',
    padding: 20,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  statusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 100,
    gap: 6,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.textInverse,
  },
  riskBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 100,
  },
  riskText: {
    fontSize: 12,
    fontWeight: '700',
  },
  bottomContent: {
    gap: 4,
  },
  caseTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: Colors.textInverse,
    letterSpacing: -0.5,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  metaText: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.7)',
  },
  metaSeparator: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.4)',
  },
});
