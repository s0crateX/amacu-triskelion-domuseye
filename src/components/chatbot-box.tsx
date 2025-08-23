"use client";
import {
  Bot,
  CornerRightUp,
  BotMessageSquare,
  User,
  Mic,
  MicOff,
} from "lucide-react";
import { useCallback, useRef, useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import Image from "next/image";
import TextareaAutosize from "react-textarea-autosize";

// TypeScript declarations for Web Speech API
interface SpeechRecognitionEvent {
  resultIndex: number;
  results: SpeechRecognitionResultList;
}

interface SpeechRecognitionResultList {
  length: number;
  item(index: number): SpeechRecognitionResult;
  [index: number]: SpeechRecognitionResult;
}

interface SpeechRecognitionResult {
  length: number;
  item(index: number): SpeechRecognitionAlternative;
  [index: number]: SpeechRecognitionAlternative;
  isFinal: boolean;
}

interface SpeechRecognitionAlternative {
  transcript: string;
  confidence: number;
}

interface SpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  maxAlternatives: number;
  serviceURI: string;
  start(): void;
  stop(): void;
  onresult: (event: SpeechRecognitionEvent) => void;
  onerror: (event: { error: string }) => void;
  onend: () => void;
  onaudiostart: () => void;
  onaudioend: () => void;
  onspeechstart: () => void;
  onspeechend: () => void;
}

declare global {
  interface Window {
    SpeechRecognition: {
      new (): SpeechRecognition;
    };
    webkitSpeechRecognition: {
      new (): SpeechRecognition;
    };
  }
}

import { useChat } from "@ai-sdk/react";
import Markdown from "react-markdown";

function ChatBubble({
  message,
  isUser,
  timestamp,
}: {
  message: string;
  isUser: boolean;
  timestamp: Date;
}) {
  const formattedTime = timestamp.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });

  return (
    <div
      className={cn("flex w-full", isUser ? "justify-end" : "justify-start")}
    >
      <div
        className={cn(
          "flex max-w-[80%] items-start space-x-2",
          isUser && "flex-row-reverse space-x-reverse"
        )}
      >
        <div
          className={cn(
            "flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full",
            isUser ? "bg-primary/10" : "bg-muted"
          )}
        >
          {isUser ? (
            <User className="text-primary h-4 w-4" />
          ) : (
            <Bot className="text-muted-foreground h-4 w-4" />
          )}
        </div>
        <div className="flex flex-col">
          <div
            className={cn(
              "rounded-2xl px-4 py-2 shadow-sm",
              isUser
                ? "bg-primary text-primary-foreground rounded-tr-none"
                : "border-border bg-card text-card-foreground rounded-tl-none border"
            )}
          >
            <Markdown>{message}</Markdown>
          </div>
          <span
            className={cn(
              "text-muted-foreground mt-1 text-xs",
              isUser ? "text-right" : "text-left"
            )}
          >
            {formattedTime}
          </span>
        </div>
      </div>
    </div>
  );
}

function AiInput({
  value,
  onChange,
  onSubmit,
  onKeyDown,
}: {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  onSubmit: () => void;
  onKeyDown: (e: React.KeyboardEvent<HTMLTextAreaElement>) => void;
}) {
  const [isListening, setIsListening] = useState(false);
  const [recognition, setRecognition] = useState<SpeechRecognition | null>(
    null
  );
  const [error, setError] = useState<string | null>(null);
  const [audioLevel, setAudioLevel] = useState(0);
  const [isSpeechSupported, setIsSpeechSupported] = useState(false);

  // Check if browser supports speech recognition and is not Brave
  const checkSpeechSupport = () => {
    if (typeof window === "undefined") return false;

    // Check if it's Brave browser
    const isBrave = (navigator as unknown as { brave?: { isBrave: boolean } })
      .brave?.isBrave;
    if (isBrave) return false;

    // Check for speech recognition support
    return "webkitSpeechRecognition" in window || "SpeechRecognition" in window;
  };

  useEffect(() => {
    const speechSupported = checkSpeechSupport();
    setIsSpeechSupported(speechSupported);

    if (speechSupported) {
      const SpeechRecognition =
        window.SpeechRecognition || window.webkitSpeechRecognition;
      const recognitionInstance = new SpeechRecognition();

      recognitionInstance.continuous = true;
      recognitionInstance.interimResults = true;
      recognitionInstance.lang = "en-US";
      recognitionInstance.maxAlternatives = 1; // Normal sensitivity setting

      // Audio level detection callbacks
      recognitionInstance.onaudiostart = () => {
        console.log("Audio capture started");
        setAudioLevel(1);
      };

      recognitionInstance.onaudioend = () => {
        console.log("Audio capture ended");
        setAudioLevel(0);
      };

      recognitionInstance.onspeechstart = () => {
        console.log("Speech detected");
        setAudioLevel(2);
      };

      recognitionInstance.onspeechend = () => {
        console.log("Speech ended");
        setAudioLevel(1);
      };

      recognitionInstance.onresult = (event) => {
        let finalTranscript = "";
        let interimTranscript = "";

        for (let i = 0; i < event.results.length; i++) {
          const result = event.results[i];
          const transcript = result[0].transcript;

          if (result.isFinal) {
            finalTranscript += transcript;
          } else {
            interimTranscript += transcript;
          }
        }

        // Use final transcript when available, otherwise use interim for real-time feedback
        const currentTranscript = finalTranscript || interimTranscript;

        if (currentTranscript.trim()) {
          // Create a synthetic event to match the expected type
          const syntheticEvent = {
            target: { value: currentTranscript },
            currentTarget: { value: currentTranscript },
          } as React.ChangeEvent<HTMLTextAreaElement>;

          onChange(syntheticEvent);
        }
      };

      recognitionInstance.onerror = (event) => {
        console.error("Speech recognition error:", event.error);
        setIsListening(false);

        let errorMessage = "";
        switch (event.error) {
          case "network":
            errorMessage =
              "Network error: Please check your internet connection and try again.";
            break;
          case "not-allowed":
            errorMessage =
              "Microphone access denied. Please allow microphone permissions.";
            break;
          case "no-speech":
            errorMessage = "No speech detected. Please try speaking again.";
            break;
          case "audio-capture":
            errorMessage =
              "Audio capture failed. Please check your microphone.";
            break;
          case "service-not-allowed":
            errorMessage =
              "Speech recognition service not allowed. Try using HTTPS.";
            break;
          default:
            errorMessage = `Speech recognition error: ${event.error}`;
        }

        setError(errorMessage);
        setTimeout(() => setError(null), 5000); // Clear error after 5 seconds
      };

      recognitionInstance.onend = () => {
        setIsListening(false);
      };

      setRecognition(recognitionInstance);
    }
  }, [onChange]);

  // Don't render microphone button if speech is not supported
  if (!isSpeechSupported) {
    return (
      <div className="space-y-2">
        {error && (
          <div className="text-xs text-red-500 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
            {error}
          </div>
        )}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            onSubmit();
          }}
          className="flex space-x-2"
        >
          <TextareaAutosize
            id="ai-input-06"
            placeholder="Type your message..."
            className={cn(
              "bg-muted/50 text-foreground ring-primary/20 placeholder:text-muted-foreground/70 flex-1 resize-none rounded-3xl border-none py-2.5 pr-12 pl-4 leading-[1.2] text-wrap text-sm",
              "focus:ring-primary/30 min-h-[40px] transition-all duration-200 focus:ring-2 focus:outline-none"
            )}
            minRows={1}
            maxRows={6}
            value={value}
            onKeyDown={onKeyDown}
            onChange={onChange}
          />
          <Button
            type="submit"
            size="icon"
            variant="outline"
            className="hover:bg-primary/40"
            disabled={!value.trim()}
          >
            <CornerRightUp className="h-4 w-4 text-primary" />
          </Button>
        </form>
      </div>
    );
  }

  const toggleListening = () => {
    if (!recognition) {
      setError("Speech recognition is not supported in your browser.");
      setTimeout(() => setError(null), 3000);
      return;
    }

    if (isListening) {
      recognition.stop();
      setIsListening(false);
    } else {
      setError(null); // Clear any previous errors
      try {
        recognition.start();
        setIsListening(true);
      } catch {
        setError("Failed to start speech recognition. Please try again.");
        setTimeout(() => setError(null), 3000);
      }
    }
  };
  return (
    <div className="space-y-2">
      {error && (
        <div className="text-xs text-red-500 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
          {error}
        </div>
      )}

      {/* Audio Level Indicator */}
      {isListening && (
        <div className="flex items-center justify-center space-x-1 text-xs text-muted-foreground">
          <span>Listening...</span>
          <div className="flex space-x-1">
            <div
              className={cn(
                "w-1 h-3 rounded-full transition-colors",
                audioLevel >= 1 ? "bg-green-500" : "bg-gray-300"
              )}
            />
            <div
              className={cn(
                "w-1 h-3 rounded-full transition-colors",
                audioLevel >= 2 ? "bg-yellow-500" : "bg-gray-300"
              )}
            />
            <div
              className={cn(
                "w-1 h-3 rounded-full transition-colors",
                audioLevel >= 3 ? "bg-red-500" : "bg-gray-300"
              )}
            />
          </div>
        </div>
      )}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          onSubmit();
        }}
        className="flex space-x-2"
      >
        <TextareaAutosize
          id="ai-input-06"
          placeholder="Type your message..."
          className={cn(
            "bg-muted/50 text-foreground ring-primary/20 placeholder:text-muted-foreground/70 flex-1 resize-none rounded-3xl border-none py-2.5 pr-12 pl-4 leading-[1.2] text-wrap text-sm",
            "focus:ring-primary/30 min-h-[40px] transition-all duration-200 focus:ring-2 focus:outline-none"
          )}
          minRows={1}
          maxRows={6}
          value={value}
          onKeyDown={onKeyDown}
          onChange={onChange}
        />
        <Button
          type="submit"
          size="icon"
          variant="outline"
          className="hover:bg-primary/90"
          disabled={!value.trim()}
        >
          <CornerRightUp className="h-4 w-4 text-white" />
        </Button>
        <Button
          type="button"
          size="icon"
          variant="outline"
          onClick={toggleListening}
          className={cn(
            "transition-colors relative",
            isListening && "bg-red-500 hover:bg-red-600 text-white"
          )}
          title={`Click to ${isListening ? "stop" : "start"} voice input`}
        >
          {isListening ? (
            <MicOff className="h-4 w-4" />
          ) : (
            <Mic className="h-4 w-4" />
          )}
          {isListening && audioLevel > 0 && (
            <div className="absolute -top-1 -right-1 w-2 h-2 bg-green-400 rounded-full animate-pulse" />
          )}
        </Button>
      </form>
    </div>
  );
}

export default function FloatingChatbot() {
  const startTimeRef = useRef<number>(0);
  const [showChat, setShowChat] = useState(false);
  const [input, setInput] = useState("");

  const { messages, sendMessage, status, error } = useChat();

  const isLoading = status === "submitted" || status === "streaming";

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
  };

  const handleSubmit = useCallback(
    () => {
      if (!input.trim()) return;
      startTimeRef.current = performance.now();
      sendMessage({ text: input });
      setInput("");
    },
    [sendMessage, input]
  );

  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (event.key === "Enter" && !event.shiftKey) {
        event.preventDefault();
        handleSubmit();
      }
    },
    [handleSubmit]
  );

  return (
    <>
      {/* Floating Chat Button */}
      <button
        className="fixed bottom-15 right-6 z-50 bg-foreground text-background rounded-full p-4 shadow-2xl hover:bg-primary/90 transition flex items-center gap-2"
        onClick={() => setShowChat(true)}
        aria-label="Open chat"
      >
        <BotMessageSquare className="h-6 w-6" />
      </button>

      {/* Floating Chatbox */}
      {showChat && (
        <div className="fixed bottom-24 right-6 z-50 w-[88%] xl:w-full xl:max-w-md rounded-xl shadow-2xl border bg-card overflow-hidden flex flex-col">
          <div className="bg-primary p-4 flex justify-between items-center">
            <h1 className="text-primary-foreground text-lg font-semibold">
              AI Helper
            </h1>
            <button
              className="text-primary-foreground hover:text-white text-xl font-bold"
              onClick={() => setShowChat(false)}
              aria-label="Close chat"
            >
              ×
            </button>
          </div>
          <div className="flex h-[400px] flex-col">
            <div className="flex-1 space-y-4 overflow-y-auto p-4">
              {messages.length > 0 ? (
                messages.map((m) => (
                  <ChatBubble
                    key={m.id}
                    message={m.parts
                      .map((part) => (part.type === "text" ? part.text : ""))
                      .join("")}
                    isUser={m.role === "user"}
                    timestamp={new Date()}
                  />
                ))
              ) : (
                <div className="flex h-full flex-col items-center justify-center">
                  <p className="text-muted-foreground mx-auto px-2 text-center text-xl font-semibold tracking-wide md:text-2xl">
                    Start Chatting with
                    <br />
                    <span className="text-primary text-2xl font-bold md:text-4xl">
                      EyeBot
                    </span>
                  </p>
                  <div className="group relative mt-6">
                    <div className="from-primary/30 to-primary/10 absolute -inset-1 rounded-full bg-gradient-to-r opacity-75 blur-md transition-opacity duration-500 group-hover:opacity-100"></div>
                    <Image
                      src="/assets/images/Eyebot.png"
                      alt="AI Assistant"
                      width={120}
                      height={120}
                      className="relative transition-all duration-500 hover:scale-105 active:scale-95"
                    />
                  </div>
                </div>
              )}
              {isLoading && (
                <div className="text-muted-foreground flex items-center space-x-2 text-sm">
                  <div className="flex space-x-1">
                    <div
                      className="bg-muted-foreground/70 h-2 w-2 animate-bounce rounded-full"
                      style={{ animationDelay: "0ms" }}
                    ></div>
                    <div
                      className="bg-muted-foreground/70 h-2 w-2 animate-bounce rounded-full"
                      style={{ animationDelay: "150ms" }}
                    ></div>
                    <div
                      className="bg-muted-foreground/70 h-2 w-2 animate-bounce rounded-full"
                      style={{ animationDelay: "300ms" }}
                    ></div>
                  </div>
                  <span>AI is typing...</span>
                </div>
              )}
              {error && (
                <div className="border-destructive/20 bg-destructive/10 text-destructive mx-auto w-fit rounded-lg border p-3">
                  {/*Something went wrong! Please try again.*/}
                  only works in local for now
                </div>
              )}
            </div>
            <div className="border-border border-t p-4">
              <AiInput
                value={input}
                onChange={handleInputChange}
                onSubmit={handleSubmit}
                onKeyDown={handleKeyDown}
              />
            </div>
          </div>
        </div>
      )}
    </>
  );
}
