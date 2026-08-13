import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { MessageSquare, Search, Send, ChevronRight, Home, Headphones } from 'lucide-react';
import { Avatar } from '@/components/Avatar';
import { EmptyState } from '@/components/EmptyState';
import { api } from '@/lib/api';

type ConversationDto = {
  id: string;
  withName: string;
  withAvatar: string;
  role: string;
  lastMessage: string;
  lastAt: string | null;
  unread: number;
  support: boolean;
};

type MessageDto = { id: string; from: 'me' | 'them'; senderId: string; text: string; at: string | null };

export function MessagesPage() {
  const [conversations, setConversations] = useState<ConversationDto[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [messages, setMessages] = useState<MessageDto[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');

  const loadConversations = () => api<ConversationDto[]>('/conversations')
    .then(data => {
      setConversations(data ?? []);
      if (!activeId && data && data.length > 0) setActiveId(data[0].id);
    })
    .catch(err => setError(err instanceof Error ? err.message : 'Could not load messages'))
    .finally(() => setLoading(false));

  useEffect(() => { void loadConversations(); }, []);

  useEffect(() => {
    if (!activeId) {
      setMessages([]);
      return;
    }
    api<MessageDto[]>(`/conversations/${activeId}/messages`).then(setMessages).catch(() => setMessages([]));
  }, [activeId]);

  const active = conversations.find(c => c.id === activeId) ?? null;

  const startSupportChat = async () => {
    try {
      const conversation = await api<ConversationDto>('/conversations', { method: 'POST', body: JSON.stringify({ support: true }) });
      await loadConversations();
      setActiveId(conversation.id);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not start conversation');
    }
  };

  const send = async () => {
    if (!activeId || !input.trim()) return;
    setSending(true);
    try {
      const message = await api<MessageDto>(`/conversations/${activeId}/messages`, { method: 'POST', body: JSON.stringify({ text: input }) });
      setMessages(prev => [...prev, message]);
      setInput('');
      void loadConversations();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not send message');
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:px-8">
      <nav className="flex items-center gap-1.5 text-sm text-ink-500">
        <Link to="/" className="flex items-center gap-1 hover:text-ink-900"><Home className="h-3.5 w-3.5" /> Home</Link>
        <ChevronRight className="h-3.5 w-3.5" />
        <span className="font-medium text-ink-900">Messages</span>
      </nav>

      <div className="mt-4 flex items-center justify-between">
        <h1 className="font-display text-2xl font-bold text-ink-900">Messages</h1>
        <button onClick={() => void startSupportChat()} className="flex items-center gap-2 rounded-xl border border-ink-200 px-3 py-2 text-sm font-medium text-ink-700 hover:bg-ink-50">
          <Headphones className="h-4 w-4" /> Contact support
        </button>
      </div>

      {error && <p className="mt-4 rounded-xl bg-error-50 px-3 py-2 text-sm text-error-600">{error}</p>}

      {!loading && conversations.length === 0 ? (
        <div className="mt-6 rounded-2xl border border-ink-100 bg-white">
          <EmptyState icon={<MessageSquare className="h-7 w-7" />} title="No conversations yet" description="Messages with sellers and support will show up here." action={{ label: 'Contact support', onClick: () => void startSupportChat() }} />
        </div>
      ) : (
        <div className="mt-6 grid h-[600px] gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {/* Conversation list */}
          <div className="flex flex-col rounded-2xl border border-ink-100 bg-white sm:col-span-1 lg:col-span-1">
            <div className="border-b border-ink-100 p-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-400" />
                <input placeholder="Search..." className="w-full rounded-lg border border-ink-200 py-2 pl-9 pr-3 text-sm focus:border-brand-400 focus:ring-2 focus:ring-brand-100" />
              </div>
            </div>
            <div className="flex-1 overflow-y-auto">
              {conversations.map(c => (
                <button
                  key={c.id}
                  onClick={() => setActiveId(c.id)}
                  className={`flex w-full items-start gap-3 border-b border-ink-50 p-3 text-left transition-colors ${activeId === c.id ? 'bg-brand-50/50' : 'hover:bg-ink-50'}`}
                >
                  <Avatar src={c.withAvatar} className="h-10 w-10 rounded-xl" />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between">
                      <p className="truncate text-sm font-semibold text-ink-900">{c.withName}</p>
                    </div>
                    <p className="truncate text-xs text-ink-500">{c.lastMessage || 'No messages yet'}</p>
                  </div>
                  {c.unread > 0 && <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-brand-500 text-[10px] font-bold text-white">{c.unread}</span>}
                </button>
              ))}
            </div>
          </div>

          {/* Chat panel */}
          <div className="flex flex-col rounded-2xl border border-ink-100 bg-white sm:col-span-2 lg:col-span-3">
            {active ? (
              <>
                <div className="flex items-center gap-3 border-b border-ink-100 p-4">
                  <Avatar src={active.withAvatar} className="h-10 w-10 rounded-xl" />
                  <div>
                    <p className="text-sm font-semibold text-ink-900">{active.withName}</p>
                    <p className="text-xs text-ink-500 capitalize">{active.role}</p>
                  </div>
                </div>

                <div className="flex-1 space-y-4 overflow-y-auto p-4">
                  {messages.length === 0 && <p className="py-8 text-center text-sm text-ink-400">Say hello to start the conversation.</p>}
                  {messages.map(m => (
                    <div key={m.id} className={`flex ${m.from === 'me' ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[70%] rounded-2xl px-4 py-2.5 text-sm ${m.from === 'me' ? 'bg-brand-500 text-white' : 'bg-ink-100 text-ink-900'}`}>
                        <p>{m.text}</p>
                        <p className={`mt-1 text-xs ${m.from === 'me' ? 'text-white/70' : 'text-ink-400'}`}>{m.at ? new Date(m.at).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' }) : ''}</p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="border-t border-ink-100 p-3">
                  <form onSubmit={e => { e.preventDefault(); void send(); }} className="flex items-center gap-2">
                    <input
                      value={input}
                      onChange={e => setInput(e.target.value)}
                      placeholder="Type a message..."
                      className="flex-1 rounded-xl border border-ink-200 px-4 py-2.5 text-sm focus:border-brand-400 focus:ring-2 focus:ring-brand-100"
                    />
                    <button type="submit" disabled={sending || !input.trim()} className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-500 text-white hover:bg-brand-600 disabled:opacity-50">
                      <Send className="h-4 w-4" />
                    </button>
                  </form>
                </div>
              </>
            ) : (
              <div className="flex flex-1 items-center justify-center text-sm text-ink-400">Select a conversation</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
