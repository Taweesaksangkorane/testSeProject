import test from 'node:test';
import assert from 'node:assert/strict';
import {labeledDetails} from '../lib/rs1-preview-format.ts';

test('labels structured preview details and omits blank fields',()=>{
 assert.equal(labeledDetails([
  ['ชื่อบุคคล','อ.ดร. กมล พิมา'],
  ['คุณวุฒิ',''],
  ['สังกัดหน่วยงาน','สำนักวิชาวิทยาศาสตร์'],
  ['อีเมล','advisor@example.ac.th']
 ]),'ชื่อบุคคล: อ.ดร. กมล พิมา\nสังกัดหน่วยงาน: สำนักวิชาวิทยาศาสตร์\nอีเมล: advisor@example.ac.th');
});

test('trims labels detail values without flattening their internal lines',()=>{
 assert.equal(labeledDetails([['ที่อยู่','  บรรทัดหนึ่ง\nบรรทัดสอง  ']]),'ที่อยู่: บรรทัดหนึ่ง\nบรรทัดสอง');
});
