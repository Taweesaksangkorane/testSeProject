import assert from 'node:assert/strict';
import test from 'node:test';
import {parseCollaboration} from '../lib/import-mapping.ts';

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
