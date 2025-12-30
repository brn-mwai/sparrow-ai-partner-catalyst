'use client';

import { useState, useRef, useEffect, FormEvent } from 'react';
import { RiveOrb } from '@/components/shared/rive-orb';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp?: Date;
}

const INITIAL_MESSAGE: Message = {
  id: '1',
  role: 'assistant',
  content: "Hi! I'm Coach Sparrow. I can answer any questions about Sparrow AI, our features, pricing, or how we can help you improve your sales skills. What would you like to know?",
  timestamp: new Date(),
};

const QUICK_QUESTIONS = [
  "What is Sparrow AI?",
  "How does practice work?",
  "What's the pricing?",
  "Is it realistic?",
];

export function LandingCoach() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([INITIAL_MESSAGE]);
  const [input, setInput] = useState('');
  const [isThinking, setIsThinking] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isThinking]);

  const sendMessage = async (content: string) => {
    if (!content.trim() || isThinking) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: content.trim(),
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsThinking(true);
    setError(null);

    try {
      const conversationHistory = [...messages.slice(1), userMessage].map(msg => ({
        role: msg.role,
        content: msg.content,
      }));

      const response = await fetch('/api/coach/landing', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: conversationHistory,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to get response');
      }

      const data = await response.json();

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: data.message,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (err) {
      console.error('Chat error:', err);
      setError(err instanceof Error ? err.message : 'Something went wrong');
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: "I'm having trouble connecting right now. Please try again in a moment!",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsThinking(false);
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    await sendMessage(input);
  };

  const handleQuickQuestion = async (question: string) => {
    await sendMessage(question);
  };

  return (
    <div className="landing-coach">
      {/* Chat Panel */}
      <div className={`landing-coach-panel ${isOpen ? 'open' : ''}`}>
        {/* Header */}
        <div className="landing-coach-header">
          <div className="landing-coach-header-left">
            <div className="landing-coach-orb">
              <RiveOrb size={36} colorMode={9} isActive={isThinking} />
            </div>
            <div className="landing-coach-info">
              <h3>Coach Sparrow</h3>
              <p>Ask me anything</p>
            </div>
          </div>
          <button
            className="landing-coach-close"
            onClick={() => setIsOpen(false)}
            aria-label="Close chat"
          >
            <i className="ph ph-x"></i>
          </button>
        </div>

        {/* Messages */}
        <div className="landing-coach-messages">
          {messages.map((message) => (
            <div key={message.id} className={`landing-coach-message ${message.role}`}>
              <div className="landing-coach-message-avatar">
                {message.role === 'assistant' ? (
                  <RiveOrb size={24} colorMode={9} isActive={false} />
                ) : (
                  <i className="ph ph-user"></i>
                )}
              </div>
              <div className="landing-coach-message-bubble">
                {message.content}
              </div>
            </div>
          ))}

          {/* Quick questions - show only after initial message */}
          {messages.length === 1 && !isThinking && (
            <div className="landing-coach-quick-questions">
              {QUICK_QUESTIONS.map((question, index) => (
                <button
                  key={index}
                  className="landing-coach-quick-btn"
                  onClick={() => handleQuickQuestion(question)}
                >
                  {question}
                </button>
              ))}
            </div>
          )}

          {/* Thinking animation */}
          {isThinking && (
            <div className="landing-coach-message assistant">
              <div className="landing-coach-message-avatar">
                <RiveOrb size={24} colorMode={9} isActive={true} />
              </div>
              <div className="landing-coach-message-bubble">
                <div className="landing-coach-thinking">
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Error */}
        {error && (
          <div className="landing-coach-error">
            {error}
          </div>
        )}

        {/* Input */}
        <form onSubmit={handleSubmit} className="landing-coach-input-form">
          <input
            type="text"
            className="landing-coach-input"
            placeholder="Ask a question..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={isThinking}
          />
          <button
            type="submit"
            className="landing-coach-send"
            disabled={!input.trim() || isThinking}
            aria-label="Send message"
          >
            <i className="ph ph-paper-plane-tilt"></i>
          </button>
        </form>
      </div>

      {/* Toggle Button */}
      <button
        className={`landing-coach-toggle ${isOpen ? 'open' : ''}`}
        onClick={() => setIsOpen(!isOpen)}
        aria-label={isOpen ? 'Close Coach Sparrow' : 'Open Coach Sparrow'}
      >
        <div className="landing-coach-toggle-orb">
          <RiveOrb size={44} colorMode={9} isActive={isThinking || isOpen} />
        </div>
        <span className="landing-coach-toggle-text">
          {isOpen ? 'Close' : 'Ask Coach'}
        </span>
      </button>
    </div>
  );
}

export default LandingCoach;
