# relieve. Call List

A small, mobile-first web app for 100 Missouri cleaning-business calls. Add a contact name, mark a business called, and keep a short note. Search and an uncalled filter keep the list easy to work through.

No installation, build command, package manager, paid assets, API keys, or backend are needed. The files are ready for a static host. All links and assets use relative paths, including GitHub Pages repository subdirectories.

## Put it on GitHub Pages

1. Unzip this package. Upload its contents into your repository so `index.html` is at the repository root. Upload the `icons` folder too. Do not upload the ZIP as the website.
2. Commit the files to your chosen branch, such as `main`.
3. In the repository, open **Settings → Pages**.
4. Under **Build and deployment**, choose **Deploy from a branch**. Select your branch and **/(root)**, then **Save**.
5. Wait for GitHub's deployment to finish, then open the URL shown in Pages settings.

GitHub Pages availability depends on your account and repository. A Pages site can be publicly accessible even when its repository is private. This app has no login protection. Do not put private call-note backups into the repository.

Official setup instructions: https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site

## On iPhone

Open the hosted HTTPS site in Safari. Use **Share → Add to Home Screen** when available for the standalone app view. The dark atmosphere extends into available screen areas while controls respect safe-area insets. Browser and iOS behavior vary; a web app does not control the Dynamic Island.

The app includes a web manifest, home-screen icons, and an optional service worker. After a successful online visit, the service worker can cache the application shell and public prospect list for offline reopening. Calling numbers or opening source websites still needs the relevant phone/network service. Offline behavior and installation have not been verified on a physical iPhone.

## Keep your notes

- Names, called checkmarks, and notes save to this browser's local storage. Nothing is sent to a server.
- They do not sync across devices, browsers, or the Safari/home-screen app boundary. Those can use separate storage.
- Clearing browser data or using private browsing may remove or limit saved work.
- Use **Save a backup or move to another device → Download backup** regularly. Keep the JSON file private.
- **Restore backup** validates all 100 stable prospect IDs before replacing the current notes, and asks you to confirm the replacement.
- If storage fails, the app says so. Changes then remain in the open tab until you download a backup.
- Tapping a phone number does not mark a business called. Check **Mark called** yourself after the call.

## Sources and limits

The 100 business records are embedded in `index.html`, with official business-site source links. Numbers were publicly listed when checked on October 20, 2026 UTC (October 19 evening in Missouri). They were not dial-tested or confirmed as direct-owner numbers. Published cleaning services describe fit; the businesses' needs have not been confirmed.

## Files and edits

- `index.html`: layout and public prospect records
- `styles.css` and `atmosphere.svg`: original charcoal/cyan visual treatment
- `app.js`: call-list interactions, browser saving, backup and restore
- `manifest.webmanifest`, `sw.js`, `icons/`: optional install/offline support
- `.nojekyll`: serves the static files directly on GitHub Pages

When changing the app shell, increment the cache version in `sw.js` so old cached assets are removed after the new service worker activates. Keep the backup schema and stable prospect IDs unchanged when making styling edits.

## Verification

The interaction logic passed 21 DOM/static checks covering the 100 records, phone/source links, blank initial fields, called count, search/filter, local saves, backup export/restore, invalid IDs, cancelled restore, and storage failures. Packaging checks verify relative asset paths and web manifest references. Real-browser screenshots and physical iPhone testing were blocked by the execution environment, so visual layout, installation, and offline use remain unverified on-device.
