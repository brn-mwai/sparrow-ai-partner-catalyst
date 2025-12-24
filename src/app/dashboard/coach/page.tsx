'use client';

import { useState, useRef, useEffect, FormEvent, useCallback } from 'react';
import Link from 'next/link';
import { RiveOrb } from '@/components/shared/rive-orb';
import { useSidebar } from '@/components/dashboard/sidebar-context';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface ChatSession {
  id: string;
  title: string;
  messages: Message[];
  createdAt: Date;
  updatedAt: Date;
}

interface ModelOption {
  id: string;
  name: string;
  description: string;
  speed: 'fast' | 'medium';
}

const MODELS: ModelOption[] = [
  { id: 'llama-3.3-70b', name: 'Llama 3.3 70B', description: 'Best quality responses', speed: 'medium' },
  { id: 'llama-3.1-8b', name: 'Llama 3.1 8B', description: 'Fast responses', speed: 'fast' },
  { id: 'llama-4-scout', name: 'Llama 4 Scout', description: 'Latest model', speed: 'fast' },
  { id: 'qwen-32b', name: 'Qwen3 32B', description: 'Multilingual support', speed: 'medium' },
  { id: 'compound', name: 'Groq Compound', description: 'Multi-step reasoning', speed: 'medium' },
];

const QUICK_PROMPTS = [
  { icon: 'ph-target', label: 'Cold Call Tips', prompt: 'What are the best techniques for starting a cold call?' },
  { icon: 'ph-hand-waving', label: 'Handle Objections', prompt: 'How should I handle the objection "We\'re not interested right now"?' },
  { icon: 'ph-question', label: 'Discovery Questions', prompt: 'What are the best discovery questions to ask in a sales call?' },
  { icon: 'ph-handshake', label: 'Closing Techniques', prompt: 'What are effective closing techniques for B2B sales?' },
];

const INITIAL_MESSAGE: Message = {
  id: '1',
  role: 'assistant',
  content: "Hey! I'm Coach Sparrow, your AI sales coach. I'm here to help you improve your sales skills, review your call techniques, and give you actionable tips. What would you like to work on today?",
  timestamp: new Date(),
};

const STORAGE_KEY = 'sparrow_coach_sessions';

function generateChatTitle(messages: Message[]): string {
  const userMessage = messages.find(m => m.role === 'user');
  if (userMessage) {
    const title = userMessage.content.slice(0, 40);
    return title.length < userMessage.content.length ? `${title}...` : title;
  }
  return 'New Chat';
}

export default function CoachPage() {
  const { setCollapsed } = useSidebar();
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([INITIAL_MESSAGE]);
  const [input, setInput] = useState('');
  const [isThinking, setIsThinking] = useState(false);
  const [selectedModel, setSelectedModel] = useState<string>('llama-3.3-70b');
  const [showModelSelector, setShowModelSelector] = useState(false);
  const [showHistory, setShowHistory] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Collapse main sidebar when Coach page opens
  useEffect(() => {
    setCollapsed(true);
    return () => {
      // Restore sidebar state when leaving
      setCollapsed(false);
    };
  }, [setCollapsed]);

  // Load sessions from localStorage
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        const sessionsWithDates = parsed.map((s: ChatSession) => ({
          ...s,
          createdAt: new Date(s.createdAt),
          updatedAt: new Date(s.updatedAt),
          messages: s.messages.map((m: Message) => ({
            ...m,
            timestamp: new Date(m.timestamp),
          })),
        }));
        setSessions(sessionsWithDates);

        // Load the most recent session
        if (sessionsWithDates.length > 0) {
          const mostRecent = sessionsWithDates[0];
          setActiveSessionId(mostRecent.id);
          setMessages(mostRecent.messages);
        }
      } catch (e) {
        console.error('Failed to parse stored sessions:', e);
      }
    }
  }, []);

  // Save sessions to localStorage
  const saveSessions = useCallback((updatedSessions: ChatSession[]) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedSessions));
    setSessions(updatedSessions);
  }, []);

  // Save current session
  const saveCurrentSession = useCallback((currentMessages: Message[]) => {
    if (currentMessages.length <= 1) return; // Don't save empty sessions

    const now = new Date();

    if (activeSessionId) {
      // Update existing session
      const updatedSessions = sessions.map(s =>
        s.id === activeSessionId
          ? { ...s, messages: currentMessages, updatedAt: now, title: generateChatTitle(currentMessages) }
          : s
      );
      saveSessions(updatedSessions);
    } else {
      // Create new session
      const newSession: ChatSession = {
        id: Date.now().toString(),
        title: generateChatTitle(currentMessages),
        messages: currentMessages,
        createdAt: now,
        updatedAt: now,
      };
      setActiveSessionId(newSession.id);
      saveSessions([newSession, ...sessions]);
    }
  }, [activeSessionId, sessions, saveSessions]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isThinking]);

  useEffect(() => {
    inputRef.current?.focus();
  }, [activeSessionId]);

  const getModelInfo = () => {
    return MODELS.find(m => m.id === selectedModel) || MODELS[0];
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isThinking) return;
    await sendMessage(input.trim());
  };

  const sendMessage = async (content: string) => {
    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content,
      timestamp: new Date(),
    };

    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInput('');
    setIsThinking(true);
    setError(null);

    try {
      const conversationHistory = newMessages.slice(1).map(msg => ({
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

      const finalMessages = [...newMessages, assistantMessage];
      setMessages(finalMessages);
      saveCurrentSession(finalMessages);
    } catch (err) {
      console.error('Chat error:', err);
      setError('Failed to get response. Please try again.');
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: "I'm having trouble connecting right now. Please check your connection and try again.",
        timestamp: new Date(),
      };
      const finalMessages = [...newMessages, errorMessage];
      setMessages(finalMessages);
    } finally {
      setIsThinking(false);
    }
  };

  const handleQuickPrompt = (prompt: string) => {
    sendMessage(prompt);
  };

  const handleNewChat = () => {
    setActiveSessionId(null);
    setMessages([{ ...INITIAL_MESSAGE, id: Date.now().toString(), timestamp: new Date() }]);
    setError(null);
    inputRef.current?.focus();
  };

  const handleLoadSession = (session: ChatSession) => {
    setActiveSessionId(session.id);
    setMessages(session.messages);
    setError(null);
  };

  const handleDeleteSession = (sessionId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updatedSessions = sessions.filter(s => s.id !== sessionId);
    saveSessions(updatedSessions);

    if (activeSessionId === sessionId) {
      if (updatedSessions.length > 0) {
        setActiveSessionId(updatedSessions[0].id);
        setMessages(updatedSessions[0].messages);
      } else {
        handleNewChat();
      }
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const formatDate = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (days === 0) return 'Today';
    if (days === 1) return 'Yesterday';
    if (days < 7) return `${days} days ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className="coach-page-container">
      {/* Chat History Sidebar */}
      <aside className={`coach-history-sidebar ${showHistory ? 'open' : ''}`}>
        <div className="coach-history-header">
          <h3>Chat History</h3>
          <button
            className="btn btn-ghost btn-icon btn-sm"
            onClick={() => setShowHistory(false)}
          >
            <i className="ph ph-x"></i>
          </button>
        </div>

        <button className="coach-new-chat-btn" onClick={handleNewChat}>
          <i className="ph ph-plus"></i>
          New Chat
        </button>

        <div className="coach-history-list">
          {sessions.length === 0 ? (
            <div className="coach-history-empty">
              <i className="ph ph-chats-circle"></i>
              <p>No chat history yet</p>
              <span>Start a conversation to see it here</span>
            </div>
          ) : (
            sessions.map((session) => (
              <div
                key={session.id}
                className={`coach-history-item ${activeSessionId === session.id ? 'active' : ''}`}
                onClick={() => handleLoadSession(session)}
              >
                <div className="coach-history-item-content">
                  <span className="coach-history-item-title">{session.title}</span>
                  <span className="coach-history-item-date">{formatDate(session.updatedAt)}</span>
                </div>
                <button
                  className="coach-history-item-delete"
                  onClick={(e) => handleDeleteSession(session.id, e)}
                  title="Delete chat"
                >
                  <i className="ph ph-trash"></i>
                </button>
              </div>
            ))
          )}
        </div>
      </aside>

      {/* Main Chat Area */}
      <div className="coach-page">
        {/* Header */}
        <div className="coach-page-header">
          <div className="coach-page-header-left">
            {!showHistory && (
              <button
                className="btn btn-ghost btn-icon"
                onClick={() => setShowHistory(true)}
                title="Show history"
              >
                <i className="ph ph-sidebar-simple"></i>
              </button>
            )}
            <Link href="/dashboard" className="btn btn-ghost btn-icon">
              <i className="ph ph-arrow-left"></i>
            </Link>
            <div className="coach-page-header-info">
              <div className="coach-page-header-orb">
                <RiveOrb size={48} colorMode={9} isActive={isThinking} />
              </div>
              <div>
                <h1>Coach Sparrow</h1>
                <p>Your AI Sales Coach</p>
              </div>
            </div>
          </div>
          <div className="coach-page-header-actions">
            <div className="coach-page-model-selector">
              <button
                className={`btn btn-secondary ${showModelSelector ? 'active' : ''}`}
                onClick={() => setShowModelSelector(!showModelSelector)}
              >
                <i className="ph ph-cpu"></i>
                {getModelInfo().name}
                <i className={`ph ph-caret-${showModelSelector ? 'up' : 'down'}`}></i>
              </button>
              {showModelSelector && (
                <div className="coach-page-model-dropdown">
                  {MODELS.map((model) => (
                    <button
                      key={model.id}
                      onClick={() => {
                        setSelectedModel(model.id);
                        setShowModelSelector(false);
                      }}
                      className={`coach-page-model-option ${selectedModel === model.id ? 'active' : ''}`}
                    >
                      <div className="coach-page-model-option-info">
                        <span className="name">{model.name}</span>
                        <span className="desc">{model.description}</span>
                      </div>
                      <span className={`badge ${model.speed}`}>
                        <i className={`ph ph-${model.speed === 'fast' ? 'lightning' : 'clock'}`}></i>
                        {model.speed === 'fast' ? 'Fast' : 'Quality'}
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>
            <button className="btn btn-ghost btn-icon" onClick={handleNewChat} title="New chat">
              <i className="ph ph-plus"></i>
            </button>
          </div>
        </div>

        {/* Error Banner */}
        {error && (
          <div className="coach-page-error">
            <i className="ph ph-warning-circle"></i>
            {error}
            <button onClick={() => setError(null)}>
              <i className="ph ph-x"></i>
            </button>
          </div>
        )}

        {/* Messages */}
        <div className="coach-page-messages">
          {messages.map((message) => (
            <div key={message.id} className={`coach-page-message ${message.role}`}>
              <div className="coach-page-message-avatar">
                {message.role === 'assistant' ? (
                  <RiveOrb size={36} colorMode={9} isActive={false} />
                ) : (
                  <i className="ph ph-user"></i>
                )}
              </div>
              <div className="coach-page-message-content">
                <div className="coach-page-message-header">
                  <span className="name">{message.role === 'assistant' ? 'Coach Sparrow' : 'You'}</span>
                  <span className="time">{formatTime(message.timestamp)}</span>
                </div>
                <div className="coach-page-message-text">{message.content}</div>
              </div>
            </div>
          ))}

          {isThinking && (
            <div className="coach-page-message assistant">
              <div className="coach-page-message-avatar">
                <RiveOrb size={36} colorMode={9} isActive={true} />
              </div>
              <div className="coach-page-message-content">
                <div className="coach-page-message-header">
                  <span className="name">Coach Sparrow</span>
                </div>
                <div className="coach-page-thinking">
                  <span>Thinking</span>
                  <span className="dots">
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

        {/* Quick Prompts - Only show when conversation just started */}
        {messages.length <= 1 && !isThinking && (
          <div className="coach-page-quick-prompts">
            <span className="coach-page-quick-prompts-label">Quick prompts</span>
            <div className="coach-page-quick-prompts-grid">
              {QUICK_PROMPTS.map((prompt, index) => (
                <button
                  key={index}
                  className="coach-page-quick-prompt"
                  onClick={() => handleQuickPrompt(prompt.prompt)}
                >
                  <i className={`ph ${prompt.icon}`}></i>
                  <span>{prompt.label}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Input */}
        <div className="coach-page-input-container">
          <form onSubmit={handleSubmit} className="coach-page-input-wrapper">
            <input
              ref={inputRef}
              type="text"
              placeholder="Ask Coach Sparrow anything about sales..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              disabled={isThinking}
            />
            <button
              type="submit"
              className="btn btn-primary"
              disabled={!input.trim() || isThinking}
            >
              <i className="ph ph-paper-plane-tilt"></i>
              Send
            </button>
          </form>
          <div className="coach-page-input-hint">
            <span>Powered by Groq</span>
            <span className={`model-badge ${getModelInfo().speed}`}>
              {getModelInfo().name}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
