import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Shadow } from '../utils/theme';

type TabItem = {
  name: string;
  icon: keyof typeof Ionicons.glyphMap;
  iconActive: keyof typeof Ionicons.glyphMap;
};

const tabs: TabItem[] = [
  { name: 'home', icon: 'home-outline', iconActive: 'home' },
  { name: 'cases', icon: 'briefcase-outline', iconActive: 'briefcase' },
  { name: 'community', icon: 'chatbubbles-outline', iconActive: 'chatbubbles' },
  { name: 'lawyers', icon: 'people-outline', iconActive: 'people' },
  { name: 'profile', icon: 'person-outline', iconActive: 'person' },
];

type Props = {
  activeTab: string;
  onTabPress: (tab: string) => void;
};

export default function FloatingNav({ activeTab, onTabPress }: Props) {
  return (
    <View style={styles.container}>
      <View style={styles.pill}>
        {tabs.map((tab) => {
          const isActive = activeTab === tab.name;
          return (
            <TouchableOpacity
              key={tab.name}
              testID={`nav-${tab.name}-tab`}
              style={[styles.tabItem, isActive && styles.tabItemActive]}
              onPress={() => onTabPress(tab.name)}
              activeOpacity={0.7}
            >
              <Ionicons
                name={isActive ? tab.iconActive : tab.icon}
                size={22}
                color={Colors.textInverse}
              />
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 20,
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 100,
  },
  pill: {
    flexDirection: 'row',
    backgroundColor: Colors.navPill,
    borderRadius: 100,
    paddingHorizontal: 10,
    paddingVertical: 8,
    gap: 4,
    ...Shadow.medium,
  },
  tabItem: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabItemActive: {
    backgroundColor: Colors.navPillActive,
  },
});
