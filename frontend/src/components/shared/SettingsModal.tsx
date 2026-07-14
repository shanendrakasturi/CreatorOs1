'use client';

import React, { useState, useEffect } from 'react';
import { CreatorAPI } from '@/lib/api';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const ACCENT_COLORS = [
  { name: 'Blue',   hex: '#155CBE' },
  { name: 'Purple', hex: '#8B5CF6' },
  { name: 'Green',  hex: '#10B981' },
  { name: 'Orange', hex: '#F97316' },
  { name: 'Pink',   hex: '#EC4899' },
  { name: 'Cyan',   hex: '#06B6D4' },
];

export default function SettingsModal({ isOpen, onClose }: SettingsModalProps) {
  // Existing state fields
  const [dealAlerts, setDealAlerts] = useState(true);
  const [invoiceReminders, setInvoiceReminders] = useState(true);
  const [weeklyReports, setWeeklyReports] = useState(false);
  const [defaultPlatform, setDefaultPlatform] = useState('YouTube');
  const [currency, setCurrency] = useState('USD ($)');

  // New Appearance + Security states
  const [theme, setTheme] = useState<'dark' | 'light' | 'auto'>('dark');
  const [accentColor, setAccentColor] = useState('#155CBE');
  const [compactMode, setCompactMode] = useState(false);
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);

  // Sub-modal toggle state
  const [activeSubModal, setActiveSubModal] = useState<'2fa' | 'password' | 'devices' | 'loginHistory' | null>(null);

  // Sub-modal specific data states
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState('');
  const [submittingPassword, setSubmittingPassword] = useState(false);

  const [devices, setDevices] = useState<any[]>([]);
  const [loginHistory, setLoginHistory] = useState<any[]>([]);
  
  const [twoFactorCode, setTwoFactorCode] = useState('');
  const [twoFactorError, setTwoFactorError] = useState('');
  const [twoFactorQR, setTwoFactorQR] = useState('');
  const [twoFactorBackup, setTwoFactorBackup] = useState<string[]>([]);
  const [setup2faStep, setSetup2faStep] = useState(1); // 1: QR setup, 2: backup codes / enabled

  // Load settings on mount
  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      const stored = localStorage.getItem('creatoros_settings');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed.dealAlerts !== undefined) setDealAlerts(parsed.dealAlerts);
        if (parsed.invoiceReminders !== undefined) setInvoiceReminders(parsed.invoiceReminders);
        if (parsed.weeklyReports !== undefined) setWeeklyReports(parsed.weeklyReports);
        if (parsed.defaultPlatform !== undefined) setDefaultPlatform(parsed.defaultPlatform);
        if (parsed.currency !== undefined) setCurrency(parsed.currency);
        if (parsed.theme !== undefined) setTheme(parsed.theme);
        if (parsed.accentColor !== undefined) {
          setAccentColor(parsed.accentColor);
          document.documentElement.style.setProperty('--color-primary', parsed.accentColor);
        }
        if (parsed.compactMode !== undefined) setCompactMode(parsed.compactMode);
        if (parsed.twoFactorEnabled !== undefined) setTwoFactorEnabled(parsed.twoFactorEnabled);
      }
    } catch (e) {
      console.error("Failed to load settings from localStorage", e);
    }
  }, [isOpen]);

  // Load devices and login history when those sub-modals open
  useEffect(() => {
    if (activeSubModal === 'devices') {
      CreatorAPI.getActiveDevices().then(setDevices);
    } else if (activeSubModal === 'loginHistory') {
      CreatorAPI.getLoginHistory().then(setLoginHistory);
    } else if (activeSubModal === '2fa' && !twoFactorEnabled) {
      // Trigger setup flow backend mock
      CreatorAPI.setup2fa().then(res => {
        setTwoFactorQR(res.qrCode);
        setTwoFactorBackup(res.backupCodes);
      });
    }
  }, [activeSubModal, twoFactorEnabled]);

  if (!isOpen) return null;

  const handleAccentChange = (color: string) => {
    setAccentColor(color);
    document.documentElement.style.setProperty('--color-primary', color);
  };

  const handleSavePreferences = async () => {
    const newSettings = {
      dealAlerts,
      invoiceReminders,
      weeklyReports,
      defaultPlatform,
      currency,
      theme,
      accentColor,
      compactMode,
      twoFactorEnabled,
    };

    // Save locally
    if (typeof window !== 'undefined') {
      localStorage.setItem('creatoros_settings', JSON.stringify(newSettings));
    }

    // Call API patch
    await CreatorAPI.updateSettings(newSettings);
    onClose();
  };

  const handleResetData = () => {
    if (confirm('Are you sure you want to reset all dashboard data? This will clear custom posts, deals, and invoices.')) {
      if (typeof window !== 'undefined') {
        localStorage.clear();
        window.location.reload();
      }
    }
  };

  // --- Sub-modal Action Handlers ---

  const handlePasswordUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError('');
    setPasswordSuccess('');

    if (newPassword !== confirmPassword) {
      setPasswordError("New passwords do not match.");
      return;
    }
    if (newPassword.length < 6) {
      setPasswordError("Password must be at least 6 characters.");
      return;
    }

    setSubmittingPassword(true);
    try {
      await CreatorAPI.changePassword({ currentPassword, newPassword });
      setPasswordSuccess("Password updated successfully!");
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setTimeout(() => setActiveSubModal(null), 1500);
    } catch (err: any) {
      setPasswordError(err.message || "Failed to update password. Current password may be incorrect.");
    } finally {
      setSubmittingPassword(false);
    }
  };

  const handleDeviceLogout = async (deviceId: string) => {
    await CreatorAPI.logoutDevice(deviceId);
    setDevices(prev => prev.filter(d => d.id !== deviceId));
  };

  const handle2faVerify = async () => {
    setTwoFactorError('');
    try {
      await CreatorAPI.verify2fa(twoFactorCode);
      setTwoFactorEnabled(true);
      setSetup2faStep(2);
    } catch (err) {
      setTwoFactorError("Invalid verification code. Please try again.");
    }
  };

  const handle2faDisable = async () => {
    if (confirm("Disable two-factor authentication? Your account will be less secure.")) {
      await CreatorAPI.disable2fa();
      setTwoFactorEnabled(false);
      setActiveSubModal(null);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      
      {/* Settings Main Modal */}
      <div 
        className="bg-surface-card border border-outline-variant/10 rounded-2xl w-full max-w-md p-6 relative shadow-2xl animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-on-surface-variant hover:text-on-surface transition-colors"
          aria-label="Close modal"
        >
          <span className="material-symbols-outlined">close</span>
        </button>

        <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2 font-headline">
          <span className="material-symbols-outlined text-primary">settings</span>
          Account Settings
        </h2>

        {/* Scrollable Container */}
        <div className="space-y-6 max-h-[60vh] overflow-y-auto pr-1 custom-scrollbar">
          
          {/* Notification Settings */}
          <div>
            <h3 className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider mb-3 font-label">Notification Settings</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center bg-surface-dim/20 px-3 py-2.5 rounded-lg border border-outline-variant/5">
                <div>
                  <h4 className="text-xs font-semibold text-white">Deal Alerts</h4>
                  <p className="text-[10px] text-on-surface-variant">Notify when brand deals progress or are added</p>
                </div>
                <input 
                  type="checkbox" 
                  checked={dealAlerts} 
                  onChange={(e) => setDealAlerts(e.target.checked)}
                  className="w-4 h-4 rounded border-outline-variant/30 text-primary bg-surface-dim focus:ring-primary focus:ring-offset-background"
                />
              </div>

              <div className="flex justify-between items-center bg-surface-dim/20 px-3 py-2.5 rounded-lg border border-outline-variant/5">
                <div>
                  <h4 className="text-xs font-semibold text-white">Invoicing Reminders</h4>
                  <p className="text-[10px] text-on-surface-variant">Remind about pending or overdue invoices</p>
                </div>
                <input 
                  type="checkbox" 
                  checked={invoiceReminders} 
                  onChange={(e) => setInvoiceReminders(e.target.checked)}
                  className="w-4 h-4 rounded border-outline-variant/30 text-primary bg-surface-dim focus:ring-primary focus:ring-offset-background"
                />
              </div>

              <div className="flex justify-between items-center bg-surface-dim/20 px-3 py-2.5 rounded-lg border border-outline-variant/5">
                <div>
                  <h4 className="text-xs font-semibold text-white">Weekly Performance Reports</h4>
                  <p className="text-[10px] text-on-surface-variant">Receive email digest of your analytics growth</p>
                </div>
                <input 
                  type="checkbox" 
                  checked={weeklyReports} 
                  onChange={(e) => setWeeklyReports(e.target.checked)}
                  className="w-4 h-4 rounded border-outline-variant/30 text-primary bg-surface-dim focus:ring-primary focus:ring-offset-background"
                />
              </div>
            </div>
          </div>

          {/* General Preferences */}
          <div>
            <h3 className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider mb-3 font-label">General Preferences</h3>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[10px] font-bold text-on-surface-variant uppercase tracking-wider mb-1.5 font-label">
                  Default Platform
                </label>
                <select
                  value={defaultPlatform}
                  onChange={(e) => setDefaultPlatform(e.target.value)}
                  className="w-full bg-surface-dim border border-outline-variant/30 rounded-lg px-2.5 py-1.5 text-xs text-on-surface focus:outline-none focus:border-primary"
                >
                  <option value="YouTube">YouTube</option>
                  <option value="Instagram">Instagram</option>
                  <option value="TikTok">TikTok</option>
                  <option value="Twitter">Twitter</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-on-surface-variant uppercase tracking-wider mb-1.5 font-label">
                  Currency
                </label>
                <select
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value)}
                  className="w-full bg-surface-dim border border-outline-variant/30 rounded-lg px-2.5 py-1.5 text-xs text-on-surface focus:outline-none focus:border-primary"
                >
                  <option value="USD ($)">USD ($)</option>
                  <option value="EUR (€)">EUR (€)</option>
                  <option value="GBP (£)">GBP (£)</option>
                  <option value="INR (₹)">INR (₹)</option>
                </select>
              </div>
            </div>
          </div>

          {/* ─── APPEARANCE SECTION ────────────────────────────────────────── */}
          <div className="border-t border-outline-variant/5 pt-4">
            <h3 className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider mb-1 font-label">Appearance</h3>
            <p className="text-[10px] text-on-surface-variant mb-3">Personalize the interface.</p>
            
            <div className="space-y-4">
              {/* Theme Segmented Toggle */}
              <div>
                <label className="block text-[10px] font-bold text-on-surface-variant uppercase tracking-wider mb-1.5 font-label">
                  Theme
                </label>
                <div className="flex bg-surface-dim/40 p-1 rounded-xl border border-outline-variant/10">
                  {(['dark', 'light', 'auto'] as const).map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setTheme(t)}
                      className={`flex-1 py-1.5 text-xs font-semibold rounded-lg capitalize transition-all ${
                        theme === t
                          ? 'bg-primary text-white shadow-sm'
                          : 'text-on-surface-variant hover:text-white'
                      }`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>

              {/* Accent Color Circles */}
              <div>
                <label className="block text-[10px] font-bold text-on-surface-variant uppercase tracking-wider mb-1.5 font-label">
                  Accent Color
                </label>
                <div className="flex gap-2">
                  {ACCENT_COLORS.map((c) => (
                    <button
                      key={c.hex}
                      type="button"
                      onClick={() => handleAccentChange(c.hex)}
                      className="w-7 h-7 rounded-full transition-all relative flex items-center justify-center border border-black/30 cursor-pointer hover:scale-105 active:scale-95"
                      style={{ backgroundColor: c.hex }}
                      title={c.name}
                    >
                      {accentColor === c.hex && (
                        <div className="w-4 h-4 rounded-full border-2 border-white" />
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Compact Mode Row */}
              <div className="flex justify-between items-center bg-surface-dim/20 px-3 py-2.5 rounded-lg border border-outline-variant/5">
                <div>
                  <h4 className="text-xs font-semibold text-white">Compact Mode</h4>
                  <p className="text-[10px] text-on-surface-variant">Reduce spacing and padding for denser layouts</p>
                </div>
                <input 
                  type="checkbox" 
                  checked={compactMode} 
                  onChange={(e) => setCompactMode(e.target.checked)}
                  className="w-4 h-4 rounded border-outline-variant/30 text-primary bg-surface-dim focus:ring-primary focus:ring-offset-background"
                />
              </div>
            </div>
          </div>

          {/* ─── PRIVACY & SECURITY SECTION ─────────────────────────────────── */}
          <div className="border-t border-outline-variant/5 pt-4">
            <h3 className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider mb-1 font-label">Privacy & Security</h3>
            <p className="text-[10px] text-on-surface-variant mb-3">Keep the account secure.</p>

            <div className="space-y-3">
              {/* 2FA Toggle Row */}
              <div className="flex justify-between items-center bg-surface-dim/20 px-3 py-2.5 rounded-lg border border-outline-variant/5">
                <div>
                  <h4 className="text-xs font-semibold text-white">Two-Factor Authentication</h4>
                  <p className="text-[10px] text-on-surface-variant">Add an extra layer of security</p>
                </div>
                
                <div className="flex items-center gap-2">
                  <span className={`text-[9px] font-bold font-label uppercase px-2 py-0.5 rounded ${
                    twoFactorEnabled ? 'text-success bg-success/10' : 'text-on-surface-variant bg-surface-container'
                  }`}>
                    {twoFactorEnabled ? 'Enabled' : 'Disabled'}
                  </span>
                  
                  {/* Switch toggle styling */}
                  <button
                    type="button"
                    onClick={() => {
                      if (twoFactorEnabled) {
                        handle2faDisable();
                      } else {
                        setSetup2faStep(1);
                        setTwoFactorCode('');
                        setActiveSubModal('2fa');
                      }
                    }}
                    className={`w-9 h-5 rounded-full p-0.5 transition-colors cursor-pointer ${
                      twoFactorEnabled ? 'bg-success' : 'bg-surface-container'
                    }`}
                  >
                    <div className={`w-4 h-4 bg-white rounded-full transition-transform shadow-sm ${
                      twoFactorEnabled ? 'translate-x-4' : 'translate-x-0'
                    }`} />
                  </button>
                </div>
              </div>

              {/* Change Password Row */}
              <div className="flex justify-between items-center bg-surface-dim/20 px-3 py-2.5 rounded-lg border border-outline-variant/5">
                <div>
                  <h4 className="text-xs font-semibold text-white">Change Password</h4>
                  <p className="text-[10px] text-on-surface-variant">Update your account password</p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setPasswordError('');
                    setPasswordSuccess('');
                    setActiveSubModal('password');
                  }}
                  className="px-3 py-1 bg-surface-container hover:bg-surface-container-high border border-outline-variant/20 rounded-lg text-[10px] font-semibold text-white transition-colors"
                >
                  Change
                </button>
              </div>

              {/* Active Devices Row */}
              <div className="flex justify-between items-center bg-surface-dim/20 px-3 py-2.5 rounded-lg border border-outline-variant/5">
                <div>
                  <h4 className="text-xs font-semibold text-white">Active Devices</h4>
                  <p className="text-[10px] text-on-surface-variant">Manage currently logged-in devices</p>
                </div>
                <button
                  type="button"
                  onClick={() => setActiveSubModal('devices')}
                  className="px-3 py-1 bg-surface-container hover:bg-surface-container-high border border-outline-variant/20 rounded-lg text-[10px] font-semibold text-white transition-colors"
                >
                  View
                </button>
              </div>

              {/* Login History Row */}
              <div className="flex justify-between items-center bg-surface-dim/20 px-3 py-2.5 rounded-lg border border-outline-variant/5">
                <div>
                  <h4 className="text-xs font-semibold text-white">Login History</h4>
                  <p className="text-[10px] text-on-surface-variant">Review recent sign-in activity</p>
                </div>
                <button
                  type="button"
                  onClick={() => setActiveSubModal('loginHistory')}
                  className="px-3 py-1 bg-surface-container hover:bg-surface-container-high border border-outline-variant/20 rounded-lg text-[10px] font-semibold text-white transition-colors"
                >
                  View
                </button>
              </div>
            </div>
          </div>

          {/* Danger Zone */}
          <div className="pt-4 border-t border-outline-variant/5">
            <h3 className="text-[10px] font-bold text-error uppercase tracking-wider mb-3 font-label">Danger Zone</h3>
            <button
              onClick={handleResetData}
              className="w-full bg-error/10 hover:bg-error text-error hover:text-white py-2 rounded-lg text-xs font-bold transition-all border border-error/20 hover:border-error flex items-center justify-center gap-2"
            >
              <span className="material-symbols-outlined text-[16px]">refresh</span>
              Reset System Data
            </button>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="pt-4 flex gap-3 border-t border-outline-variant/5 mt-6">
          <button
            onClick={handleSavePreferences}
            className="w-full bg-primary hover:bg-primary-hover text-white py-2.5 rounded-lg text-xs font-bold transition-all shadow-lg shadow-primary/20"
          >
            Save Preferences
          </button>
        </div>
      </div>


      {/* ─── SUB-FLOW MODALS ────────────────────────────────────────────────── */}

      {/* 2FA Sub-Modal */}
      {activeSubModal === '2fa' && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
          <div className="bg-surface-card border border-outline-variant/10 rounded-2xl w-full max-w-sm p-6 relative shadow-2xl">
            <button 
              onClick={() => setActiveSubModal(null)} 
              className="absolute top-4 right-4 text-on-surface-variant hover:text-white transition-colors"
            >
              <span className="material-symbols-outlined">close</span>
            </button>

            <h3 className="text-base font-bold text-white mb-4 font-headline flex items-center gap-2">
              <span className="material-symbols-outlined text-primary">security</span>
              Two-Factor Authentication Setup
            </h3>

            {setup2faStep === 1 ? (
              <div className="space-y-4 text-center">
                <p className="text-xs text-on-surface-variant text-left leading-relaxed">
                  Scan this QR code using your authenticator app (Google Authenticator, Duo, etc.) and enter the 6-digit verification code below.
                </p>
                {twoFactorQR && (
                  <div className="bg-white p-2 rounded-lg inline-block mx-auto border border-outline-variant/20 shadow-sm">
                    <img src={twoFactorQR} alt="QR Code" className="w-36 h-36" />
                  </div>
                )}
                
                <div className="space-y-2 text-left">
                  <label className="block text-[10px] font-bold text-on-surface-variant uppercase tracking-wider font-label">
                    Verification Code
                  </label>
                  <input
                    type="text"
                    maxLength={6}
                    value={twoFactorCode}
                    onChange={(e) => setTwoFactorCode(e.target.value.replace(/\D/g, ''))}
                    placeholder="123456"
                    className="w-full bg-surface-dim border border-outline-variant/30 rounded-lg px-3 py-2 text-center text-sm font-label text-white tracking-widest focus:outline-none focus:border-primary"
                  />
                  {twoFactorError && <p className="text-[10px] text-error font-medium">{twoFactorError}</p>}
                </div>

                <div className="flex gap-2 pt-2">
                  <button
                    onClick={() => setActiveSubModal(null)}
                    className="flex-1 py-2 bg-surface-container hover:bg-surface-container-high text-on-surface-variant hover:text-white text-xs font-semibold rounded-xl transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handle2faVerify}
                    disabled={twoFactorCode.length !== 6}
                    className="flex-1 py-2 bg-primary hover:bg-primary-hover disabled:opacity-40 text-white text-xs font-bold rounded-xl transition-all"
                  >
                    Verify & Enable
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center gap-2 p-3 bg-success/15 border border-success/25 rounded-xl">
                  <span className="material-symbols-outlined text-[20px] text-success">check_circle</span>
                  <p className="text-xs text-success font-semibold">2FA Enabled Successfully!</p>
                </div>
                <p className="text-xs text-on-surface-variant leading-relaxed">
                  Store these backup codes in a safe place. You can use them to sign in if you lose access to your device.
                </p>
                
                <div className="grid grid-cols-2 gap-2 bg-surface-dim/40 border border-outline-variant/10 p-3 rounded-lg font-label text-xs text-white text-center">
                  {twoFactorBackup.map(code => <div key={code}>{code}</div>)}
                </div>

                <button
                  onClick={() => setActiveSubModal(null)}
                  className="w-full py-2 bg-primary hover:bg-primary-hover text-white text-xs font-bold rounded-xl transition-all"
                >
                  Done
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Change Password Sub-Modal */}
      {activeSubModal === 'password' && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
          <div className="bg-surface-card border border-outline-variant/10 rounded-2xl w-full max-w-sm p-6 relative shadow-2xl">
            <button 
              onClick={() => setActiveSubModal(null)} 
              className="absolute top-4 right-4 text-on-surface-variant hover:text-white transition-colors"
            >
              <span className="material-symbols-outlined">close</span>
            </button>

            <h3 className="text-base font-bold text-white mb-5 font-headline flex items-center gap-2">
              <span className="material-symbols-outlined text-primary">lock</span>
              Update Password
            </h3>

            <form onSubmit={handlePasswordUpdate} className="space-y-4">
              <div>
                <label className="block text-[10px] font-bold text-on-surface-variant uppercase tracking-wider mb-1.5 font-label">
                  Current Password
                </label>
                <input
                  type="password"
                  required
                  value={currentPassword}
                  onChange={e => setCurrentPassword(e.target.value)}
                  className="w-full bg-surface-dim border border-outline-variant/30 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-primary"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-on-surface-variant uppercase tracking-wider mb-1.5 font-label">
                  New Password
                </label>
                <input
                  type="password"
                  required
                  value={newPassword}
                  onChange={e => setNewPassword(e.target.value)}
                  className="w-full bg-surface-dim border border-outline-variant/30 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-primary"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-on-surface-variant uppercase tracking-wider mb-1.5 font-label">
                  Confirm New Password
                </label>
                <input
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={e => setConfirmPassword(e.target.value)}
                  className="w-full bg-surface-dim border border-outline-variant/30 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-primary"
                />
              </div>

              {passwordError && <p className="text-[10px] text-error font-medium">{passwordError}</p>}
              {passwordSuccess && <p className="text-[10px] text-success font-medium">{passwordSuccess}</p>}

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setActiveSubModal(null)}
                  className="flex-1 py-2 bg-surface-container hover:bg-surface-container-high text-on-surface-variant hover:text-white text-xs font-semibold rounded-xl transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingPassword}
                  className="flex-1 py-2 bg-primary hover:bg-primary-hover disabled:opacity-40 text-white text-xs font-bold rounded-xl transition-all"
                >
                  {submittingPassword ? "Updating..." : "Update Password"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Active Devices Sub-Modal */}
      {activeSubModal === 'devices' && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
          <div className="bg-surface-card border border-outline-variant/10 rounded-2xl w-full max-w-sm p-6 relative shadow-2xl">
            <button 
              onClick={() => setActiveSubModal(null)} 
              className="absolute top-4 right-4 text-on-surface-variant hover:text-white transition-colors"
            >
              <span className="material-symbols-outlined">close</span>
            </button>

            <h3 className="text-base font-bold text-white mb-4 font-headline flex items-center gap-2">
              <span className="material-symbols-outlined text-primary">devices</span>
              Active Sessions
            </h3>

            <div className="space-y-3 max-h-[40vh] overflow-y-auto pr-1 custom-scrollbar">
              {devices.map((d) => (
                <div key={d.id} className="bg-surface-dim/40 border border-outline-variant/5 p-3 rounded-lg flex items-center justify-between">
                  <div className="min-w-0">
                    <h4 className="text-xs font-semibold text-white flex items-center gap-1.5">
                      {d.device}
                      {d.isCurrent && (
                        <span className="text-[8px] bg-primary/20 text-primary font-bold px-1.5 py-0.5 rounded font-label uppercase">Current</span>
                      )}
                    </h4>
                    <p className="text-[10px] text-on-surface-variant mt-0.5">{d.location} · {d.lastActive}</p>
                  </div>
                  
                  {!d.isCurrent && (
                    <button
                      onClick={() => handleDeviceLogout(d.id)}
                      className="text-[10px] text-error hover:underline font-semibold"
                    >
                      Log out
                    </button>
                  )}
                </div>
              ))}
            </div>

            <button
              onClick={() => setActiveSubModal(null)}
              className="w-full mt-4 py-2 bg-surface-container hover:bg-surface-container-high text-white text-xs font-semibold rounded-xl transition-all"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Login History Sub-Modal */}
      {activeSubModal === 'loginHistory' && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
          <div className="bg-surface-card border border-outline-variant/10 rounded-2xl w-full max-w-sm p-6 relative shadow-2xl">
            <button 
              onClick={() => setActiveSubModal(null)} 
              className="absolute top-4 right-4 text-on-surface-variant hover:text-white transition-colors"
            >
              <span className="material-symbols-outlined">close</span>
            </button>

            <h3 className="text-base font-bold text-white mb-4 font-headline flex items-center gap-2">
              <span className="material-symbols-outlined text-primary">history</span>
              Sign-In History
            </h3>

            <div className="space-y-3.5 max-h-[45vh] overflow-y-auto pr-1 custom-scrollbar">
              {loginHistory.map((h, i) => (
                <div key={i} className="border-b border-outline-variant/5 pb-2.5 last:border-b-0">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-semibold text-white">{h.device}</span>
                    <span className={`text-[8px] font-bold font-label uppercase px-1.5 py-0.5 rounded ${
                      h.status === 'success' ? 'text-success bg-success/10' : 'text-error bg-error/10'
                    }`}>
                      {h.status}
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-[10px] text-on-surface-variant mt-1 font-label">
                    <span>{h.location} ({h.ip})</span>
                    <span>{new Date(h.timestamp).toLocaleDateString()} {new Date(h.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                </div>
              ))}
            </div>

            <button
              onClick={() => setActiveSubModal(null)}
              className="w-full mt-4 py-2 bg-surface-container hover:bg-surface-container-high text-white text-xs font-semibold rounded-xl transition-all"
            >
              Close
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
