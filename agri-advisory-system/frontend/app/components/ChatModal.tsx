'use client';

import React, { useState } from 'react';

interface Message {
  sender: 'user' | 'bot';
  text: string;
}

interface ChatModalProps {
  isOpen: boolean;
  onClose: () => void;
  darkMode?: boolean;
  externalMessages?: Message[];
  externalInputQuery?: string;
  setInputQuery?: (val: string) => void;
  onSendMessage?: (e: React.FormEvent) => void;
  isFullPage?: boolean; // Allows it to act as both a modal or a full-page view
}

export default function ChatModal({
  isOpen,
  onClose,
  darkMode = false,
  externalMessages,
  externalInputQuery,
  setInputQuery: externalSetInputQuery,
  onSendMessage: externalOnSendMessage,
  isFullPage = false,
}: ChatModalProps) {
  // Internal fallback state if used standalone without external page bindings
  const [internalMessages, setInternalMessages] = useState<Message[]>([
    { sender: 'bot', text: 'Hello! I am your Agri-Advisory AI Assistant. Ask me about live market valuations, weather hazards, or crop disease management.' }
  ]);
  const [internalInputVal, setInternalInputVal] = useState('');

  // Use external props if supplied, otherwise fall back to internal states
  const messages = externalMessages || internalMessages;
  const inputQuery = externalInputQuery !== undefined ? externalInputQuery : internalInputVal;
  const setInputQuery = externalSetInputQuery || setInternalInputVal;

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputQuery.trim()) return;

    if (externalOnSendMessage) {
      externalOnSendMessage(e);
    } else {
      // Default local behavior if no external handler is passed
      const userText = inputQuery;
      const newMessages: Message[] = [...messages, { sender: 'user', text: userText }];
      setInternalMessages(newMessages);
      setInternalInputVal('');

      setTimeout(() => {
        setInternalMessages([
          ...newMessages,
          { sender: 'bot', text: `Analyzing agricultural data regarding "${userText}"... Market benchmarks indicate stable rates across regional mandis.` }
        ]);
      }, 600);
    }
  };

  if (!isOpen) return null;

  // Layout wrapper changes dynamically based on whether it's a modal overlay or a full-page view
  const containerStyle = isFullPage
    ? "fixed inset-0 z-50 bg-white dark:bg-gray-900 flex flex-col"
    : "fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center p-4 backdrop-blur-sm";

  const windowStyle = isFullPage
    ? `w-full h-full flex flex-col ${darkMode ? 'bg-gray-900 text-white' : 'bg-white text-gray-900'}`
    : `${darkMode ? 'bg-gray-800 text-white border-gray-700' : 'bg-white text-gray-900 border-green-100'} w-full max-w-4xl h-[80vh] rounded-2xl border shadow-2xl flex flex-col p-6 animate-in fade-in zoom-in-95 duration-200`;

  return (
    <div className={containerStyle}>
      <div className={windowStyle}>
        
        {/* Header */}
        <div className={`border-b ${darkMode ? 'border-gray-700' : 'border-gray-200'} pb-4 mb-4 flex justify-between items-center ${isFullPage ? 'px-6 pt-6 bg-green-700 text-white' : ''}`}>
          <div>
            <h2 className="text-xl font-bold flex items-center gap-2">
              🤖 {isFullPage ? 'Agri-Advisory Full-Page Assistant' : 'Multilingual Agricultural Assistant'}
            </h2>
            <p className={`text-xs ${isFullPage ? 'text-green-200' : 'text-gray-500'} mt-0.5`}>
              Ask questions regarding crops, pests, fertilizers, or mandi pricing.
            </p>
          </div>
          <button
            onClick={onClose}
            className={
              isFullPage
                ? "bg-green-800 hover:bg-green-900 text-white px-4 py-2 rounded-xl text-sm font-semibold transition"
                : "bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 w-9 h-9 rounded-full font-bold flex items-center justify-center transition"
            }
          >
            {isFullPage ? 'Close Full Page' : '✕'}
          </button>
        </div>

        {/* Chat Messages */}
        <div className={`flex-1 overflow-y-auto space-y-4 pr-2 mb-4 ${isFullPage ? 'px-6 bg-slate-50 dark:bg-gray-950 py-4' : ''}`}>
          {messages.map((msg, index) => (
            <div key={index} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[80%] p-4 rounded-2xl text-sm leading-relaxed ${
                msg.sender === 'user' 
                  ? 'bg-green-600 text-white rounded-br-none shadow-sm' 
                  : darkMode ? 'bg-gray-700 text-gray-200 rounded-bl-none' : 'bg-gray-100 text-gray-800 rounded-bl-none border'
              }`}>
                {msg.text}
              </div>
            </div>
          ))}
        </div>

        {/* Chat Input Form */}
        <form onSubmit={handleSendMessage} className={`flex gap-3 pt-3 border-t ${darkMode ? 'border-gray-700 bg-gray-800' : 'border-gray-200 bg-white'} ${isFullPage ? 'p-6' : ''}`}>
          <input
            type="text"
            value={inputQuery}
            onChange={(e) => setInputQuery(e.target.value)}
            placeholder="Type your agricultural question here..."
            className={`flex-1 px-4 py-3 rounded-xl border ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'border-gray-300 bg-gray-50'} focus:outline-none focus:ring-2 focus:ring-green-500`}
            autoFocus
          />
          <button
            type="submit"
            className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-xl font-semibold transition shadow-md"
          >
            Send
          </button>
        </form>

      </div>
    </div>
  );
}