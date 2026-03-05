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
import { API_CONFIG } from './config.mjs'; 

// --- 1. DOM ELEMENTS ---
// Мы должны объявить их в начале, чтобы функции могли ими пользоваться
const userSelect = document.getElementById('user-select');
const resultsArea = document.getElementById('results');
const searchBtn = document.getElementById('search-btn');
const searchInput = document.getElementById('search-input');

// --- 2. INITIALIZATION ---
function init() {
    try {
        const ids = getUserIDs();
        ids.forEach(id => {
            const option = document.createElement('option');
            option.value = id;
            option.textContent = `User ${id}`;
            userSelect.appendChild(option);
        });
    } catch (error) {
        console.error("Initialization failed:", error);
    }
}

// --- 3. API LOGIC ---
async function searchArtistAPI(artistName) {
    // Используем ключ из импортированного конфига
    const apiKey = API_CONFIG.KEY; 
    const url = `https://api.example.com/search?q=${artistName}&apikey=${apiKey}`;

    try {
        const response = await fetch(url);
        if (!response.ok) throw new Error('Network response was not ok');
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('API Error Handle:', error);
        return null;
    }
}

// --- 4. USER STATISTICS LOGIC ---
userSelect.addEventListener('change', (e) => {
    const userId = e.target.value;
    
    if (!userId) {
        resultsArea.innerHTML = `
            <div class="empty-state">
                <p>Select a user to unlock their listening insights.</p>
            </div>`;
        return;
    }

    try {
        const events = getListenEvents(userId);
        
        if (!events || events.length === 0) {
            resultsArea.innerHTML = `
                <div class="empty-state">
                    <p>User ${userId} hasn't started their musical journey yet. No data available.</p>
                </div>`;
            return;
        }

        renderAllAnswers(events);
    } catch (error) {
        console.error("Data processing failed:", error);
        resultsArea.innerHTML = "<p>Error loading music data. Please try again later.</p>";
    }
});

function renderAllAnswers(events) {
    resultsArea.innerHTML = ''; 

    const eventsWithData = events.map(e => ({ ...e, song: getSong(e.song_id) }));

    // Q1: Most listened song
    const topSong = getMostOften(eventsWithData, e => e.song_id);
    display("Most often listened to song", `${getSong(topSong[0]).artist} - ${getSong(topSong[0]).title}`);

    // Q2: Most listened artist
    const topArtist = getMostOften(eventsWithData, e => e.song.artist);
    display("Most often listened to artist", topArtist[0]);

    // Q3: Friday night song
    const fridayEvents = eventsWithData.filter(e => isFridayNight(e.timestamp));
    if (fridayEvents.length > 0) {
        const topFriday = getMostOften(fridayEvents, e => e.song_id);
        display("Most listened to song on Friday nights", `${getSong(topFriday[0]).artist} - ${getSong(topFriday[0]).title}`);
    }

    // Q4: Most listened (by time)
    const topSongTime = getMostOften(eventsWithData, e => e.song_id, e => e.song.duration_seconds);
    display("Most listened to song (by listening time)", `${getSong(topSongTime[0]).artist} - ${getSong(topSongTime[0]).title}`);
    
    // Q5: Longest streak
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
    if (currentStreak > maxStreak) { maxStreak = currentStreak; bestStreakSongId = events[events.length - 1].song_id; }
    const s = getSong(bestStreakSongId);
    display("Longest streak song", `${s.artist} - ${s.title} (Streak: ${maxStreak})`);

    // Q6: Every day songs
    const days = [...new Set(events.map(e => e.timestamp.split('T')[0]))];
    const songsByDay = days.map(day => new Set(events.filter(e => e.timestamp.startsWith(day)).map(e => e.song_id)));
    const everyDaySongIds = [...songsByDay[0]].filter(id => songsByDay.every(daySet => daySet.has(id)));
    if (everyDaySongIds.length > 0) {
        display("Songs listened to every day", everyDaySongIds.map(id => getSong(id).title).join(', '));
    }

    // Q7: Top 3 genres
    const genreStats = {};
    eventsWithData.forEach(e => genreStats[e.song.genre] = (genreStats[e.song.genre] || 0) + 1);
    const topGenres = Object.entries(genreStats).sort((a,b) => b[1] - a[1]).slice(0, 3).map(g => g[0]);
    display(topGenres.length === 3 ? "Top three genres" : `Top ${topGenres.length} genres`, topGenres.join(', '));
}

// --- 5. SEARCH LOGIC ---
searchBtn.addEventListener('click', () => {
    const query = searchInput.value.trim().toLowerCase();
    if (query) {
        handleSearch(query);
    }
});

function handleSearch(query) {
    resultsArea.innerHTML = ''; 
    const allSongs = getUserIDs().flatMap(id => getListenEvents(id)).map(e => getSong(e.song_id));
    const uniqueSongs = Array.from(new Map(allSongs.map(s => [s.id, s])).values());

    const filtered = uniqueSongs.filter(song => 
        song.artist.toLowerCase().includes(query)
    );

    if (filtered.length === 0) {
        resultsArea.innerHTML = `<p class="empty-state">No artists found matching "${query}"</p>`;
        return;
    }

    filtered.forEach(song => {
        display(`Artist Profile: ${song.artist}`, `Featured Track: ${song.title} | Genre: ${song.genre}`);
    });
}

// --- 6. UTILS ---
function display(title, answer) {
    const card = document.createElement('section');
    card.className = 'question-block';
    card.innerHTML = `
        <h3>${title}</h3>
        <p><span class="icon">🎧</span> ${answer}</p>
    `;
    resultsArea.appendChild(card);
}

// Start the app after DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    init();
});