"use client";
import { Bot, CornerRightUp, BotMessageSquare, User, Mic } from "lucide-react";
import { useCallback, useRef, useState } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { useAutoResizeTextarea } from "@/hooks/use-auto-resize-textarea";
import { cn } from "@/lib/utils";

import { useChat } from "ai/react";
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
  const { textareaRef, adjustHeight } = useAutoResizeTextarea({
    minHeight: 50,
    maxHeight: 200,
  });

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit();
      }}
      className="flex space-x-2"
    >
      <Textarea
        ref={textareaRef}
        id="ai-input-06"
        placeholder="Type your message..."
        className={cn(
          "bg-muted/50 text-foreground ring-primary/20 placeholder:text-muted-foreground/70 flex-1 resize-none rounded-3xl border-none py-4 pr-12 pl-6 leading-[1.2] text-wrap",
          "focus:ring-primary/30 min-h-[56px] transition-all duration-200 focus:ring-2"
        )}
        value={value}
        onKeyDown={onKeyDown}
        onChange={(e) => {
          onChange(e);
          adjustHeight();
        }}
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
      <Button type="button" size="icon" variant="outline">
        <Mic className="h-4 w-4" />
      </Button>
    </form>
  );
}

export default function FloatingChatbot() {
  const startTimeRef = useRef<number>(0);
  const [showChat, setShowChat] = useState(false);

  const {
    messages,
    input,
    handleInputChange,
    handleSubmit: originalHandleSubmit,
    status,
    error,
  } = useChat({
    initialMessages: [],
    api: "/api/chat",
  });

  const isLoading = status === "submitted" || status === "streaming";

  const handleSubmit = useCallback(
    (e?: React.FormEvent) => {
      if (!input.trim()) return;
      startTimeRef.current = performance.now();
      originalHandleSubmit(e);
    },
    [originalHandleSubmit, input]
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
                    message={m.content}
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
                    <img
                      src="https://blocks.mvp-subha.me/assets/robo.svg"
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
