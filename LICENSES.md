# Library licenses and distribution notes

| Dependency / asset | License | Source |
| --- | --- | --- |
| Next.js | MIT | https://github.com/vercel/next.js |
| React / React DOM | MIT | https://github.com/facebook/react |
| pdf-lib | MIT | https://github.com/Hopding/pdf-lib |
| @pdf-lib/fontkit | MIT | https://github.com/Hopding/fontkit |
| PDF.js | Apache-2.0 | https://github.com/mozilla/pdf.js |
| MuPDF native text engine | AGPL-3.0-or-later | https://github.com/ArtifexSoftware/mupdf |
| fflate (source archive generation) | MIT | https://github.com/101arrowz/fflate |
| Lucide | ISC | https://github.com/lucide-icons/lucide |
| idb | ISC | https://github.com/jakearchibald/idb |
| Tesseract.js / Tesseract.js core | Apache-2.0 | https://github.com/naptha/tesseract.js |
| Tesseract engine / trained data | Apache-2.0 | https://github.com/tesseract-ocr/tesseract / https://github.com/tesseract-ocr/tessdata |
| Leptonica in OCR core | BSD-2-Clause | https://github.com/DanBloomberg/leptonica |
| Noto Sans / Noto Serif | SIL Open Font License 1.1 | https://github.com/notofonts/noto-fonts |
| TypeScript / Playwright (development) | Apache-2.0 | Respective Microsoft repositories |
| tsx (development) | MIT | https://github.com/privatenumber/tsx |

`npm run assets` copies the installed libraries' license files into `public/licenses/` and Noto's license into `public/fonts/OFL.txt`. PDF.js standard fonts/CMaps retain the notices distributed with that package. Retain those directories in deployment; do not strip notices. Consult installed package licenses and transitive notices before redistribution. OCR core incorporates upstream engine/Leptonica code; retain their notices as well. Build-time assets are obtained from upstream repositories. For a reproducible release, vendor the reviewed downloads and record their hashes; the asset script intentionally reuses already-present local files.

Custom uploaded fonts remain on the user's device. Users must hold appropriate rights to embed the font in their exported PDFs. The editor does not upload or distribute them.

Engine facts and limitations are based on the primary documentation: [PDF.js API](https://mozilla.github.io/pdf.js/api/draft/module-pdfjsLib.html), [pdf-lib API](https://pdf-lib.js.org/docs/api/classes/pdfdocument), [pdf-lib limitations](https://github.com/Hopding/pdf-lib#limitations), and [local Tesseract installation](https://github.com/naptha/tesseract.js/blob/master/docs/local-installation.md).
