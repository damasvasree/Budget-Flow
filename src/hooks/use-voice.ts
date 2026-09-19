import { useState, useRef, useCallback, useEffect } from 'react';

interface SpeechRecognitionEvent extends Event {
  results: {
    length: number;
    [index: number]: {
      length: number;
      [index: number]: { transcript: string; confidence: number };
    };
  };
  resultIndex: number;
}

interface SpeechRecognitionErrorEvent extends Event {
  error: string;
}

interface SpeechRecognition extends EventTarget {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  start(): void;
  stop(): void;
  abort(): void;
  onresult: ((event: SpeechRecognitionEvent) => void) | null;
  onerror: ((event: SpeechRecognitionErrorEvent) => void) | null;
  onend: (() => void) | null;
  onstart: (() => void) | null;
}

declare global {
  interface Window {
    SpeechRecognition?: new () => SpeechRecognition;
    webkitSpeechRecognition?: new () => SpeechRecognition;
  }
}

export function useVoiceInput() {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [interimTranscript, setInterimTranscript] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSupported, setIsSupported] = useState(false);
  const recognitionRef = useRef<SpeechRecognition | null>(null);

  useEffect(() => {
    const SpeechRecognitionClass = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognitionClass) {
      setIsSupported(true);
      const recognition = new SpeechRecognitionClass();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-IN';

      recognition.onresult = (event: SpeechRecognitionEvent) => {
        let final = '';
        let interim = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const result = event.results[i];
          if (result[0]) {
            if (result.length > 0 && i < event.results.length) {
              const transcriptPart = result[0].transcript;
              if (result.length > 0 && typeof result[0].confidence === 'number') {
                final += transcriptPart;
              } else {
                interim += transcriptPart;
              }
            }
          }
        }
        if (final) {
          setTranscript(prev => (prev + ' ' + final).trim());
        }
        setInterimTranscript(interim);
      };

      recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
        if (event.error === 'no-speech') {
          setError('No speech detected. Try speaking again.');
        } else if (event.error === 'audio-capture') {
          setError('Could not capture audio. Check your microphone.');
        } else if (event.error === 'not-allowed') {
          setError('Microphone access denied. Please allow microphone access.');
        } else {
          setError(`Voice input error: ${event.error}`);
        }
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
        setInterimTranscript('');
      };

      recognitionRef.current = recognition;
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }
    };
  }, []);

  const startListening = useCallback((lang = 'en-IN') => {
    if (!recognitionRef.current) return;
    setError(null);
    setTranscript('');
    setInterimTranscript('');
    recognitionRef.current.lang = lang;
    try {
      recognitionRef.current.start();
      setIsListening(true);
    } catch {
      // Already started
    }
  }, []);

  const stopListening = useCallback(() => {
    if (!recognitionRef.current) return;
    recognitionRef.current.stop();
    setIsListening(false);
  }, []);

  const reset = useCallback(() => {
    setTranscript('');
    setInterimTranscript('');
    setError(null);
  }, []);

  return {
    isListening,
    transcript,
    interimTranscript,
    error,
    isSupported,
    startListening,
    stopListening,
    reset,
    setTranscript,
  };
}
