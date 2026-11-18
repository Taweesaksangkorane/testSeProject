# Requirement Traceability Matrix

**Version:** 1.7 — Prototype Implementation & Traceability Update (16 November 2026)

**Evidence baseline:** รายงาน Codex วันที่ 16 พฤศจิกายน 2569, source revision `fb9c532` ของ main workflow demo. เอกสาร requirements 7 ไฟล์เป็นชุดที่ผู้ใช้ส่งให้ตรวจ; Codex ไม่พบ `docs/02-requirements/` ใน source repository ที่ตรวจ. ยังไม่ได้ยืนยันว่า deployed demo ตรง revision นี้.

สถานะ implementation ไม่ใช่ผลตรวจรับ Stakeholder หรือผลทดสอบทุก AC. รักษา PROCESS/CONFIRMED/DESIGN/OPEN ใน requirement.md. Standalone `prototype/rs1-extraction` ไม่พบใน repository ที่ตรวจ (NOT VERIFIED); integrated extraction มี PDF text/DOCX และ mapping 9 fields ตาม audit แต่ยัง PARTIAL; ไม่ใช่ OCR หรือ DOCX-to-PDF แบบคง layout.

## 1. ??????????????

????????????????????? [FR-Prototype.md](../04-evaluation/FR-Prototype.md) ????????????????????????????????? ?????? evidence ??? remaining gap ????????????????????????????????????????? 16 ????????? 2569 ????????????????????????????????????? FR-Prototype.md ??????????????????????????????????????????????????????????

| ????? | ???????? | ????? |
|---|---|---:|
| ?????? | ?????????????????????????? Local Demo ?????????????? workflow ?????? | 17 |
| ??????? | ??????????????????? ??????????????????????????????? | 56 |
| ??????????? | ????????????????????????????????? | 3 |
| **???** | ??????????????????? | **76** |

## 2. Source reference key

Path อ้าง relative ต่อ root ของ source repository ที่ Codex ตรวจ (ไม่ใช่ path ใน docs repository); line anchors อ้าง revision เดิมและไม่ได้ตรวจซ้ำในแชทนี้.

| Key | Source file |
|---|---|
| A | `src/domain/actions.js` |
| M | `src/domain/model.js` |
| P | `src/domain/permissions.js` |
| C | `src/domain/contracts.js` |
| API | `functions/index.js` |
| SP | `src/pages/StaffPages.jsx` |
| RE | `src/pages/ResearcherEditor.jsx` |
| RS | `src/pages/ResearcherSubmission.jsx` |
| RP | `src/pages/ResearcherProposalPDF.jsx` |
| U | `src/pages/UploadDocument.jsx` |
| X | `src/utils/rs1Extraction.js` |
| F | `src/utils/rs1FieldMapping.js` |
| PDF | `src/utils/generateRS1PDF.js` |
| EP | `src/utils/evaluationPDF.js` |
| RW | `src/utils/reviewerWorkspace.js` |
| SW | `src/utils/staffWorkspace.js` |
| CW | `src/utils/commonWorkspace.js` |
| NT | `src/pages/NotificationsTasks.jsx` |

## 3. FR → AC → UC → Prototype implementation

AC ID หนึ่งค่าต่อ FR; ข้อความ AC อยู่ใน [requirement.md](requirement.md). Shared UC แสดงร่วมในคอลัมน์ Related UC; registry gaps ระบุ OPEN ไม่สร้าง UC ใหม่. Source evidence และข้อจำกัดถอดจากรายงาน audit.

| FR ID | AC ID | Related UC | Prototype Implementation | Source:line | Evidence | Remaining gap |
|---|---|---|---|---|---|---|
| FR-COM-01 | AC-COM-01.1 | UC-01, UC-02, UC-03, UC-04, UC-05, UC-06, UC-07, UC-08, UC-09, UC-10, UC-11, UC-12, UC-13, UC-14, UC-15, UC-16, UC-17, UC-18 | บางส่วน | API:25; P:3 | Token/profile authentication แยกจาก local simulation | ยังไม่ทดสอบ live authentication |
| FR-COM-02 | AC-COM-02.1 | UC-01, UC-02, UC-03, UC-04, UC-05, UC-06, UC-07, UC-08, UC-09, UC-10, UC-11, UC-12, UC-13, UC-14, UC-15, UC-16, UC-17, UC-18 | บางส่วน | P:9,15; API:51 | Backend/domain ตรวจ owner/workspace/assignment/capability | Staff authorization ปัจจุบันอิง workspace; individual scope ยัง OPEN |
| FR-COM-03 | AC-COM-03.1 | UC-01, UC-06, UC-07, UC-08, UC-12, UC-14, UC-17 | บางส่วน | P:9; RW:8; SW:19 | กรองรายการตาม owner/assignment/workspace | ยังไม่มี policy staff รายบุคคลที่ยืนยัน |
| FR-COM-04 | AC-COM-04.1 | UC-02, UC-03, UC-04, UC-05, UC-06, UC-07, UC-08, UC-09, UC-10, UC-11, UC-12, UC-13, UC-14, UC-15, UC-16, UC-17, UC-18 | บางส่วน | P:67; CW:15 | Role-specific projection และ guarded detail | ไม่พบช่องว่างหลักในขอบเขตนี้ |
| FR-COM-05 | AC-COM-05.1 | UC-01, UC-02, UC-03, UC-04, UC-05, UC-06, UC-07, UC-08, UC-09, UC-10, UC-11, UC-12, UC-13, UC-14, UC-15, UC-16, UC-17 | ทำแล้ว | A:288 | Append event พร้อม actor/time/state/version | ยังไม่ยืนยัน operational retention |
| FR-RES-01 | AC-RES-01.1 | UC-01 | ทำแล้ว | A:103; M:35 | สร้าง owner-bound DRAFT aggregate | ไม่พบช่องว่างหลัก |
| FR-RES-02 | AC-RES-02.1 | UC-01 | บางส่วน | RE:23; M:8,61 | Manual structured fields และ validation | Approved Data Dictionary/field mapping ยังไม่ครบ |
| FR-RES-03 | AC-RES-03.1 | UC-01 | ทำแล้ว | A:104; RE:23 | บันทึกร่างซ้ำและสร้าง version | ไม่พบช่องว่างหลัก |
| FR-RES-04 | AC-RES-04.1 | UC-02 | บางส่วน | X:22; U:77 | PDF/DOCX validation และ extraction errors | Approved file matrix ยัง OPEN; source storage รับไม่เท่ากัน |
| FR-RES-05 | AC-RES-05.1 | UC-02 | บางส่วน | X:43; F:14 | PDF text/Mammoth และ pattern extraction เก้าฟิลด์ | Mapping/accuracy benchmark ยังไม่มี; ไม่รองรับ OCR |
| FR-RES-06 | AC-RES-06.1 | UC-02 | บางส่วน | U:125,449,494 | แก้ extracted values และยืนยัน review ก่อนใช้ | ไม่พบช่องว่างหลัก |
| FR-RES-07 | AC-RES-07.1 | UC-02 | บางส่วน | RE:23; A:279 | บันทึก reviewed import ลง canonical draft | ไม่พบช่องว่างหลัก |
| FR-RES-08 | AC-RES-08.1 | UC-02 | บางส่วน | U:155; RE:27; A:279 | เก็บ metadata/proposal version และ PDF บางกรณี | DOCX/large PDF source bytes ไม่ถูกเก็บเป็น private source attachment |
| FR-RES-09 | AC-RES-09.1 | UC-03 | บางส่วน | M:61; RP:24 | มี completeness validation และปิด confirmation | Official required fields ยัง OPEN |
| FR-RES-10 | AC-RES-10.1 | UC-03 | บางส่วน | PDF:113; RP:17 | สร้าง PDF จาก selected proposal version; preview ไม่ transition | ยังไม่ได้ตรวจ PDF ทุกฟิลด์ด้วย rendering ในรอบนี้ |
| FR-RES-11 | AC-RES-11.1 | UC-03 | บางส่วน | A:116; RP:23 | Confirm-ready และ version link ใน Local Demo | Backend TR-03 ปิด OPEN-04 |
| FR-RES-12 | AC-RES-12.1 | UC-04 | ทำแล้ว | A:104; C:17 | Save proposal ใน AFFILIATION_REVIEW คงสถานะ | ไม่พบช่องว่างหลัก |
| FR-RES-13 | AC-RES-13.1 | UC-05 | บางส่วน | RS:24; A:36 | แนบ affiliation evidence; ระบุ minutes OR confirmation | ไม่พบช่องว่างหลัก |
| FR-RES-14 | AC-RES-14.1 | UC-05 | บางส่วน | A:127,258; RS:18 | Attach แยกจาก explicit submit | ไม่พบช่องว่างหลัก |
| FR-RES-15 | AC-RES-15.1 | UC-05 | บางส่วน | RS:18; A:46,83 | Submission receipt/time และ duplicate/version guards | ไม่พบช่องว่างหลัก |
| FR-RES-16 | AC-RES-16.1 | UC-06 | บางส่วน | A:132; RS:25 | แสดง notes/requestedBy/requestedAt | ข้อเสนอ mapping ใน audit ได้ปรับในเอกสารนี้; ไม่ได้ทดสอบซ้ำ |
| FR-RES-17 | AC-RES-17.1 | UC-06 | บางส่วน | A:104,136 | Local scoped correction/resubmission คง STAFF_REVIEW | Backend edit scope ยัง OPEN-13 |
| FR-RES-18 | AC-RES-18.1 | UC-08 | บางส่วน | C:3; CW:65 | Canonical states รวม CANCELLED และ actual-event timeline | Legacy labels ต้องแยกให้ชัด |
| FR-RES-19 | AC-RES-19.1 | UC-08 | บางส่วน | A:304; P:89 | Guarded history และ role projection | ไม่พบช่องว่างหลัก |
| FR-RES-20 | AC-RES-20.1 | UC-08, UC-09 | บางส่วน | A:156; NT:33 | แสดง recorded end date และผล extension | Automatic reminder policy แยกไป RES-21 |
| FR-RES-21 | AC-RES-21.1 | UC-08, UC-09 | ยังไม่ได้ทำ | NT:33; A:295 | พบเฉพาะ deadline display และ in_app channel | Scheduler/sending/logging/rescheduling ทั้งชุด |
| FR-SIG-01 | AC-SIG-01.1 | UC-03 | บางส่วน | PDF:56; RP:24 | มี signatory/date fields และ signatory list | ยังไม่ยืนยัน layout ตรง official RS-1/signature block |
| FR-SIG-02 | AC-SIG-02.1 | UC-05 | บางส่วน | RS:24; A:36 | Signed file selection/upload และ required-document guard | Approved file types ยัง OPEN |
| FR-SIG-03 | AC-SIG-03.1 | UC-05 | บางส่วน | M:65; RS:25 | Leader/advisor และ participants confirmation | Participants ยัง free text ไม่ใช่รายชื่อแยกต่อคน |
| FR-SIG-04 | AC-SIG-04.1 | UC-05 | บางส่วน | A:41; RS:25 | Conditional consent confirmation และ rejection | ไม่ใช่ automatic proof of consent |
| FR-SIG-05 | AC-SIG-05.1 | UC-05 | บางส่วน | A:43 | บันทึก project/version/document/actor/time และ snapshot | วิธีพิสูจน์ consent จริงยัง OPEN |
| FR-SIG-06 | AC-SIG-06.1 | UC-06 | บางส่วน | SP:61; P:15 | Staff เปิด submitted bundle และส่งแก้ได้ | ข้อเสนอ mapping ใน audit ได้ปรับในเอกสารนี้; ไม่ได้ทดสอบซ้ำ |
| FR-ADM-01 | AC-ADM-01.1 | UC-06 | บางส่วน | SW:6,19 | Staff queue/filter และ task routing | ไม่พบช่องว่างหลัก |
| FR-ADM-02 | AC-ADM-02.1 | UC-06 | บางส่วน | SP:61; A:46 | Review structured proposal/submitted documents | Source retention จำกัดตาม RES-08 |
| FR-ADM-03 | AC-ADM-03.1 | UC-06 | บางส่วน | SP:61 | มี proposal/budget/document review display | Official checklist ยัง OPEN-06 |
| FR-ADM-04 | AC-ADM-04.1 | UC-06 | บางส่วน | A:132; SP:61 | Staff request พร้อม notes/history/notification | Backend researcher correction loop ยังไม่ครบเพราะ OPEN-13 |
| FR-ADM-05 | AC-ADM-05.1 | UC-07 | บางส่วน | A:142 | Require submitted evidence/confirmation ก่อน pass | ไม่พบช่องว่างหลัก |
| FR-ADM-06 | AC-ADM-06.1 | UC-07 | ทำแล้ว | A:146 | บันทึก committee acknowledgement ภายนอก | ไม่พบการให้ committee อนุมัติใน Web |
| FR-ADM-07 | AC-ADM-07.1 | UC-07 | ทำแล้ว | A:151 | Acknowledgement + staff certification ก่อน IN_PROGRESS | Standards policy ยังแยก OPEN-17 |
| FR-ADM-08 | AC-ADM-08.1 | UC-07 | บางส่วน | SW:19 | Workspace-scoped search/filter | UC-07 ยังอธิบาย search ไม่ชัด |
| FR-ADM-09 | AC-ADM-09.1 | UC-09 | ทำแล้ว | A:156; SP:63 | External outcome/date/reference/history; extension limits | Reminder rescheduling ยังไม่มี |
| FR-ADM-10 | AC-ADM-10.1 | UC-06, UC-07, UC-09, UC-10, UC-12, UC-13, UC-15, UC-16, UC-17 | บางส่วน | A:288; SP:61 | Append audit และแสดงประวัติ | ข้อเสนอ mapping ใน audit ได้ปรับในเอกสารนี้; ไม่ได้ทดสอบซ้ำ |
| FR-ADM-11 | AC-ADM-11.1 | UC-10 | บางส่วน | A:146,156,272 | External reference/date/document records | Official letter-number format ยังไม่ยืนยัน |
| FR-ADM-12 | AC-ADM-12.1 | UC-06, UC-07, UC-09, UC-10, UC-12, UC-13, UC-14, UC-15, UC-16, UC-17 | บางส่วน | A:75; P:15 | Role/state/version/action guards ฝั่ง server/domain | ข้อเสนอ mapping ใน audit ได้ปรับในเอกสารนี้; ไม่ได้ทดสอบซ้ำ |
| FR-ADM-13 | AC-ADM-13.1 | UC-10 | บางส่วน | A:174 | Staff-only approved changes; before/after/actor/time | รองรับสามฟิลด์; final field permission policy ยัง OPEN |
| FR-CLS-01 | AC-CLS-01.1 | UC-11 | บางส่วน | A:53 | Report/publication path selection | ไม่พบช่องว่างหลัก |
| FR-CLS-02 | AC-CLS-02.1 | UC-11 | บางส่วน | A:53 | Required report และ versioned submission | Official supporting-document list ยังไม่ครบ |
| FR-CLS-03 | AC-CLS-03.1 | UC-11 | บางส่วน | A:53 | Summary report + publication evidence | Full Paper/Acceptance criteria ยังไม่ยืนยัน |
| FR-CLS-04 | AC-CLS-04.1 | UC-11 | ทำแล้ว | A:193; C:24 | Explicit submit_closure และ minimum documents | ไม่พบช่องว่างหลัก |
| FR-CLS-05 | AC-CLS-05.1 | UC-12 | บางส่วน | A:198; SP:64 | Staff review ของ files/submission/check | ไม่พบช่องว่างหลักของการเปิดตรวจ |
| FR-CLS-06 | AC-CLS-06.1 | UC-12 | ทำแล้ว | A:194,195 | Request/supplement และ self-transition | ไม่พบช่องว่างหลัก |
| FR-CLS-07 | AC-CLS-07.1 | UC-12, UC-14 | ทำแล้ว | A:203,215 | Report assignment แยก publication closure | ข้อเสนอ mapping ใน audit ได้ปรับในเอกสารนี้; ไม่ได้ทดสอบซ้ำ |
| FR-CLS-08 | AC-CLS-08.1 | UC-13 | ทำแล้ว | A:215 | Staff check + explicit close; upload ไม่ปิดเอง | Official publication evidence criteria ยัง OPEN-14 |
| FR-CLS-09 | AC-CLS-09.1 | UC-15 | บางส่วน | A:239; P:46 | Revised report หลัง release และไม่ประเมินซ้ำ | Supporting list ยัง OPEN |
| FR-CLS-10 | AC-CLS-10.1 | UC-15 | บางส่วน | A:248,254 | Verify latest revised version ก่อน staff close | ข้อเสนอ mapping ใน audit ได้ปรับในเอกสารนี้; ไม่ได้ทดสอบซ้ำ |
| FR-CLS-11 | AC-CLS-11.1 | UC-13, UC-15 | บางส่วน | A:53,239,288 | Submitted versions/actors/times และ closure audit | ข้อเสนอ mapping ใน audit ได้ปรับในเอกสารนี้; ไม่ได้ทดสอบซ้ำ |
| FR-CLS-12 | AC-CLS-12.1 | UC-13, UC-15 | บางส่วน | A:254; C:3 | CLOSED หลัง staff action | ข้อเสนอ mapping ใน audit ได้ปรับในเอกสารนี้; ไม่ได้ทดสอบซ้ำ |
| FR-REV-01 | AC-REV-01.1 | UC-14 | ทำแล้ว | A:203 | Exactly three distinct active reviewers/report assignment | Official appointment อยู่ e-Office |
| FR-REV-02 | AC-REV-02.1 | UC-14 | บางส่วน | RW:8; P:9 | Assigned-only list | ไม่พบช่องว่างหลัก |
| FR-REV-03 | AC-REV-03.1 | UC-14 | บางส่วน | P:30; A:311 | Assigned report document/download guard | ยังไม่รัน Storage integration รอบนี้ |
| FR-REV-04 | AC-REV-04.1 | UC-14 | บางส่วน | A:218; RW:12 | Evaluation schema/type/required validation | Official rubric/result names ยัง OPEN-11 |
| FR-REV-05 | AC-REV-05.1 | UC-14 | ทำแล้ว | A:218 | Save draft แยก submitted flag | ไม่พบช่องว่างหลัก |
| FR-REV-06 | AC-REV-06.1 | UC-14 | ทำแล้ว | A:219; P:48 | Submit timestamp/actor และ submitted lock | ไม่พบช่องว่างหลัก |
| FR-REV-07 | AC-REV-07.1 | UC-14, UC-18 | บางส่วน | RW:30; EP:11; P:22 | Guarded submitted snapshot/PDF; no generated signature | Post-CLOSED access ยังปิด; visual field parity ไม่รันใหม่ |
| FR-REV-08 | AC-REV-08.1 | UC-14, UC-17 | ทำแล้ว | A:203,230,254 | One assignment round และ explicit revised-report closure | Legacy behavior ต้องแยกออก |
| FR-REV-09 | AC-REV-09.1 | UC-14, UC-17 | ทำแล้ว | M:103; A:232 | นับ submitted unique reviewers เท่านั้น | ข้อเสนอ mapping ใน audit ได้ปรับในเอกสารนี้; ไม่ได้ทดสอบซ้ำ |
| FR-REV-10 | AC-REV-10.1 | UC-14, UC-17 | ทำแล้ว | A:233; P:58 | 3/3 + explicit release once + actor/time | ข้อเสนอ mapping ใน audit ได้ปรับในเอกสารนี้; ไม่ได้ทดสอบซ้ำ |
| FR-STD-01 | AC-STD-01.1 | UC-07 | บางส่วน | M:8; A:151 | มี standards field/notes | Structured type/status/authority ยัง OPEN-17 |
| FR-STD-02 | AC-STD-02.1 | UC-07 | บางส่วน | SP:29; A:258 | แนบ standards_evidence ได้ | Certificate agency/number/date metadata ยังไม่ครบ |
| FR-STD-03 | AC-STD-03.1 | UC-07 | ยังไม่ได้ทำ | A:153 | ตั้งใจไม่สร้าง universal blocker | Missing-item warning/block policy รอ OPEN-17 |
| FR-REG-01 | AC-REG-01.1 | OPEN — dedicated UC pending | บางส่วน | SW:19; A:49 | มี submission date/registry list | Round model/window/exceptions ยังไม่ครบ |
| FR-REG-02 | AC-REG-02.1 | OPEN — dedicated UC pending | ยังไม่ได้ทำ | C:36 | ไม่พบ dedicated registry-disposition action | Reason/date/evidence workflow และ authority รอ OPEN-19 |
| FR-REG-03 | AC-REG-03.1 | UC-16 | บางส่วน | M:42; SP:47 | Cancellation record display/model/fixtures และไม่ลบข้อมูล | ไม่มี successful cancellation mutation/audit creation |
| FR-REG-04 | AC-REG-04.1 | OPEN — dedicated UC pending | บางส่วน | SW:27 | มี registry UI แต่ไม่มี verified Excel mapping | Actual columns/values/stages รอ OPEN-21 |
| FR-CAN-01 | AC-CAN-01.1 | UC-16 | บางส่วน | SP:33; A:66; P:21 | Interactive contract preview/reason validation | Cancellation mutation ปิด OPEN-20 |
| FR-CAN-02 | AC-CAN-02.1 | UC-16 | บางส่วน | A:66,85,94; P:21 | Reject invalid reason/origin/terminal/permission | Success-path audit ยังทำงานไม่ได้ |

## 4. UC-01–UC-18 → FR

| UC ID | Use case | Direct FR |
|---|---|---|
| UC-01 | สร้างและบันทึกร่างโครงการ | FR-RES-01, FR-RES-02, FR-RES-03 |
| UC-02 | อัปโหลดและสกัดข้อมูล RS-1 | FR-RES-04, FR-RES-05, FR-RES-06, FR-RES-07, FR-RES-08 |
| UC-03 | จัดทำ PDF ฉบับพร้อมยื่นต้นสังกัด | FR-RES-09, FR-RES-10, FR-RES-11, FR-SIG-01 |
| UC-04 | แก้ไขข้อเสนอตามความเห็นต้นสังกัด | FR-RES-12 |
| UC-05 | ยืนยันส่งข้อเสนอให้เจ้าหน้าที่ | FR-RES-13, FR-RES-14, FR-RES-15, FR-SIG-02, FR-SIG-03, FR-SIG-04, FR-SIG-05 |
| UC-06 | ตรวจข้อเสนอและส่งกลับแก้ไข | FR-ADM-01, FR-ADM-02, FR-ADM-03, FR-ADM-04, FR-RES-16, FR-RES-17, FR-SIG-06 |
| UC-07 | บันทึกผลตรวจผ่านและรับรองโครงการ | FR-ADM-05, FR-ADM-06, FR-ADM-07, FR-ADM-08, FR-STD-01, FR-STD-02, FR-STD-03 |
| UC-08 | ดูสถานะ ประวัติ และรับอีเมลเตือน | FR-RES-18, FR-RES-19, FR-RES-20, FR-RES-21, FR-COM-05 |
| UC-09 | บันทึกผลขยายเวลา | FR-ADM-09, FR-RES-20, FR-RES-21 |
| UC-10 | บันทึกผลและปรับปรุงข้อมูลโครงการ | FR-ADM-10, FR-ADM-11, FR-ADM-12, FR-ADM-13 |
| UC-11 | ยื่นเอกสารปิดโครงการ | FR-CLS-01, FR-CLS-02, FR-CLS-03, FR-CLS-04 |
| UC-12 | ตรวจเอกสารปิดและขอเอกสารเพิ่ม | FR-CLS-05, FR-CLS-06, FR-CLS-07 |
| UC-13 | ปิดโครงการเส้นทางผลงานเผยแพร่ | FR-CLS-08, FR-CLS-11, FR-CLS-12 |
| UC-14 | ประเมินรายงานวิจัย 5 บท | FR-CLS-07, FR-REV-01, FR-REV-02, FR-REV-03, FR-REV-04, FR-REV-05, FR-REV-06, FR-REV-07, FR-REV-08, FR-REV-09, FR-REV-10 |
| UC-15 | ส่งรายงานฉบับแก้ไขและปิดโครงการ | FR-CLS-09, FR-CLS-10, FR-CLS-11, FR-CLS-12 |
| UC-16 | ยกเลิกโครงการและบันทึกเหตุผล | FR-REG-03, FR-CAN-01, FR-CAN-02 |
| UC-17 | ตรวจครบและส่งผลประเมินให้นักวิจัย | FR-REV-08, FR-REV-09, FR-REV-10 |
| UC-18 | สร้างและดาวน์โหลด PDF ผลประเมิน | FR-REV-07 |

## Cross-cutting applicability / Registry gaps

ข้อกำหนดร่วมใช้ตามบริบทของงาน ไม่ได้หมายความว่าทุก UC มีฟังก์ชันแยกหรือผ่านทดสอบแล้ว.

| FR | UC ที่เกี่ยวข้อง (shared behavior) |
|---|---|
| FR-COM-01 | UC-01, UC-02, UC-03, UC-04, UC-05, UC-06, UC-07, UC-08, UC-09, UC-10, UC-11, UC-12, UC-13, UC-14, UC-15, UC-16, UC-17, UC-18 |
| FR-COM-02 | UC-01, UC-02, UC-03, UC-04, UC-05, UC-06, UC-07, UC-08, UC-09, UC-10, UC-11, UC-12, UC-13, UC-14, UC-15, UC-16, UC-17, UC-18 |
| FR-COM-03 | UC-01, UC-06, UC-07, UC-08, UC-12, UC-14, UC-17 |
| FR-COM-04 | UC-02, UC-03, UC-04, UC-05, UC-06, UC-07, UC-08, UC-09, UC-10, UC-11, UC-12, UC-13, UC-14, UC-15, UC-16, UC-17, UC-18 |
| FR-COM-05 | UC-01, UC-02, UC-03, UC-04, UC-05, UC-06, UC-07, UC-08, UC-09, UC-10, UC-11, UC-12, UC-13, UC-14, UC-15, UC-16, UC-17 |
| FR-ADM-10 | UC-06, UC-07, UC-09, UC-10, UC-12, UC-13, UC-15, UC-16, UC-17 |
| FR-ADM-12 | UC-06, UC-07, UC-09, UC-10, UC-12, UC-13, UC-14, UC-15, UC-16, UC-17 |

| FR ที่ยังไม่มี dedicated UC | สถานะ / แนวทาง |
|---|---|
| FR-REG-01 | PARTIAL; scenario รอบรับข้อเสนอรอ OPEN-18 |
| FR-REG-02 | NOT IMPLEMENTED; scenario รอ OPEN-19 |
| FR-REG-04 | ???????; scenario/Data Dictionary รอ OPEN-21 |

## 5. State reconciliation

ดู mapping legacy phases และ canonical states รวม TR-01–17 ใน [State Transition Diagram.md](State%20Transition%20Diagram.md#9-demo-phase--canonical-state-reconciliation-v17). Canonical 9 states ตรงเอกสาร; legacy 9 phases ไม่ใช่ 9 states เดียวกัน. CANCELLED มี model/preview แต่ positive mutation ปิด.

## 6. Verification results and limits

รายงาน Codex ระบุ `node --test tests/*.test.js`: 116 passed, 0 failed, 0 skipped; ESLint exit code 0. ไม่ได้รัน build, Firebase emulator HTTP/API/Rules, browser E2E, live Firebase/Auth/Storage/email หรือ official PDF field/layout verification; standalone artifact ไม่พบ. ไม่เท่ากับ 76 FR ผ่าน AC ทั้งหมด. ไม่ได้ตรวจ source ซ้ำในแชทนี้.

ข้อเสนอ SP1: ยืนยัน OPEN policies และ MVP; email subsystem; extraction benchmark/Data Dictionary/source retention; official rubric และ document checklist; research standards/registry; legacy migration; emulator/E2E/UX verification.
