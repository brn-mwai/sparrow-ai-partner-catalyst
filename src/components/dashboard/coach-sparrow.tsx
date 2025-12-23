'use client';

import { useState, useRef, useEffect, FormEvent } from 'react';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
}

export function CoachSparrow() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: "Hey! I'm Coach Sparrow. I can help you improve your sales skills, review your calls, and give you tips. What would you like to work on?",
    },
  ]);
  const [input, setInput] = useState('');
  const [isThinking, setIsThinking] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isThinking]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isThinking) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input.trim(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsThinking(true);

    // Simulate AI response (replace with actual API call to Gemini)
    setTimeout(() => {
      const responses = [
        "That's a great question! When handling objections, try the 'Feel, Felt, Found' technique. Acknowledge their concern, relate to similar situations, and share a positive outcome.",
        "I noticed you're working on cold calls. Remember: the goal isn't to sell on the first call, it's to earn the next conversation. Focus on creating curiosity, not closing.",
        "Based on your recent calls, your opening is strong but you could dig deeper during discovery. Try asking 'What happens if you don't solve this?' to quantify the pain.",
        "Great progress on your objection handling! Your scores have improved 15% this week. Keep practicing the 'isolate and address' technique.",
        "For discovery calls, use the SPIN framework: Situation, Problem, Implication, Need-payoff. It helps uncover hidden pain points systematically.",
      ];

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: responses[Math.floor(Math.random() * responses.length)],
      };

      setMessages((prev) => [...prev, assistantMessage]);
      setIsThinking(false);
    }, 2000);
  };

  return (
    <div className="coach-sparrow">
      {/* Chat Panel */}
      <div className={`coach-sparrow-panel ${isOpen ? 'open' : ''}`}>
        {/* Header */}
        <div className="coach-sparrow-header">
          <div className="coach-orb-9" />
          <div className="coach-sparrow-info">
            <h3>Coach Sparrow</h3>
            <p>Your AI sales coach</p>
          </div>
          <button
            className="coach-sparrow-close"
            onClick={() => setIsOpen(false)}
            aria-label="Close chat"
          >
            <i className="ph ph-x"></i>
          </button>
        </div>

        {/* Messages */}
        <div className="coach-sparrow-messages">
          {messages.map((message) => (
            <div key={message.id} className={`coach-message ${message.role}`}>
              <div className="coach-message-avatar">
                <i className={`ph ${message.role === 'assistant' ? 'ph-bird' : 'ph-user'}`}></i>
              </div>
              <div className="coach-message-content">{message.content}</div>
            </div>
          ))}

          {/* Bird-themed thinking animation */}
          {isThinking && (
            <div className="coach-message assistant">
              <div className="coach-message-avatar">
                <i className="ph ph-bird"></i>
              </div>
              <div className="sparrow-thinking">
                <div className="sparrow-thinking-icon">
                  <div className="sparrow-bird">
                    <i className="ph-fill ph-bird"></i>
                    <div className="sparrow-feathers">
                      <div className="sparrow-feather"></div>
                      <div className="sparrow-feather"></div>
                      <div className="sparrow-feather"></div>
                    </div>
                  </div>
                </div>
                <span className="sparrow-thinking-text">
                  Sparrow is thinking
                  <span className="sparrow-thinking-dots">
                    <span></span>
                    <span></span>
                    <span></span>
                  </span>
                </span>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="coach-sparrow-input-container">
          <form onSubmit={handleSubmit} className="coach-sparrow-input-wrapper">
            <input
              type="text"
              className="coach-sparrow-input"
              placeholder="Ask Coach Sparrow..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              disabled={isThinking}
            />
            <button
              type="submit"
              className="coach-sparrow-send"
              disabled={!input.trim() || isThinking}
              aria-label="Send message"
            >
              <i className="ph ph-paper-plane-tilt"></i>
            </button>
          </form>
        </div>
      </div>

      {/* Toggle Button */}
      <button
        className="coach-sparrow-toggle"
        onClick={() => setIsOpen(!isOpen)}
        aria-label={isOpen ? 'Close Coach Sparrow' : 'Open Coach Sparrow'}
      >
        <i className={`ph ${isOpen ? 'ph-x' : 'ph-bird'}`}></i>
      </button>
    </div>
  );
}
