import {readFile} from 'node:fs/promises';
import path from 'node:path';
import JSZip from 'jszip';
import {NextResponse} from 'next/server';

export const runtime='nodejs';

type Row={activity?:string;period?:string;category?:string;description?:string;breakdown?:string;amount?:string};
type Person={name?:string;affiliation?:string;phone?:string;email?:string;responsibility?:string;share?:string};
type FormData={
 titleTH?:string;titleEN?:string;strategy?:string;principal?:Person;coResearchers?:Person[];advisorDetails?:Record<string,string>;
 collaborationDetails?:Record<string,string>;researchType?:string;keywordsTH?:string;keywordsEN?:string;significance?:string;objectives?:string;
 literature?:string;references?:string;methodology?:string;scope?:string;schedule?:Row[];start?:string;end?:string;progress?:string;outcomes?:string;
 publication?:string;publicationOther?:string;integration?:string;integrationDetails?:string;transfer?:string;budgetRows?:Row[];researchStandard?:string[];
 otherNotes?:string;principalBiography?:Record<string,string>;experts?:Record<string,string>[];
};

const escapeXml=(value:string)=>value.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&apos;');
const text=(value:unknown)=>typeof value==='string'?value.trim():'';
const joined=(record?:Record<string,string>)=>record?Object.values(record).map(text).filter(Boolean).join(', '):'';
function replaceParagraph(paragraph:string,value:string){
 const safe=escapeXml(value);
 if(/<w:t(?:\s[^>]*)?>[\s\S]*?<\/w:t>/.test(paragraph)){
  let first=true;
  return paragraph.replace(/<w:t(?:\s[^>]*)?>[\s\S]*?<\/w:t>/g,()=>{if(!first)return '<w:t></w:t>';first=false;return `<w:t xml:space="preserve">${safe}</w:t>`});
 }
 const end=paragraph.lastIndexOf('</w:p>');
 return `${paragraph.slice(0,end)}<w:r><w:t xml:space="preserve">${safe}</w:t></w:r>${paragraph.slice(end)}`;
}
function appendParagraph(paragraph:string,value:string){
 if(!value)return paragraph;
 const safe=escapeXml(value);
 const matches=[...paragraph.matchAll(/<w:t(?:\s[^>]*)?>([\s\S]*?)<\/w:t>/g)];
 const last=matches.at(-1);
 if(last?.index!==undefined){const start=last.index,end=start+last[0].length;const existing=last[1];return `${paragraph.slice(0,start)}<w:t xml:space="preserve">${existing} ${safe}</w:t>${paragraph.slice(end)}`;}
 const end=paragraph.lastIndexOf('</w:p>');return `${paragraph.slice(0,end)}<w:r><w:t xml:space="preserve">${safe}</w:t></w:r>${paragraph.slice(end)}`;
}
function fillParagraphs(xml:string,values:Map<number,string>,appends:Map<number,string>,checks:Map<number,boolean>){
 let index=0;
 return xml.replace(/<w:p(?:\s[^>]*)?>[\s\S]*?<\/w:p>/g,paragraph=>{
  let result=paragraph;
  if(values.has(index))result=replaceParagraph(result,values.get(index)??'');
  if(appends.has(index))result=appendParagraph(result,appends.get(index)??'');
  if(checks.has(index))result=result.replace(/(<w:sym\b[^>]*w:char=")[A-Fa-f0-9]+("[^>]*\/?>)/g,`$1${checks.get(index)?'F0FE':'F0A8'}$2`);
  index++;
  return result;
 });
}
function removeUnusedBudgetRows(xml:string){
 return xml.replace(/<w:tr(?:\s[^>]*)?>[\s\S]*?<\/w:tr>/g,row=>row.includes('__REMOVE_BUDGET_ROW__')?'':row);
}
function fields(form:FormData){
 const p=form.principal??{},co=form.coResearchers?.[0]??{},schedule=form.schedule??[],bio=form.principalBiography??{},experts=form.experts??[];
 const values=new Map<number,string>([
  [3,`(ภาษาไทย) ${text(form.titleTH)}`],[4,`(ภาษาอังกฤษ) ${text(form.titleEN)}`],
  [33,text(form.researchType)],[37,text(form.significance)],[39,text(form.objectives)],[41,text(form.literature)],[43,text(form.references)],
  [56,`1. ${text(schedule[0]?.activity)}`],[57,text(schedule[0]?.period)],[58,`2. ${text(schedule[1]?.activity)}`],[59,text(schedule[1]?.period)],[60,`3. ${text(schedule[2]?.activity)}`],[61,text(schedule[2]?.period)],[62,`4. ${text(schedule[3]?.activity)}`],[63,text(schedule[3]?.period)],
  [72,[text(form.outcomes),text(form.publicationOther)].filter(Boolean).join('\n')],[78,[text(form.integration),text(form.integrationDetails)].filter(Boolean).join(': ')],
  [162,text(form.otherNotes)],[166,`(${joined(form.advisorDetails)})`],[172,`(${text(p.name)})`],[178,`(${text(co.name)})`],
 ]);
 const appends=new Map<number,string>([[14,text(p.name)],[15,text(p.affiliation)],[16,text(p.phone)],[17,text(p.email)],[18,text(p.responsibility)],[19,text(p.share)],[21,text(co.name)],[22,text(co.affiliation)],[23,text(co.phone)],[24,text(co.email)],[25,text(co.responsibility)],[26,text(co.share)],[29,joined(form.advisorDetails)],[31,joined(form.collaborationDetails)],[35,`ภาษาไทย: ${text(form.keywordsTH)}   ภาษาอังกฤษ: ${text(form.keywordsEN)}`],[45,text(form.methodology)],[47,text(form.scope)],[53,`${text(form.start)} ถึง ${text(form.end)}`],[65,text(form.progress)],[188,`${text(bio.thaiName)} / ${text(bio.englishName)}`],[189,text(bio.academicPosition)],[190,text(bio.nationalId)],[191,text(bio.education)],[192,text(bio.employment)],[193,text(bio.expertise)],[194,text(bio.publications)],[195,text(bio.presentations)],[196,text(bio.intellectualProperty)],[197,text(bio.researchManagementExperience)],[198,text(bio.completedResearch)],[199,text(bio.ongoingResearch)]]);
 const expertStarts=[223,228,233];experts.slice(0,3).forEach((expert,i)=>{const n=expertStarts[i];appends.set(n,text(expert.name));appends.set(n+1,text(expert.academicPosition));appends.set(n+2,text(expert.affiliation));appends.set(n+3,text(expert.email))});
 const budgetGroups=[{category:'ค่าตอบแทน',header:88,slots:[90,92,94,96]},{category:'ค่าใช้สอย',header:98,slots:[100,102,104,106,108,110,112,114,116,118,120,122,124,126,128,130]},{category:'วัสดุ',header:133,slots:[135,137,139,141]},{category:'สาธารณูปโภค',header:143,slots:[145,147,149]}];
 const entered=(form.budgetRows??[]).filter(row=>text(row.description)||text(row.breakdown)||text(row.amount));
 for(const group of budgetGroups){const rows=entered.filter(row=>text(row.category)===group.category);if(!rows.length)values.set(group.header,'__REMOVE_BUDGET_ROW__');group.slots.forEach((slot,i)=>{const row=rows[i];if(!row){values.set(slot,'__REMOVE_BUDGET_ROW__');return;}values.set(slot,[text(row.description),text(row.breakdown)].filter(Boolean).join(' — '));values.set(slot+1,text(row.amount))})}
 const total=entered.reduce((sum,row)=>sum+(Number(text(row.amount).replace(/,/g,''))||0),0);values.set(152,total?total.toLocaleString('th-TH'):'0' );
 const publication=text(form.publication),standards=new Set(form.researchStandard??[]),strategy=text(form.strategy);
 const checks=new Map<number,boolean>([[6,strategy==='1'||strategy.startsWith('1.')],[7,strategy==='2'||strategy.startsWith('2.')],[8,strategy==='3'||strategy.startsWith('3.')],[9,strategy==='4'||strategy.startsWith('4.')],[10,strategy==='5'||strategy.startsWith('5.')],[67,publication==='international-journal'],[68,publication==='national-journal'],[69,publication==='international-conference'],[70,publication==='intellectual-property'],[71,publication==='other'],[80,text(form.transfer).includes('ระดับภูมิภาค')],[81,text(form.transfer).includes('เฉพาะกลุ่มอาชีพ')],[82,text(form.transfer).includes('ไม่มีการนำไป')],[155,standards.has('none')],[156,standards.has('human')],[157,standards.has('animal')],[158,standards.has('plant')]]);
 return {values,appends,checks};
}

export async function POST(request:Request){
 try{
  const form=await request.json() as FormData;
  const template=await readFile(path.join(process.cwd(),'public','templates','rs1-private-template.docx'));
  const zip=await JSZip.loadAsync(template);
  const document=zip.file('word/document.xml');if(!document)throw new Error('ไม่พบโครงสร้างเอกสาร Word');
  const xml=await document.async('string');const {values,appends,checks}=fields(form);
  zip.file('word/document.xml',removeUnusedBudgetRows(fillParagraphs(xml,values,appends,checks)));
  const output=await zip.generateAsync({type:'uint8array',compression:'DEFLATE'});
  const body=output.buffer.slice(output.byteOffset,output.byteOffset+output.byteLength) as ArrayBuffer;
  return new NextResponse(body,{headers:{'Content-Type':'application/vnd.openxmlformats-officedocument.wordprocessingml.document','Content-Disposition':"attachment; filename*=UTF-8''RS-1-filled.docx",'Cache-Control':'no-store'}});
 }catch(error){return NextResponse.json({error:error instanceof Error?error.message:'สร้างเอกสารไม่สำเร็จ'},{status:500})}
}
