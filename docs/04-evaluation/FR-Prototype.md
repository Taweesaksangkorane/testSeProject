# ตารางติดตาม Functional Requirements ของ Prototype

เทียบรายการและเกณฑ์กับ [Requirements v1.7](../Documents/GitHub/seminar69-404-team-found/docs/02-requirements/requirement.md) ครบ **76 ข้อ** และพิจารณาจากโค้ดปัจจุบันและผลทดสอบ Local Demo วันที่ 18 พฤศจิกายน 2569

| สถานะ | จำนวน | ความหมาย |
|---|---:|---|
| ทำแล้ว | 17 | มีพฤติกรรมตามเกณฑ์ในขอบเขต Local Demo และมีกรณีทดสอบ workflow รองรับ |
| บางส่วน | 56 | มีความสามารถบางส่วน แต่มีเงื่อนไขที่ยังขาด ต่างจาก Requirement หรือหลักฐานยังไม่ครอบคลุมเกณฑ์ทั้งหมด |
| ยังไม่ได้ทำ | 3 | ยังไม่มีความสามารถหลักตามข้อนั้นในโค้ดปัจจุบัน |

**ขอบเขต:** การจัดสถานะนี้ประเมิน Prototype และข้อมูลจำลองในเครื่อง ไม่ใช่การรับรองระบบจริงหรือการทดสอบผ่านหน้าเว็บทุกข้อ การมีไฟล์โค้ดเป็นหลักฐานว่ามีการพัฒนา ไม่ใช่ผลทดสอบการใช้งานครบทุกกรณี ข้อที่หลักฐานไม่พอจึงอยู่ใน “บางส่วน”

> **หน่วยนับสำหรับรายงาน:** ตารางนี้นับข้อกำหนดเชิงหน้าที่ 76 ข้อ (ทำแล้ว 17 ข้อ บางส่วน 56 ข้อ และยังไม่ได้ทำ 3 ข้อ) ส่วนจำนวนกรณีทดสอบโค้ดด้านล่างเป็นข้อมูลทางเทคนิคแยกต่างหาก ไม่ใช่จำนวนข้อกำหนดที่ผ่าน และไม่ใช่ผลทดลองผ่านเว็บไซต์ครบทุกข้อ

ชุดทดสอบเฉพาะ storage, การยกเลิก, ปิดจากรายงานเดิม, แจ้งเตือนผู้ทรงฯ และ workflow ผ่าน **8/8**; ระบบจริง, Firebase Emulator และการทดสอบผ่านเบราว์เซอร์ยังไม่มีผลยืนยันในรอบนี้ ดูรายละเอียดใน [Traceability](../Documents/GitHub/seminar69-404-team-found/docs/02-requirements/Traceability.md)

การปิดจากรายงานฉบับเดิมเมื่อผู้ทรงฯ ทั้งสามไม่ขอแก้ไขเป็นเงื่อนไขเพิ่มตามคำสั่งผู้ใช้ ซึ่งเอกสารสถานะยังไม่ได้ปรับให้ตรง ส่วนสิทธิ์ยกเลิกในระบบจริงยังเป็น OPEN-20

## การเข้าถึงและข้อมูลโครงการ

| FR และข้อกำหนด | ทำแล้วหรือยัง | หลักฐานและข้อจำกัด |
|---|---|---|
| FR-COM-01 — ระบบต้องระบุตัวตนและบทบาทผู้ใช้ก่อนเข้าถึงข้อมูลที่ปกป้อง | บางส่วน | [index.js](../Documents/GitHub/MFU-Research-Grant-UI-Demo/functions/index.js), [permissions.js](../Documents/GitHub/MFU-Research-Grant-UI-Demo/src/domain/permissions.js) — Token/profile authentication แยกจาก local simulation; ยังไม่ทดสอบ live authentication |
| FR-COM-02 — ระบบต้องตรวจสิทธิ์สำหรับการอ่าน แก้ไข ดาวน์โหลด และเปลี่ยนสถานะ | บางส่วน | [permissions.js](../Documents/GitHub/MFU-Research-Grant-UI-Demo/src/domain/permissions.js), [index.js](../Documents/GitHub/MFU-Research-Grant-UI-Demo/functions/index.js) — ตรวจ owner/workspace/assignment; สิทธิ์เจ้าหน้าที่รายบุคคลยังเปิด และไม่ได้ทดสอบระบบจริง |
| FR-COM-03 — ระบบต้องแสดงรายการโครงการตามบทบาทและสิทธิ์ | บางส่วน | [permissions.js](../Documents/GitHub/MFU-Research-Grant-UI-Demo/src/domain/permissions.js), [staffWorkspace.js](../Documents/GitHub/MFU-Research-Grant-UI-Demo/src/utils/staffWorkspace.js) — แยกรายการตามเจ้าของและผู้ได้รับมอบหมาย; ขอบเขตเจ้าหน้าที่รายบุคคลยังไม่ยืนยัน |
| FR-COM-04 — ระบบต้องแสดงรายละเอียดโครงการที่จำเป็นต่อแต่ละบทบาท | บางส่วน | [permissions.js](../Documents/GitHub/MFU-Research-Grant-UI-Demo/src/domain/permissions.js), [commonWorkspace.js](../Documents/GitHub/MFU-Research-Grant-UI-Demo/src/utils/commonWorkspace.js) — Role-specific projection และ guarded detailในขอบเขตนี้; หลักฐานปัจจุบันยังไม่ครอบคลุมเกณฑ์ทั้งหมด |
| FR-COM-05 — ระบบต้องบันทึกเหตุการณ์สำคัญพร้อมผู้กระทำและเวลา | ทำแล้ว | [actions.js](../Documents/GitHub/MFU-Research-Grant-UI-Demo/src/domain/actions.js) — Append event พร้อม actor/time/state/version; ยังไม่ยืนยัน operational retention; มีกรณีทดสอบ workflow ของ Local Demo ผ่าน |

## งานนักวิจัยและข้อเสนอ

| FR และข้อกำหนด | ทำแล้วหรือยัง | หลักฐานและข้อจำกัด |
|---|---|---|
| FR-RES-01 — นักวิจัยต้องสร้างโครงการใหม่ได้ | ทำแล้ว | [actions.js](../Documents/GitHub/MFU-Research-Grant-UI-Demo/src/domain/actions.js), [model.js](../Documents/GitHub/MFU-Research-Grant-UI-Demo/src/domain/model.js) — สร้าง owner-bound DRAFT aggregate; มีกรณีทดสอบ workflow ของ Local Demo ผ่าน |
| FR-RES-02 — นักวิจัยต้องกรอกข้อมูล RS-1 ตามชุดฟิลด์ที่ระบบรองรับ | บางส่วน | [ResearcherEditor.jsx](../Documents/GitHub/MFU-Research-Grant-UI-Demo/src/pages/ResearcherEditor.jsx), [model.js](../Documents/GitHub/MFU-Research-Grant-UI-Demo/src/domain/model.js) — Manual structured fields และ validation; Approved Data Dictionary/field mapping ยังไม่ครบ |
| FR-RES-03 — นักวิจัยต้องแก้ไขและบันทึกร่างซ้ำได้ | ทำแล้ว | [actions.js](../Documents/GitHub/MFU-Research-Grant-UI-Demo/src/domain/actions.js), [ResearcherEditor.jsx](../Documents/GitHub/MFU-Research-Grant-UI-Demo/src/pages/ResearcherEditor.jsx) — บันทึกร่างซ้ำและสร้าง version; มีกรณีทดสอบ workflow ของ Local Demo ผ่าน |
| FR-RES-04 — ระบบต้องรองรับการอัปโหลดไฟล์ RS-1 เพื่อนำเข้าข้อมูล | บางส่วน | [UploadDocument.jsx](../Documents/GitHub/MFU-Research-Grant-UI-Demo/src/pages/UploadDocument.jsx), [rs1Extraction.js](../Documents/GitHub/MFU-Research-Grant-UI-Demo/src/utils/rs1Extraction.js) — นำเข้า PDF/DOCX; ชนิดไฟล์ที่อนุมัติจริงยังไม่ยืนยัน |
| FR-RES-05 — ระบบต้องสกัดข้อมูลสำคัญจากเอกสาร RS-1 ที่อัปโหลด | บางส่วน | [UploadDocument.jsx](../Documents/GitHub/MFU-Research-Grant-UI-Demo/src/pages/UploadDocument.jsx), [rs1Extraction.js](../Documents/GitHub/MFU-Research-Grant-UI-Demo/src/utils/rs1Extraction.js) — สกัดข้อความและแสดงฟิลด์; mapping/ความแม่นยำยังไม่ยืนยัน ไม่ใช่ OCR |
| FR-RES-06 — นักวิจัยต้องตรวจสอบและแก้ค่าที่สกัดได้ก่อนยืนยัน | บางส่วน | [UploadDocument.jsx](../Documents/GitHub/MFU-Research-Grant-UI-Demo/src/pages/UploadDocument.jsx) — ตรวจและแก้ข้อมูลที่สกัดก่อนส่งไปฟอร์ม |
| FR-RES-07 — ระบบต้องบันทึกข้อมูลที่ผู้ใช้ยืนยันหลังการสกัดลงในร่าง | บางส่วน | [UploadDocument.jsx](../Documents/GitHub/MFU-Research-Grant-UI-Demo/src/pages/UploadDocument.jsx), [ResearcherEditor.jsx](../Documents/GitHub/MFU-Research-Grant-UI-Demo/src/pages/ResearcherEditor.jsx) — นำข้อมูลที่ตรวจแล้วไปบันทึกในร่าง |
| FR-RES-08 — ระบบต้องเก็บข้อมูลอ้างอิงไฟล์ต้นทางสำหรับการตรวจสอบ | บางส่วน | [UploadDocument.jsx](../Documents/GitHub/MFU-Research-Grant-UI-Demo/src/pages/UploadDocument.jsx), [actions.js](../Documents/GitHub/MFU-Research-Grant-UI-Demo/src/domain/actions.js) — มีข้อมูลอ้างอิงต้นทาง แต่เก็บ source bytes ไม่ครบทุกกรณี |
| FR-RES-09 — ระบบต้องตรวจความครบถ้วนของข้อมูลก่อนจัดทำฉบับพร้อมยื่น | บางส่วน | [ResearcherProposalPDF.jsx](../Documents/GitHub/MFU-Research-Grant-UI-Demo/src/pages/ResearcherProposalPDF.jsx), [model.js](../Documents/GitHub/MFU-Research-Grant-UI-Demo/src/domain/model.js) — แสดงข้อมูลขาดแต่ไม่บล็อกการยืนยันเพื่อทดสอบ; รายการฟิลด์จริงยัง OPEN |
| FR-RES-10 — ระบบต้องแสดงตัวอย่างหรือสร้าง PDF ข้อเสนอได้ | บางส่วน | [generateRS1PDF.js](../Documents/GitHub/MFU-Research-Grant-UI-Demo/src/utils/generateRS1PDF.js), [ResearcherProposalPDF.jsx](../Documents/GitHub/MFU-Research-Grant-UI-Demo/src/pages/ResearcherProposalPDF.jsx) — สร้าง PDF จาก selected proposal version; preview ไม่ transition; ความตรงของ PDF ทุกฟิลด์ยังไม่มีผลทดสอบรองรับ |
| FR-RES-11 — ระบบต้องรองรับเอกสาร PDF ฉบับพร้อมยื่นต้นสังกัด | บางส่วน | [ResearcherProposalPDF.jsx](../Documents/GitHub/MFU-Research-Grant-UI-Demo/src/pages/ResearcherProposalPDF.jsx), [actions.js](../Documents/GitHub/MFU-Research-Grant-UI-Demo/src/domain/actions.js) — ยืนยันพร้อมยื่นใน Demo ได้; Backend ยังปิด trigger ที่รอยืนยัน |
| FR-RES-12 — นักวิจัยต้องปรับข้อเสนอตามความเห็นของต้นสังกัดได้ | ทำแล้ว | [actions.js](../Documents/GitHub/MFU-Research-Grant-UI-Demo/src/domain/actions.js), [contracts.js](../Documents/GitHub/MFU-Research-Grant-UI-Demo/src/domain/contracts.js) — Save proposal ใน AFFILIATION_REVIEW คงสถานะ; มีกรณีทดสอบ workflow ของ Local Demo ผ่าน |
| FR-RES-13 — นักวิจัยต้องแนบหลักฐานความเห็นชอบจากต้นสังกัดได้ | บางส่วน | [ResearcherSubmission.jsx](../Documents/GitHub/MFU-Research-Grant-UI-Demo/src/pages/ResearcherSubmission.jsx), [actions.js](../Documents/GitHub/MFU-Research-Grant-UI-Demo/src/domain/actions.js) — แนบ affiliation evidence; ระบุ minutes OR confirmation; หลักฐานปัจจุบันยังไม่ครอบคลุมเกณฑ์ทั้งหมด |
| FR-RES-14 — ระบบต้องแยก “บันทึก/อัปโหลด” ออกจาก “ยืนยันส่งข้อเสนอ” | บางส่วน | [ResearcherSubmission.jsx](../Documents/GitHub/MFU-Research-Grant-UI-Demo/src/pages/ResearcherSubmission.jsx), [actions.js](../Documents/GitHub/MFU-Research-Grant-UI-Demo/src/domain/actions.js) — แยกอัปโหลดจากการกดส่ง แต่ Demo ข้ามเงื่อนไขเอกสารและลายเซ็นเพื่อทดสอบ |
| FR-RES-15 — นักวิจัยต้องเห็นผลการยื่นข้อเสนอที่ยืนยันแล้ว | บางส่วน | [ResearcherSubmission.jsx](../Documents/GitHub/MFU-Research-Grant-UI-Demo/src/pages/ResearcherSubmission.jsx), [actions.js](../Documents/GitHub/MFU-Research-Grant-UI-Demo/src/domain/actions.js) — Submission receipt/time และ duplicate/version guards; หลักฐานปัจจุบันยังไม่ครอบคลุมเกณฑ์ทั้งหมด |
| FR-RES-16 — นักวิจัยต้องดูข้อเสนอแนะ/คำขอแก้ไขจากเจ้าหน้าที่ได้ | บางส่วน | [actions.js](../Documents/GitHub/MFU-Research-Grant-UI-Demo/src/domain/actions.js), [ResearcherSubmission.jsx](../Documents/GitHub/MFU-Research-Grant-UI-Demo/src/pages/ResearcherSubmission.jsx) — แสดง notes/requestedBy/requestedAt; หลักฐานปัจจุบันยังไม่ครอบคลุมเกณฑ์ทั้งหมด |
| FR-RES-17 — นักวิจัยต้องแก้ไขและยืนยันส่งใหม่ตามที่เจ้าหน้าที่แจ้งได้ | บางส่วน | [actions.js](../Documents/GitHub/MFU-Research-Grant-UI-Demo/src/domain/actions.js) — Local scoped correction/resubmission คง STAFF_REVIEW; Backend edit scope ยัง OPEN-13 |
| FR-RES-18 — นักวิจัยต้องดูสถานะโครงการและความหมายแต่ละช่วงได้ | บางส่วน | [contracts.js](../Documents/GitHub/MFU-Research-Grant-UI-Demo/src/domain/contracts.js), [commonWorkspace.js](../Documents/GitHub/MFU-Research-Grant-UI-Demo/src/utils/commonWorkspace.js) — Canonical states รวม CANCELLED และ actual-event timeline; Legacy labels ต้องแยกให้ชัด; หลักฐานปัจจุบันยังไม่ครอบคลุมเกณฑ์ทั้งหมด |
| FR-RES-19 — นักวิจัยต้องดูประวัติสถานะและเหตุการณ์สำคัญของโครงการตนได้ | บางส่วน | [actions.js](../Documents/GitHub/MFU-Research-Grant-UI-Demo/src/domain/actions.js), [permissions.js](../Documents/GitHub/MFU-Research-Grant-UI-Demo/src/domain/permissions.js) — Guarded history และ role projection; หลักฐานปัจจุบันยังไม่ครอบคลุมเกณฑ์ทั้งหมด |
| FR-RES-20 — นักวิจัยต้องดูกรอบเวลาหรือวันสิ้นสุดโครงการได้ เมื่อมีข้อมูลอ้างอิง | บางส่วน | [actions.js](../Documents/GitHub/MFU-Research-Grant-UI-Demo/src/domain/actions.js), [NotificationsTasks.jsx](../Documents/GitHub/MFU-Research-Grant-UI-Demo/src/pages/NotificationsTasks.jsx) — แสดง recorded end date และผล extension; Automatic reminder policy แยกไป RES-21; หลักฐานปัจจุบันยังไม่ครอบคลุมเกณฑ์ทั้งหมด |
| FR-RES-21 — ระบบต้องส่งอีเมลเตือนโครงการใกล้ครบกำหนดและบันทึกผลการส่ง | ยังไม่ได้ทำ | [NotificationsTasks.jsx](../Documents/GitHub/MFU-Research-Grant-UI-Demo/src/pages/NotificationsTasks.jsx), [actions.js](../Documents/GitHub/MFU-Research-Grant-UI-Demo/src/domain/actions.js) — มีเฉพาะการแสดงวันครบกำหนดและแจ้งเตือนในระบบ; ไม่มีระบบตั้งเวลา ส่งอีเมล บันทึกผลและปรับกำหนดเตือน |

## ลายเซ็นและความยินยอม

| FR และข้อกำหนด | ทำแล้วหรือยัง | หลักฐานและข้อจำกัด |
|---|---|---|
| FR-SIG-01 — ระบบต้องสร้างหรือจัดเตรียม RS-1 ฉบับสำหรับลงนาม โดยคงส่วนลงลายเซ็นตามแบบฟอร์มที่ใช้ | บางส่วน | [generateRS1PDF.js](../Documents/GitHub/MFU-Research-Grant-UI-Demo/src/utils/generateRS1PDF.js), [ResearcherProposalPDF.jsx](../Documents/GitHub/MFU-Research-Grant-UI-Demo/src/pages/ResearcherProposalPDF.jsx) — มี signatory/date fields และ signatory list; ยังไม่ยืนยัน layout ตรง official RS-1/signature block |
| FR-SIG-02 — นักวิจัยต้องแนบเอกสาร RS-1 ฉบับลงนามแล้วก่อนยืนยันส่งข้อเสนอไปยังเจ้าหน้าที่ | บางส่วน | [ResearcherSubmission.jsx](../Documents/GitHub/MFU-Research-Grant-UI-Demo/src/pages/ResearcherSubmission.jsx), [actions.js](../Documents/GitHub/MFU-Research-Grant-UI-Demo/src/domain/actions.js) — แนบได้ แต่ Demo ไม่บังคับแนบ RS-1 ลงนามก่อนส่ง |
| FR-SIG-03 — ระบบต้องแสดงรายการผู้ที่จำเป็นต้องลงนามตามข้อมูลโครงการเพื่อให้นักวิจัยตรวจสอบความครบถ้วน | บางส่วน | [ResearcherSubmission.jsx](../Documents/GitHub/MFU-Research-Grant-UI-Demo/src/pages/ResearcherSubmission.jsx), [model.js](../Documents/GitHub/MFU-Research-Grant-UI-Demo/src/domain/model.js) — มีรายการผู้ลงนาม แต่ Demo อนุญาตให้ข้ามการยืนยันครบ |
| FR-SIG-04 — กรณีนำลายเซ็นอิเล็กทรอนิกส์ของบุคคลอื่นมาใช้ใน RS-1 ระบบต้องให้ผู้จัดทำเอกสารยืนยันว่าได้รับความยินยอมจากเจ้าของลายเซ็นแล้ว | บางส่วน | [ResearcherSubmission.jsx](../Documents/GitHub/MFU-Research-Grant-UI-Demo/src/pages/ResearcherSubmission.jsx), [actions.js](../Documents/GitHub/MFU-Research-Grant-UI-Demo/src/domain/actions.js) — มีช่องยืนยัน แต่ Demo ยอมให้ส่งแม้ไม่ได้ยืนยันความยินยอม |
| FR-SIG-05 — ระบบต้องบันทึกการยืนยันเรื่องความยินยอมให้ตรวจสอบย้อนหลังได้ | บางส่วน | [actions.js](../Documents/GitHub/MFU-Research-Grant-UI-Demo/src/domain/actions.js) — มีการบันทึกข้อมูลคำยืนยัน แต่ Local Demo ยอมให้ข้าม; หลักฐานความยินยอมจริงยัง OPEN |
| FR-SIG-06 — เจ้าหน้าที่ต้องสามารถเปิดดูไฟล์ RS-1 ฉบับลงนามและข้อมูลการยืนยันที่เกี่ยวข้องได้ | บางส่วน | [StaffPages.jsx](../Documents/GitHub/MFU-Research-Grant-UI-Demo/src/pages/StaffPages.jsx), [permissions.js](../Documents/GitHub/MFU-Research-Grant-UI-Demo/src/domain/permissions.js) — Staff เปิด submitted bundle และส่งแก้ได้; หลักฐานปัจจุบันยังไม่ครอบคลุมเกณฑ์ทั้งหมด |

## งานเจ้าหน้าที่

| FR และข้อกำหนด | ทำแล้วหรือยัง | หลักฐานและข้อจำกัด |
|---|---|---|
| FR-ADM-01 — เจ้าหน้าที่ต้องดูคิวข้อเสนอที่รอตรวจได้ | บางส่วน | [staffWorkspace.js](../Documents/GitHub/MFU-Research-Grant-UI-Demo/src/utils/staffWorkspace.js) — Staff queue/filter และ task routing; หลักฐานปัจจุบันยังไม่ครอบคลุมเกณฑ์ทั้งหมด |
| FR-ADM-02 — เจ้าหน้าที่ต้องเปิดดูข้อมูลข้อเสนอ RS-1 และเอกสารต้นฉบับที่เกี่ยวข้องได้ | บางส่วน | [StaffPages.jsx](../Documents/GitHub/MFU-Research-Grant-UI-Demo/src/pages/StaffPages.jsx), [actions.js](../Documents/GitHub/MFU-Research-Grant-UI-Demo/src/domain/actions.js) — Review structured proposal/submitted documents; Source retention จำกัดตาม RES-08 |
| FR-ADM-03 — เจ้าหน้าที่ต้องตรวจข้อมูลสำคัญรวมถึงงบประมาณและเอกสารประกอบได้ | บางส่วน | [StaffPages.jsx](../Documents/GitHub/MFU-Research-Grant-UI-Demo/src/pages/StaffPages.jsx) — มี proposal/budget/document review display; Official checklist ยัง OPEN-06 |
| FR-ADM-04 — เจ้าหน้าที่ต้องแจ้งแก้ไขข้อเสนอผ่าน Web ได้ | บางส่วน | [actions.js](../Documents/GitHub/MFU-Research-Grant-UI-Demo/src/domain/actions.js), [StaffPages.jsx](../Documents/GitHub/MFU-Research-Grant-UI-Demo/src/pages/StaffPages.jsx) — Staff request พร้อม notes/history/notification; Backend researcher correction loop ยังไม่ครบเพราะ OPEN-13 |
| FR-ADM-05 — เจ้าหน้าที่ต้องบันทึกผลตรวจผ่านเมื่อเอกสารครบได้ | บางส่วน | [StaffPages.jsx](../Documents/GitHub/MFU-Research-Grant-UI-Demo/src/pages/StaffPages.jsx), [actions.js](../Documents/GitHub/MFU-Research-Grant-UI-Demo/src/domain/actions.js) — Demo ให้เจ้าหน้าที่ตรวจผ่านได้แม้เอกสารยังไม่ครบ |
| FR-ADM-06 — ระบบต้องรองรับการติดตามขั้นตอนเสนอคณะกรรมการ เพื่อทราบ | ทำแล้ว | [StaffPages.jsx](../Documents/GitHub/MFU-Research-Grant-UI-Demo/src/pages/StaffPages.jsx), [actions.js](../Documents/GitHub/MFU-Research-Grant-UI-Demo/src/domain/actions.js) — แสดงช่วงเสนอคณะกรรมการเพื่อทราบซึ่งดำเนินการภายนอก Web; มีกรณีทดสอบ workflow ของ Local Demo ผ่าน |
| FR-ADM-07 — เจ้าหน้าที่ต้องบันทึกการรับรองโครงการหลังขั้นตอนที่เกี่ยวข้องได้ | ทำแล้ว | [StaffPages.jsx](../Documents/GitHub/MFU-Research-Grant-UI-Demo/src/pages/StaffPages.jsx), [actions.js](../Documents/GitHub/MFU-Research-Grant-UI-Demo/src/domain/actions.js) — เจ้าหน้าที่ยืนยันขั้นตอนภายนอกและบันทึกรับรองเพื่อเริ่มโครงการ; มีกรณีทดสอบ workflow ของ Local Demo ผ่าน |
| FR-ADM-08 — เจ้าหน้าที่ต้องค้นหา/กรองและเปิดทะเบียนโครงการในขอบเขตสิทธิ์ได้ | บางส่วน | [staffWorkspace.js](../Documents/GitHub/MFU-Research-Grant-UI-Demo/src/utils/staffWorkspace.js) — Workspace-scoped search/filter; UC-07 ยังอธิบาย search ไม่ชัด |
| FR-ADM-09 — เจ้าหน้าที่ต้องบันทึกผลคำขอขยายเวลาที่นักวิจัยดำเนินการผ่าน e-Office แล้วใน Web ได้ | ทำแล้ว | [actions.js](../Documents/GitHub/MFU-Research-Grant-UI-Demo/src/domain/actions.js), [StaffPages.jsx](../Documents/GitHub/MFU-Research-Grant-UI-Demo/src/pages/StaffPages.jsx) — External outcome/date/reference/history; extension limits; Reminder rescheduling ยังไม่มี; มีกรณีทดสอบ workflow ของ Local Demo ผ่าน |
| FR-ADM-10 — เจ้าหน้าที่ต้องตรวจสอบประวัติการแก้ไขและเปลี่ยนสถานะได้ | บางส่วน | [actions.js](../Documents/GitHub/MFU-Research-Grant-UI-Demo/src/domain/actions.js), [StaffPages.jsx](../Documents/GitHub/MFU-Research-Grant-UI-Demo/src/pages/StaffPages.jsx) — Append audit และแสดงประวัติ; หลักฐานปัจจุบันยังไม่ครอบคลุมเกณฑ์ทั้งหมด |
| FR-ADM-11 — เจ้าหน้าที่ต้องบันทึกข้อมูลอ้างอิงหนังสือจาก e-Office ได้ หาก Stakeholder ต้องการ | บางส่วน | [StaffPages.jsx](../Documents/GitHub/MFU-Research-Grant-UI-Demo/src/pages/StaffPages.jsx), [actions.js](../Documents/GitHub/MFU-Research-Grant-UI-Demo/src/domain/actions.js) — มีช่องอ้างอิงในบางหน้า; แบบหนังสือจริงยังไม่ยืนยัน และนำฟอร์มหนังสือแจ้งปิดออก |
| FR-ADM-12 — ระบบต้องควบคุมสิทธิ์การแก้ไขสถานะของเจ้าหน้าที่ | บางส่วน | [actions.js](../Documents/GitHub/MFU-Research-Grant-UI-Demo/src/domain/actions.js), [permissions.js](../Documents/GitHub/MFU-Research-Grant-UI-Demo/src/domain/permissions.js) — Role/state/version/action guards ฝั่ง server/domain; หลักฐานปัจจุบันยังไม่ครอบคลุมเกณฑ์ทั้งหมด |
| FR-ADM-13 — เฉพาะเจ้าหน้าที่ที่มีสิทธิ์เท่านั้นที่ต้องปรับปรุงข้อมูลโครงการหลังคำขอเปลี่ยนแปลงได้รับอนุมัติ | บางส่วน | [actions.js](../Documents/GitHub/MFU-Research-Grant-UI-Demo/src/domain/actions.js) — Staff-only approved changes; before/after/actor/time; รองรับสามฟิลด์; final field permission policy ยัง OPEN |

## การปิดโครงการ

| FR และข้อกำหนด | ทำแล้วหรือยัง | หลักฐานและข้อจำกัด |
|---|---|---|
| FR-CLS-01 — นักวิจัยต้องเลือกเส้นทางส่งเอกสารปิดโครงการได้ | บางส่วน | [actions.js](../Documents/GitHub/MFU-Research-Grant-UI-Demo/src/domain/actions.js) — เลือกเส้นทางรายงานห้าบทหรือผลงานเผยแพร่ |
| FR-CLS-02 — นักวิจัยต้องแนบเอกสารสำหรับเส้นทางรายงาน 5 บทได้ | บางส่วน | [actions.js](../Documents/GitHub/MFU-Research-Grant-UI-Demo/src/domain/actions.js) — แนบรายงานห้าบทได้; checklist เอกสารจริงยังไม่ครบ |
| FR-CLS-03 — นักวิจัยต้องแนบเอกสารสำหรับเส้นทางผลงานเผยแพร่ได้ | บางส่วน | [actions.js](../Documents/GitHub/MFU-Research-Grant-UI-Demo/src/domain/actions.js) — แนบรายงานย่อและหลักฐานเผยแพร่; เกณฑ์ Full Paper/Acceptance ยัง OPEN |
| FR-CLS-04 — นักวิจัยต้องยืนยันยื่นเอกสารปิดโครงการใน Web ได้ | ทำแล้ว | [actions.js](../Documents/GitHub/MFU-Research-Grant-UI-Demo/src/domain/actions.js) — กดยืนยันส่งเมื่อเอกสารขั้นต่ำครบ; ไม่บังคับช่องสรุป/วันที่วิจัยแล้วเสร็จ; มีกรณีทดสอบ workflow ของ Local Demo ผ่าน |
| FR-CLS-05 — เจ้าหน้าที่ต้องตรวจเอกสารปิดโครงการตามเส้นทางที่เลือกได้ | บางส่วน | [actions.js](../Documents/GitHub/MFU-Research-Grant-UI-Demo/src/domain/actions.js), [StaffPages.jsx](../Documents/GitHub/MFU-Research-Grant-UI-Demo/src/pages/StaffPages.jsx) — Staff review ของ files/submission/check; หลักฐานปัจจุบันยังไม่ครอบคลุมเกณฑ์ทั้งหมด |
| FR-CLS-06 — เจ้าหน้าที่ต้องขอเอกสารเพิ่มเติมหรือแจ้งแก้ไขได้ | ทำแล้ว | [actions.js](../Documents/GitHub/MFU-Research-Grant-UI-Demo/src/domain/actions.js) — Request/supplement และ self-transition; มีกรณีทดสอบ workflow ของ Local Demo ผ่าน |
| FR-CLS-07 — ระบบต้องแยกเส้นทางประเมินรายงาน 5 บทออกจากเส้นทางเผยแพร่ | ทำแล้ว | [actions.js](../Documents/GitHub/MFU-Research-Grant-UI-Demo/src/domain/actions.js) — Report assignment แยก publication closure; มีกรณีทดสอบ workflow ของ Local Demo ผ่าน |
| FR-CLS-08 — เจ้าหน้าที่ต้องปิดโครงการเส้นทางเผยแพร่ได้ เมื่อหลักฐานครบ | ทำแล้ว | [actions.js](../Documents/GitHub/MFU-Research-Grant-UI-Demo/src/domain/actions.js) — Staff check + explicit close; upload ไม่ปิดเอง; Official publication evidence criteria ยัง OPEN-14; มีกรณีทดสอบ workflow ของ Local Demo ผ่าน |
| FR-CLS-09 — นักวิจัยต้องสามารถส่งรายงานฉบับแก้ไข/ฉบับสมบูรณ์ใน Web หลังเจ้าหน้าที่กดส่งผลประเมินได้ | บางส่วน | [actions.js](../Documents/GitHub/MFU-Research-Grant-UI-Demo/src/domain/actions.js), [permissions.js](../Documents/GitHub/MFU-Research-Grant-UI-Demo/src/domain/permissions.js) — ส่งฉบับแก้ไขหลังเปิดเผยผลและไม่ประเมินซ้ำ; รายการเอกสารประกอบยัง OPEN |
| FR-CLS-10 — เจ้าหน้าที่ต้องบันทึกปิดโครงการเส้นทางรายงาน 5 บทได้ | บางส่วน | [actions.js](../Documents/GitHub/MFU-Research-Grant-UI-Demo/src/domain/actions.js), [model.js](../Documents/GitHub/MFU-Research-Grant-UI-Demo/src/domain/model.js) — เจ้าหน้าที่ปิดหลังตรวจฉบับแก้ไข; หากผู้ทรงทั้งสามไม่ขอแก้ไข ใช้ฉบับเดิมได้ตามคำสั่งผู้ใช้ ซึ่งยังต้องอัปเดตเอกสาร |
| FR-CLS-11 — ระบบต้องแสดงหลักฐานและเวลาที่เกี่ยวข้องกับการปิดโครงการย้อนหลังได้ | บางส่วน | [actions.js](../Documents/GitHub/MFU-Research-Grant-UI-Demo/src/domain/actions.js) — Submitted versions/actors/times และ closure audit; หลักฐานปัจจุบันยังไม่ครอบคลุมเกณฑ์ทั้งหมด |
| FR-CLS-12 — ระบบต้องแสดงสถานะปิดโครงการให้ผู้มีสิทธิ์เห็นได้ | บางส่วน | [actions.js](../Documents/GitHub/MFU-Research-Grant-UI-Demo/src/domain/actions.js), [contracts.js](../Documents/GitHub/MFU-Research-Grant-UI-Demo/src/domain/contracts.js) — CLOSED หลัง staff action; หลักฐานปัจจุบันยังไม่ครอบคลุมเกณฑ์ทั้งหมด |

## ผู้ทรงคุณวุฒิ

| FR และข้อกำหนด | ทำแล้วหรือยัง | หลักฐานและข้อจำกัด |
|---|---|---|
| FR-REV-01 — เจ้าหน้าที่ต้องจัดการมอบหมายผู้ทรงฯ 3 คนสำหรับรายงาน 5 บทได้ | ทำแล้ว | [actions.js](../Documents/GitHub/MFU-Research-Grant-UI-Demo/src/domain/actions.js) — Exactly three distinct active reviewers/report assignment; Official appointment อยู่ e-Office; มีกรณีทดสอบ workflow ของ Local Demo ผ่าน |
| FR-REV-02 — ผู้ทรงฯ ต้องดูรายการงานประเมินที่ได้รับมอบหมายได้ | บางส่วน | [reviewerWorkspace.js](../Documents/GitHub/MFU-Research-Grant-UI-Demo/src/utils/reviewerWorkspace.js), [permissions.js](../Documents/GitHub/MFU-Research-Grant-UI-Demo/src/domain/permissions.js) — ดูงานที่ได้รับมอบหมาย; แจ้งเตือนแยกบัญชีใน Demo |
| FR-REV-03 — ผู้ทรงฯ ต้องเปิดอ่านหรือดาวน์โหลดร่างรายงานประกอบการประเมินได้ | บางส่วน | [permissions.js](../Documents/GitHub/MFU-Research-Grant-UI-Demo/src/domain/permissions.js), [actions.js](../Documents/GitHub/MFU-Research-Grant-UI-Demo/src/domain/actions.js) — Assigned report document/download guard; ไม่มีผลทดสอบ Storage integration; หลักฐานปัจจุบันยังไม่ครอบคลุมเกณฑ์ทั้งหมด |
| FR-REV-04 — ผู้ทรงฯ ต้องกรอกผลประเมินตามแบบประเมินที่กำหนดได้ | บางส่วน | [actions.js](../Documents/GitHub/MFU-Research-Grant-UI-Demo/src/domain/actions.js) — มีฟอร์มประเมิน แต่หัวข้อทางการยัง OPEN; ช่องแนบไฟล์เพิ่มเติมถูกนำออก |
| FR-REV-05 — ผู้ทรงฯ ต้องบันทึกร่างแบบประเมินแล้วกลับมาทำต่อได้ | ทำแล้ว | [actions.js](../Documents/GitHub/MFU-Research-Grant-UI-Demo/src/domain/actions.js) — Save draft แยก submitted flag; มีกรณีทดสอบ workflow ของ Local Demo ผ่าน |
| FR-REV-06 — ผู้ทรงฯ ต้องยืนยันส่งผลประเมินได้ | ทำแล้ว | [actions.js](../Documents/GitHub/MFU-Research-Grant-UI-Demo/src/domain/actions.js), [permissions.js](../Documents/GitHub/MFU-Research-Grant-UI-Demo/src/domain/permissions.js) — Submit timestamp/actor และ submitted lock; มีกรณีทดสอบ workflow ของ Local Demo ผ่าน |
| FR-REV-07 — ระบบต้องสร้าง/ดาวน์โหลด PDF ผลประเมินรายบุคคลตามคำสั่งจากข้อมูลผลประเมินที่ส่งแล้ว | บางส่วน | [evaluationPDF.js](../Documents/GitHub/MFU-Research-Grant-UI-Demo/src/utils/evaluationPDF.js), [reviewerWorkspace.js](../Documents/GitHub/MFU-Research-Grant-UI-Demo/src/utils/reviewerWorkspace.js) — ดาวน์โหลด PDF รายบุคคลจากผลที่ส่งแล้วตามสิทธิ์; ความตรงของ PDF ทุกฟิลด์ยังไม่มีผลทดสอบรองรับ; PDF รวมและสิทธิ์หลังปิดเป็นประเด็น OPEN ไม่ใช่เงื่อนไขที่ยืนยันแล้ว |
| FR-REV-08 — ระบบต้องรองรับการประเมินเพียงหนึ่งรอบสำหรับรายงาน 5 บท | ทำแล้ว | [actions.js](../Documents/GitHub/MFU-Research-Grant-UI-Demo/src/domain/actions.js) — ประเมินหนึ่งรอบ ไม่ส่งผู้ทรงประเมินซ้ำ; มีกรณีทดสอบ workflow ของ Local Demo ผ่าน |
| FR-REV-09 — ระบบต้องแสดงผลการส่งแบบประเมินของผู้ทรงฯ 3 คน | ทำแล้ว | [model.js](../Documents/GitHub/MFU-Research-Grant-UI-Demo/src/domain/model.js), [actions.js](../Documents/GitHub/MFU-Research-Grant-UI-Demo/src/domain/actions.js) — นับผู้ทรงไม่ซ้ำที่ยืนยันส่งจริง 0/3–3/3; มีกรณีทดสอบ workflow ของ Local Demo ผ่าน |
| FR-REV-10 — เจ้าหน้าที่ต้องกดยืนยันส่งผลประเมินให้นักวิจัย | ทำแล้ว | [actions.js](../Documents/GitHub/MFU-Research-Grant-UI-Demo/src/domain/actions.js) — เจ้าหน้าที่กดยืนยันส่งผลเมื่อครบ 3/3 และไม่เคยส่ง; มีกรณีทดสอบ workflow ของ Local Demo ผ่าน |

## มาตรฐานวิจัย

| FR และข้อกำหนด | ทำแล้วหรือยัง | หลักฐานและข้อจำกัด |
|---|---|---|
| FR-STD-01 — ระบบต้องเก็บข้อมูลประเภทมาตรฐานการวิจัยที่เกี่ยวข้องกับโครงการและสถานะการรับรอง | บางส่วน | [model.js](../Documents/GitHub/MFU-Research-Grant-UI-Demo/src/domain/model.js), [actions.js](../Documents/GitHub/MFU-Research-Grant-UI-Demo/src/domain/actions.js) — มี standards field/notes; Structured type/status/authority ยัง OPEN-17 |
| FR-STD-02 — ระบบต้องรองรับการแนบหลักฐานการรับรองมาตรฐานการวิจัยที่เกี่ยวข้อง | บางส่วน | [StaffPages.jsx](../Documents/GitHub/MFU-Research-Grant-UI-Demo/src/pages/StaffPages.jsx), [actions.js](../Documents/GitHub/MFU-Research-Grant-UI-Demo/src/domain/actions.js) — แนบ standards_evidence ได้; Certificate agency/number/date metadata ยังไม่ครบ |
| FR-STD-03 — ระบบต้องแสดงคำเตือนหรือป้องกันการเปลี่ยนไปดำเนินการวิจัยเมื่อโครงการต้องมีการรับรองแต่ยังไม่มีหลักฐาน ตามกฎที่ยืนยันแล้ว | ยังไม่ได้ทำ | [actions.js](../Documents/GitHub/MFU-Research-Grant-UI-Demo/src/domain/actions.js) — ตั้งใจไม่สร้าง universal blocker; Missing-item warning/block policy รอ OPEN-17 |

## ทะเบียน

| FR และข้อกำหนด | ทำแล้วหรือยัง | หลักฐานและข้อจำกัด |
|---|---|---|
| FR-REG-01 — เจ้าหน้าที่ต้องดูรอบรับข้อเสนอและวันที่ยื่นเพื่อช่วยตรวจช่วงเวลารับสมัครได้ | บางส่วน | [staffWorkspace.js](../Documents/GitHub/MFU-Research-Grant-UI-Demo/src/utils/staffWorkspace.js), [actions.js](../Documents/GitHub/MFU-Research-Grant-UI-Demo/src/domain/actions.js) — มี submission date/registry list; Round model/window/exceptions ยังไม่ครบ |
| FR-REG-02 — ระบบต้องรองรับการบันทึกผลการจัดการโครงการที่ไม่ดำเนินการหรือไม่ส่งเอกสารภายในกำหนดตามข้อ 1.3.9 | ยังไม่ได้ทำ | [contracts.js](../Documents/GitHub/MFU-Research-Grant-UI-Demo/src/domain/contracts.js) — ไม่พบ dedicated registry-disposition action; Reason/date/evidence workflow และ authority รอ OPEN-19 |
| FR-REG-03 — ระบบต้องเก็บข้อมูลการยกเลิกโครงการในทะเบียนโดยไม่ลบข้อมูลถาวร | บางส่วน | [StaffPages.jsx](../Documents/GitHub/MFU-Research-Grant-UI-Demo/src/pages/StaffPages.jsx), [actions.js](../Documents/GitHub/MFU-Research-Grant-UI-Demo/src/domain/actions.js) — บันทึกการยกเลิกพร้อมผู้กระทำ/เวลาและประวัติ โดยเก็บเอกสารเดิม; สิทธิ์ระบบจริงยัง OPEN |
| FR-REG-04 — ระบบต้องรองรับข้อมูลผู้ประเมิน ผลประเมิน และขั้นตอนงานย่อยตามที่ใช้จริงในทะเบียน | บางส่วน | [staffWorkspace.js](../Documents/GitHub/MFU-Research-Grant-UI-Demo/src/utils/staffWorkspace.js) — มี registry UI แต่ไม่มี verified Excel mapping; Actual columns/values/stages รอ OPEN-21; มีข้อมูลผู้ประเมินและผลบางส่วน แต่ยังไม่มี mapping กับทะเบียนจริง |

## การยกเลิก

| FR และข้อกำหนด | ทำแล้วหรือยัง | หลักฐานและข้อจำกัด |
|---|---|---|
| FR-CAN-01 — ระบบต้องรองรับการยกเลิกพร้อมเหตุผล | บางส่วน | [StaffPages.jsx](../Documents/GitHub/MFU-Research-Grant-UI-Demo/src/pages/StaffPages.jsx), [actions.js](../Documents/GitHub/MFU-Research-Grant-UI-Demo/src/domain/actions.js) — เจ้าหน้าที่จำลองยกเลิกจากกำลังดำเนินการพร้อมเหตุผลและคำยืนยัน; สิทธิ์จริงยัง OPEN |
| FR-CAN-02 — ระบบต้องป้องกันการยกเลิกที่ไม่ถูกต้อง | บางส่วน | [StaffPages.jsx](../Documents/GitHub/MFU-Research-Grant-UI-Demo/src/pages/StaffPages.jsx), [actions.js](../Documents/GitHub/MFU-Research-Grant-UI-Demo/src/domain/actions.js) — ตรวจเหตุผล สถานะ สิทธิ์จำลอง และประวัติ; Backend ยังปิดการยกเลิก |
