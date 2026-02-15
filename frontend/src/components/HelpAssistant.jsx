/**
 * HelpAssistant Component
 * 
 * AI-powered floating chat assistant for the Help Center
 * Uses GPT-5.2 via emergentintegrations backend
 */

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MessageCircle,
  X,
  Send,
  Bot,
  User,
  Sparkles,
  ThumbsUp,
  ThumbsDown,
  RefreshCw,
  Loader2
} from 'lucide-react';

// Utility function
function cn(...classes) {
  return classes.filter(Boolean).join(' ');
}

export function HelpAssistant({ isDark = true }) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [sessionId, setSessionId] = useState(null);
  const [feedback, setFeedback] = useState({});
  const messagesEndRef = useRef(null);

  const API_URL = process.env.REACT_APP_BACKEND_URL || '';

  // Theme classes
  const bgPrimary = isDark ? 'bg-[#0a1628]' : 'bg-gray-50';
  const bgSecondary = isDark ? 'bg-[#0f1d32]' : 'bg-white';
  const borderColor = isDark ? 'border-white/10' : 'border-gray-200';
  const textPrimary = isDark ? 'text-white' : 'text-gray-900';
  const textSecondary = isDark ? 'text-gray-400' : 'text-gray-600';

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Add initial greeting when opened
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      setMessages([{
        id: 'welcome',
        role: 'assistant',
        content: "Hi! I'm your FieldForce AI Assistant. I can help you with:\n\n• Creating and managing forms\n• Setting up collection links\n• Team management\n• Analytics and reports\n• Troubleshooting issues\n\nHow can I help you today?"
      }]);
    }
  }, [isOpen]);

  const sendMessage = async () => {
    if (!inputValue.trim() || isLoading) return;

    const userMessage = inputValue.trim();
    setInputValue('');
    
    // Add user message
    const userMsgId = `user-${Date.now()}`;
    setMessages(prev => [...prev, {
      id: userMsgId,
      role: 'user',
      content: userMessage
    }]);

    setIsLoading(true);

    try {
      const response = await fetch(`${API_URL}/api/help-assistant/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userMessage,
          session_id: sessionId
        })
      });

      if (!response.ok) throw new Error('Failed to get response');

      const data = await response.json();
      
      // Update session ID
      if (data.session_id) {
        setSessionId(data.session_id);
      }

      // Add assistant message
      const assistantMsgId = `assistant-${Date.now()}`;
      setMessages(prev => [...prev, {
        id: assistantMsgId,
        role: 'assistant',
        content: data.response
      }]);

    } catch (error) {
      console.error('Chat error:', error);
      setMessages(prev => [...prev, {
        id: `error-${Date.now()}`,
        role: 'assistant',
        content: "I'm sorry, I encountered an error. Please try again or check the Help Center articles for assistance."
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFeedback = async (messageId, isHelpful) => {
    setFeedback(prev => ({ ...prev, [messageId]: isHelpful ? 'yes' : 'no' }));
    
    try {
      await fetch(`${API_URL}/api/help-assistant/feedback`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          session_id: sessionId,
          message_id: messageId,
          is_helpful: isHelpful,
          question: messages.find(m => m.id === messageId)?.content
        })
      });
    } catch (error) {
      console.error('Feedback error:', error);
    }
  };

  const resetChat = async () => {
    if (sessionId) {
      try {
        await fetch(`${API_URL}/api/help-assistant/reset?session_id=${sessionId}`, {
          method: 'POST'
        });
      } catch (error) {
        console.error('Reset error:', error);
      }
    }
    setMessages([]);
    setSessionId(null);
    setFeedback({});
  };

  const renderMessageContent = (content) => {
    // Convert markdown links to clickable links
    const linkRegex = /\[([^\]]+)\]\(([^)]+)\)/g;
    const parts = [];
    let lastIndex = 0;
    let match;

    while ((match = linkRegex.exec(content)) !== null) {
      // Add text before the link
      if (match.index > lastIndex) {
        parts.push(content.substring(lastIndex, match.index));
      }
      // Add the link
      parts.push(
        <a
          key={match.index}
          href={match[2]}
          className="text-teal-400 hover:underline"
          onClick={(e) => {
            e.preventDefault();
            window.location.href = match[2];
          }}
        >
          {match[1]}
        </a>
      );
      lastIndex = match.index + match[0].length;
    }
    // Add remaining text
    if (lastIndex < content.length) {
      parts.push(content.substring(lastIndex));
    }

    return parts.length > 0 ? parts : content;
  };

  return (
    <>
      {/* Floating Button */}
      <motion.button
        onClick={() => setIsOpen(true)}
        className={cn(
          "fixed bottom-20 right-6 z-50 p-4 rounded-full shadow-xl",
          "bg-gradient-to-r from-teal-500 to-cyan-500",
          "text-white hover:shadow-2xl hover:shadow-teal-500/20",
          "transition-shadow",
          isOpen && "hidden"
        )}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        data-testid="help-assistant-btn"
      >
        <MessageCircle className="w-6 h-6" />
      </motion.button>

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className={cn(
              "fixed bottom-20 right-6 z-50 w-96 h-[500px] rounded-2xl shadow-2xl overflow-hidden flex flex-col",
              bgSecondary, borderColor, "border"
            )}
            data-testid="help-assistant-chat"
          >
            {/* Header */}
            <div className={cn(
              "flex items-center justify-between px-4 py-3",
              "bg-gradient-to-r from-teal-500 to-cyan-500"
            )}>
              <div className="flex items-center gap-3">
                <div className="p-1.5 bg-white/20 rounded-lg">
                  <Sparkles className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-white">AI Assistant</h3>
                  <p className="text-xs text-white/80">Powered by GPT-5.2</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={resetChat}
                  className="p-1.5 hover:bg-white/20 rounded-lg transition-colors"
                  title="Reset conversation"
                >
                  <RefreshCw className="w-4 h-4 text-white" />
                </button>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-1.5 hover:bg-white/20 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-white" />
                </button>
              </div>
            </div>

            {/* Messages */}
            <div className={cn("flex-1 overflow-y-auto p-4 space-y-4", bgPrimary)}>
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={cn(
                    "flex gap-3",
                    message.role === 'user' && "flex-row-reverse"
                  )}
                >
                  <div className={cn(
                    "w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0",
                    message.role === 'assistant' 
                      ? "bg-teal-500/20" 
                      : "bg-blue-500/20"
                  )}>
                    {message.role === 'assistant' 
                      ? <Bot className="w-4 h-4 text-teal-400" />
                      : <User className="w-4 h-4 text-blue-400" />
                    }
                  </div>
                  <div className={cn(
                    "flex-1 space-y-2",
                    message.role === 'user' && "text-right"
                  )}>
                    <div className={cn(
                      "inline-block px-4 py-2.5 rounded-2xl text-sm whitespace-pre-wrap",
                      message.role === 'assistant'
                        ? cn(bgSecondary, borderColor, "border", textPrimary, "rounded-tl-none")
                        : "bg-teal-500 text-white rounded-tr-none"
                    )}>
                      {renderMessageContent(message.content)}
                    </div>
                    
                    {/* Feedback for assistant messages */}
                    {message.role === 'assistant' && message.id !== 'welcome' && (
                      <div className="flex items-center gap-2">
                        <span className={cn("text-xs", textSecondary)}>Helpful?</span>
                        <button
                          onClick={() => handleFeedback(message.id, true)}
                          className={cn(
                            "p-1 rounded transition-colors",
                            feedback[message.id] === 'yes'
                              ? "text-green-400"
                              : cn(textSecondary, "hover:text-green-400")
                          )}
                        >
                          <ThumbsUp className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleFeedback(message.id, false)}
                          className={cn(
                            "p-1 rounded transition-colors",
                            feedback[message.id] === 'no'
                              ? "text-red-400"
                              : cn(textSecondary, "hover:text-red-400")
                          )}
                        >
                          <ThumbsDown className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
              
              {isLoading && (
                <div className="flex gap-3">
                  <div className="w-8 h-8 rounded-full bg-teal-500/20 flex items-center justify-center">
                    <Loader2 className="w-4 h-4 text-teal-400 animate-spin" />
                  </div>
                  <div className={cn(
                    "px-4 py-2.5 rounded-2xl rounded-tl-none text-sm",
                    bgSecondary, borderColor, "border", textSecondary
                  )}>
                    Thinking...
                  </div>
                </div>
              )}
              
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className={cn("p-4", bgSecondary, borderColor, "border-t")}>
              <div className="flex gap-2">
                <input
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && sendMessage()}
                  placeholder="Ask me anything..."
                  className={cn(
                    "flex-1 px-4 py-2.5 rounded-xl text-sm outline-none",
                    isDark ? "bg-white/5" : "bg-gray-100",
                    borderColor, "border",
                    textPrimary, "placeholder-gray-500",
                    "focus:ring-2 focus:ring-teal-500/50"
                  )}
                  disabled={isLoading}
                  data-testid="help-assistant-input"
                />
                <button
                  onClick={sendMessage}
                  disabled={!inputValue.trim() || isLoading}
                  className={cn(
                    "p-2.5 rounded-xl transition-colors",
                    inputValue.trim() && !isLoading
                      ? "bg-teal-500 text-white hover:bg-teal-600"
                      : cn(isDark ? "bg-white/5" : "bg-gray-100", textSecondary)
                  )}
                  data-testid="help-assistant-send"
                >
                  <Send className="w-5 h-5" />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

export default HelpAssistant;
