import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as forgotService from '../../../core/services/forgotService';
import { COLORS } from '../../../shared/constants/theme';

interface Props {
  onBack: () => void;
}

export function ForgotPasswordScreen({ onBack }: Props) {
  const [step, setStep] = useState<'phone' | 'verify' | 'reset'>('phone');
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [resetToken, setResetToken] = useState<string | null>(null);
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');

  const sendOtp = async () => {
    if (!phone.trim()) return Alert.alert('Lỗi', 'Vui lòng nhập số điện thoại');
    try {
      setIsLoading(true);
      await forgotService.requestOtp(phone.trim());
      Alert.alert('Thành công', 'Mã OTP đã được gửi (kiểm tra SMS)');
      setStep('verify');
    } catch (e: any) {
      Alert.alert('Lỗi', e.response?.data?.message || e.message || 'Gửi OTP thất bại');
    } finally { setIsLoading(false); }
  };

  const checkOtp = async () => {
    if (!otp.trim()) return Alert.alert('Lỗi', 'Vui lòng nhập mã OTP');
    try {
      setIsLoading(true);
      const res = await forgotService.verifyOtp(phone.trim(), otp.trim());
      // response shape: { success: true, message:'', data: { resetToken: '...' } }
      const token = res?.data?.data?.resetToken || res?.data?.resetToken || res?.resetToken;
      if (!token) {
        Alert.alert('Lỗi', 'Máy chủ không trả reset token. Vui lòng thử lại.');
        return;
      }
      setResetToken(token);
      setStep('reset');
    } catch (e: any) {
      Alert.alert('Lỗi', e.response?.data?.message || e.message || 'Xác thực OTP thất bại');
    } finally { setIsLoading(false); }
  };

  const doReset = async () => {
    if (!password || !confirm) return Alert.alert('Lỗi', 'Vui lòng nhập mật khẩu và xác nhận');
    if (password !== confirm) return Alert.alert('Lỗi', 'Mật khẩu xác nhận không khớp');
    try {
      setIsLoading(true);
      await forgotService.resetPassword(resetToken as string, password);
      Alert.alert('Thành công', 'Mật khẩu đã được đặt lại');
      onBack();
    } catch (e: any) {
      Alert.alert('Lỗi', e.response?.data?.message || e.message || 'Đặt lại mật khẩu thất bại');
    } finally { setIsLoading(false); }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={{ marginLeft: 8 }}>
          <Ionicons name="arrow-back" size={24} color="#111827" />
        </TouchableOpacity>
        <Text style={styles.title}>Quên mật khẩu</Text>
      </View>

      {step === 'phone' && (
        <View style={styles.content}>
          <Text style={styles.label}>Số điện thoại</Text>
          <TextInput style={styles.input} placeholder="Số điện thoại" value={phone} onChangeText={setPhone} keyboardType="phone-pad" />
          <TouchableOpacity style={[styles.button, isLoading && styles.disabled]} onPress={sendOtp} disabled={isLoading}>
            {isLoading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Gửi mã</Text>}
          </TouchableOpacity>
        </View>
      )}

      {step === 'verify' && (
        <View style={styles.content}>
          <Text style={styles.label}>Nhập mã OTP</Text>
          <TextInput style={styles.input} placeholder="OTP" value={otp} onChangeText={setOtp} keyboardType="number-pad" />
          <TouchableOpacity style={[styles.button, isLoading && styles.disabled]} onPress={checkOtp} disabled={isLoading}>
            {isLoading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Xác thực</Text>}
          </TouchableOpacity>
        </View>
      )}

      {step === 'reset' && (
        <View style={styles.content}>
          <Text style={styles.label}>Mật khẩu mới</Text>
          <TextInput style={styles.input} placeholder="Mật khẩu" value={password} onChangeText={setPassword} secureTextEntry />
          <Text style={[styles.label, { marginTop: 12 }]}>Xác nhận mật khẩu</Text>
          <TextInput style={styles.input} placeholder="Xác nhận mật khẩu" value={confirm} onChangeText={setConfirm} secureTextEntry />
          <TouchableOpacity style={[styles.button, isLoading && styles.disabled]} onPress={doReset} disabled={isLoading}>
            {isLoading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Đặt lại mật khẩu</Text>}
          </TouchableOpacity>
        </View>
      )}

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  header: { flexDirection: 'row', alignItems: 'center', padding: 16 },
  title: { fontSize: 18, fontWeight: '600', marginLeft: 12 },
  content: { padding: 24 },
  label: { fontSize: 14, color: '#374151', marginBottom: 8 },
  input: { backgroundColor: '#f9fafb', borderRadius: 10, padding: 12, borderWidth: 1, borderColor: '#e5e7eb' },
  button: { backgroundColor: COLORS.primary, borderRadius: 10, padding: 14, alignItems: 'center', marginTop: 16 },
  buttonText: { color: '#fff', fontWeight: '600' },
  disabled: { opacity: 0.7 },
});