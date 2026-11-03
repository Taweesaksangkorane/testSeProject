# Existing tech stack

- TypeScript and React 19 on Next.js 15.5.28.
- Node.js App Router runtime for all API handlers.
- `jszip` 3.10.1 and `fast-xml-parser` 5.2.5 for DOCX OOXML parsing.
- `word-extractor` 1.0.4 for best-effort legacy `.doc` text extraction.
- Node's built-in test runner with `--experimental-strip-types`.
- Microsoft Word COM, invoked by PowerShell, for the current DOCX-to-PDF conversion path.

No database, ORM, authentication provider, message broker, or external document-processing service is present. The repository does not declare a Node engine ceiling/floor. The Word COM dependency is the material runtime portability constraint.
