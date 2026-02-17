document.getElementById('scrapeBtn').addEventListener('click', async () => {
  const statusEl = document.getElementById('status');
  const resultsEl = document.getElementById('results');
  const outputEl = document.getElementById('output');
  const copyBtn = document.getElementById('copyBtn');
  const statsEl = document.getElementById('stats');
  const scrapeBtn = document.getElementById('scrapeBtn');

  // Get filter settings
  const dateFrom = parseInt(document.getElementById('dateFrom').value);
  const dateTo = parseInt(document.getElementById('dateTo').value);
  const includeFields = {
    impressions: document.getElementById('incImpressions').checked,
    reactions: document.getElementById('incReactions').checked,
    comments: document.getElementById('incComments').checked,
    reposts: document.getElementById('incReposts').checked
  };

  statusEl.className = '';
  statusEl.textContent = '';
  resultsEl.classList.remove('show');
  copyBtn.style.display = 'none';
  statsEl.textContent = '';
  scrapeBtn.disabled = true;
  scrapeBtn.textContent = 'Scraping...';

  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

    if (!tab.url.includes('linkedin.com')) {
      statusEl.className = 'error';
      statusEl.textContent = 'Please navigate to your LinkedIn activity page first.';
      scrapeBtn.disabled = false;
      scrapeBtn.textContent = 'Scrape Posts';
      return;
    }

    statusEl.className = 'success';
    statusEl.textContent = 'Scrolling and scraping...';

    const response = await chrome.tabs.sendMessage(tab.id, {
      action: 'scrollAndScrape',
      dateFrom,
      dateTo
    });

    if (!response.success) {
      statusEl.className = 'error';
      statusEl.textContent = 'Error: ' + response.error;
      scrapeBtn.disabled = false;
      scrapeBtn.textContent = 'Scrape Posts';
      return;
    }

    const posts = response.posts;

    if (posts.length === 0) {
      statusEl.className = 'error';
      statusEl.textContent = 'No posts found in the selected date range.';
      scrapeBtn.disabled = false;
      scrapeBtn.textContent = 'Scrape Posts';
      return;
    }

    // Build header based on selected fields
    let headers = ['Post URL', 'Date'];
    if (includeFields.impressions) headers.push('Impressions');
    if (includeFields.reactions) headers.push('Reactions');
    if (includeFields.comments) headers.push('Comments');
    if (includeFields.reposts) headers.push('Reposts');

    // Build rows
    const rows = posts.map(p => {
      let row = [p.postUrl, p.date];
      if (includeFields.impressions) row.push(p.impressions);
      if (includeFields.reactions) row.push(p.reactions);
      if (includeFields.comments) row.push(p.comments);
      if (includeFields.reposts) row.push(p.reposts);
      return row.join('\t');
    });

    const output = headers.join('\t') + '\n' + rows.join('\n');
    outputEl.value = output;
    resultsEl.classList.add('show');
    copyBtn.style.display = 'block';

    statusEl.className = 'success';
    statusEl.textContent = `Found ${posts.length} posts!`;

    // Stats
    let statsText = [];
    if (includeFields.impressions) {
      const total = posts.reduce((sum, p) => sum + p.impressions, 0);
      statsText.push(`${total.toLocaleString()} impressions`);
    }
    if (includeFields.reactions) {
      const total = posts.reduce((sum, p) => sum + p.reactions, 0);
      statsText.push(`${total.toLocaleString()} reactions`);
    }
    if (includeFields.comments) {
      const total = posts.reduce((sum, p) => sum + p.comments, 0);
      statsText.push(`${total.toLocaleString()} comments`);
    }
    statsEl.textContent = statsText.length ? 'Total: ' + statsText.join(', ') : '';

  } catch (err) {
    statusEl.className = 'error';
    if (err.message.includes('Receiving end does not exist')) {
      statusEl.textContent = 'Please refresh the LinkedIn page and try again.';
    } else {
      statusEl.textContent = 'Error: ' + err.message;
    }
  } finally {
    scrapeBtn.disabled = false;
    scrapeBtn.textContent = 'Scrape Posts';
  }
});

document.getElementById('copyBtn').addEventListener('click', async () => {
  const outputEl = document.getElementById('output');
  const copyBtn = document.getElementById('copyBtn');

  try {
    const lines = outputEl.value.trim().split('\n');
    const rows = lines.map(line => line.split('\t'));

    let html = '<table>';
    rows.forEach((row, i) => {
      html += '<tr>';
      row.forEach(cell => {
        const tag = i === 0 ? 'th' : 'td';
        html += `<${tag}>${cell}</${tag}>`;
      });
      html += '</tr>';
    });
    html += '</table>';

    const blob = new Blob([html], { type: 'text/html' });
    const textBlob = new Blob([outputEl.value], { type: 'text/plain' });

    await navigator.clipboard.write([
      new ClipboardItem({
        'text/html': blob,
        'text/plain': textBlob
      })
    ]);

    copyBtn.textContent = 'Copied!';
  } catch (err) {
    outputEl.select();
    document.execCommand('copy');
    copyBtn.textContent = 'Copied!';
  }

  setTimeout(() => {
    copyBtn.textContent = 'Copy to Clipboard';
  }, 1500);
});
