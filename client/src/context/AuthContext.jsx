import React, { createContext, useContext, useState } from "react";
import api from "../services/api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem("studysphere_user");
    return stored ? JSON.parse(stored) : null;
  });

  async function login(email, password) {
    const { data } = await api.post("/auth/login", { email, password });
    localStorage.setItem("studysphere_token", data.token);
    localStorage.setItem("studysphere_user", JSON.stringify(data.user));
    setUser(data.user);
    return data.user;
  }

  async function register(name, email, password, role) {
    const { data } = await api.post("/auth/register", { name, email, password, role });
    localStorage.setItem("studysphere_token", data.token);
    localStorage.setItem("studysphere_user", JSON.stringify(data.user));
    setUser(data.user);
    return data.user;
  }

  // Step 1 of the new OTP registration flow: sends a 6-digit code to the given email.
  // Nothing is created yet — the account is only made once verifyOtp succeeds.
  async function sendRegistrationOtp(name, email, password, role) {
    const { data } = await api.post("/auth/send-otp", { name, email, password, role });
    return data; // { message, email, expiresInMinutes, devOtp? }
  }

  // Step 2: verifies the code and finishes creating + logging in the account.
  async function verifyRegistrationOtp(email, otp) {
    const { data } = await api.post("/auth/verify-otp", { email, otp });
    localStorage.setItem("studysphere_token", data.token);
    localStorage.setItem("studysphere_user", JSON.stringify(data.user));
    setUser(data.user);
    return data.user;
  }

  async function resendRegistrationOtp(email) {
    const { data } = await api.post("/auth/resend-otp", { email });
    return data;
  }

  // Forgot-password flow: step 1 sends a reset code, step 2 verifies it + sets the new password.
  async function sendPasswordResetOtp(email) {
    const { data } = await api.post("/auth/forgot-password", { email });
    return data; // { message, expiresInMinutes, devOtp? }
  }

  async function resendPasswordResetOtp(email) {
    const { data } = await api.post("/auth/forgot-password/resend", { email });
    return data;
  }

  async function resetPassword(email, otp, newPassword) {
    const { data } = await api.post("/auth/reset-password", { email, otp, newPassword });
    return data; // { message }
  }

  function logout() {
    localStorage.removeItem("studysphere_token");
    localStorage.removeItem("studysphere_user");
    setUser(null);
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        register,
        logout,
        sendRegistrationOtp,
        verifyRegistrationOtp,
        resendRegistrationOtp,
        sendPasswordResetOtp,
        resendPasswordResetOtp,
        resetPassword,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
