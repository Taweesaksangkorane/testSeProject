import assert from 'node:assert/strict';
import test from 'node:test';
import {interpretBudget,interpretSchedule,logicalGrid,money} from '../lib/rs1-table-parser.ts';
const t=rows=>({rows});
test('two-column task/period and reversed order',()=>{
 const a=interpretSchedule(t([['Task','Period'],['1. Data collection','Jan–Mar']]));
 assert.equal(a.items[0].activity,'Data collection');
 assert.equal(a.items[0].period,'Jan–Mar');
 const b=interpretSchedule(t([['Period','Task'],['Jan–Mar','1. Data collection']]));
 assert.equal(b.items[0].activity,'Data collection');
 assert.equal(b.items[0].period,'Jan–Mar');
});
test('Gantt with merged header, month cells and original F0D6 symbol evidence',()=>{
 const mark={state:'checked',code:'F0D6',font:'Symbol'};
 const rows=[['กิจกรรมวิจัย','เดือนที่ (2 เดือน)','ผู้รับผิดชอบ'],['','1','2',''],['1. เก็บข้อมูล','','','นักวิจัย']];
 const structuredRows=[
  {cells:[{text:'กิจกรรมวิจัย'},{text:'เดือนที่ (2 เดือน)',columnSpan:2},{text:'ผู้รับผิดชอบ'}]},
  {cells:[{text:''},{text:'1'},{text:'2'},{text:''}]},
  {cells:[{text:'1. เก็บข้อมูล'},{text:'',checkboxes:[mark]},{text:''},{text:'นักวิจัย'}]}
 ];
 const x=interpretSchedule({rows,structuredRows});
 assert.equal(x.items[0].activity,'เก็บข้อมูล');
 assert.deepEqual(x.items[0].months,['1']);
 assert.equal(x.items[0].responsible,'นักวิจัย');
 assert.equal(logicalGrid({rows,structuredRows})[0].length,4);
});
test('budget 2 columns either order and unusual comma spacing',()=>{
 const a=interpretBudget(t([['รายการค่าใช้จ่าย','จำนวนเงิน (บาท)'],['หมวดค่าตอบแทน',''],['นักศึกษาช่วยงาน','4 , 200'],['รวมงบประมาณ','4,200']]));
 assert.equal(a.items.length,1);assert.equal(a.items[0].amount,4200);assert.match(a.items[0].category,/หมวดค่าตอบแทน/);
 const b=interpretBudget(t([['Amount (Baht)','Description'],['1,500','Ethics fee']]));
 assert.equal(b.items[0].amount,1500);assert.equal(b.items[0].description,'Ethics fee');
 assert.equal(money('2 คน 500 บาท'),null);
});
test('budget with quantity in arbitrary column',()=>{
 const x=interpretBudget(t([['Amount','Qty','Description'],['1000','2 x 500','ค่าบริการ']]));
 assert.deepEqual(x.items.map(i=>[i.description,i.quantity,i.amount]),[['ค่าบริการ','2 x 500',1000]]);
});
test('blank tables do not invent populated rows',()=>{
 assert.deepEqual(interpretBudget(t([['Expense List','Amount'],['','']])).items,[]);
 assert.deepEqual(interpretSchedule(t([['Task','Period'],['1.......','']])).items,[]);
});
