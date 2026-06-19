const menuButton = document.querySelector('.mobile-menu-button');
const mobilePanel = document.querySelector('.mobile-panel');

if (menuButton && mobilePanel) {
  menuButton.addEventListener('click', () => {
    const isOpen = menuButton.getAttribute('aria-expanded') === 'true';
    menuButton.setAttribute('aria-expanded', String(!isOpen));
    mobilePanel.hidden = isOpen;
  });
}

const slider = document.querySelector('.hero-slider');

if (slider) {
  const slides = Array.from(slider.querySelectorAll('.hero-slide'));
  const dots = Array.from(slider.querySelectorAll('.hero-dot'));
  const miniCards = Array.from(slider.querySelectorAll('.hero-mini-card'));
  const prevButton = slider.querySelector('[data-hero-prev]');
  const nextButton = slider.querySelector('[data-hero-next]');
  let index = 0;
  let timer = null;

  const showSlide = (nextIndex) => {
    if (!slides.length) {
      return;
    }

    index = (nextIndex + slides.length) % slides.length;

    slides.forEach((slide, slideIndex) => {
      slide.classList.toggle('is-active', slideIndex === index);
    });

    dots.forEach((dot, dotIndex) => {
      dot.classList.toggle('is-active', dotIndex === index);
    });

    miniCards.forEach((card, cardIndex) => {
      card.classList.toggle('is-active', cardIndex === index);
    });
  };

  const start = () => {
    stop();
    timer = window.setInterval(() => showSlide(index + 1), 5600);
  };

  const stop = () => {
    if (timer) {
      window.clearInterval(timer);
      timer = null;
    }
  };

  dots.forEach((dot) => {
    dot.addEventListener('click', () => {
      showSlide(Number(dot.dataset.heroIndex || 0));
      start();
    });
  });

  miniCards.forEach((card) => {
    card.addEventListener('mouseenter', () => {
      showSlide(Number(card.dataset.heroIndex || 0));
      start();
    });
  });

  if (prevButton) {
    prevButton.addEventListener('click', () => {
      showSlide(index - 1);
      start();
    });
  }

  if (nextButton) {
    nextButton.addEventListener('click', () => {
      showSlide(index + 1);
      start();
    });
  }

  slider.addEventListener('mouseenter', stop);
  slider.addEventListener('mouseleave', start);
  showSlide(0);
  start();
}

const filterGrid = document.querySelector('[data-filter-grid]');

if (filterGrid) {
  const searchInput = document.querySelector('[data-filter-search]');
  const regionSelect = document.querySelector('[data-filter-region]');
  const yearSelect = document.querySelector('[data-filter-year]');
  const typeSelect = document.querySelector('[data-filter-type]');
  const cards = Array.from(filterGrid.querySelectorAll('.movie-card'));

  const applyFilter = () => {
    const keyword = (searchInput?.value || '').trim().toLowerCase();
    const region = regionSelect?.value || '';
    const year = yearSelect?.value || '';
    const type = typeSelect?.value || '';

    cards.forEach((card) => {
      const text = [card.dataset.title, card.dataset.region, card.dataset.year, card.dataset.type, card.dataset.genre].join(' ').toLowerCase();
      const matchedKeyword = !keyword || text.includes(keyword);
      const matchedRegion = !region || card.dataset.region === region;
      const matchedYear = !year || card.dataset.year === year;
      const matchedType = !type || card.dataset.type === type;
      card.hidden = !(matchedKeyword && matchedRegion && matchedYear && matchedType);
    });
  };

  [searchInput, regionSelect, yearSelect, typeSelect].forEach((control) => {
    if (control) {
      control.addEventListener('input', applyFilter);
      control.addEventListener('change', applyFilter);
    }
  });
}

const searchData = window.searchMovies || [];
const searchResults = document.querySelector('[data-search-results]');
const searchInput = document.querySelector('[data-search-input]');
const searchRegion = document.querySelector('[data-search-region]');
const searchYear = document.querySelector('[data-search-year]');
const searchType = document.querySelector('[data-search-type]');

if (searchResults && searchData.length) {
  const params = new URLSearchParams(window.location.search);
  const initialQuery = params.get('q') || '';

  if (searchInput) {
    searchInput.value = initialQuery;
  }

  const fillOptions = (select, values, label) => {
    if (!select) {
      return;
    }

    values.forEach((value) => {
      const option = document.createElement('option');
      option.value = value;
      option.textContent = value || label;
      select.append(option);
    });
  };

  fillOptions(searchRegion, [...new Set(searchData.map((movie) => movie.region))].filter(Boolean).sort(), '全部地区');
  fillOptions(searchYear, [...new Set(searchData.map((movie) => movie.year))].filter(Boolean).sort().reverse(), '全部年份');
  fillOptions(searchType, [...new Set(searchData.map((movie) => movie.type))].filter(Boolean).sort(), '全部类型');

  const makeCard = (movie) => {
    const tags = (movie.tags || []).slice(0, 3).map((tag) => `<span>${escapeHtml(tag)}</span>`).join('');
    return `<article class="movie-card">
      <a class="card-poster" href="${movie.url}" aria-label="${escapeHtml(movie.title)}">
        <img src="${movie.image}" alt="${escapeHtml(movie.title)}" loading="lazy">
        <span class="card-badge">${escapeHtml(movie.type)}</span>
      </a>
      <div class="card-body">
        <div class="card-meta">
          <span>${escapeHtml(movie.year)}</span>
          <span>${escapeHtml(movie.region)}</span>
        </div>
        <h3><a href="${movie.url}">${escapeHtml(movie.title)}</a></h3>
        <p>${escapeHtml(movie.oneLine)}</p>
        <div class="tag-row">${tags}</div>
      </div>
    </article>`;
  };

  const renderSearch = () => {
    const keyword = (searchInput?.value || '').trim().toLowerCase();
    const region = searchRegion?.value || '';
    const year = searchYear?.value || '';
    const type = searchType?.value || '';

    const matched = searchData.filter((movie) => {
      const text = [movie.title, movie.region, movie.year, movie.type, movie.genre, movie.category, movie.oneLine, (movie.tags || []).join(' ')].join(' ').toLowerCase();
      return (!keyword || text.includes(keyword)) && (!region || movie.region === region) && (!year || movie.year === year) && (!type || movie.type === type);
    }).slice(0, 120);

    searchResults.innerHTML = matched.map(makeCard).join('');
  };

  [searchInput, searchRegion, searchYear, searchType].forEach((control) => {
    if (control) {
      control.addEventListener('input', renderSearch);
      control.addEventListener('change', renderSearch);
    }
  });

  renderSearch();
}

function escapeHtml(value) {
  return String(value).replace(/[&<>'"]/g, (character) => {
    const map = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      "'": '&#39;',
      '"': '&quot;'
    };
    return map[character];
  });
}

const playerDataNode = document.getElementById('player-data');
const video = document.getElementById('moviePlayer');
const playButton = document.getElementById('moviePlayButton');

if (playerDataNode && video && playButton) {
  let playerReady = false;
  let loadingPromise = null;

  const loadPlayer = async () => {
    if (playerReady) {
      return;
    }

    if (loadingPromise) {
      await loadingPromise;
      return;
    }

    loadingPromise = (async () => {
      const payload = JSON.parse(playerDataNode.textContent || '{}');
      const sourceUrl = payload.source;

      if (!sourceUrl) {
        return;
      }

      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = sourceUrl;
      } else {
        const module = await import('./hls.js');
        const Hls = module.H;

        if (Hls && Hls.isSupported()) {
          const hls = new Hls({
            enableWorker: true,
            lowLatencyMode: true
          });
          hls.loadSource(sourceUrl);
          hls.attachMedia(video);
        } else {
          video.src = sourceUrl;
        }
      }

      playerReady = true;
    })();

    await loadingPromise;
  };

  const startPlayback = async () => {
    await loadPlayer();
    playButton.classList.add('is-hidden');

    try {
      await video.play();
    } catch (error) {
      playButton.classList.remove('is-hidden');
    }
  };

  playButton.addEventListener('click', startPlayback);

  video.addEventListener('click', () => {
    if (video.paused) {
      startPlayback();
    }
  });

  video.addEventListener('play', () => {
    playButton.classList.add('is-hidden');
  });

  video.addEventListener('pause', () => {
    if (video.currentTime === 0 || video.ended) {
      playButton.classList.remove('is-hidden');
    }
  });
}
