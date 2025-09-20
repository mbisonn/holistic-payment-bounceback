import { useEffect, useMemo, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn } from '@/lib/utils';

interface OutboxRow {
  id: string;
  to_email: string;
  to_name?: string | null;
  subject: string;
  status: 'queued' | 'sent' | 'failed';
  error_message?: string | null;
  attachment_path?: string | null;
  created_at?: string | null;
  sent_at?: string | null;
}

export default function EmailOutbox() {
  const [rows, setRows] = useState<OutboxRow[]>([]);
  const [status, setStatus] = useState<string>('all');
  const [q, setQ] = useState<string>('');
  const [loading, setLoading] = useState(false);

  const filtered = useMemo(() => {
    return rows.filter(r => {
      const statusOk = status === 'all' || r.status === status;
      const ql = q.trim().toLowerCase();
      const qOk = !ql || r.to_email.toLowerCase().includes(ql) || r.subject.toLowerCase().includes(ql);
      return statusOk && qOk;
    });
  }, [rows, status, q]);

  const load = async () => {
    try {
      setLoading(true);
      const { data, error } = await (supabase as any)
        .from('email_outbox')
        .select('id, to_email, to_name, subject, status, error_message, attachment_path, created_at, sent_at')
        .order('created_at', { ascending: false })
        .limit(200);
      if (error) throw error;
      setRows(((data || []) as unknown) as OutboxRow[]);
    } catch (e) {
      console.error('Failed to load outbox', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  return (
    <div className="p-4 space-y-4">
      <div className="flex flex-col sm:flex-row gap-2 items-stretch sm:items-center">
        <div className="font-semibold text-lg">Email Outbox</div>
        <div className="flex-1" />
        <Input
          placeholder="Search by email or subject"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          className="max-w-xs"
        />
        <Select value={status} onValueChange={setStatus}>
          <SelectTrigger className="w-[150px]"><SelectValue placeholder="Status" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            <SelectItem value="queued">Queued</SelectItem>
            <SelectItem value="sent">Sent</SelectItem>
            <SelectItem value="failed">Failed</SelectItem>
          </SelectContent>
        </Select>
        <Button variant="secondary" onClick={load} disabled={loading}>{loading ? 'Refreshing...' : 'Refresh'}</Button>
      </div>

      <div className="overflow-auto border rounded-md">
        <table className="min-w-full text-sm">
          <thead className="bg-muted/40">
            <tr>
              <th className="text-left p-2">Created</th>
              <th className="text-left p-2">To</th>
              <th className="text-left p-2">Subject</th>
              <th className="text-left p-2">Attachment</th>
              <th className="text-left p-2">Status</th>
              <th className="text-left p-2">Error</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(r => (
              <tr key={r.id} className="border-t">
                <td className="p-2 whitespace-nowrap">{r.created_at ? new Date(r.created_at).toLocaleString() : '-'}</td>
                <td className="p-2">
                  <div className="font-medium">{r.to_email}</div>
                  <div className="text-xs text-muted-foreground">{r.to_name || ''}</div>
                </td>
                <td className="p-2 max-w-[420px] truncate">{r.subject}</td>
                <td className="p-2 text-xs break-all">{r.attachment_path || '-'}</td>
                <td className="p-2">
                  <span className={cn('px-2 py-1 rounded text-xs',
                    r.status === 'queued' && 'bg-amber-100 text-amber-900',
                    r.status === 'sent' && 'bg-emerald-100 text-emerald-900',
                    r.status === 'failed' && 'bg-rose-100 text-rose-900')}>{r.status}</span>
                </td>
                <td className="p-2 text-xs max-w-[360px] truncate" title={r.error_message || ''}>{r.error_message || '-'}</td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr><td className="p-4 text-center text-muted-foreground" colSpan={6}>No outbox entries</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
