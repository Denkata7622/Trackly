"use client";

import { useState } from "react";
import { Button } from "../components/ui/Button";
import { Card } from "../components/ui/Card";
import { Input } from "../components/ui/Input";
import { useUser } from "../context/UserContext";

export default function SettingsPage() {
  const { state, setProfile, setTheme, setNotifications, deleteAccount } = useUser();
  const [displayName, setDisplayName] = useState(state.profile.username);
  const [email, setEmail] = useState(state.profile.email);
  const [passwords, setPasswords] = useState({ current: "", next: "", confirm: "" });
  const [show, setShow] = useState({ current: false, next: false, confirm: false });
  const [confirmText, setConfirmText] = useState("");
  const [showDangerModal, setShowDangerModal] = useState(false);

  const canDelete = confirmText === state.profile.username;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
      <h1 className="text-3xl font-bold text-text-primary tracking-tight">Settings</h1>

      <Card className="p-6 space-y-4">
        <h2 className="text-xl font-semibold text-text-primary">Account</h2>
        <div>
          <label className="text-sm font-medium text-text-primary mb-1 block">Display name</label>
          <div className="flex gap-2">
            <Input value={displayName} onChange={(e) => setDisplayName(e.target.value)} />
            <Button variant="primary" onClick={() => setProfile({ username: displayName })}>Save</Button>
          </div>
        </div>
        <div>
          <label className="text-sm font-medium text-text-primary mb-1 block">Email</label>
          <div className="flex gap-2">
            <Input value={email} onChange={(e) => setEmail(e.target.value)} />
            <Button variant="primary" onClick={() => setProfile({ email })}>Save</Button>
          </div>
        </div>
      </Card>

      <Card className="p-6 space-y-4">
        <h2 className="text-xl font-semibold text-text-primary">Security</h2>
        {(["current", "next", "confirm"] as const).map((key) => (
          <div key={key}>
            <label className="text-sm font-medium text-text-primary mb-1 block">{key} password</label>
            <div className="flex gap-2">
              <Input type={show[key] ? "text" : "password"} value={passwords[key]} onChange={(e) => setPasswords((p) => ({ ...p, [key]: e.target.value }))} />
              <Button variant="secondary" onClick={() => setShow((prev) => ({ ...prev, [key]: !prev[key] }))}>{show[key] ? "Hide" : "Show"}</Button>
            </div>
          </div>
        ))}
      </Card>

      <Card className="p-6 space-y-4">
        <h2 className="text-xl font-semibold text-text-primary">Appearance</h2>
        <Button variant="secondary" onClick={() => setTheme(state.profile.preferences.theme === "dark" ? "light" : "dark")}>Theme: {state.profile.preferences.theme}</Button>
      </Card>

      <Card className="p-6 space-y-4">
        <h2 className="text-xl font-semibold text-text-primary">Notifications</h2>
        <Button variant="secondary" onClick={() => setNotifications(!state.profile.preferences.notifications)}>{state.profile.preferences.notifications ? "Disable" : "Enable"} notifications</Button>
      </Card>

      <Card className="p-6 space-y-4 border-red-300">
        <h2 className="text-xl font-semibold text-text-primary">Danger Zone</h2>
        <Button variant="danger" onClick={() => setShowDangerModal(true)}>Delete Account</Button>
      </Card>

      {showDangerModal && (
        <div className="fixed inset-0 bg-page backdrop-blur-sm z-40 transition-opacity duration-200 flex items-center justify-center p-4">
          <div className="bg-surface rounded-2xl shadow-xl border border-border p-6 z-50 max-w-md w-full space-y-4 transition-opacity duration-200">
            <h3 className="text-base font-semibold text-text-primary">Type your username to confirm</h3>
            <Input value={confirmText} onChange={(e) => setConfirmText(e.target.value)} placeholder={state.profile.username} />
            <div className="flex gap-2 justify-end">
              <Button variant="ghost" onClick={() => setShowDangerModal(false)}>Cancel</Button>
              <Button variant="danger" disabled={!canDelete} onClick={deleteAccount}>Confirm delete</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
