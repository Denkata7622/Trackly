"use client";

import { useState } from "react";
import { Button } from "../components/ui/Button";
import { Card } from "../components/ui/Card";
import { Input } from "../components/ui/Input";
import { useUser } from "../context/UserContext";

export default function SettingsPage() {
  const {
    user,
    preferences,
    updateProfile,
    changePassword,
    setPreferences,
    deleteAccount,
    isAuthenticated,
  } = useUser();

  const [displayName, setDisplayName] = useState(user?.username ?? "");
  const [email, setEmail] = useState(user?.email ?? "");
  const [passwords, setPasswords] = useState({ current: "", next: "", confirm: "" });
  const [show, setShow] = useState({ current: false, next: false, confirm: false });
  const [confirmText, setConfirmText] = useState("");
  const [showDangerModal, setShowDangerModal] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);

  const canDelete = confirmText === (user?.username ?? "");

  async function handleSaveName() {
    setSaveError(null);
    try {
      if (isAuthenticated) {
        await updateProfile({ username: displayName });
      }
    } catch (e) {
      setSaveError((e as Error).message);
    }
  }

  async function handleSaveEmail() {
    setSaveError(null);
    try {
      if (isAuthenticated) {
        await updateProfile({ email });
      }
    } catch (e) {
      setSaveError((e as Error).message);
    }
  }

  async function handleChangePassword() {
    setPasswordError(null);
    if (passwords.next !== passwords.confirm) {
      setPasswordError("Passwords do not match");
      return;
    }
    if (passwords.next.length < 8) {
      setPasswordError("New password must be at least 8 characters");
      return;
    }
    try {
      await changePassword(passwords.current, passwords.next);
      setPasswords({ current: "", next: "", confirm: "" });
    } catch (e) {
      setPasswordError((e as Error).message);
    }
  }

  async function handleDeleteAccount() {
    try {
      await deleteAccount();
    } catch (e) {
      console.error(e);
    }
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
      <h1 className="text-3xl font-bold text-text-primary tracking-tight">Settings</h1>

      <Card className="p-6 space-y-4">
        <h2 className="text-xl font-semibold text-text-primary">Account</h2>
        {saveError && <p className="text-sm text-danger">{saveError}</p>}
        <div>
          <label className="text-sm font-medium text-text-primary mb-1 block">Display name</label>
          <div className="flex gap-2">
            <Input value={displayName} onChange={(e) => setDisplayName(e.target.value)} />
            <Button variant="primary" onClick={handleSaveName}>Save</Button>
          </div>
        </div>
        <div>
          <label className="text-sm font-medium text-text-primary mb-1 block">Email</label>
          <div className="flex gap-2">
            <Input value={email} onChange={(e) => setEmail(e.target.value)} />
            <Button variant="primary" onClick={handleSaveEmail}>Save</Button>
          </div>
        </div>
      </Card>

      <Card className="p-6 space-y-4">
        <h2 className="text-xl font-semibold text-text-primary">Security</h2>
        {!isAuthenticated && (
          <p className="text-sm text-text-muted">Sign in to change your password.</p>
        )}
        {passwordError && <p className="text-sm text-danger">{passwordError}</p>}
        {(["current", "next", "confirm"] as const).map((key) => (
          <div key={key}>
            <label className="text-sm font-medium text-text-primary mb-1 block capitalize">{key} password</label>
            <div className="flex gap-2">
              <Input
                type={show[key] ? "text" : "password"}
                value={passwords[key]}
                disabled={!isAuthenticated}
                onChange={(e) => setPasswords((p) => ({ ...p, [key]: e.target.value }))}
              />
              <Button variant="secondary" onClick={() => setShow((prev) => ({ ...prev, [key]: !prev[key] }))}>
                {show[key] ? "Hide" : "Show"}
              </Button>
            </div>
          </div>
        ))}
        {isAuthenticated && (
          <Button variant="primary" onClick={handleChangePassword}>Update Password</Button>
        )}
      </Card>

      <Card className="p-6 space-y-4">
        <h2 className="text-xl font-semibold text-text-primary">Appearance</h2>
        <Button
          variant="secondary"
          onClick={() => setPreferences({ theme: preferences.theme === "dark" ? "light" : "dark" })}
        >
          Theme: {preferences.theme}
        </Button>
      </Card>

      <Card className="p-6 space-y-4">
        <h2 className="text-xl font-semibold text-text-primary">Notifications</h2>
        <Button
          variant="secondary"
          onClick={() => setPreferences({ notifications: !preferences.notifications })}
        >
          {preferences.notifications ? "Disable" : "Enable"} notifications
        </Button>
      </Card>

      <Card className="p-6 space-y-4" style={{ borderColor: "var(--color-danger, #ef4444)" }}>
        <h2 className="text-xl font-semibold text-text-primary">Danger Zone</h2>
        <Button variant="danger" onClick={() => setShowDangerModal(true)}>Delete Account</Button>
      </Card>

      {showDangerModal && (
        <div className="fixed inset-0 bg-page backdrop-blur-sm z-40 flex items-center justify-center p-4">
          <div className="bg-surface rounded-2xl shadow-xl border border-border p-6 z-50 max-w-md w-full space-y-4">
            <h3 className="text-base font-semibold text-text-primary">
              Type your username to confirm
            </h3>
            <Input
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value)}
              placeholder={user?.username ?? "username"}
            />
            <div className="flex gap-2 justify-end">
              <Button variant="ghost" onClick={() => setShowDangerModal(false)}>Cancel</Button>
              <Button variant="danger" disabled={!canDelete} onClick={handleDeleteAccount}>
                Confirm delete
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}