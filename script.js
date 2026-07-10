/* ===================================================================
   كب كرست — ملف الحركات والتفاعل (JavaScript)
   -------------------------------------------------------------------
   كل وظيفة مكتوب فوقها تعليق يوضّح وش تسوّي وكيف تعطّلها.
   ملاحظة: الموقع يشتغل ويظهر حتى لو هذا الملف ما اشتغل (فيه طبقة أمان بالـ CSS).
   =================================================================== */

/* فحوصات أولية:
   RM   = هل المستخدم مفعّل "تقليل الحركة" بجهازه؟ (نوقف الحركات الثقيلة)
   FINE = هل عنده ماوس دقيق (كمبيوتر)؟ (نشغّل المؤشر المخصّص والإمالة) */
const RM   = matchMedia('(prefers-reduced-motion: reduce)').matches;
const FINE = matchMedia('(hover:hover) and (pointer:fine)').matches;

/* السنة في الفوتر تتحدّث تلقائيًا */
document.getElementById('yr').textContent = new Date().getFullYear();

/* -------------------------------------------------------------------
   1) شاشة التحميل (Preloader)
   - تختفي بعد ~1 ثانية، أو فورًا بأول لمسة/سكرول/زر
   - لتعطيلها: احذف بلوك .preloader من index.html، وهذي الدالة تتجاهله تلقائيًا
   ------------------------------------------------------------------- */
(function(){
  const pre = document.getElementById('preloader');
  if(!pre) return;
  let done = false;
  function finish(){
    if(done) return; done = true;
    document.body.classList.add('loaded'); // يشغّل ظهور عناصر الهيرو
    pre.classList.add('hide');             // يرفع الستارة
    setTimeout(()=> pre.remove(), 750);
  }
  window.addEventListener('load', ()=> setTimeout(finish, RM ? 150 : 300));
  setTimeout(finish, 1200); // أمان: لو حدث تأخير بالتحميل
  ['pointerdown','wheel','keydown','touchstart'].forEach(ev =>
    window.addEventListener(ev, finish, {once:true, passive:true}));
})();

/* -------------------------------------------------------------------
   2) قائمة الجوال (زر الهمبرغر)
   ------------------------------------------------------------------- */
const burger = document.getElementById('burger');
const links  = document.getElementById('navlinks');
if(burger && links){
  burger.addEventListener('click', ()=>{
    const open = links.classList.toggle('open');
    burger.setAttribute('aria-expanded', open ? 'true' : 'false');
  });
  // اقفل القائمة بعد الضغط على أي رابط
  links.addEventListener('click', e=>{
    if(e.target.tagName === 'A'){ links.classList.remove('open'); burger.setAttribute('aria-expanded','false'); }
  });
}

/* -------------------------------------------------------------------
   3) الظهور التدريجي عند السكرول (Reveal)
   - أي عنصر عليه class="reveal" يظهر بنعومة لما يدخل الشاشة
   - نستخدم IntersectionObserver (يراقب وصول العنصر للشاشة)
   ------------------------------------------------------------------- */
const io = new IntersectionObserver((entries)=>{
  entries.forEach(en=>{
    if(en.isIntersecting){ en.target.classList.add('in'); io.unobserve(en.target); }
  });
}, {threshold:0.14, rootMargin:'0px 0px -6% 0px'});
document.querySelectorAll('.reveal').forEach(el => io.observe(el));

/* أمان إضافي: بعد 2.6 ثانية أظهر أي عنصر قريب من الشاشة (لو صار خلل بالمراقب) */
setTimeout(()=>{
  document.body.classList.add('loaded');
  document.querySelectorAll('.reveal:not(.in)').forEach(e=>{
    if(e.getBoundingClientRect().top < innerHeight*1.15) e.classList.add('in');
  });
}, 2600);

/* -------------------------------------------------------------------
   4) تفاعلات السكرول (تشتغل بإطار واحد للأداء):
      - القائمة العلوية تتغيّر بعد النزول
      - شريط التقدّم فوق
      - زر "ارجع فوق" يظهر بعد 600px
      - بارالاكس خفيف للماسكوت والحبوب (يتوقّف مع تقليل الحركة)
   ------------------------------------------------------------------- */
const nav = document.getElementById('nav');
const bar = document.getElementById('progress');
const btt = document.getElementById('backtop');
const heroArt = document.querySelector('.hero-art');
const beans = [...document.querySelectorAll('.hero-beans span')];
let ticking = false;

function update(){
  const y = scrollY;
  nav.classList.toggle('scrolled', y > 22);
  const h = document.documentElement.scrollHeight - innerHeight;
  bar.style.transform = 'scaleX(' + (h > 0 ? Math.min(y/h, 1) : 0) + ')';
  btt.classList.toggle('show', y > 600);
  if(!RM && y < innerHeight * 1.4){
    if(heroArt) heroArt.style.transform = 'translateY(' + (y * 0.1) + 'px)';
    beans.forEach((b,i)=>{ b.style.marginTop = (y * (0.05 + i*0.03) * (i%2 ? -1 : 1)) + 'px'; });
  }
  ticking = false;
}
addEventListener('scroll', ()=>{ if(!ticking){ requestAnimationFrame(update); ticking = true; } }, {passive:true});
update();
btt.addEventListener('click', ()=> scrollTo({ top:0, behavior: RM ? 'auto' : 'smooth' }));

/* -------------------------------------------------------------------
   5) تفاعلات الماوس (كمبيوتر فقط) — تتعطّل تلقائيًا بالجوال أو مع تقليل الحركة:
      أ) مؤشر مخصّص (حلقة + نقطة) تكبر فوق العناصر التفاعلية
      ب) أزرار مغناطيسية تنجذب للماوس
      ج) إمالة ثلاثية الأبعاد للكروت
   ------------------------------------------------------------------- */
if(FINE && !RM){
  document.body.classList.add('has-cursor');
  const ring = document.getElementById('cring');
  const dot  = document.getElementById('cdot');
  let mx = innerWidth/2, my = innerHeight/2, rx = mx, ry = my, cs = 1, ts = 1;

  // النقطة تتبع الماوس فورًا، والحلقة تتبع بنعومة
  addEventListener('mousemove', e=>{
    mx = e.clientX; my = e.clientY;
    dot.style.transform = 'translate('+mx+'px,'+my+'px) translate(-50%,-50%)';
  });
  (function loop(){
    rx += (mx-rx)*0.18; ry += (my-ry)*0.18; cs += (ts-cs)*0.2;
    ring.style.transform = 'translate('+rx+'px,'+ry+'px) translate(-50%,-50%) scale('+cs+')';
    requestAnimationFrame(loop);
  })();

  // تكبير الحلقة فوق أي عنصر تفاعلي
  document.querySelectorAll('a, button, [data-cursor], .card').forEach(el=>{
    el.addEventListener('mouseenter', ()=>{ ts = 2.3; dot.style.opacity = '0'; });
    el.addEventListener('mouseleave', ()=>{ ts = 1;   dot.style.opacity = '1'; });
  });

  // الأزرار المغناطيسية
  document.querySelectorAll('.btn, .nav-cta').forEach(btn=>{
    btn.addEventListener('mousemove', e=>{
      const r = btn.getBoundingClientRect();
      btn.style.transform = 'translate('+((e.clientX-r.left-r.width/2)*0.22)+'px,'+((e.clientY-r.top-r.height/2)*0.3)+'px)';
    });
    btn.addEventListener('mouseleave', ()=> btn.style.transform = '');
  });

  // إمالة الكروت حسب موقع الماوس
  document.querySelectorAll('.card').forEach(card=>{
    card.addEventListener('mouseenter', ()=> card.classList.add('is-tilt'));
    card.addEventListener('mousemove', e=>{
      const r = card.getBoundingClientRect();
      const px = (e.clientX-r.left)/r.width - 0.5;
      const py = (e.clientY-r.top)/r.height - 0.5;
      card.style.transform = 'perspective(800px) rotateX('+(-py*5)+'deg) rotateY('+(px*5)+'deg) translateY(-6px)';
    });
    card.addEventListener('mouseleave', ()=>{ card.classList.remove('is-tilt'); card.style.transform = ''; });
  });
}

/* -------------------------------------------------------------------
   قسم بطاقة الولاء: تشغيل الحركة عند وصول القسم للشاشة
   (تعيد الحركة كل ما رجع الزائر للقسم — لجعلها مرة واحدة احذف سطر remove)
   ------------------------------------------------------------------- */
(function(){
   const sec = document.querySelector('.loyalty');
   if(!sec) return;
   const obs = new IntersectionObserver((entries)=>{
      entries.forEach(en=>{
         if(en.isIntersecting){ sec.classList.add('play'); }
         else{ sec.classList.remove('play'); }
      });
   }, {threshold:0.3});
   obs.observe(sec);
})();
