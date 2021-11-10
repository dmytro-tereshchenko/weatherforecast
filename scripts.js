var lat = 0;
var lon = 0;
document.addEventListener("DOMContentLoaded", async () => {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            geolocationSuccess, geolocationFailure);
    }
    else {
        await getDefaultLocation();
        await setStartCity();
        showToday();
    }
});
async function setStartCity() {
    const response = await fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=80883943e6ce504c831b3aedd952ba89`, {
        method: "GET",
        headers: { "Accept": "application/json" }
    });
    if (response.ok === true) {
        const weather = await response.json();
        const input = document.forms[0].elements[0];
        input.placeholder = `${weather.name}, ${weather.sys.country}`;
    }
}
async function currentWeather() {
    let response = await fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=metric&appid=80883943e6ce504c831b3aedd952ba89`, {
        method: "GET",
        headers: { "Accept": "application/json" }
    });
    if (response.ok === true) {
        const weather = await response.json();
        let currentWeatherBlock = document.querySelector("#today>div:first-of-type");
        let date = new Date(weather.dt * 1000);
        currentWeatherBlock.querySelector("div:last-of-type").innerHTML = date.toLocaleDateString();
        const weatherLogo = currentWeatherBlock.childNodes[3].childNodes[1];
        weatherLogo.childNodes[1].src = `http://openweathermap.org/img/w/${weather.weather[0].icon}.png`;
        weatherLogo.childNodes[3].innerHTML = weather.weather[0].description;
        const temp = weatherLogo.nextSibling.nextSibling;
        temp.childNodes[1].innerHTML = `${Math.round(weather.main.temp)}&#8451`;
        temp.childNodes[3].innerHTML = `Real Feal ${Math.round(weather.main.feels_like)}&deg;`;
        const sun = temp.nextSibling.nextSibling.querySelectorAll("td+td");
        const sunrise = new Date(weather.sys.sunrise * 1000);
        sun[0].innerHTML = sunrise.toLocaleTimeString();
        const sunset = new Date(weather.sys.sunset * 1000);
        sun[1].innerHTML = sunset.toLocaleTimeString();
        sun[2].innerHTML = `${((sunset - sunrise) / 3600000).toFixed(2)} hr`;
    }
}
async function hourlyForecastByDayByLocation(lat, lon, block, offsetDay) {
    const response = await fetch(`https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&units=metric&appid=80883943e6ce504c831b3aedd952ba89`, {
        method: "GET",
        headers: { "Accept": "application/json" }
    });
    if (response.ok === true) {
        var weather = await response.json();
        let i = 0;
        let hourlyForecast = new Array();
        let date;
        let targetDay = new Date();
        targetDay.setDate(targetDay.getDate() + offsetDay);
        while (i < weather.list.length) {
            date = new Date(weather.list[i].dt * 1000);
            if (date.getHours() == 0)
                date.setDate(date.getDate() - 1);
            if (date.getDate() == targetDay.getDate()) {
                hourlyForecast.push(weather.list[i]);
            }
            i++;
        }
        block.innerHTML = '';
        let tr = document.createElement("tr");
        tr.setAttribute("class", "fw-bolder");
        let td = document.createElement("td");
        td.setAttribute("scope", "col");
        td.setAttribute("class", "text-uppercase");
        td.innerText = targetDay.getDate() === (new Date()).getDate() ? "Today" : targetDay.toLocaleString('en', { weekday: 'long' });
        tr.append(td);
        hourlyForecast.forEach(element => {
            td = document.createElement("td");
            td.setAttribute("scope", "col");
            td.innerText = (new Date(element.dt * 1000)).toLocaleString('en-US', { hour: 'numeric' });
            tr.append(td);
        });
        block.append(tr);
        tr = document.createElement("tr");
        tr.setAttribute("scope", "row");
        td = document.createElement("td");
        tr.append(td);
        let img;
        hourlyForecast.forEach(element => {
            td = document.createElement("td");
            img = document.createElement("img");
            img.setAttribute("src", `http://openweathermap.org/img/w/${element.weather[0].icon}.png`);
            td.append(img);
            tr.append(td);
        });
        block.append(tr);
        tr = document.createElement("tr");
        tr.setAttribute("scope", "row");
        td = document.createElement("td");
        td.setAttribute("class", "fw-bolder");
        td.innerText = "Forecast";
        tr.append(td);
        hourlyForecast.forEach(element => {
            td = document.createElement("td");
            td.innerText = element.weather[0].description;
            tr.append(td);
        });
        block.append(tr);
        tr = document.createElement("tr");
        tr.setAttribute("scope", "row");
        td = document.createElement("td");
        td.setAttribute("class", "fw-bolder");
        td.innerHTML = "Temp (&deg;)";
        tr.append(td);
        hourlyForecast.forEach(element => {
            td = document.createElement("td");
            td.innerHTML = `${Math.round(element.main.temp)}&deg;`;
            tr.append(td);
        });
        block.append(tr);
        tr = document.createElement("tr");
        tr.setAttribute("scope", "row");
        td = document.createElement("td");
        td.setAttribute("class", "fw-bolder");
        td.innerText = "Real Feel";
        tr.append(td);
        hourlyForecast.forEach(element => {
            td = document.createElement("td");
            td.innerHTML = `${Math.round(element.main.feels_like)}&deg;`;
            tr.append(td);
        });
        block.append(tr);
        tr = document.createElement("tr");
        tr.setAttribute("scope", "row");
        td = document.createElement("td");
        td.setAttribute("class", "fw-bolder");
        td.innerText = "Wind (km/h)";
        tr.append(td);
        hourlyForecast.forEach(element => {
            td = document.createElement("td");
            td.innerText = `${Math.round(element.wind.speed * 3.6)} ${windDeg(element.wind.deg)}`;
            tr.append(td);
        });
        block.append(tr);
    }
}
async function nearbyPlacesByLocation(lat, lon) {
    var cities = new Array();
    const step = 0.1;
    await currentTryPlacesByLocation(lat, lon, 0);
    let blocks = document.querySelectorAll("#today>div:last-of-type td");
    for (let i = 0; i < 4; i++) {
        blocks[i].children[0].innerText = cities[i + 1].name;
        blocks[i].children[1].setAttribute("src", `http://openweathermap.org/img/w/${cities[i + 1].weather[0].icon}.png`);
        blocks[i].children[2].innerHTML = `${Math.round(cities[i + 1].main.temp)}&deg;`;
    }
    async function currentTryPlacesByLocation(lat, lon, index) {
        if (cities.length > 4) return;
        curLat = lat + step * index / 4 * Math.pow(-1, Math.round((index % 4) / 2));
        curLon = lon + step * index / 4 * Math.pow(-1, Math.round((index % 4 + 1) / 2));
        const response = await fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${curLat}&lon=${curLon}&units=metric&appid=80883943e6ce504c831b3aedd952ba89`, {
            method: "GET",
            headers: { "Accept": "application/json" }
        });
        if (response.ok === true) {
            var weather = await response.json();
            if (!checkContains(weather)) {
                cities.push(weather);
            }
        }
        index++;
        await currentTryPlacesByLocation(lat, lon, index);
    }
    function checkContains(weather) {
        var result = false;
        cities.forEach(element => {
            if (element.id == weather.id) {
                result = true;
            }
        });
        return result;
    }
}
function windDeg(d) {
    let directions = ["N", "NNE", "NE", "ENE", "E", "ESE", "SE", "SSE", "S", "SSW", "SW", "WSW", "W", "WNW", "NW", "NNW", "N"];
    d += 11.25;
    let w = parseInt(d / 22.5);
    return directions[w];
}
async function getDefaultLocation() {
    const response = await fetch(`http://ip-api.com/json/?lang=ru`, {
        method: "GET",
        headers: { "Accept": "application/json" }
    });
    if (response.ok === true) {
        const loc = await response.json();
        lat = loc.lat;
        lon = loc.lon;
    }
}
async function geolocationSuccess(position) {
    lat = position.coords.latitude;
    lon = position.coords.longitude;
    await setStartCity();
    showToday();
}

async function geolocationFailure(positionError) {
    await getDefaultLocation();
    await setStartCity();
    showToday();
}
function showToday() {
    document.getElementById("forecast").style.display = "none";
    document.getElementById("error").style.display = "none";
    document.getElementById("today").style.display = "block";
    currentWeather();
    hourlyForecastByDayByLocation(lat, lon, document.querySelector("#today>div:nth-of-type(2) tbody"), 0);
    nearbyPlacesByLocation(lat, lon);
}
document.querySelector("nav>a:first-of-type").addEventListener("click", function (e) {
    e.preventDefault();
    showToday();
});
function showForecast() {
    document.getElementById("today").style.display = "none";
    document.getElementById("error").style.display = "none";
    document.getElementById("forecast").style.display = "block";
    daysForecastByLocation(lat, lon);
    hourlyForecastByDayByLocation(lat, lon, document.querySelector("#forecast>div:last-of-type tbody"), 0);
}
document.querySelector("nav>a:last-of-type").addEventListener("click", function (e) {
    e.preventDefault();
    showForecast();
});
async function daysForecastByLocation(lat, lon) {
    const response = await fetch(`https://api.openweathermap.org/data/2.5/onecall?lat=${lat}&lon=${lon}&exclude=minutely&units=metric&appid=80883943e6ce504c831b3aedd952ba89`, {
        method: "GET",
        headers: { "Accept": "application/json" }
    });
    if (response.ok === true) {
        var weather = await response.json();
        const blocks = document.querySelectorAll("#forecast>div:first-of-type>div>div");
        let date;
        for (let i = 0; i < 5; i++) {
            date = new Date(weather.daily[i].dt * 1000);
            blocks[i].children[0].innerText = i == 0 ? "tonight" : date.toLocaleString('en', { weekday: 'short' });
            blocks[i].children[1].innerText = date.toLocaleString('en', { month: 'short', day: '2-digit' });
            blocks[i].children[2].children[0].setAttribute("src", `http://openweathermap.org/img/w/${weather.daily[i].weather[0].icon}.png`);
            blocks[i].children[3].innerHTML = `${Math.round(i == 0 ? weather.daily[i].temp.night : weather.daily[i].temp.day)}&#8451`;
            blocks[i].children[4].innerText = weather.daily[i].weather[0].description;
            blocks[i].addEventListener("click", function () {
                hourlyForecastByDayByLocation(lat, lon, document.querySelector("#forecast>div:last-of-type tbody"), i);
                blocks.forEach(element => {
                    element.style.opacity = 1;
                })
                this.style.opacity = 0.85;
            })
        }
    }
}
async function searchCity(city) {
    let response = await fetch(`https://api.openweathermap.org/data/2.5/weather?q=${city.replace(" ", "")}&appid=80883943e6ce504c831b3aedd952ba89`, {
        method: "GET",
        headers: { "Accept": "application/json" }
    });
    if (response.ok === true) {
        const weather = await response.json();
        lat = weather.coord.lat;
        lon = weather.coord.lon;
    }
}
document.querySelector("body>div:first-of-type img").addEventListener("click", async function () {
    const input = document.forms[0].elements[0];
    await searchCity(input.value);
    showToday();
})
document.forms[0].elements[0].addEventListener("keydown", async function (e) {
    if (e.key == "Enter") {
        e.preventDefault();
        const input = document.forms[0].elements[0];
        await searchCity(input.value);
        showToday();
    }
})
