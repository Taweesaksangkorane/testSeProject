import type {DocContent,ImageEvidence} from './docx';
import type {Extraction,Field} from './extract';
import {extractRs1} from './extract.ts';
import {segmentRs1Sections,type Rs1RoutedSection,type Rs1SectionMap} from './rs1-sections.ts';

export type Confidence='high'|'medium'|'low';
export type CanonicalStatus='found'|'missing'|'review';
export type FieldEvidence<T>={
  value:T|null;status:CanonicalStatus;confidence:Confidence;sourceSection:string;
  sourceBlocks:number[];extractionMethod:'section-text'|'section-table'|'legacy-rule'|'validation';warnings:string[];
};
export type ScheduleActivity={activity:string;months:string[];sourceRow:number};
export type BudgetLine={category:string;description:string;quantity:string;amount:number|null;sourceRow:number};
export type ValidationIssue={code:string;severity:'warning'|'error';field:string;message:string};
export type CanonicalRs1={
  project:{titleTH:FieldEvidence<string>;titleEN:FieldEvidence<string>;strategy:FieldEvidence<string>};
  sections:Record<string,FieldEvidence<string>|FieldEvidence<ScheduleActivity[]>|FieldEvidence<BudgetLine[]>>;
  biographies:Extraction['biographies'];reviewers:Extraction['experts'];images:ImageEvidence[];
  validation:ValidationIssue[];warnings:string[];
};
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
export function extractSchedule(section:Rs1RoutedSection|undefined):FieldEvidence<ScheduleActivity[]>{
  const rows=section?.tables.flatMap(table=>table)??[];
  const activities:ScheduleActivity[]=[];
  if(rows.length){
    const header=rows[0];
    rows.slice(1).forEach((row,index)=>{
      const activity=(row[0]??'').trim();if(!activity)return;
      const months=row.slice(1).map((cell,column)=>({cell,column})).filter(({cell})=>/[✓✔☑☒xX\/●■]/u.test(cell)).map(({column})=>(header[column+1]??String(column+1)).trim());
      activities.push({activity,months,sourceRow:index+1});
    });
  }
  const status=activities.length?'found':section?'review':'missing';
  return {value:activities.length?activities:null,status,confidence:activities.length?'high':'low',sourceSection:'A:12',sourceBlocks:section?blockIndexes(section):[],extractionMethod:'section-table',warnings:activities.length?[]:[section?'พบหัวข้อแผนงานแต่ไม่พบตารางกิจกรรม':'ไม่พบหัวข้อแผนงาน']};
}
export function extractBudget(section:Rs1RoutedSection|undefined):FieldEvidence<BudgetLine[]>{
  const rows=section?.tables.flatMap(table=>table)??[];const lines:BudgetLine[]=[];let category='';
  rows.forEach((row,index)=>{
    const cells=row.map(cell=>cell.trim());const amount=[...cells].reverse().map(parseAmount).find(value=>value!==null)??null;
    if(cells.length===1||(!amount&&cells.filter(Boolean).length===1)){category=cells.find(Boolean)??category;return;}
    const description=(cells[1]??cells[0]??'').trim();if(!description||/รายการ|description|รวมทั้งสิ้น|total/i.test(description))return;
    lines.push({category,description,quantity:cells.slice(2,-1).filter(Boolean).join(' × '),amount,sourceRow:index});
  });
  const status=lines.length?'found':section?'review':'missing';
  return {value:lines.length?lines:null,status,confidence:lines.length?'medium':'low',sourceSection:'A:17',sourceBlocks:section?blockIndexes(section):[],extractionMethod:'section-table',warnings:lines.length?[]:[section?'พบหัวข้องบประมาณแต่ยังอ่านรายการตารางไม่ได้':'ไม่พบหัวข้องบประมาณ']};
}
function fromLegacy(field:Field,key:string):FieldEvidence<string>{
  return {value:field.value,status:field.status,confidence:field.status==='found'?'medium':'low',sourceSection:key,sourceBlocks:[],extractionMethod:'legacy-rule',warnings:field.warning?[field.warning]:[]};
}
function validate(extraction:Extraction,budget:FieldEvidence<BudgetLine[]>):ValidationIssue[]{
  const issues:ValidationIssue[]=[];
  for(const [key,field] of Object.entries(extraction.fields))if(field.status==='review')issues.push({code:'FIELD_REVIEW',severity:'warning',field:key,message:field.warning??'ต้องตรวจสอบข้อมูลกับเอกสารต้นฉบับ'});
  const emailPattern=/^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  [extraction.principalDetails,...extraction.coResearchers].forEach((person,index)=>{if(person.email&&!emailPattern.test(person.email))issues.push({code:'INVALID_EMAIL',severity:'warning',field:`researchers.${index}.email`,message:'รูปแบบอีเมลไม่ถูกต้อง'});});
  const start=extraction.fields.durationStart.value,end=extraction.fields.durationEnd.value;
  if(start&&end&&!Number.isNaN(Date.parse(start))&&!Number.isNaN(Date.parse(end))&&Date.parse(start)>Date.parse(end))issues.push({code:'INVALID_DATE_RANGE',severity:'error',field:'project.duration',message:'วันที่เริ่มต้นอยู่หลังวันที่สิ้นสุด'});
  const total=extraction.fields.totalBudget.value?Number(extraction.fields.totalBudget.value.replace(/,/g,'')):null;
  const sum=budget.value?.reduce((value,item)=>value+(item.amount??0),0)??null;
  if(total!==null&&sum!==null&&Number.isFinite(total)&&Math.abs(total-sum)>0.01)issues.push({code:'BUDGET_TOTAL_MISMATCH',severity:'warning',field:'A:17',message:`ยอดรวม ${total} ไม่ตรงกับผลรวมรายการ ${sum}`});
  return issues;
}
export function runRs1Pipeline(doc:DocContent):Rs1PipelineResult{
  const extraction=extractRs1(doc);const sectionMap=segmentRs1Sections(doc);
  const sections:CanonicalRs1['sections']={};
  for(let number=1;number<=19;number++){const key=`A:${number}`;sections[key]=textEvidence(sectionMap.sections[key],key);}
  sections['A:12']=extractSchedule(sectionMap.sections['A:12']);
  sections['A:17']=extractBudget(sectionMap.sections['A:17']);
  const project={titleTH:fromLegacy(extraction.fields.projectTitleTH,'intro:title'),titleEN:fromLegacy(extraction.fields.projectTitleEN,'intro:title'),strategy:fromLegacy(extraction.fields.strategy,'intro:strategy')};
  const validation=validate(extraction,sections['A:17'] as FieldEvidence<BudgetLine[]>);
  const warnings=[...new Set([...extraction.warnings,...sectionMap.warnings,...validation.map(issue=>issue.message)])];
  const canonical:CanonicalRs1={project,sections,biographies:extraction.biographies,reviewers:extraction.experts,images:doc.sourceDocument.images??[],validation,warnings};
  return {...extraction,warnings,sectionMap,canonical};
}
