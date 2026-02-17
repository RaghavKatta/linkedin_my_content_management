// Content script for LinkedIn Analytics Scraper

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'scrollAndScrape') {
    const { dateFrom, dateTo } = request;
    scrollAndScrape(dateFrom, dateTo, sendResponse);
    return true;
  }
});

async function scrollAndScrape(dateFrom, dateTo, sendResponse) {
  try {
    await autoScroll(dateFrom);
    await sleep(randomBetween(300, 600));
    const posts = scrapePosts(dateFrom, dateTo);
    sendResponse({ success: true, posts });
  } catch (error) {
    sendResponse({ success: false, error: error.message });
  }
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function randomBetween(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function parseRelativeDate(dateStr) {
  if (!dateStr) return 0;
  const str = dateStr.toLowerCase().trim();

  if (str.includes('just now') || str.includes('now')) return 0;

  const match = str.match(/(\d+)\s*(mo|[smhdwy])/);
  if (!match) return 0;

  const num = parseInt(match[1]);
  const unit = match[2];

  switch (unit) {
    case 's': return 0;
    case 'm': return 0;
    case 'h': return 0;
    case 'd': return num;
    case 'w': return num * 7;
    case 'mo': return num * 30;
    case 'y': return num * 365;
    default: return 0;
  }
}

function getOldestPostDays() {
  const analyticsLinks = document.querySelectorAll('a.analytics-entry-point');
  let oldestDays = 0;

  analyticsLinks.forEach(link => {
    const postContainer = link.closest('[data-urn]') || link.closest('.feed-shared-update-v2') || link.closest('li');
    if (!postContainer) return;

    const dateEl = postContainer.querySelector('.update-components-actor__sub-description');
    if (!dateEl) return;

    const timeSpan = dateEl.querySelector('span[aria-hidden="true"]');
    const text = timeSpan ? timeSpan.textContent.trim() : dateEl.textContent.trim();
    const days = parseRelativeDate(text);

    if (days > oldestDays) {
      oldestDays = days;
    }
  });

  return oldestDays;
}

async function autoScroll(dateFrom) {
  // Stop when we find posts older than dateFrom + buffer (to ensure we get all posts in range)
  const stopAtDays = dateFrom + 7;

  for (let i = 0; i < 20; i++) {
    // Scroll first
    const scrollPercent = randomBetween(200, 400) / 100;
    const scrollAmount = Math.floor(window.innerHeight * scrollPercent);
    const useSmooth = Math.random() > 0.3;
    window.scrollBy({
      top: scrollAmount,
      behavior: useSmooth ? 'smooth' : 'instant'
    });

    await sleep(randomBetween(300, 500));
    if (Math.random() < 0.15) {
      await sleep(randomBetween(200, 400));
    }

    // Check stop condition
    const oldestDays = getOldestPostDays();
    if (oldestDays >= stopAtDays) {
      break;
    }
  }

  window.scrollTo({ top: 0, behavior: 'smooth' });
  await sleep(400);
}

function scrapePosts(dateFrom, dateTo) {
  const posts = [];
  const analyticsLinks = document.querySelectorAll('a.analytics-entry-point');

  analyticsLinks.forEach(link => {
    try {
      const analyticsUrl = link.getAttribute('href');
      const activityMatch = analyticsUrl.match(/urn:li:activity:(\d+)/);
      if (!activityMatch) return;

      const activityId = activityMatch[1];
      const postUrl = `https://www.linkedin.com/feed/update/urn:li:activity:${activityId}/`;

      const impressionsEl = link.querySelector('.ca-entry-point__num-views strong');
      let impressions = 0;
      if (impressionsEl) {
        impressions = parseInt(impressionsEl.textContent.replace(/[^0-9]/g, '')) || 0;
      }

      const postContainer = link.closest('[data-urn]') ||
                           link.closest('.feed-shared-update-v2') ||
                           link.closest('li');

      // Get date
      let date = '';
      let daysAgo = 0;
      const dateEl = postContainer?.querySelector('.update-components-actor__sub-description');
      if (dateEl) {
        const timeSpan = dateEl.querySelector('span[aria-hidden="true"]');
        const dateText = timeSpan ? timeSpan.textContent.trim() : dateEl.textContent.trim();
        daysAgo = parseRelativeDate(dateText);
        const match = dateText.match(/(\d+\s*(mo|[smhdwy])|just now)/i);
        date = match ? match[0] : dateText.split('•')[0].trim();
      }

      // Filter by date range: dateTo <= daysAgo <= dateFrom
      if (daysAgo > dateFrom || daysAgo < dateTo) return;

      // Get reactions
      let reactions = 0;
      const reactionsBtn = postContainer?.querySelector('[aria-label*="reaction"]');
      if (reactionsBtn) {
        reactions = parseInt(reactionsBtn.getAttribute('aria-label').replace(/[^0-9]/g, '')) || 0;
      }

      // Get comments
      let comments = 0;
      const commentsBtn = postContainer?.querySelector('[aria-label*="comment"]');
      if (commentsBtn) {
        comments = parseInt(commentsBtn.getAttribute('aria-label').replace(/[^0-9]/g, '')) || 0;
      }

      // Get reposts
      let reposts = 0;
      const repostsBtn = postContainer?.querySelector('[aria-label*="repost"]');
      if (repostsBtn) {
        reposts = parseInt(repostsBtn.getAttribute('aria-label').replace(/[^0-9]/g, '')) || 0;
      }

      posts.push({ postUrl, impressions, date, reactions, comments, reposts });

    } catch (e) {
      // Skip errors silently
    }
  });

  // Deduplicate
  const seen = new Set();
  return posts.filter(p => {
    if (seen.has(p.postUrl)) return false;
    seen.add(p.postUrl);
    return true;
  });
}
