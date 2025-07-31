import React, { useEffect, useState } from 'react';
import RuleEditor from './RuleEditor';
import { Rule } from '../utils/notificationRules';
import { useNotifications } from '../hooks/useNotifications';

interface Props {
  onClose: () => void;
}

const SettingsModal: React.FC<Props> = ({ onClose }) => {
  const [time, setTime] = useState('08:00');
  const [rules, setRules] = useState<Rule[]>([]);
  const { permission, enableNotifications, scheduleNotification } = useNotifications();

  useEffect(() => {
    // Load settings from localStorage if present
    const savedTime = localStorage.getItem('ww_alert_time');
    const savedRules = localStorage.getItem('ww_alert_rules');
    if (savedTime) setTime(savedTime);
    if (savedRules) setRules(JSON.parse(savedRules));
  }, []);

  async function handleSave() {
    // Persist to localStorage
    localStorage.setItem('ww_alert_time', time);
    localStorage.setItem('ww_alert_rules', JSON.stringify(rules));
    // Schedule notification via backend
    await scheduleNotification(time, rules);
    onClose();
  }

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        backgroundColor: 'rgba(0,0,0,0.5)',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 1000,
      }}
    >
      <div
        style={{
          backgroundColor: '#2A2A3D',
          borderRadius: 16,
          padding: 24,
          width: '90%',
          maxWidth: 400,
          color: '#FFFFFF',
        }}
      >
        <h2 style={{ marginTop: 0, marginBottom: 16 }}>Upozornění</h2>
        <label style={{ display: 'block', marginBottom: 8, fontSize: 14, color: '#BBBBCC' }}>
          Čas odeslání:
          <input
            type="time"
            value={time}
            onChange={(e) => setTime(e.target.value)}
            style={{
              marginTop: 4,
              width: '100%',
              padding: 8,
              borderRadius: 8,
              border: 'none',
              backgroundColor: '#1E1E2A',
              color: '#FFFFFF',
            }}
          />
        </label>
        <div style={{ marginTop: 16 }}>
          <h3 style={{ margin: '8px 0', fontSize: 18, color: '#FFFFFF' }}>Pravidla</h3>
          <RuleEditor rules={rules} onChange={setRules} />
        </div>
        {permission !== 'granted' && (
          <button
            onClick={() => enableNotifications()}
            style={{
              marginTop: 16,
              width: '100%',
              padding: '10px 0',
              borderRadius: 8,
              border: 'none',
              backgroundColor: '#3FC1FF',
              color: '#1E1E2A',
              fontSize: 16,
              cursor: 'pointer',
            }}
          >
            Povolit oznámení
          </button>
        )}
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 24, gap: 8 }}>
          <button
            onClick={onClose}
            style={{
              padding: '8px 16px',
              borderRadius: 8,
              border: 'none',
              backgroundColor: '#777799',
              color: '#1E1E2A',
              cursor: 'pointer',
            }}
          >
            Zrušit
          </button>
          <button
            onClick={handleSave}
            style={{
              padding: '8px 16px',
              borderRadius: 8,
              border: 'none',
              backgroundColor: '#3FC1FF',
              color: '#1E1E2A',
              cursor: 'pointer',
            }}
          >
            Uložit
          </button>
        </div>
      </div>
    </div>
  );
};

export default SettingsModal;