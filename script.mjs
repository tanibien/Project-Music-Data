// This is a placeholder file which shows how you can access functions defined in other files.
// It can be loaded into index.html.
// You can delete the contents of the file once you have understood how it works.
// Note that when running locally, in order to open a web page which uses modules, you must serve the directory over HTTP e.g. with https://www.npmjs.com/package/http-server
// You can't open the index.html file using a file:// URL.
/**
 * Music Capsule Project - Main Logic (Final Version)
 */

import { getUserIDs, getListenEvents, getSong } from "./data.mjs";
import { getMostOften, isFridayNight } from "./common.mjs";

// --- 1. ГЛОБАЛЬНЫЕ ПЕРЕМЕННЫЕ ---
let API_CONFIG = { KEY: "" };

const userSelect = document.getElementById("user-select");
const resultsArea = document.getElementById("results");
const searchBtn = document.getElementById("search-btn");
const searchInput = document.getElementById("search-input");

// --- 2. ФУНКЦИЯ ИНИЦИАЛИЗАЦИИ ---
async function init() {
  // Пробуем загрузить конфиг (безопасно для GitHub Pages)
  try {
    const configModule = await import("./config.mjs");
    API_CONFIG = configModule.API_CONFIG;
    console.log("Config loaded successfully.");
  } catch (e) {
    console.log("Running in production mode (no config.mjs).");
  }

  // Наполняем выпадающий список пользователями
  try {
    const ids = getUserIDs();
    console.log("IDs found in data.mjs:", ids); // Проверка в консоли

    if (userSelect) {
      // Очищаем на всякий случай и добавляем заголовок
      userSelect.innerHTML = '<option value="">-- Choose User --</option>';

      ids.forEach((id) => {
        const option = document.createElement("option");
        option.value = id;
        option.textContent = `User ${id}`;
        userSelect.appendChild(option);
      });
      console.log("Users populated in select menu.");
    }
  } catch (error) {
    console.error("Failed to load users:", error);
  }
}

// --- 3. ЛОГИКА ОТОБРАЖЕНИЯ (ОДИН ЭКЗЕМПЛЯР!) ---
function display(title, answer) {
  const card = document.createElement("section");
  card.className = "question-block";
  card.innerHTML = `<h3>${title}</h3><p>🎧 ${answer}</p>`;
  resultsArea.appendChild(card);
}

function renderAllAnswers(events) {
  resultsArea.innerHTML = "";
  const eventsWithData = events.map((e) => ({
    ...e,
    song: getSong(e.song_id),
  }));

  // 1. Самая частая песня
  const topSong = getMostOften(eventsWithData, (e) => e.song_id);
  display(
    "Most often listened to song",
    `${getSong(topSong[0]).artist} - ${getSong(topSong[0]).title}`,
  );

  // 2. Самый частый артист
  const topArtist = getMostOften(eventsWithData, (e) => e.song.artist);
  display("Most often listened to artist", topArtist[0]);

  // 3. Пятничные ночи
  const fridayEvents = eventsWithData.filter((e) => isFridayNight(e.timestamp));
  if (fridayEvents.length > 0) {
    const topFriday = getMostOften(fridayEvents, (e) => e.song_id);
    display(
      "Most listened to song on Friday nights",
      `${getSong(topFriday[0]).artist} - ${getSong(topFriday[0]).title}`,
    );
  }

  // 4. Топ жанров
  const genreStats = {};
  eventsWithData.forEach((e) => {
    const genre = e.song.genre;
    genreStats[genre] = (genreStats[genre] || 0) + 1;
  });
  const topGenres = Object.entries(genreStats)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map((g) => g[0]);
  display("Top genres", topGenres.join(", "));
}

// --- 4. ОБРАБОТЧИКИ СОБЫТИЙ ---
if (userSelect) {
  userSelect.addEventListener("change", (e) => {
    const userId = e.target.value;
    if (!userId) return;
    const events = getListenEvents(userId);
    if (events && events.length > 0) renderAllAnswers(events);
  });
}

if (searchBtn) {
  searchBtn.addEventListener("click", () => {
    const query = searchInput.value.trim().toLowerCase();
    if (!query) return;

    resultsArea.innerHTML = "";
    const allSongs = getUserIDs()
      .flatMap((id) => getListenEvents(id))
      .map((e) => getSong(e.song_id));

    // Убираем дубликаты песен для поиска
    const uniqueSongs = Array.from(
      new Map(allSongs.map((s) => [s.id, s])).values(),
    );
    const filtered = uniqueSongs.filter((s) =>
      s.artist.toLowerCase().includes(query),
    );

    if (filtered.length > 0) {
      filtered.forEach((song) => {
        display(`Search Result: ${song.artist}`, `Track: ${song.title}`);
      });
    } else {
      display(`Search Result`, `No artist found for "${query}"`);
    }
  });
}

// --- 5. ЗАПУСК ПРИ ЗАГРУЗКЕ ---
async function startApp() {
  await init();
}

startApp();
