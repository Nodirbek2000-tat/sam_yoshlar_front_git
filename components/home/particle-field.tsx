"use client";

import { useEffect, useRef } from "react";

/**
 * Nuqtalardan yasalgan shakl — bosh sahifaning «jonli» rasmi.
 *
 * Bir necha yuz nuqta berilgan shaklni (Registon, doiralar, belgi…) hosil
 * qiladi. Sahifa aylantirilganda (`[data-scene]` dagi `--step`) nuqtalar
 * bir shakldan ikkinchisiga oqib o'tadi; sichqoncha yaqinlashsa tarqaladi.
 *
 * Oddiy 2D canvas — kutubxonasiz. Faqat ekranda ko'rinib turganda chizadi.
 * Telefonda tejamkor rejim: nuqtalar kamroq, kadr siyrakroq va shakl
 * yig'ilib bo'lgach chizish butunlay to'xtaydi (keyingi shaklgacha).
 * «Harakatni kamaytirish» yoqilgan bo'lsa — birinchi shakl qimirlamay turadi.
 */

export type ParticleShape = "dome" | "rings" | "clusters" | "check" | "bulb";

type Point = [number, number];

/** Shakl chiziladigan yordamchi maydon (piksel) */
const BOX = 240;

/** Chizilgan rasmdan nuqtalar to'rini oladi: [-1..1] oralig'ida. */
function fromDrawing(draw: (ctx: CanvasRenderingContext2D) => void, wanted: number): Point[] {
    const canvas = document.createElement("canvas");
    canvas.width = canvas.height = BOX;
    const ctx = canvas.getContext("2d", { willReadFrequently: true });
    if (!ctx) return [];

    ctx.fillStyle = "#000";
    ctx.strokeStyle = "#000";
    draw(ctx);
    const data = ctx.getImageData(0, 0, BOX, BOX).data;

    // To'r qadami: nuqtalar soni so'ralganiga yaqin bo'lguncha kattalashadi
    for (let step = 2; step <= 12; step++) {
        const points: Point[] = [];
        for (let y = step / 2; y < BOX; y += step) {
            for (let x = step / 2; x < BOX; x += step) {
                if (data[(Math.floor(y) * BOX + Math.floor(x)) * 4 + 3] > 128) {
                    points.push([(x / BOX) * 2 - 1, (y / BOX) * 2 - 1]);
                }
            }
        }
        if (points.length <= wanted * 1.1 || step === 12) return points;
    }
    return [];
}

/** Registon: peshtoq, gumbaz va ikki minora. */
function drawDome(ctx: CanvasRenderingContext2D) {
    // Minoralar
    for (const x of [18, 208]) {
        ctx.fillRect(x, 80, 14, 140);
        ctx.beginPath();
        ctx.arc(x + 7, 76, 10, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillRect(x + 6, 54, 2, 14);
    }

    // Gumbaz
    ctx.beginPath();
    ctx.moveTo(80, 98);
    ctx.bezierCurveTo(60, 62, 100, 46, 120, 16);
    ctx.bezierCurveTo(140, 46, 180, 62, 160, 98);
    ctx.closePath();
    ctx.fill();
    ctx.fillRect(119, 4, 2, 14);

    // Peshtoq
    ctx.fillRect(56, 98, 128, 122);

    // Ravoq va bezak chiziqlari — o'yib olinadi
    ctx.globalCompositeOperation = "destination-out";
    ctx.beginPath();
    ctx.moveTo(86, 220);
    ctx.lineTo(86, 162);
    ctx.quadraticCurveTo(86, 130, 120, 114);
    ctx.quadraticCurveTo(154, 130, 154, 162);
    ctx.lineTo(154, 220);
    ctx.closePath();
    ctx.fill();
    ctx.fillRect(56, 106, 128, 3);
    ctx.fillRect(18, 120, 14, 3);
    ctx.fillRect(208, 120, 14, 3);

    // Ichki eshik
    ctx.globalCompositeOperation = "source-over";
    ctx.beginPath();
    ctx.moveTo(106, 220);
    ctx.lineTo(106, 186);
    ctx.quadraticCurveTo(106, 168, 120, 160);
    ctx.quadraticCurveTo(134, 168, 134, 186);
    ctx.lineTo(134, 220);
    ctx.closePath();
    ctx.fill();
}

/** Ovoz — tasdiq belgisi. */
function drawCheck(ctx: CanvasRenderingContext2D) {
    ctx.lineWidth = 30;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.beginPath();
    ctx.moveTo(46, 128);
    ctx.lineTo(98, 180);
    ctx.lineTo(198, 62);
    ctx.stroke();
}

/** Yechim — yonib turgan chiroq. */
function drawBulb(ctx: CanvasRenderingContext2D) {
    ctx.beginPath();
    ctx.arc(120, 100, 56, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillRect(98, 148, 44, 18);
    ctx.fillRect(102, 174, 36, 9);
    ctx.fillRect(108, 190, 24, 8);

    ctx.lineWidth = 7;
    ctx.lineCap = "round";
    for (let index = 0; index < 7; index++) {
        const angle = Math.PI + (index / 6) * Math.PI;
        ctx.beginPath();
        ctx.moveTo(120 + Math.cos(angle) * 72, 100 + Math.sin(angle) * 72);
        ctx.lineTo(120 + Math.cos(angle) * 92, 100 + Math.sin(angle) * 92);
        ctx.stroke();
    }
}

/** Hamjamiyat — ichma-ich doiralar. */
function rings(count: number): Point[] {
    const points: Point[] = [];
    const radii = [0.12, 0.3, 0.48, 0.66, 0.84];
    const total = radii.reduce((sum, radius) => sum + radius, 0);

    for (const radius of radii) {
        const amount = Math.round((count * radius) / total);
        for (let index = 0; index < amount; index++) {
            const angle = (index / amount) * Math.PI * 2;
            const wobble = radius + (Math.random() - 0.5) * 0.035;
            points.push([Math.cos(angle) * wobble, Math.sin(angle) * wobble]);
        }
    }
    return points;
}

/** Tashabbuslar — 14 yo'nalish, har biri o'z to'dasi. */
function clusters(count: number): Point[] {
    const points: Point[] = [];
    const groups = 14;
    const each = Math.floor((count * 0.86) / groups);
    const gauss = () => (Math.random() + Math.random() + Math.random() - 1.5) / 1.5;

    for (let group = 0; group < groups; group++) {
        const angle = (group / groups) * Math.PI * 2 - Math.PI / 2;
        const cx = Math.cos(angle) * 0.7;
        const cy = Math.sin(angle) * 0.7;
        for (let index = 0; index < each; index++) {
            points.push([cx + gauss() * 0.1, cy + gauss() * 0.1]);
        }
    }
    while (points.length < count) points.push([gauss() * 0.17, gauss() * 0.17]);
    return points;
}

function build(shape: ParticleShape, count: number): Point[] {
    const points =
        shape === "dome"
            ? fromDrawing(drawDome, count)
            : shape === "check"
              ? fromDrawing(drawCheck, count)
              : shape === "bulb"
                ? fromDrawing(drawBulb, count)
                : shape === "rings"
                  ? rings(count)
                  : clusters(count);

    // Chapdan o'ngga tartib — ranglar bir tekis o'tadi, shakldan shaklga oqim silliq
    return points.sort((a, b) => a[0] - b[0]);
}

/** Logodagi ranglar: yashil -> moviy -> binafsha. */
const PALETTE = {
    light: ["#0f9d7a", "#0f9d7a", "#12a4a0", "#1597c4", "#2f7fe0", "#5b6ee8", "#7c5ce6"],
    dark: ["#34d8a4", "#34d8a4", "#2fd3cf", "#38bdf8", "#5aa2ff", "#8190ff", "#a78bfa"],
};

/** «Nafas olish» uchun tayyor qiymatlar guruhi — har bir nuqtaga sin/cos hisoblanmaydi */
const SWAY_GROUPS = 32;

export function ParticleField({
    shapes,
    className,
    interactive = false,
}: {
    /** Bitta shakl yoki ketma-ketlik (aylantirishdagi har bir qadam uchun bittadan) */
    shapes: ParticleShape[];
    className?: string;
    /** Sichqoncha yaqinlashsa nuqtalar tarqaladi */
    interactive?: boolean;
}) {
    const ref = useRef<HTMLCanvasElement>(null);
    // Ro'yxat har chizishda yangi massiv bo'lib kelmasin
    const key = shapes.join(",");

    useEffect(() => {
        const canvas = ref.current;
        const ctx = canvas?.getContext("2d");
        if (!canvas || !ctx) return;

        const list = key.split(",") as ParticleShape[];
        const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
        // Telefon va planshet: tejamkor rejim
        const lowPower = window.matchMedia("(pointer: coarse)").matches;
        const count = lowPower
            ? window.innerWidth < 640
                ? 520
                : 800
            : window.innerWidth < 1280
              ? 1100
              : 1700;
        // Tejamkor rejimda kadr ikki baravar siyrak — prujina shunga yarasha tezroq
        const stiffness = lowPower ? 0.075 : 0.03;
        const damping = lowPower ? 0.76 : 0.86;
        const buckets = PALETTE.light.length;
        const scene = canvas.closest<HTMLElement>("[data-scene]");

        // Har bir shakl uchun: har bir nuqtaning boradigan joyi
        const targetX: Float32Array[] = [];
        const targetY: Float32Array[] = [];
        for (const shape of list) {
            const points = build(shape, count);
            const length = points.length;
            const tx = new Float32Array(count);
            const ty = new Float32Array(count);
            const spread = length ? 0.9 / Math.sqrt(length) : 0;
            let previous = -1;

            for (let index = 0; index < count; index++) {
                const at = length ? Math.floor((index * length) / count) : 0;
                const point = length ? points[at] : [0, 0];
                // Bitta joyga tushgan nuqtalar ustma-ust turmasin — biroz sochiladi
                const jitter = at === previous ? spread : 0;
                tx[index] = point[0] + (Math.random() - 0.5) * jitter;
                ty[index] = point[1] + (Math.random() - 0.5) * jitter;
                previous = at;
            }
            targetX.push(tx);
            targetY.push(ty);
        }

        const x = new Float32Array(count);
        const y = new Float32Array(count);
        const vx = new Float32Array(count);
        const vy = new Float32Array(count);
        const size = new Float32Array(count);
        const wake = new Float32Array(count);
        const swayX = new Float32Array(SWAY_GROUPS);
        const swayY = new Float32Array(SWAY_GROUPS);

        let width = 0;
        let height = 0;
        let scale = 1;
        let dpr = 1;
        let current = -1;
        let visible = false;
        let frame = 0;
        let tick = 0;
        let calm = 0;
        let checking = false;
        let pointerX = 0;
        let pointerY = 0;
        let pointerOn = false;
        let colors = PALETTE.light;

        for (let index = 0; index < count; index++) {
            // Boshida sochilgan — keyin shaklga yig'iladi
            x[index] = (Math.random() - 0.5) * 3.2;
            y[index] = (Math.random() - 0.5) * 3.2;
            size[index] = 1.2 + Math.random() * 1.3;
        }

        function resize() {
            const rect = canvas!.getBoundingClientRect();
            dpr = Math.min(window.devicePixelRatio || 1, 2);
            width = rect.width;
            height = rect.height;
            scale = (Math.min(width, height) / 2) * 0.94;
            canvas!.width = Math.round(width * dpr);
            canvas!.height = Math.round(height * dpr);
        }

        function readTheme() {
            colors = document.documentElement.classList.contains("dark") ? PALETTE.dark : PALETTE.light;
        }

        /** Qaysi shakl turishi kerak — sahnadagi `--step` dan. */
        function wantedStep() {
            if (!scene || list.length < 2) return 0;
            const step = Number(scene.style.getPropertyValue("--step")) || 0;
            return Math.max(0, Math.min(list.length - 1, step));
        }

        function morph(step: number, now: number) {
            current = step;
            calm = 0;
            for (let index = 0; index < count; index++) {
                // Hammasi birdan emas — to'lqin bo'lib ko'chadi
                wake[index] = now + Math.random() * 260;
                vx[index] += (Math.random() - 0.5) * 0.05;
                vy[index] += (Math.random() - 0.5) * 0.05;
            }
        }

        /** Nuqtalarni bir qadam siljitadi. Hali harakat bo'lsa `true`. */
        function advance(now: number) {
            const tx = targetX[current];
            const ty = targetY[current];
            const push = interactive && pointerOn;
            const mx = (pointerX - width / 2) / scale;
            const my = (pointerY - height / 2) / scale;
            const reach = 0.28;
            const still = 0.0006;
            let moving = false;

            for (let index = 0; index < count; index++) {
                if (now < wake[index]) {
                    moving = true;
                    continue;
                }

                let speedX = (vx[index] + (tx[index] - x[index]) * stiffness) * damping;
                let speedY = (vy[index] + (ty[index] - y[index]) * stiffness) * damping;

                if (push) {
                    const dx = x[index] - mx;
                    const dy = y[index] - my;
                    const distance = dx * dx + dy * dy;
                    if (distance < reach * reach && distance > 0.00001) {
                        const root = Math.sqrt(distance);
                        const force = (1 - root / reach) * 0.02;
                        speedX += (dx / root) * force;
                        speedY += (dy / root) * force;
                    }
                }

                vx[index] = speedX;
                vy[index] = speedY;
                x[index] += speedX;
                y[index] += speedY;

                if (speedX > still || speedX < -still || speedY > still || speedY < -still) moving = true;
            }
            return moving;
        }

        function paint(now: number) {
            ctx!.setTransform(dpr, 0, 0, dpr, 0, 0);
            ctx!.clearRect(0, 0, width, height);

            // Yengil «nafas olish» — faqat kompyuterda (telefonda shakl tinch turadi)
            const breathe = !reduce && !lowPower;
            if (breathe) {
                for (let group = 0; group < SWAY_GROUPS; group++) {
                    const shift = (group / SWAY_GROUPS) * Math.PI * 2;
                    swayX[group] = Math.sin(now * 0.0011 + shift) * 1.1;
                    swayY[group] = Math.cos(now * 0.0009 + shift * 3) * 1.1;
                }
            }

            const cx = width / 2;
            const cy = height / 2;
            const perBucket = count / buckets;

            for (let bucket = 0; bucket < buckets; bucket++) {
                ctx!.fillStyle = colors[bucket];
                const from = Math.floor(bucket * perBucket);
                const to = Math.floor((bucket + 1) * perBucket);

                for (let index = from; index < to; index++) {
                    const group = index % SWAY_GROUPS;
                    const dot = size[index];
                    ctx!.fillRect(
                        cx + x[index] * scale + (breathe ? swayX[group] : 0) - dot / 2,
                        cy + y[index] * scale + (breathe ? swayY[group] : 0) - dot / 2,
                        dot,
                        dot,
                    );
                }
            }
        }

        function loop(now: number) {
            frame = requestAnimationFrame(loop);
            if (lowPower && tick++ % 2) return;

            const step = wantedStep();
            if (step !== current) morph(step, now);

            const moving = advance(now);
            paint(now);

            // Tejamkor rejim: shakl yig'ilib bo'ldi — keyingi o'zgarishgacha chizilmaydi
            if (lowPower) {
                calm = moving ? 0 : calm + 1;
                if (calm > 6) stop();
            }
        }

        function start() {
            if (frame || reduce || !visible || document.hidden) return;
            calm = 0;
            frame = requestAnimationFrame(loop);
        }

        function stop() {
            cancelAnimationFrame(frame);
            frame = 0;
        }

        /** To'xtab turgan bo'lsa — bitta kadr qayta chizadi (o'lcham yoki mavzu o'zgarganda). */
        function repaint() {
            if (!frame && current >= 0) paint(performance.now());
        }

        /** Uxlab yotgan canvas: aylantirilganda shakl almashishi kerakmi — tekshiradi. */
        function onScroll() {
            if (frame || checking || !visible) return;
            checking = true;
            // `ScrollScenes` `--step` ni shu kadrda yangilaydi — undan keyin o'qiymiz
            requestAnimationFrame(() =>
                requestAnimationFrame(() => {
                    checking = false;
                    if (wantedStep() !== current) start();
                }),
            );
        }

        function onPointer(event: PointerEvent) {
            if (event.pointerType !== "mouse") return;
            const rect = canvas!.getBoundingClientRect();
            pointerX = event.clientX - rect.left;
            pointerY = event.clientY - rect.top;
            // Faqat yaqin atrofda bo'lsa hisoblanadi
            pointerOn =
                pointerX > -80 && pointerY > -80 && pointerX < rect.width + 80 && pointerY < rect.height + 80;
        }

        resize();
        readTheme();

        if (reduce) {
            // Qimirlamaydi: nuqtalar darhol o'z joyida
            x.set(targetX[0]);
            y.set(targetY[0]);
            current = 0;
            paint(0);
        }

        const io = new IntersectionObserver(([entry]) => {
            visible = entry.isIntersecting;
            if (visible) start();
            else stop();
        });
        io.observe(canvas);

        const onVisibility = () => (document.hidden ? stop() : start());
        const onResize = () => {
            resize();
            repaint();
        };
        const theme = new MutationObserver(() => {
            readTheme();
            repaint();
        });

        theme.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
        document.addEventListener("visibilitychange", onVisibility);
        window.addEventListener("resize", onResize);
        if (lowPower && scene && list.length > 1) {
            window.addEventListener("scroll", onScroll, { passive: true });
        }
        if (interactive && !lowPower) {
            window.addEventListener("pointermove", onPointer, { passive: true });
        }

        return () => {
            stop();
            io.disconnect();
            theme.disconnect();
            document.removeEventListener("visibilitychange", onVisibility);
            window.removeEventListener("resize", onResize);
            window.removeEventListener("scroll", onScroll);
            window.removeEventListener("pointermove", onPointer);
        };
    }, [key, interactive]);

    return <canvas ref={ref} aria-hidden className={className} />;
}
