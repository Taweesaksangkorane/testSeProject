# RS-1 Document Extraction PoC (No AI)

A small **Next.js + Node.js** proof-of-concept for extracting registry-oriented fields from the Mae Fah Luang University Thai **RS-1** proposal template. No AI and no external document processing API. DOCX files are parsed locally.

## Run

```bash
npm install
npm run dev
```

Open **http://localhost:3000**, upload an RS-1 `.docx` file, and review/edit the extracted values.

## Registry fields

- `projectTitleTH`: Thai proposal title
- `projectTitleEN`: English proposal title
- `principalInvestigator`: project leader
- `coResearchers`: co-researcher names
- `durationStart`, `durationEnd`: project dates
- `researchType`: research type section, flagged for human review because Word checkbox state is not always represented as text
- `keywordsTH`, `keywordsEN`: keywords
- `objectives`: objectives
- `expectedOutcomes`: expected outcomes
- `totalBudget`: total amount read from the **actual Word budget table**
- `documentCompleteness`: whether all registry fields were found

Additionally, the app keeps structured co-researcher and budget rows, computes the sum of amount cells, flags a mismatch, and checks for basic Unicode corruption indicators. It intentionally never “autocorrects” Thai combining marks or inserts missing data.

## Privacy

The DOCX is parsed by **your own Next.js server** and returned in an HTTP response. This PoC does **not** persist files or send documents to an AI service. If deployed on a cloud provider, documents will still travel to that provider's server. Use synthetic documents for demos; apply authentication, secure storage, malware protections, logging restrictions, and proper privacy review before using real records.

## Limits

- `.docx` only, max 10MB. Convert legacy `.doc` files with Microsoft Word before upload. PDF is intentionally unsupported because scanned files require OCR and extracted layout can be unreliable.
- Rule-based matching assumes recognizable RS-1 heading text and a two-column budget table.
- XML parser reads `w:t` runs, tabs and line breaks in document body paragraphs and tables, but not textboxes, pictures, tracked changes or arbitrary content-control variants.
- Thai Unicode checks detect common warning indicators, **not** the semantic correctness of every Thai word.
- Requires human review. Different RS-1 form versions may need additional patterns.

## Code layout

- `lib/docx.ts`: DOCX XML reader, preserved run order and tables.
- `lib/extract.ts`: registry-field RS-1 rule parser + validation.
- `app/api/extract/route.ts`: multipart upload API.
- `app/page.tsx`: upload, editable preview, warnings and JSON export.
