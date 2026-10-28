import assert from 'node:assert/strict';
import test from 'node:test';
import {parseAdvisor,parseCollaboration} from '../lib/import-mapping.ts';

test('removes a repeated full academic position from advisor affiliation',()=>{
 assert.deepEqual(parseAdvisor('รศ. ดร. จิรวัฒน์ อรุณรัตน์; Ph.D. (Plant Molecular Biology); รองศาสตราจารย์, คณะวิทยาศาสตร์ มหาวิทยาลัยพะเยา'),{
  name:'ดร. จิรวัฒน์ อรุณรัตน์',
  qualification:'Ph.D. (Plant Molecular Biology)',
  academicPosition:'รองศาสตราจารย์',
  affiliation:'คณะวิทยาศาสตร์ มหาวิทยาลัยพะเยา'
 });
});

test('extracts an academic position supplied as its own advisor part',()=>{
 assert.deepEqual(parseAdvisor('ดร. ก ข; Ph.D.; ผู้ช่วยศาสตราจารย์; สำนักวิชาเทคโนโลยี มหาวิทยาลัยตัวอย่าง'),{
  name:'ดร. ก ข',qualification:'Ph.D.',academicPosition:'ผู้ช่วยศาสตราจารย์',affiliation:'สำนักวิชาเทคโนโลยี มหาวิทยาลัยตัวอย่าง'
 });
});

test('supports comma-separated advisor data with position attached to affiliation',()=>{
 assert.deepEqual(parseAdvisor('ผศ. ดร. ก ข, Ph.D., ผู้ช่วยศาสตราจารย์ คณะวิทยาศาสตร์, มหาวิทยาลัยตัวอย่าง'),{
  name:'ดร. ก ข',qualification:'Ph.D.',academicPosition:'ผู้ช่วยศาสตราจารย์',affiliation:'คณะวิทยาศาสตร์, มหาวิทยาลัยตัวอย่าง'
 });
});

test('normalizes professor abbreviation to the full academic position',()=>{
 assert.deepEqual(parseAdvisor('ศ. ดร. วิทวัส ธีรพงศ์, Ph.D. (Computer Science), ศาสตราจารย์, สำนักวิชาเทคโนโลยีสารสนเทศ มหาวิทยาลัยแม่ฟ้าหลวง'),{
  name:'ดร. วิทวัส ธีรพงศ์',
  qualification:'Ph.D. (Computer Science)',
  academicPosition:'ศาสตราจารย์',
  affiliation:'สำนักวิชาเทคโนโลยีสารสนเทศ มหาวิทยาลัยแม่ฟ้าหลวง'
 });
});

test('supports labelled advisor data across lines',()=>{
 assert.deepEqual(parseAdvisor('ชื่อบุคคล: ดร. ก ข\nคุณวุฒิ: Ph.D.\nตำแหน่งทางวิชาการ: รองศาสตราจารย์\nสังกัดหน่วยงาน: คณะวิทยาศาสตร์ มหาวิทยาลัยตัวอย่าง'),{
  name:'ดร. ก ข',qualification:'Ph.D.',academicPosition:'รองศาสตราจารย์',affiliation:'คณะวิทยาศาสตร์ มหาวิทยาลัยตัวอย่าง'
 });
});

test('splits an unlabeled collaboration sentence from RS-1 data6',()=>{
 const value='อ. ดร. ศุภชัย อินทรกำแหง — ศูนย์พัฒนาการเรียนรู้ภาษา สถาบันการศึกษาเครือข่าย จังหวัดเชียงราย 57000; ร่วมให้ข้อคิดเห็นต่อชุดคำศัพท์และแนวทางนำผลการศึกษาไปประยุกต์ใช้ในการจัดกิจกรรมการเรียนการสอน (ไม่เข้าถึงข้อมูลระบุตัวตนของผู้เข้าร่วม)';
 assert.deepEqual(parseCollaboration(value),{
  person:'อ. ดร. ศุภชัย อินทรกำแหง',
  organization:'ศูนย์พัฒนาการเรียนรู้ภาษา สถาบันการศึกษาเครือข่าย',
  address:'จังหวัดเชียงราย 57000',
  description:'ร่วมให้ข้อคิดเห็นต่อชุดคำศัพท์และแนวทางนำผลการศึกษาไปประยุกต์ใช้ในการจัดกิจกรรมการเรียนการสอน (ไม่เข้าถึงข้อมูลระบุตัวตนของผู้เข้าร่วม)'
 });
});

test('supports inline labelled collaboration data',()=>{
 assert.deepEqual(parseCollaboration('ชื่อบุคคล: นาย ก ชื่อหน่วยงาน: บริษัท ข ที่อยู่: 1 ถนน ค จังหวัดเชียงราย 57000 ลักษณะความร่วมมือ: ให้คำปรึกษา'),{
  person:'นาย ก',organization:'บริษัท ข',address:'1 ถนน ค จังหวัดเชียงราย 57000',description:'ให้คำปรึกษา'
 });
});

test('supports labels whose values begin on the following line',()=>{
 assert.deepEqual(parseCollaboration('ชื่อบุคคล\nนาง ก\nชื่อหน่วยงาน\nมหาวิทยาลัย ข\nที่อยู่\nจังหวัดเชียงราย 57000\nลักษณะความร่วมมือทางวิจัย\nสนับสนุนข้อมูล'),{
  person:'นาง ก',organization:'มหาวิทยาลัย ข',address:'จังหวัดเชียงราย 57000',description:'สนับสนุนข้อมูล'
 });
});

test('keeps uncertain free text together instead of guessing fields',()=>{
 const value='ประสานความร่วมมือกับเครือข่ายในพื้นที่';
 assert.deepEqual(parseCollaboration(value),{person:'',organization:'',address:'',description:value});
});
