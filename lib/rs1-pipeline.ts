import type {DocContent,ImageEvidence,TableKind} from './docx';
import type {Extraction,Field} from './extract';
import {extractRs1} from './extract.ts';
import {segmentRs1Sections,type Rs1RoutedSection,type Rs1SectionMap,type Rs1RoutedBlock} from './rs1-sections.ts';

export type Confidence='high'|'medium'|'low';
export type CanonicalStatus='found'|'missing'|'review';
export type FieldEvidence<T>={value:T|null;status:CanonicalStatus;confidence:Confidence;sourceSection:string;sourceBlocks:number[];extractionMethod:'section-text'|'section-table'|'legacy-rule'|'validation';warnings:string[]};
export type ScheduleActivity={activity:string;period:string|null;months:string[];uncertainMonths:string[];responsible:string|null;sourceRow:number};
export type BudgetLine={category:string;description:string;quantity:string;amount:number|null;sourceRow:number};
export type ValidationIssue={code:string;severity:'warning'|'error';field:string;message:string};
export type CanonicalRs1={project:{titleTH:FieldEvidence<string>;titleEN:FieldEvidence<string>;strategy:FieldEvidence<string>};sections:Record<string,FieldEvidence<string>|FieldEvidence<ScheduleActivity[]>|FieldEvidence<BudgetLine[]>>;biographies:Extraction['biographies'];reviewers:Extraction['experts'];images:ImageEvidence[];validation:ValidationIssue[];warnings:string[]};
export type Rs1PipelineResult=Extraction&{sectionMap:Rs1SectionMap;canonical:CanonicalRs1};

const blockIndexes=(section:Rs1RoutedSection)=>section.blocks.map(block=>block.sourceIndex);
function textEvidence(section:Rs1RoutedSection|undefined,key:string):FieldEvidence<string>{
 if(!section)return {value:null,status:'missing',confidence:'low',sourceSection:key,sourceBlocks:[],extractionMethod:'section-text',warnings:['ไม่พบหัวข้อมาตรฐานในเอกสาร']};
 const value=section.text.trim();
 return {value:value||null,status:value?'found':'missing',confidence:section.matchedBy==='number-and-label'?'high':'medium',sourceSection:key,sourceBlocks:blockIndexes(section),extractionMethod:'section-text',warnings:value?[]:['พบหัวข้อแต่ไม่มีข้อมูล']};
}
function parseAmount(value:string):number|null{
 const match=value.replace(/,/g,'').match(/(?:^|\s)(\d+(?:\.\d{1,2})?)\s*(?:บาท|THB)?\s*$/iu);
 return match?Number(match[1]):null;
}
function cleanActivity(value:string):string{return value.replace(/^\s*\d+[.)]?\s*/u,'').replace(/^[.\u2026_\-\s]+|[.\u2026_\-\s]+$/gu,'').trim();}
function isMark(value:string):boolean{return /[✓✔☑☒xX\/●■]/u.test(value);}
type RoutedTable=Extract<Rs1RoutedBlock,{type:'table'}>;

export function extractSchedule(section:Rs1RoutedSection|undefined):FieldEvidence<ScheduleActivity[]>{
 const activities:ScheduleActivity[]=[];
 const tableBlocks=section?.blocks.filter((block):block is RoutedTable=>block.type==='table')??[];
 for(const block of tableBlocks){
  const rows=block.rows;if(rows.length<2)continue;
  const maxColumns=Math.max(...rows.map(row=>row.length));
  if(maxColumns<=2){
   rows.slice(1).forEach((row,index)=>{
    const activity=cleanActivity(row[0]??'');const period=(row[1]??'').trim();
    if(!activity)return;
    activities.push({activity,period:period||null,months:period?[period]:[],uncertainMonths:[],responsible:null,sourceRow:index+1});
   });
   continue;
  }
  const monthHeaderIndex=rows.slice(0,3).findIndex(row=>row.slice(1).filter(cell=>/^\s*(?:\d{1,2}|ม\.?ค\.?|ก\.?พ\.?|มี\.?ค\.?|เม\.?ย\.?|พ\.?ค\.?|มิ\.?ย\.?|ก\.?ค\.?|ส\.?ค\.?|ก\.?ย\.?|ต\.?ค\.?|พ\.?ย\.?|ธ\.?ค\.?)\s*$/iu.test(cell)).length>=2);
  const headerIndex=monthHeaderIndex>=0?monthHeaderIndex:0;const header=rows[headerIndex];
  const hasResponsible=/(?:ผู้รับผิดชอบ|responsible)/iu.test(rows.slice(0,headerIndex+1).flat().join(' '));
  rows.slice(headerIndex+1).forEach((row,offset)=>{
   const rowIndex=headerIndex+1+offset;const activity=cleanActivity(row[0]??'');if(!activity)return;
   const responsible=hasResponsible?(row[row.length-1]??'').trim():'';
   const structured=block.table?.structuredRows[rowIndex]?.cells;
   const monthCells=row.slice(1,hasResponsible?-1:undefined);
   const monthEvidence=monthCells.map((cell,index)=>({cell,index:index+1,marks:structured?.[index+1]?.checkboxes??[]}));
   const months=monthEvidence.filter(({cell,marks})=>isMark(cell)||marks.some(mark=>mark.state==='checked')).map(({index})=>(header[index]??String(index)).trim()).filter(Boolean);
   const uncertainMonths=monthEvidence.filter(({marks})=>marks.some(mark=>mark.state==='unknown')).map(({index})=>(header[index]??String(index)).trim()).filter(Boolean);
   activities.push({activity,period:null,months,uncertainMonths,responsible:responsible||null,sourceRow:rowIndex});
  });
 }
 const timed=activities.filter(item=>item.period||item.months.length);
 const hasUncertain=activities.some(item=>item.uncertainMonths.length);
 const status:CanonicalStatus=!section?'missing':!activities.length?'review':timed.length===activities.length&&!hasUncertain?'found':'review';
 const warnings=status==='found'?[]:[!section?'ไม่พบหัวข้อแผนงาน':!activities.length?'พบตารางแผนงานแต่ยังไม่มีข้อมูลกิจกรรม':hasUncertain?'พบสัญลักษณ์ในช่องเดือนที่ยังไม่ทราบความหมายแน่ชัด':'กิจกรรมบางรายการไม่มีช่วงเวลาหรือเดือนที่เลือก'];
 return {value:activities.length?activities:null,status,confidence:status==='found'?'high':activities.length?'medium':'low',sourceSection:'A:12',sourceBlocks:section?blockIndexes(section):[],extractionMethod:'section-table',warnings};
}

export function extractBudget(section:Rs1RoutedSection|undefined):FieldEvidence<BudgetLine[]>{
 const rows=section?.tables.flatMap(table=>table)??[];const lines:BudgetLine[]=[];let category='';
 rows.forEach((row,index)=>{
  const cells=row.map(cell=>cell.trim());const amount=[...cells].reverse().map(parseAmount).find(value=>value!==null)??null;const nonEmpty=cells.filter(Boolean);
  if(cells.length===1||(amount===null&&nonEmpty.length===1)){category=nonEmpty[0]??category;return;}
  const description=(cells.length<=2?cells[0]:cells[1]||cells[0]||'').trim();
  if(!description||/^(?:รายการ|หมวด|description|category)$/iu.test(description)||/(?:รายการค่าใช้จ่าย|expense list|รวมทั้งสิ้น|^รวมงบประมาณ|total)/iu.test(description)||/^[.\u2026_\-\s]+$/u.test(description))return;
  const quantity=cells.length<=2?'':cells.slice(2,-1).filter(Boolean).join(' × ');
  if(amount===null&&!quantity)return;
  lines.push({category,description,quantity,amount,sourceRow:index});
 });
 const missingAmounts=lines.filter(line=>line.amount===null);
 const status:CanonicalStatus=!lines.length?(section?'review':'missing'):missingAmounts.length?'review':'found';
 const warnings=!lines.length?[section?'พบหัวข้องบประมาณแต่ยังอ่านรายการตารางไม่ได้':'ไม่พบหัวข้องบประมาณ']:missingAmounts.length?[`รายการงบประมาณ ${missingAmounts.length} รายการยังไม่มีจำนวนเงิน`]:[];
 return {value:lines.length?lines:null,status,confidence:status==='found'?'medium':'low',sourceSection:'A:17',sourceBlocks:section?blockIndexes(section):[],extractionMethod:'section-table',warnings};
}

function fallbackTableSection(doc:DocContent,kind:TableKind,key:string):Rs1RoutedSection|undefined{
 const routed:RoutedTable[]=doc.blocks.flatMap((block,index)=>block.type==='table'&&block.table?.classification.kind===kind?[{type:'table' as const,sourceIndex:index,rows:block.rows,table:block.table}]:[]);
 if(!routed.length)return undefined;
 return {key,part:'A',heading:`ตารางที่จำแนกเป็น ${kind}`,sourceIndex:routed[0].sourceIndex,paragraphs:[],tables:routed.map(block=>block.rows),blocks:routed,text:routed.map(block=>block.rows.map(row=>row.join('\t')).join('\n')).join('\n'),matchedBy:'label'};
}
function fromLegacy(field:Field,key:string):FieldEvidence<string>{return {value:field.value,status:field.status,confidence:field.status==='found'?'medium':'low',sourceSection:key,sourceBlocks:[],extractionMethod:'legacy-rule',warnings:field.warning?[field.warning]:[]};}
function validate(extraction:Extraction,budget:FieldEvidence<BudgetLine[]>):ValidationIssue[]{
 const issues:ValidationIssue[]=[];
 for(const [key,field] of Object.entries(extraction.fields))if(field.status==='review')issues.push({code:'FIELD_REVIEW',severity:'warning',field:key,message:field.warning??'ต้องตรวจสอบข้อมูลกับเอกสารต้นฉบับ'});
 const emailPattern=/^[^\s@]+@[^\s@]+\.[^\s@]+$/;
 [extraction.principalDetails,...extraction.coResearchers].forEach((person,index)=>{if(person.email&&!emailPattern.test(person.email))issues.push({code:'INVALID_EMAIL',severity:'warning',field:`researchers.${index}.email`,message:'รูปแบบอีเมลไม่ถูกต้อง'});});
 const start=extraction.fields.durationStart.value,end=extraction.fields.durationEnd.value;
 if(start&&end&&!Number.isNaN(Date.parse(start))&&!Number.isNaN(Date.parse(end))&&Date.parse(start)>Date.parse(end))issues.push({code:'INVALID_DATE_RANGE',severity:'error',field:'project.duration',message:'วันที่เริ่มต้นอยู่หลังวันที่สิ้นสุด'});
 const total=extraction.fields.totalBudget.value?Number(extraction.fields.totalBudget.value.replace(/,/g,'')):null;const sum=budget.value?.reduce((value,item)=>value+(item.amount??0),0)??null;
 if(total!==null&&sum!==null&&Number.isFinite(total)&&Math.abs(total-sum)>0.01)issues.push({code:'BUDGET_TOTAL_MISMATCH',severity:'warning',field:'A:17',message:`ยอดรวม ${total} ไม่ตรงกับผลรวมรายการ ${sum}`});
 return issues;
}
export function runRs1Pipeline(doc:DocContent):Rs1PipelineResult{
 const extraction=extractRs1(doc);const sectionMap=segmentRs1Sections(doc);const sections:CanonicalRs1['sections']={};
 for(let number=1;number<=19;number++){const key=`A:${number}`;sections[key]=textEvidence(sectionMap.sections[key],key);}
 sections['A:12']=extractSchedule(sectionMap.sections['A:12']??fallbackTableSection(doc,'schedule','A:12'));
 sections['A:17']=extractBudget(sectionMap.sections['A:17']??fallbackTableSection(doc,'budget','A:17'));
 const project={titleTH:fromLegacy(extraction.fields.projectTitleTH,'intro:title'),titleEN:fromLegacy(extraction.fields.projectTitleEN,'intro:title'),strategy:fromLegacy(extraction.fields.strategy,'intro:strategy')};
 const validation=validate(extraction,sections['A:17'] as FieldEvidence<BudgetLine[]>);const warnings=[...new Set([...extraction.warnings,...sectionMap.warnings,...validation.map(issue=>issue.message)])];
 const canonical:CanonicalRs1={project,sections,biographies:extraction.biographies,reviewers:extraction.experts,images:doc.sourceDocument.images??[],validation,warnings};
 return {...extraction,warnings,sectionMap,canonical};
}
