# State Transition Specification
## ระบบบริหารจัดการทุนวิจัยส่วนตัว มหาวิทยาลัยแม่ฟ้าหลวง

**Project:** Personal Research Grant Management System for Mae Fah Luang University  
**Team:** 404 Team Found  
**Version:** 1.7 — Prototype Implementation & Traceability Update (16 November 2026)

> **Implementation baseline (16 พ.ย. 2569):** อ้างอิงรายงาน Codex ของ source revision `fb9c532` (local audit; ไม่ใช่การยืนยัน deployment หรือ Stakeholder acceptance) เอกสารนี้อธิบายระบบเป้าหมาย; ดูสถานะและข้อจำกัดราย FR ใน [Traceability.md](Traceability.md).

**วันที่:** 16 พฤศจิกายน 2569
**สถานะ:** Draft — มีบางเงื่อนไขรอการยืนยันจาก Stakeholder  
**เอกสารอ้างอิง:** To-Be Workflow, แบบฟอร์ม RS-1, ขั้นตอนทุนวิจัยส่วนตัว พ.ศ. 2570 และคำตอบ Stakeholder วันที่ 12 พฤศจิกายน 2569

## 1. วัตถุประสงค์และขอบเขต

กำหนด **สถานะหลักของโครงการวิจัย** การเปลี่ยนสถานะ ผู้ดำเนินการ และข้อจำกัด เพื่อใช้อ้างอิงร่วมกันใน Requirements, User Flow, Use Case, Backend และ Test Cases

- **สถานะหลัก** สื่อภาพรวมโครงการ ไม่ใช่ทุกขั้นตอนย่อยของงานเอกสาร
- **การแก้ไขเอกสาร การประเมินหนึ่งรอบ การขยายเวลา การแนบเอกสาร และการบันทึกทะเบียน** อาจเป็นเหตุการณ์ภายในสถานะเดิม
- **e-Office และการพิจารณาของต้นสังกัด/คณะกรรมการ** เป็นกระบวนการภายนอก Web ไม่มีการเชื่อมต่ออัตโนมัติใน Scope ปัจจุบัน
- คงสถานะเดิม 8 สถานะและ `TR-01`–`TR-16`; เพิ่ม `CANCELLED` เป็นสถานะที่ 9 และ `TR-17` โดยไม่เปลี่ยนความหมายของ Transition เดิม

## 2. State Transition Diagram (Main Flow)

> แผนภาพนี้แสดงเฉพาะ **การเปลี่ยนสถานะหลัก** เพื่อให้อ่านบน GitHub ได้ง่าย ส่วนเหตุการณ์ที่ไม่เปลี่ยนสถานะ (`TR-02`, `04`, `06`, `10`, `12`, `15`) และเส้นทางที่ยังไม่ยืนยัน (`TR-07`) อยู่ในตารางหัวข้อ 4; **ไม่ใช่การลบ Transition เหล่านั้นออกจากข้อกำหนด**

```mermaid
flowchart TD
    CAN["CANCELLED<br/>ยกเลิกโครงการ (terminal)"]
    START((เริ่มต้น))
    DRAFT["DRAFT<br/>ร่างข้อเสนอโครงการ"]
    AFF["AFFILIATION_REVIEW<br/>รอต้นสังกัดพิจารณา"]
    STAFF["STAFF_REVIEW<br/>รอเจ้าหน้าที่ตรวจสอบ"]
    COMM["COMMITTEE_ACKNOWLEDGEMENT<br/>รอเสนอคณะกรรมการเพื่อทราบ"]
    PROG["IN_PROGRESS<br/>ดำเนินการวิจัย"]
    CLOSE["CLOSURE_REVIEW<br/>รอตรวจเอกสารปิดโครงการ"]
    EVAL["REPORT_EVALUATION<br/>อยู่ระหว่างประเมินรายงาน"]
    CLOSED["CLOSED<br/>ปิดโครงการแล้ว"]
    END((สิ้นสุด))

    START -->|TR-01| DRAFT
    DRAFT -->|TR-03| AFF
    AFF -->|TR-05| STAFF
    STAFF -->|TR-08| COMM
    COMM -->|TR-09| PROG
    PROG -->|TR-11| CLOSE
    CLOSE -->|TR-13: รายงาน 5 บท| EVAL
    CLOSE -->|TR-14: ผลงานเผยแพร่| CLOSED
    EVAL -->|TR-16| CLOSED
    PROG -->|TR-17| CAN
    CLOSED --> END

    classDef normal fill:#eff6ff,stroke:#2563eb,color:#1e3a8a
    classDef review fill:#fff7ed,stroke:#ea580c,color:#9a3412
    classDef complete fill:#dcfce7,stroke:#16a34a,color:#166534
    classDef cancelled fill:#fee2e2,stroke:#dc2626,color:#991b1b
    class DRAFT,AFF,PROG normal
    class STAFF,COMM,CLOSE,EVAL review
    class CLOSED complete
    class CAN cancelled
```

**การอ่านแผนภาพ:** ตัวเลข `TR-xx` ตรงกับตารางในหัวข้อ 4; การเกิด `TR-16` หมายถึงเจ้าหน้าที่บันทึกปิดหลังรับรายงานฉบับแก้ไขและเอกสารที่กำหนด ไม่ใช่ปิดทันทีเมื่ออัปโหลด

## 3. State Definitions

| State ID | ชื่อสถานะ | ความหมายและผู้รับผิดชอบ |
|---|---|---|
| `DRAFT` | ร่างข้อเสนอโครงการ | นักวิจัยสร้าง/กรอก/นำเข้าและสกัด RS-1 ตรวจข้อมูลและบันทึกร่าง |
| `AFFILIATION_REVIEW` | รอต้นสังกัดพิจารณา | นักวิจัยจัดทำ RS-1 ฉบับพร้อมยื่นและนำไปดำเนินการกับต้นสังกัด **ภายนอก Web**; ไม่ยืนยันว่าต้นสังกัดได้รับเอกสารแล้ว |
| `STAFF_REVIEW` | รอเจ้าหน้าที่ตรวจสอบ | นักวิจัยส่งข้อเสนอผ่าน Web แล้ว; เจ้าหน้าที่ตรวจ RS-1 ฉบับลงนาม หลักฐานต้นสังกัด ข้อมูล/งบประมาณ และขอแก้ไขได้ |
| `COMMITTEE_ACKNOWLEDGEMENT` | รอเสนอคณะกรรมการเพื่อทราบ | เจ้าหน้าที่ตรวจผ่านและดำเนินเรื่องเสนอคณะกรรมการ **เพื่อทราบ** ไม่ใช่รออนุมัติผ่าน Web |
| `IN_PROGRESS` | ดำเนินการวิจัย | เจ้าหน้าที่บันทึกรับรองโครงการแล้ว; ติดตามเวลาและบันทึกผลคำขอขยายเวลาที่ดำเนินผ่าน e-Office |
| `CLOSURE_REVIEW` | รอตรวจเอกสารปิดโครงการ | นักวิจัยแนบ/ยื่นเอกสารปิดโครงการใน Web; เจ้าหน้าที่ตรวจตามเส้นทางที่เลือก ไม่เพิ่มระบบติดตามสถานะย่อยโดยพลการ |
| `REPORT_EVALUATION` | อยู่ระหว่างประเมินรายงาน | เส้นทางรายงาน 5 บท: มอบหมายผู้ทรงฯ 3 คน, นับเฉพาะผลที่ยืนยันส่ง, เจ้าหน้าที่ส่งผลให้นักวิจัยเมื่อครบ 3/3; PDF สร้างตามคำสั่งและไม่ส่งประเมินรอบสอง |
| `CLOSED` | ปิดโครงการแล้ว | เจ้าหน้าที่ตรวจเอกสารตามเงื่อนไขและบันทึกปิดใน Web; หนังสือแจ้งทางการดำเนินผ่าน e-Office |
| `CANCELLED` | ยกเลิกโครงการ | Terminal state แยกจาก `CLOSED`; เก็บเหตุผล รายละเอียด เอกสาร ผู้ยกเลิก เวลา และ Audit History โดยไม่ลบข้อมูล |

## 4. Transition Rules

| ID | จาก | Trigger / เงื่อนไข | ผู้ดำเนินการ | ไป | สถานะข้อกำหนด |
|---|---|---|---|---|---|
| `TR-01` | เริ่มต้น | สร้างและบันทึกโครงการครั้งแรก | นักวิจัย | `DRAFT` | PROCESS/DESIGN |
| `TR-02` | `DRAFT` | กรอก อัปโหลด–สกัด ตรวจแก้ หรือบันทึกร่าง RS-1 | นักวิจัย | `DRAFT` | CONFIRMED เฉพาะแนวทาง Upload/Extract; วิธีทำงาน DESIGN |
| `TR-03` | `DRAFT` | ยืนยันจัดทำเอกสาร **ฉบับพร้อมยื่นต้นสังกัด**; Preview เฉย ๆ ไม่เปลี่ยนสถานะ | นักวิจัย | `AFFILIATION_REVIEW` | DESIGN; Trigger ยัง OPEN |
| `TR-04` | `AFFILIATION_REVIEW` | ปรับแก้ข้อเสนอ/จัดทำเอกสารฉบับใหม่หลังต้นสังกัดให้ความเห็น | นักวิจัย | `AFFILIATION_REVIEW` | PROCESS/DESIGN |
| `TR-05` | `AFFILIATION_REVIEW` | แนบ **RS-1 ที่ลงนามครบ** และหลักฐานต้นสังกัด (รายงานประชุม **หรือ** หนังสือยืนยัน); หากใช้ลายเซ็นอิเล็กทรอนิกส์ต้องได้รับความยินยอมเจ้าของลายเซ็น; กด **ยืนยันส่ง** ผ่าน Web | นักวิจัย | `STAFF_REVIEW` | หลักลงนาม/ความยินยอมอ้าง RS-1; วิธีตรวจรับผ่าน Web เป็น DESIGN |
| `TR-06` | `STAFF_REVIEW` | เจ้าหน้าที่แจ้งแก้ไขผ่าน Web; นักวิจัยแก้และยืนยันส่งใหม่ | เจ้าหน้าที่ / นักวิจัย | `STAFF_REVIEW` | PROCESS/DESIGN (งานย่อย) |
| `TR-07` | `STAFF_REVIEW` | กลับไปขอความเห็นชอบจากต้นสังกัดใหม่ **หาก** ลักษณะการแก้ไขเข้าเกณฑ์ที่ Stakeholder จะกำหนด | นักวิจัย | `AFFILIATION_REVIEW` | **OPEN — ยังไม่ใช้เป็นกฎบังคับ** |
| `TR-08` | `STAFF_REVIEW` | เจ้าหน้าที่ตรวจผ่านเอกสารและข้อเสนอ | เจ้าหน้าที่ | `COMMITTEE_ACKNOWLEDGEMENT` | PROCESS/DESIGN |
| `TR-09` | `COMMITTEE_ACKNOWLEDGEMENT` | หลังขั้นตอนเสนอ **เพื่อทราบ** เจ้าหน้าที่บันทึกรับรอง; กรณีมีมาตรฐานการวิจัยที่ต้องรับรอง ต้องตรวจเงื่อนไขที่เกี่ยวข้องตามนโยบาย | เจ้าหน้าที่ | `IN_PROGRESS` | PROCESS; **จะเตือนหรือบล็อกเมื่อขาดใบรับรองยัง OPEN** |
| `TR-10` | `IN_PROGRESS` | นักวิจัยยื่นคำขอขยายเวลา **ผ่าน e-Office**; เจ้าหน้าที่นำผลมาบันทึกใน Web; ไม่มีการยื่นคำขอขยายผ่าน Web | เจ้าหน้าที่ | `IN_PROGRESS` | **CONFIRMED** จาก Stakeholder |
| `TR-11` | `IN_PROGRESS` | นักวิจัยแนบเอกสารปิดโครงการใน Web และยืนยันส่งตามเส้นทางที่เลือก; ช่องทางทางการยังดำเนินแยก | นักวิจัย | `CLOSURE_REVIEW` | PROCESS/CONFIRMED เรื่องแนบเอกสาร |
| `TR-12` | `CLOSURE_REVIEW` | เจ้าหน้าที่พบเอกสารไม่ครบและขอเอกสารเพิ่ม; นักวิจัยแนบแก้ไข | เจ้าหน้าที่ / นักวิจัย | `CLOSURE_REVIEW` | PROCESS/DESIGN (ไม่ใช่ระบบติดตามสถานะย่อย) |
| `TR-13` | `CLOSURE_REVIEW` | เส้นทาง **รายงานวิจัย 5 บท**: เจ้าหน้าที่ตรวจเอกสารและเริ่มส่งร่างให้ผู้ทรงฯ ประเมิน | เจ้าหน้าที่ | `REPORT_EVALUATION` | PROCESS |
| `TR-14` | `CLOSURE_REVIEW` | เส้นทาง **ผลงานเผยแพร่**: เจ้าหน้าที่ตรวจเอกสาร/หลักฐานครบและ **บันทึกปิด** โดยไม่ส่งผู้ทรงฯ | เจ้าหน้าที่ | `CLOSED` | PROCESS |
| `TR-15` | `REPORT_EVALUATION` | ผู้ทรงฯ 3 คนส่งผลประเมิน **หนึ่งรอบ**; `DRAFT` ไม่นับ; เมื่อครบ 3/3 เจ้าหน้าที่กดยืนยันส่งผลให้นักวิจัย; นักวิจัยส่งรายงานฉบับแก้ไข **โดยไม่ประเมินซ้ำ** | ผู้ทรงฯ / เจ้าหน้าที่ / นักวิจัย | `REPORT_EVALUATION` | CONFIRMED หนึ่งรอบ; การสร้าง PDF เป็น on-demand |
| `TR-16` | `REPORT_EVALUATION` | ได้รับรายงานฉบับแก้ไขและเอกสารที่กำหนดครบ; เจ้าหน้าที่บันทึกปิด (ไม่ส่งให้ผู้ทรงฯ ประเมินซ้ำ) | เจ้าหน้าที่ | `CLOSED` | **CONFIRMED** เรื่องไม่ประเมินซ้ำ; การตรวจเอกสาร/บันทึกปิดตาม Workflow |
| `TR-17` | `IN_PROGRESS` | ผู้มีสิทธิ์เลือกเหตุผล `RESIGNED`, `EXCEEDED_DURATION` หรือ `OTHER` (ต้องระบุรายละเอียด) และยืนยันยกเลิก | เจ้าหน้าที่ (DESIGN; สิทธิ์ OPEN) | `CANCELLED` | ไม่ยกเลิกอัตโนมัติเมื่อครบ 2 ปี; เก็บ Audit History |

## 5. Business Rules และเหตุการณ์ที่ **ไม่เพิ่มสถานะหลัก**

| รหัสอ้างอิง | กฎ/เหตุการณ์ | ผลต่อ State Transition |
|---|---|---|
| `FR-SIG-01`–`06`, `BR-11`–`12` | RS-1 ต้องมีลายเซ็นครบก่อนส่งส่วนบริหารงานวิจัย และใช้ลายเซ็นอิเล็กทรอนิกส์ได้เมื่อได้รับความยินยอมเจ้าของลายเซ็น | ตรวจประกอบ `TR-05`; ไม่เพิ่มสถานะ “รอลงนาม” โดยอัตโนมัติ |
| `BR-01`, `FR-REG-01` | รอบรับข้อเสนอ ก.พ./มิ.ย. และการตรวจวันยื่น | กำหนดว่าจะบังคับส่งเฉพาะช่วงที่เปิดรับหรือไม่ **OPEN**; ไม่สมมติว่าระบบปฏิเสธเอง |
| `BR-13`, `FR-STD-01`–`03` | การรับรองมาตรฐานการวิจัยที่เกี่ยวข้อง (เช่น มนุษย์ สัตว์ทดลอง ความปลอดภัยทางชีวภาพ) | ต้องนำไปตรวจตามเกณฑ์จริงก่อนเริ่มดำเนินงาน; ผลต่อ `TR-09` **OPEN**; ไม่บล็อกทุกโครงการ |
| `FR-ADM-09` | การขยายเวลาผ่าน e-Office แล้วเจ้าหน้าที่บันทึกผล | อยู่ `IN_PROGRESS` (`TR-10`); ไม่สร้างสถานะรออนุมัติการขยายภายใน Web |
| `FR-ADM-13` | คำขอเปลี่ยนแปลงข้อมูลโครงการผ่าน e-Office | อยู่ `IN_PROGRESS`; นักวิจัยยื่นคำขอ/ดูผลได้ แต่เฉพาะเจ้าหน้าที่ที่มีสิทธิ์ปรับปรุงข้อมูลที่อนุมัติใน Web |
| `FR-REV-07`–`10`, `FR-CLS-09`–`10` | ประเมินหนึ่งรอบ; สร้าง PDF ผลประเมินแบบ optional/on-demand; นักวิจัยแก้ไขและเจ้าหน้าที่บันทึกปิด | อยู่ `REPORT_EVALUATION` ระหว่างงาน (`TR-15`); PDF ไม่เปลี่ยนสถานะ; ปิดเมื่อเจ้าหน้าที่บันทึก (`TR-16`) |
| `FR-ADM-07`; Scope Out 5.2 | เจ้าหน้าที่บันทึกรับรองหลังขั้นตอนภายนอก และหนังสือแจ้งเริ่มดำเนินการผ่าน e-Office | Web แสดง/บันทึกสถานะ ไม่เป็นระบบส่งหนังสือราชการ |
| `BR-14`, `FR-CAN-01` | ครบกำหนด 2 ปีและการขยายเวลาที่อนุมัติแล้ว | ไม่ยกเลิกอัตโนมัติ; พิจารณาการขยายเวลาไม่เกิน 2 ครั้ง ครั้งละไม่เกิน 6 เดือน ก่อนดำเนิน `TR-17`; คำขอยังผ่าน e-Office |
| `BR-15`, `FR-REG-03`, `FR-CAN-01`–`02` | การยกเลิก/ลาออกเป็นข้อมูลที่ต้องตรวจสอบย้อนหลัง | ใช้ State ID `CANCELLED` ผ่าน `TR-17`; เก็บเหตุผล เอกสาร ผู้ดำเนินการ เวลา และ Audit History; ไม่เข้าสู่เส้นทางปิดโครงการ |
| `FR-REG-02` | โครงการไม่ดำเนินการหรือไม่ส่งเอกสารในกำหนดตามข้อ 1.3.9 | ไม่ลบหรือปิดโครงการอัตโนมัติ; trigger ผู้มีอำนาจ และความหมายของการนำออกจากทะเบียนยัง **OPEN-19** และแยกจาก `TR-17` |
| `BR-16`, `FR-REG-04` | ทะเบียนมีผลประเมิน 4 ประเภท และขั้นตอนย่อย (1)–(6) | ต้องทำ Data Dictionary/Mapping ไม่ถือเป็นสถานะโครงการทั้ง 4+6 แบบโดยอัตโนมัติ |

**การส่งกลับแก้ไข** (`TR-06`, `TR-12`) อาจใช้ `action_required_by` หรือ `revision_required` เป็นข้อมูลประกอบ โดยต้องบันทึกเหตุผล ผู้ดำเนินการ เวลา และเอกสารฉบับที่เกี่ยวข้อง (ข้อเสนอทางเทคนิค ไม่ใช่นโยบายที่ยืนยันแล้ว)

## 6. ประเด็นที่ต้องยืนยันก่อน Implement

| Open ID จาก Requirements v1.6 | ประเด็น | กระทบ |
|---|---|---|
| `OPEN-04` | นิยามการยืนยัน PDF “ฉบับพร้อมยื่น” | `TR-03` |
| `OPEN-05` | ข้อแก้ไขระดับใดต้องให้ต้นสังกัดเห็นชอบซ้ำ | `TR-07` |
| `OPEN-07` | ชื่อ/ค่าแบบประเมินในทะเบียนและกรณีไม่ส่งรายงานฉบับแก้ไขตามกำหนด | `TR-15`, `TR-16` / ทะเบียน |
| `OPEN-15`–`16` | วิธีตรวจความยินยอม/ความครบลายเซ็นและชนิดไฟล์ RS-1 ฉบับลงนาม | `TR-05` |
| `OPEN-17` | หลักฐานมาตรฐานวิจัยและเกณฑ์เตือน/บล็อกการเริ่มโครงการ | `TR-09` |
| `OPEN-18` | การบังคับเปิดรับข้อเสนอเฉพาะช่วง | `TR-05` |
| `OPEN-19` | ความหมายของ “ลบออกจากฐานข้อมูล/ทะเบียน” ตามข้อ 1.3.9, trigger และผู้มีอำนาจ | `FR-REG-02`; ห้ามลบถาวรหรือเชื่อมเป็น `TR-17` โดยอัตโนมัติ |
| `OPEN-20` | ใครมีสิทธิ์ยกเลิก และอนุญาตสถานะต้นทางอื่นนอกจาก `IN_PROGRESS` หรือไม่ | `FR-CAN-01`–`02`, `TR-17` |
| `OPEN-21` | ชื่อค่าในทะเบียนสำหรับผลประเมิน 4 แบบและขั้นตอนย่อย (1)–(6) | Data Dictionary / Mapping |

> `CANCELLED` และ `TR-17` ได้เพิ่มตามคำตอบ Stakeholder วันที่ 14 พฤศจิกายน 2569; ประเด็นที่ยังเปิดคือผู้มีสิทธิ์ยกเลิกและสถานะต้นทางอื่นนอกจาก `IN_PROGRESS`

## 7. Acceptance Criteria ตัวอย่างที่ผูกกับ Transition

| AC ID | Given / When / Then (ย่อ) |
|---|---|
| `AC-TR-05` | **Given** โครงการอยู่ `AFFILIATION_REVIEW`; **When** แนบ RS-1 ลงนามครบ + หลักฐานต้นสังกัด และยืนยันส่งผ่าน Web; **Then** สถานะเป็น `STAFF_REVIEW` และมีเวลาส่ง; หากเพียงอัปโหลดไฟล์สถานะไม่เปลี่ยน |
| `AC-TR-09` | **Given** เจ้าหน้าที่ตรวจข้อเสนอผ่านและดำเนินขั้นตอนเสนอเพื่อทราบแล้ว; **When** เจ้าหน้าที่บันทึกรับรอง; **Then** สถานะเป็น `IN_PROGRESS` และมีประวัติ; ข้อกำหนดมาตรฐานวิจัยใช้ตามเกณฑ์ที่ได้รับการยืนยันเท่านั้น |
| `AC-TR-10` | **Given** โครงการอยู่ `IN_PROGRESS`; **When** เจ้าหน้าที่บันทึกผลการขยายเวลาที่ผ่าน e-Office; **Then** ข้อมูลกำหนดเวลาถูกอัปเดตพร้อมประวัติ แต่สถานะหลักยังเป็น `IN_PROGRESS` |
| `AC-TR-14` | **Given** เอกสารปิดเส้นทางเผยแพร่ผ่านการตรวจ; **When** เจ้าหน้าที่บันทึกปิด; **Then** สถานะเป็น `CLOSED`; การแนบเอกสารอย่างเดียวไม่ปิด |
| `AC-TR-15` | **Given** โครงการอยู่ `REPORT_EVALUATION`; **When** ผู้ทรงฯ ไม่ซ้ำ 3 คนยืนยันส่งครบและเจ้าหน้าที่กดยืนยันส่งผล; **Then** นักวิจัยจึงเข้าถึงผล โดย `DRAFT` และ PDF on-demand ไม่ทำให้เกิดการส่งผลหรือเปลี่ยนสถานะ |
| `AC-TR-16` | **Given** ผู้ทรงฯ ประเมินหนึ่งรอบและนักวิจัยส่งรายงานฉบับแก้ไขพร้อมเอกสารครบ; **When** เจ้าหน้าที่บันทึกปิด; **Then** สถานะเป็น `CLOSED` โดยไม่มีการมอบหมายประเมินรอบสอง |
| `AC-TR-17` | **Given** โครงการอยู่ `IN_PROGRESS`; **When** ผู้มีสิทธิ์เลือกเหตุผล กรอกรายละเอียดเมื่อเป็น `OTHER` และยืนยัน; **Then** สถานะเป็น `CANCELLED` พร้อม Audit History; การครบ 2 ปีอย่างเดียวไม่ยกเลิกอัตโนมัติ |

## 8. Change Log / ความเชื่อมโยงเอกสาร

| เวอร์ชัน | รายการเปลี่ยนแปลง |
|---|---|
| ก่อน v1.5 | 8 สถานะหลัก; `TR-01`–`TR-16`; ประเมินรอบเดียว; e-Office แยกจาก Web |
| **v1.5** | เปลี่ยนแผนภาพเป็น `flowchart TD` แบบเส้นทางหลัก; เพิ่ม RS-1 ลงนามและความยินยอมใน `TR-05`; เชื่อมมาตรฐานวิจัยกับ `TR-09` แบบรอยืนยัน; ยืนยันการขยายเวลา `TR-10` และประเมินหนึ่งรอบ `TR-15`–`16`; เพิ่มทะเบียนยกเลิก/ลาออก ไม่ส่งเอกสารตามกำหนด และข้อมูลผลประเมินเป็นประเด็นรอการยืนยัน |
| **v1.6** | เพิ่ม `CANCELLED` และ `TR-17`; ปรับ `TR-15` เป็นผู้ทรงฯ 3 คนส่งสำเร็จก่อนเจ้าหน้าที่ส่งผล; PDF เป็น on-demand และคงการประเมินหนึ่งรอบ |
| **v1.7** | เพิ่ม mapping ของ legacy phases และ canonical states รวมข้อจำกัด implementation ตาม Codex audit; คง State IDs และ TR IDs เดิม |

**เอกสารที่ต้องปรับตามเมื่อมีคำตอบเพิ่มเติม:** Requirements, User Flow, Use Case Diagram, Use Case Specification, Test Cases และ Data Dictionary; ให้เปลี่ยนรหัส/เงื่อนไขที่เกี่ยวข้องให้ตรงกันใน Commit เดียวกัน


## 9. Demo phase / Canonical state reconciliation (v1.7)

Canonical model มี 9 states: 8 สถานะเดิมและ CANCELLED เป็น terminal branch; เส้นทางเผยแพร่ข้าม REPORT_EVALUATION. Legacy 9 phases เป็นอีก model ไม่ใช่การจับคู่แบบหนึ่งต่อหนึ่ง. หลักฐานจากรายงาน Codex: `src/domain/contracts.js:3`, `src/data/statuses.js:5`, `src/domain/migration.js:3` ที่ revision `fb9c532`. ไม่ใช่คำสั่ง migrate.

| Demo phase/status | Documented state | ข้อจำกัดในการ mapping |
|---|---|---|
| Canonical project states | **ครบ 9 สถานะ** |
| Canonical `DRAFT` | DRAFT | ตรง |
| Canonical `AFFILIATION_REVIEW` | AFFILIATION_REVIEW | ตรง; positive TR-03 เฉพาะ Local Demo |
| Canonical `STAFF_REVIEW` | STAFF_REVIEW | ตรง |
| Canonical `COMMITTEE_ACKNOWLEDGEMENT` | COMMITTEE_ACKNOWLEDGEMENT | ตรง |
| Canonical `IN_PROGRESS` | IN_PROGRESS | ตรง |
| Canonical `CLOSURE_REVIEW` | CLOSURE_REVIEW | ตรง |
| Canonical `REPORT_EVALUATION` | REPORT_EVALUATION | ตรง |
| Canonical `CLOSED` | CLOSED | ตรง |
| Canonical `CANCELLED` | CANCELLED | มี model/display/fixtures; mutation ปิด |
| Legacy `draft` | DRAFT | ต้องไม่มีหลักฐานยื่น/รับรองที่ขัดกัน |
| Legacy `unit_review` | AFFILIATION_REVIEW | ต้องตรวจ ready confirmation/version |
| Legacy `eoffice_pending` | ยังสรุปไม่ได้ | ไม่ใช่ canonical state; ต้องตรวจ submission evidence |
| Legacy `admin_review` | STAFF_REVIEW | ต้องตรวจ signed bundle และ consent |
| Legacy `committee_review` | COMMITTEE_ACKNOWLEDGEMENT | ต้องมี staff pass evidence |
| Legacy `active` | IN_PROGRESS | ต้องมี acknowledgement/certification |
| Legacy `final_report` | โดยทั่วไป IN_PROGRESS | เป็น preparation phase; ไม่ใช่ state ใหม่ |
| Legacy `closure_review` | CLOSURE_REVIEW หรือ REPORT_EVALUATION | ต้องตรวจ closure substate, assignment และ checked report |
| Legacy `completed` | CLOSED | ต้องมี staff closure evidence |
| Legacy `revision_required` | ไม่ใช่ canonical state | ต้องตรวจ origin/return context |
| Alias `submitted`, `review`, `closure` | ยังต้องตรวจหลักฐาน | presentation normalization ไม่ใช่ approved migration |
| Closure/evaluation draft, checked, awaiting review, final check | ไม่มี state หลักเพิ่ม | เป็นข้อมูลขั้นตอนย่อย |
| Legacy “9 ระยะ” กับ canonical “9 states” | เสี่ยงสื่อว่าเทียบกันหนึ่งต่อหนึ่ง | ใช้ mapping พร้อมเงื่อนไขตามข้อ 6 |

| TR | ผลตรวจ implementation |
|---|---|
| TR-01 | มี create action กำหนด DRAFT |
| TR-02 | มี save/import draft และ version history |
| TR-03 | ทำงานเฉพาะ trusted Local Demo; Backend ปิด OPEN-04 |
| TR-04 | มีแก้ใน AFFILIATION_REVIEW โดยคงสถานะ |
| TR-05 | มี signed RS-1 + affiliation evidence + consent + explicit submit guards |
| TR-06 | มี request correction; researcher edit/resubmit ครบวงจรเฉพาะ temporary Local Demo policy |
| TR-07 | ปิดตาม OPEN-05 |
| TR-08 | มี staff pass และ transition ไป COMMITTEE_ACKNOWLEDGEMENT |
| TR-09 | มี external acknowledgement และ staff certification; ไม่บล็อกมาตรฐานวิจัยทุกกรณีเอง |
| TR-10 | มี extension outcome/history และคง IN_PROGRESS; ไม่มี email rescheduling |
| TR-11 | มี closure submission ตามสองเส้นทาง |
| TR-12 | มีขอและส่งเอกสารเพิ่มโดยคง CLOSURE_REVIEW |
| TR-13 | มี checked report และผู้ทรงฯ active ไม่ซ้ำสามคน |
| TR-14 | มี explicit staff publication closure |
| TR-15 | มี submitted-only 0/3–3/3, release once, revised report และ on-demand PDF |
| TR-16 | มี latest revised-report verification ก่อน explicit staff closure |
| TR-17 | มี reason validation และ rejection; positive cancellation ปิดตาม OPEN-20 |

CLOSED และ CANCELLED เป็น terminal แยกกัน; positive cancellation ยังปิด. ไม่มีหลักฐาน auto-cancel. ไม่ได้ทดสอบ deployment หรือ browser E2E.
