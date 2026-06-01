/* ============================================================
   portfilioJS.js — clean rewrite
   All fixes applied:
   - Single DOMContentLoaded listener
   - Single scroll-to-top (on window load only)
   - All scroll handlers throttled with requestAnimationFrame
   - Duplicate smooth scroll removed
   - Element.prototype extension removed
   - setInterval for typing removed (IntersectionObserver handles it)
   - All features preserved
   ============================================================ */

// ============================================================
// SCROLL TO TOP — once, on load
// ============================================================
window.addEventListener('load', () => {
  window.scrollTo(0, 0);
  if (window.location.hash) {
    history.replaceState(null, null, ' ');
  }
});

window.addEventListener('pageshow', (e) => {
  if (e.persisted) window.scrollTo(0, 0);
});

// ============================================================
// SINGLE DOMContentLoaded — all setup runs here
// ============================================================
document.addEventListener('DOMContentLoaded', function () {

  // ----------------------------------------------------------
  // 1. HAMBURGER MENU
  // ----------------------------------------------------------
  const hamburger = document.getElementById('hamburger');
  const navMenu   = document.querySelector('nav ul');
  const navLinks  = document.querySelectorAll('.nav-link');

  function toggleMenu(force) {
    const open = typeof force === 'boolean' ? force : !navMenu.classList.contains('active');
    hamburger.classList.toggle('active', open);
    navMenu.classList.toggle('active', open);
    document.body.classList.toggle('no-scroll', open);
    hamburger.setAttribute('aria-expanded', String(open));
  }

  hamburger.addEventListener('click', (e) => {
    e.stopPropagation();
    toggleMenu();
  });

  navLinks.forEach(link => {
    link.addEventListener('click', () => {
      if (window.innerWidth <= 900) toggleMenu(false);
    });
  });

  document.addEventListener('click', (e) => {
    if (navMenu.classList.contains('active') &&
        !navMenu.contains(e.target) &&
        !hamburger.contains(e.target)) {
      toggleMenu(false);
    }
  });

  document.addEventListener('touchstart', (e) => {
    if (navMenu.classList.contains('active') &&
        !navMenu.contains(e.target) &&
        !hamburger.contains(e.target)) {
      toggleMenu(false);
    }
  }, { passive: true });

  window.addEventListener('resize', () => {
    if (window.innerWidth > 900) {
      toggleMenu(false);
      hamburger.style.display = 'none';
    } else {
      hamburger.style.display = 'flex';
    }
  });

  // Initial state
  hamburger.style.display = window.innerWidth <= 900 ? 'flex' : 'none';


  // ----------------------------------------------------------
  // 2. SMOOTH SCROLL (single implementation, no prototype ext)
  // ----------------------------------------------------------
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      e.preventDefault();
      const targetId = this.getAttribute('href');
      if (targetId === '#') return;

      if (window.innerWidth <= 768) toggleMenu(false);

      if (targetId === '#home') {
        window.scrollTo({ top: 0, behavior: 'smooth' });
        return;
      }

      const target = document.querySelector(targetId);
      if (target) {
        window.scrollTo({
          top: target.offsetTop - 80,
          behavior: 'smooth'
        });
      }
    });
  });


  // ----------------------------------------------------------
  // 3. THEME TOGGLE
  // ----------------------------------------------------------
  const themeToggle = document.getElementById('theme-toggle');
  const themeIcon   = themeToggle.querySelector('i');

  const savedTheme = localStorage.getItem('theme') ||
    (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');

  function applyTheme(theme) {
    const isLight = theme === 'light';
    document.body.classList.toggle('light-mode', isLight);
    themeIcon.className = isLight ? 'fas fa-sun' : 'fas fa-moon';
  }

  applyTheme(savedTheme);

  themeToggle.addEventListener('click', () => {
    const isLight = document.body.classList.contains('light-mode');
    const next = isLight ? 'dark' : 'light';
    localStorage.setItem('theme', next);
    applyTheme(next);
  });


  // ----------------------------------------------------------
  // 4. ACTIVE NAV LINK via IntersectionObserver
  // ----------------------------------------------------------
  const sectionMap = { home: 'home', AB: 'about', MS: 'skills', PR: 'projects', JY: 'journey', CX: 'contact' };

  function setActiveLink(sectionId) {
    navLinks.forEach(l => l.classList.remove('active'));
    const val = sectionMap[sectionId];
    if (val) {
      const link = document.querySelector(`.nav-link[data-section="${val}"]`);
      if (link) link.classList.add('active');
    }
  }

  const navObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) setActiveLink(entry.target.id);
    });
  }, { rootMargin: '0px 0px -50% 0px', threshold: 0.2 });

  document.querySelectorAll('section[id], header[id]').forEach(el => {
    if (sectionMap[el.id]) navObserver.observe(el);
  });

  navLinks.forEach(link => {
    link.addEventListener('click', function () {
      navLinks.forEach(l => l.classList.remove('active'));
      this.classList.add('active');
    });
  });

  // Highlight home on load if at top
  if (window.scrollY < 100) setActiveLink('home');

  // Re-check home on scroll (throttled)
  let navScrollPending = false;
  window.addEventListener('scroll', () => {
    if (!navScrollPending) {
      navScrollPending = true;
      requestAnimationFrame(() => {
        if (window.scrollY < 100) setActiveLink('home');
        navScrollPending = false;
      });
    }
  }, { passive: true });


  // ----------------------------------------------------------
  // 5. SKILL PROGRESS BAR ANIMATION
  // ----------------------------------------------------------
  const skills = document.querySelectorAll('.skill');

  skills.forEach(skill => {
    const bar = skill.querySelector('progress');
    if (bar) {
      bar.setAttribute('data-value', bar.value);
      bar.value = 0;
    }
  });

  const skillObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      const bar = entry.target.querySelector('progress');
      if (!bar) return;
      if (entry.isIntersecting) {
        const target = bar.getAttribute('data-value');
        bar.value = 0;
        setTimeout(() => { bar.value = target; }, 100);
      } else {
        bar.value = 0;
      }
    });
  }, { threshold: 0.5 });

  skills.forEach(s => skillObserver.observe(s));


  // ----------------------------------------------------------
  // 6. STAT COUNTER ANIMATION
  // ----------------------------------------------------------
  const statsSection = document.querySelector('.stats-section');

  function animateCounters() {
    document.querySelectorAll('.stat-number').forEach(counter => {
      const target = +counter.getAttribute('data-target');
      counter.textContent = '0';
      let count = 0;
      const increment = Math.ceil(target / 60);

      function tick() {
        count = Math.min(count + increment, target);
        counter.textContent = count;
        if (count < target) requestAnimationFrame(tick);
      }
      requestAnimationFrame(tick);
    });
  }

  if (statsSection) {
    new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting) animateCounters();
    }, { threshold: 0.5 }).observe(statsSection);
  }


  // ----------------------------------------------------------
  // 7. TIMELINE SCROLL REVEAL (throttled)
  // ----------------------------------------------------------
  const timelineItems = document.querySelectorAll('.timeline-item');

  const timelineObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) entry.target.classList.add('show');
    });
  }, { threshold: 0.15 });

  timelineItems.forEach(item => timelineObserver.observe(item));


  // ----------------------------------------------------------
  // 8. CONTACT FORM ANIMATION
  // ----------------------------------------------------------
  const formGroups = document.querySelectorAll('.form-group');

  const formObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry, i) => {
      if (entry.isIntersecting) {
        setTimeout(() => entry.target.classList.add('in-view'), i * 150);
      }
    });
  }, { threshold: 0.3 });

  formGroups.forEach(g => formObserver.observe(g));


  // ----------------------------------------------------------
  // 9. CONTACT FORM SUBMISSION
  // ----------------------------------------------------------
  const contactForm = document.getElementById('contactForm');
  const submitBtn   = contactForm ? contactForm.querySelector('.submit-btn') : null;

  if (contactForm && submitBtn) {
    contactForm.addEventListener('submit', function (e) {
      // Only intercept if no real action is set (placeholder ID)
      if (this.action.includes('YOUR_FORM_ID')) {
        e.preventDefault();

        let isValid = true;
        const inputs = this.querySelectorAll('input, textarea');

        inputs.forEach(input => {
          if (input.hasAttribute('required') && !input.value.trim()) {
            isValid = false;
            input.style.borderColor = '#ff3860';
          } else {
            input.style.borderColor = '';
          }
        });

        if (!isValid) {
          submitBtn.textContent = 'Please fill all fields!';
          submitBtn.style.background = 'linear-gradient(135deg, #ff3860, #ff3860)';
          setTimeout(() => {
            submitBtn.textContent = 'Send Message';
            submitBtn.style.background = '';
          }, 2000);
          return;
        }

        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sending...';
        submitBtn.style.opacity = '0.8';

        setTimeout(() => {
          submitBtn.innerHTML = 'Message Sent! <i class="fas fa-check"></i>';
          submitBtn.style.background = 'linear-gradient(135deg, #00c853, #64dd17)';
          inputs.forEach(input => { input.value = ''; });

          setTimeout(() => {
            submitBtn.textContent = 'Send Message';
            submitBtn.style.background = '';
            submitBtn.style.opacity = '1';
          }, 3000);
        }, 1500);
      }
      // If a real Formspree ID is set, the form submits normally
    });
  }


  // ----------------------------------------------------------
  // 10. CAROUSEL
  // ----------------------------------------------------------
 window.demoAlert = function(type) {
  alert(type === 'demo' ? '✨ Live demo coming soon!' : '📁 GitHub repo coming soon!');
  return false;
};

function initCarousel(trackId, leftId, rightId, dotsContainerId) {
  const track = document.getElementById(trackId);
  const left  = document.getElementById(leftId);
  const right = document.getElementById(rightId);
  const dots  = document.querySelectorAll(`#${dotsContainerId} .dot`);
  const cards = track ? track.querySelectorAll('.project-card') : [];

  if (!track || !left || !right || !cards.length) return;

  /* key fix — measure the actual rendered card width + gap */
  function getScrollStep() {
    const card = cards[0];
    const gap  = parseFloat(getComputedStyle(track).gap) || 28.8;
    return card.offsetWidth + gap;
  }

  left.addEventListener('click',  () => track.scrollBy({ left: -getScrollStep(), behavior: 'smooth' }));
  right.addEventListener('click', () => track.scrollBy({ left:  getScrollStep(), behavior: 'smooth' }));

  /* key fix — index from card width, not scroll ratio */
  function updateDots() {
    if (!dots.length) return;
    const step = getScrollStep();
    const idx  = Math.round(track.scrollLeft / step);
    dots.forEach((d, i) => d.classList.toggle('active', i === idx));
  }

  let pending = false;
  track.addEventListener('scroll', () => {
    if (!pending) {
      pending = true;
      requestAnimationFrame(() => { updateDots(); pending = false; });
    }
  }, { passive: true });

  /* dot click — scroll exactly to card position */
  dots.forEach((dot, idx) => {
    dot.addEventListener('click', () => {
      const step = getScrollStep();
      track.scrollTo({ left: idx * step, behavior: 'smooth' });
    });
  });

  window.addEventListener('resize', () => {
    updateDots();
  });

  setTimeout(updateDots, 100);
}

/* keyboard follows whichever carousel was last scrolled */
let activeTrack = document.getElementById('carouselTrack');
['carouselTrack', 'carouselTrack2'].forEach(id => {
  const t = document.getElementById(id);
  if (t) t.addEventListener('scroll', () => { activeTrack = t; }, { passive: true });
});

window.addEventListener('keydown', (e) => {
  if (!activeTrack) return;
  const card = activeTrack.querySelector('.project-card');
  if (!card) return;
  const step = card.offsetWidth + (parseFloat(getComputedStyle(activeTrack).gap) || 28.8);
  if (e.key === 'ArrowLeft')  activeTrack.scrollBy({ left: -step, behavior: 'smooth' });
  if (e.key === 'ArrowRight') activeTrack.scrollBy({ left:  step, behavior: 'smooth' });
});

initCarousel('carouselTrack',  'arrowLeft',  'arrowRight',  'indicatorDots');
initCarousel('carouselTrack2', 'arrowLeft2', 'arrowRight2', 'indicatorDots2');
  // ----------------------------------------------------------
  // 11. CODE EDITOR TYPEWRITER
  //     Runs once on load, restarts via IntersectionObserver
  // ----------------------------------------------------------
  const editorContent = document.getElementById('editorContent');

  if (editorContent) {
    const lines         = editorContent.querySelectorAll('.code-line');
    const originalLines = Array.from(lines).map(l => l.innerHTML);
    const CHAR_SPEED    = 5;   // ms per character
    const LINE_PAUSE    = 25;  // ms between lines
    const FADE_PAUSE    = 2000; // ms before fade-out starts
    const FADE_STEP     = 50;  // ms per line fade-out

    let animating = false;

    function resetLines() {
      lines.forEach(l => { l.innerHTML = ''; l.style.opacity = '0'; });
    }

    function typeAll() {
      if (animating) return;
      animating = true;
      resetLines();

      let lineIdx = 0;

      function typeLine() {
        if (lineIdx >= lines.length) {
          setTimeout(fadeOut, FADE_PAUSE);
          return;
        }
        const el      = lines[lineIdx];
        const content = originalLines[lineIdx];
        let charIdx   = 0;
        el.style.opacity = '1';

        function typeChar() {
          if (charIdx < content.length) {
            el.innerHTML = content.substring(0, charIdx + 1);
            charIdx++;
            setTimeout(typeChar, CHAR_SPEED);
          } else {
            el.innerHTML = content;
            lineIdx++;
            setTimeout(typeLine, LINE_PAUSE);
          }
        }
        typeChar();
      }

      function fadeOut() {
        let idx = 0;
        function fadeNext() {
          if (idx >= lines.length) {
            animating = false;
            setTimeout(typeAll, 500);
            return;
          }
          lines[idx].style.opacity = '0';
          idx++;
          setTimeout(fadeNext, FADE_STEP);
        }
        fadeNext();
      }

      typeLine();
    }

    // Start when editor is visible, stop wasting cycles when off-screen
    new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting && !animating) typeAll();
    }, { threshold: 0.5 }).observe(editorContent);

    // Kick off on load too
    setTimeout(typeAll, 800);
  }


  // ----------------------------------------------------------
  // 12. NAME BOUNCE ANIMATION reset on scroll back to header
  // ----------------------------------------------------------
  const nameEl = document.querySelector('.name-animation');
  const homeEl = document.getElementById('home');

  if (nameEl && homeEl) {
    new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting) {
        nameEl.style.animation = 'none';
        void nameEl.offsetWidth; // reflow
        nameEl.style.animation = 'bounceIn 1.2s ease forwards';
      }
    }, { threshold: 0.5 }).observe(homeEl);
  }


  // ----------------------------------------------------------
  // 13. SPLASH SCREEN cleanup
  // ----------------------------------------------------------
  setTimeout(() => {
    document.body.classList.add('loaded');
  }, 3000);

// ----------------------------------------------------------
  // 14. STORY VIEWER
  // ----------------------------------------------------------
  const storySlides = [
    {
      type: 'image',
      src: 'images/selfie.png',
      caption: '✨ Welcome to my story! Tap right →',
      duration: 4800
    },
    {
      type: 'text',
      icon: 'fas fa-laptop-code',
      title: '💻 System Development Student',
      body: 'Building interactive experiences with HTML, CSS, JavaScript and Java. Based in Gauteng, open to opportunities.',
      tags: ['HTML/CSS', 'JavaScript', 'Java', 'SQL'],
      bg: 'linear-gradient(125deg, #0b0719, #1e133a)',
      caption: '🚀 Passion for clean code',
      duration: 5500
    },
    {
      type: 'image',
      src: 'images/steps.png', /* replace with a different photo */
      caption: '📸 Behind the scenes — learning every day',
      duration: 5000
    },
    {
      type: 'text',
      icon: 'fas fa-certificate',
      title: '📜 Certifications & Milestones',
      body: 'Currently working toward my first certification. Always expanding my toolkit.',
      tags: ['In Progress', 'Java Dev', 'System Design'],
      bg: 'linear-gradient(145deg, #0f0f25, #231b48)',
      caption: '🎯 Certifications coming soon',
      duration: 5800
    },
    {
      type: 'text',
      icon: 'fas fa-handshake',
      title: "🤝 Let's Collaborate",
      body: 'Open for internships, junior developer roles, and meaningful projects. Let\'s build something great.',
      tags: ['Open to work', 'Gauteng', 'Remote OK'],
      bg: 'radial-gradient(circle at 30% 10%, #15102e, #090511)',
      caption: '📬 bompetshitony@gmail.com',
      duration: 6000
    }
  ];

  const storyOverlay   = document.getElementById('storyOverlay');
  const storyRing      = document.getElementById('storyRing');
  const storyCloseBtn  = document.getElementById('storyClose');
  const storyContent   = document.getElementById('storyContent');
  const storyProgress  = document.getElementById('storyProgress');
  const storyCaptionEl = document.getElementById('storyCaption');
  const storyTapLeft   = document.getElementById('storyTapLeft');
  const storyTapRight  = document.getElementById('storyTapRight');

  /* bail if story elements aren't in the DOM */
  if (storyOverlay && storyRing) {

    let currentIdx   = 0;
    let slideTimer   = null;
    let storyPaused  = false;
    let pauseStart   = 0;
    let currentFill  = null;
    let currentDur   = 5000;

    function buildProgress() {
      storyProgress.innerHTML = '';
      storySlides.forEach(() => {
        const bar  = document.createElement('div');
        bar.className = 'story-bar';
        const fill = document.createElement('div');
        fill.className = 'story-bar-fill';
        bar.appendChild(fill);
        storyProgress.appendChild(bar);
      });
    }

    function updateProgress(activeIdx) {
      const fills = storyProgress.querySelectorAll('.story-bar-fill');
      fills.forEach((fill, i) => {
        fill.style.animation = 'none';
        fill.classList.remove('animating', 'complete');
        if (i < activeIdx) {
          fill.classList.add('complete');
        } else if (i === activeIdx) {
          fill.style.setProperty('--duration', `${currentDur}ms`);
          /* force reflow so animation restarts cleanly */
          void fill.offsetWidth;
          fill.classList.add('animating');
          currentFill = fill;
        }
      });
    }

    function clearStoryTimer() {
      if (slideTimer) { clearTimeout(slideTimer); slideTimer = null; }
    }

    function renderSlide(index) {
      const s = storySlides[index];
      storyContent.innerHTML = '';

      if (s.type === 'image') {
        const img = document.createElement('img');
        img.src = s.src;
        img.className = 'story-slide active';
        img.alt = 'Story slide';
        storyContent.appendChild(img);
      } else {
        const div = document.createElement('div');
        div.className = 'story-text-slide active';
        div.style.background = s.bg || '#0a0a1a';
        div.innerHTML = `
          <i class="${s.icon} slide-icon"></i>
          <div class="slide-title">${s.title}</div>
          <div class="slide-body">${s.body}</div>
          <div class="slide-tags">
            ${s.tags.map(t => `<span class="slide-tag">${t}</span>`).join('')}
          </div>
        `;
        storyContent.appendChild(div);
      }

      storyCaptionEl.textContent = s.caption || '';
    }

    function startStoryTimer() {
      clearStoryTimer();
      currentDur = storySlides[currentIdx].duration || 5000;
      slideTimer = setTimeout(() => {
        if (!storyPaused) goToSlide(currentIdx + 1);
      }, currentDur);
    }

    function goToSlide(newIndex) {
      if (newIndex >= storySlides.length) { closeStory(); return; }
      if (newIndex < 0) newIndex = 0;
      currentIdx = newIndex;
      currentDur = storySlides[currentIdx].duration || 5000;
      renderSlide(currentIdx);
      updateProgress(currentIdx);
      clearStoryTimer();
      startStoryTimer();
    }

    function openStory() {
      currentIdx  = 0;
      storyPaused = false;
      storyOverlay.classList.add('open');
      document.body.classList.add('no-scroll');
      buildProgress();
      currentDur = storySlides[0].duration || 5000;
      renderSlide(0);
      updateProgress(0);
      startStoryTimer();
    }

    function closeStory() {
      clearStoryTimer();
      storyOverlay.classList.remove('open');
      document.body.classList.remove('no-scroll');
      storyPaused = false;
    }

    function pauseStory() {
      if (storyPaused) return;
      storyPaused = true;
      pauseStart  = Date.now();
      clearStoryTimer();
      if (currentFill) currentFill.style.animationPlayState = 'paused';
    }

    function resumeStory() {
      if (!storyPaused) return;
      const elapsed   = Date.now() - pauseStart;
      const remaining = Math.max(currentDur - elapsed, 300);
      storyPaused = false;
      if (currentFill) currentFill.style.animationPlayState = 'running';
      clearStoryTimer();
      slideTimer = setTimeout(() => {
        if (!storyPaused) goToSlide(currentIdx + 1);
      }, remaining);
    }

    /* open / close */
    storyRing.addEventListener('click', openStory);
    storyRing.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') openStory();
    });
    storyCloseBtn.addEventListener('click', closeStory);
    storyOverlay.addEventListener('click', (e) => {
      if (e.target === storyOverlay) closeStory();
    });

    /* tap zones */
    storyTapRight.addEventListener('click', (e) => {
      e.stopPropagation();
      goToSlide(currentIdx + 1);
    });
    storyTapLeft.addEventListener('click', (e) => {
      e.stopPropagation();
      goToSlide(currentIdx - 1);
    });

    /* hold to pause */
    ['mousedown', 'touchstart'].forEach(ev =>
      storyOverlay.addEventListener(ev, () => {
        if (storyOverlay.classList.contains('open')) pauseStory();
      }, { passive: true })
    );

    ['mouseup', 'touchend'].forEach(ev =>
      storyOverlay.addEventListener(ev, () => {
        if (storyOverlay.classList.contains('open')) resumeStory();
      }, { passive: true })
    );

    /* keyboard */
    document.addEventListener('keydown', (e) => {
      if (!storyOverlay.classList.contains('open')) return;
      if (e.key === 'Escape')     closeStory();
      if (e.key === 'ArrowRight') goToSlide(currentIdx + 1);
      if (e.key === 'ArrowLeft')  goToSlide(currentIdx - 1);
    });

  } // end story guard
  
const cursorDot = document.querySelector(".cursor-dot");
const cursorOutline = document.querySelector(".cursor-outline");

let mouseX = 0, mouseY = 0;
let outlineX = 0, outlineY = 0;

window.addEventListener("mousemove", (e) => {
  mouseX = e.clientX;
  mouseY = e.clientY;
  
  // DOT moves INSTANTLY (same as default cursor)
  cursorDot.style.left = `${mouseX}px`;
  cursorDot.style.top = `${mouseY}px`;
});

// Outline follows with SMOOTH delay (premium feel)
function smoothFollow() {
  outlineX += (mouseX - outlineX) * 0.15;
  outlineY += (mouseY - outlineY) * 0.15;
  cursorOutline.style.left = `${outlineX}px`;
  cursorOutline.style.top = `${outlineY}px`;
  requestAnimationFrame(smoothFollow);
}
smoothFollow();

// Add hover effects for buttons/links
const hoverElements = document.querySelectorAll("a, button, .project-card");
hoverElements.forEach((el) => {
  el.addEventListener("mouseenter", () => cursorOutline.classList.add("cursor-hover"));
  el.addEventListener("mouseleave", () => cursorOutline.classList.remove("cursor-hover"));
});
}); // end DOMContentLoaded
