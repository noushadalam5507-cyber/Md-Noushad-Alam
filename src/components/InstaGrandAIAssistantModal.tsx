import React, { useState } from 'react';
import {
  X,
  Bot,
  Send,
  Sparkles,
  Wand2,
  Image,
  HelpCircle,
  Coins,
  ShieldCheck,
  CheckCircle2,
  Copy,
  Check
} from 'lucide-react';
import { UserProfile } from '../types';

interface Message {
  id: string;
  sender: 'ai' | 'user';
  text: string;
  timestamp: string;
  category?: 'qa' | 'photo' | 'bio' | 'general';
}

interface InstaGrandAIAssistantModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: UserProfile | null;
  onOpenFilterStudio?: () => void;
}

export const InstaGrandAIAssistantModal: React.FC<InstaGrandAIAssistantModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onOpenFilterStudio,
}) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'm-1',
      sender: 'ai',
      text: `Namaste ${currentUser?.name || 'Creator'}! 🙏 I am your InstaGrand AI Studio Assistant. You can ask me any questions about app monetization, 3D photo filters, creator growth, or get AI bio & photo edit suggestions. How can I help you today?`,
      timestamp: 'Just now',
    },
  ]);
  const [inputText, setInputText] = useState<string>('');
  const [isTyping, setIsTyping] = useState<boolean>(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  if (!isOpen) return null;

  const quickPrompts = [
    {
      label: '🎨 AI Photo Editing Ideas',
      query: 'Give me trending 3D cyberpunk filter presets and photo editing lighting ideas for my next post.',
    },
    {
      label: '💰 How to Earn 80% Tips',
      query: 'How does the creator tipping system work and how do I receive 80% of gifts in my wallet?',
    },
    {
      label: '✨ Generate Viral Creator Bio',
      query: 'Write an aesthetic VIP bio with neon emojis for my profile.',
    },
    {
      label: '🔒 Anti-Hack Account Protection',
      query: 'How do I enable Private Account and anti-hack biometric security on Instagrand?',
    },
  ];

  const handleSendMessage = (textToSend?: string) => {
    const query = (textToSend || inputText).trim();
    if (!query) return;

    const userMsg: Message = {
      id: `usr-${Date.now()}`,
      sender: 'user',
      text: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!textToSend) setInputText('');
    setIsTyping(true);

    setTimeout(() => {
      let reply = '';
      const lower = query.toLowerCase();

      if (lower.includes('photo') || lower.includes('filter') || lower.includes('edit')) {
        reply = `✨ **AI Photo Edit & Filter Pro Tips**:
1. **Cyber Obsidian Preset**: Use cool 6500K lighting, purple chromatic aberration, and neon edge glow.
2. **Holo Crown 3D**: Position your camera at eye level with backlight highlights.
3. **4K HDR Enhancement**: Boost local clarity by +15% and vibrant contrast by +10% in the AI Filter Studio! Tap 'Open Filter Studio' below to try them directly.`;
      } else if (lower.includes('tip') || lower.includes('earn') || lower.includes('80%') || lower.includes('money')) {
        reply = `💰 **Creator Monetization & Tipping**:
- When followers send you **Bronze Star (20 Coins)**, **Silver Crown (50 Coins)**, or **Gold Diamond (100 Coins)**:
- **80% goes directly to your wallet balance** (e.g., +40 Coins from a 50-Coin Crown).
- **20% is retained as the platform fee** for server bandwidth & 4K Opus stream infrastructure.
- You can redeem wallet coins for VIP Studio Pass, 3D Hologram filters, or cash out!`;
      } else if (lower.includes('bio')) {
        reply = `👑 **AI Crafted VIP Bio for @${currentUser?.username || 'creator'}**:
\`\`\`
✨ Lead Architect of Aesthetic Horizons
🔮 Verified Studio Pass Creator | 4K Cyber Streamer
🚀 Support my broadcast with virtual gifts 👑
📍 Neon Studio City · Live Daily
\`\`\``;
      } else if (lower.includes('hack') || lower.includes('private') || lower.includes('security')) {
        reply = `🛡️ **Account Privacy & Anti-Hack Shield**:
- You can toggle **Private Account** in Profile Settings so only approved followers see your media.
- All sessions are fortified with SHA-256 device fingerprinting and real-time Firestore encryption.
- Enable the **Anti-Hack Device Shield** modal to review active sessions anytime.`;
      } else {
        reply = `🤖 **InstaGrand AI Guru Answer**:
Thank you for your question! Instagrand is equipped with 4K Opus WebRTC calling, Firestore real-time synchronization, AdMob daily rewarded coins (+50 Coins daily), and VIP Studio Pass. Let me know if you want custom captions, hashtag strategies, or photo filter recommendations!`;
      }

      const aiMsg: Message = {
        id: `ai-${Date.now()}`,
        sender: 'ai',
        text: reply,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, aiMsg]);
      setIsTyping(false);
    }, 600);
  };

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div
      id="ai-guru-assistant-modal"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/90 backdrop-blur-xl animate-fade-in"
    >
      <div className="relative w-full max-w-xl rounded-3xl bg-zinc-950 border border-fuchsia-500/50 shadow-[0_0_70px_rgba(217,70,239,0.35)] overflow-hidden flex flex-col h-[85vh] max-h-[800px]">
        {/* Glow ambient */}
        <div className="absolute top-0 right-0 w-72 h-72 bg-fuchsia-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-60 h-60 bg-purple-600/20 rounded-full blur-3xl pointer-events-none" />

        {/* Header */}
        <div className="p-4 sm:p-5 bg-gradient-to-r from-fuchsia-950/80 via-purple-950/70 to-zinc-950 border-b border-fuchsia-900/60 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-fuchsia-500/20 border border-fuchsia-500/50 text-fuchsia-300 flex items-center justify-center shadow-lg shadow-fuchsia-500/20">
              <Bot className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-black text-white tracking-tight">
                  InstaGrand AI Assistant & Photo Guru
                </h3>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-fuchsia-500/20 text-fuchsia-300 border border-fuchsia-400/30">
                  24/7 Smart AI
                </span>
              </div>
              <p className="text-[11px] text-fuchsia-200/80">
                Ask any questions, get AI photo editing prompts & bio ideas
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl bg-zinc-900/80 hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Quick Prompts Chips */}
        <div className="px-4 py-2 bg-purple-950/30 border-b border-purple-900/40 flex items-center gap-2 overflow-x-auto no-scrollbar shrink-0">
          {quickPrompts.map((p, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => handleSendMessage(p.query)}
              className="px-2.5 py-1 rounded-xl bg-zinc-900/90 border border-fuchsia-900/50 hover:border-fuchsia-500 text-zinc-300 hover:text-white text-[11px] font-medium whitespace-nowrap transition-all cursor-pointer"
            >
              {p.label}
            </button>
          ))}
        </div>

        {/* Chat Messages List */}
        <div className="flex-1 p-4 sm:p-5 space-y-3.5 overflow-y-auto">
          {messages.map((msg) => {
            const isUser = msg.sender === 'user';
            return (
              <div
                key={msg.id}
                className={`flex gap-2.5 ${isUser ? 'justify-end' : 'justify-start'}`}
              >
                {!isUser && (
                  <div className="w-7 h-7 rounded-xl bg-fuchsia-600/30 border border-fuchsia-500/40 text-fuchsia-300 flex items-center justify-center shrink-0 mt-0.5">
                    <Bot className="w-3.5 h-3.5" />
                  </div>
                )}

                <div
                  className={`max-w-[85%] p-3.5 rounded-2xl text-xs space-y-1 relative group ${
                    isUser
                      ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-tr-none'
                      : 'bg-zinc-900/90 border border-purple-900/50 text-zinc-200 rounded-tl-none'
                  }`}
                >
                  <div className="whitespace-pre-wrap leading-relaxed font-sans">{msg.text}</div>

                  <div className="flex items-center justify-between pt-1 text-[10px] text-zinc-400">
                    <span>{msg.timestamp}</span>
                    {!isUser && (
                      <button
                        type="button"
                        onClick={() => handleCopy(msg.text, msg.id)}
                        className="opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded hover:bg-zinc-800 text-zinc-400 hover:text-white"
                        title="Copy to clipboard"
                      >
                        {copiedId === msg.id ? (
                          <Check className="w-3 h-3 text-emerald-400" />
                        ) : (
                          <Copy className="w-3 h-3" />
                        )}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}

          {isTyping && (
            <div className="flex gap-2.5 items-center">
              <div className="w-7 h-7 rounded-xl bg-fuchsia-600/30 text-fuchsia-300 flex items-center justify-center shrink-0">
                <Bot className="w-3.5 h-3.5" />
              </div>
              <div className="p-3 rounded-2xl bg-zinc-900/90 border border-purple-900/50 text-zinc-400 text-xs flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-fuchsia-400 animate-bounce" />
                <span className="w-2 h-2 rounded-full bg-purple-400 animate-bounce [animation-delay:0.2s]" />
                <span className="w-2 h-2 rounded-full bg-indigo-400 animate-bounce [animation-delay:0.4s]" />
                <span className="text-[11px] text-zinc-400 ml-1">AI Assistant is thinking...</span>
              </div>
            </div>
          )}
        </div>

        {/* Input Bar */}
        <div className="p-3 sm:p-4 bg-zinc-950 border-t border-purple-900/50 flex items-center gap-2">
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleSendMessage();
            }}
            placeholder="Ask AI anything (photo editing, monetization, questions)..."
            className="flex-1 px-4 py-2.5 rounded-2xl bg-zinc-900 border border-purple-900/60 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-fuchsia-500 transition-colors"
          />

          <button
            type="button"
            onClick={() => handleSendMessage()}
            disabled={!inputText.trim()}
            className="p-2.5 rounded-2xl bg-gradient-to-r from-fuchsia-600 to-purple-600 hover:from-fuchsia-500 hover:to-purple-500 text-white transition-all shadow-md shadow-fuchsia-600/30 disabled:opacity-40 cursor-pointer"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
