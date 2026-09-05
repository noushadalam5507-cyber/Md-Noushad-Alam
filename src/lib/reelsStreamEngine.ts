import { ReelItem, ReelComment, REELS_DATA } from '../data/reelsData';
import { MUSIC_CATALOG, MusicTrackItem } from '../data/musicTracks';

// Extensive pool of verified high-performance MP4 video streams
export const VIRAL_VIDEO_STREAMS = [
  {
    url: 'https://test-videos.co.uk/vids/bigbuckbunny/mp4/h264/720/Big_Buck_Bunny_720_10s_1MB.mp4',
    poster: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=600&auto=format&fit=crop&q=80',
    category: 'hindi' as const,
    vibe: 'Bollywood Stage & Neon Studio',
  },
  {
    url: 'https://test-videos.co.uk/vids/sintel/mp4/h264/720/Sintel_720_10s_1MB.mp4',
    poster: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=600&auto=format&fit=crop&q=80',
    category: 'slowed' as const,
    vibe: 'Slowed Cinematic & Sunset Glow',
  },
  {
    url: 'https://test-videos.co.uk/vids/tears-of-steel/mp4/h264/720/Tears_of_Steel_720_10s_1MB.mp4',
    poster: 'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?w=600&auto=format&fit=crop&q=80',
    category: 'english' as const,
    vibe: 'Cyberpunk Futuristic Neon Beats',
  },
  {
    url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
    poster: 'https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?w=600&auto=format&fit=crop&q=80',
    category: 'hindi' as const,
    vibe: 'High Energy Dance & Street Beats',
  },
  {
    url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
    poster: 'https://images.unsplash.com/photo-1506157786151-b8491531f063?w=600&auto=format&fit=crop&q=80',
    category: 'urdu' as const,
    vibe: 'Mystic Mountains & Sufi Waves',
  },
  {
    url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4',
    poster: 'https://images.unsplash.com/photo-1518609878373-06d740f60d8b?w=600&auto=format&fit=crop&q=80',
    category: 'english' as const,
    vibe: 'Urban Street Festival & Lights',
  },
  {
    url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyBlazes.mp4',
    poster: 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=600&auto=format&fit=crop&q=80',
    category: 'slowed' as const,
    vibe: 'Midnight Lo-Fi Driving Horizon',
  },
  {
    url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerMeltdowns.mp4',
    poster: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=600&auto=format&fit=crop&q=80',
    category: 'hindi' as const,
    vibe: 'Festive Colors & Desi Beat Blast',
  },
  {
    url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/WeAreGoingOnBullrun.mp4',
    poster: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=600&auto=format&fit=crop&q=80',
    category: 'english' as const,
    vibe: 'Exotic Beach Sunset Ride',
  },
  {
    url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/SubaruOutbackSeeTheWorld.mp4',
    poster: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=600&auto=format&fit=crop&q=80',
    category: 'urdu' as const,
    vibe: 'Aesthetic Desert & Lantern Night',
  },
  {
    url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/WhatCarCanYouGetForAGrand.mp4',
    poster: 'https://images.unsplash.com/photo-1519741497674-611481863552?w=600&auto=format&fit=crop&q=80',
    category: 'slowed' as const,
    vibe: 'Chill Bedroom Lo-Fi & Rain Glow',
  },
  {
    url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
    poster: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?w=600&auto=format&fit=crop&q=80',
    category: 'hindi' as const,
    vibe: 'Mumbai Marine Drive Monsoon Vibes',
  },
];

// Diverse creator profiles
const CREATOR_POOL = [
  {
    name: 'Priya Kapoor',
    username: 'priyavibes',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80',
    verified: true,
  },
  {
    name: 'Kabir Khan',
    username: 'kabir_beats',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80',
    verified: true,
  },
  {
    name: 'Zoya Malik',
    username: 'zoya_sufi',
    avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=200&auto=format&fit=crop&q=80',
    verified: false,
  },
  {
    name: 'Aryan Mehta',
    username: 'aryan_travels',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&auto=format&fit=crop&q=80',
    verified: true,
  },
  {
    name: 'Simran Kaur',
    username: 'simran_dance',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&auto=format&fit=crop&q=80',
    verified: true,
  },
  {
    name: 'Rohan Sharma',
    username: 'rohansharma',
    avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&auto=format&fit=crop&q=80',
    verified: true,
  },
  {
    name: 'Ananya Roy',
    username: 'ananya_lofi',
    avatar: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=200&auto=format&fit=crop&q=80',
    verified: false,
  },
  {
    name: 'Dev Rajput',
    username: 'dev_cyber',
    avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=200&auto=format&fit=crop&q=80',
    verified: true,
  },
  {
    name: 'Naushad Alam',
    username: 'naushad',
    avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&auto=format&fit=crop&q=80',
    verified: true,
  },
  {
    name: 'Sameer Alvi',
    username: 'sameer_qawwal',
    avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=200&auto=format&fit=crop&q=80',
    verified: true,
  },
];

const CAPTION_TEMPLATES = [
  'Yo Yo Honey Singh is back! 👑🔥 Millionaire bass drop hits different! Tag your squad! #YoYoHoneySingh #Millionaire #ViralReels #Glory',
  'Brown Rang OG vibe never dies! 🕶️✨ Desi hip-hop king! #BrownRang #HoneySingh #IndianReels #DesiSwag',
  'Blue Eyes Hypnotize club party beat! 💙⚡ Full volume on loop! #BlueEyes #HoneySingh #ClubAnthem #InstagrandViral',
  'Bass drop at 0:15 is pure magic 🔥 Tag someone who loves this vibe! ✨ #Viral #Instagrand #ReelsIndia',
  'Monsoon evening in Mumbai hits differently with this track 🌧️🎧 #HindiReels #SlowedReverb #ArijitSingh',
  '4K Neon Studio live! Drop a heart if you are listening on loop 💜 #Trending2026 #NeonVibes #Instagrand',
  'Kuch khas lamhe jo dil ke kareeb hote hain... 🌙✨ #SufiVibes #UrduPoetry #Heartfelt',
  'Late night drive playlist just found its anthem 🌌🚘 Turn up the volume! #LoFiBeats #MidnightChill',
  'Dance challenge accepted! What score out of 10 would you give this? 💃🕺 #DanceReel #BollywoodHit',
  'POV: You finally unlocked the VIP sound experience on Instagrand ⚡🎧 #VIPAudio #ProSounds',
  'Sunsets & soulful melodies heal everything 🌅 Drop your favorite lyric below! 👇 #Peaceful #GoldenHour',
  'Wait for the smooth transition... How was that? 🔥✨ #VideoEditing #ReelsTrend #Instagrand',
  'Dil se nikli aawaaz hamesha dil tak jaati hai ❤️ #UrduSufi #NusratVibes #Soulful',
];

const COMMENTS_POOL: ReelComment[] = [
  {
    id: 'comm-1',
    authorName: 'Riya Sen',
    authorUsername: 'riya_sen',
    authorAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&auto=format&fit=crop&q=80',
    text: 'Audio quality is so crisp! Listening on headphones 🔥',
    timestamp: '5m ago',
    likes: 42,
    isVerified: true,
  },
  {
    id: 'comm-2',
    authorName: 'Aarav Gupta',
    authorUsername: 'aarav_g',
    authorAvatar: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=100&auto=format&fit=crop&q=80',
    text: 'Bro that transition at 0:08 was unbelievable 🤯✨',
    timestamp: '18m ago',
    likes: 89,
    isVerified: false,
  },
  {
    id: 'comm-3',
    authorName: 'Fatima Zahra',
    authorUsername: 'fatima_z',
    authorAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80',
    text: 'Pure peace for the soul 🌙 SubhanAllah!',
    timestamp: '32m ago',
    likes: 115,
    isVerified: true,
  },
  {
    id: 'comm-4',
    authorName: 'Naushad Alam',
    authorUsername: 'naushad',
    authorAvatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&auto=format&fit=crop&q=80',
    text: 'Verified 4K Ultra HD Stream! Keep sharing the love ❤️🚀',
    timestamp: '1h ago',
    likes: 340,
    isVerified: true,
  },
];

/**
 * Generates an infinite batch of brand-new, never-before-seen dynamic reels.
 * Guarantees varied videos, varied creators, verified metadata, and realistic metrics.
 */
export function generateDynamicReelBatch(
  page: number,
  batchSize = 10,
  existingIds = new Set<string>(),
  targetCategory = 'all'
): ReelItem[] {
  const newBatch: ReelItem[] = [];
  const musicList = MUSIC_CATALOG;

  for (let i = 0; i < batchSize; i++) {
    const streamIndex = (page * batchSize + i) % VIRAL_VIDEO_STREAMS.length;
    const stream = VIRAL_VIDEO_STREAMS[streamIndex];
    const creator = CREATOR_POOL[(page * batchSize + i * 3) % CREATOR_POOL.length];
    const track: MusicTrackItem = musicList[(page * batchSize + i * 2) % musicList.length] || musicList[0];
    const caption = CAPTION_TEMPLATES[(page * batchSize + i) % CAPTION_TEMPLATES.length];

    const reelCategory = (targetCategory !== 'all' && ['hindi', 'english', 'urdu', 'slowed'].includes(targetCategory))
      ? (targetCategory as 'hindi' | 'english' | 'urdu' | 'slowed')
      : stream.category;

    const uniqueId = `dyn-reel-${page}-${i}-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 6)}`;

    // Avoid duplicates
    if (existingIds.has(uniqueId)) continue;

    const baseLikes = Math.floor(12000 + Math.random() * 180000);
    const baseViews = Math.floor(baseLikes * (3.5 + Math.random() * 4));
    const baseComments = Math.floor(baseLikes * (0.015 + Math.random() * 0.025));

    // Dynamic comments with slight variations
    const comments: ReelComment[] = [
      ...COMMENTS_POOL.slice(0, 2 + (i % 3)),
      {
        id: `comm-dyn-${page}-${i}`,
        authorName: creator.name,
        authorUsername: creator.username,
        authorAvatar: creator.avatar,
        text: 'Thanks everyone for the love on this reel! ❤️ Drop what track we should cover next.',
        timestamp: 'Just now',
        likes: Math.floor(baseLikes * 0.02),
        isVerified: creator.verified,
      },
    ];

    const reel: ReelItem = {
      id: uniqueId,
      authorId: `usr-${creator.username}`,
      authorName: creator.name,
      authorUsername: creator.username,
      authorAvatar: creator.avatar,
      isVerified: creator.verified,
      videoUrl: stream.url,
      posterUrl: stream.poster,
      caption: `${caption} #${stream.vibe.replace(/\s+/g, '')} #${creator.username}`,
      audioTrackTitle: track.title,
      audioTrackArtist: track.artist,
      audioTrackUrl: track.audioUrl,
      audioTrackCover: track.coverUrl,
      category: reelCategory,
      likesCount: baseLikes,
      isLiked: false,
      commentsCount: baseComments,
      comments,
      sharesCount: Math.floor(baseLikes * 0.12),
      viewsCount: baseViews,
      adMobEarnings: '+$0.65 AdMob',
      tags: ['#Viral', '#Instagrand', `#${reelCategory}`, `#${creator.username}`],
    };

    newBatch.push(reel);
    existingIds.add(uniqueId);
  }

  return newBatch;
}
