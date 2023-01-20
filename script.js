//Inputting API and HTML references
var weatherApiRootUrl = 'https://api.openweathermap.org';
var weatherApiKey = 'd91f911bcf2c0f925fb6535547a5ddc9';

var searchForm = document.querySelector('#search-form');
var searchInput = document.querySelector('#search-input');
var todaySlot = document.querySelector('#today');
var forecastSlot = document.querySelector('#forecast');
var searchHistorySlot = document.querySelector('#history');

// Timezone plugins to day.js
dayjs.extend(window.dayjs_plugin_utc);
dayjs.extend(window.dayjs_plugin_timezone);

var searchHistory = [];

// Display search history list.
function renderSearchHistory() {
  searchHistorySlot.innerHTML = '';

  // Start at end of history array and count down to show the most recent at the top.
  for (var i = searchHistory.length - 1; i >= 0; i--) {
    var btn = document.createElement('button');
    btn.classList.add('history-btn', 'btn-history');

    // `data-search` allows access to city name when click handler is invoked
    btn.setAttribute('data-search', searchHistory[i]);
    btn.textContent = searchHistory[i];
    searchHistorySlot.append(btn);
  }
}

// Function to update history in local storage then updates displayed history.
function appendToHistory(search) {
  // If there is no search term return the function
  if (searchHistory.indexOf(search) !== -1) {
    return;
  }
  searchHistory.push(search);
  localStorage.setItem('search-history', JSON.stringify(searchHistory));
  renderSearchHistory();
}

// Function to get search history from local storage
function initSearchHistory() {
  var storedHistory = localStorage.getItem('search-history');
  if (storedHistory) {
    searchHistory = JSON.parse(storedHistory);
  }
  renderSearchHistory();
}

// Function to display the current weather data fetched from OpenWeather api.
function renderCurrentWeather(city, weather) {
  var date = dayjs().format('M/D/YYYY');
  // Store response data from our fetch request in variables
  var tempF = weather.main.temp;
  var windMph = weather.wind.speed;
  var humidity = weather.main.humidity;
  var iconUrl = `https://openweathermap.org/img/w/${weather.weather[0].icon}.png`;
  var iconDesc = weather.weather[0].description || weather[0].main;

  var card = document.createElement('div');
  var body = document.createElement('div');
  var heading = document.createElement('h2');
  var weatherIcon = document.createElement('img');
  var tempEl = document.createElement('p');
  var windEl = document.createElement('p');
  var humidityEl = document.createElement('p');

  card.setAttribute('class', 'card');
  body.setAttribute('class', 'card-body');
  card.append(body);
  heading.setAttribute('class', 'h3 card-title');
  tempEl.setAttribute('class', 'card-text');
  windEl.setAttribute('class', 'card-text');
  humidityEl.setAttribute('class', 'card-text');
  heading.textContent = `${city} (${date})`;
  weatherIcon.setAttribute('src', iconUrl);
  weatherIcon.setAttribute('alt', iconDesc);
  weatherIcon.setAttribute('class', 'weather-img');
  heading.append(weatherIcon);
  tempEl.textContent = `Temp: ${tempF}°F`;
  windEl.textContent = `Wind: ${windMph} MPH`;
  humidityEl.textContent = `Humidity: ${humidity} %`;
  body.append(heading, tempEl, windEl, humidityEl);

  todaySlot.innerHTML = '';
  todaySlot.append(card);
}

// Function to display a forecast card 
function forecastCard(forecast) {
  // variables for data from api
  var iconUrl = `https://openweathermap.org/img/w/${forecast.weather[0].icon}.png`;
  var iconDesc = forecast.weather[0].description;
  var tempF = forecast.main.temp;
  var humidity = forecast.main.humidity;
  var windMph = forecast.wind.speed;

  // Elements for card
  var col = document.createElement('div');
  var card = document.createElement('div');
  var body = document.createElement('div');
  var title = document.createElement('h5');
  var weatherIcon = document.createElement('img');
  var tempEl = document.createElement('p');
  var windEl = document.createElement('p');
  var humidityEl = document.createElement('p');

  col.append(card);
  col.setAttribute('class', 'col-md');
  col.classList.add('five-day-card');

  card.append(body);
  card.setAttribute('class', 'card bg-primary h-100 text-white');

  body.append(title, weatherIcon, tempEl, windEl, humidityEl);
  body.setAttribute('class', 'card-body p-2');

  title.setAttribute('class', 'card-title');
  title.textContent = dayjs(forecast.dt_txt).format('M/D/YYYY');

  weatherIcon.setAttribute('src', iconUrl);
  weatherIcon.setAttribute('alt', iconDesc);

  tempEl.setAttribute('class', 'card-text');
  tempEl.textContent = `Temp: ${tempF} °F`;

  windEl.setAttribute('class', 'card-text');
  windEl.textContent = `Wind: ${windMph} MPH`;

  humidityEl.setAttribute('class', 'card-text');
  humidityEl.textContent = `Humidity: ${humidity} %`;

  forecastSlot.append(col);
}

// Displays 5 day forecast
function forecast(dailyForecast) {
  // Creates timestamps for start and end of 5 day forecast
  var startDt = dayjs().add(1, 'day').startOf('day').unix();
  var endDt = dayjs().add(6, 'day').startOf('day').unix();

  var headingCol = document.createElement('div');
  var heading = document.createElement('h4');

  headingCol.setAttribute('class', 'col-12');
  headingCol.append(heading);

  forecastSlot.innerHTML = '';
  forecastSlot.append(headingCol);

  for (var i = 0; i < dailyForecast.length; i++) {

    // First filters through all of the data and returns only data that falls between one day after the current data and up to 5 days later.
    if (dailyForecast[i].dt >= startDt && dailyForecast[i].dt < endDt) {

      // Then filters through the data and returns only data captured at noon for each day.
      if (dailyForecast[i].dt_txt.slice(11, 13) == "12") {
        forecastCard(dailyForecast[i]);
      }
    }
  }
}

function renderItems(city, data) {
  renderCurrentWeather(city, data.list[0], data.city.timezone);
  forecast(data.list);
}

// gets and displays weather from location
function getWeather(location) {
  var { lat } = location;
  var { lon } = location;
  var city = location.name;

  var apiUrl = `${weatherApiRootUrl}/data/2.5/forecast?lat=${lat}&lon=${lon}&units=imperial&appid=${weatherApiKey}`;

  fetch(apiUrl)
    .then(function (res) {
      return res.json();
    })
    .then(function (data) {
      renderItems(city, data);
    })
    .catch(function (err) {
      console.error(err);
    });
}

function findLocation(search) {
  var apiUrl = `${weatherApiRootUrl}/geo/1.0/direct?q=${search}&limit=5&appid=${weatherApiKey}`;

  fetch(apiUrl)
    .then(function (res) {
      return res.json();
    })
    .then(function (data) {
      if (!data[0]) {
        alert('Location not found...');
      } else {
        appendToHistory(search);
        getWeather(data[0]);
      }
    })
    .catch(function (err) {
      console.error(err);
    });
}

function searchFunction(e) {
  // If there is no value in search bar
  if (!searchInput.value) {
    return;
  }

  e.preventDefault();
  var search = searchInput.value.trim();
  findLocation(search);
  searchInput.value = '';
}

function historyClick(e) {
  var btn = e.target;
  var search = btn.getAttribute('data-search');
  findLocation(search);
}

initSearchHistory();
searchForm.addEventListener('submit', searchFunction);
searchHistorySlot.addEventListener('click', historyClick);