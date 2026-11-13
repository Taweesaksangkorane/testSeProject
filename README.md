# 404 Team Found

## Personal Research Grant Management System for Mae Fah Luang University

## Team Members

| Full Name | Student ID | GitHub Username | Role |
|---|---|---|---|
| Taweesak Sangkoranee | 6731503012 | [Taweesaksangkorane](https://github.com/Taweesaksangkorane) | Backend Developer |
| Wichayaphon Seepin | 6731503036 | [6731503036WichayaponSeepin](https://github.com/6731503036WichayaponSeepin) | Project Manager |
| Aubolwan Maneechan | 6731503044 | [6731503044AubonwanManeechan](https://github.com/6731503044AubonwanManeechan) | Frontend Developer |

## Advisor and Stakeholder

**Project Advisor:** Aj. Prasara Jakkaew

**Stakeholder Organization:** Research Administration Division, Mae Fah Luang University

**Coordinator:** Wanwisa Wongsawan  
**Contact Number:** 053-91-6359

## Project Summary

The system helps researchers manage personal research grant proposals, generate documents, and check proposal status. The current proof of concept extracts data from Mae Fah Luang University's Thai RS-1 proposal form into editable input fields.

## RS-1 Document Extraction PoC

This is a Next.js and Node.js proof of concept. DOCX files are parsed locally without AI or an external document-processing API.

### Run locally

```bash
npm install
npm run dev
```

Open `http://localhost:3000`. Users can either complete the RS-1 form manually or upload an RS-1 `.doc`/`.docx`, review the extracted values or raw JSON, add three electronic signature images, edit the form, and save a local draft.

### Supported extraction

- Thai and English project titles
- Strategy and research type
- Principal investigator, co-researchers, advisor, and collaboration details
- Keywords, objectives, methodology, scope, schedule, and expected outcomes
- Editable budget rows, multiplication breakdowns, and calculated total
- Research standards and publication type checkboxes
- Investigator biography and proposed experts
- Thai Unicode warning checks and fields requiring human review

### Current limits

- Supports `.doc` and `.docx` documents up to 10 MB. Legacy `.doc` extraction is text-based, so complex tables may need more manual review than `.docx` files.
- The advisor, principal investigator, and co-researcher signatures support PNG, JPG, and WebP images up to 2 MB each and are stored only in the browser draft.
- PDF is not supported yet because scanned documents require OCR and document layout can vary.
- Rule-based extraction requires recognizable RS-1 headings and must be reviewed by the user.
- The PoC does not persist uploaded files or send them to an AI service.

### Code layout

- `lib/docx.ts` - DOCX XML reader
- `lib/extract.ts` - RS-1 field extraction and validation
- `lib/rs1-sections.ts` - multilingual semantic heading detection and ordered section routing
- `lib/rs1-pipeline.ts` - canonical section evidence, schedule/budget extractors, and validation
- `app/api/extract/route.ts` - DOCX upload API
- `app/page.tsx` - manual entry, upload, review, and local draft interface

### Modular extraction pipeline

The upload API now runs `DOCX/DOC parser -> unified sourceDocument -> semantic section router -> independent section extractors -> canonical evidence -> validation`. The response remains backward compatible: existing `fields`, people, budget, warnings, and `sourceDocument` are still present. New consumers can use `sectionMap` and `canonical`; every canonical field reports status, confidence, source section/block indexes, extraction method, and warnings.

Section routing uses Thai/English heading aliases and document structure rather than page numbers or fixed paragraph offsets. Schedule and budget tables are parsed independently, missing headings remain explicitly `missing`, and embedded DOCX images are retained as evidence instead of being silently discarded.

Repeated Part B headings are also retained in `sectionMap.occurrences`, so biographies from multiple researchers are not collapsed into one section. Structured table evidence includes merged-cell, width, checkbox, and image metadata; unknown checkbox glyphs remain `review` evidence and are never treated as selected values.

Run verification with:

```bash
npm test
npm run build
```

For a real file, start the app, upload the document, and select **ดูข้อมูล JSON** after import. Do not commit stakeholder documents or extracted personal data.

### Deployment and remaining limits

- Standard DOCX and text-only legacy DOC are supported without AI. PDF, scanned PDF, image OCR, and semantic AI fallback are not implemented.
- Embedded image bytes stay inside the uploaded DOCX; JSON exposes safe relationship/path/type/size evidence. OCR/vision must be an optional, consented local provider before image text can be claimed.
- Tables continued across separate Word table elements still require cross-table stitching; current parsing preserves each table and its cell merge/width metadata independently.
- DOCX-to-PDF currently depends on Microsoft Word COM on Windows. A production host needs a separately validated conversion worker (for example, a Windows worker with Word licensing/operations controls or a LibreOffice-based worker with visual regression tests); identical pagination is not assumed.
- Accuracy must be reported separately for section detection, field extraction, tables, and export fidelity. Synthetic tests are regression evidence, not a replacement for the stakeholder fixture evaluation.

See [`docs/rs1-modular-extraction.md`](docs/rs1-modular-extraction.md) for the architecture, before/after comparison, verified evidence, and remaining work.

## Key Links

- [GitHub Repository](https://github.com/Taweesaksangkorane/testSeProject)
- [Google Meet](https://meet.google.com/hwk-bgzu-pou)
