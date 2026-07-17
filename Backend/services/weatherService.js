/**
 * Reusable Weather Fetching Utility Service
 * Communicates with OpenWeather Map Endpoints
 */
export const getLiveWeather = async (locationName) => {
  try {
    const apiKey = process.env.OPENWEATHER_API_KEY;
    
    if (!apiKey) {
      throw new Error("Missing OPENWEATHER_API_KEY environment variable.");
    }

    // Direct current weather query by location string name
    const url = `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(locationName)}&appid=${apiKey}&units=metric`;
    
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`Weather API responded with status code: ${response.status}`);
    }
    
    const data = await response.json();
    
    // Prune out extra metadata to feed a clean, light object to DeepSeek
    return {
      condition: data.weather[0].main,       // e.g., "Rain", "Clear", "Clouds"
      description: data.weather[0].description,
      temperature: `${Math.round(data.main.temp)}°C`,
      humidity: `${data.main.humidity}%`,
      windSpeed: `${data.wind.speed} m/s`,
      rawSuccess: true
    };
    
  } catch (error) {
    console.error(`🚨 Weather service failed for location [${locationName}]:`, error.message);
    
    // Safety Net Fallback so backend compilation doesn't drop the execution thread
    return {
      condition: "Unknown",
      description: "Unable to retrieve real-time data status",
      temperature: "25°C", 
      humidity: "50%",
      windSpeed: "0 m/s",
      rawSuccess: false
    };
  }
};