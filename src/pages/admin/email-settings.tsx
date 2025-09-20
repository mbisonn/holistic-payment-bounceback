import React, { useEffect, useState } from 'react';

const EmailSettingsPage: React.FC = () => {
  const [settings, setSettings] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    fetch('/functions/v1/email-settings')
      .then(res => res.json())
      .then(data => {
        setSettings(data);
        setLoading(false);
      })
      .catch(() => {
        setError('Failed to load settings');
        setLoading(false);
      });
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSettings({ ...settings, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSuccess(null);
    try {
      const res = await fetch('/functions/v1/email-settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
      });
      if (!res.ok) throw new Error('Failed to save');
      setSuccess('Settings saved!');
    } catch {
      setError('Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="p-8">Loading...</div>;
  if (error) return <div className="p-8 text-red-500">{error}</div>;

  return (
    <div className="max-w-xl mx-auto p-8">
      <h1 className="text-lg md:text-2xl font-bold mb-6">Email Settings</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="senderName" className="block font-medium mb-1">Sender Name</label>
          <input
            type="text"
            name="senderName"
            id="senderName"
            autoComplete="name"
            value={settings?.senderName || ''}
            onChange={handleChange}
            className="w-full border rounded px-3 py-2"
          />
        </div>
        <div>
          <label htmlFor="senderEmail" className="block font-medium mb-1">Sender Email</label>
          <input
            type="email"
            name="senderEmail"
            id="senderEmail"
            autoComplete="email"
            value={settings?.senderEmail || ''}
            onChange={handleChange}
            className="w-full border rounded px-3 py-2"
          />
        </div>
        <div>
          <label htmlFor="smtpHost" className="block font-medium mb-1">SMTP Host</label>
          <input
            type="text"
            name="smtpHost"
            id="smtpHost"
            autoComplete="off"
            value={settings?.smtpHost || ''}
            onChange={handleChange}
            className="w-full border rounded px-3 py-2"
          />
        </div>
        <div>
          <label htmlFor="smtpPort" className="block font-medium mb-1">SMTP Port</label>
          <input
            type="number"
            name="smtpPort"
            id="smtpPort"
            autoComplete="off"
            value={settings?.smtpPort || ''}
            onChange={handleChange}
            className="w-full border rounded px-3 py-2"
          />
        </div>
        <div>
          <label htmlFor="smtpUser" className="block font-medium mb-1">SMTP Username</label>
          <input
            type="text"
            name="smtpUser"
            id="smtpUser"
            autoComplete="username"
            value={settings?.smtpUser || ''}
            onChange={handleChange}
            className="w-full border rounded px-3 py-2"
          />
        </div>
        <div>
          <label htmlFor="smtpPass" className="block font-medium mb-1">SMTP Password</label>
          <input
            type="password"
            name="smtpPass"
            id="smtpPass"
            autoComplete="current-password"
            value={settings?.smtpPass || ''}
            onChange={handleChange}
            className="w-full border rounded px-3 py-2"
          />
        </div>
        <button
          type="submit"
          className="bg-green-600 text-white px-4 py-2 rounded disabled:opacity-50"
          disabled={saving}
        >
          {saving ? 'Saving...' : 'Save Settings'}
        </button>
        {success && <div className="text-green-600 mt-2">{success}</div>}
        {error && <div className="text-red-600 mt-2">{error}</div>}
      </form>
    </div>
  );
};

export default EmailSettingsPage;