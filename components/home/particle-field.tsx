"use client";

import { useEffect, useRef } from "react";

/**
 * Nuqtalardan yasalgan 3D shakl — bosh sahifaning «jonli» rasmi.
 *
 * Bir necha yuz nuqta berilgan shaklni (Registon, halqalar, belgi…) hosil
 * qiladi. Har bir nuqtaning chuqurligi (z) bor: butun bulut sekin tebranib
 * turadi, sichqoncha bilan buriladi, yaqin nuqtalar katta va yorqin, uzoqlari
 * kichik va xira — shuning uchun hajmli ko'rinadi.
 *
 * Sahifa aylantirilganda (`[data-scene]` dagi `--step`) nuqtalar bir shakldan
 * ikkinchisiga oqib o'tadi. Sichqoncha yaqinlashsa nuqtalar qochadi
 * (`interactive`). Ochilishdagi rasm sahifadan chiqib ketayotganda CSS'da
 * (`[data-hero-art]`) so'nadi — canvas qayta chizilmaydi.
 *
 * Oddiy 2D canvas — kutubxonasiz. Faqat **biror narsa o'zgarayotganda** chizadi:
 * shakl yig'ilayotganda, sichqoncha qimirlaganda yoki aylantirilganda. Hammasi
 * tinchigach chizish to'xtaydi — protsessor bo'sh, sahifa silliq aylanadi.
 * Telefonda: nuqtalar kamroq, kadr siyrakroq, burilish yo'q. «Harakatni
 * kamaytirish» yoqilgan bo'lsa — birinchi shakl qimirlamay turadi.
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

/** Uchli ravoq (peshtoq va tokchalar shakli) — chizish yo'li. */
function arch(ctx: CanvasRenderingContext2D, left: number, right: number, bottom: number, spring: number) {
    const middle = (left + right) / 2;
    const rise = (right - left) * 0.42;
    ctx.beginPath();
    ctx.moveTo(left, bottom);
    ctx.lineTo(left, spring);
    ctx.quadraticCurveTo(left, spring - rise * 0.7, middle, spring - rise);
    ctx.quadraticCurveTo(right, spring - rise * 0.7, right, spring);
    ctx.lineTo(right, bottom);
    ctx.closePath();
}

/** Registon: zinapoya, ikki minora, yon qanotlar, peshtoq va gumbaz. */
function drawDome(ctx: CanvasRenderingContext2D) {
    // Poydevor — ikki pog'ona, eng pastda keng va qalin
    ctx.fillRect(2, 222, 236, 14);
    ctx.fillRect(10, 210, 220, 12);

    // Minoralar — pastga qarab kengayadi, tepasida ayvoncha va gumbazcha
    for (const center of [24, 216]) {
        ctx.beginPath();
        ctx.moveTo(center - 12, 210);
        ctx.lineTo(center - 7, 80);
        ctx.lineTo(center + 7, 80);
        ctx.lineTo(center + 12, 210);
        ctx.closePath();
        ctx.fill();
        ctx.fillRect(center - 11, 70, 22, 8);
        ctx.fillRect(center - 6, 56, 12, 14);
        ctx.beginPath();
        ctx.arc(center, 56, 6, Math.PI, 0);
        ctx.fill();
        ctx.fillRect(center - 1, 38, 2, 12);
    }

    // Yon qanotlar (madrasa devori)
    ctx.fillRect(36, 128, 24, 82);
    ctx.fillRect(180, 128, 24, 82);

    // Gumbaz: baraban va piyozsimon gumbaz, uchida bayroqcha
    ctx.fillRect(86, 80, 68, 18);
    ctx.beginPath();
    ctx.moveTo(82, 82);
    ctx.bezierCurveTo(62, 50, 104, 40, 120, 12);
    ctx.bezierCurveTo(136, 40, 178, 50, 158, 82);
    ctx.closePath();
    ctx.fill();
    ctx.fillRect(119, 0, 2, 13);

    // Peshtoq
    ctx.fillRect(60, 96, 120, 114);

    // O'yib olinadigan joylar: katta ravoq, tokchalar, bezak chiziqlari
    ctx.globalCompositeOperation = "destination-out";
    arch(ctx, 84, 156, 210, 152);
    ctx.fill();
    for (const left of [41, 185]) {
        arch(ctx, left, left + 14, 166, 148);
        ctx.fill();
        arch(ctx, left, left + 14, 204, 186);
        ctx.fill();
    }
    ctx.fillRect(60, 103, 120, 3);
    ctx.fillRect(86, 90, 68, 2);
    for (const center of [24, 216]) {
        ctx.fillRect(center - 10, 112, 20, 3);
        ctx.fillRect(center - 11, 160, 22, 3);
    }

    // Ravoq ichidagi hoshiya va eshik
    ctx.globalCompositeOperation = "source-over";
    ctx.lineWidth = 3;
    arch(ctx, 91, 149, 210, 156);
    ctx.stroke();
    arch(ctx, 106, 134, 210, 180);
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

/** Hamjamiyat — ichma-ich halqalar (3D da egilgan holda ko'rinadi). */
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

/** Shaklning qalinligi (z): yassi shakllar yupqa plita, to'dalar — shar. */
const DEPTH: Record<ParticleShape, number> = {
    dome: 0.02,
    rings: 0.02,
    clusters: 0.32,
    check: 0.1,
    bulb: 0.1,
};

/** Logodagi ranglar: yashil -> moviy -> binafsha. */
const PALETTE = {
    light: ["#0f9d7a", "#0f9d7a", "#12a4a0", "#1597c4", "#2f7fe0", "#5b6ee8", "#7c5ce6"],
    dark: ["#34d8a4", "#34d8a4", "#2fd3cf", "#38bdf8", "#5aa2ff", "#8190ff", "#a78bfa"],
};

/** Chuqurlik bo'yicha uch qatlam: uzoq — xira, yaqin — yorqin */
const LAYERS = [0.38, 0.72, 1];

export function ParticleField({
    shapes,
    className,
    interactive = false,
}: {
    /** Bitta shakl yoki ketma-ketlik (aylantirishdagi har bir qadam uchun bittadan) */
    shapes: ParticleShape[];
    className?: string;
    /** Ochilish sahnasi: portlab yig'iladi, sichqoncha bilan buriladi va nuqtalar qochadi */
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
        // Ochilishdagi Registon zichroq — burchak va chiziqlar aniq chiqsin
        const count = lowPower
            ? interactive
                ? 900
                : window.innerWidth < 640
                  ? 420
                  : 700
            : interactive
              ? window.innerWidth < 1280
                  ? 2200
                  : 3000
              : window.innerWidth < 1280
                ? 1100
                : 1700;
        // Tejamkor rejimda kadr ikki baravar siyrak — prujina shunga yarasha tezroq
        const stiffness = lowPower ? 0.075 : 0.03;
        const damping = lowPower ? 0.76 : 0.86;
        const buckets = PALETTE.light.length;
        const scene = canvas.closest<HTMLElement>("[data-scene]");
        // Registon ramkaga kichikroq joylashadi — pastdagi yozuvga tegmasin
        const fit = interactive ? 0.86 : 0.94;

        // Har bir shakl uchun: har bir nuqtaning boradigan joyi (x, y, z)
        const targetX: Float32Array[] = [];
        const targetY: Float32Array[] = [];
        const targetZ: Float32Array[] = [];
        for (const shape of list) {
            const points = build(shape, count);
            const length = points.length;
            const tx = new Float32Array(count);
            const ty = new Float32Array(count);
            const tz = new Float32Array(count);
            const spread = length ? 0.9 / Math.sqrt(length) : 0;
            const depth = DEPTH[shape] ?? 0.1;
            let previous = -1;

            for (let index = 0; index < count; index++) {
                const at = length ? Math.floor((index * length) / count) : 0;
                const point = length ? points[at] : [0, 0];
                // Bitta joyga tushgan nuqtalar ustma-ust turmasin — biroz sochiladi
                const jitter = at === previous ? spread : 0;
                tx[index] = point[0] + (Math.random() - 0.5) * jitter;
                ty[index] = point[1] + (Math.random() - 0.5) * jitter;
                tz[index] = (Math.random() - 0.5) * 2 * depth;
                previous = at;
            }
            targetX.push(tx);
            targetY.push(ty);
            targetZ.push(tz);
        }

        const x = new Float32Array(count);
        const y = new Float32Array(count);
        const z = new Float32Array(count);
        const vx = new Float32Array(count);
        const vy = new Float32Array(count);
        const vz = new Float32Array(count);
        const size = new Float32Array(count);
        const wake = new Float32Array(count);
        // Chizish uchun: proyeksiyalangan joy, o'lcham va qatlam
        const px = new Float32Array(count);
        const py = new Float32Array(count);
        const ps = new Float32Array(count);
        const layer = new Uint8Array(count);

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
        // Sichqoncha bilan burilish (-1..1), yumshoq yuradi
        let tiltX = 0;
        let tiltY = 0;
        let tiltToX = 0;
        let tiltToY = 0;
        // Sichqoncha oxirgi marta qachon qimirlagan — shundan keyin biroz chizib, to'xtaydi
        let lastPointer = 0;
        let colors = PALETTE.light;

        for (let index = 0; index < count; index++) {
            if (interactive && !lowPower) {
                // Ochilishda markazdan portlab chiqadi — keyin shaklga yig'iladi (telefonda shunchaki yig'iladi)
                const angle = Math.random() * Math.PI * 2;
                const speed = 0.04 + Math.random() * 0.1;
                x[index] = (Math.random() - 0.5) * 0.1;
                y[index] = (Math.random() - 0.5) * 0.1;
                vx[index] = Math.cos(angle) * speed;
                vy[index] = Math.sin(angle) * speed;
                wake[index] = performance.now() + Math.random() * 500;
            } else {
                // Sochilgan holda turadi — ekranga kirganda yig'iladi
                x[index] = (Math.random() - 0.5) * 3.2;
                y[index] = (Math.random() - 0.5) * 3.2;
            }
            z[index] = (Math.random() - 0.5) * 0.6;
            size[index] = interactive ? 1.8 + Math.random() * 0.4 : 1.2 + Math.random() * 1.3;
        }

        function resize() {
            const rect = canvas!.getBoundingClientRect();
            dpr = Math.min(window.devicePixelRatio || 1, 2);
            width = rect.width;
            height = rect.height;
            scale = (Math.min(width, height) / 2) * fit;
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
                vz[index] += (Math.random() - 0.5) * 0.05;
            }
        }

        /** Nuqtalarni bir qadam siljitadi. Hali harakat bo'lsa `true`. */
        function advance(now: number) {
            const tx = targetX[current];
            const ty = targetY[current];
            const tz = targetZ[current];
            const push = interactive && pointerOn;
            const mx = (pointerX - width / 2) / scale;
            const my = (pointerY - height / 2) / scale;
            const reach = 0.28;
            const still = 0.0006;
            let moving = false;

            for (let index = 0; index < count; index++) {
                if (now < wake[index]) {
                    // Portlash paytida erkin uchadi
                    x[index] += vx[index];
                    y[index] += vy[index];
                    moving = true;
                    continue;
                }

                let speedX = (vx[index] + (tx[index] - x[index]) * stiffness) * damping;
                let speedY = (vy[index] + (ty[index] - y[index]) * stiffness) * damping;
                const speedZ = (vz[index] + (tz[index] - z[index]) * stiffness) * damping;

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
                vz[index] = speedZ;
                x[index] += speedX;
                y[index] += speedY;
                z[index] += speedZ;

                if (
                    speedX > still || speedX < -still ||
                    speedY > still || speedY < -still ||
                    speedZ > still || speedZ < -still
                ) {
                    moving = true;
                }
            }
            return moving;
        }

        /** 3D -> ekran: butun bulutni buradi va perspektiva beradi. */
        function project() {
            const motion = !reduce && !lowPower;
            // Sichqoncha bilan buriladi. Telefonda qimirlamaydi, lekin chuqurlik qoladi.
            const angleY = motion ? tiltY * 0.5 : 0;
            const angleX = (interactive ? 0.06 : 0.42) - (motion ? tiltX * 0.35 : 0);
            const cosY = Math.cos(angleY);
            const sinY = Math.sin(angleY);
            const cosX = Math.cos(angleX);
            const sinX = Math.sin(angleX);
            const cx = width / 2;
            const cy = height / 2;

            for (let index = 0; index < count; index++) {
                const x0 = x[index];
                const y0 = y[index];
                const z0 = z[index];
                // Y o'qi atrofida, keyin X o'qi atrofida burish
                const x1 = x0 * cosY + z0 * sinY;
                const z1 = -x0 * sinY + z0 * cosY;
                const y1 = y0 * cosX - z1 * sinX;
                const z2 = y0 * sinX + z1 * cosX;
                // Perspektiva: yaqin (z2 > 0) — kattaroq
                const depth = 2.6 / (2.6 - z2);
                px[index] = cx + x1 * depth * scale;
                py[index] = cy + y1 * depth * scale;
                ps[index] = size[index] * depth;
                layer[index] = z2 < -0.18 ? 0 : z2 < 0.14 ? 1 : 2;
            }
        }

        function paint() {
            ctx!.setTransform(dpr, 0, 0, dpr, 0, 0);
            ctx!.clearRect(0, 0, width, height);

            project();

            const perBucket = count / buckets;
            // Telefonda bitta qatlam — chizish uch baravar kam
            const layers = lowPower ? 1 : LAYERS.length;

            for (let depth = 0; depth < layers; depth++) {
                ctx!.globalAlpha = lowPower ? 1 : LAYERS[depth];

                for (let bucket = 0; bucket < buckets; bucket++) {
                    ctx!.fillStyle = colors[bucket];
                    const from = Math.floor(bucket * perBucket);
                    const to = Math.floor((bucket + 1) * perBucket);

                    for (let index = from; index < to; index++) {
                        if (!lowPower && layer[index] !== depth) continue;
                        const dot = ps[index];
                        ctx!.fillRect(px[index] - dot / 2, py[index] - dot / 2, dot, dot);
                    }
                }
            }
            ctx!.globalAlpha = 1;
        }

        function loop(now: number) {
            frame = requestAnimationFrame(loop);
            if (lowPower && tick++ % 2) return;

            const step = wantedStep();
            if (step !== current) morph(step, now);
            // Burilish sichqoncha ortidan yumshoq yuradi
            tiltX += (tiltToX - tiltX) * 0.08;
            tiltY += (tiltToY - tiltY) * 0.08;
            const tilting = Math.abs(tiltToX - tiltX) + Math.abs(tiltToY - tiltY) > 0.003;

            const moving = advance(now);
            paint();

            // Hammasi tinchidi — keyingi o'zgarishgacha chizilmaydi (protsessor bo'sh)
            const busy = moving || tilting || now - lastPointer < 150;
            calm = busy ? 0 : calm + 1;
            if (calm > 6) stop();
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
            if (!frame && current >= 0) paint();
        }

        /** Uxlab yotgan canvas: aylantirilganda shakl o'zgarishi kerakmi — tekshiradi. */
        function onScroll() {
            if (frame || checking || !visible || reduce) return;
            checking = true;
            // `ScrollScenes` o'zgaruvchilarni shu kadrda yangilaydi — undan keyin o'qiymiz
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
            // Faqat yaqin atrofda bo'lsa nuqtalar qochadi
            pointerOn =
                pointerX > -80 && pointerY > -80 && pointerX < rect.width + 80 && pointerY < rect.height + 80;
            // Burilish — butun oyna bo'ylab
            tiltToX = Math.max(-1, Math.min(1, (event.clientY / window.innerHeight - 0.5) * 2));
            tiltToY = Math.max(-1, Math.min(1, (event.clientX / window.innerWidth - 0.5) * 2));
            lastPointer = performance.now();
            // Uxlab yotgan bo'lsa — uyg'otadi
            start();
        }

        resize();
        readTheme();

        if (reduce) {
            // Qimirlamaydi: nuqtalar darhol o'z joyida
            x.set(targetX[0]);
            y.set(targetY[0]);
            z.set(targetZ[0]);
            current = 0;
            paint();
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
        if (scene) {
            window.addEventListener("scroll", onScroll, { passive: true });
        }
        if (!lowPower && !reduce) {
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
