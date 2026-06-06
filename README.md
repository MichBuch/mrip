# mrip — Media Ripper Bookmarklet

A modern, self-contained **bookmarklet** that scans the current page's DOM for images, videos, and audio, shows a clean selectable overlay, and lets you batch-download the ones you choose.

Inspired by the classic Pinterest-era "select media from page and save" workflow.

## Does the old Pinterest bookmarklet technology still work?

**Short answer:** The specific "run on pinterest.com and upload back to Pinterest" bookmarklets from years ago mostly **do not work reliably anymore** on Pinterest itself.

Reasons (as of 2026):
- Pinterest (and many modern SPAs) use strict Content Security Policy (CSP) headers. These often block `javascript:` bookmarklets.
- Heavy JavaScript rendering, lazy-loading, Shadow DOM, and anti-automation measures.
- Pinterest now provides official per-Pin "Download image" (and some video support) in the UI.
- Most bulk Pinterest downloaders today are either browser **extensions**, web paste-URL tools, or server-side scrapers (Playwright + reverse-engineered APIs).

**However**, the underlying idea — a client-side bookmarklet that reads the visible DOM on *whatever page you are on*, presents a nice picker UI with checkboxes, and downloads selected media — **still works very well** on thousands of sites that don't have draconian CSP (blogs, galleries, news sites, product pages, many image hosts, forums, etc.).

This tool is a **general-purpose media picker/downloader** for any page. It can be useful as part of a Pinterest workflow (grab nice media from around the web → save locally → upload to Pinterest yourself).

## Features

- Scans `<img>`, `<video>`, `<audio>`, `<source>`, and some direct media links.
- Deduplicates by URL.
- Basic quality heuristics (skips tiny icons by default, tries to find larger Pinterest versions when present).
- Clean dark overlay with:
  - Checkboxes for every item
  - Live previews (thumbnails for images, playable small video/audio)
  - Type badges and basic metadata
  - Select All / None / filter by type / min-size filter
- Download selected:
  - **Best experience (Edge/Chrome on Win10/11)**: Uses the File System Access API — pick a folder once, files are written directly with proper names (no per-file "Save As" dialogs).
  - Fallback: Multiple `<a download>` clicks (files go to your normal Downloads folder).
- Copy list of URLs (handy for `gallery-dl`, `yt-dlp`, aria2, etc.).
- Keyboard: ESC to close.
- Pure client-side, no external servers, no tracking. ~single file bookmarklet.

## Legal & Responsible Use (Important)

This tool only sees what your browser already sees on the page you are visiting.

**You must only download content you have the legal right to download and keep for personal use.**

- Personal archiving / offline viewing of pages you are allowed to access.
- Your own content or content explicitly licensed for download (CC0, public domain, creator-provided "download" buttons, etc.).
- Fair use / personal transformative use in limited cases (consult local law).

**Do NOT use this to:**
- Mass-scrape or redistribute copyrighted material.
- Violate a website's Terms of Service.
- Bypass paywalls, authentication, or technical protection measures.
- Any commercial purpose without proper licenses.

Respect `robots.txt` and rate-limit yourself if doing many pages. The authors of this tool are not responsible for your use.

If a site offers an official download or API, prefer that.

## Installation on Windows 10 / 11 (Edge or Chrome recommended)

Microsoft Edge (Chromium) is ideal because it has excellent File System Access API support and is the default on Win11.

### Step-by-step (bookmark bar method)

1. Open Microsoft Edge (or Chrome).
2. Show the bookmarks bar if hidden: `Ctrl + Shift + B` (or right-click the tab strip → "Show bookmarks bar").
3. Go to any page that has media (or use the included `demo.html`).
4. Right-click on the bookmarks bar → **Add bookmark** (or `Ctrl + D` then choose "Bookmarks bar").
5. In the dialog:
   - **Name**: `mrip` (or "Media Ripper")
   - **URL / Location**: Paste the entire `javascript:(function(){...})();` string from below (the one-line bookmarklet).
6. Click Save / Add.
7. (Optional but recommended) Drag the new bookmark to a convenient spot on the bar.

### Alternative: Drag-to-install from demo page

1. Open `demo.html` in Edge/Chrome (double-click the file or `file:///C:/lib/dev/mrip/demo.html`).
2. Scroll to the "Install" section.
3. Drag the big "Drag this to your Bookmarks Bar → mrip" link directly onto the bookmarks bar.
4. Done.

**Note on very long bookmarklets**: Modern browsers handle quite long `javascript:` URLs. If it gets truncated for some reason, use the console fallback (see Troubleshooting).

### Firefox

Same steps work. File System Access API is **not** available in Firefox, so it will use the classic multi-download fallback (files land in your Downloads folder). Still very usable.

## How to Use

1. Navigate to a page containing images, videos, or audio you want.
2. Click the `mrip` bookmark.
3. The overlay appears (it may take a second on very heavy pages).
4. Check the items you want (use filters to narrow down).
5. Click **Download Selected**.
   - On Edge/Chrome: First time it will ask you to pick a destination folder (using the secure File System Access picker). Subsequent downloads in the same session remember it or you can pick again.
6. Close with the X or ESC.

The overlay is removed cleanly when closed. Refreshing the page also removes it.

## The Bookmarklet (ready-to-use)

**Recommended installation methods:**

1. **Fastest (drag & drop)**: Open `demo.html` (double-click it) in Microsoft Edge or Chrome. Scroll down to the "Install the bookmarklet" box and **drag the green link** straight onto your bookmarks bar.

2. **Full / latest version**: Open the file `dist/mrip.bookmarklet.txt`. Copy the entire long line that starts with `javascript:(function(){...`. Create or edit a bookmark and paste that whole line into the URL / Location field. Name it `mrip`.

After adding the bookmark, click it while viewing any page with images, video or audio (including this `demo.html`).

**Recent fixes (from your feedback):**
- Preview tiles now respect image/video size better (`max-height:110px` + `object-fit:contain` + centered) — no more 3.5× tall empty boxes.
- Checkboxes now default **unchecked**. Use "Select All" or click the ones you want.
- Picker defaults to your Downloads folder. Permission/write errors on the chosen folder now trigger automatic fallback to normal browser downloads (the method that always works for Downloads) + a message in the progress area.

**Note**: Very long `javascript:` bookmarks are supported in current Edge/Chrome/Firefox. If something gets cut off, use method 1 or paste the code into the DevTools Console as a fallback.

## Browser Compatibility

The bookmarklet was built to be as cross-browser as possible:

| Browser     | Bookmarklet runs? | Overlay + selection | Direct folder write (FS API) | Download fallback | Notes |
|-------------|-------------------|---------------------|------------------------------|-------------------|-------|
| **Edge**    | Yes              | Yes                | Yes (best)                  | Yes              | Recommended on Windows. Full features. |
| **Chrome**  | Yes              | Yes                | Yes                         | Yes              | Full features. |
| **Brave**   | Yes              | Yes                | Yes (Chromium)              | Yes              | Usually works. Disable Shields on the target site if the bookmarklet is blocked. |
| **Opera**   | Yes              | Yes                | Yes (Chromium)              | Yes              | Full features like Chrome/Edge. |
| **Firefox** | Yes              | Yes                | No                          | Yes (reliable)   | Excellent support for the overlay and standard downloads. No folder picker (uses browser's default Downloads location). |

**General notes**:
- All modern desktop browsers (Win10/11) support the core bookmarklet mechanism.
- The **File System Access API** (the nice "pick a folder and write files directly" experience) is currently a Chromium feature (Edge, Chrome, Brave, Opera, etc.). Our code detects it and falls back gracefully.
- The simple download method (`<a download>`) works everywhere and is what Firefox + any browser without FS API will use.
- **Biggest blocker on any browser**: The *target website's* Content Security Policy (CSP). If a site blocks inline scripts, the bookmarklet won't run (use the DevTools console paste workaround).
- Mobile browsers: Limited / not recommended (bookmarklet UI is desktop-oriented).

The small "FS" / "DL" badge in the overlay header tells you at a glance which download mode is active.

## Development / Local Testing

Open `demo.html` in your browser. It contains a variety of images (some same-origin, some cross-origin), a video, and an audio element.

There is also a "Run mrip (dev version)" button that executes an easier-to-read version of the code for development.

To modify:
- Edit the code inside `demo.html` (the big `<script id="mrip-src">`).
- Or maintain a separate `src/mrip.js` and copy into the bookmarklet string when ready.

## Limitations & Troubleshooting

- **CSP blocked**: If nothing happens when you click the bookmark, the site has a restrictive Content Security Policy. Workaround: Open DevTools (F12) → Console tab → paste the bookmarklet code (without the `javascript:` prefix) and press Enter.
- Some sites lazy-load images only after scroll. Scroll down first, then run mrip.
- Cross-origin videos/audio sometimes refuse to play in the small preview (normal). Downloads usually still work via the link method.
- Very large numbers of files (>100) can be slow and may hit browser limits. Use filters.
- File System Access requires a user gesture (the Download button click) — works.
- Filenames are sanitized; duplicates may overwrite in the FS picker (browser behavior).
- Does not handle authenticated/protected media or complex streaming (HLS/DASH). For those, use `yt-dlp` etc.

## Future ideas (contributions welcome)

- Better original-quality heuristics per site.
- Simple ZIP creation (would require embedding a small zip lib or using Compression Streams).
- Remember last folder.
- "Send to Pinterest" helper (opens upload flow or copies to clipboard).

## Credits & License

Built for personal tooling in the `mrip` project (c:\lib\dev\mrip).

Use at your own risk. Respect copyright and site rules.

## Commercial Use, Sale, and Distribution

If you want to sell mrip or distribute it (digital download or physical media like USB/SSD/SD cards), see the detailed guide in `COMMERCIAL_DISTRIBUTION.md`.

It covers:
- Recommended packaging and sales platforms (Gumroad, etc.)
- Physical media distribution tips
- Licensing models (personal vs commercial/redistribution)
- Required legal disclaimers and sample EULA text
- Marketing do's and don'ts to reduce risk
- Practical next steps

**Strong recommendation**: Consult a lawyer before selling or commercially distributing any tool that helps download web content. Copyright and terms-of-service issues can be significant.

---

**Quick start**: Copy the long `javascript:...` line above into a new bookmark named `mrip`. Go to a media-rich page and click it.
