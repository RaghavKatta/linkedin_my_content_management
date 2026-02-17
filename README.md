# LinkedIn Analytics Scraper

A Chrome extension to scrape and export your own LinkedIn post analytics (impressions, reactions, comments, reposts) for tracking and analysis.

Can help you get analytics for YOUR OWN LinkedIn posts. Useful for people participating in employee content or UGC programs.

![Extension Screenshot](screenshot.png)

## Features

- **Auto-scroll**: Automatically scrolls your LinkedIn activity page to load posts
- **Date range filtering**: Select posts from specific time ranges (1d to 3mo)
- **Customizable export**: Choose which metrics to include (impressions, reactions, comments, reposts)
- **Google Sheets compatible**: One-click copy that pastes directly into Google Sheets with proper formatting
- **Human-like scrolling**: Randomized scroll patterns to avoid detection

## Disclaimer

**This tool is designed for personal use only.**

- This extension is intended **only for scraping your own LinkedIn content** and analytics
- **Scraping other users' content is against LinkedIn's Terms of Service**
- This tool cannot and should not be used for mass scraping
- Use responsibly and in compliance with LinkedIn's [User Agreement](https://www.linkedin.com/legal/user-agreement)

## Installation

1. Clone this repository:
   ```bash
   git clone https://github.com/RaghavKatta/linkedin_my_content_management.git
   ```

2. Open Chrome and navigate to `chrome://extensions/`

3. Enable **Developer mode** (toggle in top-right corner)

4. Click **Load unpacked** and select the cloned folder

5. Pin the extension for easy access (click puzzle icon → pin)

## Usage

1. Go to your LinkedIn profile and navigate to your **"All activity"** page:
   ```
   https://www.linkedin.com/in/YOUR-USERNAME/recent-activity/all/
   ```
   Or: Profile → Activity section → "Show all activity"

2. Click the **"Posts"** tab to filter to your original posts (not reposts)

3. Click the extension icon in your toolbar

4. Configure your settings:
   - **Date Range**: Select "From" and "To" dates
   - **Include in Export**: Check which metrics you want

5. Click **Scrape Posts**

6. Click **Copy to Clipboard** and paste directly into Google Sheets

## Date Range Options

| Option | Days |
|--------|------|
| 1d - 6d | 1-6 days |
| 1w - 3w | 7-21 days |
| 1mo - 3mo | 30-90 days |

## Export Format

The extension exports data in tab-separated format with the following columns:
- Post URL
- Date
- Impressions (optional)
- Reactions (optional)
- Comments (optional)
- Reposts (optional)

## Files

```
├── manifest.json    # Extension configuration
├── popup.html       # Extension popup UI
├── popup.js         # Popup logic and clipboard handling
├── content.js       # Page scraping and scrolling logic
├── icon16.png       # Extension icons
├── icon48.png
└── icon128.png
```

## Privacy

This extension only reads data from your own LinkedIn profile's activity page. No data is sent to external servers - everything runs locally in your browser.

## License

MIT
