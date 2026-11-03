import test from 'node:test';
import assert from 'node:assert/strict';
import JSZip from 'jszip';
import {readDocx} from '../lib/docx.ts';
import {extractRs1} from '../lib/extract.ts';

const esc=(value)=>value.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');

async function makeDocx(blocks){
  const body=blocks.map(block=>{
    if(block.type==='table')return `<w:tbl>${block.rows.map(row=>`<w:tr>${row.map(cell=>`<w:tc><w:p><w:r><w:t>${esc(cell)}</w:t></w:r></w:p></w:tc>`).join('')}</w:tr>`).join('')}</w:tbl>`;
    const symbol=block.symbol?`<w:r><w:sym w:font="${block.symbol.font}" w:char="${block.symbol.code}"/></w:r>`:'';
    return `<w:p>${symbol}<w:r><w:t>${esc(block.text)}</w:t></w:r></w:p>`;
  }).join('');
  const zip=new JSZip();
  zip.file('word/document.xml',`<?xml version="1.0" encoding="UTF-8" standalone="yes"?><w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"><w:body>${body}</w:body></w:document>`);
  return Buffer.from(await zip.generateAsync({type:'uint8array'}));
}

test('keeps ordered paragraphs, tables, and checkbox evidence in sourceDocument JSON',async()=>{
  const data=await makeDocx([
    {type:'paragraph',text:'ย่อหน้าแรก'},
    {type:'table',rows:[['กิจกรรม','เดือนที่ 1'],['เก็บข้อมูล','✓']]},
    {type:'paragraph',text:'ตัวเลือก',symbol:{font:'Wingdings 2',code:'F052'}}
  ]);
  const doc=await readDocx(data);
  assert.equal(doc.sourceDocument.version,1);
  assert.equal(doc.sourceDocument.sourceType,'docx');
  assert.deepEqual(doc.sourceDocument.blocks.map(block=>block.type),['paragraph','table','paragraph']);
  assert.deepEqual(doc.sourceDocument.blocks[1].rows,[['กิจกรรม','เดือนที่ 1'],['เก็บข้อมูล','✓']]);
  assert.equal(doc.sourceDocument.blocks[1].checkboxes[0].state,'checked');
  assert.equal(doc.sourceDocument.blocks[2].checkboxes[0].state,'checked');
  assert.equal(doc.sourceDocument.stats.tables,1);
  assert.equal(doc.sourceDocument.stats.checkboxes,2);
  assert.equal(doc.sourceDocument.tables[0].classification.kind,'schedule');
  assert.equal(doc.sourceDocument.tables[0].structuredRows[1].cells[1].checkboxes[0].state,'checked');
});

test('preserves merged-cell and width metadata for uploaded tables',async()=>{
  const zip=new JSZip();
  zip.file('word/document.xml',`<?xml version="1.0" encoding="UTF-8" standalone="yes"?><w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"><w:body><w:tbl><w:tr><w:tc><w:tcPr><w:gridSpan w:val="2"/><w:tcW w:w="4200" w:type="dxa"/><w:vMerge w:val="restart"/></w:tcPr><w:p><w:r><w:t>Year</w:t></w:r></w:p></w:tc><w:tc><w:p><w:r><w:t>Position</w:t></w:r></w:p></w:tc></w:tr><w:tr><w:tc><w:tcPr><w:vMerge/></w:tcPr><w:p><w:r><w:t>2026</w:t></w:r></w:p></w:tc><w:tc><w:p><w:r><w:t>Lecturer</w:t></w:r></w:p></w:tc></w:tr></w:tbl></w:body></w:document>`);
  const doc=await readDocx(Buffer.from(await zip.generateAsync({type:'uint8array'})));
  const table=doc.sourceDocument.tables[0];
  assert.equal(table.classification.kind,'biography');
  assert.equal(table.structuredRows[0].cells[0].columnSpan,2);
  assert.equal(table.structuredRows[0].cells[0].widthTwips,4200);
  assert.equal(table.structuredRows[0].cells[0].verticalMerge,'restart');
  assert.equal(table.structuredRows[1].cells[0].verticalMerge,'continue');
});

test('extracts unlabeled Thai and English titles immediately after the project title heading',async()=>{
  const data=await makeDocx([
    {type:'paragraph',text:'ข้อเสนอโครงการวิจัย'},
    {type:'paragraph',text:'ชื่อโครงการ'},
    {type:'paragraph',text:'“การศึกษาตัวอย่างในมหาวิทยาลัย”'},
    {type:'paragraph',text:'“A Sample University Study”'},
    {type:'paragraph',text:'ระบุความสอดคล้องของโครงการวิจัยกับประเด็นยุทธศาสตร์'}
  ]);
  const result=extractRs1(await readDocx(data));
  assert.equal(result.fields.projectTitleTH.value,'การศึกษาตัวอย่างในมหาวิทยาลัย');
  assert.equal(result.fields.projectTitleEN.value,'A Sample University Study');
  assert.equal(result.sourceDocument.blocks.length,5);
});
