# Feature matrix

“Implemented” below means code exists, not that runtime validation has completed. The restricted environment prevented dependency/asset installation and production/browser tests. **All PDF-engine and browser features require validation before release.** See [TEST_RESULTS.md](TEST_RESULTS.md).

Additional controls: page-range rotation, duplication, deletion, reversal and moving as a block are implemented in Organize pages. Added objects have bring-to-front/back and move-forward/back controls. These operations retain edits and use the existing undo history. Three operation tests pass; browser coverage is provided and execution remains pending.

| Feature | Status | Scope / exact limitation |
| --- | --- | --- |
| Next.js App Router / TypeScript / static export | Implemented | No application backend or external storage |
| Local PDF selection / drag and drop | Implemented | 100 MB per input |
| PDF.js local workers, CMaps, fonts | Limited | Asset preparation script exists; required packages/assets not obtainable in this environment |
| Desktop editor / mobile toolbar and sheets | Implemented | Browser/touch validation pending |
| Accessibility | Limited | Labels, tab navigation, object selection list, focus styles, reduced motion; full audit pending |
| Thumbnails / page count / name | Implemented | Ten thumbnails around scroll window |
| Zoom / width fit / page fit / navigation | Implemented | Single active page; zoom 20–300% |
| Selectable text / text search | Implemented | Search results by matching page; no OCR-derived searchable layer |
| Progressive / virtual rendering | Implemented | One active page plus virtual thumbnails; file bytes loaded locally in full |
| Malformed PDF messages | Implemented | Export/render failures surfaced; no repair engine |
| Password PDF opening | Limited | PDF.js password viewing only; encrypted export disabled |
| Added multiline text / font / color / alignment | Implemented | Manual line breaks, embedded local font, no automatic wrapping |
| Existing text replacement | Limited | MuPDF removes original eligible horizontal glyphs; Noto/local-font replacements; edited-page preview; embedded-font support; no paragraph reflow, scan rewriting or original-font matching; integration/browser validation pending |
| Original image editing | Unsupported | No original-image replacement engine implemented |
| Move / resize / rotate / duplicate / delete overlays | Implemented | Pointer controls, property inputs and keyboard movement |
| PNG / JPEG insertion | Implemented | Aspect ratio kept; unusual JPEG EXIF orientation needs review |
| Freehand / shapes / lines / arrows | Implemented | Configurable color/thickness; drawing tool uses pointer capture |
| Selected-text highlight / underline / strike | Limited | Rectangle-based text selection geometry; check unusually rotated/vertical text |
| Sticky notes / comments | Limited | Visible editable notes in workspace; flattened visible notes in exported PDF |
| Undo / redo | Implemented | Immutable page/object/form snapshots, last 60 operations; no history across reload |
| Keyboard shortcuts / touch | Implemented | Mobile ordering has move-earlier/later fallback; browser tests pending |
| Blank / delete / duplicate / reorder / rotate pages | Implemented | At least one page remains |
| Page drag ordering | Implemented | Desktop HTML drag/drop; explicit ordering buttons for touch |
| Crop visual selection | Limited | CropBox only; underlying content retained |
| Merge PDFs | Limited | 150 MB combined; encrypted files unsupported; merged forms flattened |
| Split / range extraction | Implemented | Exports edited pages; individual split downloads may need browser permission |
| Page numbers / watermark / header / footer | Implemented | Added editable text stamps, flattened on export |
| Edits follow page operations | Implemented | Stable page IDs; coordinate/reorder unit tests passed |
| Existing text / checkbox / radio / dropdown fields | Limited | Existing fields from first source; panel editing; values flattened on export; new fields may remain interactive |
| New form-field creation | Implemented | Text, checkbox, radio, dropdown; configure values/options; interactive or flattened output; page-level rotation |
| Typed / drawn / uploaded visual signatures and initials | Implemented | No certificate signing; original digital signatures invalidated |
| Local OCR | Limited | Worker implementation; English/French/German; current page only; assets need preparation |
| OCR progress / cancellation / language / memory cap | Implemented | Worker termination; 8 MP cap; startup cancellation completes after worker initialization |
| Searchable scanned PDFs | Unsupported | No validated invisible-text embedding pipeline |
| PDF page to PNG / JPEG | Implemented | Current edited page; 24 MP cap |
| Images to PDF | Implemented | PNG/JPEG; 50 images, 100 MB; worker processing |
| Text to downloadable TXT | Limited | Extracted source plus added text; source text under crops still included |
| Word / Excel / PowerPoint conversion | Unsupported | No suitable local conversion engine |
| Password encryption / decryption export | Unsupported | pdf-lib cannot perform these operations |
| Remove metadata | Limited | Output Info / page Metadata; not comprehensive sanitization |
| Secure redaction | Unsupported | Overlays and CropBox changes never advertised as secure removal |
| Valid edited PDF download | Implemented | Flattened overlays/source forms, optionally interactive new fields; reopen tests provided but not run |
| Editable PDF annotations | Unsupported | General objects remain editable only in workspace/draft; new form widgets can remain interactive |
| Selected page export | Implemented | Same edited export pipeline as full document |
| Print | Limited | Local edited PDF; depends on browser PDF-viewer printing support |
| Unicode text | Limited | Local embedded Noto Latin/Greek/Cyrillic; custom fonts; missing glyphs rejected |
| Original page sizes / crop boxes / rotations | Implemented | Canonical MediaBox coordinates; geometry unit tests passed; rendering QA pending |
| Comments and form values preserved | Limited | Flattened new notes/form appearances; complex native annotations need review |
| Optional IndexedDB recovery / delete drafts | Implemented | Explicit opt-in; one local draft; device persistence clearly explained |
| Unsaved-change warning | Limited | Browser beforeunload; mobile OS termination can bypass it |
| PWA / offline | Implemented | Generated local asset allowlist; initial caching required; browser QA pending |
| No service-worker document caching | Implemented | Only allowlisted build assets intercepted |
| Worker cleanup / progress / conflict prevention | Implemented | Worker termination, render cancellation, URL cleanup, busy overlay |
| Error boundary / recoverable errors | Implemented | App Router boundary, operation and page errors, optional draft restore |
| Local-only document processing | Implemented | Twenty-three independent checks include runtime endpoint/asset-allowlist checks; network browser test pending |
