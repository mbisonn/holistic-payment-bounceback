import { useEffect, useState } from 'react';

function aggregateByCampaign(events: any[]) {
  const campaigns: Record<string, any> = {};
  for (const ev of events) {
    const cid = ev.campaign_id || 'Uncategorized';
    if (!campaigns[cid]) {
      campaigns[cid] = {
        campaign_id: cid,
        sent: 0,
        opens: 0,
        clicks: 0,
        recipients: new Set(),
        events: [],
      };
    }
    campaigns[cid].recipients.add(ev.recipient);
    if (ev.event_type === 'open') campaigns[cid].opens++;
    if (ev.event_type === 'click') campaigns[cid].clicks++;
    campaigns[cid].sent++;
    campaigns[cid].events.push(ev);
  }
  Object.values(campaigns).forEach((c: any) => (c.unique_recipients = c.recipients.size));
  return Object.values(campaigns);
}

function aggregateByRecipient(events: any[]) {
  const recipients: Record<string, any> = {};
  for (const ev of events) {
    const r = ev.recipient || 'Unknown';
    if (!recipients[r]) {
      recipients[r] = { recipient: r, opens: 0, clicks: 0, events: 0, eventLog: [] };
    }
    if (ev.event_type === 'open') recipients[r].opens++;
    if (ev.event_type === 'click') recipients[r].clicks++;
    recipients[r].events++;
    recipients[r].eventLog.push(ev);
  }
  return Object.values(recipients);
}

function aggregateByDay(events: any[]) {
  const days: Record<string, { date: string; opens: number; clicks: number }> = {};
  for (const ev of events) {
    const d = new Date(ev.timestamp).toISOString().slice(0, 10);
    if (!days[d]) days[d] = { date: d, opens: 0, clicks: 0 };
    if (ev.event_type === 'open') days[d].opens++;
    if (ev.event_type === 'click') days[d].clicks++;
  }
  return Object.values(days).sort((a, b) => a.date.localeCompare(b.date));
}

function downloadCSV(events: any[]) {
  const header = ['Type', 'Recipient', 'Campaign', 'URL', 'Time'];
  const rows = events.map(ev => [ev.event_type, ev.recipient, ev.campaign_id, ev.url || '', new Date(ev.timestamp).toLocaleString()]);
  const csv = [header, ...rows].map(r => r.map(x => '"' + (x || '') + '"').join(',')).join('\n');
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'email-events.csv';
  a.click();
  URL.revokeObjectURL(url);
}

function filterByDate(events: any[], start: string, end: string) {
  if (!start && !end) return events;
  return events.filter(ev => {
    const t = new Date(ev.timestamp).getTime();
    return (!start || t >= new Date(start).getTime()) && (!end || t <= new Date(end).getTime());
  });
}

const campaignColors = [
  '#6366f1', // Indigo
  '#f59e42', // Orange
  '#10b981', // Green
  '#ef4444', // Red
  '#3b82f6', // Blue
  '#a21caf', // Purple
  '#eab308', // Yellow
];

function exportComparisonCSV(selectedCampaignObjs: any[], allDates: string[], campaignDayStats: (c: any) => any[]) {
  // Header: Campaign, Sent, Unique Recipients, Opens, Clicks, Open Rate, Click Rate
  let csv = 'Campaign,Sent,Unique Recipients,Opens,Clicks,Open Rate,Click Rate\n';
  for (const c of selectedCampaignObjs) {
    csv += [
      c.campaign_id,
      c.sent,
      c.unique_recipients,
      c.opens,
      c.clicks,
      c.sent ? ((c.opens / c.sent) * 100).toFixed(1) + '%' : '-',
      c.sent ? ((c.clicks / c.sent) * 100).toFixed(1) + '%' : '-',
    ].join(',') + '\n';
  }
  // Time-based chart data
  csv += '\nDate';
  for (const c of selectedCampaignObjs) {
    csv += `,${c.campaign_id} Opens,${c.campaign_id} Clicks`;
  }
  csv += '\n';
  for (let i = 0; i < allDates.length; i++) {
    let row = [allDates[i]];
    for (let j = 0; j < selectedCampaignObjs.length; j++) {
      const stats = campaignDayStats(selectedCampaignObjs[j]);
      row.push(stats[i]?.opens ?? 0, stats[i]?.clicks ?? 0);
    }
    csv += row.join(',') + '\n';
  }
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'campaign-comparison.csv';
  a.click();
  URL.revokeObjectURL(url);
}

const EmailAnalyticsSection = () => {
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [dateStart, setDateStart] = useState('');
  const [dateEnd, setDateEnd] = useState('');
  const [campaignModal, setCampaignModal] = useState<any | null>(null);
  const [recipientModal, setRecipientModal] = useState<any | null>(null);
  const [selectedCampaigns, setSelectedCampaigns] = useState<string[]>([]);

  useEffect(() => {
    fetch('/api/email-tracking/stats')
      .then(res => res.json())
      .then(data => {
        setEvents(data.events || []);
        setLoading(false);
      });
  }, []);

  const filteredEvents = filterByDate(events, dateStart, dateEnd);
  const campaignStats = aggregateByCampaign(filteredEvents);
  const recipientStats = aggregateByRecipient(filteredEvents);
  const dayStats = aggregateByDay(filteredEvents);

  // Multi-campaign comparison
  const selectedCampaignObjs = campaignStats.filter(c => selectedCampaigns.includes(c.campaign_id));
  const allDates = Array.from(new Set(selectedCampaignObjs.flatMap(c => c.events.map((ev: any) => new Date(ev.timestamp).toISOString().slice(0, 10))))).sort();
  function campaignDayStats(campaign: any) {
    const days: Record<string, { date: string; opens: number; clicks: number }> = {};
    for (const ev of campaign.events) {
      const d = new Date(ev.timestamp).toISOString().slice(0, 10);
      if (!days[d]) days[d] = { date: d, opens: 0, clicks: 0 };
      if (ev.event_type === 'open') days[d].opens++;
      if (ev.event_type === 'click') days[d].clicks++;
    }
    return allDates.map(date => days[date] || { date, opens: 0, clicks: 0 });
  }

  // Drill-down: top links for campaign
  function topLinks(events: any[]) {
    const links: Record<string, number> = {};
    for (const ev of events) {
      if (ev.event_type === 'click' && ev.url) {
        links[ev.url] = (links[ev.url] || 0) + 1;
      }
    }
    return Object.entries(links).sort((a, b) => b[1] - a[1]);
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold mb-4">Email Analytics</h2>
      <div className="flex items-center gap-4 mb-4">
        <button onClick={() => downloadCSV(filteredEvents)} className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">Export CSV</button>
        <label className="ml-4 text-sm">Date Range:</label>
        <input type="date" value={dateStart} onChange={e => setDateStart(e.target.value)} className="border rounded px-2 py-1" />
        <span>-</span>
        <input type="date" value={dateEnd} onChange={e => setDateEnd(e.target.value)} className="border rounded px-2 py-1" />
        <button onClick={() => { setDateStart(''); setDateEnd(''); }} className="ml-2 px-2 py-1 text-xs bg-gray-100 rounded">Clear</button>
      </div>
      {/* Multi-campaign comparison UI */}
      <div className="mb-6">
        <h3 className="font-semibold mb-2">Compare Campaigns</h3>
        <div className="flex flex-wrap gap-4 mb-2">
          {campaignStats.map((c, i) => (
            <label key={c.campaign_id} className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={selectedCampaigns.includes(c.campaign_id)}
                onChange={e => {
                  setSelectedCampaigns(sel =>
                    e.target.checked
                      ? [...sel, c.campaign_id]
                      : sel.filter(id => id !== c.campaign_id)
                  );
                }}
              />
              <span className="px-2 py-1 rounded text-xs" style={{ background: campaignColors[i % campaignColors.length], color: '#fff' }}>{c.campaign_id}</span>
            </label>
          ))}
        </div>
        {selectedCampaigns.length > 1 && (
          <>
            <button
              onClick={() => exportComparisonCSV(selectedCampaignObjs, allDates, campaignDayStats)}
              className="mb-2 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
            >
              Export Comparison
            </button>
            <div className="overflow-x-auto mb-4">
              <table className="min-w-full bg-white border border-gray-200 rounded-lg">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-2 text-left">Campaign</th>
                    <th className="px-4 py-2 text-left">Sent</th>
                    <th className="px-4 py-2 text-left">Unique Recipients</th>
                    <th className="px-4 py-2 text-left">Opens</th>
                    <th className="px-4 py-2 text-left">Clicks</th>
                    <th className="px-4 py-2 text-left">Open Rate</th>
                    <th className="px-4 py-2 text-left">Click Rate</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedCampaignObjs.map((c, i) => (
                    <tr key={c.campaign_id}>
                      <td className="px-4 py-2 font-medium" style={{ color: campaignColors[i % campaignColors.length] }}>{c.campaign_id}</td>
                      <td className="px-4 py-2">{c.sent}</td>
                      <td className="px-4 py-2">{c.unique_recipients}</td>
                      <td className="px-4 py-2">{c.opens}</td>
                      <td className="px-4 py-2">{c.clicks}</td>
                      <td className="px-4 py-2">{c.sent ? ((c.opens / c.sent) * 100).toFixed(1) + '%' : '-'}</td>
                      <td className="px-4 py-2">{c.sent ? ((c.clicks / c.sent) * 100).toFixed(1) + '%' : '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {/* Overlaid time-based chart */}
            <div className="mb-8">
              <h4 className="font-semibold mb-2">Opens & Clicks Over Time (Comparison)</h4>
              <svg width="100%" height="140" viewBox="0 0 400 140">
                {/* X-axis labels */}
                {allDates.map((date, i) => (
                  <text key={date + 't'} x={20 + (i * 360) / (allDates.length - 1)} y={135} fontSize="10" textAnchor="middle">{date.slice(5)}</text>
                ))}
                {/* Y-axis labels */}
                <text x="0" y="120" fontSize="10">0</text>
                <text x="0" y="20" fontSize="10">max</text>
                {/* Lines for each campaign */}
                {selectedCampaignObjs.map((c, idx) => {
                  const stats = campaignDayStats(c);
                  const maxOpens = Math.max(...stats.map(x => x.opens || 1), 1);
                  const maxClicks = Math.max(...stats.map(x => x.clicks || 1), 1);
                  return (
                    <g key={c.campaign_id}>
                      {/* Opens line */}
                      <polyline
                        fill="none"
                        stroke={campaignColors[idx % campaignColors.length]}
                        strokeWidth="2"
                        points={stats.map((d, i) => `${20 + (i * 360) / (allDates.length - 1)},${120 - (d.opens * 90) / maxOpens}`).join(' ')}
                      />
                      {/* Clicks line (dashed) */}
                      <polyline
                        fill="none"
                        stroke={campaignColors[idx % campaignColors.length]}
                        strokeDasharray="4 2"
                        strokeWidth="2"
                        points={stats.map((d, i) => `${20 + (i * 360) / (allDates.length - 1)},${120 - (d.clicks * 90) / maxClicks}`).join(' ')}
                      />
                    </g>
                  );
                })}
                {/* Legend */}
                {selectedCampaignObjs.map((c, idx) => (
                  <g key={c.campaign_id + 'legend'}>
                    <rect x={20 + idx * 120} y={5} width={12} height={12} fill={campaignColors[idx % campaignColors.length]} />
                    <text x={36 + idx * 120} y={15} fontSize="11">{c.campaign_id} (solid: opens, dashed: clicks)</text>
                  </g>
                ))}
              </svg>
            </div>
          </>
        )}
      </div>
      {loading ? (
        <div>Loading...</div>
      ) : (
        <>
          {/* Time-based chart */}
          <div className="mb-8">
            <h3 className="font-semibold mb-2">Opens & Clicks Over Time</h3>
            <svg width="100%" height="120" viewBox="0 0 400 120">
              {dayStats.length > 1 && (
                <>
                  <polyline
                    fill="none"
                    stroke="#6366f1"
                    strokeWidth="2"
                    points={dayStats.map((d, i) => `${20 + (i * 360) / (dayStats.length - 1)},${100 - (d.opens * 80) / Math.max(...dayStats.map(x => x.opens || 1), 1)}`).join(' ')}
                  />
                  <polyline
                    fill="none"
                    stroke="#f59e42"
                    strokeWidth="2"
                    points={dayStats.map((d, i) => `${20 + (i * 360) / (dayStats.length - 1)},${100 - (d.clicks * 80) / Math.max(...dayStats.map(x => x.clicks || 1), 1)}`).join(' ')}
                  />
                  {dayStats.map((d, i) => (
                    <circle key={d.date + 'o'} cx={20 + (i * 360) / (dayStats.length - 1)} cy={100 - (d.opens * 80) / Math.max(...dayStats.map(x => x.opens || 1), 1)} r="3" fill="#6366f1" />
                  ))}
                  {dayStats.map((d, i) => (
                    <circle key={d.date + 'c'} cx={20 + (i * 360) / (dayStats.length - 1)} cy={100 - (d.clicks * 80) / Math.max(...dayStats.map(x => x.clicks || 1), 1)} r="3" fill="#f59e42" />
                  ))}
                  {dayStats.map((d, i) => (
                    <text key={d.date + 't'} x={20 + (i * 360) / (dayStats.length - 1)} y={115} fontSize="10" textAnchor="middle">{d.date.slice(5)}</text>
                  ))}
                </>
              )}
              <text x="0" y="100" fontSize="10">0</text>
              <text x="0" y="20" fontSize="10">max</text>
            </svg>
            <div className="flex gap-4 text-xs mt-1">
              <span className="inline-block w-3 h-3 rounded-full bg-indigo-500 mr-1" /> Opens
              <span className="inline-block w-3 h-3 rounded-full bg-orange-400 mr-1 ml-4" /> Clicks
            </div>
          </div>
          {/* Campaign summary */}
          <div className="overflow-x-auto mb-8">
            <h3 className="font-semibold mb-2">By Campaign</h3>
            <table className="min-w-full bg-white border border-gray-200 rounded-lg">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-2 text-left">Campaign</th>
                  <th className="px-4 py-2 text-left">Sent Events</th>
                  <th className="px-4 py-2 text-left">Unique Recipients</th>
                  <th className="px-4 py-2 text-left">Opens</th>
                  <th className="px-4 py-2 text-left">Clicks</th>
                  <th className="px-4 py-2 text-left">Open Rate</th>
                  <th className="px-4 py-2 text-left">Click Rate</th>
                </tr>
              </thead>
              <tbody>
                {campaignStats.map((c: any) => (
                  <tr key={c.campaign_id} className="border-t hover:bg-blue-50 cursor-pointer" onClick={() => setCampaignModal(c)}>
                    <td className="px-4 py-2 font-medium">{c.campaign_id}</td>
                    <td className="px-4 py-2">{c.sent}</td>
                    <td className="px-4 py-2">{c.unique_recipients}</td>
                    <td className="px-4 py-2">{c.opens}</td>
                    <td className="px-4 py-2">{c.clicks}</td>
                    <td className="px-4 py-2">{c.sent ? ((c.opens / c.sent) * 100).toFixed(1) + '%' : '-'}</td>
                    <td className="px-4 py-2">{c.sent ? ((c.clicks / c.sent) * 100).toFixed(1) + '%' : '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {/* Recipient summary */}
          <div className="overflow-x-auto mb-8">
            <h3 className="font-semibold mb-2">By Recipient</h3>
            <table className="min-w-full bg-white border border-gray-200 rounded-lg">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-2 text-left">Recipient</th>
                  <th className="px-4 py-2 text-left">Events</th>
                  <th className="px-4 py-2 text-left">Opens</th>
                  <th className="px-4 py-2 text-left">Clicks</th>
                  <th className="px-4 py-2 text-left">Open Rate</th>
                  <th className="px-4 py-2 text-left">Click Rate</th>
                </tr>
              </thead>
              <tbody>
                {recipientStats.map((r: any) => (
                  <tr key={r.recipient} className="border-t hover:bg-blue-50 cursor-pointer" onClick={() => setRecipientModal(r)}>
                    <td className="px-4 py-2 font-medium">{r.recipient}</td>
                    <td className="px-4 py-2">{r.events}</td>
                    <td className="px-4 py-2">{r.opens}</td>
                    <td className="px-4 py-2">{r.clicks}</td>
                    <td className="px-4 py-2">{r.events ? ((r.opens / r.events) * 100).toFixed(1) + '%' : '-'}</td>
                    <td className="px-4 py-2">{r.events ? ((r.clicks / r.events) * 100).toFixed(1) + '%' : '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {/* Event log */}
          <div className="overflow-x-auto">
            <h3 className="font-semibold mb-2">Event Log</h3>
            <table className="min-w-full bg-white border border-gray-200 rounded-lg">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-2 text-left">Type</th>
                  <th className="px-4 py-2 text-left">Recipient</th>
                  <th className="px-4 py-2 text-left">Campaign</th>
                  <th className="px-4 py-2 text-left">URL</th>
                  <th className="px-4 py-2 text-left">Time</th>
                </tr>
              </thead>
              <tbody>
                {filteredEvents.map(ev => (
                  <tr key={ev.id} className="border-t">
                    <td className="px-4 py-2">{ev.event_type}</td>
                    <td className="px-4 py-2">{ev.recipient}</td>
                    <td className="px-4 py-2">{ev.campaign_id}</td>
                    <td className="px-4 py-2">{ev.url ? <a href={ev.url} target="_blank" rel="noopener noreferrer">{ev.url}</a> : '-'}</td>
                    <td className="px-4 py-2">{new Date(ev.timestamp).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {/* Campaign drill-down modal */}
          {campaignModal && (
            <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
              <div className="bg-white rounded-lg shadow-lg p-6 max-w-2xl w-full relative">
                <button className="absolute top-2 right-2 text-gray-400 hover:text-gray-700" onClick={() => setCampaignModal(null)}>&times;</button>
                <h3 className="text-xl font-bold mb-4">Campaign: {campaignModal.campaign_id}</h3>
                <div className="mb-4">
                  <b>Top Links:</b>
                  <ul className="list-disc ml-6 mt-2">
                    {topLinks(campaignModal.events).length === 0 && <li>No clicks yet.</li>}
                    {topLinks(campaignModal.events).map(([url, count]) => (
                      <li key={url}><a href={url} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">{url}</a> ({count} clicks)</li>
                    ))}
                  </ul>
                </div>
                <div className="mb-2 font-semibold">Event Timeline:</div>
                <div className="max-h-48 overflow-y-auto border rounded">
                  <table className="min-w-full text-xs">
                    <thead><tr><th className="px-2 py-1">Type</th><th className="px-2 py-1">Recipient</th><th className="px-2 py-1">URL</th><th className="px-2 py-1">Time</th></tr></thead>
                    <tbody>
                      {campaignModal.events.map((ev: any) => (
                        <tr key={ev.id}>
                          <td className="px-2 py-1">{ev.event_type}</td>
                          <td className="px-2 py-1">{ev.recipient}</td>
                          <td className="px-2 py-1">{ev.url ? <a href={ev.url} target="_blank" rel="noopener noreferrer">{ev.url}</a> : '-'}</td>
                          <td className="px-2 py-1">{new Date(ev.timestamp).toLocaleString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
          {/* Recipient drill-down modal */}
          {recipientModal && (
            <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
              <div className="bg-white rounded-lg shadow-lg p-6 max-w-2xl w-full relative">
                <button className="absolute top-2 right-2 text-gray-400 hover:text-gray-700" onClick={() => setRecipientModal(null)}>&times;</button>
                <h3 className="text-xl font-bold mb-4">Recipient: {recipientModal.recipient}</h3>
                <div className="mb-2 font-semibold">Engagement History:</div>
                <div className="max-h-48 overflow-y-auto border rounded">
                  <table className="min-w-full text-xs">
                    <thead><tr><th className="px-2 py-1">Type</th><th className="px-2 py-1">Campaign</th><th className="px-2 py-1">URL</th><th className="px-2 py-1">Time</th></tr></thead>
                    <tbody>
                      {recipientModal.eventLog.map((ev: any) => (
                        <tr key={ev.id}>
                          <td className="px-2 py-1">{ev.event_type}</td>
                          <td className="px-2 py-1">{ev.campaign_id}</td>
                          <td className="px-2 py-1">{ev.url ? <a href={ev.url} target="_blank" rel="noopener noreferrer">{ev.url}</a> : '-'}</td>
                          <td className="px-2 py-1">{new Date(ev.timestamp).toLocaleString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </>
      )}
      <div className="text-gray-500 text-sm mt-4">
        <p>Open/click events are now tracked in real time. You can aggregate by campaign, recipient, or time period for advanced analytics.</p>
      </div>
    </div>
  );
};

export default EmailAnalyticsSection; 