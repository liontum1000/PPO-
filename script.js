(function(){
  "use strict";

  document.documentElement.classList.add('js');

  /* ---------- header scroll state ---------- */
  var header = document.getElementById('siteHeader');
  function onScroll(){
    if (window.scrollY > 40) header.classList.add('scrolled');
    else header.classList.remove('scrolled');
  }
  window.addEventListener('scroll', onScroll, { passive:true });
  onScroll();

  /* ---------- hero video sound toggle ---------- */
  var heroVideo = document.getElementById('heroVideo');
  var soundToggle = document.getElementById('soundToggle');
  if (heroVideo && soundToggle){
    soundToggle.classList.add('is-muted');
    soundToggle.addEventListener('click', function(){
      heroVideo.muted = !heroVideo.muted;
      soundToggle.classList.toggle('is-muted', heroVideo.muted);
      soundToggle.setAttribute('aria-label', heroVideo.muted ? 'เปิดเสียง' : 'ปิดเสียง');
    });
  }

  /* ---------- scroll reveal ---------- */
  var revealEls = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window){
    var io = new IntersectionObserver(function(entries){
      entries.forEach(function(entry){
        if (entry.isIntersecting){
          entry.target.classList.add('is-visible');
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15, rootMargin: '0px 0px -40px 0px' });
    revealEls.forEach(function(el){ io.observe(el); });
    // safety net: if something prevents the observer from firing, don't leave content hidden forever
    setTimeout(function(){
      revealEls.forEach(function(el){ el.classList.add('is-visible'); });
    }, 4000);
  } else {
    revealEls.forEach(function(el){ el.classList.add('is-visible'); });
  }

  /* ---------- gallery data ---------- */
  function buildGallery(folder, count, labelPrefix){
    var imgs = [];
    for (var i = 1; i <= count; i++){
      var n = String(i).padStart(2, '0');
      imgs.push({
        src: 'assets/activities/' + folder + '/full/' + folder + n + '.jpg',
        caption: labelPrefix + ' — ภาพที่ ' + i + ' / ' + count
      });
    }
    return imgs;
  }

  var galleries = {
    flood:   buildGallery('flood', 7, 'บริจาคช่วยเหลือผู้ประสบอุทกภัยภาคใต้ 2568'),
    seminar: buildGallery('seminar', 17, 'สัมมนาประจำปี 2568'),
    sport:   buildGallery('sport', 20, 'PPO Sport Day 2568')
  };

  /* ---------- lightbox ---------- */
  var lightbox = document.getElementById('lightbox');
  var lbImage = document.getElementById('lbImage');
  var lbCaption = document.getElementById('lbCaption');
  var lbClose = document.getElementById('lbClose');
  var lbPrev = document.getElementById('lbPrev');
  var lbNext = document.getElementById('lbNext');

  var currentGallery = [];
  var currentIndex = 0;
  var lastFocused = null;

  function showImage(index){
    if (!currentGallery.length) return;
    currentIndex = (index + currentGallery.length) % currentGallery.length;
    var item = currentGallery[currentIndex];
    lbImage.classList.remove('show');
    var preload = new Image();
    preload.onload = function(){
      lbImage.src = item.src;
      lbImage.alt = item.caption;
      lbCaption.textContent = item.caption;
      requestAnimationFrame(function(){ lbImage.classList.add('show'); });
    };
    preload.src = item.src;
  }

  function openGallery(key, startIndex){
    if (!galleries[key]) return;
    currentGallery = galleries[key];
    lastFocused = document.activeElement;
    showImage(startIndex || 0);
    lightbox.classList.add('open');
    document.body.style.overflow = 'hidden';
    lbClose.focus();
  }

  function closeLightbox(){
    lightbox.classList.remove('open');
    document.body.style.overflow = '';
    lbImage.classList.remove('show');
    if (lastFocused && typeof lastFocused.focus === 'function') lastFocused.focus();
  }

  document.querySelectorAll('.gallery-trigger').forEach(function(el){
    el.addEventListener('click', function(){
      var key = el.getAttribute('data-gallery');
      var idx = parseInt(el.getAttribute('data-index'), 10) || 0;
      openGallery(key, idx);
    });
  });

  lbClose.addEventListener('click', closeLightbox);
  lbPrev.addEventListener('click', function(){ showImage(currentIndex - 1); });
  lbNext.addEventListener('click', function(){ showImage(currentIndex + 1); });

  lightbox.addEventListener('click', function(e){
    if (e.target === lightbox) closeLightbox();
  });

  document.addEventListener('keydown', function(e){
    if (!lightbox.classList.contains('open')) return;
    if (e.key === 'Escape') closeLightbox();
    if (e.key === 'ArrowLeft') showImage(currentIndex - 1);
    if (e.key === 'ArrowRight') showImage(currentIndex + 1);
  });

  /* basic swipe support for touch devices */
  var touchStartX = null;
  lightbox.addEventListener('touchstart', function(e){ touchStartX = e.touches[0].clientX; }, { passive:true });
  lightbox.addEventListener('touchend', function(e){
    if (touchStartX === null) return;
    var dx = e.changedTouches[0].clientX - touchStartX;
    if (Math.abs(dx) > 40){ dx > 0 ? showImage(currentIndex - 1) : showImage(currentIndex + 1); }
    touchStartX = null;
  }, { passive:true });

})();