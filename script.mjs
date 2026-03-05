// This is a placeholder file which shows how you can access functions defined in other files.
// It can be loaded into index.html.
// You can delete the contents of the file once you have understood how it works.
// Note that when running locally, in order to open a web page which uses modules, you must serve the directory over HTTP e.g. with https://www.npmjs.com/package/http-server
// You can't open the index.html file using a file:// URL.

/**
 * Music Capsule Project - Main Logic
 */

import { getUserIDs, getListenEvents, getSong } from './data.mjs';
import { getMostOften, isFridayNight } from './common.mjs';

// --- 1. CONFIG & GLOBALS ---
let API_CONFIG = { KEY: "" };

const userSelect = document.getElementById('user-select');
const resultsArea = document.getElementById('results');
const searchBtn = document.getElementById('search-btn');
const searchInput = document.getElementById('search-input');

// --- 2. INITIALIZATION LOGIC ---

async function init() {
    // Пытаемся загрузить конфиг. Если файла нет - идем дальше.
    try {
        const configModule = await import('./config.mjs');
        API_CONFIG = configModule.API_CONFIG;
        console.log("Config loaded");
    } catch (e) {
        console.warn("Config not found, using empty defaults");
    }

    // Заполняем список пользователей
    try {
        const ids = getUserIDs();
        ids.forEach(id => {
            const option = document.createElement('option');
            option.value = id;
            option.textContent = `User ${id}`;
            userSelect.appendChild(option);
        });
        console.log("Users populated");
    } catch (error) {
        console.error("Failed to load users:", error);
    }
}

// --- 3. STATISTICS LOGIC ---

function renderAllAnswers(events) {
    resultsArea.innerHTML = ''; 
    const eventsWithData = events.map(e => ({ ...e, song: getSong(e.song_id) }));

    const topSong = getMostOften(eventsWithData, e => e.song_id);
    display("Most often listened to song", `${getSong(topSong[0]).artist} - ${getSong(topSong[0]).title}`);

    const topArtist = getMostOften(eventsWithData, e => e.song.artist);
    display("Most often listened to artist", topArtist[0]);

    const fridayEvents = eventsWithData.filter(e => isFridayNight(e.timestamp));
    if (fridayEvents.length > 0) {
        const topFriday = getMostOften(fridayEvents, e => e.song_id);
        display("Most listened to song on Friday nights", `${getSong(topFriday[0]).artist} - ${getSong(topFriday[0]).title}`);
    }

    const topSongTime = getMostOften(eventsWithData, e => e.song_id, e => e.song.duration_seconds);
    display("Most listened to song (by listening time)", `${getSong(topSongTime[0]).artist} - ${getSong(topSongTime[0]).title}`);
    
    let maxStreak = 0, currentStreak = 1, bestStreakSongId = events[0].song_id;
    for (let i = 1; i < events.length; i++) {
        if (events[i].song_id === events[i-1].song_id) {
            currentStreak++;
        } else {
            if (currentStreak > maxStreak) {
                maxStreak = currentStreak;
                bestStreakSongId = events[i-1].song_id;
            }
            currentStreak = 1;
        }
    }
    const s = getSong(bestStreakSongId);
    display("Longest streak song", `${s.artist} - ${s.title} (Streak: ${maxStreak})`);

    const genreStats = {};
    eventsWithData.forEach(e => genreStats[e.song.genre] = (genreStats[e.song.genre] || 0) + 1);
    const topGenres = Object.entries(genreStats).sort((a,b) => b[1] - a[1]).slice(0, 3).map(g => g[0]);
    display("Top genres", topGenres.join(',埋 '));
}

// --- 4. EVENT LISTENERS ---

userSelect.addEventListener('change', (e) => {
    const userId = e.target.value;
    if (!userId) return;

    const events = getListenEvents(userId);
    if (events && events.length > 0) {
        renderAllAnswers(events);
    }
});

searchBtn.addEventListener('click', () => {
    const query = searchInput.value.trim().toLowerCase();
    if (query) {
        resultsArea.innerHTML = ''; 
        const allSongs = getUserIDs().flatMap(id => getListenEvents(id)).map(e => getSong(e.song_id));
        const uniqueSongs = Array.from(new Map(allSongs.map(s => [s.id, s])).values());
        const filtered = uniqueSongs.filter(song => song.artist.toLowerCase().includes(query));
        
        filtered.forEach(song => {
            display(`Artist: ${song.artist}`, `Featured Track: ${song.title}`);
        });
    }
});

// --- 5. UTILS ---

function display(title, answer) {
    const card = document.createElement('section');
    card.className = 'question-block';
    card.innerHTML = `<h3>${title}</h3><p>🎧 ${answer}</p>`;
    resultsArea.appendChild(card);
}

// ЗАПУСК
init();