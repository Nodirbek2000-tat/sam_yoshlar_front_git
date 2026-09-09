/**
 * Yo'nalish almashganda chalinadigan qisqa ohang.
 *
 * Fayl ishlatilmaydi — ovoz brauzerning o'zida yasaladi (Web Audio).
 * Shuning uchun hech narsa yuklanmaydi va kechikish bo'lmaydi.
 *
 * Har bir yo'nalishning o'z notasi bor: kalitdan barqaror son olinadi,
 * shuning uchun bitta yo'nalish har safar bir xil eshitiladi.
 */

/** Pentatonika — qaysi ikkitasi birga chalinsa ham quloqqa yoqimli. */
const SCALE = [523.25, 587.33, 659.25, 783.99, 880.0, 1046.5];

const MUTE_KEY = "sy-chime-off";

let context: AudioContext | null = null;

/** Nomdan barqaror son — bitta yo'nalish doim bir xil eshitiladi. */
function noteOf(seed: string) {
    let total = 0;
    for (let i = 0; i < seed.length; i += 1) total = (total * 31 + seed.charCodeAt(i)) >>> 0;
    return SCALE[total % SCALE.length];
}

export function isMuted() {
    try {
        return localStorage.getItem(MUTE_KEY) === "1";
    } catch {
        return false;
    }
}

export function setMuted(value: boolean) {
    try {
        localStorage.setItem(MUTE_KEY, value ? "1" : "0");
    } catch {
        // Xotira yopiq bo'lsa ovoz shu sessiyada ishlayveradi
    }
}

/**
 * Ohangni chaladi. Ovoz o'chirilgan bo'lsa yoki brauzer ruxsat bermasa —
 * jimgina o'tib ketadi, hech qanday xato chiqarmaydi.
 */
export function playChime(seed: string) {
    if (typeof window === "undefined" || isMuted()) return;

    try {
        if (!context) {
            const Ctx = window.AudioContext ?? window.webkitAudioContext;
            if (!Ctx) return;
            context = new Ctx();
        }
        if (context.state === "suspended") void context.resume();

        const base = noteOf(seed);
        const now = context.currentTime;

        // Ikkita nota: asosiysi va undan beshtalik yuqorisi — yumshoq jaranglaydi
        for (const [frequency, delay, volume] of [
            [base, 0, 0.11],
            [base * 1.5, 0.07, 0.07],
        ] as const) {
            const oscillator = context.createOscillator();
            const gain = context.createGain();

            oscillator.type = "sine";
            oscillator.frequency.setValueAtTime(frequency, now + delay);

            gain.gain.setValueAtTime(0.0001, now + delay);
            gain.gain.exponentialRampToValueAtTime(volume, now + delay + 0.02);
            gain.gain.exponentialRampToValueAtTime(0.0001, now + delay + 0.55);

            oscillator.connect(gain).connect(context.destination);
            oscillator.start(now + delay);
            oscillator.stop(now + delay + 0.6);
        }
    } catch {
        // Ovozsiz ham hammasi ishlayveradi
    }
}

declare global {
    interface Window {
        webkitAudioContext?: typeof AudioContext;
    }
}
