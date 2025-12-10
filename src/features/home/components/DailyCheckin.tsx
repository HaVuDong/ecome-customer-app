import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export function DailyCheckin() {
  const rewards = [
    { day: 1, coins: 10, claimed: true },
    { day: 2, coins: 20, claimed: true },
    { day: 3, coins: 30, claimed: true },
    { day: 4, coins: 50, claimed: false, today: true },
    { day: 5, coins: 100, claimed: false },
    { day: 6, coins: 200, claimed: false },
    { day: 7, coins: 500, claimed: false },
  ];

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Ionicons name="gift-outline" size={20} color="#ffffff" />
          <Text style={styles.title}>Điểm danh nhận xu</Text>
        </View>
        <View style={styles.dayBadge}>
          <Text style={styles.dayText}>Ngày 4/7</Text>
        </View>
      </View>

      <View style={styles.rewardsGrid}>
        {rewards.map((reward) => (
          <View key={reward.day} style={[
            styles.rewardItem,
            reward.claimed && styles.rewardClaimed,
            reward.today && styles.rewardToday,
          ]}>
            <Ionicons
              name="logo-bitcoin"
              size={20}
              color={reward.claimed || reward.today ? '#fbbf24' : 'rgba(255, 255, 255, 0.5)'}
            />
            <Text style={[
              styles.coinText,
              reward.today && styles.coinTextToday,
            ]}>
              {reward.coins}
            </Text>
            {reward.claimed && (
              <View style={styles.claimedOverlay}>
                <Ionicons name="checkmark" size={16} color="#ffffff" />
              </View>
            )}
          </View>
        ))}
      </View>

      {rewards.find((r) => r.today) && (
        <TouchableOpacity style={styles.claimButton} activeOpacity={0.8}>
          <Text style={styles.claimButtonText}>Nhận ngay</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 16,
    marginBottom: 8,
    padding: 16,
    borderRadius: 12,
    backgroundColor: '#a855f7',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
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
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '600',
  },
  dayBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  dayText: {
    color: '#ffffff',
    fontSize: 12,
  },
  rewardsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
  },
  rewardItem: {
    flex: 1,
    aspectRatio: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  rewardClaimed: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  rewardToday: {
    backgroundColor: '#ffffff',
  },
  coinText: {
    color: '#ffffff',
    fontSize: 11,
    marginTop: 4,
    fontWeight: '600',
  },
  coinTextToday: {
    color: '#a855f7',
  },
  claimedOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  claimButton: {
    backgroundColor: '#ffffff',
    paddingVertical: 10,
    borderRadius: 8,
    marginTop: 12,
    alignItems: 'center',
  },
  claimButtonText: {
    color: '#a855f7',
    fontSize: 14,
    fontWeight: 'bold',
  },
});
