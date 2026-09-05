import React, { useState, useRef, useCallback } from 'react';
import {
  StyleSheet,
  View,
  Text,
  Dimensions,
  FlatList,
  TouchableOpacity,
  Image,
  StatusBar,
  Alert,
  Share
} from 'react-native';
import { useVideoPlayer, VideoView } from 'expo-video';
import * as ImagePicker from 'expo-image-picker';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// 16 High Quality Public MP4 Vertical Video Links
export const REELS_FEED_DATA = [
  {
    id: 'reel_1',
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-vertical-view-of-waves-on-the-beach-1406-large.mp4',
    creator: 'Sarah Jenkins',
    username: 'sarah_ocean',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
    caption: 'Crystal blue waters and sunset waves 🌊✨ Life is better at the beach! #nature #vibes #ocean #sunset',
    audioTrack: 'Original Sound - Sarah Jenkins • Ocean Wave Lofi',
    likes: 48200,
    comments: 1240,
    shares: 3400,
    isVerified: true,
  },
  {
    id: 'reel_2',
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-skater-doing-tricks-in-a-skatepark-41595-large.mp4',
    creator: 'Alex Rivera',
    username: 'alex_skate',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
    caption: 'Landed the 360 kickflip after 50 tries! Never give up 🛹🔥 #skatelife #street #tricks #action',
    audioTrack: 'Phonk Beat 2026 - DJ Nightfall',
    likes: 92400,
    comments: 3180,
    shares: 8900,
    isVerified: true,
  },
  {
    id: 'reel_3',
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-girl-in-neon-sign-1232-large.mp4',
    creator: 'Elena Rostova',
    username: 'elena_cyber',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
    caption: 'Tokyo Cyberpunk midnight aesthetic 🌆💜 Neon glow in Shinjuku #tokyo #neon #cyberpunk #aesthetic',
    audioTrack: 'Synthwave Dreams - Tokyo Soundlab',
    likes: 135000,
    comments: 4520,
    shares: 12400,
    isVerified: true,
  },
  {
    id: 'reel_4',
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-going-down-a-curved-highway-down-a-mountain-41576-large.mp4',
    creator: 'Marco Rossi',
    username: 'marco_travels',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150',
    caption: 'Swiss Alps mountain pass drive at sunrise 🏔️🚗 Ultimate road trip experience #switzerland #travel #mountains',
    audioTrack: 'Acoustic Sunrise - Alpine Chill',
    likes: 76800,
    comments: 1890,
    shares: 6100,
    isVerified: false,
  },
  {
    id: 'reel_5',
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-taking-photos-with-a-smartphone-at-sunset-41584-large.mp4',
    creator: 'Naushad Alam',
    username: 'naushad',
    avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150',
    caption: '👑 Testing NovaGrand 4K Ultra Camera Filters at Golden Hour! Drop your thoughts below ✨ #founder #novagrand #4k',
    audioTrack: 'NovaGrand Official Theme - Studio VIP Mix',
    likes: 248000,
    comments: 8920,
    shares: 31000,
    isVerified: true,
  },
  {
    id: 'reel_6',
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-young-woman-skater-smiling-and-holding-a-skateboard-41599-large.mp4',
    creator: 'Chloe Bennett',
    username: 'chloe_b',
    avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150',
    caption: 'Weekend sunset skate sessions are my absolute therapy 🛹✨ #goodvibes #skatergirl #sunset #chill',
    audioTrack: 'Golden Hour Lofi - ChillHop Records',
    likes: 58400,
    comments: 1430,
    shares: 4200,
    isVerified: false,
  },
  {
    id: 'reel_7',
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-woman-running-on-the-street-41610-large.mp4',
    creator: 'Zack Walker',
    username: 'zack_fit',
    avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150',
    caption: '5 AM morning marathon preparation sprint! 🏃💨 Consistency beats talent every time. #fitness #marathon #grind',
    audioTrack: 'High Energy Motivation Trap - Workout Beast',
    likes: 64100,
    comments: 1120,
    shares: 2800,
    isVerified: true,
  },
  {
    id: 'reel_8',
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-tree-branches-in-the-breeze-1188-large.mp4',
    creator: 'Nature Zen',
    username: 'nature_zen',
    avatar: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=150',
    caption: 'Take a deep breath and listen to the gentle summer breeze 🍃 Calm your mind today #mindfulness #peace #zen',
    audioTrack: 'Forest Wind & Ambient Flute - Zen Masters',
    likes: 39500,
    comments: 870,
    shares: 5100,
    isVerified: false,
  },
  {
    id: 'reel_9',
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-silhouette-of-a-person-in-the-fog-41604-large.mp4',
    creator: 'Liam Vance',
    username: 'liam_visuals',
    avatar: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=150',
    caption: 'Moody fog cinematography shot on anamorphic lens 🌫️🎬 #cinematic #film #directorscut #mystery',
    audioTrack: 'Interstellar Atmospheric Piano - Hans Sound',
    likes: 81200,
    comments: 2640,
    shares: 7400,
    isVerified: true,
  },
  {
    id: 'reel_10',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
    creator: 'Tech Horizon',
    username: 'tech_horizon',
    avatar: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=150',
    caption: '4K HDR Visual showcase streaming directly in NovaGrand Pro ⚡ Look at those colors! #4khdr #tech #reels',
    audioTrack: 'Electronic Pulse - Future Bass Studio',
    likes: 112000,
    comments: 3900,
    shares: 9800,
    isVerified: true,
  },
  {
    id: 'reel_11',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
    creator: 'Wanderlust Globe',
    username: 'wanderlust_globe',
    avatar: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=150',
    caption: 'Escape the city and find quiet spots on the planet 🌍✈️ Where is your next trip? #travel #escape #nature',
    audioTrack: 'Tropical Breeze House - Summer Anthem',
    likes: 95400,
    comments: 2840,
    shares: 6700,
    isVerified: false,
  },
  {
    id: 'reel_12',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4',
    creator: 'Comedy Central Club',
    username: 'comedy_club',
    avatar: 'https://images.unsplash.com/photo-1527980965255-d3b416303d12?w=150',
    caption: 'When your friend tries to explain why they are late again 😂 Tag that one friend! #funny #comedy #relatable',
    audioTrack: 'Funny Cartoon Bassline - Meme Factory',
    likes: 184000,
    comments: 7200,
    shares: 24500,
    isVerified: true,
  },
  {
    id: 'reel_13',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyBlazes.mp4',
    creator: 'Festival Live',
    username: 'fest_live',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150',
    caption: 'Main stage energy at 2 AM was completely unhinged! 🎆🔊 Turn up the bass! #festival #edm #rave #livemusic',
    audioTrack: 'Drop The Bass - Festival Anthem 2026',
    likes: 142000,
    comments: 4890,
    shares: 15300,
    isVerified: true,
  },
  {
    id: 'reel_14',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerMeltdowns.mp4',
    creator: 'Studio FX 3D',
    username: 'studio_fx',
    avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150',
    caption: 'Real-time particle simulation rendered at 120 FPS 🌌 Unreal Engine 5 tech demo #unrealengine #cgi #vfx',
    audioTrack: 'Cyber Cinematic Drop - Epic Soundworks',
    likes: 167000,
    comments: 5120,
    shares: 18900,
    isVerified: true,
  },
  {
    id: 'reel_15',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/WeAreGoingOnBullrun.mp4',
    creator: 'Speed & Supercars',
    username: 'supercars_daily',
    avatar: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=150',
    caption: 'Rally convoy crossing the desert highway 🏎️💨 Pure V12 engine symphony! #supercars #rally #racing',
    audioTrack: 'Twin Turbo V12 Revs - Speed Records',
    likes: 215000,
    comments: 6800,
    shares: 28400,
    isVerified: true,
  },
  {
    id: 'reel_16',
    videoUrl: 'https://test-videos.co.uk/vids/sintel/mp4/h264/720/Sintel_720_10s_2MB.mp4',
    creator: 'Blender Open Movie',
    username: 'blender_open',
    avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150',
    caption: 'Classic open source movie animation Sintel 🐲 Remastered in NovaGrand Studio #animation #blender #3d',
    audioTrack: 'Dragon Quest Orchestral Suite - Epic Score',
    likes: 88900,
    comments: 2900,
    shares: 7200,
    isVerified: true,
  }
];

// Helper to format numbers (e.g. 48200 -> 48.2K)
function formatCount(num) {
  if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
  if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
  return num.toString();
}

/**
 * Single Reel Item with expo-video Native Engine
 */
function ReelItem({ item, isActive, user }) {
  const [isLiked, setIsLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(item.likes);
  const [isFollowing, setIsFollowing] = useState(false);
  const [isPaused, setIsPaused] = useState(false);

  // Native expo-video player instance
  const player = useVideoPlayer(item.videoUrl, (p) => {
    p.loop = true;
    if (isActive) {
      p.play();
    } else {
      p.pause();
    }
  });

  // Keep playback synced with scroll state
  React.useEffect(() => {
    if (!player) return;
    if (isActive && !isPaused) {
      player.play();
    } else {
      player.pause();
    }
  }, [isActive, isPaused, player]);

  const togglePlayPause = () => {
    if (!player) return;
    if (player.playing) {
      player.pause();
      setIsPaused(true);
    } else {
      player.play();
      setIsPaused(false);
    }
  };

  const handleLikePress = () => {
    if (isLiked) {
      setIsLiked(false);
      setLikesCount((prev) => prev - 1);
    } else {
      setIsLiked(true);
      setLikesCount((prev) => prev + 1);
    }
  };

  const handleSharePress = async () => {
    try {
      await Share.share({
        message: `Check out this reel by @${item.username} on NovaGrand Pro: ${item.caption}\n${item.videoUrl}`,
      });
    } catch (e) {
      console.warn('Share notice:', e);
    }
  };

  const handleCommentPress = () => {
    Alert.alert(
      `Comments (${formatCount(item.comments)})`,
      `Join the conversation on @${item.username}'s reel!`,
      [
        { text: 'Add Comment', onPress: () => Alert.alert('Comment Posted', 'Your comment was sent!') },
        { text: 'Close', style: 'cancel' },
      ]
    );
  };

  return (
    <View style={styles.reelContainer}>
      {/* Native Video Engine */}
      <TouchableOpacity
        activeOpacity={1}
        onPress={togglePlayPause}
        style={styles.videoWrapper}
      >
        <VideoView
          player={player}
          style={styles.videoView}
          contentFit="cover"
          nativeControls={false}
          showsTimecodes={false}
        />

        {/* Big Play Badge if paused */}
        {isPaused && (
          <View style={styles.pausedOverlay}>
            <View style={styles.pausedIconCircle}>
              <Text style={styles.pausedIconText}>▶</Text>
            </View>
          </View>
        )}
      </TouchableOpacity>

      {/* Right Action Bar (Instagram / TikTok Style) */}
      <View style={styles.rightActionBar}>
        {/* Creator Avatar with follow + button */}
        <View style={styles.avatarActionContainer}>
          <Image source={{ uri: item.avatar }} style={styles.creatorAvatar} />
          {!isFollowing && (
            <TouchableOpacity
              style={styles.followBadgeBtn}
              onPress={() => setIsFollowing(true)}
            >
              <Text style={styles.followBadgeText}>+</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Like Button */}
        <TouchableOpacity style={styles.actionBtn} onPress={handleLikePress}>
          <Text style={[styles.actionIcon, isLiked && { color: '#ff2d55' }]}>
            {isLiked ? '❤️' : '🤍'}
          </Text>
          <Text style={styles.actionCount}>{formatCount(likesCount)}</Text>
        </TouchableOpacity>

        {/* Comment Button */}
        <TouchableOpacity style={styles.actionBtn} onPress={handleCommentPress}>
          <Text style={styles.actionIcon}>💬</Text>
          <Text style={styles.actionCount}>{formatCount(item.comments)}</Text>
        </TouchableOpacity>

        {/* Share Button */}
        <TouchableOpacity style={styles.actionBtn} onPress={handleSharePress}>
          <Text style={styles.actionIcon}>🚀</Text>
          <Text style={styles.actionCount}>{formatCount(item.shares)}</Text>
        </TouchableOpacity>

        {/* Audio Track Spinning Disc */}
        <View style={styles.audioDisc}>
          <Image source={{ uri: item.avatar }} style={styles.discAvatar} />
        </View>
      </View>

      {/* Bottom Info Overlay */}
      <View style={styles.bottomInfoContainer}>
        {/* Username Row */}
        <View style={styles.usernameRow}>
          <Text style={styles.creatorNameText}>{item.creator}</Text>
          <Text style={styles.handleText}>@{item.username}</Text>
          {item.isVerified && (
            <View style={styles.verifiedTick}>
              <Text style={styles.verifiedTickText}>✓</Text>
            </View>
          )}
        </View>

        {/* Caption */}
        <Text style={styles.captionText} numberOfLines={2}>
          {item.caption}
        </Text>

        {/* Sound / Music Audio Track Tag */}
        <View style={styles.soundRow}>
          <Text style={styles.soundIcon}>🎵</Text>
          <Text style={styles.soundTitleText} numberOfLines={1}>
            {item.audioTrack}
          </Text>
        </View>
      </View>
    </View>
  );
}

/**
 * Full Reels Screen with Snap-to-Interval Vertical FlatList
 */
export default function ReelsScreen({ user, onGoToProfile, onSignOut }) {
  const [activeReelIndex, setActiveReelIndex] = useState(0);

  const onViewableItemsChanged = useRef(({ viewableItems }) => {
    if (viewableItems && viewableItems.length > 0) {
      setActiveReelIndex(viewableItems[0].index || 0);
    }
  }).current;

  const viewabilityConfig = useRef({
    itemVisiblePercentThreshold: 70,
  }).current;

  // 1. Native Camera Access: Record Reel / Capture Story
  const handleOpenCamera = async () => {
    try {
      const permission = await ImagePicker.requestCameraPermissionsAsync();
      if (!permission.granted) {
        Alert.alert('Camera Permission', 'Please enable camera permission in Android settings to shoot 4K Reels.');
        return;
      }
      const mediaResult = await ImagePicker.launchCameraAsync({
        mediaTypes: ['videos', 'images'],
        allowsEditing: true,
        quality: 0.9,
      });
      if (!mediaResult.canceled && mediaResult.assets && mediaResult.assets.length > 0) {
        Alert.alert('4K Reel Recorded! 🎬', `New reel media ready for publishing: ${mediaResult.assets[0].uri.split('/').pop()}`);
      }
    } catch (e) {
      Alert.alert('Camera Notice', 'Opening Native Camera...');
    }
  };

  // 2. Native Gallery Access: Pick Video / Photo from Device Gallery
  const handleOpenGallery = async () => {
    try {
      const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permission.granted) {
        Alert.alert('Gallery Permission', 'Please grant photo gallery permission to select media.');
        return;
      }
      const mediaResult = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['videos', 'images'],
        allowsEditing: true,
        quality: 0.9,
      });
      if (!mediaResult.canceled && mediaResult.assets && mediaResult.assets.length > 0) {
        Alert.alert('Media Selected! 🖼️', `Selected media ready for 4K upload: ${mediaResult.assets[0].uri.split('/').pop()}`);
      }
    } catch (e) {
      Alert.alert('Gallery Notice', 'Opening Media Library...');
    }
  };

  return (
    <View style={styles.screenContainer}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />

      {/* Top Floating Navigation Header */}
      <View style={styles.topHeader}>
        {/* Left Side: Native Camera and Gallery Quick Action Icons */}
        <View style={styles.headerLeftActions}>
          <TouchableOpacity
            style={styles.headerIconBtn}
            onPress={handleOpenCamera}
            activeOpacity={0.7}
          >
            <Text style={styles.headerIconText}>📷</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.headerIconBtn}
            onPress={handleOpenGallery}
            activeOpacity={0.7}
          >
            <Text style={styles.headerIconText}>🖼️</Text>
          </TouchableOpacity>
        </View>

        {/* Center: Tabs */}
        <View style={styles.headerTabs}>
          <Text style={styles.tabInactive}>Following</Text>
          <View style={styles.activeTabWrapper}>
            <Text style={styles.tabActive}>Reels</Text>
            <View style={styles.activeTabIndicator} />
          </View>
        </View>

        {/* Right Side: Coin Balance & Profile */}
        <View style={styles.headerRight}>
          <View style={styles.coinBadge}>
            <Text style={styles.coinText}>🪙 {user?.coins || 250}</Text>
          </View>
          <TouchableOpacity style={styles.profileBtn} onPress={onGoToProfile}>
            <Image
              source={{ uri: user?.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150' }}
              style={styles.profileBtnAvatar}
            />
          </TouchableOpacity>
        </View>
      </View>

      {/* High-Performance Vertical Reels Feed */}
      <FlatList
        data={REELS_FEED_DATA}
        keyExtractor={(item) => item.id}
        renderItem={({ item, index }) => (
          <ReelItem
            item={item}
            isActive={index === activeReelIndex}
            user={user}
          />
        )}
        pagingEnabled
        showsVerticalScrollIndicator={false}
        snapToInterval={SCREEN_HEIGHT}
        snapToAlignment="start"
        decelerationRate="fast"
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={viewabilityConfig}
        initialNumToRender={2}
        maxToRenderPerBatch={2}
        windowSize={3}
        removeClippedSubviews
        getItemLayout={(data, index) => ({
          length: SCREEN_HEIGHT,
          offset: SCREEN_HEIGHT * index,
          index,
        })}
      />

      {/* Bottom Floating App Navigation Bar */}
      <View style={styles.bottomTabBar}>
        <TouchableOpacity style={styles.tabBarItem}>
          <Text style={styles.tabBarIconActive}>🎬</Text>
          <Text style={styles.tabBarTextActive}>Reels</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.tabBarItem}
          onPress={() => Alert.alert('4K Video Calling', 'Agora Real-time Studio Call active!')}
        >
          <Text style={styles.tabBarIcon}>📹</Text>
          <Text style={styles.tabBarText}>Studio</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.tabBarItem}
          onPress={() => Alert.alert('Direct Messages', 'Direct messages with verified creators')}
        >
          <Text style={styles.tabBarIcon}>💬</Text>
          <Text style={styles.tabBarText}>DMs</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.tabBarItem} onPress={onGoToProfile}>
          <Text style={styles.tabBarIcon}>👑</Text>
          <Text style={styles.tabBarText}>Profile</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screenContainer: {
    flex: 1,
    backgroundColor: '#000000',
  },
  reelContainer: {
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT,
    backgroundColor: '#000000',
    position: 'relative',
  },
  videoWrapper: {
    width: '100%',
    height: '100%',
  },
  videoView: {
    width: '100%',
    height: '100%',
  },
  pausedOverlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.25)',
  },
  pausedIconCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
    borderWidth: 1.5,
    borderColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center',
    paddingLeft: 4,
  },
  pausedIconText: {
    fontSize: 28,
    color: '#ffffff',
  },
  // Top Floating Header
  topHeader: {
    position: 'absolute',
    top: 48,
    left: 16,
    right: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    zIndex: 10,
  },
  headerLeftActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerIconBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(0, 0, 0, 0.55)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.25)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerIconText: {
    fontSize: 18,
  },
  headerTabs: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 18,
  },
  tabInactive: {
    color: 'rgba(255, 255, 255, 0.65)',
    fontSize: 17,
    fontWeight: '600',
  },
  activeTabWrapper: {
    alignItems: 'center',
  },
  tabActive: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  activeTabIndicator: {
    width: 22,
    height: 3,
    backgroundColor: '#ffffff',
    borderRadius: 2,
    marginTop: 3,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  coinBadge: {
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
    borderWidth: 1,
    borderColor: '#eab308',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 14,
  },
  coinText: {
    color: '#fef08a',
    fontSize: 13,
    fontWeight: '700',
  },
  profileBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    borderWidth: 1.5,
    borderColor: '#8b5cf6',
    overflow: 'hidden',
  },
  profileBtnAvatar: {
    width: '100%',
    height: '100%',
  },
  // Right Action Bar
  rightActionBar: {
    position: 'absolute',
    right: 12,
    bottom: 95,
    alignItems: 'center',
    gap: 16,
    zIndex: 10,
  },
  avatarActionContainer: {
    position: 'relative',
    marginBottom: 6,
  },
  creatorAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 2,
    borderColor: '#ffffff',
  },
  followBadgeBtn: {
    position: 'absolute',
    bottom: -6,
    alignSelf: 'center',
    backgroundColor: '#ff2d55',
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: '#ffffff',
  },
  followBadgeText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '900',
    lineHeight: 14,
  },
  actionBtn: {
    alignItems: 'center',
  },
  actionIcon: {
    fontSize: 30,
    marginBottom: 2,
    textShadowColor: 'rgba(0, 0, 0, 0.8)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
  actionCount: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '700',
    textShadowColor: 'rgba(0, 0, 0, 0.9)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  audioDisc: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#18181b',
    borderWidth: 2,
    borderColor: '#3f3f46',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 4,
  },
  discAvatar: {
    width: 26,
    height: 26,
    borderRadius: 13,
  },
  // Bottom Info Overlay
  bottomInfoContainer: {
    position: 'absolute',
    left: 14,
    right: 80,
    bottom: 85,
    zIndex: 10,
  },
  usernameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    marginBottom: 6,
    gap: 6,
  },
  creatorNameText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '800',
    textShadowColor: 'rgba(0,0,0,0.8)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  handleText: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 13,
    fontWeight: '600',
  },
  verifiedTick: {
    backgroundColor: '#3b82f6',
    width: 16,
    height: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  verifiedTickText: {
    color: '#ffffff',
    fontSize: 10,
    fontWeight: 'bold',
  },
  captionText: {
    color: '#f1f5f9',
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 8,
    textShadowColor: 'rgba(0,0,0,0.8)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  soundRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.45)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
    maxWidth: '90%',
  },
  soundIcon: {
    fontSize: 12,
    marginRight: 6,
  },
  soundTitleText: {
    color: '#e2e8f0',
    fontSize: 12,
    fontWeight: '600',
  },
  // Bottom Navigation Bar
  bottomTabBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 70,
    backgroundColor: 'rgba(0, 0, 0, 0.88)',
    borderTopWidth: 0.5,
    borderTopColor: 'rgba(255, 255, 255, 0.12)',
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingBottom: 10,
    zIndex: 20,
  },
  tabBarItem: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabBarIcon: {
    fontSize: 22,
    marginBottom: 2,
    opacity: 0.65,
  },
  tabBarIconActive: {
    fontSize: 22,
    marginBottom: 2,
    color: '#ffffff',
  },
  tabBarText: {
    color: 'rgba(255, 255, 255, 0.5)',
    fontSize: 11,
    fontWeight: '600',
  },
  tabBarTextActive: {
    color: '#ffffff',
    fontSize: 11,
    fontWeight: '700',
  },
});
