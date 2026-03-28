import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, Modal, Animated, Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Radius, Shadow } from '../utils/theme';

const LANGUAGES = [
  { code: 'en-IN', label: 'English', flag: 'EN' },
  { code: 'hi-IN', label: 'हिन्दी', flag: 'HI' },
  { code: 'kn-IN', label: 'ಕನ್ನಡ', flag: 'KN' },
];

interface Props {
  onResult: (text: string) => void;
  compact?: boolean;
}

export default function VoiceInput({ onResult, compact = false }: Props) {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [selectedLang, setSelectedLang] = useState(0);
  const [showModal, setShowModal] = useState(false);
  const [error, setError] = useState('');
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const waveAnim1 = useRef(new Animated.Value(0.3)).current;
  const waveAnim2 = useRef(new Animated.Value(0.3)).current;
  const waveAnim3 = useRef(new Animated.Value(0.3)).current;
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    if (isListening) {
      const pulse = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, { toValue: 1.3, duration: 600, useNativeDriver: true }),
          Animated.timing(pulseAnim, { toValue: 1, duration: 600, useNativeDriver: true }),
        ])
      );
      const w1 = Animated.loop(Animated.sequence([
        Animated.timing(waveAnim1, { toValue: 1, duration: 400, useNativeDriver: true }),
        Animated.timing(waveAnim1, { toValue: 0.3, duration: 400, useNativeDriver: true }),
      ]));
      const w2 = Animated.loop(Animated.sequence([
        Animated.delay(100),
        Animated.timing(waveAnim2, { toValue: 1, duration: 500, useNativeDriver: true }),
        Animated.timing(waveAnim2, { toValue: 0.3, duration: 500, useNativeDriver: true }),
      ]));
      const w3 = Animated.loop(Animated.sequence([
        Animated.delay(200),
        Animated.timing(waveAnim3, { toValue: 1, duration: 350, useNativeDriver: true }),
        Animated.timing(waveAnim3, { toValue: 0.3, duration: 350, useNativeDriver: true }),
      ]));
      pulse.start(); w1.start(); w2.start(); w3.start();
      return () => { pulse.stop(); w1.stop(); w2.stop(); w3.stop(); };
    }
  }, [isListening]);

  const startListening = useCallback(async () => {
    setError('');
    setTranscript('');
    setShowModal(true);

    if (Platform.OS === 'web') {
      try {
        const SpeechRecognitionAPI = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
        if (!SpeechRecognitionAPI) {
          setError('Voice input not supported in this browser. Please type instead.');
          return;
        }
        const recognition = new SpeechRecognitionAPI();
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = LANGUAGES[selectedLang].code;

        recognition.onresult = (event: any) => {
          let result = '';
          for (let i = 0; i < event.results.length; i++) {
            result += event.results[i][0].transcript;
          }
          setTranscript(result);
        };

        recognition.onerror = (event: any) => {
          console.error('Speech error:', event.error);
          if (event.error === 'not-allowed') {
            setError('Microphone permission denied. Please allow microphone access.');
          } else {
            setError('Voice recognition error. Please try again.');
          }
          setIsListening(false);
        };

        recognition.onend = () => {
          setIsListening(false);
        };

        recognition.start();
        recognitionRef.current = recognition;
        setIsListening(true);
      } catch (e) {
        console.error(e);
        setError('Voice input failed. Please type instead.');
      }
    } else {
      // Native: use expo-speech-recognition
      try {
        const SpeechRecognition = require('expo-speech-recognition');
        const { status } = await SpeechRecognition.requestPermissionsAsync();
        if (status !== 'granted') {
          setError('Microphone permission denied.');
          return;
        }

        SpeechRecognition.addListener('result', (event: any) => {
          if (event.results && event.results.length > 0) {
            setTranscript(event.results[0]?.transcript || '');
          }
        });

        SpeechRecognition.addListener('error', (event: any) => {
          setError('Voice recognition error. Please try again.');
          setIsListening(false);
        });

        SpeechRecognition.addListener('end', () => {
          setIsListening(false);
        });

        await SpeechRecognition.startAsync({
          lang: LANGUAGES[selectedLang].code,
          interimResults: true,
        });
        setIsListening(true);
      } catch (e) {
        console.error(e);
        setError('Voice input not available. Please type instead.');
      }
    }
  }, [selectedLang]);

  const stopListening = useCallback(() => {
    if (Platform.OS === 'web' && recognitionRef.current) {
      recognitionRef.current.stop();
    } else {
      try {
        const SpeechRecognition = require('expo-speech-recognition');
        SpeechRecognition.stopAsync();
      } catch (e) { /* ignore */ }
    }
    setIsListening(false);
  }, []);

  const handleDone = () => {
    stopListening();
    if (transcript.trim()) {
      onResult(transcript.trim());
    }
    setShowModal(false);
    setTranscript('');
  };

  const handleCancel = () => {
    stopListening();
    setShowModal(false);
    setTranscript('');
    setError('');
  };

  // Compact mic button
  if (compact) {
    return (
      <TouchableOpacity testID="voice-mic-compact" style={styles.compactBtn} onPress={() => setShowModal(true)} activeOpacity={0.7}>
        <Ionicons name="mic" size={20} color={Colors.accent} />
        <VoiceModal />
      </TouchableOpacity>
    );
  }

  function VoiceModal() {
    return (
      <Modal visible={showModal} transparent animationType="slide" onRequestClose={handleCancel}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            {/* Language Selector */}
            <View style={styles.langRow}>
              {LANGUAGES.map((lang, i) => (
                <TouchableOpacity
                  key={lang.code}
                  style={[styles.langBtn, selectedLang === i && styles.langBtnActive]}
                  onPress={() => {
                    setSelectedLang(i);
                    if (isListening) { stopListening(); }
                  }}
                >
                  <Text style={[styles.langFlag, selectedLang === i && styles.langFlagActive]}>{lang.flag}</Text>
                  <Text style={[styles.langLabel, selectedLang === i && styles.langLabelActive]}>{lang.label}</Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Mic Area */}
            <View style={styles.micArea}>
              {!isListening && !transcript && !error && (
                <Text style={styles.micHint}>
                  {selectedLang === 1 ? 'बोलने के लिए माइक दबाएं' : selectedLang === 2 ? 'ಮಾತನಾಡಲು ಮೈಕ್ ಒತ್ತಿ' : 'Tap the mic to speak'}
                </Text>
              )}

              {error ? (
                <View style={styles.errorBox}>
                  <Ionicons name="alert-circle" size={20} color="#DC2626" />
                  <Text style={styles.errorText}>{error}</Text>
                </View>
              ) : null}

              {/* Transcript */}
              {transcript ? (
                <View style={styles.transcriptBox}>
                  <Text style={styles.transcriptLabel}>
                    {selectedLang === 1 ? 'आपने कहा:' : selectedLang === 2 ? 'ನೀವು ಹೇಳಿದ್ದು:' : 'You said:'}
                  </Text>
                  <Text style={styles.transcriptText}>{transcript}</Text>
                </View>
              ) : null}

              {/* Waveform */}
              {isListening && (
                <View style={styles.waveform}>
                  {[waveAnim1, waveAnim2, waveAnim3, waveAnim2, waveAnim1].map((anim, i) => (
                    <Animated.View key={i} style={[styles.waveBar, { transform: [{ scaleY: anim }] }]} />
                  ))}
                </View>
              )}

              {/* Big Mic Button */}
              <View style={styles.micBtnContainer}>
                <Animated.View style={[styles.micPulse, isListening && { transform: [{ scale: pulseAnim }] }]} />
                <TouchableOpacity
                  testID="voice-mic-btn"
                  style={[styles.micBtn, isListening && styles.micBtnActive]}
                  onPress={isListening ? stopListening : startListening}
                  activeOpacity={0.7}
                >
                  <Ionicons name={isListening ? 'stop' : 'mic'} size={36} color="#FFF" />
                </TouchableOpacity>
              </View>

              <Text style={styles.micStatus}>
                {isListening
                  ? (selectedLang === 1 ? 'सुन रहा है...' : selectedLang === 2 ? 'ಕೇಳುತ್ತಿದೆ...' : 'Listening...')
                  : (selectedLang === 1 ? 'माइक दबाएं' : selectedLang === 2 ? 'ಮೈಕ್ ಒತ್ತಿ' : 'Tap to speak')}
              </Text>
            </View>

            {/* Action Buttons */}
            <View style={styles.actionRow}>
              <TouchableOpacity style={styles.cancelBtn} onPress={handleCancel}>
                <Ionicons name="close" size={18} color={Colors.textSecondary} />
                <Text style={styles.cancelText}>{selectedLang === 1 ? 'रद्द करें' : 'Cancel'}</Text>
              </TouchableOpacity>
              <TouchableOpacity
                testID="voice-done-btn"
                style={[styles.doneBtn, !transcript.trim() && styles.doneBtnDisabled]}
                onPress={handleDone}
                disabled={!transcript.trim()}
              >
                <Ionicons name="checkmark" size={18} color="#FFF" />
                <Text style={styles.doneText}>{selectedLang === 1 ? 'उपयोग करें' : 'Use This'}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    );
  }

  return (
    <>
      <TouchableOpacity testID="voice-mic-main" style={styles.mainBtn} onPress={() => setShowModal(true)} activeOpacity={0.7}>
        <View style={styles.mainBtnIcon}>
          <Ionicons name="mic" size={22} color="#FFF" />
        </View>
        <View>
          <Text style={styles.mainBtnTitle}>
            {selectedLang === 1 ? 'बोलकर बताएं' : selectedLang === 2 ? 'ಮಾತನಾಡಿ ಹೇಳಿ' : 'Speak Your Issue'}
          </Text>
          <Text style={styles.mainBtnSub}>
            {selectedLang === 1 ? 'हिन्दी, English, ಕನ್ನಡ में बोलें' : 'Hindi, English, Kannada supported'}
          </Text>
        </View>
        <Ionicons name="chevron-forward" size={18} color="rgba(255,255,255,0.6)" />
      </TouchableOpacity>
      <VoiceModal />
    </>
  );
}

const styles = StyleSheet.create({
  compactBtn: {
    width: 42, height: 42, borderRadius: 21,
    backgroundColor: Colors.accentLight, alignItems: 'center', justifyContent: 'center',
  },
  mainBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    backgroundColor: '#16A34A', borderRadius: Radius.xl, padding: 14, marginBottom: 12,
  },
  mainBtnIcon: {
    width: 42, height: 42, borderRadius: 21,
    backgroundColor: 'rgba(255,255,255,0.2)', alignItems: 'center', justifyContent: 'center',
  },
  mainBtnTitle: { fontSize: 15, fontWeight: '700', color: '#FFF', flex: 1 },
  mainBtnSub: { fontSize: 11, color: 'rgba(255,255,255,0.7)' },
  modalOverlay: {
    flex: 1, backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: Colors.bgSecondary, borderTopLeftRadius: 24, borderTopRightRadius: 24,
    paddingHorizontal: 20, paddingTop: 20, paddingBottom: 40,
    minHeight: 420,
  },
  langRow: { flexDirection: 'row', gap: 8, marginBottom: 20 },
  langBtn: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6,
    backgroundColor: Colors.bgPrimary, borderRadius: Radius.lg, paddingVertical: 10,
    borderWidth: 2, borderColor: 'transparent',
  },
  langBtnActive: { borderColor: Colors.accent, backgroundColor: Colors.accentLight },
  langFlag: { fontSize: 12, fontWeight: '800', color: Colors.textSecondary },
  langFlagActive: { color: Colors.accent },
  langLabel: { fontSize: 13, fontWeight: '600', color: Colors.textSecondary },
  langLabelActive: { color: Colors.accent },
  micArea: { alignItems: 'center', paddingVertical: 16, gap: 16 },
  micHint: { fontSize: 14, color: Colors.textSecondary, textAlign: 'center' },
  errorBox: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: '#FEE2E2', borderRadius: Radius.lg, padding: 12, width: '100%',
  },
  errorText: { fontSize: 13, color: '#DC2626', flex: 1 },
  transcriptBox: {
    width: '100%', backgroundColor: Colors.bgPrimary,
    borderRadius: Radius.xl, padding: 16, borderWidth: 1, borderColor: Colors.accent + '30',
  },
  transcriptLabel: { fontSize: 11, fontWeight: '700', color: Colors.accent, marginBottom: 6 },
  transcriptText: { fontSize: 16, color: Colors.textPrimary, lineHeight: 24 },
  waveform: { flexDirection: 'row', alignItems: 'center', gap: 4, height: 40 },
  waveBar: {
    width: 4, height: 30, borderRadius: 2, backgroundColor: Colors.accent,
  },
  micBtnContainer: { alignItems: 'center', justifyContent: 'center', marginVertical: 8 },
  micPulse: {
    position: 'absolute', width: 88, height: 88, borderRadius: 44,
    backgroundColor: 'rgba(37, 99, 235, 0.15)',
  },
  micBtn: {
    width: 72, height: 72, borderRadius: 36,
    backgroundColor: Colors.accent, alignItems: 'center', justifyContent: 'center',
    shadowColor: Colors.accent, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 8,
  },
  micBtnActive: { backgroundColor: '#DC2626' },
  micStatus: { fontSize: 14, fontWeight: '600', color: Colors.textSecondary },
  actionRow: { flexDirection: 'row', gap: 12, marginTop: 20 },
  cancelBtn: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    backgroundColor: Colors.bgPrimary, borderRadius: Radius.lg, paddingVertical: 14,
  },
  cancelText: { fontSize: 14, fontWeight: '600', color: Colors.textSecondary },
  doneBtn: {
    flex: 2, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    backgroundColor: Colors.accent, borderRadius: Radius.lg, paddingVertical: 14,
  },
  doneBtnDisabled: { opacity: 0.4 },
  doneText: { fontSize: 14, fontWeight: '700', color: '#FFF' },
});
