import React, { useState, useEffect, useRef } from 'react';
import { Send, MessageSquare, Radio, CloudSun, Wrench, Fuel, Info } from 'lucide-react';
import { TripMessage, UserProfile } from '../../types';
import { supabase, isSupabaseConfigured } from '../../lib/supabaseClient';

interface DiscussionThreadProps {
  tripId: string;
  currentUser: UserProfile;
}

const TOPIC_PRESETS = [
  { label: 'Weather Check', icon: CloudSun, text: 'Checked local NOAA forecast: ' },
  { label: 'Gear Sharing', icon: Wrench, text: 'I am carrying recovery gear: ' },
  { label: 'Radio Check', icon: Radio, text: 'Confirming comms: monitoring ' },
  { label: 'Staging & Fuel', icon: Fuel, text: 'Meeting spot / staging reminder: ' }
];

export default function DiscussionThread({ tripId, currentUser }: DiscussionThreadProps) {
  const [messages, setMessages] = useState<TripMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Load messages & subscribe to Supabase Realtime
  useEffect(() => {
    let isMounted = true;

    async function loadMessages() {
      if (isSupabaseConfigured) {
        const { data, error } = await supabase
          .from('trip_messages')
          .select(`
            id,
            trip_id,
            user_id,
            content,
            created_at,
            profiles (
              id,
              full_name,
              avatar_url,
              default_rig
            )
          `)
          .eq('trip_id', tripId)
          .order('created_at', { ascending: true });

        if (data && !error && isMounted) {
          const mapped: TripMessage[] = data.map((m: any) => ({
            id: m.id,
            tripId: m.trip_id,
            userId: m.user_id,
            content: m.content,
            createdAt: m.created_at,
            userProfile: m.profiles ? {
              id: m.profiles.id,
              fullName: m.profiles.full_name,
              avatarUrl: m.profiles.avatar_url,
              defaultRig: m.profiles.default_rig
            } : undefined
          }));
          setMessages(mapped);
        }
      } else {
        // Local session storage fallback
        const localKey = `trail_chat_${tripId}`;
        try {
          const stored = localStorage.getItem(localKey);
          if (stored && isMounted) {
            setMessages(JSON.parse(stored));
          }
        } catch (e) {}
      }
    }

    loadMessages();

    // Supabase Realtime Channel Subscription
    let channel: any = null;
    if (isSupabaseConfigured) {
      channel = supabase
        .channel(`chat-${tripId}`)
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'trip_messages',
            filter: `trip_id=eq.${tripId}`
          },
          async (payload) => {
            const newRow = payload.new as any;
            // Fetch profile for sender
            let senderProfile: UserProfile | undefined;
            const { data: prof } = await supabase
              .from('profiles')
              .select('id, full_name, avatar_url, default_rig')
              .eq('id', newRow.user_id)
              .single();
            if (prof) {
              senderProfile = {
                id: prof.id,
                fullName: prof.full_name,
                avatarUrl: prof.avatar_url,
                defaultRig: prof.default_rig
              };
            }

            const incoming: TripMessage = {
              id: newRow.id,
              tripId: newRow.trip_id,
              userId: newRow.user_id,
              content: newRow.content,
              createdAt: newRow.created_at,
              userProfile: senderProfile
            };

            setMessages((prev) => {
              if (prev.some(m => m.id === incoming.id)) return prev;
              return [...prev, incoming];
            });
          }
        )
        .subscribe();
    }

    return () => {
      isMounted = false;
      if (channel) supabase.removeChannel(channel);
    };
  }, [tripId]);

  // Scroll to bottom when new message arrives
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || isSubmitting) return;

    const text = newMessage.trim();
    setNewMessage('');
    setIsSubmitting(true);

    const nowIso = new Date().toISOString();
    const tempId = `msg-${Date.now()}`;

    const localMessage: TripMessage = {
      id: tempId,
      tripId,
      userId: currentUser.id,
      content: text,
      createdAt: nowIso,
      userProfile: currentUser
    };

    if (isSupabaseConfigured) {
      const { error } = await supabase
        .from('trip_messages')
        .insert({
          trip_id: tripId,
          user_id: currentUser.id,
          content: text
        });

      if (error) {
        console.error('Failed to post message to Supabase:', error);
        // Optimistically keep in UI
        setMessages((prev) => [...prev, localMessage]);
      }
    } else {
      // Stored on-device in browser's local storage (Transparent disclosure)
      setMessages((prev) => {
        const next = [...prev, localMessage];
        try {
          localStorage.setItem(`trail_chat_${tripId}`, JSON.stringify(next));
        } catch (e) {}
        return next;
      });
    }

    setIsSubmitting(false);
  };

  const applyPreset = (presetText: string) => {
    setNewMessage((prev) => prev ? `${prev} ${presetText}` : presetText);
  };

  const formatMessageTime = (iso: string): string => {
    try {
      const d = new Date(iso);
      return d.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
    } catch {
      return '';
    }
  };

  return (
    <div className="flex flex-col h-full bg-stone-900 rounded-xl border border-stone-800 overflow-hidden">
      {/* Header */}
      <div className="px-4 py-3 bg-stone-950 border-b border-stone-800 flex items-center justify-between">
        <div className="flex items-center gap-2 text-stone-200">
          <MessageSquare className="w-4 h-4 text-amber-400" />
          <h4 className="text-xs font-heading font-bold uppercase tracking-wider">Convoy Comms & Logistics</h4>
        </div>
        <div className="flex items-center gap-1.5 text-[11px] font-mono text-stone-400">
          <span className={`w-2 h-2 rounded-full ${isSupabaseConfigured ? 'bg-emerald-500 animate-pulse' : 'bg-amber-400'}`} />
          <span>{isSupabaseConfigured ? 'Live Realtime' : 'Local Session'}</span>
        </div>
      </div>

      {/* Quick Topic Chips */}
      <div className="px-3 py-2 bg-stone-950/60 border-b border-stone-800/80 flex gap-1.5 overflow-x-auto text-[10px]">
        {TOPIC_PRESETS.map((p) => {
          const IconComponent = p.icon;
          return (
            <button
              key={p.label}
              type="button"
              onClick={() => applyPreset(p.text)}
              className="px-2 py-1 bg-stone-800 hover:bg-stone-700 text-stone-300 rounded-md border border-stone-700/70 whitespace-nowrap flex items-center gap-1 transition-colors"
            >
              <IconComponent className="w-3 h-3 text-amber-400" />
              <span>{p.label}</span>
            </button>
          );
        })}
      </div>

      {/* Message Feed */}
      <div className="flex-1 p-3.5 space-y-3 overflow-y-auto max-h-[300px]">
        {messages.length === 0 ? (
          <div className="text-center py-8 text-stone-500 text-xs">
            <MessageSquare className="w-6 h-6 mx-auto mb-2 opacity-40 text-stone-400" />
            <p className="font-semibold text-stone-400">No convoy discussions yet.</p>
            <p className="text-[11px] mt-0.5">Post an update about weather, rendezvous timing, or spare parts.</p>
          </div>
        ) : (
          messages.map((msg) => {
            const isSelf = msg.userId === currentUser.id;
            const senderName = msg.userProfile?.fullName || 'Trail Driver';
            const rigLabel = msg.userProfile?.defaultRig;

            return (
              <div
                key={msg.id}
                className={`flex flex-col ${isSelf ? 'items-end' : 'items-start'}`}
              >
                <div className="flex items-baseline gap-2 mb-1 px-1">
                  <span className="text-[11px] font-heading font-bold text-stone-300">
                    {senderName}
                  </span>
                  {rigLabel && (
                    <span className="text-[9px] font-mono text-amber-400/90 bg-amber-500/10 px-1 rounded border border-amber-500/20">
                      {rigLabel}
                    </span>
                  )}
                  <span className="text-[10px] text-stone-500 font-mono">
                    {formatMessageTime(msg.createdAt)}
                  </span>
                </div>
                <div
                  className={`max-w-[85%] rounded-xl px-3 py-2 text-xs leading-relaxed ${
                    isSelf
                      ? 'bg-amber-500 text-stone-950 font-medium'
                      : 'bg-stone-800 text-stone-200 border border-stone-700/80'
                  }`}
                >
                  {msg.content}
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Field */}
      <form onSubmit={handleSendMessage} className="p-3 bg-stone-950 border-t border-stone-800 flex gap-2">
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Ask a logistics question or share trail updates..."
          className="flex-1 bg-stone-900 border border-stone-700 rounded-xl px-3 py-2 text-xs text-stone-100 placeholder-stone-500 focus:outline-none focus:border-amber-500 transition-colors"
        />
        <button
          type="submit"
          disabled={!newMessage.trim() || isSubmitting}
          className="px-3.5 py-2 bg-amber-500 hover:bg-amber-400 disabled:opacity-40 disabled:hover:bg-amber-500 text-stone-950 font-heading font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 transition-colors shadow-sm"
        >
          <Send className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Send</span>
        </button>
      </form>
    </div>
  );
}
