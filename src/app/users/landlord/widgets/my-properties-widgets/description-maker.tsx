"use client";

import { useState } from "react";
import { toast } from "sonner";
import TextareaAutosize from "react-textarea-autosize";
import { Button } from "@/components/ui/button";

const SparklesIcon = () => (
  <svg
    className="w-4 h-4 text-yellow-500"
    fill="currentColor"
    viewBox="0 0 20 20"
  >
    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
  </svg>
);

const LoaderIcon = () => (
  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
    <circle
      className="opacity-25"
      cx="12"
      cy="12"
      r="10"
      stroke="currentColor"
      strokeWidth="4"
      fill="none"
    />
    <path
      className="opacity-75"
      fill="currentColor"
      d="m4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
    />
  </svg>
);

interface DescriptionMakerProps {
  onDescriptionGenerated?: (description: string) => void;
}

export default function DescriptionMaker({
  onDescriptionGenerated,
}: DescriptionMakerProps) {
  const [text, setText] = useState("");
  const [enhancementPrompt, setEnhancementPrompt] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  return (
    <div className="w-full max-w-xl mx-auto">
      <div className="space-y-3">
        <div className="bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 border border-blue-600 dark:border-blue-600 rounded-lg p-2 shadow-sm shadow-blue-100/10 transition-all duration-1000 hover:shadow-md hover:shadow-blue-200/30">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-xs font-medium text-gray-700 dark:text-gray-300">
              Property Description Generator
            </span>
          </div>
          <TextareaAutosize
            value={text}
            onChange={(e) => {
              if (!isLoading) setText(e.target.value);
            }}
            placeholder="Enter your basic property description here to improve it with AI..."
            className="w-full bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg p-2 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 shadow-sm text-sm"
            minRows={2}
            maxRows={4}
          />
        </div>

        {/* Enhancement Input Section */}
        <div className="bg-white dark:bg-gray-900 border border-blue-600 dark:border-blue-600 rounded-lg p-2 shadow-sm shadow-blue-100/10 transition-all duration-1000 hover:shadow-md hover:shadow-blue-200/30">
          <div className="flex items-center gap-2 mb-2">
            <SparklesIcon />
            <span className="text-xs font-medium text-gray-700 dark:text-gray-300">
              Enhancement Prompt
            </span>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center gap-2">
            <input
              className="flex-1 bg-transparent border-0 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-0 text-sm"
              placeholder="(e.g., make it more professional,)"
              onChange={(e) => setEnhancementPrompt(e.target.value)}
              value={enhancementPrompt}
              aria-label="Enhancement prompt"
              required
            />

            <button
              aria-label="Generate description"
              type="button"
              disabled={isLoading || !text.trim() || !enhancementPrompt.trim()}
              onClick={async (e) => {
                e.preventDefault();
                if (!text.trim() || !enhancementPrompt.trim()) return;

                setIsLoading(true);
                try {
                  const response = await fetch("/api/completion", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                      text: text.trim(),
                      prompt: enhancementPrompt.trim(),
                    }),
                  });

                  if (!response.ok)
                    throw new Error("Failed to generate description");

                  const result = await response.text();
                  setText(result.trim());
                  setEnhancementPrompt("");
                } catch (error) {
                  toast.error(
                    error instanceof Error ? error.message : "Failed to generate description"
                  );
                } finally {
                  setIsLoading(false);
                }
              }}
              className="inline-flex items-center justify-center gap-1 px-3 py-1.5 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:from-gray-400 disabled:to-gray-500 text-white font-medium rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-70 transform hover:scale-105 active:scale-95 text-xs w-full sm:w-auto"
            >
              {isLoading ? (
                <>
                  <LoaderIcon />
                  <span className="text-sm">Generating</span>
                </>
              ) : (
                <>
                  <SparklesIcon />
                  <span className="text-sm">Generate</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Apply Description Button */}
        {text && onDescriptionGenerated && (
          <Button
            onClick={() => {
              onDescriptionGenerated(text.trim());
              setText("");
              setEnhancementPrompt("");
            }}
            className="w-full bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200"
          >
            Apply Description
          </Button>
        )}
      </div>
    </div>
  );
}
