'use client';

import { useState, useRef, useEffect, FormEvent } from 'react';
import { RiveOrb } from '@/components/shared/rive-orb';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
}

interface TranscriptMessage {
  speaker: 'user' | 'prospect';
  content: string;
  timestamp_ms: number;
}

interface TranscriptCoachProps {
  transcript: TranscriptMessage[];
  prospectName: string;
  callType: string;
  scores?: {
    overall: number;
    categories: Record<string, number>;
  };
  isOpen: boolean;
  onToggle: () => void;
}

const INITIAL_MESSAGE = (prospectName: string): Message => ({
  id: '1',
  role: 'assistant',
  content: `I've analyzed your call with ${prospectName}. Ask me anything about the conversation - what went well, what could be improved, or specific moments you'd like feedback on.`,
});

const QUICK_QUESTIONS = [
  { label: 'What did I do well?', icon: 'ph-thumbs-up' },
  { label: 'What could I improve?', icon: 'ph-arrow-circle-up' },
  { label: 'Did I handle objections well?', icon: 'ph-shield' },
  { label: 'How was my closing?', icon: 'ph-handshake' },
];

export function TranscriptCoach({
  transcript,
  prospectName,
  callType,
  scores,
  isOpen,
  onToggle,
}: TranscriptCoachProps) {
  const [messages, setMessages] = useState<Message[]>([INITIAL_MESSAGE(prospectName)]);
  const [input, setInput] = useState('');
  const [isThinking, setIsThinking] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isThinking]);

  useEffect(() => {
    if (isOpen) {
      inputRef.current?.focus();
    }
  }, [isOpen]);

  const formatTranscriptForContext = () => {
    return transcript
      .map((msg) => {
        const mins = Math.floor(msg.timestamp_ms / 60000);
        const secs = Math.floor((msg.timestamp_ms % 60000) / 1000);
        const timestamp = `${mins}:${secs.toString().padStart(2, '0')}`;
        const speaker = msg.speaker === 'user' ? 'Rep' : prospectName;
        return `[${timestamp}] ${speaker}: ${msg.content}`;
      })
      .join('\n');
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
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsThinking(true);
    setError(null);

    try {
      const transcriptContext = formatTranscriptForContext();
      const scoresContext = scores
        ? `\n\nCall Scores:\n- Overall: ${scores.overall}/10\n${Object.entries(scores.categories)
            .map(([k, v]) => `- ${k}: ${v}/10`)
            .join('\n')}`
        : '';

      const systemPrompt = `You are Coach Sparrow, an expert sales coach analyzing a ${callType} call.
You have access to the full transcript below. Provide specific, actionable feedback based on what actually happened in the call.
Reference specific moments and quotes from the transcript when giving feedback.
Be encouraging but honest. Focus on concrete improvements.

TRANSCRIPT:
${transcriptContext}
${scoresContext}

When answering questions:
1. Reference specific timestamps and quotes
2. Provide actionable suggestions
3. Be concise but thorough
4. Use a supportive coaching tone`;

      const conversationHistory = messages.slice(1).map((msg) => ({
        role: msg.role,
        content: msg.content,
      }));

      const response = await fetch('/api/coach', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: [
            ...conversationHistory,
            { role: 'user', content: content },
          ],
          model: 'llama-3.3-70b',
          systemPrompt,
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
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (err) {
      console.error('Coach error:', err);
      setError('Failed to get feedback. Please try again.');
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: "I'm having trouble connecting. Please try again in a moment.",
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsThinking(false);
    }
  };

  const handleQuickQuestion = (question: string) => {
    sendMessage(question);
  };

  return (
    <div className={`transcript-coach ${isOpen ? 'open' : ''}`}>
      {/* Toggle Button */}
      <button className="transcript-coach-toggle" onClick={onToggle}>
        <RiveOrb size={28} colorMode={9} isActive={isThinking} />
        <span>Coach Sparrow</span>
        <i className={`ph ph-caret-${isOpen ? 'right' : 'left'}`}></i>
      </button>

      {/* Panel */}
      <div className="transcript-coach-panel">
        {/* Header */}
        <div className="transcript-coach-header">
          <div className="transcript-coach-header-info">
            <RiveOrb size={36} colorMode={9} isActive={isThinking} />
            <div>
              <h3>Coach Sparrow</h3>
              <p>Call Analysis</p>
            </div>
          </div>
          <button className="btn btn-ghost btn-icon btn-sm" onClick={onToggle}>
            <i className="ph ph-x"></i>
          </button>
        </div>

        {/* Messages */}
        <div className="transcript-coach-messages">
          {messages.map((message) => (
            <div key={message.id} className={`transcript-coach-message ${message.role}`}>
              <div className="transcript-coach-message-avatar">
                {message.role === 'assistant' ? (
                  <RiveOrb size={28} colorMode={9} isActive={false} />
                ) : (
                  <i className="ph ph-user"></i>
                )}
              </div>
              <div className="transcript-coach-message-content">
                {message.content}
              </div>
            </div>
          ))}

          {isThinking && (
            <div className="transcript-coach-message assistant">
              <div className="transcript-coach-message-avatar">
                <RiveOrb size={28} colorMode={9} isActive={true} />
              </div>
              <div className="transcript-coach-message-content thinking">
                <span>Analyzing</span>
                <span className="dots">
                  <span></span>
                  <span></span>
                  <span></span>
                </span>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Quick Questions */}
        {messages.length <= 1 && !isThinking && (
          <div className="transcript-coach-quick">
            {QUICK_QUESTIONS.map((q, i) => (
              <button
                key={i}
                className="transcript-coach-quick-btn"
                onClick={() => handleQuickQuestion(q.label)}
              >
                <i className={`ph ${q.icon}`}></i>
                {q.label}
              </button>
            ))}
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="transcript-coach-error">
            <i className="ph ph-warning-circle"></i>
            {error}
          </div>
        )}

        {/* Input */}
        <form onSubmit={handleSubmit} className="transcript-coach-input">
          <input
            ref={inputRef}
            type="text"
            placeholder="Ask about your call..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={isThinking}
          />
          <button
            type="submit"
            className="btn btn-primary btn-icon btn-sm"
            disabled={!input.trim() || isThinking}
          >
            <i className="ph ph-paper-plane-tilt"></i>
          </button>
        </form>
      </div>
    </div>
  );
}

export default TranscriptCoach;
