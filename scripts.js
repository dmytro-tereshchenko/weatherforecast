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
        input.value = `${weather.name}, ${weather.sys.country}`;
    }
}
async function currentWeather() {
    let response = await fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=metric&appid=80883943e6ce504c831b3aedd952ba89`, {
        method: "GET",
        headers: { "Accept": "application/json" }
    });
    if (response.ok === true) {
        const weather = await response.json();
        let currentWeatherBlock = document.querySelector("#tooday>div:first-of-type");
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
async function hourlyForecastCurrentDayByLocation(lat, lon) {
    const response = await fetch(`https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&units=metric&appid=80883943e6ce504c831b3aedd952ba89`, {
        //const response = await fetch(`https://api.openweathermap.org/data/2.5/onecall?lat=${lat}&lon=${lon}&exclude=minutely&appid=80883943e6ce504c831b3aedd952ba89`, {
        method: "GET",
        headers: { "Accept": "application/json" }
    });
    if (response.ok === true) {
        var weather = await response.json();
        let i = 0;
        let currentDay = new Array();
        let endFilter = false;
        let date;
        const today = new Date();
        while (!endFilter && i < weather.list.length) {
            date = new Date(weather.list[i].dt * 1000);
            if (date.getHours() == 0)
                date.setDate(date.getDate() - 1);
            if (date.getDate() == today.getDate()) {
                currentDay.push(weather.list[i]);
                i++;
            }
            else {
                endFilter = true;
            }
        }
        const block = document.querySelector("#tooday>div:nth-of-type(2) tbody");
        block.innerHTML = '';
        let tr = document.createElement("tr");
        tr.setAttribute("class", "fw-bolder");
        let td = document.createElement("td");
        td.setAttribute("scope", "col");
        td.setAttribute("class", "text-uppercase");
        td.innerText = "Today";
        tr.append(td);
        currentDay.forEach(element => {
            td = document.createElement("td");
            td.setAttribute("scope", "col");
            td.innerText = formatAMPM(new Date(element.dt * 1000));
            tr.append(td);
        });
        block.append(tr);
        tr = document.createElement("tr");
        tr.setAttribute("scope", "row");
        td = document.createElement("td");
        tr.append(td);
        let img;
        currentDay.forEach(element => {
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
        currentDay.forEach(element => {
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
        currentDay.forEach(element => {
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
        currentDay.forEach(element => {
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
        currentDay.forEach(element => {
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
    let blocks = document.querySelectorAll("#tooday>div:last-of-type td");
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
function formatAMPM(date) {
    var hours = date.getHours();
    var minutes = date.getMinutes();
    var ampm = hours >= 12 ? 'pm' : 'am';
    hours = hours % 12;
    hours = hours ? hours : 12;
    minutes = minutes < 10 ? '0' + minutes : minutes;
    var strTime = hours + ' ' + ampm;
    return strTime;
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
function showToday(){
    currentWeather();
    hourlyForecastCurrentDayByLocation(lat, lon);
    nearbyPlacesByLocation(lat, lon);
}