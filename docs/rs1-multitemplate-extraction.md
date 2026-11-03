# Multi-template RS-1 extraction (incremental)

This branch adds **section-first routing** to the existing `/api/extract` response, leaving the current `extractRs1()` and user interface unchanged.

## Architecture

`readDocx()` -> ordered `DocContent.blocks` (paragraphs/tables) -> `segmentRs1Sections()` -> independent `sectionMap.sections`

* Canonical keys `intro:title`, `intro:strategy`, `A:1` ... `A:19`, `B:1` ... `B:10`, and `C:reviewers`.
* Thai and English heading aliases; section number is not the primary identifier.
* Each section carries original block order and source index, paragraphs, tables and combined raw text.
* Missing section warnings instead of inventing values.
* Existing extraction remains in the response and can be compared against `sectionMap` before migrating field-specific parsers.

## Example API fields

```json
{
  "fields": {"projectTitleTH": {"value": "...", "status": "found", "source": "..."}},
  "sectionMap": {
    "order": ["intro:title", "A:1", "A:6"],
    "sections": {
      "A:6": {
        "key": "A:6",
        "part": "A",
        "heading": "6. ความสำคัญ...",
        "paragraphs": ["..."],
        "tables": [],
        "sourceIndex": 19,
        "matchedBy": "number-and-label"
      }
    },
    "warnings": ["ไม่พบส่วน ก ข้อ 19"]
  }
}
```

## Next steps to achieve high-fidelity, variable-template field extraction

1. Move each specialized parser into separate modules by key, starting with `A:1` researchers, `A:5` bilingual keywords, `A:12` month-by-month Gantt, `A:17` budget, `A:18` standards and Part B biographies.
2. Preserve checkboxes per block and table cell, not just global paragraph details.
3. Extract DOCX image relationships and media, attach to the source section; process image text / diagrams using a separate OCR or vision stage with user review. Scanned PDFs need their own document parser first.
4. Add field provenance, review confidence, and explicit `missing` or `unknown` status (never silently assume empty is zero).
5. Compare fields against anonymized stakeholder originals using the same scoring rules as the 11 generated documents.
6. For PDF export, validate line breaks with the actual renderer. The current Windows/Word conversion does not work on Linux.

## Verification

```bash
npm test
npm run build
```

Do not commit identifiable stakeholder RS-1 forms, signatures, or extracted raw data to this public repository. This change is a **routing foundation**, not a guarantee of accurate parsing of every file, OCR, or complete PDF export.
