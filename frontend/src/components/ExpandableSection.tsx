import React, { useState, useRef, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated, LayoutAnimation, Platform, UIManager } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Radius, Shadow, Spacing } from '../utils/theme';

if (Platform.OS === 'android') {
  UIManager.setLayoutAnimationEnabledExperimental?.(true);
}

interface Props {
  title: string;
  icon?: string;
  iconColor?: string;
  badge?: string;
  badgeColor?: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
  borderColor?: string;
}

export default function ExpandableSection({ title, icon, iconColor, badge, badgeColor, children, defaultOpen = false, borderColor }: Props) {
  const [expanded, setExpanded] = useState(defaultOpen);
  const rotation = useRef(new Animated.Value(defaultOpen ? 1 : 0)).current;

  const toggle = useCallback(() => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    Animated.timing(rotation, { toValue: expanded ? 0 : 1, duration: 250, useNativeDriver: true }).start();
    setExpanded(!expanded);
  }, [expanded, rotation]);

  const rotate = rotation.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '180deg'] });

  return (
    <View style={[styles.container, borderColor ? { borderLeftWidth: 3, borderLeftColor: borderColor } : {}]}>
      <TouchableOpacity style={styles.header} onPress={toggle} activeOpacity={0.7}>
        <View style={styles.headerLeft}>
          {icon && (
            <View style={[styles.iconCircle, { backgroundColor: (iconColor || Colors.accent) + '15' }]}>
              <Ionicons name={icon as any} size={16} color={iconColor || Colors.accent} />
            </View>
          )}
          <Text style={styles.title}>{title}</Text>
          {badge && (
            <View style={[styles.badge, { backgroundColor: (badgeColor || Colors.accent) + '20' }]}>
              <Text style={[styles.badgeText, { color: badgeColor || Colors.accent }]}>{badge}</Text>
            </View>
          )}
        </View>
        <Animated.View style={{ transform: [{ rotate }] }}>
          <Ionicons name="chevron-down" size={18} color={Colors.textSecondary} />
        </Animated.View>
      </TouchableOpacity>
      {expanded && <View style={styles.content}>{children}</View>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { backgroundColor: Colors.bgSecondary, borderRadius: Radius.xl, marginBottom: 10, ...Shadow.soft, overflow: 'hidden' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16 },
  headerLeft: { flexDirection: 'row', alignItems: 'center', gap: 10, flex: 1 },
  iconCircle: { width: 30, height: 30, borderRadius: 15, alignItems: 'center', justifyContent: 'center' },
  title: { fontSize: 15, fontWeight: '600', color: Colors.textPrimary, flex: 1 },
  badge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: Radius.pill },
  badgeText: { fontSize: 11, fontWeight: '700' },
  content: { paddingHorizontal: 16, paddingBottom: 16 },
});
