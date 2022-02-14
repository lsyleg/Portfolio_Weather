async function setRenderBackground() {
    // https://picsum.photos/200/300
    const result = await axios.get("https://picsum.photos/1280/720", {
        responseType: "blob"
    })
    //console.log(result.data)
    const data = URL.createObjectURL(result.data)
    // console.log(data)
    document.querySelector("body").style.backgroundImage = `url(${data})`
}

function setTime() {
    const timer = document.querySelector(".timer");
    setInterval(() => {
        const date = new Date();
        timer.textContent = `${date.getHours()} : ${date.getMinutes()} : ${date.getSeconds()}`
        if (date.getHours() < 12) {
            const str = document.querySelector(".timer-content");
            str.textContent = 'Good morning, Seoyeon!';
        }
        else {
            const str = document.querySelector(".timer-content");
            str.textContent = 'Good evening, Seoyeon!';
        }
    }, 1000)
}

function getMemo() {
    const memo = document.querySelector(".memo");
    const memoValue = localStorage.getItem("todo");
    memo.textContent = memoValue;
}

function setMemo() {
    const memoInput = document.querySelector(".memo-input");
    memoInput.addEventListener("keyup", function (e) {
        // console.log(e.currentTarget.value)
        if (e.code === "Enter" && e.currentTarget.value) {
            localStorage.setItem("todo", e.currentTarget.value);
            getMemo();
            memoInput.value = "";   // 비우기
        }
    })
}

function deleteMemo() {
    document.addEventListener("click", function (e) {
        if (e.target.classList.contains("memo")) {
            localStorage.removeItem("todo");
            e.target.textContent = "";
        }
    })
}

function getPosition(options) {
    return new Promise(function (resolve, reject) {
        navigator.geolocation.getCurrentPosition(resolve, reject, options)
    })
}

async function getWeather(lat, lon) {
    // console.log(lat, lon);

    if (lat && lon) {
        const data = await axios.get(`http://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=d0a86f1c193a1f9aafd99f71ddb97475`);
        return data;
    }

    const data = await axios.get("http://api.openweathermap.org/data/2.5/forecast?q=Seoul&appid=2719e331e07a6af0547cfe7df2754c8c");
    return data;
}

async function renderWeather() {
    let latitude = "";
    let longitude = "";

    try {
        const position = await getPosition();
        // console.log(position);
        latitude = position.coords.latitude;
        longitude = position.coords.longitude;
    } catch {

    }

    const result = await getWeather(latitude, longitude);
    const weatherData = result.data;

    // console.log(weatherData);
    // 배열이 너무 많음
    // 오전, 오후만 남길 수 있는 로직
    const weatherList = weatherData.list.reduce((acc, cur) => {
        const date = new Date();
        if (cur.dt_txt.indexOf(`${date.getHours()}:00:00`) > 0) {
            console.log(`${date.getHours()}:00:00`);
        }
        if (cur.dt_txt.indexOf("18:00:00") > 0) {
            acc.push(cur);
        }
        return acc;
    }, [])

    // console.log(weatherList[0])
    const modalButton = document.querySelector(".modal-button");
    modalButton.innerHTML = weatherList.reduce((acc, cur) => {
        acc = weatherList[0]
        // console.log(acc)
        return weatherIcon(acc);
    }, [])

    const modalBody = document.querySelector(".modal-body");
    modalBody.innerHTML = weatherList.map((e) => {
        return weatherWrapperComponent(e);
    }).join("")
}

function weatherWrapperComponent(e) {
    // console.log(e);
    const changeToCelsius = (temp) => (temp - 273.15).toFixed(1)
    return `
    <div class="card" bg-transparent style = "width: 18rem;" >
        <div class="card-header text-center">
            ${e.dt_txt.split(" ")[0]}
        </div>
        <div class="card-body text-center">
            <h5>${e.weather[0].main}</h5>
            <img src="${matchIcon(e.weather[0].main)}" class="card-img-top" alt="..."/>
            <p class="card-text">${changeToCelsius(e.main.temp)}</p>
        </div>
    </div>
    `
}

function weatherIcon(e) {
    return `
    <img src="${matchIcon(e.weather[0].main)}" alt="..." height="100"/>
    `
}

function matchIcon(weatherData) {
    if (weatherData === "Clear") return "../images/039-sun.png"
    if (weatherData === "Clouds") return "../images/001-cloud.png"
    if (weatherData === "Rain") return "../images/003-rainy.png"
    if (weatherData === "Snow") return "../images/006-snowy.png"
    if (weatherData === "Thunderstorm") return "../images/008-storm.png"
    if (weatherData === "Drizzle") return "../images/031-snowflake.png"
    if (weatherData === "Atmosphere") return "../images/033-hurricane.png"
}

renderWeather();
deleteMemo();
getMemo();
setMemo();
setTime();
setRenderBackground();
setInterval(() => {
    setRenderBackground();
}, 5000)