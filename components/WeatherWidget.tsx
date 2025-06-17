'use client'

import { useState, useEffect } from 'react'

interface WeatherData {
  temp: number
  condition: string
  icon: string
  location: string
}

interface WeatherWidgetProps {
  onWeatherUpdate: (weather: WeatherData | null) => void
}

// Weather emoji mapping
const weatherEmojis: { [key: string]: string } = {
  'clear': '☀️',
  'clouds': '☁️',
  'rain': '🌧️',
  'drizzle': '🌦️',
  'thunderstorm': '⛈️',
  'snow': '❄️',
  'mist': '🌫️',
  'fog': '🌫️',
  'haze': '🌫️',
}

export default function WeatherWidget({ onWeatherUpdate }: WeatherWidgetProps) {
  const [weather, setWeather] = useState<WeatherData | null>(null)
  const [loading, setLoading] = useState(false)
  const [enabled, setEnabled] = useState(false)

  const fetchWeather = async () => {
    setLoading(true)
    try {
      // Get user location
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject)
      })

      const { latitude, longitude } = position.coords

      // Use OpenWeatherMap API (free tier)
      // You'll need to get an API key from https://openweathermap.org/api
      const API_KEY = process.env.NEXT_PUBLIC_OPENWEATHER_API_KEY || 'demo'
      const response = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&appid=${API_KEY}&units=metric`
      )

      if (!response.ok) {
        // Fallback to Toronto weather if API fails
        const mockWeather: WeatherData = {
          temp: 18,
          condition: 'clear',
          icon: '☀️',
          location: 'Toronto'
        }
        setWeather(mockWeather)
        onWeatherUpdate(mockWeather)
        return
      }

      const data = await response.json()
      
      const weatherData: WeatherData = {
        temp: Math.round(data.main.temp),
        condition: data.weather[0].main.toLowerCase(),
        icon: weatherEmojis[data.weather[0].main.toLowerCase()] || '🌤️',
        location: data.name
      }

      setWeather(weatherData)
      onWeatherUpdate(weatherData)
    } catch (error) {
      console.error('Weather fetch error:', error)
      // Use Toronto as fallback
      const mockWeather: WeatherData = {
        temp: 18,
        condition: 'clear',
        icon: '☀️',
        location: 'Toronto'
      }
      setWeather(mockWeather)
      onWeatherUpdate(mockWeather)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (enabled) {
      fetchWeather()
    } else {
      setWeather(null)
      onWeatherUpdate(null)
    }
  }, [enabled])

  return (
    <div className="mb-4">
      <div className="flex items-center justify-between mb-2">
        <label className="font-pixel text-pixel-sm text-kawaii-text font-bold">
          🌤️ Current Weather
        </label>
        <button
          type="button"
          onClick={() => setEnabled(!enabled)}
          className={`px-3 py-1 border-2 border-kawaii-border rounded font-pixel text-pixel-xs transition-colors pixel-ui ${
            enabled ? 'bg-kawaii-accent' : 'bg-kawaii-surface'
          }`}
          style={{ borderStyle: 'outset' }}
        >
          {enabled ? 'Disable' : 'Enable'}
        </button>
      </div>

      {enabled && (
        <div className="bg-kawaii-surface border-2 border-kawaii-border rounded-lg p-3 pixel-ui" style={{ borderStyle: 'inset' }}>
          {loading ? (
            <p className="font-pixel text-pixel-xs text-kawaii-text">Getting weather...</p>
          ) : weather ? (
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="text-2xl">{weather.icon}</span>
                <div>
                  <p className="font-pixel text-pixel-sm text-kawaii-text">
                    {weather.temp}°C - {weather.condition}
                  </p>
                  <p className="font-pixel text-pixel-xs text-kawaii-text/60">
                    📍 {weather.location}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={fetchWeather}
                className="px-2 py-1 bg-kawaii-background border border-kawaii-border rounded font-pixel text-pixel-xs hover:bg-kawaii-accent transition-colors pixel-ui"
                style={{ borderStyle: 'outset' }}
              >
                Refresh
              </button>
            </div>
          ) : (
            <p className="font-pixel text-pixel-xs text-kawaii-text/60">Weather disabled</p>
          )}
        </div>
      )}
    </div>
  )
}