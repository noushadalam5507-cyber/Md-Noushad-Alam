import React from 'react';
import { Phone, PhoneOff, Video, Sparkles, Volume2, Shield } from 'lucide-react';

interface IncomingCallBannerProps {
  callerName: string;
  callerUsername: string;
  callerAvatar: string;
  onAccept: () => void;
  onDecline: () => void;
}

export const IncomingCallBanner: React.FC<IncomingCallBannerProps> = ({
  callerName,
  callerUsername,
  callerAvatar,
  onAccept,
  onDecline,
}) => {
  return (
    <div
      id="incoming-call-overlay"
      className="fixed bottom-6 right-6 z-50 animate-bounce-in max-w-sm w-full bg-zinc-950/95 border-2 border-purple-500/80 rounded-2xl p-5 neon-border-purple-lg shadow-2xl backdrop-blur-xl"
    >
      <div className="flex items-center justify-between pb-3 border-b border-purple-900/60">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
          <span className="text-xs font-bold uppercase tracking-wider text-purple-300">
            Incoming 4K Neon Call
          </span>
        </div>
        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-purple-900/60 text-fuchsia-300 border border-purple-700">
          ENCRYPTED
        </span>
      </div>

      <div className="mt-4 flex items-center gap-3.5">
        <div className="relative">
          <img
            src={callerAvatar}
            alt={callerName}
            className="w-14 h-14 rounded-2xl object-cover border-2 border-purple-400 shadow-md shadow-purple-900/50"
          />
          <div className="absolute -bottom-1 -right-1 bg-purple-600 rounded-full p-1 border border-white">
            <Video className="w-3 h-3 text-cyan-300" />
          </div>
        </div>

        <div>
          <h3 className="text-sm font-bold text-white leading-tight">{callerName}</h3>
          <p className="text-xs font-mono text-fuchsia-400">@{callerUsername}</p>
          <p className="text-[11px] text-zinc-400 mt-0.5 flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-amber-400" />
            Requesting Live Video Studio
          </p>
        </div>
      </div>

      <div className="mt-5 flex items-center gap-3">
        <button
          id="accept-incoming-call-btn"
          type="button"
          onClick={onAccept}
          className="flex-1 py-2.5 px-4 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/30 transition-all hover:scale-105 active:scale-95 cursor-pointer"
        >
          <Phone className="w-4 h-4" />
          <span>Accept Call</span>
        </button>

        <button
          id="decline-incoming-call-btn"
          type="button"
          onClick={onDecline}
          className="py-2.5 px-4 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-rose-600/30 transition-all hover:scale-105 active:scale-95 cursor-pointer"
        >
          <PhoneOff className="w-4 h-4" />
          <span>Decline</span>
        </button>
      </div>
    </div>
  );
};
