# Project structure

- Project type: full-stack Next.js proof of concept.
- Entry points: the browser form at `app/page.tsx` and three App Router POST handlers under `app/api/`.
- Parsing/extraction layer: `lib/docx.ts`, `lib/extract.ts`, `lib/rs1-sections.ts`, and `lib/rs1-pipeline.ts`.
- UI/export layer: `app/page.tsx`, `app/rs1-preview.tsx`, `app/api/generate-docx/route.ts`, and `app/api/convert-docx-pdf/route.ts`.
- Verification: six Node test files under `tests/`; `npm test` runs all `*.test.mjs` files.
- Static assets: the private native Word template and legacy page reference images under `public/`.

Functional areas are upload validation, document parsing, legacy field extraction, semantic section routing, canonical validation, editable form review, DOCX generation, and PDF conversion.
