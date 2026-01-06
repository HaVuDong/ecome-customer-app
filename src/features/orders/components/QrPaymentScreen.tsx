import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  ScrollView,
  Dimensions,
  Clipboard,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  generateQrPayment,
  checkPaymentStatus,
  cancelQrPayment,
  QrPaymentResponse,
} from '../../../core/services/paymentService';

const { width } = Dimensions.get('window');

/**
 * QR Payment Screen
 * 
 * GIẢI THÍCH KHI BẢO VỆ:
 * 
 * 1. Flow màn hình:
 *    - Nhận orderId từ navigation
 *    - Gọi API tạo QR → Hiển thị mã QR
 *    - Countdown 5 phút (thời gian QR có hiệu lực)
 *    - Polling mỗi 5 giây để check trạng thái
 *    - Khi PAID → Navigate to success screen
 *    - Khi EXPIRED → Show error và option tạo QR mới
 * 
 * 2. Cấu trúc UI:
 *    - Header với nút back
 *    - Mã QR (image từ VietQR)
 *    - Thông tin bank (STK, tên TK, nội dung CK)
 *    - Countdown timer
 *    - Nút copy nội dung CK
 *    - Nút hủy/đổi phương thức
 * 
 * 3. VietQR:
 *    - Là hệ thống QR liên ngân hàng của NAPAS
 *    - Hỗ trợ hầu hết ngân hàng tại VN
 *    - Có thể scan bằng app ngân hàng hoặc ví điện tử
 */

interface QrPaymentScreenProps {
  orderId: number;
  totalAmount: number;
  onPaymentSuccess: () => void;
  onBack: () => void;
}

const QrPaymentScreen: React.FC<QrPaymentScreenProps> = ({
  orderId,
  totalAmount,
  onPaymentSuccess,
  onBack,
}) => {
  const insets = useSafeAreaInsets();
  
  // States
  const [loading, setLoading] = useState(true);
  const [qrData, setQrData] = useState<QrPaymentResponse | null>(null);
  const [timeLeft, setTimeLeft] = useState(300); // 5 phút = 300 giây
  const [error, setError] = useState<string | null>(null);
  const [qrLoaded, setQrLoaded] = useState(false);
  
  // Refs
  const pollingRef = useRef<NodeJS.Timeout | null>(null);
  const countdownRef = useRef<NodeJS.Timeout | null>(null);

  /**
   * Khởi tạo QR Payment
   */
  const initQrPayment = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('🔄 Đang tạo QR cho orderId:', orderId);
      const data = await generateQrPayment(orderId);
      console.log('✅ QR data:', data);
      setQrData(data);
      
      // Tính thời gian còn lại
      const expiredAt = new Date(data.expiredAt);
      const now = new Date();
      const diffSeconds = Math.max(0, Math.floor((expiredAt.getTime() - now.getTime()) / 1000));
      setTimeLeft(diffSeconds);
      
    } catch (err: any) {
      console.error('❌ Error generating QR:', err);
      console.error('❌ Error response:', err.response?.data);
      console.error('❌ Error status:', err.response?.status);
      setError(err.response?.data?.error || 'Không thể tạo mã QR. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  /**
   * Bắt đầu polling check trạng thái
   */
  const startPolling = () => {
    if (pollingRef.current) clearInterval(pollingRef.current);
    
    pollingRef.current = setInterval(async () => {
      try {
        const status = await checkPaymentStatus(orderId);
        
        if (status.paymentStatus === 'PAID') {
          // Thanh toán thành công!
          stopTimers();
          Alert.alert(
            '🎉 Thanh toán thành công!',
            'Đơn hàng của bạn đã được thanh toán.',
            [{ text: 'OK', onPress: onPaymentSuccess }]
          );
        } else if (status.paymentStatus === 'FAILED' || status.isQrExpired) {
          // QR hết hạn
          stopTimers();
          setError('Mã QR đã hết hạn. Vui lòng tạo mã mới hoặc chọn phương thức khác.');
        }
      } catch (err) {
        console.error('Error polling status:', err);
      }
    }, 5000); // Poll mỗi 5 giây
  };

  /**
   * Bắt đầu countdown timer
   */
  const startCountdown = () => {
    if (countdownRef.current) clearInterval(countdownRef.current);
    
    countdownRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          stopTimers();
          setError('Mã QR đã hết hạn.');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  /**
   * Dừng tất cả timers
   */
  const stopTimers = () => {
    if (pollingRef.current) clearInterval(pollingRef.current);
    if (countdownRef.current) clearInterval(countdownRef.current);
  };

  // Tạo QR khi component mount
  useEffect(() => {
    initQrPayment();
    
    return () => {
      // Cleanup
      stopTimers();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Bắt đầu polling và countdown khi có QR
  useEffect(() => {
    if (qrData) {
      startPolling();
      startCountdown();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [qrData]);

  /**
   * Format thời gian countdown
   */
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  /**
   * Format số tiền
   */
  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(amount);
  };

  /**
   * Copy nội dung chuyển khoản
   */
  const copyTransactionId = () => {
    if (qrData?.transactionId) {
      Clipboard.setString(qrData.transactionId);
      Alert.alert('Đã sao chép', 'Nội dung chuyển khoản đã được sao chép.');
    }
  };

  /**
   * Copy số tài khoản
   */
  const copyAccountNumber = () => {
    if (qrData?.bankAccount) {
      Clipboard.setString(qrData.bankAccount);
      Alert.alert('Đã sao chép', 'Số tài khoản đã được sao chép.');
    }
  };

  /**
   * Hủy và quay lại
   */
  const handleCancel = async () => {
    Alert.alert(
      'Hủy thanh toán',
      'Bạn có chắc muốn hủy thanh toán QR không?',
      [
        { text: 'Không', style: 'cancel' },
        {
          text: 'Có',
          style: 'destructive',
          onPress: async () => {
            try {
              await cancelQrPayment(orderId);
              stopTimers();
              onBack();
            } catch (err) {
              console.error('Error canceling:', err);
              onBack();
            }
          },
        },
      ]
    );
  };

  /**
   * Tạo QR mới (khi hết hạn)
   */
  const handleRetry = () => {
    setError(null);
    setTimeLeft(300);
    initQrPayment();
  };

  // ============ RENDER ============

  if (loading) {
    return (
      <View style={[styles.container, styles.centerContent, { paddingTop: insets.top }]}>
        <ActivityIndicator size="large" color="#FF6B00" />
        <Text style={styles.loadingText}>Đang tạo mã QR...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <View style={styles.header}>
          <TouchableOpacity onPress={onBack} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#333" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Thanh toán QR</Text>
          <View style={{ width: 40 }} />
        </View>
        
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle" size={64} color="#FF4444" />
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={handleRetry}>
            <Ionicons name="refresh" size={20} color="#FFF" />
            <Text style={styles.retryButtonText}>Tạo mã QR mới</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.cancelButton} onPress={onBack}>
            <Text style={styles.cancelButtonText}>Chọn phương thức khác</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleCancel} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Thanh toán QR</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Countdown Timer */}
        <View style={styles.timerContainer}>
          <Ionicons name="time-outline" size={20} color={timeLeft < 60 ? '#FF4444' : '#FF6B00'} />
          <Text style={[styles.timerText, timeLeft < 60 && styles.timerWarning]}>
            Mã QR hết hạn sau: {formatTime(timeLeft)}
          </Text>
        </View>

        {/* QR Code */}
        <View style={styles.qrContainer}>
          <View style={styles.qrWrapper}>
            {!qrLoaded && (
              <View style={styles.qrPlaceholder}>
                <ActivityIndicator size="large" color="#FF6B00" />
              </View>
            )}
            <Image
              source={{ uri: qrData?.qrCodeUrl }}
              style={[styles.qrImage, !qrLoaded && styles.hidden]}
              resizeMode="contain"
              onLoad={() => setQrLoaded(true)}
              onError={() => setError('Không thể tải mã QR')}
            />
          </View>
          <Text style={styles.qrNote}>Quét mã QR bằng app ngân hàng để thanh toán</Text>
        </View>

        {/* Payment Info */}
        <View style={styles.infoCard}>
          <Text style={styles.infoTitle}>Thông tin chuyển khoản</Text>
          
          <View style={styles.infoRow}>
            <View style={styles.infoLeft}>
              <Text style={styles.infoLabel}>Ngân hàng</Text>
              <Text style={styles.infoValue}>MB Bank (Quân đội)</Text>
            </View>
            <Image
              source={{ uri: 'https://img.vietqr.io/image/MB-logo.png' }}
              style={styles.bankLogo}
            />
          </View>

          <View style={styles.divider} />

          <View style={styles.infoRow}>
            <View style={styles.infoLeft}>
              <Text style={styles.infoLabel}>Số tài khoản</Text>
              <Text style={styles.infoValue}>{qrData?.bankAccount}</Text>
            </View>
            <TouchableOpacity onPress={copyAccountNumber} style={styles.copyButton}>
              <Ionicons name="copy-outline" size={20} color="#FF6B00" />
            </TouchableOpacity>
          </View>

          <View style={styles.divider} />

          <View style={styles.infoRow}>
            <View style={styles.infoLeft}>
              <Text style={styles.infoLabel}>Chủ tài khoản</Text>
              <Text style={styles.infoValue}>{qrData?.accountName}</Text>
            </View>
          </View>

          <View style={styles.divider} />

          <View style={styles.infoRow}>
            <View style={styles.infoLeft}>
              <Text style={styles.infoLabel}>Số tiền</Text>
              <Text style={[styles.infoValue, styles.amountText]}>
                {formatCurrency(qrData?.amount || totalAmount)}
              </Text>
            </View>
          </View>

          <View style={styles.divider} />

          <View style={styles.infoRow}>
            <View style={styles.infoLeft}>
              <Text style={styles.infoLabel}>Nội dung CK</Text>
              <Text style={styles.infoValue}>{qrData?.transactionId}</Text>
            </View>
            <TouchableOpacity onPress={copyTransactionId} style={styles.copyButton}>
              <Ionicons name="copy-outline" size={20} color="#FF6B00" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Instructions */}
        <View style={styles.instructionsCard}>
          <Text style={styles.instructionsTitle}>Hướng dẫn thanh toán</Text>
          <View style={styles.instructionItem}>
            <View style={styles.stepNumber}><Text style={styles.stepText}>1</Text></View>
            <Text style={styles.instructionText}>Mở app ngân hàng và chọn Quét QR</Text>
          </View>
          <View style={styles.instructionItem}>
            <View style={styles.stepNumber}><Text style={styles.stepText}>2</Text></View>
            <Text style={styles.instructionText}>Quét mã QR ở trên hoặc nhập thông tin chuyển khoản</Text>
          </View>
          <View style={styles.instructionItem}>
            <View style={styles.stepNumber}><Text style={styles.stepText}>3</Text></View>
            <Text style={styles.instructionText}>Kiểm tra thông tin và xác nhận thanh toán</Text>
          </View>
          <View style={styles.instructionItem}>
            <View style={styles.stepNumber}><Text style={styles.stepText}>4</Text></View>
            <Text style={styles.instructionText}>Đợi hệ thống xác nhận (tự động sau 30-60 giây)</Text>
          </View>
        </View>

        {/* Status indicator */}
        <View style={styles.statusContainer}>
          <ActivityIndicator size="small" color="#FF6B00" />
          <Text style={styles.statusText}>Đang chờ thanh toán...</Text>
        </View>

        {/* Spacer */}
        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Bottom Button */}
      <View style={[styles.bottomContainer, { paddingBottom: insets.bottom + 16 }]}>
        <TouchableOpacity style={styles.cancelBottomButton} onPress={handleCancel}>
          <Ionicons name="close-circle-outline" size={20} color="#666" />
          <Text style={styles.cancelBottomText}>Hủy và chọn phương thức khác</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  centerContent: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFF',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#EEE',
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  timerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFF5EE',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 12,
    marginBottom: 16,
  },
  timerText: {
    marginLeft: 8,
    fontSize: 16,
    fontWeight: '600',
    color: '#FF6B00',
  },
  timerWarning: {
    color: '#FF4444',
  },
  qrContainer: {
    alignItems: 'center',
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  qrWrapper: {
    width: width - 100,
    height: width - 100,
    backgroundColor: '#FFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  qrPlaceholder: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  qrImage: {
    width: '100%',
    height: '100%',
  },
  hidden: {
    opacity: 0,
  },
  qrNote: {
    marginTop: 12,
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
  infoCard: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 16,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8,
  },
  infoLeft: {
    flex: 1,
  },
  infoLabel: {
    fontSize: 12,
    color: '#999',
    marginBottom: 4,
  },
  infoValue: {
    fontSize: 15,
    color: '#333',
    fontWeight: '500',
  },
  amountText: {
    color: '#FF6B00',
    fontSize: 18,
    fontWeight: '700',
  },
  bankLogo: {
    width: 50,
    height: 30,
    resizeMode: 'contain',
  },
  copyButton: {
    padding: 8,
    backgroundColor: '#FFF5EE',
    borderRadius: 8,
  },
  divider: {
    height: 1,
    backgroundColor: '#EEE',
    marginVertical: 4,
  },
  instructionsCard: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
  },
  instructionsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 16,
  },
  instructionItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  stepNumber: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#FF6B00',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  stepText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: '600',
  },
  instructionText: {
    flex: 1,
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
  },
  statusText: {
    marginLeft: 8,
    fontSize: 14,
    color: '#FF6B00',
    fontWeight: '500',
  },
  bottomContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#FFF',
    paddingTop: 16,
    paddingHorizontal: 16,
    borderTopWidth: 1,
    borderTopColor: '#EEE',
  },
  cancelBottomButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F5F5F5',
    paddingVertical: 14,
    borderRadius: 12,
  },
  cancelBottomText: {
    marginLeft: 8,
    fontSize: 15,
    color: '#666',
    fontWeight: '500',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  errorText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 24,
  },
  retryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FF6B00',
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 12,
    marginTop: 24,
  },
  retryButtonText: {
    marginLeft: 8,
    fontSize: 16,
    color: '#FFF',
    fontWeight: '600',
  },
  cancelButton: {
    marginTop: 16,
    paddingVertical: 12,
  },
  cancelButtonText: {
    fontSize: 15,
    color: '#666',
  },
});

export default QrPaymentScreen;
