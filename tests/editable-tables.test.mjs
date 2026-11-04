import assert from 'node:assert/strict';
import test from 'node:test';
import {addTableColumn,addTableRow,createEditableTables,deleteTableColumn,deleteTableRow,editTableCell,resetEditableTable} from '../lib/editable-tables.ts';

const source={rows:[['กิจกรรม','เดือน'],['เก็บข้อมูล','1']],structuredRows:[{cells:[{text:'กิจกรรม',columnSpan:1,verticalMerge:null,widthTwips:null,checkboxes:[],images:[]},{text:'เดือน',columnSpan:2,verticalMerge:null,widthTwips:null,checkboxes:[],images:[]}]},{cells:[{text:'เก็บข้อมูล',columnSpan:1,verticalMerge:null,widthTwips:null,checkboxes:[],images:[]},{text:'1',columnSpan:1,verticalMerge:null,widthTwips:null,checkboxes:[],images:[]},{text:'',columnSpan:1,verticalMerge:null,widthTwips:null,checkboxes:[],images:[]}]}],classification:{kind:'schedule',confidence:'high',reason:'test'}};

test('creates a rectangular working copy without mutating source evidence',()=>{
 const [table]=createEditableTables([source]);
 assert.deepEqual(table.workingRows,[['กิจกรรม','เดือน',''],['เก็บข้อมูล','1','']]);
 const edited=editTableCell(table,1,0,'วิเคราะห์ข้อมูล');
 assert.equal(edited.workingRows[1][0],'วิเคราะห์ข้อมูล');
 assert.equal(source.structuredRows[1].cells[0].text,'เก็บข้อมูล');
 assert.equal(resetEditableTable(edited).workingRows[1][0],'เก็บข้อมูล');
});

test('supports adding and deleting rows and columns',()=>{
 const [table]=createEditableTables([source]);
 const changed=deleteTableColumn(addTableColumn(deleteTableRow(addTableRow(table),0)),1);
 assert.equal(changed.workingRows.length,2);
 assert.equal(changed.workingRows[0].length,3);
 assert.equal(changed.changed,true);
});
