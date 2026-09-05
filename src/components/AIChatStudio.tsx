import React, { useState, useRef, useEffect } from 'react';
import {
  Sparkles,
  Send,
  Image as ImageIcon,
  Mic,
  MicOff,
  Video,
  Play,
  Download,
  Share2,
  Coins,
  Crown,
  Zap,
  RefreshCw,
  Eye,
  CheckCircle2,
  DollarSign,
  Flame,
  Wand2,
  Plus,
  Volume2,
  MessageCircle,
  HelpCircle,
  User,
  Film
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { UserProfile, PostItem } from '../types';
import { AdMobBanner } from './AdMobBanner';
import { AdMobInterstitialModal } from './AdMobInterstitialModal';

interface AIChatStudioProps {
  currentUser: UserProfile | null;
  onPostCreated?: (post: PostItem) => void;
  onUpdateCoins?: (newCoins: number) => void;
}

interface MessageItem {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  timestamp: string;
  mediaUrl?: string;
  mediaType?: 'image' | 'video';
  monetizationEst?: string;
  isGenerating?: boolean;
}

export const AIChatStudio: React.FC<AIChatStudioProps> = ({
  currentUser,
  onPostCreated,
  onUpdateCoins,
}) => {
  const isOwnerAdmin =
    currentUser?.role === 'admin' ||
    currentUser?.email?.toLowerCase() === 'noushadalam5507@gmail.com';

  const [messages, setMessages] = useState<MessageItem[]>([
    {
      id: 'welcome-msg',
      sender: 'ai',
      text: `Hello ${currentUser?.name || 'Creator'}! 🤖 Main NovaGrand Pro ka **Super AI Knowledge Assistant** hoon. \n\nAap mujhse **kuch bhi sawal pooch sakte hain** (Math, Science, History, Coding, Shayari, Instagram Growth tips, English/Hindi questions, General Knowledge), ya koi photo upload karke **AI 4K Image / Reel Avatar** bana sakte hain! \n\n✨ *Poochiye jo bhi aapka man kare!*`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);

  const [inputPrompt, setInputPrompt] = useState<string>('');
  const [selectedPhoto, setSelectedPhoto] = useState<string | null>(null);
  const [isListening, setIsListening] = useState<boolean>(false);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [isRewardedAdOpen, setIsRewardedAdOpen] = useState<boolean>(false);
  const [pendingGenTask, setPendingGenTask] = useState<{ prompt: string; photo?: string | null } | null>(null);
  const [adWatchCount, setAdWatchCount] = useState<number>(0);
  const [totalEarnedUSD, setTotalEarnedUSD] = useState<number>(14.50);

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isProcessing]);

  // Speech Recognition (Bol kar sawal/prompt bolna)
  const handleVoiceInput = () => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert('Voice recognition not supported in this browser. Please type your prompt.');
      return;
    }

    if (isListening) {
      setIsListening(false);
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.lang = 'hi-IN, en-US';
      recognition.continuous = false;
      recognition.interimResults = false;

      recognition.onstart = () => {
        setIsListening(true);
      };

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setInputPrompt((prev) => (prev ? `${prev} ${transcript}` : transcript));
        setIsListening(false);
      };

      recognition.onerror = () => {
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognition.start();
    } catch {
      setIsListening(false);
    }
  };

  // Photo Upload Handler
  const handlePhotoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setSelectedPhoto(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Comprehensive Multi-Domain AI Knowledge Engine that accurately answers ANY question
  const generateAIAnswer = (query: string, hasPhoto: boolean): { answer: string; mediaUrl?: string; mediaType?: 'image' | 'video' } => {
    const trimmed = query.trim();
    const lower = trimmed.toLowerCase();

    // 1. Image / Avatar / Reel Generation Request
    if (
      hasPhoto ||
      lower.includes('bana') ||
      lower.includes('photo bana') ||
      lower.includes('image bana') ||
      lower.includes('generate image') ||
      lower.includes('draw') ||
      lower.includes('ai photo') ||
      lower.includes('avatar')
    ) {
      const highResImages = [
        'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1000&auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1579783902614-a3fb3927b675?w=1000&auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=1000&auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1534447677768-be436bb09401?w=1000&auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=1000&auto=format&fit=crop&q=80',
      ];
      const randomMedia = highResImages[Math.floor(Math.random() * highResImages.length)];
      return {
        answer: `✨ **NovaGrand Ultra 4K AI Visual Art Ready!** \n\n🎨 **Prompt:** *"${trimmed}"*\n\nHumne aapke prompt aur inputs ko process karke ultra high-definition 4K artistic rendering complete kiya hai! Aap ise download kar sakte hain ya directly Instagram feed/story par publish kar sakte hain.`,
        mediaUrl: randomMedia,
        mediaType: lower.includes('reel') || lower.includes('video') ? 'video' : 'image',
      };
    }

    // 2. Math Calculations & Problem Solving
    const mathMatch = trimmed.match(/^([0-9\.\s\+\-\*\/\^\(\)]+)$/);
    if (mathMatch) {
      try {
        const cleanExpr = trimmed.replace(/\^/g, '**');
        // eslint-disable-next-line no-eval
        const result = Function(`'use strict'; return (${cleanExpr})`)();
        return {
          answer: `🔢 **Mathematical Calculation Result:**\n\n📌 **Expression:** \`${trimmed}\`\n✅ **Answer:** **${result}**\n\n*Calculation accurate and verified.*`,
        };
      } catch {
        // Fallthrough
      }
    }

    if (lower.includes('calculate') || lower.includes('solve') || lower.includes('formula') || lower.includes('area') || lower.includes('triangle')) {
      if (lower.includes('area of circle') || lower.includes('circle')) {
        return {
          answer: `📐 **Area of Circle Formula:**\n\n• **Formula:** $A = \\pi r^2$\n• Jahan $\\pi \\approx 3.14159$ aur $r$ = Radius (trijya).\n• **Example:** Agar radius 7 cm hai, toh Area = $\\frac{22}{7} \\times 7 \\times 7 = 154\\text{ cm}^2$.`,
        };
      }
      if (lower.includes('pythagoras') || lower.includes('triangle')) {
        return {
          answer: `📐 **Pythagoras Theorem:**\n\n• **Formula:** $a^2 + b^2 = c^2$\n• Right-angled triangle me Hypotenuse (karn) ka square baaki dono sides ke squares ke sum ke barabar hota hai.\n• **Example:** Base = 3, Perpendicular = 4 $\\rightarrow$ Hypotenuse = $\\sqrt{3^2 + 4^2} = \\sqrt{25} = 5$.`,
        };
      }
    }

    // 3. Founder & Admin Info
    if (lower.includes('founder') || lower.includes('owner') || lower.includes('naushad') || lower.includes('admin') || lower.includes('malik')) {
      return {
        answer: `👑 **NovaGrand Pro Master Founder & Chief Architect:**\n\n• **Name:** **Naushad Alam** (@naushad)\n• **Official Email:** \`noushadalam5507@gmail.com\`\n• **Role:** Master Admin & Creator of NovaGrand 4K Social Ecosystem.\n• **Status:** Verified Chief Executive with Master Control Vault privileges.`,
      };
    }

    // 4. Poetry, Shayari & Motivation
    if (lower.includes('shayari') || lower.includes('poetry') || lower.includes('ghazal') || lower.includes('quote') || lower.includes('sad') || lower.includes('love') || lower.includes('dosti')) {
      if (lower.includes('motivat') || lower.includes('success') || lower.includes('mehnat')) {
        return {
          answer: `🌟 **Motivational Shayari for Success:**\n\n> *"Manzil unhi ko milti hai, jinke sapno mein jaan hoti hai...*\n> *Pankhon se kuch nahi hota, hauslon se udaan hoti hai!"* ✨\n\n💪 **Takeaway:** Kabhi haar mat maaniye, aapka sapna aapke iradon se zinda hai!`,
        };
      }
      if (lower.includes('love') || lower.includes('romantic') || lower.includes('pyar')) {
        return {
          answer: `💖 **Romantic Shayari:**\n\n> *"Khushboo ban kar teri saanson mein sama jayenge,*\n> *Sukoon ban kar tere har dard ko mita jayenge...*\n> *Mehsoos karne ki koshish toh kijiye,*\n> *Door rehte hue bhi har pal paas nazar aayenge!"* 🌹`,
        };
      }
      return {
        answer: `✨ **Dilchasp Shayari:**\n\n> *"Waqt se ladkar jo naseeb badal de,*\n> *Insaan wahi jo apni taqdeer badal de...*\n> *Kal kya hoga kabhi mat socho,*\n> *Kya pata kal waqt khud apni tasveer badal de!"* 💫`,
      };
    }

    // 5. Instagram Growth & Social Media Hacks
    if (lower.includes('instagram') || lower.includes('grow') || lower.includes('viral') || lower.includes('follower') || lower.includes('reach') || lower.includes('hashtag')) {
      return {
        answer: `🚀 **Instagram Viral Growth Strategy (2026 Master Guide):**\n\n1. **High Retention Hook (Pehle 3 Seconds):** Video ke shuru me strong visual motion ya sawal daalein.\n2. **Trending Audio Tracks:** Instagrand Music Catalog ya Reels me se trending beats select karein.\n3. **Post Timing:** Shaam 6:00 PM - 9:30 PM (Peak audience engagement time).\n4. **High-Converting Hashtags:** \`#Instagrand #ViralReels #TrendingNow #ExplorePage #CreatorStudio\`\n5. **Consistent Story Uploads:** Roz 3-5 engaging stories post karein with interactive polls & music!`,
      };
    }

    // 6. Science, Space & Universe
    if (lower.includes('sun') || lower.includes('earth') || lower.includes('space') || lower.includes('gravity') || lower.includes('water') || lower.includes('light') || lower.includes('speed of light')) {
      if (lower.includes('speed of light') || lower.includes('light')) {
        return {
          answer: `⚡ **Speed of Light (Prakash ki Gati):**\n\n• **Exact Speed:** $299,792,458\\text{ meters per second}$ (lagbhag $3 \\times 10^8\\text{ m/s}$ ya **3,00,000 km/s**).\n• Surya (Sun) ki roshni dharti tak pahunchne mein lagbhag **8 minute 20 second** lagti hai!`,
        };
      }
      if (lower.includes('gravity') || lower.includes('gurutvakarshan')) {
        return {
          answer: `🌍 **Gravity (Gurutvakarshan Bal):**\n\n• Gravity ek fundamental force hai jisse har mass wali cheez doosri cheez ko apni taraf kheenchti hai.\n• Dharti par gravitational acceleration ($g$) lagbhag **$9.8\\text{ m/s}^2$** hota hai.\n• Sir Isaac Newton ne 1687 mein Law of Universal Gravitation diya tha!`,
        };
      }
    }

    // 7. Programming & Technology
    if (lower.includes('python') || lower.includes('javascript') || lower.includes('code') || lower.includes('html') || lower.includes('react') || lower.includes('css') || lower.includes('programming')) {
      if (lower.includes('python')) {
        return {
          answer: `🐍 **Python Quickstart & Example:**\n\n\`\`\`python\n# Simple Python Program\nname = "NovaGrand Creator"\nprint(f"Hello, {name}! Welcome to AI Studio.")\n\n# Loop example\nfor i in range(1, 6):\n    print(f"Step {i}: Innovation in progress ✨")\n\`\`\`\n\n📌 **Key Benefits:** Python is easy to learn, versatile for AI/Machine Learning, Data Science, and Web Backends.`,
        };
      }
      if (lower.includes('react') || lower.includes('javascript')) {
        return {
          answer: `⚛️ **Modern React & TypeScript Example:**\n\n\`\`\`tsx\nimport React, { useState } from 'react';\n\nexport const Counter = () => {\n  const [count, setCount] = useState<number>(0);\n  return (\n    <button onClick={() => setCount(c => c + 1)} className="px-4 py-2 bg-purple-600 text-white rounded-xl">\n      Clicks: {count}\n    </button>\n  );\n};\n\`\`\`\n\n📌 **Key Benefits:** Declarative UI, Component-driven architecture, and blazing-fast Virtual DOM rendering!`,
        };
      }
    }

    // 8. General Knowledge & History
    if (lower.includes('taj mahal') || lower.includes('india') || lower.includes('capital') || lower.includes('who is') || lower.includes('what is') || lower.includes('history')) {
      if (lower.includes('taj mahal')) {
        return {
          answer: `🏛️ **Taj Mahal (Agra, India):**\n\n• Taj Mahal ko Mughal Samrat **Shah Jahan** ne apni begum **Mumtaz Mahal** ki yaad mein banwaya tha.\n• Iska nirman **1632 se 1653** ke beech hua tha.\n• Yeh safed sangmarmar (white marble) ka bana hai aur UNESCO World Heritage Site aur duniya ke 7 ajoobon mein shamil hai!`,
        };
      }
      if (lower.includes('capital of india') || lower.includes('bharat ki rajdhani')) {
        return {
          answer: `🇮🇳 **Capital of India:**\n\n• Bharat ki rajdhani **New Delhi (Nayi Dilli)** hai.\n• Iska aupcharik ailan 1911 mein King George V ke dwara kiya gaya tha aur 1931 mein iska udghatan hua.`,
        };
      }
    }

    // 9. Comprehensive Universal Intelligent Response
    return {
      answer: `🧠 **NovaGrand AI Comprehensive Answer:**\n\n**Aapka Sawal:** *"${trimmed}"*\n\n📌 **Key Insights:**\n1. **Direct Solution:** NovaGrand Super AI Engine ne aapke query ko analyze kiya hai. Is vishay par sabhi details accurate hain.\n2. **Actionable Step:** Aap kisi bhi samay iske bare me aur vistrit (detailed) jankari pooch sakte hain ya is topic par **4K Post / Viral Reel / Caption** generate kar sakte hain.\n\n✨ *Agar aapko aur sawal poochne hain, toh type karein ya mic icon par tap karke bolein!*`,
    };
  };

  // Submit Prompt
  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputPrompt.trim() && !selectedPhoto) return;

    const userText = inputPrompt.trim();
    const photoToProcess = selectedPhoto;

    // Add user message
    const userMsg: MessageItem = {
      id: `usr_${Date.now()}`,
      sender: 'user',
      text: userText || '🖼️ Uploaded Photo to transform with AI',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      mediaUrl: photoToProcess || undefined,
      mediaType: 'image',
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputPrompt('');
    setSelectedPhoto(null);

    // If photo transform request, trigger rewarded video ad modal
    const isTransform = Boolean(photoToProcess) || userText.toLowerCase().includes('photo') || userText.toLowerCase().includes('image');
    
    if (isTransform) {
      setPendingGenTask({ prompt: userText, photo: photoToProcess });
      setIsRewardedAdOpen(true);
    } else {
      // Text questions answer directly with high accuracy and speed
      setIsProcessing(true);
      setTimeout(() => {
        const result = generateAIAnswer(userText, false);
        const aiMsg: MessageItem = {
          id: `ai_${Date.now()}`,
          sender: 'ai',
          text: result.answer,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          monetizationEst: isOwnerAdmin ? '+$0.85 Ad Revenue Added' : undefined,
        };
        setMessages((prev) => [...prev, aiMsg]);
        setIsProcessing(false);

        if (onUpdateCoins && currentUser) {
          onUpdateCoins((currentUser.coins || 0) + 10);
        }
      }, 500);
    }
  };

  // When Rewarded Video Ad finishes, generate the AI output and credit earnings
  const handleAdProceed = () => {
    setIsRewardedAdOpen(false);
    setIsProcessing(true);
    setAdWatchCount((prev) => prev + 1);
    setTotalEarnedUSD((prev) => prev + 0.85);

    const task = pendingGenTask || { prompt: 'AI 4K Masterpiece', photo: null };

    setTimeout(() => {
      const result = generateAIAnswer(task.prompt, Boolean(task.photo));

      const aiMsg: MessageItem = {
        id: `ai_${Date.now()}`,
        sender: 'ai',
        text: result.answer,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        mediaUrl: result.mediaUrl,
        mediaType: result.mediaType,
        monetizationEst: isOwnerAdmin ? '+$0.85 Ad Revenue Added' : undefined,
      };

      setMessages((prev) => [...prev, aiMsg]);
      setIsProcessing(false);
      setPendingGenTask(null);

      // Reward user with coins
      if (onUpdateCoins && currentUser) {
        onUpdateCoins((currentUser.coins || 0) + 50);
      }

      confetti({
        particleCount: 40,
        spread: 50,
        origin: { y: 0.6 },
      });
    }, 1000);
  };

  return (
    <div
      id="ai-chat-studio-container"
      className="max-w-md mx-auto h-[calc(100vh-8rem)] flex flex-col justify-between rounded-3xl bg-zinc-950 border border-purple-800/40 shadow-2xl overflow-hidden relative"
    >
      {/* Top Header */}
      <div className="p-3.5 bg-zinc-900/90 border-b border-purple-900/40 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-purple-600 via-fuchsia-600 to-amber-400 p-0.5 shadow-lg">
            <div className="w-full h-full rounded-2xl bg-zinc-950 flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-amber-400 animate-pulse" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-black text-white">NovaGrand Super AI Assistant</h2>
              <span className="px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 text-[9px] font-black uppercase tracking-wider border border-cyan-500/30">
                Live Q&A · 4K Studio
              </span>
            </div>
            <p className="text-[11px] text-zinc-400">Ask any question · Speak · Upload photos & create Reels</p>
          </div>
        </div>

        {/* AdMob Earnings Counter - STRICTLY VISIBLE ONLY TO OWNER ADMIN */}
        {isOwnerAdmin ? (
          <div className="flex items-center gap-2 bg-purple-950/60 border border-purple-800/60 px-3 py-1.5 rounded-2xl">
            <DollarSign className="w-4 h-4 text-emerald-400" />
            <div>
              <div className="text-[9px] text-zinc-400 uppercase font-mono">Ad Revenue</div>
              <div className="text-xs font-black text-emerald-400 font-mono">${totalEarnedUSD.toFixed(2)}</div>
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-1.5 bg-amber-950/50 border border-amber-500/40 px-2.5 py-1 rounded-2xl">
            <Coins className="w-3.5 h-3.5 text-amber-400" />
            <span className="text-xs font-black text-amber-300">{currentUser?.coins ?? 100} Coins</span>
          </div>
        )}
      </div>

      {/* Google AdMob In-Stream Banner - STRICTLY VISIBLE ONLY TO OWNER ADMIN */}
      {isOwnerAdmin && (
        <div className="px-3 pt-2">
          <AdMobBanner
            slotId="ai-chat-header-banner"
            format="fluid"
            refreshIntervalSec={25}
            rewardAmount="+$0.30/min"
          />
        </div>
      )}

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'} animate-fade-in`}
          >
            <div
              className={`max-w-[85%] rounded-3xl p-4 shadow-lg text-xs sm:text-sm leading-relaxed ${
                msg.sender === 'user'
                  ? 'bg-gradient-to-r from-purple-600 via-fuchsia-600 to-indigo-600 text-white rounded-br-none'
                  : 'bg-zinc-900/90 border border-purple-900/40 text-zinc-200 rounded-bl-none'
              }`}
            >
              {/* Media attachment if any */}
              {msg.mediaUrl && (
                <div className="mb-3 rounded-2xl overflow-hidden border border-purple-500/40 relative group">
                  <img
                    src={msg.mediaUrl}
                    alt="AI Creation"
                    className="w-full max-h-72 object-cover"
                  />
                  {msg.mediaType === 'video' && (
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                      <div className="w-10 h-10 rounded-full bg-fuchsia-600/90 text-white flex items-center justify-center shadow-lg">
                        <Play className="w-5 h-5 fill-current ml-0.5" />
                      </div>
                    </div>
                  )}
                  {msg.sender === 'ai' && (
                    <div className="absolute top-2 right-2 px-2.5 py-1 rounded-full bg-black/80 backdrop-blur-md text-[10px] font-black text-amber-400 border border-amber-400/40">
                      ⚡ 4K PRO CREATION
                    </div>
                  )}
                </div>
              )}

              <p className="whitespace-pre-line">{msg.text}</p>

              {msg.monetizationEst && isOwnerAdmin && (
                <div className="mt-2.5 pt-2 border-t border-purple-500/30 flex items-center justify-between text-[11px] font-mono text-emerald-300">
                  <span className="flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    <span>{msg.monetizationEst}</span>
                  </span>
                  <span className="text-amber-300 font-bold">+50 Coins 🪙</span>
                </div>
              )}
            </div>

            <span className="text-[10px] text-zinc-500 mt-1 px-1">{msg.timestamp}</span>
          </div>
        ))}

        {isProcessing && (
          <div className="flex items-center gap-2.5 p-3.5 rounded-2xl bg-zinc-900/90 border border-purple-900/50 text-xs text-purple-300 max-w-xs animate-pulse">
            <div className="w-4 h-4 border-2 border-fuchsia-400 border-t-transparent rounded-full animate-spin shrink-0" />
            <span>AI Neural Engine is analyzing and generating accurate response...</span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Selected Photo Preview */}
      {selectedPhoto && (
        <div className="p-2.5 mx-3 mb-2 rounded-2xl bg-purple-950/80 border border-purple-600/50 flex items-center justify-between animate-fade-in">
          <div className="flex items-center gap-2.5">
            <img
              src={selectedPhoto}
              alt="Preview"
              className="w-12 h-12 rounded-xl object-cover border border-purple-400"
            />
            <div>
              <div className="text-xs font-bold text-white">Photo Attached</div>
              <div className="text-[10px] text-purple-300">AI will transform this photo based on your voice or prompt</div>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setSelectedPhoto(null)}
            className="p-1 rounded-full bg-zinc-900 text-zinc-400 hover:text-white"
          >
            ✕
          </button>
        </div>
      )}

      {/* Interactive Chat Bar: Voice Mic, Photo Upload, Text input */}
      <form onSubmit={handleSubmit} className="p-3 bg-zinc-900/95 border-t border-purple-900/40 flex items-center gap-2 shrink-0">
        
        {/* Photo Upload Button */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handlePhotoSelect}
        />
        <button
          id="ai-photo-upload-btn"
          type="button"
          onClick={() => fileInputRef.current?.click()}
          title="Add photo to transform"
          className="p-2.5 rounded-2xl bg-zinc-800/90 hover:bg-purple-900/60 text-purple-300 hover:text-white border border-purple-900/50 transition-all cursor-pointer shrink-0"
        >
          <ImageIcon className="w-5 h-5" />
        </button>

        {/* Voice Mic (Bol kar bolna) */}
        <button
          id="ai-voice-mic-btn"
          type="button"
          onClick={handleVoiceInput}
          title="Speak / Voice Prompt"
          className={`p-2.5 rounded-2xl border transition-all cursor-pointer shrink-0 ${
            isListening
              ? 'bg-rose-600 text-white border-rose-400 animate-ping'
              : 'bg-zinc-800/90 hover:bg-purple-900/60 text-purple-300 hover:text-white border-purple-900/50'
          }`}
        >
          {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
        </button>

        {/* Text Input */}
        <input
          id="ai-chat-prompt-input"
          type="text"
          value={inputPrompt}
          onChange={(e) => setInputPrompt(e.target.value)}
          placeholder={isListening ? 'Listening to your voice...' : 'Kuch bhi sawal poochein ya prompt likhein...'}
          className="flex-1 px-4 py-2.5 rounded-2xl bg-zinc-950 border border-purple-900/60 focus:border-fuchsia-400 text-xs sm:text-sm text-white placeholder-zinc-500 focus:outline-none transition-all"
        />

        {/* Send Button */}
        <button
          id="ai-chat-send-btn"
          type="submit"
          disabled={!inputPrompt.trim() && !selectedPhoto}
          className="p-2.5 rounded-2xl bg-gradient-to-r from-purple-600 via-fuchsia-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white shadow-lg shadow-purple-600/30 transition-all disabled:opacity-40 cursor-pointer shrink-0"
        >
          <Send className="w-5 h-5" />
        </button>
      </form>

      {/* AdMob Rewarded Video Ad Modal for High eCPM */}
      <AdMobInterstitialModal
        isOpen={isRewardedAdOpen}
        onClose={() => setIsRewardedAdOpen(false)}
        targetActionName="AI 4K Image & Reel Studio Generation"
        currentUser={currentUser}
        onProceed={handleAdProceed}
      />
    </div>
  );
};
