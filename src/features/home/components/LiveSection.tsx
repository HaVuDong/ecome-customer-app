import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export interface LiveStream {
  id: string;
  title: string;
  thumbnail: string;
  viewers: number;
  shopName: string;
  isLive: boolean;
}

interface LiveSectionProps {
  liveStreams: LiveStream[];
}

export function LiveSection({ liveStreams }: LiveSectionProps) {
  const formatViewers = (viewers: number) => {
    if (viewers >= 1000) {
      return `${(viewers / 1000).toFixed(1)}k`;
    }
    return viewers.toString();
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Ionicons name="play-circle" size={20} color="#f97316" />
          <Text style={styles.title}>SHOPEE LIVE</Text>
        </View>
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {liveStreams.map((stream) => (
          <TouchableOpacity key={stream.id} style={styles.streamCard} activeOpacity={0.8}>
            <View style={styles.thumbnailContainer}>
              <Image source={{ uri: stream.thumbnail }} style={styles.thumbnail} resizeMode="cover" />
              <View style={styles.overlay} />
              
              {stream.isLive && (
                <View style={styles.liveBadge}>
                  <View style={styles.liveDot} />
                  <Text style={styles.liveText}>LIVE</Text>
                </View>
              )}
              
              <View style={styles.viewersBadge}>
                <Ionicons name="eye-outline" size={12} color="#ffffff" />
                <Text style={styles.viewersText}>{formatViewers(stream.viewers)}</Text>
              </View>

              <View style={styles.streamInfo}>
                <Text style={styles.streamTitle} numberOfLines={2}>{stream.title}</Text>
                <Text style={styles.shopName}>{stream.shopName}</Text>
              </View>

              <View style={styles.playIconContainer}>
                <Ionicons name="play" size={24} color="#ffffff" />
              </View>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#ffffff',
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  title: {
    color: '#f97316',
    fontSize: 15,
    fontWeight: '600',
  },
  scrollContent: {
    gap: 12,
  },
  streamCard: {
    width: 176,
    marginRight: 12,
  },
  thumbnailContainer: {
    width: '100%',
    height: 224,
    borderRadius: 8,
    overflow: 'hidden',
    position: 'relative',
  },
  thumbnail: {
    width: '100%',
    height: '100%',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
  },
  liveBadge: {
    position: 'absolute',
    top: 8,
    left: 8,
    backgroundColor: '#ef4444',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    gap: 4,
  },
  liveDot: {
    width: 8,
    height: 8,
    backgroundColor: '#ffffff',
    borderRadius: 4,
  },
  liveText: {
    color: '#ffffff',
    fontSize: 11,
    fontWeight: 'bold',
  },
  viewersBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    gap: 4,
  },
  viewersText: {
    color: '#ffffff',
    fontSize: 11,
  },
  streamInfo: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 8,
  },
  streamTitle: {
    color: '#ffffff',
    fontSize: 12,
  },
  shopName: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 11,
    marginTop: 4,
  },
  playIconContainer: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    width: 48,
    height: 48,
    marginLeft: -24,
    marginTop: -24,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
