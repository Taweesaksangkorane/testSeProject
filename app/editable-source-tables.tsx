'use client';

import {useState} from 'react';
import type {SourceTable,TableKind} from '../lib/docx';
import {addTableColumn,addTableRow,createEditableTables,deleteTableColumn,deleteTableRow,editTableCell,resetEditableTable,type EditableSourceTable} from '../lib/editable-tables';

const kindLabel:Record<TableKind,string>={schedule:'แผนการดำเนินงาน',budget:'งบประมาณ',biography:'ประวัติผู้วิจัย',unknown:'ยังไม่ทราบประเภท'};

export function EditableSourceTables({tables,onApply,showSourceEvidence=true}:{tables:SourceTable[];onApply:(kind:TableKind,rows:string[][])=>void;showSourceEvidence?:boolean}){
 const [items,setItems]=useState(()=>createEditableTables(tables));
 function update(index:number,next:EditableSourceTable){setItems(current=>current.map((item,itemIndex)=>itemIndex===index?next:item));}
 return <section className="panel source-tables-panel">
  <h2>ตารางที่อ่านจากเอกสารต้นฉบับ</h2>
  <p className="hint">ต้นฉบับด้านบนเก็บเป็นหลักฐานและแก้ไม่ได้ ส่วนสำเนาด้านล่างแก้ไขได้ หากแก้แล้วให้กด “นำตารางนี้ไปใช้” เพื่อสกัดข้อมูลตารางใหม่</p>
  {items.map((item,index)=><article className="source-table-card" key={item.id}>
   <div className="source-table-heading"><div><h3>ตารางที่ {index+1} · {kindLabel[item.kind]}</h3><span className={`status-pill ${item.confidence}`}>{item.kind==='unknown'?'review':item.confidence}</span>{item.changed&&<span className="status-pill changed">แก้ไขแล้ว</span>}</div><small>{item.reason}</small></div>
   {showSourceEvidence&&<details><summary>ดูตารางต้นฉบับแบบอ่านอย่างเดียว</summary><div className="source-table-scroll"><table className="source-table-readonly"><tbody>{item.source.structuredRows.map((row,rowIndex)=><tr key={rowIndex}>{row.cells.map((cell,cellIndex)=><td key={cellIndex} colSpan={cell.columnSpan}>{cell.text||<span className="empty-cell">ว่าง</span>}{cell.checkboxes.length>0&&<small className="cell-evidence">checkbox: {cell.checkboxes.map(mark=>mark.state).join(', ')}</small>}</td>)}</tr>)}</tbody></table></div></details>}
   <div className="working-table-title"><strong>สำเนาสำหรับแก้ไข</strong><span>แก้เฉพาะสำเนา ต้นฉบับยังคงเดิม</span></div>
   <div className="source-table-scroll"><table className="working-source-table"><tbody>{item.workingRows.map((row,rowIndex)=><tr key={rowIndex}>{row.map((cell,columnIndex)=><td key={columnIndex}><textarea aria-label={`ตาราง ${index+1} แถว ${rowIndex+1} คอลัมน์ ${columnIndex+1}`} rows={2} value={cell} onChange={event=>update(index,editTableCell(item,rowIndex,columnIndex,event.target.value))}/>{rowIndex===0&&item.workingRows[0].length>1&&<button className="column-delete" aria-label={`ลบคอลัมน์ ${columnIndex+1}`} onClick={()=>update(index,deleteTableColumn(item,columnIndex))}>ลบคอลัมน์</button>}</td>)}<td className="row-action"><button className="delete-button" onClick={()=>update(index,deleteTableRow(item,rowIndex))}>ลบแถว</button></td></tr>)}</tbody></table></div>
   <div className="source-table-actions"><button className="secondary" onClick={()=>update(index,addTableRow(item))}>+ เพิ่มแถว</button><button className="secondary" onClick={()=>update(index,addTableColumn(item))}>+ เพิ่มคอลัมน์</button><button className="secondary" disabled={!item.changed} onClick={()=>update(index,resetEditableTable(item))}>คืนค่าต้นฉบับ</button><button onClick={()=>onApply(item.kind,item.workingRows)}>นำตารางนี้ไปใช้</button></div>
  </article>)}
 </section>;
}
