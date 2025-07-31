import React, { useState } from 'react';
import WeatherDashboard from './components/WeatherDashboard';
import ForecastList from './components/ForecastList';
import SettingsModal from './components/SettingsModal';
import { useWeather } from './hooks/useWeather';

/**
 * Main application component.
 * Handles high level UI, tab navigation and settings modal state.
 */
const App: React.FC = () => {
  const [tab, setTab] = useState<'hourly' | 'weekly'>('hourly');
  const [settingsOpen, setSettingsOpen] = useState(false);
  const weather = useWeather();

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <WeatherDashboard
        weather={weather.current}
        onOpenSettings={() => setSettingsOpen(true)}
      />
      <div style={{ flex: 1, overflow: 'auto' }}>
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 8 }}>
          <button
            onClick={() => setTab('hourly')}
            style={{
              background: 'none',
              border: 'none',
              color: tab === 'hourly' ? '#3FC1FF' : '#BBBBCC',
              fontSize: 16,
              padding: '8px 16px',
              borderBottom: tab === 'hourly' ? '3px solid #3FC1FF' : 'none',
            }}
          >
            Hodinová
          </button>
          <button
            onClick={() => setTab('weekly')}
            style={{
              background: 'none',
              border: 'none',
              color: tab === 'weekly' ? '#3FC1FF' : '#BBBBCC',
              fontSize: 16,
              padding: '8px 16px',
              borderBottom: tab === 'weekly' ? '3px solid #3FC1FF' : 'none',
            }}
          >
            Týdenní
          </button>
        </div>
        <ForecastList forecast={tab === 'hourly' ? weather.hourly : weather.daily} mode={tab} />
      </div>
      {settingsOpen && <SettingsModal onClose={() => setSettingsOpen(false)} />}
    </div>
  );
};

export default App;