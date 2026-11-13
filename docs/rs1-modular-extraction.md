# RS-1 modular extraction delivery report

## Outcome

The upload path now keeps the existing UI and legacy extraction response while adding an additive, section-based pipeline:

```text
DOCX / legacy DOC upload
  -> validation and type selection
  -> unified ordered sourceDocument
  -> Thai/English semantic section routing
  -> independent narrative, schedule, and budget extraction
  -> canonical field evidence and validation
  -> existing editable form / preview / DOCX / PDF workflow
```

The architecture does not use page numbers, document page count, or fixed paragraph offsets. It retains source block indexes as provenance only.

Draft PR #1 (`origin/feature/rs1-section-extraction`) was reviewed before continuing. Its semantic heading router was retained and extended on `feature/rs1-modular-extraction`; the draft branch was not merged into `main`.

## Implementation map

| File | Responsibility |
|---|---|
| `lib/docx.ts` | Local DOCX/legacy DOC adapters and the ordered unified representation. DOCX tables retain cell spans, vertical merge state, width, checkbox evidence, and image evidence. |
| `lib/rs1-sections.ts` | Thai/English semantic heading aliases, part boundaries, reordered/renumbered headings, repeated biography occurrences, and ordered section blocks. |
| `lib/rs1-pipeline.ts` | Backward-compatible orchestration, canonical field evidence, schedule/budget extractors, fallback table classification, and validation. |
| `app/api/extract/route.ts` | Existing multipart endpoint and input/error contract; invokes the modular pipeline. |
| `tests/rs1-sections.test.mjs` | Thai/English routing, missing/reordered headings, absent Part A marker, and repeated biography coverage. |
| `tests/rs1-pipeline.test.mjs` | Canonical evidence, two-column/matrix schedules, unknown marks, and budget coverage. |
| `tests/source-document.test.mjs` | Ordered source and OOXML table-structure coverage. |

Detailed implementation contracts are in `.github/modernize/rearchitecture/artifacts/`.

## Canonical evidence

The API still returns the original top-level `Extraction` fields used by the UI. It now additionally returns:

- `sourceDocument`: complete ordered paragraph/table evidence, not only recognized fields;
- `sectionMap.sections`: the first canonical occurrence for each standard heading;
- `sectionMap.occurrences`: every detected occurrence, including repeated Part B biography headings;
- `sectionMap.order`: source order, with suffixed keys such as `B:1#2` for later occurrences;
- `canonical`: project fields, Part A sections, biographies, reviewers, image evidence, validation issues, and warnings.

Canonical scalar/table evidence carries `value`, `status`, `confidence`, `sourceSection`, `sourceBlocks`, `extractionMethod`, and `warnings`. Values are never synthesized when evidence is missing. Unknown checkbox glyphs are excluded from selected values and reported for review.

## Before vs after

| Concern | Before | After |
|---|---|---|
| Section boundary | Mostly field-specific paragraph regex rules | Independent semantic router with Thai/English aliases and ordered blocks |
| Template order | Some rules depended on expected neighboring headings | Labels win over numbering; reordered and renumbered headings are tested |
| Missing Part A marker | Later Part A headings could be missed | A strong semantic Part A heading can establish the part boundary |
| Multiple biographies | Repeated headings could be merged into unrelated current content | Repeated Part B headings are retained as separate occurrences |
| Source preservation | Paragraphs/tables plus earlier source JSON | Ordered blocks plus structured table cells, checkbox evidence, and image evidence |
| Schedule | Legacy text/table mapping | Independent two-column and checkbox-matrix extractor |
| Unknown checkbox | Evidence retained, but a pipeline path could count unknown as selected | Unknown stays unselected and forces `review` |
| Budget with missing amount | Rows could appear successfully extracted | Row value is retained, amount stays `null`, and section status is `review` |
| API/UI compatibility | Legacy response consumed directly by the form | Legacy response remains; canonical data is additive |

## Verified evidence

On 4 November 2026:

- `npm.cmd test`: 48 tests passed, 0 failed.
- `npm.cmd run build`: Next.js production build passed, including type checking and all routes.
- `git diff --check`: expected before commit/PR handoff.
- Direct parser run against `public/templates/rs1-private-template.docx`:
  - 154 parsed paragraph records;
  - 2 tables;
  - 19 checkbox marks;
  - 0 embedded images;
  - 30 detected section occurrences;
  - 17 Part A headings detected.

The private stakeholder 13-page document and the previously reported 11-form evaluation set were not present in this workspace. Therefore these results are regression and structural evidence, not a new field-accuracy percentage. No real document, personal data, signature, or extracted identifying JSON is added to Git.

## Run and inspect a document

```powershell
npm.cmd install
npm.cmd test
npm.cmd run build
npm.cmd run dev
```

Open `http://localhost:3000`, upload a `.docx` or `.doc` no larger than 10 MiB, open the JSON review, then inspect:

1. `sourceDocument.blocks` for source completeness;
2. `sectionMap.order` and `sectionMap.occurrences` for routing;
3. `canonical.*.status`, `confidence`, `sourceBlocks`, and `warnings`;
4. the editable form before preview or export.

For a stakeholder evaluation, prepare an expected-value sheet outside the public repository and score these separately:

- section detection accuracy;
- field extraction accuracy;
- table extraction accuracy;
- document export fidelity.

Never combine them into one undocumented percentage.

## Supported now

- Local `.docx` parsing, including Thai text, tables, common Word/Unicode checkbox forms, and embedded-image evidence.
- Best-effort text extraction for legacy `.doc`.
- Thai/English standard headings, changed page length, moved/renumbered sections, and missing-section warnings.
- Complete ordered source representation before specialized parsing.
- Independent schedule and budget extraction with explicit review states.
- Existing editable form, native DOCX generation, and Windows Word-COM PDF conversion paths.

## Remaining limits and next adapters

### PDF with text layer

Add a `PdfTextDocumentParser` that emits the same unified blocks, tables, images, and provenance. It must not bypass section routing or write directly to RS-1 fields. Reading order and tables need fixture-based verification.

### Scanned PDF / OCR / vision

Add an explicitly enabled local or approved server-side adapter. Preserve page/image evidence, OCR text, bounding boxes, provider/version, and review status. Personal documents must not be sent to an external provider without authorization. OCR output is evidence, not automatically trusted field truth.

### Research framework images

The current DOCX adapter records image relationship/path/type/size, but it does not interpret the diagram. A future vision adapter should attach extracted nodes/edges to the source image and keep the original image available for human review.

### Table continuation and biographies

Cell spans and vertical merges are preserved per table. Tables split into separate OOXML table elements are not stitched automatically. Repeated biography sections are routed independently, while the existing specialized biography field parser remains the compatibility source until real multi-researcher fixtures define and verify the new canonical mapping.

### Production PDF conversion

The current converter requires Microsoft Word COM on Windows. A hosted deployment needs either a controlled Windows conversion worker with appropriate Microsoft licensing/operations controls or a separately validated LibreOffice worker. Pagination and font fidelity must be compared visually before switching providers.
