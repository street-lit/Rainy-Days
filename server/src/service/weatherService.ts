// TODO: Define an interface for the Coordinates object
interface Coordinates { 
  latitude: number;
  longitude: number;
}

// TODO: Define a class for the Weather object
class Weather {
  constructor(
    public temperature: number,
    public description: string,
    public icon: string
  ) {}
}

interface WeatherApiResponse {
  main: {
    temp: number;
  };
  weather: Array<{
    description: string;
    icon: string;
  }>;
}

interface LocationApiResponse {
  lat: number;
  lon: number;
  name: string;
}

// TODO: Complete the WeatherService class
class WeatherService {
  // TODO: Define the baseURL, API key, and city name properties
  private baseURL = 'https://api.openweathermap.org/';
  private apiKey = '42a818799edaf4fb33ab8e27bde181da';
  private units = 'metric'; // Add units parameter for Celsius
  // TODO: Create fetchLocationData method
  private async fetchLocationData(query: string): Promise<LocationApiResponse> {
    try {
      const response = await fetch(`${this.baseURL}/geo/1.0/direct?q=${query}&limit=1&appid=${this.apiKey}`);
      if (!response.ok) throw new Error(`Failed to fetch location: ${response.statusText}`);
      const data = await response.json();
      if (!data.length) throw new Error(`No location found for: ${query}`);
      return data[0];
    } catch (error: unknown) {
      if (error instanceof Error) {
        throw new Error(`Location fetch failed: ${error.message}`);
      }
      throw new Error('Location fetch failed: Unknown error');
    }
  }
  // TODO: Create destructureLocationData method
  private destructureLocationData(locationData: LocationApiResponse): Coordinates {
    return {
      latitude: locationData.lat,
      longitude: locationData.lon
    };
  }
  // TODO: Create buildWeatherQuery method
  private buildWeatherQuery(coordinates: Coordinates): string {
    return `${this.baseURL}/weather?lat=${coordinates.latitude}&lon=${coordinates.longitude}&appid=${this.apiKey}`;
  }
  // TODO: Create fetchAndDestructureLocationData method
  private async fetchAndDestructureLocationData(city: string) {
    const locationData = await this.fetchLocationData(city);
    return this.destructureLocationData(locationData);
  }
  // TODO: Build parseCurrentWeather method
  private parseCurrentWeather(response: any) {
    return new Weather(response.main.temp, response.weather[0].description, response.weather[0].icon);
  }
  // TODO: Complete buildForecastArray method
  private buildForecastArray(_currentWeather: Weather, weatherData: any[]) {
    return weatherData.map((day) => new Weather(day.main.temp, day.weather[0].description, day.weather[0].icon));
  }
  // TODO: Complete getWeatherForCity method
  static async getWeatherForCity(city: string) {
    const weatherService = new WeatherService();
    const coordinates = await weatherService.fetchAndDestructureLocationData(city);
    const currentWeather = await weatherService.fetchCurrentWeather(coordinates);
    const forecast = await weatherService.fetchForecast(coordinates);
    return { currentWeather, forecast };
  }

  private async fetchCurrentWeather(coordinates: Coordinates): Promise<Weather> {
    try {
      const response = await fetch(`${this.buildWeatherQuery(coordinates)}&units=${this.units}`);
      if (!response.ok) throw new Error(`Failed to fetch weather: ${response.statusText}`);
      const data: WeatherApiResponse = await response.json();
      return this.parseCurrentWeather(data);
    } catch (error: unknown) {
      if (error instanceof Error) {
        throw new Error(`Weather fetch failed: ${error.message}`);
      }
      throw new Error('Weather fetch failed: Unknown error');
    }
  }

  private async fetchForecast(coordinates: Coordinates) {
    try {
      const response = await fetch(
        `${this.baseURL}/forecast?lat=${coordinates.latitude}&lon=${coordinates.longitude}&appid=${this.apiKey}&units=${this.units}`
      );
      if (!response.ok) throw new Error(`Failed to fetch forecast: ${response.statusText}`);
      const data = await response.json();
      return this.buildForecastArray(await this.fetchCurrentWeather(coordinates), data.list);
    } catch (error: unknown) {
      if (error instanceof Error) {
        throw new Error(`Forecast fetch failed: ${error.message}`);
      }
      throw new Error('Forecast fetch failed: Unknown error');
    }
  }
}

export default WeatherService;
