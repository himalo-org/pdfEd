# Validation results

Executed in the supplied restricted Windows workspace, Node 22.22.3. Browser QA was **not performed**.

| Check | Result |
| --- | --- |
| All application/library/test TS and TSX syntax compilation | Passed with an already available TypeScript installation |
| Page range validation | Passed |
| Coordinate roundtrips: four rotations, four zoom factors, with/without crop | Passed |
| Rotated cropped size and display transform | Passed |
| Reordering preserves annotation and source identity | Passed |
| History preserves page/form snapshots | Passed |
| History cap / redo discard | Passed |
| Horizontal underline/strike and arrow endpoint geometry | Passed |
| No remote endpoints / transmission APIs in runtime source | Passed |
| Local rendering/OCR paths and service-worker GET allowlist | Passed |
| Generated service-worker install allowlist / offline root navigation / document bypass / cache cleanup | Passed in a mocked worker environment |
| Strict typecheck of standalone model, coordinates, resize, page geometry and font modules | Passed (not a full project typecheck) |
| Directional arrows, rotated resizing, aspect ratio, freehand scaling | Passed |
| Font replacement, cancellation and local caching | Passed using mocked browser font APIs; actual font parsing remains unverified |
| Nonzero MediaBox offsets, crop intersections and malformed geometry | Passed |
| Dependency installation | Blocked: missing cached PDF/font/OCR packages; network proxy returned ECONNREFUSED |
| Full TypeScript typecheck | Not run successfully: project dependencies unavailable |
| Production build | Blocked: missing PDF.js package/required assets |
| Export/reopen, crop/merge/extraction, Unicode font and form tests | Provided in `tests/export.test.ts` and `tests/newforms.test.ts`; not run because engines/fonts unavailable |
| Mobile touch / export/reopen / offline / network browser tests | Provided in `tests/browser/editor.spec.ts`; not run because build/browser dependencies unavailable |
| OCR quality and cancellation browser QA | Pending manual testing |

The twenty-three independent tests were transpiled to CommonJS using the existing TypeScript installation and run with Node's `--experimental-test-isolation=none`: **23 passed, 0 failed, 0 skipped**. The ordinary isolated runner first failed with `spawn EPERM`; the same tests passed with process isolation disabled. `scripts/prepare-checks.cjs` permits reproducing this environment-compatible approach after installation:

```sh
node scripts/prepare-checks.cjs
node --test --experimental-test-isolation=none .checks/tests/model.test.js .checks/tests/objects.test.js .checks/tests/fonts.test.js .checks/tests/pageGeometry.test.js .checks/tests/privacy.test.js .checks/tests/serviceworker.test.js
```

The source privacy checks do not substitute for network inspection of the installed library bundle. Complete the browser network test and inspect the network log while rendering, editing, exporting and running OCR. All document-derived data must remain local; only same-origin packaged assets may be requested.

## Release verification on a connected machine

1. Install dependencies, prepare assets, run `npm run typecheck` and `npm test`.
2. Build production output; install Chromium for Playwright; run `npm run test:browser` for desktop and Pixel 7 projects.
3. Manually inspect added-object placement before/after zoom and page rotation, including nonzero MediaBox origins and pre-existing crop boxes. Verify annotations on duplicated/reordered/extracted pages.
4. Test encrypted and malformed input; verify encrypted export tools remain disabled.
5. Fill each supported form type, export, and inspect values in at least two independent PDF viewers. Test XFA/signature/missing-appearance failures; no unsupported values should silently disappear.
6. Render Unicode Latin/Greek/Cyrillic and a custom font; confirm missing glyphs produce an error. Do not infer complex script support from font embedding alone.
7. Draw/upload/type a signature and inspect it in an exported PDF. Confirm the signature warning is visible.
8. OCR one scan in each available language; cancel both initialization and recognition; inspect memory on a mobile device.
9. Cache all assets, disconnect, reload, open a local PDF, annotate, export and run OCR offline. Confirm caches contain application assets only. Test draft restore, disable recovery and delete stored documents.

Do not publish the unverified project as a completed production PDF editor until these checks are resolved.

Vercel preparation: configuration/package JSON checks, source archive script syntax and TS/TSX syntax compilation pass. Static output and worker/security headers configured; local documents and credentials excluded from deployment upload. No deployment was executed: Vercel integration is unconnected and no local CLI/project/account credentials are available. Hosted smoke tests and production URL verification are pending.

Workflow UI refinement: added a direct original-text toolbar entry, collapsible text inspector that closes on object selection, grouped tool separators, dedicated preview controls, stronger typography and clearer file/page context. Compact navigation buttons have explicit accessible names. Mobile property sheets occupy at most 60% of the viewport. Added browser coverage for opening the text inspector from another panel and updated the welcome-page assertion. TS/TSX syntax and stylesheet delimiter checks pass; browser/visual verification remains pending.

Live original-text preview: implemented a 450 ms debounce with an independent cancellable export worker; cancelled/obsolete results are discarded and any loaded obsolete viewer is destroyed. Errors retain the previous valid preview and surface a local message. Switching pages clears the preview, and Return to source view disables auto-preview. Added browser coverage for latest typing, focus retention, no blocking overlay, too-wide replacement recovery and source-view return. Syntax compilation passes; full project typecheck/browser execution remains pending in Docker.

Premium visual refresh: added a separate responsive stylesheet with opaque document canvases, glass application chrome, reduced-transparency/motion fallbacks and forced-color selection states. Repaired corrupted UI punctuation. TS/TSX syntax compilation and stylesheet delimiter checks pass. Desktop/mobile visual rendering remains unverified here; these source checks are not screenshot or accessibility audit results.

Batch/layer operations: three new tests passed for range rotation/reversal/movement, independent duplicate IDs, deletion guards and immutable object ordering. TS/TSX syntax compilation passes. Added browser coverage for range duplication, all-page deletion prevention and undo; runtime verification remains pending.

Follow-up original-text work: added explicit detection reasons and retry/refresh controls, removed stale standard-font-only UI guidance, and added engine export/reopen coverage for embedded fonts, fractional placement, rotated/cropped pages and independent edits to duplicated pages. Added a desktop/mobile browser scenario for detection, replacement, edited preview, download and reopen. Four extraction/selection regressions and strict standalone typechecking of extraction/validation modules pass. Full project typecheck and engine/browser scenarios remain pending because dependencies and Docker execution are unavailable in this session.

Original text detection now reads text, baseline and full-precision bounds directly from MuPDF's structured-text walker; inspection and export validation use the same extraction path. Four extraction/selection regression tests passed, including fractional coordinates and horizontal/rotated text eligibility. Added a MuPDF integration test that generates a PDF, detects its original text, removes it, reopens the PDF and verifies neighbouring text survives. That integration test runs in `npm test` during Docker build and remains unexecuted in this restricted session. TS/TSX syntax compilation passed.

Context-menu and shortcut browser coverage added for desktop right-click, touch toolbar access, menu keyboard focus, page deletion/undo and input protection. Syntax compilation passed. Browser execution remains pending in the Docker QA environment; these are not reported as passing browser tests.

Extended shortcuts: all drawing tools, page navigation/reordering, crop reset, object rotation, canvas object selection, zoom, panels, print, merge and conversions now have bindings listed in Help. Syntax compilation and 12 model/coordinate/object tests passed. Added browser coverage for tools, zoom, page operations, Help and input protection; execution still pending. Operating system/browser-reserved key combinations can take priority over application handlers.

## Docker asset download recovery

Four download tests passed on 2026-10-14: connection retry, pre-provisioned assets without network access, alternate-source fallback, and exhausted retries leaving no partial asset. Command: `node --test --experimental-test-isolation=none tests/download.test.mjs`. Asset/source scripts pass Node syntax checks; TypeScript/TSX syntax compilation passes. Full Docker build remains unverified from this restricted session. The GNU license download was replaced with a copy from the installed MuPDF package and a GitHub fallback. Fonts, OCR data and MuPDF corresponding source still require build-time connectivity unless pre-provisioned.

## Original text replacement addition

Three content-tokenizer tests passed: escaped/hex/TJ strings, font-state and unsafe-stream rejection, and actual escaped string replacement. TS/TSX syntax compilation passed. Engine-level replacement/reopen tests are provided in `tests/originalText.test.ts`; not executable in this session because pdf-lib remains unavailable. Docker builds run them through `npm test`. This capability remains limited and unverified end-to-end until that build/test succeeds.
