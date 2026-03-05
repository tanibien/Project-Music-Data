import assert from 'node:assert';
// Предположим, мы вынесли логику стрика в common.mjs
import { calculateStreak } from './common.mjs'; 

try {
    console.log("Running logic tests...");

    // Тест 1: Обычный стрик
    const mockEvents = [
        { song_id: '1' }, { song_id: '1' }, // стрик 2
        { song_id: '2' }, 
        { song_id: '1' }
    ];
    const result = calculateStreak(mockEvents);
    assert.strictEqual(result.songId, '1');
    assert.strictEqual(result.length, 2);
    console.log("✅ Streak test passed!");

    // Тест 2: Пустой массив
    assert.strictEqual(calculateStreak([]), null);
    console.log("✅ Empty data test passed!");

} catch (err) {
    console.error("❌ Tests failed:", err.message);
}