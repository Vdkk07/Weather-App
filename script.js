const userTab = document.querySelector("[data-userWeather]");
const searchTab = document.querySelector("[data-searchWeather]");
const userContainer = document.querySelector(".weatherContainer");
const grantAccessContainer = document.querySelector(".grantLocation");
const searchForm = document.querySelector("[data-searchForm]");
const loadingScreen = document.querySelector(".loadingContainer");
const userInfoContainer = document.querySelector(".userInfoContainer");

// initial variable
const API_KEY = "d1845658f92b31c64bd94f06f7188c9c";
let currentTab = userTab;
currentTab.classList.add("current-tab");

getFromSessionStorage();

function switchTab(clickedTab) {
  if (clickedTab != currentTab) {
    currentTab.classList.remove("current-tab");
    currentTab = clickedTab;
    currentTab.classList.add("current-tab");

    if (!searchForm.classList.contains("active")) {
      // search form container is invisible, if yes make it visible
      userInfoContainer.classList.remove("active");
      grantAccessContainer.classList.remove("active");
      searchForm.classList.add("active");
    } else {
      // search tab pr hu, user weather ko active/visible karna hai
      searchForm.classList.remove("active");
      userInfoContainer.classList.remove("active");

      // now i am in weather tab, so i have to display weather, checked first is my coordinate save in local coordinates
      getFromSessionStorage();
    }
  }
}

userTab.addEventListener("click", () => {
  // pass clicked tab as input parameter
  switchTab(userTab);
});

searchTab.addEventListener("click", () => {
  // pass clicked tab as input parameter
  switchTab(searchTab);
});

//check if coordinates are already present in local storage
function getFromSessionStorage() {
  const localCoordinates = sessionStorage.getItem("user-coordinates");

  // agar local coordinates save nhi mile
  if (!localCoordinates) {
    grantAccessContainer.classList.add("active");

    //  agar local coordinates save hai  toh geoLocation api call kiya jayega
  } else {
    //! JSON.parse --> convert  string into json object
    const coordinates = JSON.parse(localCoordinates);
    fetchUserWeatherInfo(coordinates);
  }
}

async function fetchUserWeatherInfo(coordinates) {
  //! object destructuring
  const { lat, lon } = coordinates;

  // make grantAccessContainer invisible
  grantAccessContainer.classList.remove("active");

  // make loadingScreen visible
  loadingScreen.classList.add("active");

  // API CALL
  try {
    const response = await fetch(
      `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`
    );
    const data = await response.json();

    // data aa gya hai loading screen ko hata do
    loadingScreen.classList.remove("active");

    // weather ki info dikhao ab
    userInfoContainer.classList.add("active");

    // function for render weather on UI
    renderWeatherInfo(data);
  } catch (error) {
    // remove loadingScreen
    loadingScreen.classList.remove("active");

    // Log the error
    console.error("Error fetching data:", error);

    // display an error message to the user
    alert("Failed to fetch data. Please try again later.");
  }
}

function renderWeatherInfo(weatherInfo) {
  // firstly we have to fetch the elements
  const cityName = document.querySelector("[data-cityName]");
  const countryFlag = document.querySelector("[data-countryFlag]");
  const weatherDescription = document.querySelector(
    "[data-weatherDescription]"
  );
  const weatherIcon = document.querySelector("[data-weatherIcon]");
  const temperature = document.querySelector("[data-temperature]");
  const windspeed = document.querySelector("[data-windspeed]");
  const humidity = document.querySelector("[data-humidity]");
  const cloud = document.querySelector("[data-cloud]");

  //  fetch values from weatherInfo Object and put in UI Element
  cityName.innerText = weatherInfo?.name;
  countryFlag.src = `https://flagcdn.com/144x108/${weatherInfo?.sys?.country?.toLowerCase()}.png`;
  weatherDescription.innerText = weatherInfo?.weather?.[0]?.description;
  weatherIcon.src = `http://openweathermap.org/img/w/${weatherInfo?.weather?.[0]?.icon}.png`;
  temperature.innerText = `${weatherInfo?.main?.temp}°C`;
  windspeed.innerText = `${weatherInfo?.wind?.speed}m/s`;
  humidity.innerText = `${weatherInfo?.main?.humidity}%`;
  cloud.innerText = `${weatherInfo?.clouds?.all}%`;
}

const grantAccessButton = document.querySelector("[data-grantAccess]");

// add event listener to button
grantAccessButton.addEventListener("click", getLocation());

function getLocation() {
  // support available
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(showPosition);

    // support not available
  } else {
    alert("Geolocation is not supported by this browser");
  }
}

function showPosition(positon) {
  const userCoordinates = {
    lat: positon.coords.latitude,
    lon: positon.coords.longitude,
  };

  sessionStorage.setItem("user-coordinates", JSON.stringify(userCoordinates));
  fetchUserWeatherInfo(userCoordinates);
}

const searchInput = document.querySelector("[data-searchInput]");

searchForm.addEventListener("submit", (e) => {
  e.preventDefault();
  let cityName = searchInput.value;

  if (cityName === "") return;
  else fetchSearchWeatherInfo(cityName);
});

async function fetchSearchWeatherInfo(city) {
  loadingScreen.classList.add("active");

  userInfoContainer.classList.remove("active");

  grantAccessContainer.classList.remove("active");

  try {
    const response = await fetch(
      `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${API_KEY}&units=metric`
    );
    const data = await response.json();

    // data aa gya hai loading screen ko hata do
    loadingScreen.classList.remove("active");

    // weather ki info dikhao ab
    userInfoContainer.classList.add("active");

    renderWeatherInfo(data);
  } catch (error) {
    // remove loadingScreen
    loadingScreen.classList.remove("active");

    // Log the error
    console.error("Error fetching data:", error);

    // display an error message to the user
    alert("Failed to fetch data. Please try again later.");
  }
}
