import React, { useEffect, useState } from 'react';

import { useAuth } from './authContext';
import { listSessions, revokeSession } from './authService';

export const Sessions: React.FC<{ userId?: string; onClose?: () => void }> = ({ userId, onClose }) => {
  const { user } = useAuth();
  const [sessions, setSessions] = useState<any[]>([]);
  const uid = userId || user?.userId;

  useEffect(() => {
    if (!uid) return;
    (async () => {
      const res = await listSessions(uid);
      setSessions(res.sessions || res.sessions);
    })();
  }, [uid]);

  const handleRevoke = async (jti: string) => {
    if (!uid) return;
    await revokeSession(uid, jti);
    setSessions((s) => s.filter((x) => x.jti !== jti));
  };

  if (!uid) return <div>Please sign in to manage sessions</div>;

  return (
    <div style={{ background: 'white', padding: 12, borderRadius: 8, width: 480 }}>
      <h3>Active sessions</h3>
      {sessions.length === 0 && <div>No active sessions</div>}
      <ul>
        {sessions.map((s) => (
          <li key={s.jti} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8 }}>
            <div>
              <div style={{ fontSize: 12 }}><strong>{s.deviceName || s.userAgent || 'Unknown device'}</strong></div>
              <div style={{ fontSize: 11, color: '#666' }}>{s.createdAt ? new Date(s.createdAt).toLocaleString() : ''} {s.ip ? ` • ${s.ip}` : ''}</div>
            </div>
            <div>
              <button onClick={() => handleRevoke(s.jti)}>Revoke</button>
            </div>
          </li>
        ))}
      </ul>
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 8 }}>
        <button onClick={onClose}>Close</button>
      </div>
    </div>
  );
};
