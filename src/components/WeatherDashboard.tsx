import React from 'react';

interface Props {
  weather: {
    temperature: number;
    precipitation: number;
    humidity?: number;
    time: string;
  } | null;
  onOpenSettings: () => void;
}

/**
 * Displays current weather conditions in a card with a floating action button
 * to open settings. The design follows a dark, minimalist style with large
 * typography and accent colours.
 */
const WeatherDashboard: React.FC<Props> = ({ weather, onOpenSettings }) => {
  return (
    <div
      style={{
        padding: 16,
        backgroundColor: '#2A2A3D',
        margin: 16,
        borderRadius: 16,
        position: 'relative',
        boxShadow: '0 8px 20px rgba(0,0,0,0.1)',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 style={{ margin: 0, fontSize: 24, color: '#FFFFFF' }}>Praha, ČR</h2>
          <div style={{ fontSize: 12, color: '#777799' }}>
            {weather ? new Date(weather.time).toLocaleString('cs-CZ', { dateStyle: 'short', timeStyle: 'short' }) : '-'}
          </div>
        </div>
        <div>
          {/* Simple weather icon placeholder */}
          <span role="img" aria-label="weather" style={{ fontSize: 64 }}>
            ☁️
          </span>
        </div>
      </div>
      <div style={{ marginTop: 16 }}>
        <div style={{ fontSize: 64, color: '#FFFFFF' }}>
          {weather ? `${Math.round(weather.temperature)}°C` : '--'}
        </div>
        <div style={{ fontSize: 16, color: '#BBBBCC' }}>
          {weather ? `Srážky: ${weather.precipitation.toFixed(1)} mm` : ''}
          {weather && weather.humidity !== undefined ? ` · Vlhkost: ${weather.humidity}%` : ''}
        </div>
      </div>
      {/* Floating action button for adding location / open settings */}
      <button
        onClick={onOpenSettings}
        style={{
          position: 'absolute',
          bottom: -24,
          left: '50%',
          transform: 'translateX(-50%)',
          width: 48,
          height: 48,
          borderRadius: '50%',
          border: 'none',
          backgroundColor: '#3FC1FF',
          color: '#1E1E2A',
          fontSize: 32,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          boxShadow: '0 4px 10px rgba(0,0,0,0.3)',
          cursor: 'pointer',
        }}
        aria-label="Nastavení"
      >
        +
      </button>
    </div>
  );
};

export default WeatherDashboard;