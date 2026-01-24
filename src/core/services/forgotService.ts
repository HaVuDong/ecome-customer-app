import apiClient from './api';

export async function requestOtp(phone: string) {
  return apiClient.post('/auth/forgot/request-otp', { phone });
}

export async function verifyOtp(phone: string, otp: string) {
  return apiClient.post('/auth/forgot/verify-otp', { phone, otp });
}

export async function resetPassword(resetToken: string, password: string) {
  return apiClient.post('/auth/forgot/reset', { resetToken, password });
}
