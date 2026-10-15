Colpet Gardens Resort website (4-chapter edition)

HOSTING: upload the CONTENTS of this folder (index.html must sit at the top level)
to any static host: Netlify (drag the folder onto app.netlify.com/drop), Cloudflare Pages,
GitHub Pages, Vercel, or cPanel/public_html. No build step, no server needed.
_headers (Netlify/Cloudflare) and .htaccess (Apache/cPanel) add caching; unused ones are harmless.

HOME PAGE SLIDESHOW: the big photos at the top are the <img class="hero-slide"> lines in index.html.
Add a photo by copying one line and changing src/alt. Seconds per photo: heroSlideMs in site-config.js
(4000 = 4 seconds). Use a NEW file name for new photos (e.g. hero-05.webp): the host caches /assets for a year.

GALLERY ("A picture tells you. A visit shows you."): four frames. Each <figure class="frame"> in index.html is a photo
with glowing hotspots (--x/--y = position in %, data-t = title, data-d = text), and the matching <li class="fl"> on
the right holds its notes. Keep the two lists in the same order. Seconds per frame: frameSlideMs in site-config.js.

LINKS & PHONE NUMBERS: edit site-config.js (social pages, map, WhatsApp number).

AFTER YOU HAVE A DOMAIN: in index.html, change og:image to the full address, e.g.
  <meta property="og:image" content="https://yourdomain.com/assets/photo-02.webp">
so Facebook/WhatsApp previews show the photo. (Optional) add a sitemap.xml.

Fonts and the map load from Google, so the site needs internet to look its best.
