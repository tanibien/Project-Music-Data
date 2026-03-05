import { getSong } from "./data.mjs";

// Универсальная функция для поиска самого частого (по количеству или по времени)
export function getMostOften(events, propertyGetter, weightGetter = () => 1) {
    if (events.length === 0) return null;
    
    const stats = {};
    events.forEach(event => {
        const key = propertyGetter(event);
        const weight = weightGetter(event);
        stats[key] = (stats[key] || 0) + weight;
    });

    return Object.entries(stats).reduce((a, b) => (b[1] > a[1] ? b : a));
}

// Фильтр для пятничных ночей (Friday 17:00 - Saturday 04:00)
export function isFridayNight(timestamp) {
    const date = new Date(timestamp);
    const day = date.getDay(); // 5 = Friday, 6 = Saturday
    const hours = date.getHours();

    // Пятница после 17:00
    if (day === 5 && hours >= 17) return true;
    // Суббота до 04:00
    if (day === 6 && hours < 4) return true;
    
    return false;
    
}

// Вопрос 5: Самый длинный стрик (подряд)
export function calculateLongestStreak(events) {
    if (!events || events.length === 0) return null;

    let maxStreak = 0;
    let currentStreak = 1;
    let bestSongId = events[0].song_id;
    let currentSongId = events[0].song_id;

    for (let i = 1; i < events.length; i++) {
        if (events[i].song_id === currentSongId) {
            currentStreak++;
        } else {
            if (currentStreak > maxStreak) {
                maxStreak = currentStreak;
                bestSongId = currentSongId;
            }
            currentSongId = events[i].song_id;
            currentStreak = 1;
        }
    }

    // Проверка после последнего элемента
    if (currentStreak > maxStreak) {
        maxStreak = currentStreak;
        bestSongId = currentSongId;
    }

    return { id: bestSongId, length: maxStreak };
}

// Вопрос 6: Песни, которые слушали каждый день активности
export function getEveryDaySongs(events) {
    // Получаем список всех уникальных дней, когда была активность
    const days = [...new Set(events.map(e => e.timestamp.split('T')[0]))];
    if (days.length === 0) return [];

    // Группируем песни по дням (наборы Set для быстрого поиска)
    const songsPerDay = days.map(day => {
        return new Set(events.filter(e => e.timestamp.startsWith(day)).map(e => e.song_id));
    });

    // Ищем пересечение: песня должна быть в Set каждого дня
    const firstDaySongs = [...songsPerDay[0]];
    return firstDaySongs.filter(songId => 
        songsPerDay.every(daySet => daySet.has(songId))
    );
}
// Пример функции для создания структуры карточки (Requirement: Artist Card)
export function createArtistCard(artistName, genre, imageUrl = 'default-path.png') {
    return `
        <article class="artist-card">
            <img src="${imageUrl}" alt="${artistName}" class="artist-image">
            <div class="artist-info">
                <h3>${artistName}</h3>
                <p>Genre: ${genre}</p>
                <button class="view-details">View Details</button>
            </div>
        </article>
    `;
}