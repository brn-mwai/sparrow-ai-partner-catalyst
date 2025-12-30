'use client';

import { useState, useRef, useEffect, FormEvent } from 'react';
import Link from 'next/link';
import { RiveOrb } from '@/components/shared/rive-orb';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp?: Date;
}

interface ModelOption {
  id: string;
  name: string;
  description: string;
  speed: 'fast' | 'medium';
}

const DEFAULT_MODELS: ModelOption[] = [
  { id: 'llama-3.3-70b', name: 'Llama 3.3 70B', description: 'Best quality', speed: 'medium' },
  { id: 'llama-3.1-8b', name: 'Llama 3.1 8B', description: 'Fast responses', speed: 'fast' },
  { id: 'llama-4-scout', name: 'Llama 4 Scout', description: 'Latest model', speed: 'fast' },
  { id: 'qwen-32b', name: 'Qwen3 32B', description: 'Multilingual', speed: 'medium' },
  { id: 'compound', name: 'Groq Compound', description: 'Multi-step reasoning', speed: 'medium' },
];

const INITIAL_MESSAGE: Message = {
  id: '1',
  role: 'assistant',
  content: "Hey! I'm Coach Sparrow, your AI sales coach powered by Groq. I can help you improve your sales skills, review your calls, and give you tips. What would you like to work on?",
  timestamp: new Date(),
};

export function CoachSparrow() {
  const [isOpen, setIsOpen] = useState(false);
  const [showModelSelector, setShowModelSelector] = useState(false);
  const [models] = useState<ModelOption[]>(DEFAULT_MODELS);
  const [selectedModel, setSelectedModel] = useState<string>('llama-3.3-70b');
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

  const getModelInfo = () => {
    return models.find(m => m.id === selectedModel) || models[0];
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isThinking) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input.trim(),
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

      const response = await fetch('/api/coach', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: conversationHistory,
          model: selectedModel,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to get response');
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
      setError('Failed to get response. Please try again.');
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: "I'm having trouble connecting right now. Please check your connection and try again.",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsThinking(false);
    }
  };

  const handleClearChat = () => {
    setMessages([{ ...INITIAL_MESSAGE, id: Date.now().toString(), timestamp: new Date() }]);
    setError(null);
  };

  return (
    <div className="coach-sparrow">
      {/* Chat Panel */}
      <div className={`coach-sparrow-panel ${isOpen ? 'open' : ''}`}>
        {/* Header */}
        <div className="coach-sparrow-header">
          <div className="coach-sparrow-header-left">
            <div className="coach-sparrow-orb">
              <RiveOrb size={40} colorMode={9} isActive={isThinking} />
            </div>
            <div className="coach-sparrow-info">
              <h3>Coach Sparrow</h3>
              <p>Powered by Groq</p>
            </div>
          </div>
          <div className="coach-sparrow-header-actions">
            <Link
              href="/dashboard/coach"
              className="btn btn-ghost btn-icon btn-sm"
              title="Open full page"
            >
              <i className="ph ph-arrows-out"></i>
            </Link>
            <button
              className="btn btn-ghost btn-icon btn-sm"
              onClick={() => setShowModelSelector(!showModelSelector)}
              title="Change model"
              style={{
                background: showModelSelector ? 'var(--primary-100)' : undefined,
                color: showModelSelector ? 'var(--primary-600)' : undefined,
              }}
            >
              <i className="ph ph-sliders-horizontal"></i>
            </button>
            <button
              className="btn btn-ghost btn-icon btn-sm"
              onClick={handleClearChat}
              title="Clear chat"
            >
              <i className="ph ph-trash"></i>
            </button>
            <button
              className="btn btn-ghost btn-icon btn-sm"
              onClick={() => setIsOpen(false)}
              aria-label="Close chat"
            >
              <i className="ph ph-x"></i>
            </button>
          </div>
        </div>

        {/* Model Selector */}
        {showModelSelector && (
          <div className="coach-model-selector">
            <div className="coach-model-selector-label">Select Model</div>
            <div className="coach-model-selector-list">
              {models.map((model) => (
                <button
                  key={model.id}
                  onClick={() => {
                    setSelectedModel(model.id);
                    setShowModelSelector(false);
                  }}
                  className={`coach-model-option ${selectedModel === model.id ? 'active' : ''}`}
                >
                  <div className="coach-model-option-info">
                    <span className="coach-model-option-name">{model.name}</span>
                    <span className="coach-model-option-desc">{model.description}</span>
                  </div>
                  <span className={`coach-model-option-badge ${model.speed}`}>
                    <i className={`ph ph-${model.speed === 'fast' ? 'lightning' : 'clock'}`}></i>
                    {model.speed === 'fast' ? 'Fast' : 'Quality'}
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Current Model Indicator */}
        {!showModelSelector && (
          <div className="coach-model-indicator">
            <i className="ph ph-cpu"></i>
            <span>Using {getModelInfo().name}</span>
            <span className={`coach-model-indicator-badge ${getModelInfo().speed}`}>
              {getModelInfo().speed === 'fast' ? 'FAST' : 'QUALITY'}
            </span>
          </div>
        )}

        {/* Error Banner */}
        {error && (
          <div className="coach-error-banner">
            <i className="ph ph-warning-circle"></i>
            {error}
          </div>
        )}

        {/* Messages */}
        <div className="coach-sparrow-messages">
          {messages.map((message) => (
            <div key={message.id} className={`coach-message ${message.role}`}>
              <div className="coach-message-avatar">
                {message.role === 'assistant' ? (
                  <RiveOrb size={28} colorMode={9} isActive={false} />
                ) : (
                  <i className="ph ph-user"></i>
                )}
              </div>
              <div className="coach-message-bubble">
                <div className="coach-message-content">{message.content}</div>
              </div>
            </div>
          ))}

          {/* Thinking animation */}
          {isThinking && (
            <div className="coach-message assistant">
              <div className="coach-message-avatar">
                <RiveOrb size={28} colorMode={9} isActive={true} />
              </div>
              <div className="coach-message-bubble">
                <div className="coach-thinking">
                  <span className="coach-thinking-text">Sparrow is thinking</span>
                  <span className="coach-thinking-dots">
                    <span></span>
                    <span></span>
                    <span></span>
                  </span>
                </div>
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
              className="btn btn-primary btn-icon btn-sm"
              disabled={!input.trim() || isThinking}
              aria-label="Send message"
            >
              <i className="ph ph-paper-plane-tilt"></i>
            </button>
          </form>
        </div>
      </div>

      {/* Toggle Button - Pill shape with orb and text */}
      <button
        className={`coach-sparrow-toggle ${isOpen ? 'open' : ''}`}
        onClick={() => setIsOpen(!isOpen)}
        aria-label={isOpen ? 'Close Coach Sparrow' : 'Open Coach Sparrow'}
      >
        <div className="coach-sparrow-toggle-orb">
          <RiveOrb size={44} colorMode={9} isActive={isThinking || isOpen} />
        </div>
        <span className="coach-sparrow-toggle-text">
          {isOpen ? 'Close' : 'Ask Coach'}
        </span>
      </button>
    </div>
  );
}

export default CoachSparrow;
