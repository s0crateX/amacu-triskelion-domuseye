"use client";

import { LoaderIcon, SparklesIcon } from "@/app/icons";
import { useCompletion } from "@ai-sdk/react";
import { useState } from "react";
import TextareaAutosize from "react-textarea-autosize";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

interface DescriptionMakerProps {
  onDescriptionGenerated?: (description: string) => void;
}

export default function DescriptionMaker({
  onDescriptionGenerated,
}: DescriptionMakerProps) {
  const [text, setText] = useState("");

  const {
    completion,
    input,
    isLoading,
    handleInputChange,
    handleSubmit,
    setInput,
  } = useCompletion({
    api: "/api/completion",
    body: { text },
    onFinish: (prompt, completion) => setText(completion.trim()),
    onError: (error) => toast.error(error.message),
  });

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
            value={
              isLoading && completion.length > 0 ? completion.trim() : text
            }
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

          <div className="flex items-center gap-2">
            <input
              className="flex-1 bg-transparent border-0 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-0 text-sm"
              placeholder="(e.g., make it more professional,)"
              onChange={handleInputChange}
              value={input}
              aria-label="Enhancement prompt"
              required
            />

            <button
              aria-label="Generate description"
              type="button"
              disabled={isLoading}
              onClick={(e) => {
                e.preventDefault();
                handleSubmit(e as React.FormEvent<HTMLButtonElement>);
                setInput("");
              }}
              className="inline-flex items-center gap-1 px-3 py-1.5 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:from-gray-400 disabled:to-gray-500 text-white font-medium rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-70 transform hover:scale-105 active:scale-95 text-xs"
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
          <div className="flex justify-center pt-1">
            <Button
              type="button"
              onClick={() => onDescriptionGenerated(text)}
              className="bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white px-3 py-1.5 rounded-lg font-medium transition-all duration-200 shadow-md hover:shadow-lg text-xs"
            >
              <SparklesIcon />
              Apply Description
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
