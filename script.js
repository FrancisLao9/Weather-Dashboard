//Inputting API and HTML references
var weatherApiRootUrl = 'https://api.openweathermap.org';
var weatherApiKey = 'd91f911bcf2c0f925fb6535547a5ddc9';

var searchHistorySlot = document.querySelector('#history');
var todaySlot = document.querySelector('#today');
var forecastEl = document.querySelector('#forecast');
var searchForm = document.querySelector('#search');
var searchInput = document.querySelector('#search-input');

// Display search history list.
var searchHistory = [];
function renderHistory() {
  searchHistorySlot.innerHTML = '';

  // Start at end of history array and count down to show the most recent at the top.
  for (var i = searchHistory.length - 1; i >= 0; i--) {
    var button = document.createElement('button');
    button.classList.add('history-btn', 'btn-history');
    button.setAttribute('data-search', searchHistory[i]);
    button.textContent = searchHistory[i];
    searchHistorySlot.append(button);
  }
};

// Function to update history in local storage then updates displayed history.
function appendHistory(search) {
  if (searchHistory.indexOf(search) !== -1) {
    return;
  }
  searchHistory.push(search);
  localStorage.setItem('search-history', JSON.stringify(searchHistory));
  renderHistory();
}

// Function to get search history from local storage
function initSearch() {
  var storedHistory = localStorage.getItem('search-history');
  if (storedHistory) {
    searchHistory = JSON.parse(storedHistory);
  }
  renderHistory();
}

function renderCurrentWeather(city, weather) {
  var date = dayjs().format('M/D/YYYY');
  var temp = weather.main.temp;
  var wind = weather.wind.speed;
  var humidity = weather.main.humidity;
  var icon = `https://openweathermap.org/img/w/${weather.weather[0].icon}.png`;
  var abtIcon = weather.weather[0].description || weather[0].main;

  var card = document.createElement('div');
  var cBody = document.createElement('div');
  var heading = document.createElement('h2');
  var weatherIcon = document.createElement('img');
  var tempEl = document.createElement('p');
  var windEl = document.createElement('p');
  var humidityEl = document.createElement('p');

  card.setAttribute('class', 'card');
  cBody.setAttribute('class', 'card-body');
  card.append(cBody);
  heading.setAttribute('class', 'h3 card-title');
  tempEl.setAttribute('class', 'card-text');
  windEl.setAttribute('class', 'card-text');
  humidityEl.setAttribute('class', 'card-text');
  heading.textContent = `${city} (${date})`;
  weatherIcon.setAttribute('src', icon);
  weatherIcon.setAttribute('alt', abtIcon);
  weatherIcon.setAttribute('class', 'weather-img');
  heading.append(weatherIcon);
  tempEl.textContent = `Temp: ${temp}°F`;
  windEl.textContent = `Wind: ${wind} MPH`;
  humidityEl.textContent = `Humidity: ${humidity} %`;
  cBody.append(heading, tempEl, windEl, humidityEl);

  todaySlot.innerHTML = '';
  todaySlot.append(card);
}

// Function to display a forecast card 
function forecastCard(forecast) {
  var icon = `https://openweathermap.org/img/w/${forecast.weather[0].icon}.png`;
  var abtIcon = forecast.weather[0].description;
  var temp = forecast.main.temp;
  var humidity = forecast.main.humidity;
  var wind = forecast.wind.speed;

  var col = document.createElement('div');
  var card = document.createElement('div');
  var cBody = document.createElement('div');
  var cTitle = document.createElement('h5');
  var weatherIcon = document.createElement('img');
  var tempEl = document.createElement('p');
  var windEl = document.createElement('p');
  var humidityEl = document.createElement('p');

  col.append(card);
  card.append(cBody);
  cBody.append(cTitle, weatherIcon, tempEl, windEl, humidityEl);

  col.setAttribute('class', 'col-md');
  col.classList.add('five-day-card');
  card.setAttribute('class', 'card bg-primary h-100 text-white');
  cBody.setAttribute('class', 'card-body p-2');
  cTitle.setAttribute('class', 'card-title');
  cTitle.textContent = dayjs(forecast.dt_txt).format('M/D/YYYY');

  weatherIcon.setAttribute('src', icon);
  weatherIcon.setAttribute('alt', abtIcon);

  tempEl.setAttribute('class', 'card-text');
  tempEl.textContent = `Temp: ${temp} °F`;

  windEl.setAttribute('class', 'card-text');
  windEl.textContent = `Wind: ${wind} MPH`;

  humidityEl.setAttribute('class', 'card-text');
  humidityEl.textContent = `Humidity: ${humidity} %`;

  forecastEl.append(col);
};

// Displays 5 day forecast
function forecast(dailyForecast) {
  var startDate = dayjs().add(1, 'day').startOf('day').unix();
  var endDate = dayjs().add(6, 'day').startOf('day').unix();

  var hColumn = document.createElement('div');
  var heading = document.createElement('h4');

  hColumn.setAttribute('class', 'col-12');
  hColumn.append(heading);

  forecastEl.innerHTML = '';
  forecastEl.append(hColumn);

  for (var i = 0; i < dailyForecast.length; i++) {
    if (dailyForecast[i].dt >= startDate && dailyForecast[i].dt < endDate) {
      if (dailyForecast[i].dt_txt.slice(11, 13) == "12") {
        forecastCard(dailyForecast[i]);
      }
    }
  }
};

function items(city, data) {
  renderCurrentWeather(city, data.list[0], data.city.timezone);
  forecast(data.list);
}

// gets and displays weather from location
function getWeather(location) {
  var { lat } = location;
  var { lon } = location;
  var city = location.name;

  var api = `${weatherApiRootUrl}/data/2.5/forecast?lat=${lat}&lon=${lon}&units=imperial&appid=${weatherApiKey}`;

  fetch(api)
    .then(function (res) {
      return res.json();
    })
    .then(function (data) {
      items(city, data);
    })
    .catch(function (err) {
      console.error(err);
    });
}

function findLocation(search) {
  var api = `${weatherApiRootUrl}/geo/1.0/direct?q=${search}&limit=5&appid=${weatherApiKey}`;

  fetch(api)
    .then(function (res) {
      return res.json();
    })
    .then(function (data) {
      if (!data[0]) {
        alert('Location not found...');
      } else {
        appendHistory(search);
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
  var button = e.target;
  var search = button.getAttribute('data-search');
  findLocation(search);
}

initSearch();
searchForm.addEventListener('submit', searchFunction);
searchHistorySlot.addEventListener('click', historyClick);