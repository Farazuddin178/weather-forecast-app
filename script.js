// Initialize the API key and base URL (replace 'YOUR_API_KEY' with your actual API key)
const apiKey = '43103dfffc95bb0f1c858daf4f62a36c';
const baseUrl = 'https://api.openweathermap.org/data/2.5/';

// Initialize recent searches in local storage
let recentCities = JSON.parse(localStorage.getItem('recentCities')) || [];

// Elements from the DOM
const cityInput = document.getElementById('city-input');
const searchBtn = document.getElementById('search-btn');
const errorMessage = document.getElementById('error-message');
const currentWeatherSection = document.getElementById('current-weather');
const recentSearchesDropdown = document.getElementById('recent-btn');
const dropdownMenu = document.getElementById('dropdown-menu');
const extendedForecastSection = document.getElementById('extended-forecast');

// Fetch weather data by city name
async function getWeatherData(city) {
  try {
    // Fetch current weather
    const weatherResponse = await fetch(`${baseUrl}weather?q=${city}&appid=${apiKey}&units=metric`);
    if (!weatherResponse.ok) throw new Error('City not found');

    const weatherData = await weatherResponse.json();

    // Fetch extended forecast
    const forecastResponse = await fetch(`${baseUrl}forecast?q=${city}&appid=${apiKey}&units=metric`);
    if (!forecastResponse.ok) throw new Error('Unable to fetch extended forecast');

    const forecastData = await forecastResponse.json();

    // Display data
    displayCurrentWeather(weatherData);
    displayExtendedForecast(forecastData);

    // Manage recent searches
    updateRecentSearches(city);
  } catch (error) {
    displayErrorMessage(error.message);
  }
}

// Display current weather data
function displayCurrentWeather(data) {
  currentWeatherSection.classList.remove('hidden');
  document.getElementById('weather-icon').src = `https://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png`;
  document.getElementById('weather-description').textContent = data.weather[0].description;
  document.getElementById('temperature').textContent = `${data.main.temp}°C`;
  document.getElementById('wind-speed').textContent = `Wind: ${data.wind.speed} m/s`;
  document.getElementById('humidity').textContent = `Humidity: ${data.main.humidity}%`;
}

// Display extended forecast (5-day)
function displayExtendedForecast(data) {
  extendedForecastSection.classList.remove('hidden');
  const forecastContainer = extendedForecastSection.querySelector('.grid');
  forecastContainer.innerHTML = '';  // Clear previous forecast data

  // Filter to get daily forecast at the same time (e.g., 12:00)
  const dailyForecasts = data.list.filter(item => item.dt_txt.includes('12:00:00'));

  dailyForecasts.forEach(day => {
    const date = new Date(day.dt_txt).toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' });
    const iconUrl = `https://openweathermap.org/img/wn/${day.weather[0].icon}@2x.png`;
    const temp = `${day.main.temp}°C`;
    const wind = `Wind: ${day.wind.speed} m/s`;
    const humidity = `Humidity: ${day.main.humidity}%`;

    const forecastCard = `
      <div class="bg-white p-4 rounded-lg shadow-md text-center">
        <p class="font-semibold">${date}</p>
        <img src="${iconUrl}" alt="${day.weather[0].description}" class="mx-auto">
        <p>${temp}</p>
        <p class="text-sm">${wind}</p>
        <p class="text-sm">${humidity}</p>
      </div>
    `;
    forecastContainer.innerHTML += forecastCard;
  });
}

// Manage recent searches dropdown
function updateRecentSearches(city) {
  if (!recentCities.includes(city)) {
    recentCities.unshift(city); // Add city to the start
    if (recentCities.length > 5) recentCities.pop(); // Keep only the latest 5 cities
    localStorage.setItem('recentCities', JSON.stringify(recentCities));
  }
  renderRecentSearches();
}

// Render recent searches dropdown
function renderRecentSearches() {
  if (recentCities.length > 0) {
    recentSearchesDropdown.classList.remove('hidden');
    dropdownMenu.innerHTML = recentCities.map(city => `<div class="p-2 cursor-pointer hover:bg-gray-200" onclick="getWeatherData('${city}')">${city}</div>`).join('');
  } else {
    recentSearchesDropdown.classList.add('hidden');
  }
}

// Display an error message
function displayErrorMessage(message) {
  errorMessage.textContent = message;
  errorMessage.classList.remove('hidden');

  // Hide error after a few seconds
  setTimeout(() => errorMessage.classList.add('hidden'), 5000);
}

// Validate user input
function validateInput() {
  const city = cityInput.value.trim();
  if (city === '') {
    displayErrorMessage('Please enter a city name');
    return false;
  }
  return true;
}

// Event listener for search button
searchBtn.addEventListener('click', () => {
  if (validateInput()) {
    const city = cityInput.value.trim();
    getWeatherData(city);
    cityInput.value = '';  // Clear input field
  }
});

// Event listener for recent searches dropdown
recentSearchesDropdown.addEventListener('click', () => {
  dropdownMenu.classList.toggle('hidden');  // Toggle visibility
});

// Initial load of recent searches
renderRecentSearches();
