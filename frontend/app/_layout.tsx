import React from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

export default function RootLayout() {
  return (
    <>
      <StatusBar style="dark" />
      <Stack screenOptions={{ headerShown: false, animation: 'slide_from_right' }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="notifications" options={{ animation: 'slide_from_right' }} />
        <Stack.Screen name="community-create" options={{ animation: 'slide_from_bottom' }} />
        <Stack.Screen name="chat" options={{ animation: 'slide_from_right' }} />
        <Stack.Screen name="ai-engine" options={{ animation: 'slide_from_bottom' }} />
        <Stack.Screen name="analysis-result" options={{ animation: 'slide_from_right' }} />
        <Stack.Screen name="emergency" options={{ animation: 'slide_from_bottom' }} />
        <Stack.Screen name="emergency-rights" options={{ animation: 'slide_from_right' }} />
        <Stack.Screen name="lawyer-detail" options={{ animation: 'slide_from_right' }} />
        <Stack.Screen name="case-detail" options={{ animation: 'slide_from_right' }} />
        <Stack.Screen name="payment" options={{ animation: 'slide_from_bottom' }} />
      </Stack>
    </>
  );
}
