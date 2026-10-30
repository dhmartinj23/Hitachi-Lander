# Lander farewell page

A mobile-friendly, static thank-you and contact page built around the supplied lander, mothership, and space images. It uses plain HTML, CSS, and JavaScript; no build step or package installation is needed.

The opening scene plays all eight supplied Scene images in order over 10 seconds with smooth crossfades. It zooms into Scene 8, then opens a full-screen mission-control profile. The header emblem is an auto-rotating pointer-responsive Three.js cube; the lower-left interactive Three.js globe replaces the former cube. The final screen also includes an SVG location map, live connection telemetry, and a collapsible SYS.LOG in the footer.

## Personalize it

1. Edit `Profile_Info.json` to update the profile, expertise, experience, contact information, and location.
2. Replace `profile.locationCoordinates` with the precise office coordinates and set `isPlaceholder` to `false` when confirmed. The current Chennai coordinates are a city-level placeholder.
3. Serve the folder over HTTP(S) to preview. The page loads all profile data from `Profile_Info.json`; browsers block JSON fetches from `file://` pages, so opening `index.html` directly will show the profile-data unavailable message.

Keep each value in its single source section: profile/contact details under `profile`, career direction under `currentPosition`, skills under `expertise`, and industry history under `domains`.

## Publish and make the QR code

Publish this folder on a static hosting service (for example, GitHub Pages, Azure Static Web Apps, or an internal company host). Use the final HTTPS page URL as the destination for a newly generated QR code, then test that QR code on more than one phone before printing it. The QR printed in the lander photo is part of the image and is not the destination QR for the live page.

Email, mobile, and LinkedIn are blank in the supplied profile and appear as “Not provided” until populated. Verify contact details and map coordinates before publishing or printing a QR code.