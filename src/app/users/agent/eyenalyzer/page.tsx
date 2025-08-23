"use client";

import { useState, useRef } from "react";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import Image from "next/image";

export default function MultiModalChatPage() {
  const [files, setFiles] = useState<FileList | undefined>(undefined);
  const [matchingFiles, setMatchingFiles] = useState<FileList | undefined>(
    undefined
  );
  const fileInputRef = useRef<HTMLInputElement>(null);
  const matchingFileInputRef = useRef<HTMLInputElement>(null);

  // Separate chat instances for analyze and content matching
  const analyzeChat = useChat({
    transport: new DefaultChatTransport({
      api: "/api/multi-modal-chat",
    }),
  });

  const matchingChat = useChat({
    transport: new DefaultChatTransport({
      api: "/api/multi-modal-chat",
    }),
  });

  // Combine messages from both chats for display
  const allMessages = [...analyzeChat.messages, ...matchingChat.messages];
  const hasError = analyzeChat.error || matchingChat.error;
  const errorMessage =
    analyzeChat.error?.message || matchingChat.error?.message;

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (files && files.length > 0) {
      analyzeChat.sendMessage({ text: "Analyze Output", files });
      setFiles(undefined);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleMatchingSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (matchingFiles && matchingFiles.length === 2) {
      matchingChat.sendMessage({
        text: "Matching",
        files: matchingFiles,
      });
      setMatchingFiles(undefined);
      if (matchingFileInputRef.current) {
        matchingFileInputRef.current.value = "";
      }
    }
  };

  return (
    <div className="flex flex-col lg:flex-row h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      {/* Centered Container */}
      <div className="flex flex-col lg:flex-row max-w-6xl mx-auto w-full h-full px-2 lg:px-4">
        {/* Left Sidebar - PDF Analyzer */}
        <div className="w-full lg:w-80 bg-white dark:bg-slate-800 shadow-lg border-b lg:border-b-0 lg:border-r border-slate-200 dark:border-slate-700 flex flex-col max-h-[50vh] lg:max-h-none overflow-y-auto lg:overflow-visible">
          {/* Header */}
          <div className="p-3 lg:p-4 border-b border-slate-200 dark:border-slate-700 flex-shrink-0 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-slate-800 dark:to-slate-700">
            <div className="flex items-center mb-2">
              <h1 className="text-lg lg:text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                Eyenalyzer
              </h1>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-400 ml-10">
              Upload a PDF file to get an instant AI-powered analysis
            </p>
          </div>

          {/* Upload Section */}
          <div className="p-3 lg:p-4 border-b border-slate-200 dark:border-slate-700 flex-shrink-0">
            <div className="mb-3">
              <h3 className="text-base font-semibold text-slate-800 dark:text-white mb-1 flex items-center">
                <span className="w-1.5 h-1.5 bg-green-500 rounded-full mr-2 animate-pulse"></span>
                📄 PDF Analysis
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Powered by advanced AI technology
              </p>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="relative">
                <label
                  htmlFor="file-upload"
                  className={`flex flex-col items-center justify-center w-full h-24 border-2 border-dashed rounded-lg cursor-pointer transition-all duration-200 ${
                    files?.length
                      ? "border-green-400 bg-green-50 dark:bg-green-900/20 dark:border-green-500"
                      : "border-slate-300 dark:border-slate-600 hover:border-slate-400 dark:hover:border-slate-500 bg-slate-50 dark:bg-slate-700/50"
                  }`}
                >
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    {files?.length ? (
                      <>
                        <svg
                          className="w-8 h-8 mb-2 text-green-500"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                            clipRule="evenodd"
                          />
                        </svg>
                        <p className="text-sm font-medium text-green-600 dark:text-green-400">
                          {files.length} file{files.length > 1 ? "s" : ""}{" "}
                          selected
                        </p>
                        <p className="text-xs text-green-500 dark:text-green-400">
                          Ready to analyze
                        </p>
                      </>
                    ) : (
                      <>
                        <svg
                          className="w-8 h-8 mb-2 text-slate-400"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                          />
                        </svg>
                        <p className="mb-1 text-sm font-medium text-slate-600 dark:text-slate-300">
                          Click to upload PDF
                        </p>
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                          Drag and drop or browse files
                        </p>
                      </>
                    )}
                  </div>
                </label>
                <input
                  id="file-upload"
                  type="file"
                  className="hidden"
                  accept=".pdf,application/pdf"
                  onChange={(event) => {
                    if (event.target.files) {
                      setFiles(event.target.files);
                    }
                  }}
                  ref={fileInputRef}
                />
              </div>

              {/* Analyze Button */}
              <div className="flex justify-center">
                {analyzeChat.status === "submitted" ||
                analyzeChat.status === "streaming" ? (
                  <button
                    type="button"
                    onClick={analyzeChat.stop}
                    className="flex items-center gap-2 bg-red-500 hover:bg-red-600 text-white px-6 py-3 rounded-lg font-medium transition-colors shadow-lg"
                  >
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                    Stop Analysis
                  </button>
                ) : (
                  <button
                    type="submit"
                    className="flex items-center gap-2 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white px-6 py-2 rounded-lg font-medium transition-all duration-200 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:from-green-500 disabled:hover:to-emerald-500"
                    disabled={
                      analyzeChat.status !== "ready" ||
                      !files ||
                      files.length === 0
                    }
                  >
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"
                      />
                    </svg>
                    Analyze PDF
                  </button>
                )}
              </div>
            </form>
          </div>

          {/* Content Matching Section */}
          <div className="p-3 lg:p-4 border-b border-slate-200 dark:border-slate-700 flex-shrink-0 bg-gradient-to-r from-blue-100 to-blue-50 dark:from-slate-800 dark:to-slate-700">
            <div className="mb-3">
              <h3 className="text-base font-semibold text-slate-800 dark:text-white mb-1 flex items-center">
                <span className="w-1.5 h-1.5 bg-purple-500 rounded-full mr-2 animate-pulse"></span>
                🔍 Content Matching
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">
                AI-powered content comparison
              </p>
              <p className="text-xs text-slate-600 dark:text-slate-400">
                Upload exactly 2 files: one image and one PDF to match their
                content
              </p>
            </div>

            <form onSubmit={handleMatchingSubmit} className="space-y-4">
              <div className="relative">
                <label
                  htmlFor="matching-file-upload"
                  className={`flex flex-col items-center justify-center w-full h-24 border-2 border-dashed rounded-lg cursor-pointer transition-all duration-200 ${
                    matchingFiles?.length
                      ? "border-purple-400 bg-purple-50 dark:bg-purple-900/20 dark:border-purple-500"
                      : "border-slate-300 dark:border-slate-600 hover:border-slate-400 dark:hover:border-slate-500 bg-slate-50 dark:bg-slate-700/50"
                  }`}
                >
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    {matchingFiles?.length ? (
                      <>
                        <svg
                          className="w-8 h-8 mb-2 text-purple-500"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                            clipRule="evenodd"
                          />
                        </svg>
                        <p className="text-sm font-medium text-purple-600 dark:text-purple-400">
                          {matchingFiles.length} of 2 files selected
                        </p>
                        <p className="text-xs text-purple-500 dark:text-purple-400">
                          {matchingFiles.length === 2
                            ? "Ready to match content"
                            : "Need 2 files total"}
                        </p>
                      </>
                    ) : (
                      <>
                        <svg
                          className="w-8 h-8 mb-2 text-slate-400"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                          />
                        </svg>
                        <p className="mb-1 text-sm font-medium text-slate-600 dark:text-slate-300">
                          Upload 1 Image + 1 PDF
                        </p>
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                          Exactly 2 files for content matching
                        </p>
                      </>
                    )}
                  </div>
                </label>
                <input
                  id="matching-file-upload"
                  type="file"
                  className="hidden"
                  accept=".pdf,.jpg,.jpeg,.png,.gif,.bmp,.webp,application/pdf,image/*"
                  onChange={(event) => {
                    if (event.target.files && event.target.files.length <= 2) {
                      setMatchingFiles(event.target.files);
                    }
                  }}
                  multiple
                  ref={matchingFileInputRef}
                />
              </div>

              {/* Match Content Button */}
              <div className="flex justify-center">
                {matchingChat.status === "submitted" ||
                matchingChat.status === "streaming" ? (
                  <button
                    type="button"
                    onClick={matchingChat.stop}
                    className="flex items-center gap-2 bg-red-500 hover:bg-red-600 text-white px-6 py-3 rounded-lg font-medium transition-colors shadow-lg"
                  >
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                    Stop Matching
                  </button>
                ) : (
                  <button
                    type="submit"
                    className="flex items-center gap-2 bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-600 hover:to-indigo-600 text-white px-6 py-2 rounded-lg font-medium transition-all duration-200 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:from-purple-500 disabled:hover:to-indigo-500"
                    disabled={
                      matchingChat.status !== "ready" ||
                      !matchingFiles ||
                      matchingFiles.length !== 2
                    }
                  >
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2h2a2 2 0 002-2z"
                      />
                    </svg>
                    Match Content
                  </button>
                )}
              </div>
            </form>
          </div>

          {/* Error Display */}
          {hasError && (
            <div className="p-3 lg:p-4 border-b border-slate-200 dark:border-slate-700 flex-shrink-0">
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
                <div className="flex items-center gap-2">
                  <svg
                    className="w-5 h-5 text-red-500"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <span className="text-sm font-medium text-red-800 dark:text-red-200">
                    Error
                  </span>
                </div>
                <p className="text-sm text-red-700 dark:text-red-300 mt-1">
                  {errorMessage}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Right Content Area - Analysis Results */}
        <div className="flex-1 flex flex-col min-h-0 bg-white dark:bg-slate-800 shadow-lg">
          <div className="p-3 lg:p-4 border-b border-slate-200 dark:border-slate-700 bg-gradient-to-r from-slate-50 to-blue-50 dark:from-slate-800 dark:to-slate-700 flex-shrink-0">
            <div className="flex items-center mb-2">
              <h2 className="text-lg lg:text-xl font-bold bg-gradient-to-r from-slate-800 to-blue-600 bg-clip-text text-transparent dark:from-white dark:to-blue-400">
                Analysis Results
              </h2>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-400 ml-10">
              Your AI-powered analysis will appear here
            </p>
          </div>

          <div className="flex-1 overflow-y-auto p-3 lg:p-4 space-y-3 lg:space-y-4 min-h-0">
            {allMessages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center">
                <div className="relative mb-4">
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-indigo-100 dark:from-slate-700 dark:to-slate-600 rounded-full flex items-center justify-center shadow-lg">
                    <div className="w-12 h-12 rounded-full overflow-hidden bg-white shadow-md">
                      <Image
                        src="/assets/images/Eyebot.png"
                        alt="Eyebot AI"
                        width={48}
                        height={48}
                        className="object-cover"
                      />
                    </div>
                  </div>
                  <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full flex items-center justify-center">
                    <div className="w-1.5 h-1.5 bg-white rounded-full animate-pulse"></div>
                  </div>
                </div>
                <h3 className="text-lg font-semibold bg-gradient-to-r from-slate-700 to-blue-600 bg-clip-text text-transparent dark:from-slate-200 dark:to-blue-400 mb-2">
                  Ready for Analysis
                </h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 max-w-md leading-relaxed">
                  Upload a PDF file using the panel on the left to get started
                  with AI-powered analysis and insights.
                </p>
                <div className="mt-4 flex items-center gap-1 text-sm text-slate-400">
                  <div className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce"></div>
                  <div
                    className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce"
                    style={{ animationDelay: "0.1s" }}
                  ></div>
                  <div
                    className="w-1.5 h-1.5 bg-purple-400 rounded-full animate-bounce"
                    style={{ animationDelay: "0.2s" }}
                  ></div>
                </div>
              </div>
            ) : (
              allMessages.map((message) => (
                <div
                  key={message.id}
                  className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden"
                >
                  <div
                    className={`px-4 py-3 border-b border-slate-200 dark:border-slate-700 ${
                      message.role === "user"
                        ? "bg-blue-50 dark:bg-blue-900/20"
                        : "bg-green-50 dark:bg-green-900/20"
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      {message.role === "user" ? (
                        <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                          <svg
                            className="w-4 h-4 text-white"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path
                              fillRule="evenodd"
                              d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
                              clipRule="evenodd"
                            />
                          </svg>
                        </div>
                      ) : (
                        <div className="w-5 h-5 rounded-full overflow-hidden bg-white shadow-md">
                          <Image
                            src="/assets/images/Eyebot.png"
                            alt="Eyebot AI"
                            width={20}
                            height={20}
                            className="object-cover"
                          />
                        </div>
                      )}
                      <span className="font-medium text-slate-700 dark:text-slate-200">
                        {message.role === "user"
                          ? "Your Upload"
                          : "Eyebot Analysis"}
                      </span>
                    </div>
                  </div>
                  <div className="p-4">
                    {message.parts.map((part, index) => {
                      switch (part.type) {
                        case "text":
                          return (
                            <div
                              key={`${message.id}-${index}`}
                              className="prose prose-slate dark:prose-invert max-w-none whitespace-pre-wrap text-slate-700 dark:text-slate-300"
                            >
                              {part.text}
                            </div>
                          );
                        case "file":
                          if (part.mediaType?.startsWith("image/")) {
                            return (
                              <div
                                key={`${message.id}-${index}`}
                                className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-700 rounded-lg border border-slate-200 dark:border-slate-600"
                              >
                                <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                                  <svg
                                    className="w-6 h-6 text-blue-600 dark:text-blue-400"
                                    fill="currentColor"
                                    viewBox="0 0 20 20"
                                  >
                                    <path
                                      fillRule="evenodd"
                                      d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z"
                                      clipRule="evenodd"
                                    />
                                  </svg>
                                </div>
                                <div>
                                  <p className="font-medium text-slate-700 dark:text-slate-200">
                                    {part.filename ?? `Image ${index + 1}`}
                                  </p>
                                  <p className="text-sm text-slate-500 dark:text-slate-400">
                                    Image file uploaded for analysis
                                  </p>
                                </div>
                              </div>
                            );
                          }
                          if (part.mediaType?.startsWith("application/pdf")) {
                            return (
                              <div
                                key={`${message.id}-${index}`}
                                className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-700 rounded-lg border border-slate-200 dark:border-slate-600"
                              >
                                <div className="w-10 h-10 bg-red-100 dark:bg-red-900/30 rounded-lg flex items-center justify-center">
                                  <svg
                                    className="w-6 h-6 text-red-600 dark:text-red-400"
                                    fill="currentColor"
                                    viewBox="0 0 20 20"
                                  >
                                    <path
                                      fillRule="evenodd"
                                      d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z"
                                      clipRule="evenodd"
                                    />
                                  </svg>
                                </div>
                                <div>
                                  <p className="font-medium text-slate-700 dark:text-slate-200">
                                    {part.filename ??
                                      `PDF Document ${index + 1}`}
                                  </p>
                                  <p className="text-sm text-slate-500 dark:text-slate-400">
                                    PDF file uploaded for analysis
                                  </p>
                                </div>
                              </div>
                            );
                          }
                        default:
                          return null;
                      }
                    })}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
