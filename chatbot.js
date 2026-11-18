/* ============================================================
   chatbot.js — guided FAQ assistant for Anthony's portfolio
   No backend, no dependencies. Builds its own DOM.
   To change what it says, edit the KB array below.
   ============================================================ */
(() => {
  'use strict';
  if (document.getElementById('abBot')) return;

  /* ---------- 1. SETTINGS (edit these) ---------- */
  const CFG = {
    botName:      "Anthony's Assistant",
    avatar:       'images/Cinematic.png',
    whatsapp:     '27731753476',
    phoneDisplay: '073 175 3476',
    email:        'bompetshitony@gmail.com',
    resume:       { href: 'resume/cv.pdf', file: 'Anthony_Bompetshi_Resume.pdf' },
    github:       'https://github.com/A3n7h0ny',
    instagram:    'https://instagram.com/its.juss_tony',
    tiktok:       'https://tiktok.com/@its.juss_tony',
    youtube:      'https://youtube.com/@tonybompetshi2329',
    liveSite:     'https://bsapplianceexpectrepairs.co.za/',
    liveSiteCode: 'https://github.com/A3n7h0ny/BC-Appliance-Expect-Repair',
    scrollOffset: 80,      // matches your fixed nav
    hintDelay:    4000     // ms before the "Questions?" bubble appears (once per visit)
  };

  const WA_PROJECT = "Hi Anthony, I found your portfolio and I'd like to talk about a project.";
  const waLink = (text) => `https://wa.me/${CFG.whatsapp}` + (text ? `?text=${encodeURIComponent(text)}` : '');

  /* ---------- 2. KNOWLEDGE BASE ----------
     keys   : words/phrases to match (lowercase). A trailing * matches word starts
              ("project*" matches project, projects, projected).
     say    : array of parts -> string = paragraph (HTML allowed),
              {ul:[...]} = bullet list, {actions:[...]} = buttons/links.
     chips  : follow-up quick replies (ids from CHIPS below).
     Order matters: on a tie the first entry wins, so specific ones go first. */
  const A = (label, href, o = {}) => Object.assign({ label, href }, o);

  const CHIPS = {
    services: 'What do you do?', skills: 'Skills', projects: 'Projects',
    availability: 'Are you available?', contact: 'Contact', about: 'About Anthony',
    pricing: 'Pricing', resume: 'Download CV', tools: 'Tools he uses',
    studio: 'Neemo Design Studio', location: 'Location', education: 'Background',
    help: 'What can you answer?'
  };
  const DEFAULT_CHIPS = ['services', 'skills', 'projects', 'availability', 'contact'];

  const KB = [
    { id: 'greeting', maxWords: 4,
      keys: ['hi', 'hello', 'hey', 'howzit', 'heita', 'sawubona', 'yo', 'hola', 'good morning', 'good afternoon', 'good evening'],
      say: ['Hi. What would you like to know about Anthony?'],
      chips: DEFAULT_CHIPS },

    { id: 'thanks',
      keys: ['thanks', 'thank you', 'thx', 'cheers', 'appreciate*', 'dankie', 'ngiyabonga'],
      say: ["You're welcome. Anything else?"],
      chips: ['projects', 'availability', 'contact'] },

    { id: 'bye',
      keys: ['bye', 'goodbye', 'cya', 'see you', 'later', 'sharp'],
      say: ['Take care. If you want to talk about a project, WhatsApp is the fastest way to reach him.',
            { actions: [A('WhatsApp Anthony', waLink(WA_PROJECT), { primary: true })] }],
      chips: [] },

    { id: 'bot',
      keys: ['bot', 'robot', 'human', 'real person', 'are you ai', 'chatgpt', 'automated', 'who am i talking'],
      say: ["I'm an automated assistant on Anthony's portfolio, not Anthony himself. My answers are pre-written, so for anything specific it's better to message him directly.",
            { actions: [A('WhatsApp Anthony', waLink(WA_PROJECT), { primary: true })] }],
      chips: ['about', 'contact'] },

    { id: 'repair', boost: 3,
      keys: ['repair*', 'appliance*', 'bs appliance', 'live site', 'live website'],
      say: ['<strong>BS Appliance Expect Repair</strong> is a modern website Anthony built for an appliance repair business, giving them an online presence.',
            { actions: [A('Visit live site', CFG.liveSite, { primary: true }), A('View code', CFG.liveSiteCode)] }],
      chips: ['projects', 'contact'] },

    { id: 'java', boost: 1,
      keys: ['java', 'spring', 'spring boot', 'swing', 'oop', 'desktop app*', 'clinic', 'game*'],
      say: ["Java is his main focus. He's built a clinic management system and a rock, paper, scissors game in Java with SQL, and he's learning Spring Boot next.",
            { actions: [A('See projects', '#PR', { scroll: 'PR' })] }],
      chips: ['skills', 'projects'] },

    { id: 'pricing',
      keys: ['price*', 'pricing', 'cost*', 'how much', 'rate*', 'quote*', 'budget', 'charge*', 'fee*', 'afford*', 'cheap*'],
      say: ["Pricing depends on what you need: how many pages, which features, and the timeline. The quickest way to get a number is to send Anthony a short description of your project.",
            { actions: [A('Ask for a quote', waLink(WA_PROJECT), { primary: true }), A('Email', `mailto:${CFG.email}`)] }],
      chips: ['services', 'projects'] },

    { id: 'availability',
      keys: ['available', 'availability', 'open to work', 'hire*', 'job*', 'intern*', 'employ*', 'junior', 'position*', 'opportunit*', 'recruit*', 'vacanc*', 'full time', 'part time', 'freelanc*', 'free to work', 'taking on'],
      say: ['Yes. Anthony is open to internships and junior developer roles, and he also takes on freelance projects.',
            { actions: [A('Download CV', CFG.resume.href, { download: CFG.resume.file }), A('WhatsApp', waLink(WA_PROJECT), { primary: true })] }],
      chips: ['contact', 'projects', 'skills'] },

    { id: 'resume',
      keys: ['resume', 'cv', 'curriculum', 'download*'],
      say: ["Here's Anthony's CV.",
            { actions: [A('Download CV', CFG.resume.href, { download: CFG.resume.file, primary: true })] }],
      chips: ['availability', 'contact'] },

    { id: 'contact',
      keys: ['contact*', 'email', 'e-mail', 'phone', 'number', 'call', 'reach', 'whatsapp', 'message', 'get in touch', 'talk', 'speak', 'dm'],
      say: ['You can reach Anthony here:',
            { ul: [`WhatsApp: <a href="${waLink()}" target="_blank" rel="noopener">${CFG.phoneDisplay}</a>`,
                   `Email: <a href="mailto:${CFG.email}">${CFG.email}</a>`] },
            { actions: [A('WhatsApp', waLink(WA_PROJECT), { primary: true }), A('Contact form', '#CX', { scroll: 'CX' })] }],
      chips: ['availability', 'pricing'] },

    { id: 'location',
      keys: ['where are you', 'where is he', 'where do you live', 'where is anthony', 'location', 'located', 'based', 'live in', 'city', 'gauteng', 'south africa', 'johannesburg', 'remote*', 'province'],
      say: ['Anthony is based in Gauteng, South Africa. He works with clients across the country and is open to remote work.'],
      chips: ['contact', 'availability'] },

    { id: 'studio',
      keys: ['neemo', 'studio', 'agency', 'company', 'business name', 'founder', 'your business'],
      say: ["<strong>Neemo Design Studio</strong> is Anthony's studio. It covers web design, web development and digital marketing for small and local businesses."],
      chips: ['services', 'projects', 'contact'] },

    { id: 'tools',
      keys: ['tool*', 'git', 'github', 'intellij', 'vs code', 'vscode', 'netbeans', 'adobe', 'figma', 'react', 'editor*', 'ide'],
      say: ['He works with Git and GitHub, VS Code, IntelliJ IDEA and NetBeans, and uses Figma and Adobe for design. React and Spring Boot are next on his learning list.'],
      chips: ['skills', 'projects'] },

    { id: 'skills',
      keys: ['skill*', 'stack', 'technolog*', 'language*', 'what do you know', 'proficien*', 'expert*', 'good at', 'strong*', 'html', 'css', 'javascript', 'js', 'c++', 'sql', 'ui/ux', 'ux', 'ui', 'database*'],
      say: ["His strongest areas are UI/UX design and HTML/CSS. Java and SQL are solid. C++ and JavaScript are still developing, and he's exploring React, Spring Boot, WordPress and Python.",
            { actions: [A('See skills', '#MS', { scroll: 'MS' })] }],
      chips: ['tools', 'projects'] },

    { id: 'projects',
      keys: ['project*', 'work', 'portfolio', 'built', 'example*', 'case stud*', 'demo*', 'sample*', 'previous', 'client*', 'show me'],
      say: ["Here's what he's shipped so far:",
            { ul: [`<strong>Repair service website</strong>: a live site for BS Appliance Expect Repair`,
                   `<strong>Clinic management system</strong>: Java and SQL`,
                   `<strong>Rock, paper, scissors game</strong>: Java desktop app with usernames and score history`] },
            { actions: [A('Open projects', '#PR', { scroll: 'PR', primary: true }), A('Visit live site', CFG.liveSite)] }],
      chips: ['skills', 'availability', 'contact'] },

    { id: 'education',
      keys: ['education', 'study', 'studied', 'studying', 'school', 'qualif*', 'certificat*', 'degree', 'diploma', 'learn*', 'journey', 'how long', 'when did', 'background', 'history', 'work experience', 'years of experience', 'what experience'],
      say: ['Anthony started with HTML, CSS and JavaScript in 2021, began formal System Development studies in 2024 (C++, networks, databases, software architecture), and landed his first freelance client in 2025.',
            { actions: [A('See his journey', '#JY', { scroll: 'JY' })] }],
      chips: ['skills', 'projects'] },

    { id: 'social',
      keys: ['instagram', 'tiktok', 'youtube', 'social*', 'follow*', 'insta'],
      say: ["You'll find Anthony here:",
            { actions: [A('GitHub', CFG.github), A('Instagram', CFG.instagram), A('TikTok', CFG.tiktok), A('YouTube', CFG.youtube)] }],
      chips: ['contact', 'projects'] },

    { id: 'services',
      keys: ['service*', 'offer*', 'what do you do', 'what does he do', 'what can you', 'web design*', 'web development', 'website*', 'digital marketing', 'marketing', 'custom software', 'software develop*', 'designer', 'developer'],
      say: ['Anthony works across three areas:',
            { ul: ['<strong>Web design and development</strong>: responsive websites for businesses',
                   '<strong>Software development</strong>: custom systems, including booking and management software',
                   '<strong>Digital marketing</strong>: supporting the sites he builds'] },
            { actions: [A('See projects', '#PR', { scroll: 'PR' }), A('Get a quote', waLink(WA_PROJECT), { primary: true })] }],
      chips: ['pricing', 'projects', 'studio'] },

    { id: 'about',
      keys: ['who is', 'who are you', 'about', 'yourself', 'introduce*', 'tell me about', 'bio', 'profile'],
      say: ["Anthony Bompetshi is a web designer, digital marketer and software developer based in Gauteng, South Africa. He's a System Development graduate and the founder of Neemo Design Studio."],
      chips: ['services', 'skills', 'projects'] },

    { id: 'help',
      keys: ['help', 'menu', 'options', 'what can you answer', 'topics'],
      say: ['I can answer questions about what Anthony does, his skills, projects, availability, pricing and how to contact him. Pick one below or type your own.'],
      chips: DEFAULT_CHIPS.concat(['pricing']) }
  ];

  const WELCOME = ["Hi, I'm Anthony's assistant. I can answer questions about his work, skills and availability. Pick one below or type your own."];
  const FALLBACK = [
    "I don't have an answer for that one. Try one of these, or message Anthony directly and he'll reply himself.",
    { actions: [A('WhatsApp Anthony', waLink(WA_PROJECT), { primary: true }), A('Email', `mailto:${CFG.email}`)] }
  ];

  /* ---------- 3. MATCHING ---------- */
  const norm = (s) => s.toLowerCase().replace(/[\u2018\u2019]/g, "'").replace(/\s+/g, ' ').trim();
  const esc  = (s) => s.replace(/[.*+?^${}()|[\]\\\/]/g, '\\$&');
  const compile = (k) => {
    const stem = k.endsWith('*');
    const body = esc(stem ? k.slice(0, -1) : k);
    return {
      rx: new RegExp('(?:^|[^a-z0-9])' + body + (stem ? '' : '(?![a-z0-9])')),
      w: (k.includes(' ') || k.replace('*', '').length >= 7) ? 3 : 2
    };
  };
  KB.forEach((it) => { it.rx = it.keys.map(compile); });

  const byId = (id) => KB.find((k) => k.id === id);

  function detect(text) {
    const t = norm(text);
    const words = t.split(' ').length;
    let best = null, bestScore = 0;
    for (const it of KB) {
      if (it.maxWords && words > it.maxWords) continue;
      let s = 0;
      for (const k of it.rx) if (k.rx.test(t)) s += k.w + (it.boost || 0);
      if (s > bestScore) { best = it; bestScore = s; }
    }
    return bestScore >= 2 ? best : null;
  }

  /* ---------- 4. RENDERING ---------- */
  const reduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const coarse  = window.matchMedia && window.matchMedia('(pointer: coarse)').matches;

  function actionHTML(a) {
    const cls = 'ab-action' + (a.primary ? ' ab-action--primary' : '');
    if (a.scroll) return `<a class="${cls}" href="#${a.scroll}" data-scroll="${a.scroll}">${a.label}</a>`;
    const ext = /^https?:/.test(a.href) ? ' target="_blank" rel="noopener"' : '';
    const dl  = a.download ? ` download="${a.download}"` : '';
    return `<a class="${cls}" href="${a.href}"${ext}${dl}>${a.label}</a>`;
  }
  function partsHTML(parts) {
    return parts.map((p) => {
      if (typeof p === 'string') return `<p>${p}</p>`;
      if (p.ul)      return `<ul>${p.ul.map((i) => `<li>${i}</li>`).join('')}</ul>`;
      if (p.actions) return `<div class="ab-actions">${p.actions.map(actionHTML).join('')}</div>`;
      return '';
    }).join('');
  }
  const plainLength = (parts) => parts.reduce((n, p) => n + (typeof p === 'string' ? p.length : 40), 0);

  const ICON_CHAT  = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M21 11.5a8.4 8.4 0 0 1-9 8.4 8.7 8.7 0 0 1-3.6-.8L3 21l1.9-5.1A8.4 8.4 0 1 1 21 11.5z"/><path d="M8.5 11h7M8.5 14.5h4.5"/></svg>';
  const ICON_CLOSE = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18"/></svg>';
  const ICON_SEND  = '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M3.4 20.4l17.5-7.5a1 1 0 0 0 0-1.8L3.4 3.6a1 1 0 0 0-1.4 1.2L4.5 11l9 1-9 1-2.5 6.2a1 1 0 0 0 1.4 1.2z"/></svg>';

  const root = document.createElement('div');
  root.id = 'abBot';
  root.className = 'ab-bot';
  root.innerHTML = `
    <div class="ab-hint" id="abHint" role="status">Questions? Ask me.</div>
    <div class="ab-panel" id="abPanel" role="dialog" aria-modal="false" aria-label="Chat with ${CFG.botName}">
      <div class="ab-head">
        <span class="ab-avatar" id="abAvatar"><img src="${CFG.avatar}" alt=""><span class="ab-dot"></span></span>
        <div class="ab-title"><strong>${CFG.botName}</strong><span>Automated assistant &middot; instant replies</span></div>
        <button type="button" class="ab-btn ab-close" id="abClose" aria-label="Close chat">${ICON_CLOSE}</button>
      </div>
      <div class="ab-log" id="abLog" role="log" aria-live="polite" aria-relevant="additions"></div>
      <form class="ab-form" id="abForm" autocomplete="off">
        <input class="ab-input" id="abInput" type="text" maxlength="200" enterkeyhint="send"
               placeholder="Ask about skills, projects, availability..." aria-label="Your message">
        <button type="submit" class="ab-btn ab-send" aria-label="Send message">${ICON_SEND}</button>
      </form>
      <p class="ab-note">Pre-written answers. For anything else, message Anthony directly.</p>
    </div>
    <button type="button" class="ab-btn ab-launcher" id="abLauncher" aria-label="Open chat" aria-expanded="false" aria-controls="abPanel">
      <span class="ab-icon ab-icon--chat">${ICON_CHAT}</span>
      <span class="ab-icon ab-icon--close">${ICON_CLOSE}</span>
      <span class="ab-pulse"></span>
    </button>`;
  document.body.appendChild(root);

  const $ = (id) => document.getElementById(id);
  const panel = $('abPanel'), log = $('abLog'), form = $('abForm'), input = $('abInput');
  const launcher = $('abLauncher'), hint = $('abHint');

  // avatar fallback if the image path is wrong
  const avatarImg = root.querySelector('.ab-avatar img');
  avatarImg.addEventListener('error', () => { avatarImg.remove(); $('abAvatar').insertAdjacentText('afterbegin', 'AB'); });

  /* ---------- 5. CHAT FLOW ---------- */
  let opened = false, busy = false, misses = 0;

  const toBottom = () => requestAnimationFrame(() => { log.scrollTop = log.scrollHeight; });
  const clearChips = () => log.querySelectorAll('.ab-chips').forEach((n) => n.remove());

  function addUser(text) {
    const m = document.createElement('div');
    m.className = 'ab-msg ab-msg--user';
    m.textContent = text;            // user text is never injected as HTML
    log.appendChild(m);
    toBottom();
  }

  function addChips(ids) {
    if (!ids || !ids.length) return;
    const wrap = document.createElement('div');
    wrap.className = 'ab-chips';
    ids.forEach((id) => {
      const b = document.createElement('button');
      b.type = 'button';
      b.className = 'ab-btn ab-chip';
      b.dataset.intent = id;
      b.textContent = CHIPS[id];
      wrap.appendChild(b);
    });
    log.appendChild(wrap);
    toBottom();
  }

  function botSay(parts, chips) {
    busy = true;
    form.classList.add('is-busy');
    const typing = document.createElement('div');
    typing.className = 'ab-typing';
    typing.setAttribute('aria-hidden', 'true');
    typing.innerHTML = '<i></i><i></i><i></i>';
    log.appendChild(typing);
    toBottom();
    const delay = reduced ? 120 : Math.min(1100, 380 + plainLength(parts) * 5);
    return new Promise((resolve) => {
      setTimeout(() => {
        typing.remove();
        const m = document.createElement('div');
        m.className = 'ab-msg ab-msg--bot';
        m.innerHTML = partsHTML(parts);
        log.appendChild(m);
        addChips(chips);
        busy = false;
        form.classList.remove('is-busy');
        toBottom();
        resolve();
      }, delay);
    });
  }

  function answer(item) {
    if (!item) {
      misses++;
      const chips = misses >= 2 ? ['help', 'contact'] : DEFAULT_CHIPS;
      return botSay(FALLBACK, chips);
    }
    misses = 0;
    return botSay(item.say, item.chips);
  }

  function handleText(text) {
    if (busy) return;
    clearChips();
    addUser(text);
    answer(detect(text));
  }

  function handleChip(id) {
    if (busy) return;
    clearChips();
    addUser(CHIPS[id]);
    misses = 0;
    answer(byId(id));
  }

  /* ---------- 6. OPEN / CLOSE ---------- */
  function openChat() {
    root.classList.add('is-open');
    launcher.setAttribute('aria-expanded', 'true');
    launcher.setAttribute('aria-label', 'Close chat');
    hint.classList.remove('is-visible');
    sessionStorage.setItem('abHint', '1');
    if (!opened) { opened = true; botSay(WELCOME, DEFAULT_CHIPS); }
    if (!coarse) setTimeout(() => input.focus(), 220);
  }
  function closeChat(returnFocus) {
    root.classList.remove('is-open');
    launcher.setAttribute('aria-expanded', 'false');
    launcher.setAttribute('aria-label', 'Open chat');
    if (returnFocus) launcher.focus();
  }
  const isOpen = () => root.classList.contains('is-open');

  launcher.addEventListener('click', () => (isOpen() ? closeChat(false) : openChat()));
  $('abClose').addEventListener('click', () => closeChat(true));

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const text = input.value.trim();
    if (!text || busy) return;
    input.value = '';
    handleText(text);
  });

  log.addEventListener('click', (e) => {
    const chip = e.target.closest('.ab-chip');
    if (chip) { handleChip(chip.dataset.intent); return; }
    const link = e.target.closest('a[data-scroll]');
    if (link) {
      e.preventDefault();
      const target = document.getElementById(link.dataset.scroll);
      if (target) {
        const y = target.getBoundingClientRect().top + window.scrollY - CFG.scrollOffset;
        window.scrollTo({ top: y, behavior: reduced ? 'auto' : 'smooth' });
      }
      closeChat(false);
    }
  });

  // Keep keys inside the widget: your page has a window-level ArrowLeft/ArrowRight
  // handler that scrolls the project carousels, which would fire while typing.
  panel.addEventListener('keydown', (e) => {
    e.stopPropagation();
    if (e.key === 'Escape') closeChat(true);
  });

  // Use the site's custom cursor ring on interactive widget elements
  const ring = document.querySelector('.cursor-outline');
  if (ring) {
    root.addEventListener('mouseover', (e) => { if (e.target.closest('a, button')) ring.classList.add('cursor-hover'); });
    root.addEventListener('mouseout',  (e) => {
      if (e.target.closest('a, button') && !(e.relatedTarget && e.relatedTarget.closest && e.relatedTarget.closest('a, button'))) {
        ring.classList.remove('cursor-hover');
      }
    });
  }

  /* ---------- 7. "Questions?" hint (once per visit) ---------- */
  if (!sessionStorage.getItem('abHint')) {
    setTimeout(() => {
      if (isOpen()) return;
      hint.classList.add('is-visible');
      setTimeout(() => hint.classList.remove('is-visible'), 7000);
      sessionStorage.setItem('abHint', '1');
    }, CFG.hintDelay);
  }

})();
