import assert from 'node:assert/strict';
import test from 'node:test';
import JSZip from 'jszip';
import {readDocx} from '../lib/docx.ts';

test('preserves an embedded image as source evidence even when it has no readable text',async()=>{
  const zip=new JSZip();
  zip.file('[Content_Types].xml','<Types><Default Extension="png" ContentType="image/png"/></Types>');
  zip.file('word/_rels/document.xml.rels','<Relationships><Relationship Id="rId7" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/image" Target="media/framework.png"/></Relationships>');
  zip.file('word/media/framework.png',Buffer.from([137,80,78,71]));
  zip.file('word/document.xml','<?xml version="1.0"?><w:document xmlns:w="w" xmlns:r="r" xmlns:a="a"><w:body><w:p><w:r><w:drawing><a:blip r:embed="rId7"/></w:drawing></w:r></w:p></w:body></w:document>');
  const doc=await readDocx(await zip.generateAsync({type:'nodebuffer'}));
  assert.equal(doc.sourceDocument.stats.images,1);
  assert.equal(doc.sourceDocument.images?.[0].path,'word/media/framework.png');
  assert.equal(doc.sourceDocument.blocks[0].images?.[0].relationshipId,'rId7');
});
