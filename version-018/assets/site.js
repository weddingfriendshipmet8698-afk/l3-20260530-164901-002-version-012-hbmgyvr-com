(function () {
  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

  const escapeHTML = (input) => String(input ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");

  const getQuery = () => new URLSearchParams(window.location.search);

  const normalize = (value) => String(value ?? "").trim().toLowerCase();

  const paletteStyle = (item) => {
    const c1 = item.c1 || "#7c3aed";
    const c2 = item.c2 || "#ea580c";
    const c3 = item.c3 || "#111827";
    return `--c1:${c1};--c2:${c2};--c3:${c3};`;
  };

  const makeCard = (item, variant = "card") => {
    const title = escapeHTML(item.title);
    const oneLine = escapeHTML(item.oneLine || item.summary || "");
    const year = escapeHTML(item.year || "");
    const region = escapeHTML(item.region || "");
    const type = escapeHTML(item.type || "");
    const genre = escapeHTML(item.genre || "");
    const tags = (item.tags || []).slice(0, 3).map(t => `<span class="tag">${escapeHTML(t)}</span>`).join("");
    const href = escapeHTML(item.url);

    if (variant === "search") {
      return `
        <a class="search-item" href="./${href}" data-search-item data-search-key="${escapeHTML([item.title, item.oneLine, item.summary, item.year, item.region, item.type, item.genre, ...(item.tags || [])].join(" "))}">
          <div class="poster" style="${paletteStyle(item)}">
            <div class="poster-body">
              <div class="poster-top">
                <span class="poster-badge">${type || "影片"}</span>
                <span class="poster-kernel">${escapeHTML(item.id)}</span>
              </div>
              <div class="poster-title">
                <h3 class="clamp-2">${title}</h3>
                <p class="clamp-3">${escapeHTML((item.oneLine || "").slice(0, 72))}</p>
              </div>
            </div>
          </div>
          <div>
            <h3 class="clamp-2">${title}</h3>
            <p class="clamp-3">${oneLine}</p>
            <div class="meta-row">
              <span class="tag gold">${year}</span>
              <span class="tag soft">${region}</span>
              <span class="tag green">${type}</span>
            </div>
          </div>
          <div class="search-side">
            <span class="tag">${genre}</span>
            <span class="tag gold">详情页</span>
          </div>
        </a>
      `;
    }

    return `
      <a class="card" href="./${href}" data-search-item data-search-key="${escapeHTML([item.title, item.oneLine, item.summary, item.year, item.region, item.type, item.genre, ...(item.tags || [])].join(" "))}">
        <div class="poster" style="${paletteStyle(item)}">
          <div class="poster-body">
            <div class="poster-top">
              <span class="poster-badge">${type || "影片"}</span>
              <span class="poster-kernel">${escapeHTML(item.id)}</span>
            </div>
            <div class="poster-title">
              <h3 class="clamp-2">${title}</h3>
              <p class="clamp-2">${oneLine || "精选内容，点击查看详情。"}</p>
            </div>
            <div class="poster-meta">
              <span>${year}</span>
              <span>${region}</span>
              <span>${genre || "综合"}</span>
            </div>
          </div>
        </div>
        <div class="card-body">
          <h3 class="clamp-2">${title}</h3>
          <p class="excerpt clamp-3">${oneLine || "更多剧情、简介与推荐内容，点击进入详情页。"}</p>
          <div class="meta-row">
            ${tags}
          </div>
        </div>
      </a>
    `;
  };

  const filterCards = (input, scope = document) => {
    if (!input) return;
    const q = normalize(input.value);
    const cards = $$('[data-search-item]', scope);
    let visible = 0;
    cards.forEach(card => {
      const key = normalize(card.dataset.searchKey || card.textContent);
      const show = !q || key.includes(q);
      card.style.display = show ? "" : "none";
      if (show) visible += 1;
    });
    const counter = scope.querySelector('[data-filter-count]');
    if (counter) {
      counter.textContent = visible;
    }
    const empty = scope.querySelector('[data-filter-empty]');
    if (empty) {
      empty.style.display = visible ? "none" : "";
    }
  };

  const initMenu = () => {
    const toggle = $('[data-menu-toggle]');
    const mobileNav = $('[data-mobile-nav]');
    if (!toggle || !mobileNav) return;
    toggle.addEventListener('click', () => {
      mobileNav.classList.toggle('show');
      toggle.setAttribute('aria-expanded', mobileNav.classList.contains('show') ? 'true' : 'false');
    });
    $$('[data-mobile-nav] a').forEach(link => {
      link.addEventListener('click', () => mobileNav.classList.remove('show'));
    });
  };

  const initActiveNav = () => {
    const page = document.body.dataset.page;
    if (!page) return;
    $$('[data-nav-target]').forEach(link => {
      if (link.dataset.navTarget === page) link.classList.add('is-active');
    });
  };

  const initBackToTop = () => {
    const btn = $('[data-back-to-top]');
    if (!btn) return;
    const onScroll = () => {
      if (window.scrollY > 500) btn.classList.add('show');
      else btn.classList.remove('show');
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    btn.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
  };

  const initLocalFilters = () => {
    $$('[data-filter-input]').forEach(input => {
      const scope = input.closest('[data-filter-scope]') || document;
      input.addEventListener('input', () => filterCards(input, scope));
      filterCards(input, scope);
    });
  };

  const initPlayer = async () => {
    const wrap = $('[data-player]');
    if (!wrap) return;

    const video = $('video', wrap);
    const playBtn = $('[data-play-button]', wrap);
    const status = $('[data-player-status]', wrap);
    const m3u8 = wrap.dataset.m3u8;
    const mp4 = wrap.dataset.mp4;
    let hlsInstance = null;

    const setStatus = (txt) => {
      if (status) status.textContent = txt;
    };

    const loadNative = (src, label) => {
      if (!video) return;
      video.src = src;
      setStatus(label || '本地视频已就绪');
    };

    const cleanup = () => {
      if (hlsInstance) {
        try { hlsInstance.destroy(); } catch (err) {}
        hlsInstance = null;
      }
    };

    if (video) {
      video.addEventListener('play', () => {
        if (playBtn) playBtn.style.display = 'none';
      });
      video.addEventListener('pause', () => {
        if (playBtn) playBtn.style.display = '';
      });
      video.addEventListener('ended', () => {
        if (playBtn) playBtn.style.display = '';
      });
    }

    if (playBtn && video) {
      playBtn.addEventListener('click', async () => {
        try {
          await video.play();
          setStatus('正在播放');
          playBtn.style.display = 'none';
        } catch (err) {
          setStatus('播放失败，请再点一次');
        }
      });
    }

    const start = async () => {
      if (!video) return;
      cleanup();

      if (m3u8) {
        if (video.canPlayType('application/vnd.apple.mpegurl')) {
          loadNative(m3u8, 'HLS 已就绪');
          return;
        }
        try {
          const mod = await import('./hls.mjs');
          const Hls = mod.H;
          if (Hls && Hls.isSupported()) {
            hlsInstance = new Hls({
              enableWorker: true,
              lowLatencyMode: false
            });
            hlsInstance.loadSource(m3u8);
            hlsInstance.attachMedia(video);
            hlsInstance.on(Hls.Events.MANIFEST_PARSED, () => {
              setStatus('HLS 已就绪');
            });
            hlsInstance.on(Hls.Events.ERROR, (_event, data) => {
              if (data && data.fatal) {
                setStatus('播放遇到错误，已自动切换兜底源');
                if (mp4) loadNative(mp4, '已切换到 MP4 兜底源');
              }
            });
            return;
          }
        } catch (err) {
          // fallback below
        }
      }

      if (mp4) {
        loadNative(mp4, '已加载兜底播放源');
        return;
      }

      setStatus('当前页面未配置可播放源');
    };

    await start();

    const openHint = $('[data-player-open]', wrap);
    if (openHint) {
      openHint.addEventListener('click', async () => {
        try {
          if (video) await video.play();
          setStatus('正在播放');
        } catch (err) {
          setStatus('请使用视频控制条开始播放');
        }
      });
    }
  };

  const relevanceScore = (item, q) => {
    const query = normalize(q);
    if (!query) return 0;
    const hay = normalize([
      item.title,
      item.oneLine,
      item.summary,
      item.year,
      item.region,
      item.type,
      item.genre,
      ...(item.tags || [])
    ].join(" "));
    let score = 0;
    query.split(/\s+/).forEach(term => {
      if (!term) return;
      if (hay.includes(term)) score += 10;
      if (normalize(item.title).includes(term)) score += 20;
      if (normalize(item.region).includes(term)) score += 6;
      if (normalize(item.genre).includes(term)) score += 6;
    });
    return score;
  };

  const initSearchPage = () => {
    const root = $('[data-search-page]');
    if (!root || !window.SITE_DATA) return;
    const qInput = $('[data-search-query]', root);
    const results = $('[data-search-results]', root);
    const count = $('[data-search-count]', root);
    const empty = $('[data-search-empty]', root);
    const params = getQuery();
    const initial = params.get('q') || '';
    if (qInput) qInput.value = initial;

    const render = () => {
      const q = normalize(qInput ? qInput.value : initial);
      const list = window.SITE_DATA
        .slice()
        .sort((a, b) => relevanceScore(b, q) - relevanceScore(a, q) || (b.year || 0) - (a.year || 0));
      const filtered = q ? list.filter(item => relevanceScore(item, q) > 0) : list.slice(0, 120);

      if (count) count.textContent = filtered.length;
      if (empty) empty.style.display = filtered.length ? 'none' : '';
      if (!results) return;

      results.innerHTML = filtered.slice(0, 400).map(item => makeCard(item, 'search')).join('');
      filterCards({ value: q }, root);
    };

    if (qInput) {
      qInput.addEventListener('input', render);
      const form = qInput.closest('form');
      if (form) {
        form.addEventListener('submit', (e) => {
          e.preventDefault();
          const q = qInput.value.trim();
          const url = new URL(window.location.href);
          if (q) url.searchParams.set('q', q);
          else url.searchParams.delete('q');
          window.location.href = url.toString();
        });
      }
    }

    render();
  };

  const initHomeHelpers = () => {
    const sectionFilter = $('[data-home-filter]');
    if (sectionFilter) {
      sectionFilter.addEventListener('click', (e) => {
        const target = e.target.closest('[data-filter-jump]');
        if (!target) return;
        const sel = target.dataset.filterJump;
        const node = document.querySelector(sel);
        if (node) node.scrollIntoView({ behavior: 'smooth', block: 'start' });
      });
    }
  };

  const init = () => {
    initMenu();
    initActiveNav();
    initBackToTop();
    initLocalFilters();
    initPlayer();
    initSearchPage();
    initHomeHelpers();
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  window.SiteCards = { makeCard };
})();
