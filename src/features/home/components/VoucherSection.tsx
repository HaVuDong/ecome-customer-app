import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export interface Voucher {
  id: string;
  code: string;
  discount: string;
  minSpend: number;
  description: string;
  validUntil: string;
  claimed: boolean;
}

interface VoucherSectionProps {
  vouchers: Voucher[];
  onClaimVoucher: (voucherId: string) => void;
}

export function VoucherSection({ vouchers, onClaimVoucher }: VoucherSectionProps) {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Ionicons name="ticket-outline" size={20} color="#f97316" />
          <Text style={styles.title}>Mã Giảm Giá</Text>
        </View>
        <TouchableOpacity style={styles.viewAll}>
          <Text style={styles.viewAllText}>Xem tất cả</Text>
          <Ionicons name="chevron-forward" size={16} color="#6b7280" />
        </TouchableOpacity>
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {vouchers.map((voucher) => (
          <View key={voucher.id} style={styles.voucherCard}>
            <View style={styles.voucherContent}>
              <View style={styles.voucherLeft}>
                <Text style={styles.discountText}>{voucher.discount}</Text>
                <Text style={styles.offText}>OFF</Text>
              </View>
              <View style={styles.voucherRight}>
                <Text style={styles.description} numberOfLines={1}>
                  {voucher.description}
                </Text>
                <Text style={styles.validUntil}>HSD: {voucher.validUntil}</Text>
                <View style={styles.buttonContainer}>
                  {voucher.claimed ? (
                    <View style={styles.claimedButton}>
                      <Text style={styles.claimedButtonText}>Đã lưu</Text>
                    </View>
                  ) : (
                    <TouchableOpacity
                      style={styles.claimButton}
                      onPress={() => onClaimVoucher(voucher.id)}
                      activeOpacity={0.7}
                    >
                      <Text style={styles.claimButtonText}>Lưu ngay</Text>
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            </View>
          </View>
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
  viewAll: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  viewAllText: {
    fontSize: 13,
    color: '#6b7280',
  },
  scrollContent: {
    gap: 12,
  },
  voucherCard: {
    width: 288,
    borderWidth: 2,
    borderColor: '#fed7aa',
    borderStyle: 'dashed',
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: '#fff7ed',
    marginRight: 12,
  },
  voucherContent: {
    flexDirection: 'row',
  },
  voucherLeft: {
    backgroundColor: '#f97316',
    paddingHorizontal: 16,
    paddingVertical: 12,
    minWidth: 80,
    alignItems: 'center',
    justifyContent: 'center',
  },
  discountText: {
    color: '#ffffff',
    fontSize: 20,
    fontWeight: 'bold',
  },
  offText: {
    color: '#ffffff',
    fontSize: 11,
    marginTop: 4,
  },
  voucherRight: {
    flex: 1,
    paddingHorizontal: 12,
    paddingVertical: 8,
    justifyContent: 'space-between',
  },
  description: {
    fontSize: 13,
    color: '#374151',
  },
  validUntil: {
    fontSize: 11,
    color: '#6b7280',
    marginTop: 4,
  },
  buttonContainer: {
    marginTop: 8,
  },
  claimButton: {
    borderWidth: 1,
    borderColor: '#f97316',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 4,
    alignSelf: 'flex-start',
  },
  claimButtonText: {
    color: '#f97316',
    fontSize: 11,
    fontWeight: '600',
  },
  claimedButton: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 4,
    alignSelf: 'flex-start',
  },
  claimedButtonText: {
    color: '#9ca3af',
    fontSize: 11,
  },
});
