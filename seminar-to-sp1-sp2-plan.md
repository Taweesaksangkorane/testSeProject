# แผน Transition จาก Seminar ไป Senior Project 1 และ Senior Project 2

**โครงการ:** Personal Research Grant Management System for Mae Fah Luang University  
**ทีม:** 404 Team Found  
**สถานะ:** แผนดำเนินงานฉบับร่างสำหรับเริ่ม Senior Project 1  
**ปรับปรุง:** 18 พฤศจิกายน 2569

## 1. วัตถุประสงค์และจุดเริ่มต้น

งาน Seminar ส่งต่อเป็นต้นแบบที่ใช้อธิบายกระบวนการจัดการทุนวิจัยส่วนตัวได้ พร้อมเอกสาร Requirements, Workflow, Use Case, Traceability และ source code ของ Web prototype กับตัวสกัด RS-1 แบบ DOCX ใน repository นี้

Senior Project 1 (SP1) ต้องเปลี่ยนจากคำตอบว่า “จะสร้างอะไร” เป็นการพิสูจน์ว่า “ระบบทำงานได้และมีหลักฐาน” โดยทำ **first vertical slice** อย่างน้อยหนึ่งเส้นทางให้ทำงาน end-to-end จริง ส่วน Senior Project 2 (SP2) จึงขยายระบบให้ครบตาม scope ที่อนุมัติ ทดสอบกับผู้ใช้จริง แก้ไขจากหลักฐานการทดสอบ และเตรียมระบบ/เอกสารสำหรับส่งมอบ

แผนนี้ไม่ถือว่า requirement ที่ติดป้าย `OPEN` ได้รับอนุมัติแล้ว การตัดสินใจที่กระทบกระบวนการจริง สิทธิ์ผู้ใช้ การเก็บข้อมูลส่วนบุคคล หรือการเชื่อมต่อระบบภายนอก ต้องได้รับการยืนยันจาก stakeholder ก่อนพัฒนา

## 2. ขอบเขตการส่งมอบระหว่างระยะ

| ระยะ | เป้าหมาย | สิ่งส่งมอบ | เกณฑ์ผ่านระยะ |
|---|---|---|---|
| ปิด Seminar | ส่ง Final ของรายวิชาและทำ GitHub เป็น baseline ที่พร้อมพัฒนาต่อ | IEEE paper ภาษาอังกฤษไม่เกิน 6 หน้า พร้อม references, Final presentation, prototype/source code, requirements/design/plan ที่เป็นปัจจุบัน | ส่งตามช่องทางและกำหนดเวลาที่รายวิชาระบุ; ทุกอย่างอยู่ใน private repository; ประเด็น OPEN ถูกระบุไว้ |
| SP1 | ได้ MVP ที่รันได้จริงอย่างน้อยหนึ่งเส้นทาง | Signed-off MVP scope, ADRs, architecture/data model/API design, live first vertical slice, CI และ test report | เส้นทางหลักทำงาน end-to-end; tests ผ่านใน CI; stakeholder review MVP และบันทึก feedback |
| SP2 | ยืนยันความเหมาะสมกับผู้ใช้จริงและปรับปรุงระบบ | UAT protocol/results, prioritized backlog, release candidate, final test/operation documents | UAT ตามแผนเสร็จ; ข้อบกพร่องระดับสูงปิดหรือได้รับการยอมรับเป็น known limitation |

### 2.1 งานที่ต้องปิดก่อนเริ่ม SP1

1. ตรวจรายละเอียดกำหนดส่งและตัวอย่าง Final Document ใน Google Classroom แล้วส่ง IEEE paper ภาษาอังกฤษ ความยาวไม่เกิน 6 หน้า พร้อม references
2. เตรียม Final presentation ที่อธิบายปัญหา requirement, วิธีพัฒนา, design/tech stack พร้อมเหตุผล, สิ่งที่ทำแล้ว, สิ่งที่จะส่งมอบ และ timeline ของโครงการ
3. ทำ private GitHub repository ให้เป็น baseline กลาง: มี source code, เอกสารล่าสุด, แผนงาน, issue/commit history และสิทธิ์เข้าถึงของสมาชิก/อาจารย์ที่ถูกต้อง
4. บันทึก requirement ใหม่หรือ feedback ใหม่เป็น change item พร้อมวิเคราะห์ผลกระทบต่อ requirement, design, timeline และ backlog ก่อนตัดสินใจทำ

## 3. Roadmap และ Timeline

แผนนี้กำหนดให้ SP1 ดำเนินงานระหว่าง **มกราคม–เมษายน 2570** และ SP2 ระหว่าง **สิงหาคม–พฤศจิกายน 2570** เพื่อใช้ติดตามงานของทีม หากปฏิทินรายวิชาทางการต่างจากนี้ ให้เลื่อนกิจกรรมทั้งแผนตามเดือนเปิดภาคเรียนโดยคงลำดับและจุดตรวจเดิม

| ระยะเวลา | กิจกรรมหลัก | ผลลัพธ์/จุดตรวจ |
|---|---|---|
| ธันวาคม 2569 | ปิด Final Document/Presentation, ตรวจ private-repository access, ทบทวน backlog และ requirement changes | Baseline tag, IEEE paper, Final presentation, รายการความเสี่ยง, ผู้รับผิดชอบแต่ละงาน |
| มกราคม 2570 (SP1) | Workshop กับ stakeholder; ยืนยัน MVP, data fields, roles, state transitions และนโยบายเอกสาร/ลายเซ็น | Requirement decisions log; MVP backlog ที่จัดลำดับแล้ว; คำถาม OPEN มีผู้ยืนยันและวันติดตาม |
| กุมภาพันธ์ 2570 (SP1) | ออกแบบ architecture, database, API, security/privacy controls และ test strategy; เขียน ADR; สร้าง/ปรับ migration และ CI | Design review; ADRs; test plan; acceptance criteria ที่ตรวจได้; CI สีเขียว |
| มีนาคม 2570 (SP1) | พัฒนา first vertical slice: นักวิจัยสร้าง/บันทึกร่าง/ส่งข้อเสนอ และเจ้าหน้าที่เปิดตรวจได้จากข้อมูลชุดเดียวกัน | Live demo ที่รันได้; unit/integration/end-to-end tests; evidence จาก CI |
| เมษายน 2570 (SP1) | ขยาย MVP เฉพาะงานที่จำเป็นต่อ slice, audit trail และ guard สิทธิ์; ทดสอบระบบและ stakeholder walkthrough | MVP release candidate; stakeholder feedback; SP2 backlog พร้อมเหตุผลของงานที่เลื่อน |
| กรกฎาคม 2570 | ทบทวน SP1 backlog, ยืนยัน UAT scope และเตรียม UAT protocol ก่อนเปิด SP2 | UAT protocol ฉบับร่าง, รายชื่อบทบาทผู้เข้าร่วมที่ต้องขออนุญาต |
| สิงหาคม 2570 (SP2) | ทดสอบการใช้งานจริงกับผู้ใช้ใน scope ที่อนุญาต และจัดหมวด feedback/defects | UAT round 1 report; prioritized improvement backlog |
| กันยายน 2570 (SP2) | ทดสอบการใช้งานจริงรอบที่ 2/เก็บผลให้ครบ และยืนยันข้อที่ต้องแก้ | UAT results; approved change list; release target ต่อ issue |
| ตุลาคม 2570 (SP2) | แก้ไขข้อบกพร่องและปรับ UX จาก UAT; รัน regression, security/permission tests | Release candidate 2; change log; automated test evidence |
| พฤศจิกายน 2570 (SP2) | Retest งานที่แก้, ปิด/บันทึก known limitations, จัดทำคู่มือ/รายงาน/สาธิต และส่งมอบ | UAT closure; final report; operation handover package |

## 4. MVP ที่ต้องยืนยันใน SP1

MVP มีเป้าหมายลดการกรอกข้อมูลซ้ำและทำให้ติดตามสถานะได้ ไม่ขยายไปทำงานแทน e-Office หรือการอนุมัติภายนอก Web

### 4.1 First vertical slice ที่ต้องทำงานจริง

**เส้นทางแรก:** นักวิจัยที่ยืนยันตัวตนแล้วสร้างโครงการ กรอกหรือบันทึกร่าง RS-1 ตรวจ validation ยืนยันส่งข้อเสนอ และเจ้าหน้าที่ที่มีสิทธิ์เปิดรายการเดียวกันเพื่อตรวจ/ส่งกลับแก้ได้ โดยสถานะ ประวัติ และสิทธิ์ต้องมาจากข้อมูลที่ persist จริง ไม่ใช่ state ของหน้าจออย่างเดียว

เส้นทางนี้ต้องมี live demo, automated tests ที่อ้าง AC ID, และหลักฐาน CI ก่อนถือว่างาน SP1 เดือน 3 เสร็จ หน้าจออื่นที่ไม่มี backend/data flow จริงไม่ถูกนับเป็นความคืบหน้าทดแทนเส้นทางนี้

| ลำดับ | ความสามารถ | แหล่งอ้างอิง | เงื่อนไขก่อนรับเข้า MVP |
|---:|---|---|---|
| 1 | Login และการจำกัดสิทธิ์ตามนักวิจัย/เจ้าหน้าที่/ผู้ทรงคุณวุฒิ | FR-COM-01–04 | ยืนยันวิธี provisioning ผู้ใช้และขอบเขตสิทธิ์เจ้าหน้าที่ |
| 2 | สร้าง บันทึก แก้ไข และส่งข้อเสนอ RS-1 | FR-RES-01–03, 09–15 | ยืนยัน required fields, file types และขั้นตอนส่ง |
| 3 | นำเข้า DOCX RS-1, แสดงค่าที่สกัด และให้ผู้ใช้แก้ก่อนบันทึก | FR-RES-04–08 | คงข้อจำกัด DOCX; กำหนด data mapping/เกณฑ์คุณภาพที่อนุมัติ |
| 4 | เจ้าหน้าที่ตรวจ ส่งกลับแก้ไข และบันทึกผลตาม workflow | FR-ADM-01–07 | ยืนยัน checklist, authority และขอบเขตการแก้ไขหลังส่ง |
| 5 | ดูสถานะ/ประวัติและ audit trail | FR-RES-18–20, FR-COM-05 | ยืนยันความหมายของ 9 สถานะและข้อมูลที่แต่ละบทบาทเห็น |
| 6 | การปิดโครงการและการประเมิน | FR-CLS/FR-REV | รับเข้าเฉพาะ flow/แบบประเมินที่ stakeholder ยืนยัน; งานที่ยัง OPEN อยู่ใน backlog |

## 5. การแบ่งงานและความรับผิดชอบ

| Workstream | เจ้าของงานหลัก | ผู้ร่วมตรวจ | งาน SP1 | งาน SP2 |
|---|---|---|---|---|
| Project management และ stakeholder | Wichayaphon Seepin | ทุกคน | นัด workshop, จัด backlog, บันทึก decision/change log | วาง UAT, สรุป feedback, ติดตามการปิด defect |
| Backend, data และ security | Taweesak Sangkoranee | Wichayaphon | ออกแบบ API/database, authorization, audit trail, tests | แก้ defect backend, backup/restore check, final technical documentation |
| Frontend และ UX | Aubolwan Maneechan | Wichayaphon | ทำ researcher/staff/reviewer flow, accessibility และ responsive UI | ปรับ UX จาก UAT, regression UI, คู่มือผู้ใช้ |
| RS-1 extraction และ quality | Taweesak Sangkoranee | Aubolwan | บำรุง DOCX parser, mapping/review UI, synthetic regression fixtures | วิเคราะห์ผล UAT ที่เกี่ยวข้องกับ import, เพิ่ม test case ที่ไม่เปิดเผยข้อมูลจริง |
| Requirements, design และ traceability | Wichayaphon Seepin | ทุกคน | ปรับ FR/AC/UC/architecture/data model ตาม decision log | ปิด traceability กับ test/UAT evidence และ final report |
| Quality assurance และ release | เจ้าของงานของโมดูลนั้น | สมาชิกที่เหลืออย่างน้อย 1 คน | เขียน/รัน unit, integration และ workflow test | รัน regression/retest, บันทึก known limitations, release checklist |

สมาชิกแต่ละคนต้อง commit งานของตนเองใน branch ที่ระบุใน issue/PR และให้สมาชิกอีกคน review งานที่กระทบ workflow, permission, data model หรือ requirement ก่อน merge

### 5.1 กติกาการทำงานร่วมกันและหลักฐาน SP1

1. ใช้ branch หนึ่งชุดต่อ feature/issue เช่น `feature/FR-RES-01-create-draft`; ห้ามพัฒนาโดยตรงบน `main`.
2. เปิด Pull Request และให้สมาชิกอีกคน review ก่อน merge. PR ต้องลิงก์ issue และระบุผลทดสอบที่รันแล้ว.
3. Commit ที่ทำให้ requirement เดินหน้าใช้รหัส FR เช่น `FR-RES-01: persist new draft`; issue ที่แก้เสร็จใช้ `Closes #N` ใน PR description.
4. เขียน test จาก Acceptance Criteria; ชื่อ test หรือ description ต้องมี AC ID เช่น `AC-RES-01.1 creates an owner-bound DRAFT`.
5. GitHub Actions ต้องรัน lint/typecheck/test/build ที่เหมาะสมทุก push และ Pull Request. CI ที่ไม่ผ่านหมายถึงงานยังไม่เสร็จและห้าม merge เว้นแต่มีข้อยกเว้นที่บันทึกใน issue.
6. สมาชิกทุกคนต้องรันระบบตาม README ได้บนเครื่องตนเอง; README ต้องมี prerequisites, setup, `.env.example`, คำสั่ง run/test และวิธีใช้ข้อมูลสังเคราะห์.
7. การมีส่วนร่วมวัดจาก commit history, review และหลักฐานงานใน issue/PR ไม่ใช่เพียงชื่อในเอกสาร.

### 5.2 Architecture Decision Records

เขียน ADR สั้นหนึ่งฉบับต่อการตัดสินใจสำคัญใน `docs/03-design/adr/` โดยใช้ชื่อ `ADR-NNN-<short-title>.md` และมีหัวข้อ: สถานะ, บริบท/ปัญหา, สิ่งที่เลือก, เหตุผล, ทางเลือกที่ไม่เลือก และผลกระทบ

อย่างน้อยต้องมี ADR สำหรับ stack/deployment, database/data ownership, authentication/authorization, วิธีจัดเก็บเอกสาร และแนวทาง RS-1 extraction. เมื่อเปลี่ยน decision ที่มีอยู่ ต้องแก้ ADR เดิมหรือสร้างฉบับ superseding พร้อมอ้างอิงเหตุผลและ requirement/issue ที่เกี่ยวข้อง

## 6. แผนทดสอบกับผู้ใช้จริง

### 6.1 ก่อนเริ่ม UAT

1. ยืนยันผู้เข้าร่วม test และบทบาทกับ stakeholder: นักวิจัย, เจ้าหน้าที่ส่วนบริหารงานวิจัย และผู้ทรงคุณวุฒิ ตามจำนวนที่หน่วยงานอนุญาต
2. ใช้ environment แยกจาก production และบัญชีทดสอบเฉพาะกิจ
3. ใช้ข้อมูลสังเคราะห์เป็นค่าเริ่มต้น; หากจำเป็นต้องใช้เอกสารจริง ให้เก็บ/ประมวลผลตามการอนุญาตของหน่วยงาน ไม่ commit, ไม่แนบใน issue และไม่บันทึกเนื้อหาหรือข้อมูลระบุตัวตนในรายงานสาธารณะ
4. อธิบายวัตถุประสงค์ ขอบเขตข้อมูล และวิธีเก็บ feedback ก่อนเริ่มทดสอบ; บันทึกความยินยอมตามนโยบายที่ stakeholder/มหาวิทยาลัยกำหนด
5. ผ่าน smoke test ของทุก scenario และตรวจ role/permission ก่อนให้ผู้ใช้ทดสอบ

### 6.2 สถานการณ์ UAT

| รหัส | ผู้ทดสอบ | งานที่ให้ทำ | หลักฐาน/ตัวชี้วัด |
|---|---|---|---|
| UAT-01 | นักวิจัย | สร้าง/บันทึกร่างและกรอกข้อมูล RS-1 | completion rate, เวลาทำงาน, จุดที่ติดขัด, feedback |
| UAT-02 | นักวิจัย | อัปโหลด DOCX, ตรวจและแก้ค่าที่สกัดก่อนบันทึก | จำนวนฟิลด์ที่ต้องแก้, error/warning ที่เข้าใจไม่ได้, feedback |
| UAT-03 | นักวิจัย | แนบหลักฐานและยืนยันส่งข้อเสนอ | completion rate, validation failure, ความเข้าใจสถานะ |
| UAT-04 | เจ้าหน้าที่ | เปิด queue, ตรวจข้อเสนอ, ส่งกลับแก้ และบันทึกผล | correctness ของสิทธิ์/transition, เวลาทำงาน, feedback |
| UAT-05 | ผู้ทรงคุณวุฒิ | เปิดงานที่ได้รับมอบหมาย, บันทึกร่างและส่งแบบประเมิน | assignment isolation, completion rate, feedback |
| UAT-06 | เจ้าหน้าที่และนักวิจัย | ตรวจสถานะ ประวัติ และผลหลังเปลี่ยนสถานะ | ความถูกต้องของข้อมูลที่เห็น, ความเข้าใจ timeline |
| UAT-07 | เจ้าหน้าที่ | ทดสอบเส้นทางปิดโครงการที่อยู่ใน scope | required documents, transition guard, feedback |

### 6.3 เกณฑ์รับผลและวงจรปรับปรุง

- บันทึกผลของแต่ละ scenario เป็น `PASS`, `PASS WITH ISSUE`, `FAIL` หรือ `BLOCKED` พร้อมหลักฐานขั้นต่ำและผู้บันทึกผล
- จัดประเภท feedback/defect เป็น `Critical`, `High`, `Medium`, `Low` โดย `Critical` หมายถึงข้อมูล/สิทธิ์รั่วไหลหรือทำ workflow หลักต่อไม่ได้ และ `High` หมายถึงทำ task หลักไม่สำเร็จหรือข้อมูลผิด
- ก่อน UAT รอบยืนยัน ต้องแก้ `Critical` ทั้งหมด; `High` ต้องแก้หรือมีการยอมรับข้อจำกัดเป็นลายลักษณ์อักษรจาก stakeholder
- ทุก issue ที่รับเข้า backlog ต้องระบุ scenario, expected/actual result, priority, owner, release target และลิงก์ไปยัง commit/PR เมื่อแก้แล้ว
- เมื่อแก้ไข ให้รัน regression test ที่เกี่ยวข้องและให้ผู้พบปัญหา หรือผู้ใช้บทบาทเดียวกัน retest ก่อนปิด issue

## 7. การควบคุมการเปลี่ยนแปลงและความเสี่ยง

| ความเสี่ยง | ผลกระทบ | การป้องกัน/ตอบสนอง | เจ้าของ |
|---|---|---|---|
| Stakeholder ยังไม่ยืนยัน field, role, transition หรือ checklist | สร้างฟังก์ชันไม่ตรงงานจริง | เก็บเป็น OPEN, จัด decision workshop และไม่ implement เป็นกฎถาวรก่อนยืนยัน | Wichayaphon |
| ข้อมูล RS-1 มีข้อมูลส่วนบุคคล | ความเสี่ยง privacy และข้อมูลรั่วจาก Git/log | ใช้ข้อมูลสังเคราะห์; เก็บเอกสารจริงในพื้นที่เข้าถึงจำกัด; ตรวจ history/zip/log ก่อนเผยแพร่ | Taweesak |
| AI ได้รับข้อมูลส่วนบุคคลหรือ secret | ข้อมูลรั่ว/ละเมิดนโยบาย | ใช้ AI ได้เฉพาะกับข้อมูลสังเคราะห์หรือโค้ดที่ตรวจแล้ว; ห้ามส่งเอกสารจริง, PII, `.env` หรือ API key ให้ AI | ทุกคน |
| secret อยู่ใน repository | ระบบ/บัญชีภายนอกถูกเข้าถึง | ห้าม commit `.env` หรือ key; ใช้ secret store และ `.env.example` ที่ไม่มีค่า secret; สแกนก่อน merge/release | Taweesak |
| เอกสาร RS-1 หลายรูปแบบ | สกัดไม่ครบ/ผิด | จำกัด DOCX ตาม scope, แสดง uncertainty ให้แก้ไข, เพิ่ม synthetic regression cases จากรูปแบบที่พบ | Taweesak |
| สิทธิ์ไม่ตรงบทบาทจริง | เข้าถึง/แก้ข้อมูลเกินสิทธิ์ | Backend authorization tests, role UAT และ review ก่อน release | Taweesak |
| Feedback UAT เกินกำลังเวลาที่เหลือ | ส่งมอบล่าช้า | จัดลำดับ Critical/High ก่อน, กำหนด release target และบันทึก deferred items เป็น SP2 backlog | Wichayaphon |
| เปลี่ยนหัวข้อหรือ scope โดยไม่อนุมัติ | ไม่ตรงหลักสูตร/ประเมินไม่ได้ | ขออนุมัติคณะกรรมการหลักสูตรก่อนเปลี่ยนหัวข้อ; งานที่ย้าย SP2 ต้องมีเหตุผล, owner และ target milestone | Wichayaphon |

## 8. หลักฐานและการติดตามผล

- ใช้ GitHub Issues สำหรับ backlog, defect และ stakeholder decisions; งานจาก feedback อาจติด label `sp1-backlog` หรือ `sp2-backlog` ตามระยะ
- ใช้ Pull Request หรือเทียบเท่าในการ review งานที่ merge เข้า branch หลัก พร้อมลิงก์ issue และผลทดสอบ
- เก็บ test report, UAT anonymized summary, decision log, change log และ release checklist ใน `docs/04-evaluation/` หรือโฟลเดอร์ย่อยที่ระบุใน issue
- ทบทวน roadmap ทุกสิ้นเดือนของ SP1/SP2: ตรวจ deliverable, ความเสี่ยง, backlog และปรับแผนโดยบันทึกเหตุผล

## 9. Definition of Done ก่อนส่งมอบ SP2

1. MVP scope ที่ stakeholder ยืนยันมี traceability จาก FR/AC/UC ถึง implementation และ test evidence
2. UAT scenarios ที่อยู่ใน scope เสร็จครบ พร้อมผลและ feedback แบบไม่เปิดเผยข้อมูลส่วนบุคคล
3. ไม่มี defect ระดับ Critical ที่เปิดอยู่ และ defect ระดับ High มีผล retest หรือ stakeholder acceptance ที่บันทึกไว้
4. เอกสาร requirements, design, data model, user guide, deployment/operation guide และ known limitations เป็นฉบับเดียวกับ release
5. Repository ไม่มีเอกสารจริงหรือข้อมูลส่วนบุคคลที่ไม่ควรเผยแพร่ใน source, artifact, zip หรือ Git history ที่ทีมควบคุมได้

## 10. Checklist ก่อนเริ่ม SP1

- [ ] ทุกคนติดตั้ง stack ที่เลือกและรัน starter project/ระบบตาม README บนเครื่องของตนเองได้
- [ ] ทีมฝึก workflow หนึ่งรอบ: สร้าง branch, เปิด PR, review, แก้ CI และ merge
- [ ] อ่าน requirement และ AC ของงานที่ได้รับมอบหมาย แล้วรวบรวมคำถาม `OPEN` สำหรับ partner organisation
- [ ] นัดหรือส่งคำถาม stakeholder ใน SP1 เดือน 1 เพื่อยืนยันเจ้าของการตัดสินใจแต่ละข้อ
- [ ] เลือก first vertical slice, แตกเป็น issues และกำหนด owner/reviewer ให้ครบ
- [ ] เตรียม `.env.example`, ignore rules และข้อมูลสังเคราะห์สำหรับ local/test environment
- [ ] สร้าง GitHub Actions pipeline ขั้นต่ำที่รัน lint/typecheck/test/build ได้
- [ ] สร้าง ADR เริ่มต้นของ stack, database และ authentication ก่อนเริ่มสร้าง feature ที่ผูกกับการตัดสินใจเหล่านี้
