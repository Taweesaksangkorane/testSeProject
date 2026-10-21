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

Open `http://localhost:3000`. Users can either complete the RS-1 form manually or upload an RS-1 `.docx`, review the extracted values, edit them, and save a local draft.

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

- Supports `.docx` only, up to 10 MB.
- Legacy `.doc` files must be opened in Microsoft Word and saved as `.docx` before upload.
- PDF is not supported yet because scanned documents require OCR and document layout can vary.
- Rule-based extraction requires recognizable RS-1 headings and must be reviewed by the user.
- The PoC does not persist uploaded files or send them to an AI service.

### Code layout

- `lib/docx.ts` - DOCX XML reader
- `lib/extract.ts` - RS-1 field extraction and validation
- `app/api/extract/route.ts` - DOCX upload API
- `app/page.tsx` - manual entry, upload, review, and local draft interface

## Key Links

- [GitHub Repository](https://github.com/Taweesaksangkorane/testSeProject)
- [Google Meet](https://meet.google.com/hwk-bgzu-pou)
