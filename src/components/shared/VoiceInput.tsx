'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import { Mic, MicOff, Loader2 } from 'lucide-react';

interface SpeechRecognitionEvent extends Event {
  results: SpeechRecognitionResultList;
  resultIndex: number;
}

interface SpeechRecognitionErrorEvent extends Event {
  error: string;
}

interface SpeechRecognitionInstance extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start: () => void;
  stop: () => void;
  abort: () => void;
  onresult: ((ev: SpeechRecognitionEvent) => void) | null;
  onerror: ((ev: SpeechRecognitionErrorEvent) => void) | null;
  onend: (() => void) | null;
  onstart: (() => void) | null;
}

declare global {
  interface Window {
    SpeechRecognition?: new () => SpeechRecognitionInstance;
    webkitSpeechRecognition?: new () => SpeechRecognitionInstance;
  }
}

interface VoiceInputProps {
  onTranscript: (text: string) => void;
  className?: string;
  size?: 'sm' | 'md';
}

export function VoiceInput({ onTranscript, className, size = 'sm' }: VoiceInputProps) {
  const [listening, setListening] = useState(false);
  const [supported, setSupported] = useState(true);
  const [interim, setInterim] = useState('');
  const recognitionRef = useRef<SpeechRecognitionInstance | null>(null);
  const finalTranscriptRef = useRef('');

  useEffect(() => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) setSupported(false);
    return () => {
      recognitionRef.current?.abort();
    };
  }, []);

  const toggle = useCallback(() => {
    if (listening) {
      recognitionRef.current?.stop();
      return;
    }

    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) return;

    const recognition = new SR();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US';
    recognitionRef.current = recognition;
    finalTranscriptRef.current = '';

    recognition.onstart = () => setListening(true);

    recognition.onresult = (e: SpeechRecognitionEvent) => {
      let finalText = '';
      let interimText = '';

      for (let i = e.resultIndex; i < e.results.length; i++) {
        const result = e.results[i];
        if (result.isFinal) {
          finalText += result[0].transcript;
        } else {
          interimText += result[0].transcript;
        }
      }

      if (finalText) {
        finalTranscriptRef.current += finalText;
      }
      setInterim(interimText);
    };

    recognition.onerror = (e: SpeechRecognitionErrorEvent) => {
      if (e.error !== 'no-speech' && e.error !== 'aborted') {
        console.warn('Speech recognition error:', e.error);
      }
      setListening(false);
    };

    recognition.onend = () => {
      setListening(false);
      setInterim('');
      const text = finalTranscriptRef.current.trim();
      if (text) {
        onTranscript(text);
      }
      finalTranscriptRef.current = '';
    };

    recognition.start();
  }, [listening, onTranscript]);

  if (!supported) return null;

  const sizeClasses = size === 'md'
    ? 'w-9 h-9 rounded-xl'
    : 'w-7 h-7 rounded-lg';

  return (
    <div className="relative inline-flex items-center">
      <button
        onClick={toggle}
        className={`${sizeClasses} flex items-center justify-center transition-all cursor-pointer ${className ?? ''} ${
          listening ? 'voice-recording' : 'hover:bg-black/[0.04]'
        }`}
        style={
          listening
            ? { background: 'var(--red-tint)', color: 'var(--red-text)', border: '1px solid var(--red-border)' }
            : { color: 'var(--text-secondary)' }
        }
        title={listening ? 'Stop recording' : 'Voice input'}
      >
        {listening ? <MicOff size={size === 'md' ? 16 : 14} /> : <Mic size={size === 'md' ? 16 : 14} />}
      </button>
      {listening && interim && (
        <div
          className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2.5 py-1.5 rounded-lg text-xs max-w-[200px] truncate whitespace-nowrap"
          style={{
            background: 'var(--bg-paper)',
            border: '1px solid var(--border-glass)',
            boxShadow: 'var(--shadow-float)',
            color: 'var(--text-secondary)',
          }}
        >
          {interim}
        </div>
      )}
    </div>
  );
}
