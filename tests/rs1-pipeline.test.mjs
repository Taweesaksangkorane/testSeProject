import assert from 'node:assert/strict';
import test from 'node:test';
import {runRs1Pipeline,extractBudget,extractSchedule} from '../lib/rs1-pipeline.ts';

const p=text=>({type:'paragraph',text});
const table=rows=>({type:'table',rows});
const document=blocks=>({
  blocks,paragraphs:blocks.filter(x=>x.type==='paragraph').map(x=>x.text),
  paragraphDetails:blocks.filter(x=>x.type==='paragraph').map(x=>({text:x.text,checkboxes:[],images:[]})),
  tables:blocks.filter(x=>x.type==='table').map(x=>x.rows),
  sourceDocument:{version:1,sourceType:'docx',text:'',blocks:[],images:[],stats:{paragraphs:0,tables:0,checkboxes:0,images:0}}
});

test('pipeline keeps legacy fields and adds canonical evidence for reordered headings',()=>{
  const result=runRs1Pipeline(document([
    p('ชื่อโครงการ'),p('โครงการตัวอย่าง'),p('Sample Project'),p('ส่วน ก : สาระสำคัญ'),
    p('14. ผลลัพธ์ที่คาดว่าจะได้รับ'),p('ผลลัพธ์หนึ่ง'),
    p('6. ความสำคัญ ที่มาของปัญหา และกรอบแนวคิด'),p('เนื้อหาพื้นหลัง'),
    p('7. วัตถุประสงค์ของโครงการวิจัย'),p('เพื่อทดสอบ')
  ]));
  assert.equal(result.fields.projectTitleTH.value,'โครงการตัวอย่าง');
  assert.equal(result.canonical.sections['A:6'].value,'เนื้อหาพื้นหลัง');
  assert.equal(result.canonical.sections['A:14'].value,'ผลลัพธ์หนึ่ง');
  assert.equal(result.canonical.sections['A:19'].status,'missing');
  assert.ok(result.sectionMap.warnings.some(value=>value.includes('ข้อ 19')));
});

test('schedule extractor keeps activity and checked month labels',()=>{
  const evidence=extractSchedule({key:'A:12',part:'A',heading:'แผนงาน',sourceIndex:0,paragraphs:[],text:'',matchedBy:'label',blocks:[{type:'table',sourceIndex:1,rows:[['กิจกรรม','ม.ค.','ก.พ.'],['เก็บข้อมูล','✓',''],['วิเคราะห์','','X']]}],tables:[[['กิจกรรม','ม.ค.','ก.พ.'],['เก็บข้อมูล','✓',''],['วิเคราะห์','','X']]]});
  assert.equal(evidence.status,'found');
  assert.deepEqual(evidence.value?.map(item=>[item.activity,item.months]),[['เก็บข้อมูล',['ม.ค.']],['วิเคราะห์',['ก.พ.']]]);
});

test('two-column schedule keeps period but does not treat blank template rows as data',()=>{
  const filled=[['กิจกรรมวิจัย','ระยะเวลา'],['1. เก็บข้อมูล','มกราคม - มีนาคม']];
  const found=extractSchedule({key:'A:12',part:'A',heading:'แผนงาน',sourceIndex:0,paragraphs:[],text:'',matchedBy:'label',blocks:[{type:'table',sourceIndex:1,rows:filled}],tables:[filled]});
  assert.equal(found.status,'found');
  assert.equal(found.value[0].activity,'เก็บข้อมูล');
  assert.equal(found.value[0].period,'มกราคม - มีนาคม');
  const blank=[['Task','Period'],['1.......',''],['2.......','']];
  const review=extractSchedule({key:'A:12',part:'A',heading:'Work plan',sourceIndex:0,paragraphs:[],text:'',matchedBy:'label',blocks:[{type:'table',sourceIndex:1,rows:blank}],tables:[blank]});
  assert.equal(review.status,'review');
  assert.equal(review.value,null);
});

test('matrix schedule uses checkbox evidence from the original table cell',()=>{
  const rows=[['กิจกรรมวิจัย','เดือนที่','ผู้รับผิดชอบ'],['','1','2',''],['เก็บข้อมูล','','','หัวหน้าโครงการ']];
  const cells=rows.map(row=>({cells:row.map(text=>({text,columnSpan:1,verticalMerge:null,widthTwips:null,checkboxes:[],images:[]}))}));
  cells[2].cells[1].checkboxes.push({state:'checked',code:'F052',font:'Wingdings 2'});
  const tableEvidence={rows,structuredRows:cells,classification:{kind:'schedule',confidence:'high',reason:'test'}};
  const evidence=extractSchedule({key:'A:12',part:'A',heading:'แผนงาน',sourceIndex:0,paragraphs:[],text:'',matchedBy:'label',blocks:[{type:'table',sourceIndex:1,rows,table:tableEvidence}],tables:[rows]});
  assert.equal(evidence.status,'found');
  assert.deepEqual(evidence.value[0].months,['1']);
  assert.equal(evidence.value[0].responsible,'หัวหน้าโครงการ');
});

test('matrix schedule never treats an unknown checkbox glyph as selected',()=>{
  const rows=[['กิจกรรมวิจัย','1','2'],['เก็บข้อมูล','','']];
  const cells=rows.map(row=>({cells:row.map(text=>({text,columnSpan:1,verticalMerge:null,widthTwips:null,checkboxes:[],images:[]}))}));
  cells[1].cells[1].checkboxes.push({state:'unknown',code:'F099',font:'Wingdings'});
  const tableEvidence={rows,structuredRows:cells,classification:{kind:'schedule',confidence:'high',reason:'test'}};
  const evidence=extractSchedule({key:'A:12',part:'A',heading:'แผนงาน',sourceIndex:0,paragraphs:[],text:'',matchedBy:'label',blocks:[{type:'table',sourceIndex:1,rows,table:tableEvidence}],tables:[rows]});
  assert.equal(evidence.status,'review');
  assert.deepEqual(evidence.value[0].months,[]);
  assert.deepEqual(evidence.value[0].uncertainMonths,['1']);
});

test('budget extractor keeps rows and reports missing amounts without inventing them',()=>{
  const rows=[['หมวด','รายการ','จำนวน','บาท'],['ค่าใช้สอย','','',''],['','เดินทาง','2 x 500','1,000'],['','วัสดุ','1 ชุด','']];
  const evidence=extractBudget({key:'A:17',part:'A',heading:'งบประมาณ',sourceIndex:0,paragraphs:[],text:'',matchedBy:'label',blocks:[{type:'table',sourceIndex:1,rows}],tables:[rows]});
  assert.equal(evidence.value?.[0].amount,1000);
  assert.equal(evidence.value?.[1].amount,null);
  assert.equal(evidence.status,'review');
  assert.match(evidence.warnings[0],/1 รายการ/);
});

test('two-column budget uses the first cell as description and last cell as amount',()=>{
  const rows=[['รายการค่าใช้จ่าย','จำนวนเงิน (บาท)'],['งบดำเนินงาน',''],['ค่าตอบแทนนักศึกษาช่วยงาน','5,700']];
  const evidence=extractBudget({key:'A:17',part:'A',heading:'งบประมาณ',sourceIndex:0,paragraphs:[],text:'',matchedBy:'label',blocks:[{type:'table',sourceIndex:1,rows}],tables:[rows]});
  assert.equal(evidence.status,'found');
  assert.equal(evidence.value[0].description,'ค่าตอบแทนนักศึกษาช่วยงาน');
  assert.equal(evidence.value[0].amount,5700);
});

test('English headings map to the same canonical keys',()=>{
  const result=runRs1Pipeline(document([p('Part A: Project information'),p('8. Literature Review'),p('Previous studies'),p('19. Other Clarifications'),p('None')]));
  assert.equal(result.canonical.sections['A:8'].value,'Previous studies');
  assert.equal(result.canonical.sections['A:19'].value,'None');
});
