// AI Assistant Panel Component
// Visual interface for the AI assistant with chat-like interactions

import React, { useState, useRef, useEffect } from 'react';
import { useAIAssistant, AIMessageType } from '../../lib/ai/POSAIAssistant';
import { eventBus } from '../../lib/core/EventBus';

interface AIAssistantPanelProps {
  isOpen: boolean;
  onClose: () => void;
  className?: string;
}

const AIAssistantPanel: React.FC<AIAssistantPanelProps> = ({
  isOpen,
  onClose,
  className = ''
}) => {
  const {
    messages,
    isListening,
    status,
    sendMessage,
    startListening,
    stopListening,
    clearMessages
  } = useAIAssistant();

  const [inputValue, setInputValue] = useState('');
  const [isMinimized, setIsMinimized] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Focus input when panel opens
  useEffect(() => {
    if (isOpen && !isMinimized && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen, isMinimized]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = () => {
    if (inputValue.trim()) {
      sendMessage(inputValue.trim());
      setInputValue('');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleVoiceToggle = () => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  };

  const getMessageIcon = (type: AIMessageType) => {
    switch (type) {
      case AIMessageType.SUGGESTION: return '💡';
      case AIMessageType.WARNING: return '⚠️';
      case AIMessageType.CONFIRMATION: return '✅';
      case AIMessageType.QUESTION: return '❓';
      case AIMessageType.INFORMATION: return 'ℹ️';
      case AIMessageType.ERROR: return '❌';
      case AIMessageType.SUCCESS: return '🎉';
      default: return '🤖';
    }
  };

  const getMessageColor = (type: AIMessageType) => {
    switch (type) {
      case AIMessageType.SUGGESTION: return 'text-blue-600 bg-blue-50 border-blue-200';
      case AIMessageType.WARNING: return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case AIMessageType.CONFIRMATION: return 'text-green-600 bg-green-50 border-green-200';
      case AIMessageType.QUESTION: return 'text-purple-600 bg-purple-50 border-purple-200';
      case AIMessageType.INFORMATION: return 'text-gray-600 bg-gray-50 border-gray-200';
      case AIMessageType.ERROR: return 'text-red-600 bg-red-50 border-red-200';
      case AIMessageType.SUCCESS: return 'text-green-600 bg-green-50 border-green-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'border-l-4 border-red-500';
      case 'high': return 'border-l-4 border-orange-500';
      case 'medium': return 'border-l-4 border-yellow-500';
      case 'low': return 'border-l-4 border-gray-300';
      default: return '';
    }
  };

  if (!isOpen) return null;

  return (
    <div className={`fixed top-4 right-4 w-96 bg-white rounded-lg shadow-2xl border border-gray-200 z-50 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-t-lg">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
            <span className="text-lg">🤖</span>
          </div>
          <div>
            <h3 className="font-semibold">AI Assistant</h3>
            <p className="text-sm opacity-90 capitalize">{status.mode} Mode</p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          {/* Status Indicators */}
          {status.voiceEnabled && (
            <button
              onClick={handleVoiceToggle}
              className={`p-2 rounded-full transition-colors duration-200 ${
                isListening
                  ? 'bg-red-500 hover:bg-red-600 text-white animate-pulse'
                  : 'bg-white bg-opacity-20 hover:bg-opacity-30 text-white'
              }`}
              title={isListening ? 'Stop Listening' : 'Start Voice Commands'}
            >
              <span className="text-sm">{isListening ? '🎤' : '🎙️'}</span>
            </button>
          )}

          <button
            onClick={() => setIsMinimized(!isMinimized)}
            className="p-2 bg-white bg-opacity-20 hover:bg-opacity-30 rounded-full transition-colors duration-200"
            title={isMinimized ? 'Maximize' : 'Minimize'}
          >
            <span className="text-sm">{isMinimized ? '⬆️' : '⬇️'}</span>
          </button>

          <button
            onClick={onClose}
            className="p-2 bg-white bg-opacity-20 hover:bg-opacity-30 rounded-full transition-colors duration-200"
            title="Close"
          >
            <span className="text-sm">✕</span>
          </button>
        </div>
      </div>

      {/* Content */}
      {!isMinimized && (
        <>
          {/* Messages */}
          <div className="flex-1 max-h-96 overflow-y-auto p-4 space-y-3">
            {messages.length === 0 ? (
              <div className="text-center text-gray-500 py-8">
                <div className="text-4xl mb-4">👋</div>
                <p className="font-medium">Hi! I&apos;m your AI assistant.</p>
                <p className="text-sm mt-2">
                  Try saying &quot;add milk&quot; or &quot;apply discount&quot; to get started!
                </p>
                <div className="mt-4 flex flex-wrap justify-center gap-2">
                  <button
                    onClick={() => sendMessage('help')}
                    className="px-3 py-1 bg-blue-100 text-blue-600 rounded-full text-sm hover:bg-blue-200 transition-colors"
                  >
                    Show Help
                  </button>
                  <button
                    onClick={() => sendMessage('scan mode')}
                    className="px-3 py-1 bg-green-100 text-green-600 rounded-full text-sm hover:bg-green-200 transition-colors"
                  >
                    Enable Scan Mode
                  </button>
                  <button
                    onClick={() => sendMessage('customer lookup')}
                    className="px-3 py-1 bg-purple-100 text-purple-600 rounded-full text-sm hover:bg-purple-200 transition-colors"
                  >
                    Find Customer
                  </button>
                </div>
              </div>
            ) : (
              messages.map((message) => (
                <div
                  key={message.id}
                  className={`p-3 rounded-lg border ${getMessageColor(message.type)} ${getPriorityColor(message.priority)}`}
                >
                  <div className="flex items-start space-x-3">
                    <span className="text-lg flex-shrink-0">
                      {getMessageIcon(message.type)}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm leading-relaxed">{message.content}</p>

                      {/* Actions */}
                      {message.actions && message.actions.length > 0 && (
                        <div className="mt-3 flex flex-wrap gap-2">
                          {message.actions.map((action) => (
                            <button
                              key={action.id}
                              onClick={action.action}
                              className={`px-3 py-1 rounded-full text-xs font-medium transition-colors duration-200 ${
                                action.primary
                                  ? 'bg-blue-500 text-white hover:bg-blue-600'
                                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                              }`}
                            >
                              {action.label}
                            </button>
                          ))}
                        </div>
                      )}

                      {/* Timestamp */}
                      <p className="text-xs opacity-60 mt-2">
                        {new Date(message.timestamp).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                    </div>
                  </div>
                </div>
              ))
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="p-4 border-t border-gray-200 bg-gray-50 rounded-b-lg">
            <div className="flex items-center space-x-3">
              <div className="flex-1 relative">
                <input
                  ref={inputRef}
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Type a command or ask for help..."
                  className="w-full px-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent pr-12"
                  disabled={isListening}
                />

                {status.voiceEnabled && (
                  <button
                    onClick={handleVoiceToggle}
                    className={`absolute right-2 top-1/2 transform -translate-y-1/2 p-2 rounded-full transition-colors duration-200 ${
                      isListening
                        ? 'text-red-500 hover:bg-red-100'
                        : 'text-gray-400 hover:bg-gray-100'
                    }`}
                    title={isListening ? 'Listening...' : 'Voice Input'}
                  >
                    <span className="text-sm">
                      {isListening ? '🎤' : '🎙️'}
                    </span>
                  </button>
                )}
              </div>

              <button
                onClick={handleSendMessage}
                disabled={!inputValue.trim() || isListening}
                className="px-4 py-2 bg-blue-500 text-white rounded-full hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors duration-200 font-medium"
              >
                Send
              </button>
            </div>

            {/* Status Bar */}
            <div className="flex items-center justify-between mt-3 text-xs text-gray-500">
              <div className="flex items-center space-x-4">
                <span>Messages: {messages.length}</span>
                {status.voiceEnabled && <span>Voice: {isListening ? 'Active' : 'Ready'}</span>}
                <span>Mode: {status.mode}</span>
              </div>

              <button
                onClick={clearMessages}
                className="text-gray-400 hover:text-gray-600 transition-colors duration-200"
                title="Clear Messages"
              >
                🗑️ Clear
              </button>
            </div>
          </div>
        </>
      )}

      {/* Minimized State */}
      {isMinimized && (
        <div className="p-4 text-center text-white">
          <p className="text-sm opacity-90">AI Assistant is minimized</p>
          <p className="text-xs opacity-75 mt-1">
            {messages.length > 0 ? `${messages.length} message${messages.length > 1 ? 's' : ''} waiting` : 'No new messages'}
          </p>
        </div>
      )}
    </div>
  );
};

// Floating Action Button for AI Assistant
export const AIAssistantFAB: React.FC<{
  onClick: () => void;
  hasNewMessages: boolean;
  isActive: boolean;
}> = ({ onClick, hasNewMessages, isActive }) => {
  return (
    <button
      onClick={onClick}
      className={`fixed bottom-6 right-6 w-14 h-14 rounded-full shadow-lg transition-all duration-300 z-40 ${
        isActive
          ? 'bg-blue-500 hover:bg-blue-600 scale-110'
          : 'bg-gray-600 hover:bg-gray-700'
      } text-white flex items-center justify-center group`}
      title="AI Assistant"
    >
      <span className="text-xl">🤖</span>

      {/* New Messages Indicator */}
      {hasNewMessages && (
        <div className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full flex items-center justify-center">
          <span className="text-xs text-white font-bold">!</span>
        </div>
      )}

      {/* Tooltip */}
      <div className="absolute bottom-full right-0 mb-2 px-3 py-1 bg-gray-800 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap">
        AI Assistant
        <div className="absolute top-full right-4 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-800"></div>
      </div>
    </button>
  );
};

export default AIAssistantPanel;