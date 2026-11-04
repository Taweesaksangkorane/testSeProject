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
  assert.equal(doc.sourceDocument.version,2);
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

test('preserves paragraph numbering, indentation, alignment, spacing, runs, and symbols',async()=>{
  const zip=new JSZip();
  zip.file('word/document.xml',`<?xml version="1.0" encoding="UTF-8" standalone="yes"?><w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"><w:body><w:p><w:pPr><w:pStyle w:val="ListParagraph"/><w:numPr><w:ilvl w:val="0"/><w:numId w:val="7"/></w:numPr><w:ind w:left="720" w:hanging="360"/><w:jc w:val="both"/><w:spacing w:before="120" w:after="80" w:line="360" w:lineRule="auto"/></w:pPr><w:r><w:rPr><w:b/><w:rFonts w:ascii="TH Sarabun New"/><w:sz w:val="32"/></w:rPr><w:t>รายการทดสอบ</w:t></w:r><w:r><w:tab/></w:r><w:r><w:sym w:font="Wingdings 2" w:char="F052"/></w:r></w:p></w:body></w:document>`);
  zip.file('word/numbering.xml',`<?xml version="1.0" encoding="UTF-8"?><w:numbering xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"><w:abstractNum w:abstractNumId="3"><w:lvl w:ilvl="0"><w:start w:val="1"/><w:numFmt w:val="decimal"/><w:lvlText w:val="%1."/></w:lvl></w:abstractNum><w:num w:numId="7"><w:abstractNumId w:val="3"/></w:num></w:numbering>`);
  const doc=await readDocx(Buffer.from(await zip.generateAsync({type:'uint8array'})));
  const paragraph=doc.sourceDocument.blocks[0].paragraph;
  assert.equal(paragraph.layout.numbering.marker,'1.');
  assert.equal(paragraph.layout.indentation.leftTwips,720);
  assert.equal(paragraph.layout.indentation.hangingTwips,360);
  assert.equal(paragraph.layout.alignment,'both');
  assert.equal(paragraph.layout.spacing.line,360);
  assert.equal(paragraph.runs[0].bold,true);
  assert.equal(paragraph.runs[0].font,'TH Sarabun New');
  assert.equal(paragraph.runs[1].type,'tab');
  assert.deepEqual(paragraph.symbols,[{code:'F052',font:'Wingdings 2',text:'[Wingdings 2:F052]'}]);
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

test('keeps Part B biography values in source order and separates affiliation',async()=>{
  const data=await makeDocx([
    {type:'paragraph',text:'ส่วน ข : ประวัติคณะผู้วิจัย'},
    {type:'paragraph',text:'ชื่อ ดร. นักวิจัย ตัวอย่าง'},
    {type:'paragraph',text:'ตำแหน่งทางวิชาการ อาจารย์ประจำสำนักวิชาวิทยาศาสตร์'},
    {type:'paragraph',text:'ประวัติการศึกษา'},
    {type:'table',rows:[['2560–2564 Ph.D.'],['Example University']]},
    {type:'paragraph',text:'ประวัติการทำงาน'},
    {type:'table',rows:[['Year','Position'],['2565–ปัจจุบัน','Lecturer']]},
    {type:'paragraph',text:'ประวัติการเผยแพร่ผลงานวิจัย ทั้งภายในและภายนอกประเทศ'},
    {type:'paragraph',text:'ส่วน ค : เสนอชื่อผู้ทรงคุณวุฒิ'}
  ]);
  const result=extractRs1(await readDocx(data));
  assert.equal(result.biographies[0].thaiName,'ดร. นักวิจัย ตัวอย่าง');
  assert.equal(result.biographies[0].academicPosition,'อาจารย์');
  assert.equal(result.biographies[0].affiliation,'สำนักวิชาวิทยาศาสตร์');
  assert.match(result.biographies[0].education,/Ph\.D/);
  assert.doesNotMatch(result.biographies[0].education,/Year|Position/);
  assert.match(result.biographies[0].employment,/Lecturer/);
  assert.equal(result.biographies[0].publications,'');
});
