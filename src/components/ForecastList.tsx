import React from 'react';
import { HourlyForecastItem, DailyForecastItem } from '../hooks/useWeather';

interface Props {
  forecast: HourlyForecastItem[] | DailyForecastItem[];
  mode: 'hourly' | 'weekly';
}

/**
 * Renders a list of forecast items. In hourly mode the list scrolls
 * horizontally; in weekly mode it displays cards for each day.
 */
const ForecastList: React.FC<Props> = ({ forecast, mode }) => {
  if (mode === 'hourly') {
    const items = forecast as HourlyForecastItem[];
    return (
      <div
        style={{
          display: 'flex',
          overflowX: 'auto',
          padding: '0 16px',
        }}
      >
        {items.map((item, idx) => (
          <div
            key={idx}
            style={{
              minWidth: 80,
              marginRight: 12,
              backgroundColor: '#2A2A3D',
              borderRadius: 12,
              padding: 8,
              textAlign: 'center',
            }}
          >
            <div style={{ fontSize: 12, color: '#777799' }}>{new Date(item.time).toLocaleTimeString('cs-CZ', { hour: '2-digit', minute: '2-digit' })}</div>
            <div style={{ fontSize: 24, color: '#FFFFFF' }}>{Math.round(item.temperature)}°</div>
            <div style={{ fontSize: 12, color: '#BBBBCC' }}>{item.precipitation.toFixed(1)} mm</div>
          </div>
        ))}
      </div>
    );
  }
  // weekly/daily mode
  const days = forecast as DailyForecastItem[];
  return (
    <div style={{ padding: '0 16px' }}>
      {days.map((day, idx) => (
        <div
          key={idx}
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            backgroundColor: '#2A2A3D',
            borderRadius: 12,
            padding: 12,
            marginBottom: 8,
          }}
        >
          <div>
            <div style={{ fontSize: 14, color: '#BBBBCC' }}>{new Date(day.date).toLocaleDateString('cs-CZ', { weekday: 'short', day: 'numeric', month: 'numeric' })}</div>
            <div style={{ fontSize: 12, color: '#777799' }}>{day.precipitation.toFixed(1)} mm</div>
          </div>
          <div style={{ fontSize: 24, color: '#FFFFFF' }}>{Math.round(day.tempMin)}° / {Math.round(day.tempMax)}°</div>
        </div>
      ))}
    </div>
  );
};

export default ForecastList;