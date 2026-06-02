// ═══════════════════════════════════════════════════════════
// 🎂 PREMIUM ROMANTIC BIRTHDAY WEBSITE - MAIN SCRIPT
// ═══════════════════════════════════════════════════════════

const App = (() => {
  // ─── STATE ──────────────────────────────────────────────
  const screens = [
    'screen-welcome',
    'screen-password',
    'screen-polaroid',
    'screen-wish',
    'screen-gallery',
    'screen-letter',
    'screen-gift',
    'screen-final',
  ];

  let currentScreen = 0;
  let passwordInput = '';
  let musicPlaying = false;
  let typewriterInterval = null;
  let slideshowInterval = null;
  let fireworksInterval = null;
  let heartsInterval = null;

  const bgMusic = () => document.getElementById('bg-music');

  function handleImageError(img) {
    img.onerror = null;
    img.style.display = 'none';
    const placeholder = document.createElement('div');
    placeholder.style.cssText = 'width:100%;height:100%;display:flex;align-items:center;justify-content:center;background:linear-gradient(135deg,#1a0a14,#2d0a1e,#0a0a0a);color:#D4AF37;font-family:Georgia,serif;font-size:0.9rem;text-align:center;padding:1rem;';
    placeholder.textContent = 'Add photo here';
    img.parentNode.appendChild(placeholder);
  }

  function setupImageFallbacks() {
    document.querySelectorAll('img').forEach((img) => {
      img.onerror = function () { handleImageError(this); };
    });
  }

  // ─── INITIALIZATION ─────────────────────────────────────
  function init() {
    // Set music source
    const musicSource = document.getElementById('music-source');
    musicSource.src = CONFIG.backgroundMusic;
    bgMusic().load();

    // Apply config to DOM
    document.getElementById('polaroid-photo').src = CONFIG.photos.polaroid;
    document.getElementById('polaroid-caption-text').textContent = CONFIG.messages.polaroidCaption;
    document.getElementById('final-title').textContent = CONFIG.messages.finalMessage;
    document.getElementById('final-name').textContent = CONFIG.fullName;
    document.getElementById('footer-text').textContent = CONFIG.messages.madeWithLove;

    // Build gallery
    buildGallery();

    // Build slideshow
    buildSlideshow();

    // Setup image fallbacks
    setupImageFallbacks();

    // Start preloader sequence
    runPreloader();
  }

  // ─── PRELOADER ──────────────────────────────────────────
  function runPreloader() {
    const preloader = document.getElementById('preloader');
    setTimeout(() => {
      gsap.to(preloader, {
        opacity: 0,
        duration: 0.8,
        onComplete: () => {
          preloader.style.display = 'none';
          startWelcomeScreen();
        },
      });
    }, 3000);
  }

  // ─── SCREEN 1: WELCOME ─────────────────────────────────
  function startWelcomeScreen() {
    showScreen('screen-welcome');
    const textEl = document.getElementById('welcome-text');
    const text = CONFIG.messages.welcome;

    // Split into chars and animate with GSAP
    textEl.innerHTML = '';
    textEl.style.opacity = '1';
    text.split('').forEach((char) => {
      const span = document.createElement('span');
      span.className = 'char';
      span.textContent = char === ' ' ? '\u00A0' : char;
      textEl.appendChild(span);
    });

    gsap.to('.welcome-text .char', {
      opacity: 1,
      y: 0,
      duration: 0.05,
      stagger: 0.04,
      ease: 'power2.out',
      delay: 0.5,
      onStart: function () {
        gsap.set('.welcome-text .char', { y: 20 });
      },
    });

    // Auto-advance after text animation
    setTimeout(() => {
      gsap.to('.welcome-text', {
        opacity: 0,
        duration: 1,
        onComplete: () => {
          nextScreen();
        },
      });
    }, text.length * 40 + 3500);
  }

  // ─── SCREEN NAVIGATION ─────────────────────────────────
  function showScreen(screenId) {
    screens.forEach((id) => {
      const el = document.getElementById(id);
      el.classList.remove('active');
    });
    const target = document.getElementById(screenId);
    target.classList.add('active');
  }

  function nextScreen() {
    currentScreen++;
    if (currentScreen >= screens.length) return;

    const nextId = screens[currentScreen];

    // Fade out current
    const currentEl = document.querySelector('.screen.active');
    if (currentEl) {
      gsap.to(currentEl, {
        opacity: 0,
        duration: 0.6,
        onComplete: () => {
          currentEl.classList.remove('active');
          showScreen(nextId);
          gsap.fromTo(
            document.getElementById(nextId),
            { opacity: 0 },
            { opacity: 1, duration: 0.8 }
          );
          onScreenEnter(nextId);
        },
      });
    }
  }

  function onScreenEnter(screenId) {
    switch (screenId) {
      case 'screen-polaroid':
        animatePolaroid();
        createParticles('particles-polaroid');
        break;
      case 'screen-wish':
        animateWish();
        startFloatingHearts('hearts-wish');
        break;
      case 'screen-gallery':
        animateGallery();
        break;
      case 'screen-letter':
        startTypewriter();
        break;
      case 'screen-gift':
        // gift is static, user clicks it
        break;
      case 'screen-final':
        animateFinal();
        startFloatingHearts('hearts-final');
        startFireworks();
        startSlideshow();
        break;
    }
  }

  // ─── SCREEN 2: PASSWORD ─────────────────────────────────
  function initKeypad() {
    document.querySelectorAll('.key').forEach((key) => {
      key.addEventListener('click', handleKeyPress);
    });
  }

  function handleKeyPress(e) {
    const value = e.currentTarget.dataset.key;
    const display = document.getElementById('password-display');
    const errorEl = document.getElementById('password-error');
    const container = document.querySelector('.password-container');

    if (value === 'clear') {
      passwordInput = '';
    } else if (value === 'delete') {
      passwordInput = passwordInput.slice(0, -1);
    } else if (passwordInput.length < CONFIG.password.length) {
      passwordInput += value;
    }

    // Update dots
    const dots = display.querySelectorAll('.dot');
    dots.forEach((dot, i) => {
      dot.classList.toggle('filled', i < passwordInput.length);
    });

    // Check password
    if (passwordInput.length === CONFIG.password.length) {
      if (passwordInput === CONFIG.password) {
        // Success - auto-play music
        errorEl.classList.remove('show');
        playMusic();
        gsap.to(container, {
          scale: 1.05,
          duration: 0.2,
          yoyo: true,
          repeat: 1,
          onComplete: () => {
            setTimeout(() => nextScreen(), 400);
          },
        });
      } else {
        // Wrong password
        errorEl.classList.add('show');
        container.classList.add('shake');
        setTimeout(() => {
          container.classList.remove('shake');
          passwordInput = '';
          dots.forEach((dot) => dot.classList.remove('filled'));
          errorEl.classList.remove('show');
        }, 800);
      }
    }
  }

  // ─── SCREEN 3: POLAROID ─────────────────────────────────
  function animatePolaroid() {
    gsap.fromTo(
      '.polaroid-card',
      { opacity: 0, rotation: -8, scale: 0.7, y: 50 },
      {
        opacity: 1,
        rotation: -3,
        scale: 1,
        y: 0,
        duration: 1.2,
        ease: 'back.out(1.2)',
      }
    );
  }

  function createParticles(containerId) {
    const container = document.getElementById(containerId);
    container.innerHTML = '';
    for (let i = 0; i < 30; i++) {
      const particle = document.createElement('div');
      particle.className = 'particle';
      particle.style.left = Math.random() * 100 + '%';
      particle.style.animationDelay = Math.random() * 6 + 's';
      particle.style.animationDuration = 4 + Math.random() * 4 + 's';
      const size = 2 + Math.random() * 5;
      particle.style.width = size + 'px';
      particle.style.height = size + 'px';

      const colors = ['#ff4d6d', '#D4AF37', '#C41E3A', '#ff8fa3', '#fff'];
      particle.style.background = colors[Math.floor(Math.random() * colors.length)];

      container.appendChild(particle);
    }
  }

  // ─── SCREEN 4: BIRTHDAY WISH ───────────────────────────
  function animateWish() {
    const text = CONFIG.messages.birthdayWish;
    const el = document.getElementById('wish-text');
    el.textContent = '';

    const chars = text.split('');
    chars.forEach((char) => {
      const span = document.createElement('span');
      span.textContent = char === ' ' ? '\u00A0' : char;
      span.style.display = 'inline-block';
      span.style.opacity = '0';
      el.appendChild(span);
    });

    gsap.to('#wish-text span', {
      opacity: 1,
      scale: 1,
      duration: 0.4,
      stagger: 0.06,
      ease: 'back.out(1.5)',
      delay: 0.3,
    });

    gsap.set('#wish-text span', { scale: 0.5, y: 20 });
  }

  function startFloatingHearts(containerId) {
    if (heartsInterval) clearInterval(heartsInterval);
    const container = document.getElementById(containerId);
    container.innerHTML = '';

    const heartEmojis = ['❤️', '💕', '💖', '💗', '💓', '💘', '🌹', '✨'];

    function spawnHeart() {
      const heart = document.createElement('div');
      heart.className = 'floating-heart';
      heart.textContent = heartEmojis[Math.floor(Math.random() * heartEmojis.length)];
      heart.style.left = Math.random() * 100 + '%';
      heart.style.fontSize = 0.8 + Math.random() * 1.5 + 'rem';
      heart.style.animationDuration = 5 + Math.random() * 6 + 's';
      heart.style.animationDelay = Math.random() * 0.5 + 's';
      container.appendChild(heart);

      setTimeout(() => heart.remove(), 12000);
    }

    // Spawn initial batch
    for (let i = 0; i < 8; i++) {
      setTimeout(spawnHeart, i * 300);
    }

    heartsInterval = setInterval(spawnHeart, 800);
  }

  // ─── MUSIC CONTROLS ────────────────────────────────────
  function playMusic() {
    const music = bgMusic();
    music.volume = 0.5;
    music.play().then(() => {
      musicPlaying = true;
      updateMusicUI();
    }).catch(() => {});
  }

  function toggleMusic() {
    const music = bgMusic();
    if (musicPlaying) {
      music.pause();
      musicPlaying = false;
    } else {
      music.play().catch(() => {});
      musicPlaying = true;
    }
    updateMusicUI();
  }

  function updateMusicUI() {
    const label = document.getElementById('music-label');
    const floatingBtn = document.getElementById('floating-music-btn');
    const floatingLabel = document.getElementById('floating-music-label');
    if (musicPlaying) {
      if (label) label.textContent = 'Pause Music';
      if (floatingBtn) floatingBtn.classList.add('playing');
      if (floatingLabel) floatingLabel.textContent = '⏸';
    } else {
      if (label) label.textContent = 'Play Music';
      if (floatingBtn) floatingBtn.classList.remove('playing');
      if (floatingLabel) floatingLabel.textContent = '♪';
    }
  }

  function setVolume(val) {
    bgMusic().volume = val / 100;
  }

  // ─── SCREEN 5: GALLERY ─────────────────────────────────
  function buildGallery() {
    const grid = document.getElementById('gallery-grid');
    grid.innerHTML = '';
    CONFIG.photos.gallery.forEach((src, i) => {
      const card = document.createElement('div');
      card.className = 'gallery-card';
      card.style.setProperty('--rot', (Math.random() * 6 - 3).toFixed(1) + 'deg');

      const img = document.createElement('img');
      img.className = 'gallery-card-img';
      img.src = src;
      img.alt = 'Memory ' + (i + 1);
      img.loading = 'lazy';

      const caption = document.createElement('p');
      caption.className = 'gallery-card-caption';
      caption.textContent = CONFIG.galleryCaptions[i] || 'Beautiful moment ✨';

      card.appendChild(img);
      card.appendChild(caption);
      grid.appendChild(card);
    });
  }

  function animateGallery() {
    gsap.fromTo(
      '.gallery-card',
      { opacity: 0, y: 60, scale: 0.8 },
      {
        opacity: 1,
        y: 0,
        scale: 1,
        duration: 0.7,
        stagger: 0.15,
        ease: 'back.out(1.2)',
        delay: 0.2,
      }
    );
  }

  // ─── SCREEN 6: LOVE LETTER (TYPEWRITER) ─────────────────
  function startTypewriter() {
    const el = document.getElementById('letter-content');
    const text = CONFIG.messages.loveLetter;
    el.textContent = '';
    let i = 0;

    if (typewriterInterval) clearInterval(typewriterInterval);

    typewriterInterval = setInterval(() => {
      if (i < text.length) {
        el.textContent += text[i];
        i++;
        // Auto-scroll
        const scroll = document.getElementById('letter-scroll');
        scroll.scrollTop = scroll.scrollHeight;
      } else {
        clearInterval(typewriterInterval);
        typewriterInterval = null;
      }
    }, 35);
  }

  // ─── SCREEN 7: GIFT ────────────────────────────────────
  function openGift() {
    const box = document.getElementById('gift-box');
    if (box.classList.contains('opened')) return;

    box.classList.add('opened');

    // Confetti explosion
    setTimeout(() => {
      const duration = 3000;
      const end = Date.now() + duration;

      const interval = setInterval(() => {
        if (Date.now() > end) {
          clearInterval(interval);
          return;
        }

        confetti({
          particleCount: 80,
          spread: 100,
          origin: { y: 0.6 },
          colors: ['#ff4d6d', '#D4AF37', '#C41E3A', '#ff8fa3', '#8B0000', '#fff'],
          startVelocity: 35,
          gravity: 0.8,
          ticks: 200,
          scalar: 1.1,
        });
      }, 250);
    }, 300);

    // Show message
    setTimeout(() => {
      const msg = document.getElementById('gift-message');
      document.getElementById('gift-message-text').textContent = CONFIG.messages.giftMessage;
      msg.classList.add('show');
    }, 1200);
  }

  // ─── SCREEN 8: FINAL ───────────────────────────────────
  function animateFinal() {
    gsap.fromTo(
      '.final-title',
      { opacity: 0, scale: 0.5, y: 30 },
      { opacity: 1, scale: 1, y: 0, duration: 1.2, ease: 'back.out(1.5)', delay: 0.3 }
    );

    gsap.fromTo(
      '.final-name',
      { opacity: 0, y: 20 },
      { opacity: 1, y: 0, duration: 0.8, delay: 1 }
    );

    gsap.fromTo(
      '.slideshow-container',
      { opacity: 0, scale: 0.9 },
      { opacity: 1, scale: 1, duration: 0.8, delay: 1.4 }
    );

    gsap.fromTo(
      '.footer-love',
      { opacity: 0 },
      { opacity: 1, duration: 1, delay: 2 }
    );
  }

  function buildSlideshow() {
    const track = document.getElementById('slideshow-track');
    track.innerHTML = '';
    CONFIG.photos.slideshow.forEach((src) => {
      const img = document.createElement('img');
      img.src = src;
      img.alt = 'Slideshow photo';
      img.loading = 'lazy';
      track.appendChild(img);
    });
  }

  function startSlideshow() {
    const track = document.getElementById('slideshow-track');
    const images = track.querySelectorAll('img');
    if (images.length === 0) return;

    let current = 0;
    const container = document.getElementById('slideshow');
    const w = container.offsetWidth;

    // Set track width
    track.style.width = images.length * 100 + '%';
    images.forEach((img) => {
      img.style.width = 100 / images.length + '%';
    });

    slideshowInterval = setInterval(() => {
      current = (current + 1) % images.length;
      gsap.to(track, {
        x: -current * w,
        duration: 1,
        ease: 'power2.inOut',
      });
    }, 3500);
  }

  function startFireworks() {
    const canvas = document.getElementById('fireworks-canvas');
    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const particles = [];

    function createBurst() {
      const x = Math.random() * canvas.width;
      const y = Math.random() * canvas.height * 0.5;
      const colors = ['#ff4d6d', '#D4AF37', '#C41E3A', '#ff8fa3', '#fff', '#8B0000'];
      const color = colors[Math.floor(Math.random() * colors.length)];

      for (let i = 0; i < 40; i++) {
        const angle = (Math.PI * 2 * i) / 40;
        const speed = 1 + Math.random() * 3;
        particles.push({
          x,
          y,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          alpha: 1,
          color,
          size: 1.5 + Math.random() * 1.5,
          decay: 0.012 + Math.random() * 0.01,
        });
      }
    }

    function animate() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.03; // gravity
        p.alpha -= p.decay;

        if (p.alpha <= 0) {
          particles.splice(i, 1);
          continue;
        }

        ctx.save();
        ctx.globalAlpha = p.alpha;
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }

      requestAnimationFrame(animate);
    }

    animate();

    // Periodic bursts
    fireworksInterval = setInterval(createBurst, 1200);
    createBurst(); // initial burst

    // Resize handler
    window.addEventListener('resize', () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    });
  }

  // ─── STARTUP ────────────────────────────────────────────
  document.addEventListener('DOMContentLoaded', () => {
    initKeypad();
    init();
  });

  // ─── PUBLIC API ─────────────────────────────────────────
  return {
    nextScreen,
    toggleMusic,
    setVolume,
    openGift,
  };
})();
