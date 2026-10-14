# Lokoon PDF

A browser-only PDF workspace built with Next.js App Router and TypeScript. Warm surfaces, a quiet indigo palette, a virtual thumbnail rail, a single active document canvas, and contextual properties that become a bottom sheet on mobile.

**Delivery/verification status:** source implementation is provided. This restricted environment could not install PDF.js, pdf-lib, fontkit, idb or Tesseract, or retrieve the font/OCR assets. Consequently there is no verified production build or bundled third-party asset output in this checkout yet. Do not treat it as release-ready until the setup, full typecheck, PDF integration tests and browser tests below pass on a connected development machine. Twenty-three dependency-independent tests passed; see [TEST_RESULTS.md](TEST_RESULTS.md).

## Run

Use Node.js 22 LTS and npm on a machine with registry access:

```sh
npm install
npm run assets
npm run dev
```

Open http://localhost:3000. Asset preparation is a **development/build-time** operation. It copies the installed PDF.js worker, CMaps and standard fonts; downloads Noto Sans/Serif and English/French/German OCR language data; copies local Tesseract workers and WebAssembly engines; and creates PWA icons and license notices. It never processes your documents. Do not use a CDN at runtime. Keep `public/` with the project when moving it to a disconnected build machine.

Use a modern browser with Workers, WebAssembly, `Promise.withResolvers`, Canvas, ResizeObserver and IndexedDB. Offline installation requires HTTPS (localhost also works). Private browsing, browser storage eviction and very low memory can prevent recovery/offline operation.

```sh
npm run typecheck
npm test
npm run build
npx playwright install chromium
npm run test:browser
npm run preview
```

`npm run build` produces a static `out/` directory and a generated asset-allowlist service worker. `preview` is a local static-file server for QA, not an application backend. PDF creation, editing, search, OCR and export run in the browser. The browser test command serves the production build itself; stop another preview on port 4173 before running it.

## Static deployment

### Docker

```sh
docker compose up --build -d
```

When the build and startup succeed, open http://localhost:8080. The build installs dependencies, prepares local assets, typechecks, runs unit/PDF integration tests and creates the static export. The final image contains only nginx and static application assets, with no PDF backend. The port binds to loopback only; this does not create a public deployment URL. Build-time internet access is required for npm packages and initial font/OCR downloads. Stop with `docker compose down`.

Docker Desktop must be running and accessible to the account executing the command. This workspace's attempted Docker launch was denied access to the engine pipe, so the container build/startup remains unverified.

Upload **all of `out/`** to any HTTPS static host, including `_next/`, `pdfjs/`, `ocr/`, `fonts/`, icons, the manifest and `sw.js`. Serve at the origin root; subdirectory hosting is not configured. No Node server, API routes, Server Actions, credentials or database are needed. Do not put user PDFs in `public/` or `out/`.

For Netlify or Cloudflare Pages, publish directory `out`, build command `npm run build`. The supplied `_headers` adds same-origin resource restrictions and prevents stale service workers. For other hosts reproduce those headers, serve `.mjs` as JavaScript and `.wasm` as `application/wasm`, and give `/sw.js` a no-cache policy. Next uses inline bootstrapping; the included CSP permits inline scripts and styles and WebAssembly compilation while blocking third-party network destinations. Host access logs can record requests for application assets, but no PDF contents or filenames are transmitted by this application.

After installation, the first visit caches the application **and its local OCR/font/worker assets**. Wait for “Offline assets cached” before disconnecting. The service worker only handles GET requests whose path is in the generated build allowlist. It never caches selected documents, blob URLs, IndexedDB drafts or arbitrary requests. Cache names include an application content hash; activation removes only obsolete Lokoon asset caches.

## Using the workspace

Open a local PDF or drop it onto the workspace. Start blank and Images to PDF are also available on the opening screen. Pick a tool and click/tap or drag on the page. Select an added object by tapping it or using the properties panel's object list. Move, resize, rotate, duplicate and delete objects in the properties panel. Text supports manual multiline content and left/center/right alignment; there is no automatic paragraph reflow.

Select source text before pressing Highlight, Underline or Strike through. Without a text selection, these tools draw a markup region. For unusual text rotations, vertical scripts or irregular glyph boxes, inspect the resulting markup before export.

Organize pages provides blank/duplicate/delete/rotate, drag ordering, touch-friendly move-earlier/later controls, visual cropping, merging, page-range extraction, per-page splitting and stamps. Split downloads individual PDFs; your browser may prompt for multiple-download permission. All page exports use the same edited-document pipeline, including object edits and form values.

Fill forms edits supported AcroForm values in a properties panel. Changes become visible on export, rather than immediately replacing PDF.js's original rendered form appearance. New text fields, checkboxes, radio groups and dropdowns can be created on the current page, moved and resized, and configured in Properties. Export can keep these new fields interactive or flatten them. Merged PDFs retain their existing form values, but their fields are not exposed for editing in the combined workspace.

Find text searches source text and new text. OCR operates on the current edited page only, in English, French or German, and exports plain TXT. It does **not** create a searchable PDF. Image export renders the current edited page to PNG or JPEG. Print uses a locally created edited PDF in the browser's PDF viewer; viewers that block programmatic printing can download and print instead.

Recovery is opt-in. Enabling it stores source bytes and edit snapshots in IndexedDB **on this device**. Disabling it or “Delete all saved documents” deletes the draft and disables recovery. Storage is not an encrypted vault. Closing with unsaved edits requests the browser's standard warning; mobile browsers may not deliver `beforeunload`, so enable recovery if you need crash recovery.

## Architecture

| Module | Responsibility |
| --- | --- |
| `app/` | Static App Router entry, styling, error boundary |
| `components/Workspace.tsx` | Browser-only loading boundary; no PDF engine evaluated during SSR |
| `components/Editor.tsx` | UI, immutable history, file selection, local recovery and operations |
| `components/PageCanvas.tsx` | PDF.js canvas/text layers, SVG objects and pointer interactions |
| `lib/useHistory.ts` | React editing history transitions |
| `lib/model.ts` | Page identity, overlay model, history/range/line helpers |
| `lib/objects.ts` | Direction-preserving drawing and rotated resizing |
| `lib/fonts.ts` | Local font fetching, caching and atomic preview replacement |
| `lib/coordinates.ts` | Crop-aware, quarter-turn page transforms |
| `lib/viewer.ts` | Local PDF.js worker configuration and lifecycle |
| `lib/pageGeometry.ts` | Validated MediaBox/CropBox geometry and rotation normalization |
| `lib/pdf.ts` | Source inspection, page copying, form flattening and PDF drawing |
| `lib/export.worker.ts` | Off-main-thread inspection, image conversion and edited export |
| `lib/export.ts` | Worker orchestration, cancellation and local downloads |
| `lib/ocr.ts` | Local Tesseract worker, languages and cancellation |
| `lib/drafts.ts` | IndexedDB draft storage |
| `scripts/assets.mjs` | Build-time worker/font/WASM/license preparation |
| `scripts/offline.mjs` | Content-versioned PWA cache generation |

Canonical editing coordinates are **unrotated MediaBox PDF points with a top-left origin**. Source MediaBox offsets are retained. Crop rectangles live in that same space. Display transforms subtract the crop origin then apply page rotation; pointer coordinates invert that transform and divide out zoom. Export restores the bottom-left PDF origin and applies object rotation around its lower-left anchor. Reordering moves a page's stable ID and objects together. Export always uses immutable source bytes and a fresh output document, so edits do not accumulate across repeated exports.

Only one full-size page is mounted, plus at most ten thumbnail canvases around the visible window. PDF.js renders progressively with its local parsing worker. Unmounted canvases and text tasks are cancelled/cleared. Inspection, export, image conversion and OCR use workers; standard file reading, UI drawing and image preview use browser APIs. Export cancellation terminates its worker. Input PDFs are limited to 100 MB per file and merged input to 150 MB. Image conversion accepts up to 50 images/100 MB; inserted images up to 20 MB. Main page rendering is capped at roughly 16 megapixels, image export at 24 megapixels and OCR at 8 megapixels. These caps constrain work but cannot guarantee survival on a low-memory device; OCR can consume several hundred MB.

## Exact limitations

* Original text replacement uses the local MuPDF WASM engine to extract horizontal text and remove its original glyphs before embedding replacement text with Noto or a selected local font. It supports eligible embedded/subset fonts, but does not match original fonts or reflow paragraphs. Overlapping spans, rotated/vertical text and scan pages with a dominant image are excluded. Preview edited page renders the exported result. Blank detection now explains the reason and supports retry. A legacy standard-font ASCII replacement path remains for old drafts. This feature is limited and engine/browser verification must pass before release. It is not a general secure-redaction tool.
* Export flattens added text, images, drawing, markup and visible notes. Notes are visible page content, not native popup comments. There is no editable general PDF annotation output. Newly created AcroForm widgets can remain interactive. A local recovered workspace preserves object editability.
* `copyPages` does not reliably preserve an AcroForm field tree. The exporter fills and flattens forms **before** copying pages. Text, checkbox, radio and dropdown values are supported; interactive fields are not retained. New fields are created directly in the output document and can remain interactive; their rotation is controlled at page level. Unsupported/XFA/missing-appearance fields can make export fail explicitly; keep the original. Form values never intentionally disappear into a successful export.
* Original page annotations are copied with page dictionaries. Complex annotations, links to deleted/reordered pages, JavaScript actions and unusual appearances are not guaranteed. Portfolio attachments, document scripts and bookmarks are not preserved by the document rebuild. Do not use this as an archival-preservation tool.
* Password-protected files are viewable using a supplied password through PDF.js. pdf-lib cannot decrypt those files for modification/export. Password encryption and removing encryption are unsupported. `ignoreEncryption` is deliberately not used to pretend to decrypt content.
* Visual typed/drawn/uploaded signatures and initials are page marks, not certificate signatures. Editing/rebuilding a PDF invalidates existing digital signatures; no validity preservation is promised.
* Cropping changes the CropBox and **does not remove underlying content**. Rectangles/highlights are never called secure redactions. Secure redaction is unsupported.
* Metadata removal clears output document Info and page-level Metadata references/streams. It is not comprehensive sanitization of comments, image EXIF, embedded resources or content that happens to contain identifying information. Normal export preserves only basic title/author/subject metadata.
* Unicode added text embeds local fonts. Bundled Noto Sans/Serif cover Latin, Greek and Cyrillic, not all of Unicode. A local TTF/OTF can provide other glyphs. Missing glyphs fail export with a useful error. Bidirectional layout, emoji/color fonts and complex script shaping are not guaranteed. OCR languages are a separate feature and do not expand font coverage.
* OCR produces imperfect plain text. No invisible text layer is embedded and no searchable scan PDF is claimed. Office document conversions have no suitable local engine here and are unsupported.

See [FEATURE_MATRIX.md](FEATURE_MATRIX.md) for individual status and [LICENSES.md](LICENSES.md) for licensing. This project contains no document telemetry or external runtime document services.

In Organize pages, use **Edit a page range** to rotate, duplicate, reverse, delete or move multiple pages in one undoable operation. Enter ranges such as `1-3, 5`. Move destinations refer to the final start position after selected pages are removed. In Properties, selected added objects have **Object order** controls; PDF export uses that same drawing order.

The interface uses restrained glass surfaces, local fonts, indigo accents and warm document surfaces. Visual styles live in `app/premium.css`; mobile layouts retain touch controls and a properties bottom sheet. Browser blur support is optional, and reduced-transparency, reduced-motion and forced-color preferences have fallbacks. Document rendering itself has no glass/filter effect.

Original-text edits automatically rebuild the current page preview locally after a 450 ms typing pause. The input remains usable during processing; obsolete previews are cancelled. Invalid replacements leave the last valid preview visible with an error message. Disable **Live preview of original text edits** for manual previews or use **Return to source view** to inspect the original. PDF export remains the explicit save action.

The toolbar's **Edit PDF text** action opens the original-text inspector directly. Selecting an added object collapses that inspector to keep object settings visible. The file/page heading and preview status clarify what is currently displayed. Workflow layout and typography refinements live in `app/workspace.css`.

## Vercel deployment

`vercel.json` configures a static deployment (framework preset **Other**, output `out`) with Node 22, local asset preparation, typechecking and PDF tests before the build. Runtime document operations remain entirely in the browser. Deployment uploads application source/assets; `.vercelignore` excludes local PDF documents, draft files, credentials and test artifacts. No application environment variables are needed.

From the project directory on a connected machine:

```powershell
npx vercel login
npx vercel deploy --prod
```

Choose your Vercel account/team and link or create the `lokoon-pdf` project. Use the settings in `vercel.json`. The CLI reports the production URL after successful deployment. Alternatively, import a Git repository into Vercel with the same settings. Build-time downloads require network access; deployment fails explicitly if assets or verification cannot complete. Run browser QA before treating the deployment as production-ready. https://pdfed-eta.vercel.app/
