# การเปรียบเทียบเทคโนโลยีที่ใช้ในการพัฒนาระบบ (Technology Stack Comparison)

**โครงการ:** ระบบบริหารจัดการทุนวิจัยส่วนตัว มหาวิทยาลัยแม่ฟ้าหลวง  
**ทีม:** 404 Team Found  
**เอกสาร:** การเปรียบเทียบเทคโนโลยี  
**เวอร์ชัน:** 2.1  
**สถานะ:** ปรับปรุงตาม Source Code และข้อเสนอแนะจากทีม

---

## 1. ภาพรวม

เอกสารฉบับนี้จัดทำขึ้นเพื่อเปรียบเทียบเทคโนโลยีที่เกี่ยวข้องกับการพัฒนาระบบบริหารจัดการทุนวิจัยส่วนตัว โดยพิจารณาจากเทคโนโลยีตามข้อเสนอโครงการ เทคโนโลยีที่ใช้จริงใน Web Prototype และเทคโนโลยีทางเลือกที่อาจนำมาพิจารณาในอนาคต

การเปรียบเทียบแบ่งออกเป็น 3 แนวทาง ได้แก่

1. **Proposed Stack:** เทคโนโลยีที่ระบุไว้ในข้อเสนอโครงการวิจัยฉบับเดิม
2. **Current Prototype Stack:** เทคโนโลยีที่ใช้จริงใน Web Prototype ปัจจุบัน ซึ่งประกอบด้วยระบบหลักที่ใช้ Vite และ React ร่วมกับ Firebase รวมถึง RS-1 Extraction POC ที่พัฒนาด้วย Next.js
3. **Alternative Stack:** เทคโนโลยี Render และ Supabase ที่อาจนำมาพิจารณาเป็นทางเลือกสำหรับการพัฒนาระบบในอนาคต

การเปรียบเทียบนี้มีวัตถุประสงค์เพื่อแสดงให้เห็นถึงเทคโนโลยีที่ใช้จริง ความแตกต่างจากแนวทางที่ระบุไว้ในข้อเสนอโครงการ รวมถึงข้อดี ข้อจำกัด และเหตุผลในการเลือกใช้เทคโนโลยีแต่ละแนวทาง

## 2. ตารางเปรียบเทียบเทคโนโลยี 3 แนวทาง

| องค์ประกอบ | Proposed Stack | Current Prototype Stack | Alternative Stack |
|---|---|---|---|
| Frontend Framework | Next.js | ระบบหลัก: Vite 8 / RS-1 POC: Next.js 15.5 | Next.js |
| UI Library | ไม่ได้ระบุ | React 19 | React |
| Programming Language | ไม่ได้ระบุ | ระบบหลัก: JavaScript (ES Modules) / RS-1 POC: TypeScript 5.8 | TypeScript |
| CSS | ไม่ได้ระบุ | CSS | Tailwind CSS |
| Backend | Node.js API Layer | ระบบหลัก: Firebase Cloud Functions (Node.js 22) / RS-1 POC: Next.js Route Handlers | Node.js API บน Render |
| API | Backend API | ระบบหลัก: `/api/research` / RS-1 POC: `/api/extract`, `/api/generate-docx`, `/api/convert-docx-pdf` | REST API |
| Authentication | ไม่ได้ระบุรายละเอียด | ระบบหลัก: Firebase Authentication ใน Firebase Mode / RS-1 POC: ไม่พบระบบ Authentication | Supabase Auth |
| Database | PostgreSQL | ระบบหลัก: Cloud Firestore ใน Firebase Mode / Local Demo และ RS-1 POC: Browser localStorage สำหรับข้อมูลร่าง | Supabase PostgreSQL |
| File Storage | ไม่ได้ระบุรายละเอียด | ระบบหลัก: Firebase Cloud Storage เมื่อเปิดใช้งาน / RS-1 POC: ประมวลผลไฟล์ผ่าน Server ชั่วคราว | Supabase Storage |
| DOCX Parsing | ไม่ได้ระบุ | RS-1 POC: JSZip และ fast-xml-parser | Library สำหรับอ่าน DOCX |
| DOCX Generation | ไม่ได้ระบุ | RS-1 POC: Next.js Route Handler และ JSZip | Library สำหรับสร้าง DOCX |
| Legacy DOC Parsing | ไม่ได้ระบุ | RS-1 POC: word-extractor | Library สำหรับอ่านไฟล์ .doc |
| PDF Parsing | ไม่ได้ระบุ | ระบบหลัก: PDF.js | Library สำหรับอ่าน PDF |
| PDF Generation | PDFKit ตามแนวทางในข้อเสนอ | ระบบหลัก: jsPDF / RS-1 POC: Microsoft Word และ PowerShell สำหรับแปลง DOCX เป็น PDF บน Windows | PDFKit หรือ jsPDF |
| Validation | ไม่ได้ระบุ | RS-1 POC: Zod | Zod หรือ Validation Library อื่น |
| Internationalization | ไม่ได้ระบุ | ระบบหลัก: i18next และ react-i18next | Library สำหรับรองรับหลายภาษา |
| Testing | ไม่ได้ระบุ | ระบบหลัก: Node.js Test Runner และ Browser Test Scripts / RS-1 POC: Node.js Test Runner | Testing Framework ตามความเหมาะสม |
| Hosting | Cloudflare (ตัวเลือกที่เสนอ) | ระบบหลัก: มีการกำหนดค่า Firebase Hosting / RS-1 POC: Next.js Development Server | Render |

**หมายเหตุ:**

- ตารางนี้แยกเทคโนโลยีของระบบหลักและ RS-1 Extraction POC เพื่อไม่ให้เข้าใจว่าเป็น Application เดียวกันหรือใช้ Framework เดียวกันทั้งหมด
- เวอร์ชันเทคโนโลยีอ้างอิงจากไฟล์ `package.json` และไฟล์กำหนดค่าของแต่ละ Prototype
- Local Demo และ RS-1 Extraction POC ใช้ Browser localStorage สำหรับจัดเก็บข้อมูลร่าง ไม่ใช่ฐานข้อมูลส่วนกลาง
- Firebase Mode ของระบบหลักใช้ Cloud Firestore สำหรับจัดเก็บข้อมูลส่วนกลาง
- Render และ Supabase เป็นเพียงทางเลือก ยังไม่พบการนำมาใช้งานจริงใน Source Code ที่ตรวจสอบ

## 3. เทคโนโลยีที่ใช้จริงใน Web Prototype ปัจจุบัน

ระบบที่พัฒนาขึ้นประกอบด้วย Web Prototype หลักและ RS-1 Extraction POC ซึ่งมีหน้าที่และเทคโนโลยีแตกต่างกัน

### 3.1 Web Prototype หลัก

ระบบหลักพัฒนาด้วย Vite และ React โดยรองรับการทำงาน 2 โหมด ได้แก่ Local Demo และ Firebase Mode

| เทคโนโลยี | เวอร์ชันที่ตรวจสอบได้ | หน้าที่ |
|---|---|---|
| Vite | 8.3.x | ใช้เป็นเครื่องมือสำหรับพัฒนาและ Build Web Application |
| React | 19.2.x | ใช้สร้างส่วนติดต่อผู้ใช้งานและจัดการ Components |
| JavaScript | ES Modules | ใช้พัฒนาการทำงานของ Frontend |
| Firebase | 13.x | เชื่อมต่อบริการ Firebase ใน Firebase Mode |
| Firebase Admin SDK | 14.5.x | ใช้ดำเนินการและจัดการข้อมูลฝั่ง Server |
| Firebase Cloud Functions | 7.4.x | ให้บริการ Backend API |
| Node.js | 22 | Runtime สำหรับ Backend Functions |
| i18next | 26.4.x | จัดการข้อความและรองรับหลายภาษา |
| react-i18next | 17.0.x | เชื่อมต่อระบบแปลภาษากับ React |
| jsPDF | 4.2.x | สร้างเอกสาร PDF |
| Mammoth.js | 1.13.x | อ่านและสกัดข้อความจากไฟล์ DOCX |
| PDF.js | 6.4.x | อ่านและสกัดข้อความจากเอกสาร PDF |
| Lucide React | 1.58.x | แสดงไอคอนในส่วนติดต่อผู้ใช้งาน |

**หมายเหตุ:** เวอร์ชันที่แสดงเป็นเวอร์ชันอ้างอิงจากช่วงที่กำหนดใน `package.json` ไม่ใช่ผลการยืนยันว่าเป็นเวอร์ชันที่ติดตั้งจริงในทุกสภาพแวดล้อม

### 3.2 RS-1 Extraction POC

RS-1 Extraction POC เป็นส่วนงานสำหรับทดลองอ่านและสกัดข้อมูลจากเอกสารข้อเสนอโครงการวิจัย RS-1 รวมถึงการแก้ไขข้อมูลและสร้างเอกสารกลับมาในรูปแบบ DOCX และ PDF

ส่วนนี้พัฒนาด้วย Next.js 15 และ TypeScript โดยใช้ Next.js Route Handlers สำหรับประมวลผลคำขอฝั่ง Server

| เทคโนโลยี | เวอร์ชันที่ตรวจสอบได้ | หน้าที่ |
|---|---|---|
| Next.js | 15.5.x | Framework สำหรับพัฒนา Web Application และ API Route |
| React | 19.0.x | สร้างส่วนติดต่อผู้ใช้งาน |
| TypeScript | 5.8.x | ใช้พัฒนาระบบโดยกำหนดชนิดข้อมูล |
| Node.js | Node.js Runtime | ใช้ประมวลผล API ฝั่ง Server |
| JSZip | 3.10.x | อ่านและจัดการไฟล์ DOCX ซึ่งเป็นไฟล์ ZIP ที่ประกอบด้วย XML |
| fast-xml-parser | 5.2.x | อ่านและแปลงข้อมูล XML ภายในไฟล์ DOCX |
| Zod | 4.0.x | ตรวจสอบความถูกต้องของข้อมูลและโครงสร้างข้อมูล |
| word-extractor | 1.0.x | อ่านและสกัดข้อความจากไฟล์ Microsoft Word รุ่นเก่า `.doc` |

**3.2.1 API ที่พัฒนาด้วย Next.js Route Handlers**

| API Endpoint | หน้าที่ |
|---|---|
| `/api/extract` | รับไฟล์ DOCX และสกัดข้อมูลจากเอกสาร RS-1 ผ่านกระบวนการประมวลผลฝั่ง Server |
| `/api/generate-docx` | รับข้อมูลจากผู้ใช้งานและสร้างเอกสาร DOCX |
| `/api/convert-docx-pdf` | แปลงไฟล์ DOCX เป็น PDF โดยใช้ Microsoft Word ผ่าน PowerShell บน Windows |

**3.2.2 กระบวนการประมวลผลเอกสาร**

1. ผู้ใช้งานอัปโหลดเอกสาร RS-1 ในรูปแบบ DOCX
2. Frontend ส่งไฟล์ไปยัง `/api/extract`
3. Server ใช้ JSZip และ fast-xml-parser อ่านโครงสร้างเอกสาร DOCX
4. ระบบดำเนินการสกัดข้อมูลผ่าน RS-1 Extraction Pipeline
5. Server ส่งผลลัพธ์กลับไปยัง Frontend ในรูปแบบ JSON
6. ผู้ใช้งานตรวจสอบและแก้ไขข้อมูลที่สกัดได้
7. เมื่อผู้ใช้งานต้องการสร้างเอกสาร ระบบส่งข้อมูลไปยัง `/api/generate-docx`
8. ระบบสร้างเอกสาร DOCX จากข้อมูลที่ได้รับ
9. หากต้องการดูตัวอย่าง PDF ระบบส่งไฟล์ DOCX ไปยัง `/api/convert-docx-pdf` เพื่อแปลงผ่าน Microsoft Word และ PowerShell บน Windows

**ข้อจำกัดของการแปลง PDF**

การแปลง DOCX เป็น PDF ใน POC ปัจจุบันอาศัย Microsoft Word ที่ติดตั้งอยู่บน Windows และเรียกใช้งานผ่าน PowerShell ดังนั้นการนำส่วนนี้ไป Deploy บน Server หรือ Hosting ที่ไม่ใช่ Windows จำเป็นต้องปรับปรุงกระบวนการแปลงเอกสารก่อน

### 3.3 Database และการจัดเก็บข้อมูล

ระบบมีรูปแบบการจัดเก็บข้อมูลแตกต่างกันตามส่วนงานและโหมดการทำงาน

**1. Web Prototype - Local Demo**

ใช้ Browser localStorage สำหรับจัดเก็บข้อมูลตัวอย่าง ข้อมูลจำลอง และข้อมูลร่างของผู้ใช้งาน โดยข้อมูลอยู่ภายใน Browser และไม่ได้เป็นฐานข้อมูลส่วนกลาง

**2. Web Prototype - Firebase Mode**

ใช้ Cloud Firestore เป็นฐานข้อมูลส่วนกลางสำหรับจัดเก็บข้อมูลโครงการ ข้อมูลผู้ใช้งาน การแจ้งเตือน และประวัติการดำเนินงาน โดยมีการกำหนดสิทธิ์การเข้าถึงตามบทบาทและ Workspace

**3. RS-1 Extraction POC**

ปัจจุบันยังไม่พบการเชื่อมต่อฐานข้อมูลส่วนกลางหรือ External Database API ในส่วน RS-1 Extraction POC โดย API จะรับข้อมูลจากผู้ใช้งาน ประมวลผลบน Server และส่งผลลัพธ์กลับในรูปแบบ JSON

สำหรับข้อมูลร่างที่ผู้ใช้งานกรอกในหน้าฟอร์ม ระบบใช้ Browser localStorage ผ่าน Key `rs1-project-draft` เพื่อบันทึกข้อมูลร่างและเรียกคืนเมื่อกลับมาใช้งาน

ดังนั้น localStorage ในส่วนนี้มีหน้าที่จัดเก็บข้อมูลร่างภายใน Browser ไม่ใช่ระบบจัดเก็บข้อมูลโครงการส่วนกลาง

## 4. เปรียบเทียบ Local Demo และ Firebase Mode

Web Prototype หลักรองรับการทำงาน 2 โหมด เพื่อให้สามารถทดลองการทำงานของระบบได้ทั้งในรูปแบบข้อมูลจำลองและการเชื่อมต่อบริการ Firebase

| ประเด็น | Local Demo | Firebase Mode |
|---|---|---|
| Frontend | Vite 8 + React 19 | Vite 8 + React 19 |
| การเข้าสู่ระบบ | จำลองการเลือกบทบาทผู้ใช้งาน | Firebase Authentication |
| ข้อมูลผู้ใช้งาน | ข้อมูลจำลอง | Firebase UID และ User Profile |
| Backend | ประมวลผลภายใน Browser | Firebase Cloud Functions |
| Database | Browser localStorage | Cloud Firestore |
| การจัดเก็บข้อมูล | จัดเก็บภายใน Browser ของผู้ใช้งาน | จัดเก็บในฐานข้อมูลส่วนกลาง |
| การบันทึกข้อมูล | Local Store และ Reducers | Backend API และ Firestore Transaction |
| การควบคุมสิทธิ์ | จำลองการตรวจสอบตามบทบาท | Server-side Authorization และ Firestore Security Rules |
| File Storage | จัดเก็บข้อมูลเอกสารตามรูปแบบที่ใช้ใน Demo | Firebase Cloud Storage เมื่อเปิดใช้งาน |
| Notification | ข้อมูลแจ้งเตือนจำลอง | In-app Notifications ผ่าน Firestore |
| การส่งอีเมล | ไม่มีระบบส่งอีเมลจริง | ยังไม่พบ Email Sender หรือ Scheduler |
| การใช้งานหลายผู้ใช้ | ไม่ใช่ฐานข้อมูลส่วนกลางสำหรับผู้ใช้หลายราย | รองรับการจัดเก็บข้อมูลส่วนกลางตามสิทธิ์ที่กำหนด |

**ข้อดีของ Local Demo**

- สามารถทดลองหน้าจอและ Workflow ได้โดยไม่ต้องเชื่อมต่อ Firebase
- เหมาะสำหรับการสาธิตและตรวจสอบการทำงานของส่วนติดต่อผู้ใช้งาน
- สามารถพัฒนาและทดสอบส่วน Frontend ได้อย่างสะดวก
- ไม่จำเป็นต้องตั้งค่าบัญชีผู้ใช้งานหรือบริการฐานข้อมูลส่วนกลาง

**ข้อจำกัดของ Local Demo**

- ข้อมูลถูกจัดเก็บภายใน Browser ของผู้ใช้งาน
- ไม่ใช่ฐานข้อมูลส่วนกลางสำหรับการใช้งานร่วมกันหลายผู้ใช้
- การเลือกบทบาทเป็นการจำลอง ไม่ใช่การยืนยันตัวตนจริง
- ไม่เหมาะสำหรับใช้เป็นระบบจัดเก็บข้อมูลจริงของมหาวิทยาลัย

**ข้อดีของ Firebase Mode**

- รองรับการยืนยันตัวตนผ่าน Firebase Authentication
- สามารถจัดเก็บข้อมูลโครงการใน Cloud Firestore
- รองรับการตรวจสอบสิทธิ์ตามบทบาทและ Workspace
- มี Backend API สำหรับตรวจสอบคำขอและประมวลผลข้อมูล
- รองรับการจัดเก็บข้อมูลส่วนกลางและการทำงานร่วมกันของผู้ใช้งานตามสิทธิ์

**ข้อจำกัดของ Firebase Mode**

- ต้องตั้งค่า Firebase Project และบริการที่เกี่ยวข้องก่อนใช้งาน
- ต้องกำหนด Security Rules และตรวจสอบสิทธิ์ให้ถูกต้อง
- การใช้งาน Cloud Storage ต้องเปิดใช้งานและตั้งค่าบริการเพิ่มเติม
- ต้องตรวจสอบค่าใช้จ่ายและข้อจำกัดของบริการตามแผนที่เลือก
- การมี Source Code และไฟล์กำหนดค่าไม่ได้ยืนยันว่าระบบพร้อมใช้งาน Production แล้ว

## 5. เทคโนโลยีทางเลือก: Render และ Supabase

Render และ Supabase เป็นเทคโนโลยีที่อาจนำมาพิจารณาสำหรับการพัฒนาระบบในอนาคต โดยสามารถใช้ Render สำหรับ Hosting และ Backend API และใช้ Supabase สำหรับฐานข้อมูล PostgreSQL, Authentication และ File Storage

### 5.1 Render

Render เป็นบริการสำหรับ Deploy และให้บริการ Web Application หรือ Backend API ที่พัฒนาด้วยเทคโนโลยี เช่น Node.js

**บทบาทที่อาจนำมาใช้**

- Hosting สำหรับ Web Application
- Deploy Backend API ที่พัฒนาด้วย Node.js
- เชื่อมต่อกับฐานข้อมูลภายนอก
- จัดการ Environment Variables และการตั้งค่าของระบบ

**ข้อดี**

- รองรับการ Deploy จาก Git Repository
- สามารถใช้กับ Node.js Backend ได้
- แยกการทำงานระหว่าง Frontend และ Backend ได้
- สามารถเชื่อมต่อกับฐานข้อมูลภายนอก เช่น PostgreSQL ได้

**ข้อจำกัด**

- ต้องตั้งค่า Environment Variables และการเชื่อมต่อบริการใหม่
- ต้องปรับ Backend จาก Firebase Cloud Functions ให้รองรับสภาพแวดล้อมของ Render
- ต้องตรวจสอบ Runtime และ Dependencies ของระบบ
- ต้องพิจารณาค่าใช้จ่าย ข้อจำกัดของทรัพยากร และเงื่อนไขของแผนบริการ
- การใช้ Render ไม่ได้ทำให้ระบบพร้อมใช้งานทันที ยังต้องตั้งค่าและทดสอบการ Deploy

### 5.2 Supabase

Supabase เป็นบริการ Backend ที่ใช้ PostgreSQL เป็นฐานข้อมูลหลัก และมีบริการ Authentication และ Storage สำหรับจัดการข้อมูลและไฟล์

**บทบาทที่อาจนำมาใช้**

- จัดเก็บข้อมูลโครงการวิจัยด้วย PostgreSQL
- จัดการข้อมูลผู้ใช้งาน
- รองรับระบบ Authentication
- จัดเก็บเอกสารผ่าน Supabase Storage
- กำหนดสิทธิ์การเข้าถึงข้อมูลผ่าน Row Level Security (RLS)

**ข้อดี**

- ใช้ PostgreSQL ซึ่งเป็นฐานข้อมูลเชิงสัมพันธ์
- รองรับ SQL และการกำหนดความสัมพันธ์ระหว่างตาราง
- มีบริการ Authentication และ Storage ภายในแพลตฟอร์ม
- สามารถกำหนดสิทธิ์การเข้าถึงข้อมูลด้วย RLS
- เหมาะสำหรับระบบที่มีข้อมูลหลายประเภทและมีความสัมพันธ์กัน

**ข้อจำกัด**

- ต้องออกแบบ Database Schema ใหม่ให้สอดคล้องกับข้อมูลโครงการ
- ต้องย้ายข้อมูลจากโครงสร้าง Firestore ไปยัง PostgreSQL หากเปลี่ยนระบบ
- ต้องกำหนด RLS และตรวจสอบสิทธิ์การเข้าถึงใหม่
- ต้องปรับปรุง Backend และ API ให้รองรับ Supabase
- ต้องทดสอบการย้ายข้อมูลและการทำงานของระบบหลังเปลี่ยนฐานข้อมูล
- ต้องศึกษาโครงสร้างและการตั้งค่าของบริการเพิ่มเติมก่อนนำมาใช้จริง

### 5.3 การใช้ Render ร่วมกับ Supabase

แนวทางที่อาจนำมาพิจารณาคือการใช้ Render สำหรับ Hosting และ Backend API ร่วมกับ Supabase สำหรับ Database, Authentication และ File Storage

| องค์ประกอบ | เทคโนโลยี | หน้าที่ |
|---|---|---|
| Frontend | Vite + React หรือ Next.js | ส่วนติดต่อผู้ใช้งาน |
| Backend | Node.js API | ประมวลผลคำขอและ Business Logic |
| Hosting | Render | ให้บริการ Web Application และ Backend |
| Database | Supabase PostgreSQL | จัดเก็บข้อมูลส่วนกลาง |
| Authentication | Supabase Auth | ตรวจสอบตัวตนผู้ใช้งาน |
| File Storage | Supabase Storage | จัดเก็บเอกสารและไฟล์ที่เกี่ยวข้อง |

**ข้อควรพิจารณา**

การเปลี่ยนจาก Firebase มาใช้ Render และ Supabase ไม่ใช่เพียงการเปลี่ยน Hosting แต่ต้องปรับปรุงระบบหลายส่วน ได้แก่

1. ย้ายข้อมูลจาก Firestore ไปยัง PostgreSQL
2. ออกแบบ Database Schema และความสัมพันธ์ระหว่างข้อมูลใหม่
3. เปลี่ยนระบบ Authentication และการจัดการบทบาทผู้ใช้งาน
4. ปรับ Backend API และ Business Logic
5. ปรับระบบ File Storage และการตรวจสอบสิทธิ์ของไฟล์
6. ทดสอบการทำงานร่วมกันของผู้ใช้งานหลายบทบาท
7. ทดสอบความถูกต้องของข้อมูลและความปลอดภัยหลังการย้ายระบบ

ทั้งนี้ Render และ Supabase ยังเป็นเพียงทางเลือกที่อยู่ระหว่างการพิจารณา ไม่ใช่เทคโนโลยีที่ใช้งานจริงใน Prototype ปัจจุบัน

## 6. ตารางเปรียบเทียบข้อดี ข้อจำกัด และเหตุผลในการเลือกใช้

| แนวทาง | ข้อดี | ข้อจำกัด | เหตุผลในการเลือกใช้หรือพิจารณา |
|---|---|---|---|
| Proposed Stack: Next.js + Node.js API + PostgreSQL | มีการแบ่งส่วน Frontend, Backend และ Database ตามแนวทางที่ออกแบบไว้ | ยังไม่ใช่เทคโนโลยีที่ใช้ใน Prototype ปัจจุบันทั้งหมด | ใช้เป็นแนวทางอ้างอิงจากข้อเสนอโครงการเดิม |
| Current Prototype: Vite + React + Firebase | มี Source Code และโครงสร้างการทำงานรองรับแล้ว มี Local Demo และ Firebase Mode แยกกัน | ต้องตั้งค่า Firebase Services และตรวจสอบความพร้อมก่อน Production | เลือกใช้เพื่อพัฒนาและทดลองระบบโดยอาศัยโครงสร้างที่มีอยู่ ลดการเปลี่ยนแปลงระบบในระหว่างพัฒนา |
| RS-1 Extraction POC: Next.js + React + TypeScript | มี API Route สำหรับอ่าน DOCX สร้าง DOCX และประมวลผลเอกสาร สามารถตรวจสอบข้อมูลฝั่ง Server ได้ | ยังไม่มีฐานข้อมูลส่วนกลาง การแปลง PDF ต้องใช้ Microsoft Word บน Windows | เลือกใช้เพื่อทดลองกระบวนการสกัดข้อมูลและจัดการเอกสาร RS-1 |
| Alternative: Render + Supabase | รองรับ Node.js Backend และ PostgreSQL พร้อมบริการ Authentication และ Storage | ต้องย้ายข้อมูล ปรับ Backend และออกแบบสิทธิ์ใหม่ รวมถึงมีภาระการตั้งค่าและทดสอบเพิ่มเติม | พิจารณาเป็นทางเลือกในอนาคต หากต้องการใช้ฐานข้อมูลเชิงสัมพันธ์และแยกบริการ Hosting ออกจาก Database |

## 7. เหตุผลในการเลือกใช้เทคโนโลยีปัจจุบัน

จากการพัฒนา Web Prototype ทีมเลือกใช้เทคโนโลยีตามลักษณะงานและความต้องการของแต่ละส่วน โดยมีเหตุผลดังนี้

**7.1 Vite และ React สำหรับ Web Prototype หลัก**

เลือกใช้ Vite และ React สำหรับพัฒนาส่วนติดต่อผู้ใช้งาน เนื่องจากมีโครงสร้าง Source Code ที่รองรับการพัฒนา Components และการทดลองหน้าจอ รวมถึงสามารถ Build เป็น Web Application ได้

**7.2 Firebase สำหรับระบบหลัก**

เลือกใช้ Firebase ใน Firebase Mode เพื่อรองรับการยืนยันตัวตน การจัดเก็บข้อมูลส่วนกลาง และการประมวลผลคำขอผ่าน Backend โดยสามารถแยกข้อมูลและตรวจสอบสิทธิ์ตามบทบาทผู้ใช้งานได้

**7.3 Local Demo สำหรับการทดลองระบบ**

เลือกใช้ localStorage สำหรับจัดเก็บข้อมูลจำลองภายใน Browser เพื่อให้สามารถทดลองหน้าจอและ Workflow ได้โดยไม่จำเป็นต้องเชื่อมต่อฐานข้อมูลส่วนกลางทุกครั้ง

**7.4 Next.js และ TypeScript สำหรับ RS-1 Extraction POC**

เลือกใช้ Next.js Route Handlers เพื่อพัฒนา API สำหรับประมวลผลเอกสาร DOCX และสร้างเอกสารกลับมา โดยใช้ TypeScript เพื่อกำหนดชนิดข้อมูล และใช้ Library ที่เหมาะสมกับการอ่านและจัดการโครงสร้างเอกสาร

**7.5 การคงฐานข้อมูลเดิมในระหว่างการพัฒนา**

ในระหว่างการพัฒนา Prototype ทีมสามารถใช้โครงสร้าง Firebase และ Firestore ที่มีอยู่ต่อไปก่อนได้ เนื่องจากมี Source Code และการเชื่อมต่อเดิมรองรับแล้ว การเปลี่ยนไปใช้ Render และ Supabase ในช่วงนี้จะทำให้ต้องปรับปรุง Backend, Authentication, Database และ File Storage เพิ่มเติม ซึ่งอาจเพิ่มภาระในการพัฒนาและทดสอบระบบ

ดังนั้นจึงควรพิจารณาการเปลี่ยนเทคโนโลยีเมื่อมีความจำเป็นและมีข้อมูลเพียงพอสำหรับประเมินผลกระทบ ไม่จำเป็นต้องเปลี่ยนระบบเพียงเพื่อใช้เทคโนโลยีทางเลือก

## 8. สรุปผลการเปรียบเทียบ

จากการตรวจสอบ Source Code พบว่าโครงการมีการใช้เทคโนโลยีมากกว่าหนึ่งชุดตามลักษณะงานของแต่ละส่วน

Web Prototype หลักใช้ Vite 8 และ React 19 โดยใช้ JavaScript เป็นภาษาหลัก และรองรับการทำงาน 2 โหมด ได้แก่ Local Demo ซึ่งใช้ Browser localStorage สำหรับข้อมูลจำลอง และ Firebase Mode ซึ่งใช้ Firebase Authentication, Firebase Cloud Functions บน Node.js 22 และ Cloud Firestore สำหรับการจัดการข้อมูลส่วนกลาง

ในส่วนของ RS-1 Extraction POC ใช้ Next.js 15.5, React 19 และ TypeScript 5.8 โดยใช้ Next.js Route Handlers สำหรับประมวลผลเอกสาร มีการใช้ JSZip และ fast-xml-parser สำหรับอ่านโครงสร้าง DOCX, Zod สำหรับตรวจสอบข้อมูล และ word-extractor สำหรับอ่านไฟล์ Word รุ่นเก่า

นอกจากนี้ยังมี API สำหรับสร้าง DOCX และแปลง DOCX เป็น PDF โดยกระบวนการแปลง PDF ใน POC ปัจจุบันต้องอาศัย Microsoft Word และ PowerShell บน Windows จึงมีข้อจำกัดเมื่อต้องนำไป Deploy บนสภาพแวดล้อมอื่น

เมื่อเปรียบเทียบกับข้อเสนอโครงการเดิม พบว่ามีการปรับเปลี่ยนเทคโนโลยีบางส่วนตามความเหมาะสมของการพัฒนา Prototype โดยระบบหลักใช้ Vite, React และ Firebase ขณะที่ส่วน RS-1 Extraction ใช้ Next.js และ TypeScript เพื่อรองรับการประมวลผลเอกสารโดยเฉพาะ

สำหรับ Render และ Supabase เป็นทางเลือกที่อาจนำมาพิจารณาในอนาคต แต่การเปลี่ยนไปใช้เทคโนโลยีดังกล่าวจำเป็นต้องประเมินผลกระทบต่อระบบเดิม รวมถึงภาระในการย้ายข้อมูลและปรับปรุง Backend

ดังนั้น ในระหว่างการพัฒนา Prototype จึงเลือกใช้เทคโนโลยีที่มีโครงสร้างและ Source Code รองรับอยู่แล้วเป็นหลัก และพิจารณาเทคโนโลยีทางเลือกเมื่อมีความจำเป็นต่อการพัฒนาระบบในระยะถัดไป

## 9. เอกสารอ้างอิง

1. 404 Team Found, *Personal Research Grant Management System for Mae Fah Luang University: Research / Project Proposal*, Version 1.0, October 2026.
2. 404 Team Found, *MFU Research Grant Management Web Prototype Source Code*, November 2026.
3. `prototype/MFU-Research-Grant-UI-Demo/package.json` — Dependencies และ Scripts ของ Web Prototype หลัก
4. `prototype/MFU-Research-Grant-UI-Demo/functions/package.json` — Dependencies และ Node.js Runtime ของ Firebase Backend
5. `prototype/MFU-Research-Grant-UI-Demo/vite.config.js` — การตั้งค่า Vite และ Firebase Mode
6. `prototype/MFU-Research-Grant-UI-Demo/firebase.json` — การตั้งค่า Firebase Hosting และ Cloud Functions
7. `prototype/MFU-Research-Grant-UI-Demo/src/utils/firebaseClient.js` — การเชื่อมต่อ Firebase Services
8. `prototype/MFU-Research-Grant-UI-Demo/src/utils/firebaseSharedStore.js` — การจัดการข้อมูลใน Firebase Mode
9. `prototype/MFU-Research-Grant-UI-Demo/src/utils/sharedStore.js` — การจัดการข้อมูลใน Local Demo
10. `prototype/rs1-extraction/package.json` — Dependencies และเวอร์ชันของ RS-1 Extraction POC
11. `prototype/rs1-extraction/app/api/extract/route.ts` — API สำหรับสกัดข้อมูลจากเอกสาร DOCX
12. `prototype/rs1-extraction/app/api/generate-docx/route.ts` — API สำหรับสร้างเอกสาร DOCX
13. `prototype/rs1-extraction/app/api/convert-docx-pdf/route.ts` — API สำหรับแปลง DOCX เป็น PDF
14. `prototype/rs1-extraction/lib/docx.ts` — การอ่านและประมวลผลเอกสาร DOCX
15. `prototype/rs1-extraction/scripts/convert-docx-to-pdf.ps1` — Script สำหรับแปลง DOCX เป็น PDF ผ่าน Microsoft Word บน Windows
16. `docs/final/DEPLOYMENT_READINESS.md` — สถานะความพร้อมสำหรับการ Deploy
17. `README.md` — ขอบเขตและวิธีการใช้งาน Web Prototype
