import assert from 'node:assert/strict';
import test from 'node:test';
import JSZip from 'jszip';
import {readDocx} from '../lib/docx.ts';

const documentXml=(symbol)=>`<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
  <w:body>
    <w:p>
      <w:r><w:sym w:font="${symbol.font}" w:char="${symbol.code}"/></w:r>
      <w:r><w:t>ตัวเลือกทดสอบ</w:t></w:r>
    </w:p>
  </w:body>
</w:document>`;

async function docxWithSymbol(symbol){
  const zip=new JSZip();
  zip.file('word/document.xml',documentXml(symbol));
  return zip.generateAsync({type:'nodebuffer'});
}

async function docxWithParagraphXml(paragraphXml){
  const zip=new JSZip();
  zip.file('word/document.xml',`<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"
 xmlns:w14="http://schemas.microsoft.com/office/word/2010/wordml">
  <w:body><w:p>${paragraphXml}</w:p></w:body>
</w:document>`);
  return zip.generateAsync({type:'nodebuffer'});
}

for(const symbol of [
  {font:'Wingdings 2',code:'F050'},
  {font:'Wingdings 2',code:'F052'},
  {font:'Wingdings',code:'F0FE'}
]){
  test(`recognizes ${symbol.font} ${symbol.code} as checked`,async()=>{
    const doc=await readDocx(await docxWithSymbol(symbol));
    assert.equal(doc.paragraphDetails[0].checkboxes[0].state,'checked');
  });
}

test('keeps Wingdings F0A8 as unchecked',async()=>{
  const doc=await readDocx(await docxWithSymbol({font:'Wingdings',code:'F0A8'}));
  assert.equal(doc.paragraphDetails[0].checkboxes[0].state,'unchecked');
});

for(const mark of ['☑','☒','✓','✔','✅','■','●','◉']){
  test(`recognizes Unicode ${mark} as checked`,async()=>{
    const doc=await readDocx(await docxWithParagraphXml(`<w:r><w:t>${mark} ตัวเลือก</w:t></w:r>`));
    assert.equal(doc.paragraphDetails[0].checkboxes[0].state,'checked');
  });
}

for(const mark of ['☐','□','▢','⬜','○','◯']){
  test(`recognizes Unicode ${mark} as unchecked`,async()=>{
    const doc=await readDocx(await docxWithParagraphXml(`<w:r><w:t>${mark} ตัวเลือก</w:t></w:r>`));
    assert.equal(doc.paragraphDetails[0].checkboxes[0].state,'unchecked');
  });
}

test('recognizes Word content-control checkbox state',async()=>{
  const xml='<w:sdt><w:sdtPr><w14:checkbox><w14:checked w14:val="1"/></w14:checkbox></w:sdtPr><w:sdtContent><w:r><w:t>ตัวเลือก</w:t></w:r></w:sdtContent></w:sdt>';
  const doc=await readDocx(await docxWithParagraphXml(xml));
  assert.equal(doc.paragraphDetails[0].checkboxes[0].state,'checked');
});

test('recognizes legacy Word form-field checkbox state',async()=>{
  const xml='<w:r><w:fldChar w:fldCharType="begin"><w:ffData><w:checkBox><w:default w:val="1"/></w:checkBox></w:ffData></w:fldChar></w:r><w:r><w:t>ตัวเลือก</w:t></w:r>';
  const doc=await readDocx(await docxWithParagraphXml(xml));
  assert.equal(doc.paragraphDetails[0].checkboxes[0].state,'checked');
});
