import { useEffect, useState } from 'react';

export interface HourlyForecastItem {
  time: string;
  temperature: number;
  precipitation: number;
  humidity?: number;
}

export interface DailyForecastItem {
  date: string;
  tempMin: number;
  tempMax: number;
  precipitation: number;
}

interface WeatherState {
  current: {
    temperature: number;
    precipitation: number;
    humidity?: number;
    time: string;
  } | null;
  hourly: HourlyForecastItem[];
  daily: DailyForecastItem[];
}

/**
 * Hook that fetches weather data from the Open‑Meteo API using ICON models.
 * It returns the current conditions, hourly forecast for the next 48h and
 * daily forecast for the next 7 days. All times are converted to local timezone.
 */
export function useWeather(latitude: number = 50.0755, longitude: number = 14.4378): WeatherState {
  const [state, setState] = useState<WeatherState>({
    current: null,
    hourly: [],
    daily: [],
  });

  useEffect(() => {
    async function fetchData() {
      try {
        // Fetch 48h hourly forecast from ICON-D2
        const hourlyUrl = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&hourly=temperature_2m,precipitation,relativehumidity_2m&forecast_model=icon_d2&forecast_hours=48&timezone=Europe/Prague`;
        const dailyUrl = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&daily=temperature_2m_max,temperature_2m_min,precipitation_sum&forecast_model=icon_eu&timezone=Europe/Prague`;
        const [hourlyRes, dailyRes] = await Promise.all([
          fetch(hourlyUrl),
          fetch(dailyUrl),
        ]);
        const hourlyData = await hourlyRes.json();
        const dailyData = await dailyRes.json();

        // Transform hourly data
        const hourly: HourlyForecastItem[] = [];
        const times: string[] = hourlyData.hourly.time;
        const temps: number[] = hourlyData.hourly.temperature_2m;
        const precs: number[] = hourlyData.hourly.precipitation;
        const hums: number[] | undefined = hourlyData.hourly.relativehumidity_2m;
        for (let i = 0; i < times.length; i++) {
          hourly.push({
            time: times[i],
            temperature: temps[i],
            precipitation: precs[i],
            humidity: hums ? hums[i] : undefined,
          });
        }
        // Get current conditions from first hourly point
        const current = hourly.length > 0 ? {
          temperature: hourly[0].temperature,
          precipitation: hourly[0].precipitation,
          humidity: hourly[0].humidity,
          time: hourly[0].time,
        } : null;
        // Transform daily data
        const daily: DailyForecastItem[] = [];
        const dates: string[] = dailyData.daily.time;
        const tempMax: number[] = dailyData.daily.temperature_2m_max;
        const tempMin: number[] = dailyData.daily.temperature_2m_min;
        const precipitation: number[] = dailyData.daily.precipitation_sum;
        for (let j = 0; j < dates.length; j++) {
          daily.push({
            date: dates[j],
            tempMax: tempMax[j],
            tempMin: tempMin[j],
            precipitation: precipitation[j],
          });
        }
        setState({ current, hourly, daily });
      } catch (err) {
        console.error('Failed to fetch weather data', err);
      }
    }
    fetchData();
  }, [latitude, longitude]);

  return state;
}