import assert from 'node:assert/strict';
import test from 'node:test';
import {segmentRs1Sections} from '../lib/rs1-sections.ts';

const p=(text)=>({type:'paragraph',text});
const table=(rows)=>({type:'table',rows});

test('Thai RS-1: preserves narrative, budget/schedule tables and part boundaries',()=>{
 const document={blocks:[
  p('1. ชื่อโครงการ'),p('ตัวอย่างโครงการ'),p('ส่วน ก : สาระสำคัญของข้อเสนอโครงการวิจัย'),
  p('1. คณะผู้วิจัย'),p('ชื่อ-สกุล นักวิจัยตัวอย่าง'),
  p('6. ความสำคัญที่มาของปัญหาที่ทำการวิจัย และกรอบแนวความคิด'),
  p('1. ข้อมูลพื้นหลังที่มีเลขรายการ'),p('7. วัตถุประสงค์ของโครงการวิจัย'),p('1. เพื่อศึกษา'),
  p('12. แผนการดำเนินงานตลอดโครงการวิจัย'),table([['กิจกรรมวิจัย','1','2'],['เก็บข้อมูล','✓','']]),
  p('13. ผลงานตามระยะเวลาการรายงานความก้าวหน้างานวิจัย'),p('รายงานความก้าวหน้า'),
  p('ส่วน ข : ประวัติคณะผู้วิจัย'),p('1. ชื่อ-สกุล สมชาย'),p('4. ประวัติการศึกษา'),p('PhD'),
  p('ส่วน ค : เสนอชื่อผู้ทรงคุณวุฒิอ่านรายงานวิจัยฉบับสมบูรณ์'),p('1. ชื่อ-สกุล: ผู้ประเมินตัวอย่าง')
 ]};
 const result=segmentRs1Sections(document);
 assert.equal(result.sections['intro:title'].text,'ตัวอย่างโครงการ');
 assert.equal(result.sections['A:6'].text,'1. ข้อมูลพื้นหลังที่มีเลขรายการ');
 assert.equal(result.sections['A:7'].text,'1. เพื่อศึกษา');
 assert.equal(result.sections['A:12'].tables[0][1][1],'✓');
 assert.equal(result.sections['B:4'].text,'PhD');
 assert.match(result.sections['C:reviewers'].text,/ผู้ประเมินตัวอย่าง/);
});

test('English RS-1: matches translated headings',()=>{
 const result=segmentRs1Sections({blocks:[
  p('1. Project Title'),p('Cultural Spaces'),
  p('Part A: Project information'),
  p('6. The Background of the Research and the Conceptual Framework'),
  p('Cultural field background'),
  p('8. Literature Review'),p('Prior studies'),
  p('Part B: Autobiography of the researchers'),p('4. Educational background'),p('PhD'),
  p('Part C: List of reviewers for final report'),p('1. Full name: Reviewer')
 ]});
 assert.equal(result.sections['intro:title'].text,'Cultural Spaces');
 assert.equal(result.sections['A:6'].text,'Cultural field background');
 assert.equal(result.sections['A:8'].text,'Prior studies');
 assert.equal(result.sections['B:4'].text,'PhD');
});

test('Can route changed page lengths and inline headings',()=>{
 const result=segmentRs1Sections({blocks:[
  p('ส่วน ก : สาระสำคัญ'),p('ความสำคัญที่มาของปัญหาที่ทำการวิจัย'),
  p('ข้อความหน้าแรก'),p('ข้อความหน้าถัดไป'),
  p('7. วัตถุประสงค์ของโครงการวิจัย: เพื่อปรับปรุงระบบ')
 ]});
 assert.equal(result.sections['A:6'].text,'ข้อความหน้าแรก\nข้อความหน้าถัดไป');
 assert.equal(result.sections['A:7'].text,'เพื่อปรับปรุงระบบ');
});

test('Reports missing sections instead of claiming 100% extraction',()=>{
 const result=segmentRs1Sections({blocks:[p('ส่วน ก : สาระสำคัญ'),p('7. วัตถุประสงค์ของโครงการวิจัย'),p('ทดสอบ')]});
 assert.ok(result.warnings.some(x=>x.includes('ข้อ 19')));
 assert.equal(result.sections['A:7'].text,'ทดสอบ');
});
