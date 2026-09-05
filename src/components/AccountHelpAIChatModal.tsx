import React, { useState } from 'react';
import {
  X,
  Bot,
  Send,
  Sparkles,
  ShieldCheck,
  Coins,
  KeyRound,
  AtSign,
  Video,
  Lock,
  DollarSign,
  CheckCircle2,
  Copy,
  Check,
  HelpCircle,
  Smartphone,
  Flame,
  ArrowRight,
  RefreshCw
} from 'lucide-react';
import { UserProfile, ViewTab } from '../types';

interface HelpMessage {
  id: string;
  sender: 'ai' | 'user';
  text: string;
  timestamp: string;
  actionButton?: {
    label: string;
    actionType: 'reset-password' | 'claim-username' | 'app-lock' | 'reels-view' | 'coin-store' | 'lucky-spin' | 'app-update';
  };
}

interface AccountHelpAIChatModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: UserProfile | null;
  onNavigateTab?: (tab: ViewTab) => void;
  onOpenForgotPassword?: () => void;
  onOpenAppLock?: () => void;
  onOpenCoinStore?: () => void;
  onOpenLuckySpin?: () => void;
  onOpenAppUpdate?: () => void;
}

export const AccountHelpAIChatModal: React.FC<AccountHelpAIChatModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onNavigateTab,
  onOpenForgotPassword,
  onOpenAppLock,
  onOpenCoinStore,
  onOpenLuckySpin,
  onOpenAppUpdate,
}) => {
  const [messages, setMessages] = useState<HelpMessage[]>([
    {
      id: 'm-welcome',
      sender: 'ai',
      text: `नमस्ते ${currentUser?.name || 'Creator'}! 🙏 मैं आपका **InstaGrand Account Support AI Assistant** हूँ।\n\nआप मुझसे अकाउंट, पासवर्ड रिसेट, यूजरनेम, कॉइन्स कमाई, रील्स अपलोड, ऐप लॉक या इन-ऐप अपडेट से संबंधित कोई भी सवाल पूछ सकते हैं। मैं आपको तुरंत सटीक जानकारी और डायरेक्ट बटन दूंगा!`,
      timestamp: 'Just now',
    },
  ]);
  const [inputQuery, setInputQuery] = useState<string>('');
  const [isTyping, setIsTyping] = useState<boolean>(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  if (!isOpen) return null;

  const quickQuestions = [
    {
      label: '🔑 पासवर्ड कैसे रिसेट करें?',
      query: 'मैं अपना पासवर्ड कैसे रिसेट या रिकवर करूँ?',
    },
    {
      label: '💰 कॉइन्स और पैसे कैसे कमाएं?',
      query: 'InstaGrand ऐप में कॉइन्स और AdMob से पैसे कैसे कमाए जा सकते हैं?',
    },
    {
      label: '🆔 यूजरनेम कैसे क्लेम / बदलें?',
      query: 'मैं अपना मनपसंद @username कैसे क्लेम या चेंज करूँ?',
    },
    {
      label: '🔒 ऐप और चैट लॉक कैसे लगाएं?',
      query: 'ऐप में पिन कोड, फिंगरप्रिंट या चैट लॉक कैसे सेट करें?',
    },
    {
      label: '🎥 वायरल रील्स कैसे पोस्ट करें?',
      query: 'रील्स कैमरा से 4K वीडियो कैसे रिकॉर्ड और पोस्ट करें?',
    },
    {
      label: '📲 इन-ऐप UI अपडेट कैसे करें?',
      query: 'ऐप के अंदर ही नया UI अपडेट कैसे प्राप्त करें?',
    },
  ];

  const handleSend = (text?: string) => {
    const query = (text || inputQuery).trim();
    if (!query) return;

    const userMsg: HelpMessage = {
      id: `usr-${Date.now()}`,
      sender: 'user',
      text: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!text) setInputQuery('');
    setIsTyping(true);

    setTimeout(() => {
      let reply = '';
      let actionBtn: HelpMessage['actionButton'] = undefined;
      const lower = query.toLowerCase();

      // 1. Password Reset / Recovery
      if (lower.includes('password') || lower.includes('पासवर्ड') || lower.includes('reset') || lower.includes('रिसेट') || lower.includes('recover') || lower.includes('bhul') || lower.includes('भूल')) {
        reply = `🔑 **पासवर्ड रिसेट करने की पूरी प्रक्रिया**:
1. लॉगिन स्क्रीन पर जाएं और **"Forgot Password?"** पर टैप करें।
2. अपना रजिस्टर्ड ईमेल (जैसे \`${currentUser?.email || 'your_email@gmail.com'}\`) दर्ज करें।
3. **"Send Reset Link"** पर क्लिक करें।
4. आपके Gmail पर Firebase की तरफ से एक सुरक्षित पासवर्ड रीसेट लिंक तुरंत प्राप्त होगा, जिस पर क्लिक करके आप नया पासवर्ड बना सकते हैं!`;
        actionBtn = { label: '🔑 Open Password Reset', actionType: 'reset-password' };
      }
      // 2. Coins & Earnings & Monetization
      else if (lower.includes('coin') || lower.includes('कॉइन') || lower.includes('earn') || lower.includes('kamaye') || lower.includes('कमाई') || lower.includes('money') || lower.includes('पैसे') || lower.includes('admob') || lower.includes('tip')) {
        reply = `💰 **InstaGrand में कॉइन्स और कमाई के 5 तरीके**:
1. **Daily Lucky Spin**: रोज़ 1 फ्री स्पिन घुमाएं और 1,000 कॉइन्स तक जीतें!
2. **Bandwidth Monetization**: बैकग्राउंड ट्रैफिक शेयरिंग से ₹12.50/GB के हिसाब से कॉइन्स प्राप्त करें।
3. **Reels Video AdMob Revenue**: 4K रील्स पोस्ट करने पर हर वीडियो पर +25 कॉइन्स और AdMob रेवेन्यू ड्रॉप मिलता है।
4. **Creator Tips**: आपके फॉलोअर्स आपको 20, 50, 100 कॉइन्स टिप कर सकते हैं (जिसका 80% सीधा आपके वॉलेट में जाता है)।
5. **Watch Ads**: Rewarded Video Ads देखकर तुरंत +50 कॉइन्स पाएं!`;
        actionBtn = { label: '🎡 Play Lucky Spin & Win', actionType: 'lucky-spin' };
      }
      // 3. Username Claim / Change
      else if (lower.includes('username') || lower.includes('यूजरनेम') || lower.includes('handle') || lower.includes('नाम') || lower.includes('claim')) {
        reply = `🆔 **यूनिक @Username क्लेम और बदलने का तरीका**:
1. ऐप के **"Handle Registry"** (Search/Checker) टैब में जाएं।
2. अपना मनपसंद हैंडल (उदा. @${currentUser?.username || 'naushad'}) सर्च करें।
3. यदि वह उपलब्ध है, तो **"Claim Username"** पर टैप करें।
4. यह यूजरनेम तुरंत Firebase Firestore डेटाबेस में आपके अकाउंट के साथ हमेशा के लिए रिज़र्व हो जाएगा!`;
        actionBtn = { label: '🆔 Check & Claim Username', actionType: 'claim-username' };
      }
      // 4. App Lock & Security
      else if (lower.includes('lock') || lower.includes('लॉक') || lower.includes('pin') || lower.includes('पिन') || lower.includes('fingerprint') || lower.includes('फिंगरप्रिंट') || lower.includes('pattern') || lower.includes('security') || lower.includes('सुरक्षा')) {
        reply = `🔒 **ऐप लॉक और चैट लॉक सुरक्षा सेटिंग्स**:
1. **In-App App Lock**: आप 4-अंकीय PIN, बायोमेट्रिक फिंगरप्रिंट या 3x3 पैटर्न लॉक सेट कर सकते हैं।
2. **Custom Chat Lock**: Direct Messages में किसी भी चैट को पर्सनल 4-डिजिट पासवर्ड से लॉक किया जा सकता है।
3. **Auto-Lock**: बैकग्राउंड में जाते ही ऐप अपने आप लॉक हो जाता है।`;
        actionBtn = { label: '🔒 Configure App Lock', actionType: 'app-lock' };
      }
      // 5. Reels / Video Posting
      else if (lower.includes('reel') || lower.includes('रील') || lower.includes('video') || lower.includes('वीडियो') || lower.includes('camera') || lower.includes('कैमरा') || lower.includes('music') || lower.includes('गाना')) {
        reply = `🎥 **4K रील्स और कैमरा स्टूडियो का उपयोग**:
1. रील्स सेक्शन में जाकर ऊपर **"+" (Create Reel)** बटन दबाएं।
2. **Live 9:16 Camera**: सीधे मोबाइल कैमरे से ब्यूटी फिल्टर और टाइमर के साथ 60s तक रिकॉर्ड करें।
3. **Gallery Upload**: अपनी फोन गैलरी से कोई भी 4K MP4 वीडियो सिलेक्ट करें।
4. **Music Selector**: बॉलीवुड, उर्दू, स्लोएड या इंग्लिश म्यूजिक कैटलॉग से ट्रेंडिंग गाना लगाएं और पोस्ट करें!`;
        actionBtn = { label: '🎥 Open Reels Studio', actionType: 'reels-view' };
      }
      // 6. UI In-App Update
      else if (lower.includes('update') || lower.includes('अपडेट') || lower.includes('island') || lower.includes('आयरलैंड') || lower.includes('ui')) {
        reply = `📲 **In-App UI Live Update System**:
- जब भी डेवलपर/फाउंडर ऐप में कोई नया बदलाव करता है, तो स्क्रीन के ऊपर **Dynamic Island** में तुरंत **"New OTA UI Update Available"** का नोटिफिकेशन आता है।
- आपको प्ले स्टोर से दोबारा ऐप डाउनलोड करने की ज़रूरत नहीं है; बस **"Update Now"** पर टैप करते ही ऐप के अंदर नया UI तुरंत एक्टिव हो जाता है और बोनस कॉइन्स भी मिलते हैं!`;
        actionBtn = { label: '📲 Check In-App Update', actionType: 'app-update' };
      }
      // Default
      else {
        reply = `🤖 **InstaGrand Assistant Help**:
नमस्ते! आपके सवाल "\`${query}\`" के लिए:
- आप अपना अकाउंट मैनेज करने, पासवर्ड रीसेट करने, कॉइन्स बढ़ाने, 4K रील्स स्वाइप करने और इन-ऐप अपडेट्स पाने के लिए नीचे दिए गए त्वरित विकल्पों का उपयोग कर सकते हैं।
- किसी विशिष्ट मदद के लिए आप "पासवर्ड", "कॉइन्स", "यूजरनेम", "रील्स" या "सुरक्षा" लिखकर पूछ सकते हैं!`;
        actionBtn = { label: '🎥 Watch Infinite Reels', actionType: 'reels-view' };
      }

      const aiMsg: HelpMessage = {
        id: `ai-${Date.now()}`,
        sender: 'ai',
        text: reply,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        actionButton: actionBtn,
      };

      setMessages((prev) => [...prev, aiMsg]);
      setIsTyping(false);
    }, 600);
  };

  const handleActionClick = (actionType: HelpMessage['actionButton']['actionType']) => {
    onClose();
    if (actionType === 'reset-password' && onOpenForgotPassword) {
      onOpenForgotPassword();
    } else if (actionType === 'claim-username' && onNavigateTab) {
      onNavigateTab('username-checker');
    } else if (actionType === 'app-lock' && onOpenAppLock) {
      onOpenAppLock();
    } else if (actionType === 'reels-view' && onNavigateTab) {
      onNavigateTab('reels');
    } else if (actionType === 'coin-store' && onOpenCoinStore) {
      onOpenCoinStore();
    } else if (actionType === 'lucky-spin' && onOpenLuckySpin) {
      onOpenLuckySpin();
    } else if (actionType === 'app-update' && onOpenAppUpdate) {
      onOpenAppUpdate();
    }
  };

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div
      id="account-help-ai-modal"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/85 backdrop-blur-md animate-fade-in"
      onClick={onClose}
    >
      <div
        className="w-full max-w-xl h-[88vh] max-h-[720px] rounded-3xl bg-zinc-950 border-2 border-purple-600/70 shadow-[0_0_50px_rgba(168,85,247,0.4)] flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 bg-gradient-to-r from-purple-950/90 via-zinc-950 to-indigo-950/90 border-b border-purple-900/60 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-purple-600 to-fuchsia-600 flex items-center justify-center text-white shadow-lg shadow-purple-600/50">
                <Bot className="w-5 h-5 animate-pulse" />
              </div>
              <span className="absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full bg-emerald-500 border-2 border-zinc-950 ring-2 ring-emerald-500/50" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-black text-white">Help AI Assistant</h3>
                <span className="px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/40 text-[10px] font-bold">
                  24/7 Account Care
                </span>
              </div>
              <p className="text-[11px] text-zinc-400">
                Instant answers & automated account navigation
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl bg-zinc-900/80 hover:bg-zinc-800 text-zinc-400 hover:text-white border border-purple-900/40 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Chat Messages Body */}
        <div className="flex-1 p-4 overflow-y-auto space-y-3.5">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
            >
              <div
                className={`max-w-[88%] p-3.5 rounded-2xl text-xs leading-relaxed ${
                  msg.sender === 'user'
                    ? 'bg-gradient-to-r from-purple-600 to-fuchsia-600 text-white rounded-br-none shadow-md shadow-purple-600/20'
                    : 'bg-zinc-900/95 border border-purple-900/60 text-zinc-200 rounded-bl-none shadow-md'
                }`}
              >
                <div className="whitespace-pre-wrap font-sans">{msg.text}</div>

                {/* Direct Action Button attached to AI message */}
                {msg.actionButton && (
                  <div className="mt-3 pt-2.5 border-t border-purple-800/40">
                    <button
                      type="button"
                      onClick={() => handleActionClick(msg.actionButton!.actionType)}
                      className="w-full py-2 px-3 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg hover:scale-[1.02] transition-all cursor-pointer"
                    >
                      <span>{msg.actionButton.label}</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}

                <div className="flex items-center justify-between gap-3 mt-1.5 pt-1 text-[10px] text-zinc-400">
                  <span>{msg.timestamp}</span>
                  {msg.sender === 'ai' && (
                    <button
                      type="button"
                      onClick={() => handleCopy(msg.id, msg.text)}
                      className="hover:text-purple-300 transition-colors flex items-center gap-1 cursor-pointer"
                    >
                      {copiedId === msg.id ? (
                        <Check className="w-3 h-3 text-emerald-400" />
                      ) : (
                        <Copy className="w-3 h-3" />
                      )}
                      <span>{copiedId === msg.id ? 'Copied' : 'Copy'}</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}

          {isTyping && (
            <div className="flex items-center gap-2 p-3 rounded-2xl bg-zinc-900/80 border border-purple-900/40 w-fit">
              <Bot className="w-4 h-4 text-purple-400 animate-spin" />
              <span className="text-xs text-purple-300">Help AI is thinking...</span>
            </div>
          )}
        </div>

        {/* Quick Question Chips */}
        <div className="p-2.5 bg-zinc-950 border-t border-purple-900/50 overflow-x-auto shrink-0 flex items-center gap-2 no-scrollbar">
          {quickQuestions.map((q, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => handleSend(q.query)}
              className="px-2.5 py-1.5 rounded-xl bg-zinc-900 hover:bg-purple-950/60 border border-purple-900/60 hover:border-purple-500/80 text-zinc-300 hover:text-white text-[11px] font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <span>{q.label}</span>
            </button>
          ))}
        </div>

        {/* Input Bar */}
        <div className="p-3 bg-zinc-950 border-t border-purple-900/60 shrink-0 flex items-center gap-2">
          <input
            type="text"
            value={inputQuery}
            onChange={(e) => setInputQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleSend();
            }}
            placeholder="Ask anything about your account, password, coins..."
            className="flex-1 px-3.5 py-2.5 rounded-2xl bg-zinc-900 border border-purple-900/60 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-purple-500 transition-colors"
          />
          <button
            type="button"
            onClick={() => handleSend()}
            disabled={!inputQuery.trim() || isTyping}
            className="p-2.5 rounded-2xl bg-gradient-to-r from-purple-600 to-fuchsia-600 hover:from-purple-500 hover:to-fuchsia-500 text-white disabled:opacity-40 transition-all cursor-pointer shadow-lg"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
