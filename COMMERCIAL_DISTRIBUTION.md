# Commercial Distribution of mrip Bookmarklet

**IMPORTANT LEGAL DISCLAIMER (READ FIRST)**  
This document is for informational purposes only and does **not** constitute legal advice. Selling or distributing software that assists in downloading web content carries significant legal risks under copyright law (e.g., DMCA in the US), terms of service violations, and potential contributory infringement claims. Many websites (Pinterest, Instagram, etc.) explicitly prohibit scraping or bulk downloading. You should consult a qualified intellectual property attorney in your jurisdiction before selling or distributing this tool. The authors of mrip assume no liability.

## Overview
mrip is a client-side bookmarklet that scans the current page's DOM for media (images, video, audio) and provides a user interface for selective downloading. It runs entirely in the user's browser on content the browser has already loaded. It does **not** bypass authentication, paywalls, or technical protection measures on its own.

If you want to sell it (one-time purchase, "pro" version, or bundled), here is a practical guide.

## How to Package and Sell / Distribute

### 1. Digital Distribution (Download)
Recommended platforms (easy for software like this):
- **Gumroad** (very popular for indie tools, handles payments, licenses, updates)
- **Payhip**, **Sellfy**, **Lemon Squeezy**, or **Stripe** + your own simple checkout page
- Your own website (use Stripe Checkout or Paddle for taxes/invoicing)

**Delivery package structure** (create a zip called `mrip-v1.0-commercial.zip`):
```
mrip-v1.0-commercial/
├── README-COMMERCIAL.md          (your sales/usage instructions)
├── EULA.txt                      (End User License Agreement - see below)
├── dist/
│   └── mrip.bookmarklet.txt      (the ready-to-paste javascript: string)
├── src/
│   └── mrip.js                   (readable source for advanced users)
├── demo.html                     (test page + install instructions)
├── COMMERCIAL_DISTRIBUTION.md    (this file)
└── LICENSE-COMMERCIAL.txt        (summary license)
```

**Sales page content ideas**:
- "mrip — Professional Media Ripper Bookmarklet"
- "Extract and download images, videos, and audio from any web page with a beautiful selector overlay."
- Highlight features: selective checkboxes (default off), scaled previews, direct folder save (Chromium), fallback downloads, search/filter, Pinterest optimization.
- "For personal archiving, backing up your own content, Creative Commons / public domain material, or fair use."
- **Strong disclaimers** (required).
- Price example: $9–19 one-time for personal license, $29+ for "commercial use / redistribution rights".
- Delivery: Instant download link after payment. Include versioned updates (Gumroad excels at this).

**Physical Distribution (USB stick / SSD / SD card)**:
- Format the drive as exFAT or FAT32.
- Copy the package above.
- Add a file called `INSTALL.html` or `README.html` that opens in browser with big "Drag the bookmarklet" instructions.
- Include a printed card or label with:
  - "mrip Bookmarklet vX.Y"
  - "Personal Use License"
  - Key disclaimers
  - Link to your support email / Gumroad page
- For autorun (Windows): You can add an autorun.inf pointing to the HTML, but modern Windows often blocks it for security. Better to instruct "open INSTALL.html".
- Sell on Etsy, eBay, or your site with "physical media" option (you handle shipping).

**Licensing Models**:
- Personal Use Only (most common for bookmarklets): One user, any number of their devices.
- Commercial / Redistribution License: Allow the buyer to include it in their own products or sell copies (higher price).
- Subscription: "mrip Pro" — pay yearly for updates, priority support, or extra features (e.g., built-in ZIP creation via future Compression Streams, more site-specific optimizers).

You will need to generate and email license keys or just rely on "honor system + versioned downloads" (Gumroad can do license keys).

## Required Legal Disclaimers

You **must** include these prominently. Copy/adapt the text below.

### In the Bookmarklet Overlay Itself (already partially present — strengthen it)
Add or ensure this in the footer of the overlay (edit src/mrip.js and re-minify):

```
mrip v1.0 — Client-side media selector. For personal, lawful use only.
This tool accesses only content your browser has already loaded.
You are solely responsible for complying with copyright law, website Terms of Service,
and all applicable laws. Do not use to infringe copyrights or violate any site's rules.
No warranty. Use at your own risk. Not affiliated with any websites.
```

### Minimum Disclaimers for Sales Page, README, EULA, and Physical Media

**"AS IS" / No Warranty**
```
mrip is provided "AS IS" and "AS AVAILABLE", without warranty of any kind, express or implied, 
including but not limited to the warranties of merchantability, fitness for a particular purpose, 
and non-infringement. In no event shall the authors or copyright holders be liable for any claim, 
damages or other liability, whether in an action of contract, tort or otherwise, arising from, 
out of or in connection with the software or the use or other dealings in the software.
```

**User Responsibility & Copyright**
```
You are solely responsible for all content you download using mrip and for ensuring that your 
use complies with all applicable copyright laws, website terms of service, and other regulations 
in your jurisdiction. mrip is a tool that reads the Document Object Model (DOM) of pages you 
have already visited in your browser. It does not circumvent any access controls, authentication, 
or technical protection measures. The authors strongly recommend using mrip only for:
- Backing up content you own or have explicit permission to download
- Archiving public domain or Creative Commons licensed material
- Personal, non-commercial fair use purposes where legally permitted

You agree not to use mrip to infringe upon the copyrights or other rights of any third party.
```

**No Affiliation**
```
mrip is an independent, unofficial tool. It is not affiliated with, endorsed by, or sponsored by 
Pinterest, Instagram, Facebook, any social media platform, The All England Lawn Tennis Club, 
or any other website or organization.
```

**Website Terms of Service**
```
Many websites prohibit automated downloading, scraping, or use of tools like mrip in their 
Terms of Service. You are responsible for reviewing and complying with the terms of any site 
from which you download content.
```

**For Physical Media**
Add the above on a label or included card, plus:
```
This USB/SD card contains a personal-use license of the mrip bookmarklet. 
Redistribution or commercial use requires a separate license. See included EULA.txt.
```

### Sample EULA / Commercial License File (create EULA.txt)

```
mrip END USER LICENSE AGREEMENT (Personal Use)

1. Grant of License
[Your Name / Company] grants you a non-exclusive, non-transferable license to use the mrip 
bookmarklet and associated files solely for your personal, non-commercial use on devices you own.

2. Restrictions
You may not:
- Redistribute, resell, sublicense, or otherwise transfer the software or any portion thereof
- Use the software for any commercial purpose without purchasing a separate Commercial License
- Reverse engineer, decompile, or create derivative works (except as permitted by the included source)
- Use the software in any manner that violates copyright law or the terms of service of any website

3. Disclaimer of Warranty
THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND...

4. Limitation of Liability
IN NO EVENT SHALL THE AUTHORS BE LIABLE FOR ANY DAMAGES...

5. Termination
This license terminates automatically if you breach any term.

6. Governing Law
[Your Jurisdiction]

By using or installing the software, you agree to these terms.

For commercial / redistribution licenses, contact: [your email]
```

### Additional Recommendations
- **Business Setup**: Depending on your location and volume, you may need to register as a sole trader, collect VAT/sales tax, etc.
- **DMCA / Takedown Policy**: If you host downloads on your site, have a DMCA policy and designated agent.
- **Privacy**: If your sales page uses analytics or email capture, have a privacy policy.
- **Updates & Support**: Decide on your policy (e.g., lifetime updates for v1 purchasers, or version-locked).
- **Marketing**: Market it as a "productivity tool for content creators and researchers" or "personal media archiver." Avoid language like "download anything from Pinterest" or "bypass limits."
- **Testing**: Test the full package on clean Windows 10/11 machines (Edge, Chrome, Firefox).
- **Versioning**: Always include version numbers. When you improve the code (e.g., better ZIP support, more site heuristics), release as paid updates or free for existing customers.

## Practical Next Steps
1. Decide on your exact license terms and pricing.
2. Create the EULA.txt and update all READMEs / overlays with the disclaimers above.
3. Package a clean zip (exclude .git, node_modules if any, personal notes).
4. Set up a sales platform (Gumroad is easiest to start).
5. For physical media: Source cheap USB drives/SD cards, print labels, include the EULA on paper.
6. Consult a lawyer before going live, especially if targeting international sales or high volume.
7. Consider open-sourcing the core under a restrictive license (e.g., no commercial redistribution) while selling a "supported / polished" commercial bundle.

If you implement the above disclaimers and market responsibly, you significantly reduce (but do not eliminate) risk.

For the mrip project, the current code already includes basic "Personal use • Respect copyright and site rules" language — strengthen it as shown above before selling.

This is **not legal advice**. Speak to an attorney familiar with software licensing and copyright law in your country. 

Good luck — if you want me to generate the EULA.txt, update the overlay footer, create a packaging script, or improve the demo for a "professional" feel, just ask.
