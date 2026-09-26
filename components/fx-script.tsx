/**
 * Chiqish animatsiyalarining «dvigateli» — kutubxonasiz, ~1 KB.
 *
 * Sahifa boshida (React yuklanishidan oldin) ishlaydi:
 *   1. `html.fx` sinfini qo'yadi — CSS shundan keyingina elementlarni yashiradi;
 *   2. `data-reveal`, `data-stagger`, `data-fx` elementlarini kuzatadi va
 *      ekranga kirganda `data-shown` beradi (CSS o'tish animatsiyasi ishlaydi);
 *   3. sahifalar orasida o'tilganda yangi qo'shilgan elementlarni ham topadi.
 *
 * Harakat kamaytirilgan bo'lsa yoki brauzer eski bo'lsa — hech narsa
 * yashirilmaydi, kontent darhol ko'rinadi.
 */
const SCRIPT = `(function(){
var d=document.documentElement;
if(!('IntersectionObserver' in window)||!('MutationObserver' in window))return;
if(window.matchMedia&&matchMedia('(prefers-reduced-motion: reduce)').matches)return;
d.classList.add('fx');
var SEL='[data-reveal],[data-stagger],[data-fx]';
var io=new IntersectionObserver(function(es){for(var i=0;i<es.length;i++){var e=es[i];if(e.isIntersecting){e.target.setAttribute('data-shown','');io.unobserve(e.target);}}},{rootMargin:'0px 0px -64px 0px'});
function track(el){if(!el.__fx){el.__fx=1;io.observe(el);}}
function scan(n){if(n.nodeType!==1)return;if(n.matches(SEL))track(n);var f=n.querySelectorAll(SEL);for(var i=0;i<f.length;i++)track(f[i]);}
new MutationObserver(function(ms){for(var i=0;i<ms.length;i++){var a=ms[i].addedNodes;for(var j=0;j<a.length;j++)scan(a[j]);}}).observe(d,{childList:true,subtree:true});
if(document.body)scan(document.body);
})();`;

export function FxScript() {
    // Server tomonda HTML ichiga yoziladi va sahifa o'qilayotganda darhol ishlaydi
    return <script dangerouslySetInnerHTML={{ __html: SCRIPT }} />;
}
