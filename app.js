const apiKey = 'dd162da6731b92fd9e7f37d90bf87267';
const locationInput = document.getElementById('locationInput');
const searchBtn = document.getElementById('searchBtn');
const currentLocationBtn = document.getElementById('currentLocationBtn');
const weatherDataDiv = document.getElementById('weatherData');
const forecastDataDiv = document.getElementById('forecastData');
const recentCitiesSelect = document.getElementById('recentCities');

let recentCities = JSON.parse(localStorage.getItem('recentCities')) || [];

// Function to fetch weather data from API
async function fetchWeatherData(location) {
  try {
    const response = await fetch(
      `https://api.openweathermap.org/data/2.5/weather?q=${location}&appid=${apiKey}&units=metric`
    );
    const data = await response.json();

    if (response.ok) {
      displayWeatherData(data);
      fetchForecastData(data.coord.lat, data.coord.lon);
    } else {
      displayError(data.message);
    }
  } catch (error) {
    displayError('An error occurred while fetching weather data.');
  }
}

// Function to fetch forecast data from API
async function fetchForecastData(latitude, longitude) {
  try {
    const response = await fetch(
      `https://api.openweathermap.org/data/2.5/forecast?lat=${latitude}&lon=${longitude}&appid=${apiKey}&units=metric`
    );
    const data = await response.json();

    if (response.ok) {
      displayForecastData(data.list);
    } else {
      displayError(data.message);
    }
  } catch (error) {
    displayError('An error occurred while fetching forecast data.');
  }
}

// Function to display current weather data
function displayWeatherData(data) {
  const { name, weather, main, wind } = data;
  const iconCode = weather[0].icon;
  const iconUrl = `https://openweathermap.org/img/w/${iconCode}.png`;
  weatherDataDiv.innerHTML = `
    <h2 class="text-2xl font-bold mb-2">${name}</h2>
    <div class="flex items-center mb-4">
      <img src="${iconUrl}" alt="${weather[0].description}" class="w-12 h-12 mr-2">
      <span class="text-lg font-semibold">${weather[0].description}</span>
    </div>
    <p class="mb-2">Temperature: ${main.temp} &deg;C</p>
    <p class="mb-2">Humidity: ${main.humidity}%</p>
    <p class="mb-2">Wind Speed: ${wind.speed} m/s</p>
  `;

  addRecentCity(name);
}

// Function to display forecast data
function displayForecastData(forecastList) {
  const forecastHTML = forecastList
    .filter((_, index) => index % 8 === 0)
    .map(forecast => {
      const { dt_txt, weather, main, wind } = forecast;
      const iconCode = weather[0].icon;
      const iconUrl = `https://openweathermap.org/img/w/${iconCode}.png`;
      const date = new Date(dt_txt);
      const formattedDate = `${date.getDate()}/${
        date.getMonth() + 1
      }/${date.getFullYear()}`;

      return `
      <div class="flex items-center mb-4">
        <div class="w-1/4">
          <p class="text-center">${formattedDate}</p>
        </div>
        <div class="w-1/4">
          <img src="${iconUrl}" alt="${weather[0].description}" class="mx-auto w-8 h-8">
        </div>
        <div class="w-1/4">
          <p class="text-center">${main.temp} &deg;C</p>
        </div>
        <div class="w-1/4">
          <p class="text-center">${wind.speed} m/s</p>
        </div>
        <div class="w-1/4">
          <p class="text-center">${main.humidity}%</p>
        </div>
      </div>
    `;
    });

  forecastDataDiv.innerHTML = `
    <h2 class="text-2xl font-bold mb-4">5-Day Forecast</h2>
    ${forecastHTML.join('')}
  `;
}

// Function to display error message
function displayError(message) {
  weatherDataDiv.innerHTML = `
    <p class="text-red-500 font-semibold">${message}</p>
  `;
  forecastDataDiv.innerHTML = '';
}

// Function to get current location
function getCurrentLocation() {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      position => {
        const { latitude, longitude } = position.coords;
        fetchWeatherData(`${latitude},${longitude}`);
      },
      error => {
        displayError(
          'Unable to retrieve your location. Please enter a city name.'
        );
      }
    );
  } else {
    displayError('Geolocation is not supported by your browser.');
  }
}

// Function to add recent city to dropdown
function addRecentCity(city) {
  if (!recentCities.includes(city)) {
    recentCities.push(city);
    localStorage.setItem('recentCities', JSON.stringify(recentCities));
    updateRecentCitiesDropdown();
  }
}

// Function to update recent cities dropdown
function updateRecentCitiesDropdown() {
  recentCitiesSelect.innerHTML = `
    <option value="">Recently Searched Cities</option>
    ${recentCities
      .map(city => `<option value="${city}">${city}</option>`)
      .join('')}
  `;
}

// Event listener for search button
searchBtn.addEventListener('click', () => {
  const location = locationInput.value.trim();
  if (location) {
    fetchWeatherData(location);
  } else {
    displayError('Please enter a city name.');
  }
});

// Event listener for current location button
currentLocationBtn.addEventListener('click', getCurrentLocation);

// Event listener for recent cities dropdown
recentCitiesSelect.addEventListener('change', event => {
  const selectedCity = event.target.value;
  if (selectedCity) {
    fetchWeatherData(selectedCity);
  }
});

// Update recent cities dropdown on page load
updateRecentCitiesDropdown();
