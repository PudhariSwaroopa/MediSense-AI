import { useState, useRef, useEffect, KeyboardEvent } from 'react';
import { FiSend, FiMic, FiMicOff, FiPaperclip } from 'react-icons/fi';

// Extend the existing SpeechRecognitionEvent interface
declare global {
  interface Window {
    webkitSpeechRecognition: typeof SpeechRecognition;
    SpeechRecognition: typeof SpeechRecognition;
  }
}

interface ChatInputProps {
  onSendMessage: (content: string) => void;
  isDisabled?: boolean;
}

export default function ChatInput({ onSendMessage, isDisabled = false }: ChatInputProps) {
  const [inputValue, setInputValue] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [isSpeechSupported, setIsSpeechSupported] = useState(false);
  const [isMicrophoneAvailable, setIsMicrophoneAvailable] = useState(true);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [fileName, setFileName] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const finalTranscript = useRef('');

  const handleSend = () => {
    const trimmedValue = inputValue.trim();
    if (trimmedValue || selectedFile) {
      onSendMessage(trimmedValue);
      setInputValue('');
      setSelectedFile(null);
      setFileName('');
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      setSelectedFile(file);
      setFileName(file.name);
      // Auto-focus the input after file selection
      inputRef.current?.focus();
    }
  };

  const handleRemoveFile = () => {
    setSelectedFile(null);
    setFileName('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  useEffect(() => {
    // Check if speech recognition is supported
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    setIsSpeechSupported(!!SpeechRecognition);

    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-US';
      
      recognition.onstart = () => {
        console.log('Speech recognition started');
        finalTranscript.current = inputValue;
      };
      
      recognition.onresult = (event: globalThis.SpeechRecognitionEvent) => {
        let interimTranscript = '';
        
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const result = event.results[i];
          const transcript = result[0].transcript;
          if (result.isFinal) {
            finalTranscript.current = finalTranscript.current 
              ? `${finalTranscript.current} ${transcript}`
              : transcript;
          } else {
            interimTranscript += transcript;
          }
        }
        
        setInputValue(
          finalTranscript.current + (interimTranscript ? ` ${interimTranscript}` : '')
        );
      };
      
      recognition.onend = () => {
        console.log('Speech recognition ended');
        if (!isListening) {
          return; // Don't restart if we intentionally stopped listening
        }

        // Add a small delay before restarting to prevent errors
        const restartDelay = 100;
        const restartTimeout = setTimeout(() => {
          try {
            if (isListening) { // Check again in case state changed during timeout
              recognition.start();
            }
          } catch (error) {
            console.error('Error restarting recognition:', error);
            setIsListening(false);
            
            if (error instanceof Error) {
              if (error.name === 'NotAllowedError' || 
                  error.name === 'SecurityError' || 
                  error.message.toLowerCase().includes('permission')) {
                
                setIsMicrophoneAvailable(false);
                alert('Microphone access was denied. Please allow microphone access to use voice input.');
              } else if (error.name === 'AbortError') {
                console.log('Speech recognition was aborted');
              } else {
                console.warn('Unexpected error during recognition restart:', error);
              }
            }
          }
        }, restartDelay);

        // Cleanup function to clear the timeout if component unmounts
        return () => clearTimeout(restartTimeout);
      };
      
      recognition.onerror = (event: Event) => {
        const errorEvent = event as SpeechRecognitionErrorEvent;
        console.error('Speech recognition error:', errorEvent.error);
        
        // Handle different error types
        switch (errorEvent.error) {
          case 'not-allowed':
          case 'service-not-allowed':
            setIsMicrophoneAvailable(false);
            alert('Microphone access was denied. Please allow microphone access to use voice input.');
            break;
            
          case 'audio-capture':
            alert('No microphone was found. Please ensure a microphone is connected.');
            break;
            
          case 'aborted':
            console.log('Speech recognition was aborted');
            break;
            
          case 'no-speech':
            console.log('No speech was detected');
            break;
            
          case 'network':
            alert('A network error occurred. Please check your connection and try again.');
            break;
            
          default:
            console.warn('Unhandled speech recognition error:', errorEvent.error);
        }
        
        setIsListening(false);
      };
      
      recognitionRef.current = recognition;
    } else {
      console.log('Speech Recognition API not supported');
    }
    
    // Cleanup function
    return () => {
      const recognition = recognitionRef.current;
      if (!recognition) return;
      
      try {
        // Remove all event listeners to prevent memory leaks
        recognition.onresult = null;
        recognition.onerror = null;
        recognition.onend = null;
        
        // Only call stop if we're currently listening
        if (isListening) {
          recognition.stop();
        }
      } catch (error) {
        console.error('Error during recognition cleanup:', error);
      } finally {
        // Clear the reference
        recognitionRef.current = null;
      }
    };
  }, [isListening]);
  
  const toggleSpeechRecognition = async () => {
    if (!isSpeechSupported) {
      alert('Speech recognition is not supported in your browser. Try using Chrome or Edge.');
      return;
    }
    
    if (!isMicrophoneAvailable) {
      try {
        const permission = await navigator.permissions.query({ name: 'microphone' as PermissionName });
        if (permission.state === 'denied') {
          alert('Microphone access is blocked. Please enable it in your browser settings.');
          return;
        }
      } catch (error) {
        console.warn('Permissions API not supported or failed:', error);
      }
      
      try {
        await navigator.mediaDevices.getUserMedia({ audio: true });
        setIsMicrophoneAvailable(true);
      } catch (error) {
        console.error('Microphone access error:', error);
        alert('Could not access microphone. Please check your microphone settings and try again.');
        return;
      }
    }
    
    const recognition = recognitionRef.current;
    if (!recognition) {
      console.error('Speech recognition not initialized');
      return;
    }
    
    if (isListening) {
      try {
        recognition.stop();
        setIsListening(false);
      } catch (error) {
        console.error('Error stopping recognition:', error);
      }
    } else {
      try {
        await recognition.start();
        setIsListening(true);
        // Focus the input when starting dictation
        inputRef.current?.focus();
      } catch (error) {
        console.error('Error starting speech recognition:', error);
        setIsListening(false);
        
        if (error instanceof Error) {
          if (error.name === 'NotAllowedError' || error.message.includes('permission')) {
            alert('Microphone access was denied. Please allow microphone access to use voice input.');
          } else if (error.name === 'NotReadableError' || error.message.includes('could not start')) {
            alert('Could not access the microphone. It may be in use by another application.');
          } else if (error.message.includes('abort')) {
            alert('Another audio capture is in progress. Please close other applications using the microphone.');
          } else {
            alert('Error starting speech recognition. Please try again.');
          }
        } else {
          alert('An unknown error occurred with speech recognition.');
        }
      }
    }
  };

  const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-800 border-t border-stone-200 dark:border-gray-700 p-4 shadow-lg">
      <div className="max-w-3xl mx-auto">
        {/* File preview */}
        {selectedFile && (
          <div className="flex items-center justify-between bg-stone-100 dark:bg-gray-700 rounded-lg p-3 mb-2 border border-stone-200 dark:border-gray-600">
            <div className="flex items-center overflow-hidden">
              <div className="bg-blue-100 dark:bg-blue-900 p-2 rounded-lg mr-3">
                <FiPaperclip className="text-blue-500 dark:text-blue-400 w-5 h-5" />
              </div>
              <span className="text-sm text-stone-800 dark:text-gray-200 truncate max-w-xs">{fileName}</span>
            </div>
            <button
              onClick={handleRemoveFile}
              className="text-stone-500 dark:text-gray-400 hover:text-stone-700 dark:hover:text-white ml-2"
              title="Remove file"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        )}
        
        <div className="flex items-center">
          {/* Hidden file input */}
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            className="hidden"
            id="file-upload"
            accept="image/*,.pdf,.doc,.docx,.txt"
          />

          {/* File upload button */}
          <label
            htmlFor="file-upload"
            className="p-3 rounded-full text-stone-500 dark:text-gray-400 hover:text-blue-500 hover:bg-stone-100 dark:hover:bg-gray-700 cursor-pointer focus:outline-none transition-colors"
            title="Attach file"
          >
            <FiPaperclip className="w-5 h-5" />
          </label>

          <div className="relative flex-1 mx-2">
            <input
              ref={inputRef}
              type="text"
              value={inputValue}
              onChange={handleInput}
              onKeyDown={handleKeyDown}
              placeholder={selectedFile ? 'Add a message...' : 'Type a message...'}
              className="w-full py-3 px-4 pr-12 bg-stone-100 dark:bg-gray-700 text-stone-800 dark:text-gray-100 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder-stone-500 dark:placeholder-gray-400 transition-colors"
              disabled={isDisabled || isListening}
            />
            {inputValue && (
              <button
                onClick={() => setInputValue('')}
                className="absolute right-12 top-1/2 transform -translate-y-1/2 text-stone-400 hover:text-stone-600 dark:text-gray-500 dark:hover:text-gray-300 transition-colors"
                type="button"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>

          {isSpeechSupported && (
            <button
              type="button"
              onClick={toggleSpeechRecognition}
              disabled={!isMicrophoneAvailable}
              className={`p-3 rounded-full focus:outline-none transition-colors ${
                isListening
                  ? 'text-red-500 hover:bg-red-100 dark:hover:bg-red-900/20'
                  : 'text-blue-500 hover:bg-stone-100 dark:hover:bg-gray-700'
              }`}
              title={isListening ? 'Stop listening' : 'Start voice input'}
            >
              {isListening ? <FiMicOff className="w-5 h-5" /> : <FiMic className="w-5 h-5" />}
            </button>
          )}

          <button
            type="button"
            onClick={handleSend}
            disabled={(!inputValue.trim() && !selectedFile) || isDisabled || isListening}
            className="p-3 rounded-full bg-blue-600 text-white hover:bg-blue-700 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm"
            title="Send message"
          >
            <FiSend className="w-5 h-5" />
          </button>
        </div>
      </div>
      <div className="max-w-3xl mx-auto mt-2">
        <p className="text-xs text-stone-500 dark:text-gray-500 text-center">
          MediChat may display inaccurate info, including about people, so double-check its responses.
        </p>
      </div>
    </div>
  );
}
