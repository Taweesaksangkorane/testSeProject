import {readFile} from 'node:fs/promises';
import path from 'node:path';
import JSZip from 'jszip';
import {NextResponse} from 'next/server';

export const runtime='nodejs';

type Row={activity?:string;period?:string;category?:string;description?:string;breakdown?:string;amount?:string};
type Person={name?:string;affiliation?:string;phone?:string;email?:string;responsibility?:string;share?:string};
type Signature={role?:string;dataUrl?:string;fileName?:string;signedDate?:string};
type FormData={
 titleTH?:string;titleEN?:string;strategy?:string;principal?:Person;coResearchers?:Person[];advisorDetails?:Record<string,string>;
 collaborationDetails?:Record<string,string>;researchType?:string;keywordsTH?:string;keywordsEN?:string;significance?:string;objectives?:string;
 literature?:string;references?:string;methodology?:string;scope?:string;schedule?:Row[];start?:string;end?:string;progress?:string;outcomes?:string;
 publication?:string;publicationOther?:string;integration?:string;integrationDetails?:string;transfer?:string;budgetRows?:Row[];researchStandard?:string[];
 otherNotes?:string;principalBiography?:Record<string,string>;experts?:Record<string,string>[];signatures?:Signature[];
};

const escapeXml=(value:string)=>value.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&apos;');
const text=(value:unknown)=>typeof value==='string'?value.trim():'';
const joined=(record?:Record<string,string>)=>record?Object.values(record).map(text).filter(Boolean).join(', '):'';
const enteredText=(value:string)=>value.trim().replace(/\r\n?/g,'\n').replace(/\n[ \t]*\n+/g,'\u0000').replace(/\n/g,' ').replace(/[ \t]{2,}/g,' ').replace(/\u0000/g,'\n').replace(/[ \t]+(?=(?:\d{1,2}[.)]|[-•▪])\s+)/g,'\n');
const referencesText=(value:string)=>enteredText(value).replace(/(?<=\.)\s+(?=[A-Z][A-Za-zÀ-ž]{2,}[A-Za-zÀ-ž&.,'’ -]{0,98}\(\d{4}\))/g,'\u2028');
const textXml=(value:string)=>escapeXml(enteredText(value)).replace(/[\n\u2028]/g,'</w:t><w:br/><w:t xml:space="preserve">');
function leftAlignedParagraph(paragraph:string){
 const withoutAlignment=paragraph.replace(/<w:jc\b[^>]*\/?\s*>/g,'');
 if(/<w:pPr(?:\s[^>]*)?>[\s\S]*?<\/w:pPr>/.test(withoutAlignment))return withoutAlignment.replace(/<\/w:pPr>/,'<w:jc w:val="left"/></w:pPr>');
 return withoutAlignment.replace(/<w:p(?:\s[^>]*)?>/,match=>`${match}<w:pPr><w:jc w:val="left"/></w:pPr>`);
}
function blackRun(run:string){
 const withoutInheritedStyle=run.replace(/<w:color\b[^>]*\/?\s*>|<w:sz(?:Cs)?\b[^>]*\/?\s*>|<w:rFonts\b[^>]*\/?\s*>|<w:spacing\b[^>]*\/?\s*>/g,'');
 const enteredStyle='<w:rFonts w:ascii="TH Sarabun New" w:eastAsia="TH Sarabun New" w:hAnsi="TH Sarabun New" w:cs="TH Sarabun New"/><w:color w:val="000000"/><w:sz w:val="28"/><w:szCs w:val="28"/>';
 if(/<w:rPr(?:\s[^>]*)?>/.test(withoutInheritedStyle))return withoutInheritedStyle.replace(/<w:rPr(?:\s[^>]*)?>/,match=>`${match}${enteredStyle}`);
 return withoutInheritedStyle.replace(/<w:r(?:\s[^>]*)?>/,match=>`${match}<w:rPr>${enteredStyle}</w:rPr>`);
}
function replaceParagraph(paragraph:string,value:string){
 const safe=textXml(value);
 if(/<w:r(?:\s[^>]*)?>[\s\S]*?<\/w:r>/.test(paragraph)){
  let first=true;
  return leftAlignedParagraph(paragraph.replace(/<w:r(?:\s[^>]*)?>[\s\S]*?<\/w:r>/g,run=>{if(!/<w:t(?:\s[^>]*)?>[\s\S]*?<\/w:t>/.test(run))return run;if(!first)return run.replace(/<w:t(?:\s[^>]*)?>[\s\S]*?<\/w:t>/g,'<w:t></w:t>');first=false;return blackRun(run.replace(/<w:t(?:\s[^>]*)?>[\s\S]*?<\/w:t>/g,`<w:t xml:space="preserve">${safe}</w:t>`))}));
 }
 const end=paragraph.lastIndexOf('</w:p>');
 return leftAlignedParagraph(`${paragraph.slice(0,end)}<w:r><w:rPr><w:rFonts w:ascii="TH Sarabun New" w:eastAsia="TH Sarabun New" w:hAnsi="TH Sarabun New" w:cs="TH Sarabun New"/><w:color w:val="000000"/><w:sz w:val="28"/><w:szCs w:val="28"/></w:rPr><w:t xml:space="preserve">${safe}</w:t></w:r>${paragraph.slice(end)}`);
}
function appendParagraph(paragraph:string,value:string,separate=false){
 if(!value)return paragraph;
 const safe=textXml(value);
 if(separate)return `${paragraph}<w:p><w:pPr><w:spacing w:after="0" w:line="240" w:lineRule="auto"/><w:jc w:val="left"/></w:pPr><w:r><w:rPr><w:rFonts w:ascii="TH Sarabun New" w:eastAsia="TH Sarabun New" w:hAnsi="TH Sarabun New" w:cs="TH Sarabun New"/><w:color w:val="000000"/><w:sz w:val="28"/><w:szCs w:val="28"/></w:rPr><w:t xml:space="preserve">${safe}</w:t></w:r></w:p>`;
 const end=paragraph.lastIndexOf('</w:p>');return leftAlignedParagraph(`${paragraph.slice(0,end)}<w:r><w:rPr><w:rFonts w:ascii="TH Sarabun New" w:eastAsia="TH Sarabun New" w:hAnsi="TH Sarabun New" w:cs="TH Sarabun New"/><w:color w:val="000000"/><w:sz w:val="28"/><w:szCs w:val="28"/></w:rPr><w:t xml:space="preserve"> ${safe}</w:t></w:r>${paragraph.slice(end)}`);
}
function fillParagraphs(xml:string,values:Map<number,string>,appends:Map<number,string>,checks:Map<number,boolean>){
 let index=0;
 return xml.replace(/<w:p(?:\s[^>]*)?>[\s\S]*?<\/w:p>/g,paragraph=>{
  let result=paragraph;
  if(values.has(index))result=replaceParagraph(result,values.get(index)??'');
  if(appends.has(index))result=appendParagraph(result,appends.get(index)??'',[29,31,35,45,47].includes(index));
  if(checks.has(index))result=result.replace(/(<w:sym\b[^>]*w:char=")[A-Fa-f0-9]+("[^>]*\/?>)/g,`$1${checks.get(index)?'F0FE':'F0A8'}$2`);
  index++;
  return result;
 });
}
// Expand the original one-person RS-1 table without changing its other fixed positions.
// Add well-labelled paragraphs after the first co-researcher block.
function insertAdditionalCoResearchers(xml:string,people:Person[]){
 if(people.length<=1)return xml;
 const extra=people.slice(1).map(person=>[
  ['ชื่อ-สกุล',person.name],['สังกัดหน่วยงาน',person.affiliation],
  ['เบอร์โทรศัพท์ที่ติดต่อได้',person.phone],['อีเมล',person.email],
  ['ความรับผิดชอบต่อโครงการที่เสนอ',person.responsibility],
  ['คิดเป็นสัดส่วนการวิจัยร้อยละ',person.share]
 ].map(([label,value])=>`<w:p><w:r><w:t xml:space="preserve">${escapeXml(`${label}: ${text(value)}`)}</w:t></w:r></w:p>`).join('')).join('');
 let index=0;
 return xml.replace(/<w:p(?:\s[^>]*)?>[\s\S]*?<\/w:p>/g,p=>{
  const current=index++;
  return current===26?p+extra:p;
 });
}
function removeUnusedBudgetRows(xml:string){
 return xml.replace(/<w:tr(?:\s[^>]*)?>[\s\S]*?<\/w:tr>/g,row=>row.includes('__REMOVE_BUDGET_ROW__')?'':row);
}
function removeEmptyParagraphsBetween(xml:string,startText:string,endText:string){
 const paragraphs=[...xml.matchAll(/<w:p(?:\s[^>]*)?>[\s\S]*?<\/w:p>/g)];
 const paragraphText=(paragraph:string)=>[...paragraph.matchAll(/<w:t(?:\s[^>]*)?>([\s\S]*?)<\/w:t>/g)].map(match=>match[1]).join('').trim();
 const start=paragraphs.findIndex(match=>paragraphText(match[0]).includes(startText));
 const end=paragraphs.findIndex((match,index)=>index>start&&paragraphText(match[0]).includes(endText));
 if(start<0||end<0)return xml;
 const empty=new Set(paragraphs.slice(start+1,end).filter(match=>!paragraphText(match[0])).map(match=>match[0]));
 return xml.replace(/<w:p(?:\s[^>]*)?>[\s\S]*?<\/w:p>/g,paragraph=>empty.has(paragraph)?'':paragraph);
}
function addParagraphProperty(paragraph:string,property:string){
 if(paragraph.includes(property))return paragraph;
 if(/<w:pPr(?:\s[^>]*)?>/.test(paragraph))return paragraph.replace(/<w:pPr(?:\s[^>]*)?>/,match=>`${match}${property}`);
 return paragraph.replace(/<w:p(?:\s[^>]*)?>/,match=>`${match}<w:pPr>${property}</w:pPr>`);
}
function improvePageFlow(xml:string){
 let improved=removeEmptyParagraphsBetween(xml,'หมายเหตุ. ต้องเซ็นให้ครบ','ส่วน ข : ประวัติคณะผู้วิจัย');
 improved=removeEmptyParagraphsBetween(improved,'งานวิจัยที่กำลังทำ','ส่วน ค : เสนอชื่อผู้ทรงคุณวุฒิ');
 improved=improved.replace(/<w:p(?:\s[^>]*)?>[\s\S]*?<\/w:p>/g,paragraph=>{
  const plain=[...paragraph.matchAll(/<w:t(?:\s[^>]*)?>([\s\S]*?)<\/w:t>/g)].map(match=>match[1]).join('');
  const sectionHeading=plain.includes('ส่วน ข : ประวัติคณะผู้วิจัย')||plain.includes('ส่วน ค : เสนอชื่อผู้ทรงคุณวุฒิ');
  const expertField=/^(?:ชื่อ- สกุล:|ตำแหน่งทางวิชาการ:|สังกัด:)/.test(plain.trim());
  return sectionHeading||expertField?addParagraphProperty(paragraph,'<w:keepNext/>'):paragraph;
 });
 return improved.replace(/<w:tr(?:\s[^>]*)?>[\s\S]*?<\/w:tr>/g,row=>{
  let result=/<w:trPr(?:\s[^>]*)?>/.test(row)?row.replace(/<w:trPr(?:\s[^>]*)?>/,match=>`${match}<w:cantSplit/>`):row.replace(/<w:tr(?:\s[^>]*)?>/,match=>`${match}<w:trPr><w:cantSplit/></w:trPr>`);
  if(/หมวด(?:ค่าตอบแทน|ค่าใช้สอย|วัสดุ|สาธารณูปโภค)/.test(result))result=result.replace(/<w:p(?:\s[^>]*)?>[\s\S]*?<\/w:p>/g,paragraph=>addParagraphProperty(paragraph,'<w:keepNext/>'));
  return result;
 });
}
function normalizeBodyTypography(xml:string){
 return xml.replace(/<w:sz w:val="32"\s*\/>/g,'<w:sz w:val="28"/>').replace(/<w:szCs w:val="32"\s*\/>/g,'<w:szCs w:val="28"/>');
}
function stripRedGuidance(xml:string){
 return xml.replace(/<w:p(?:\s[^>]*)?>[\s\S]*?<\/w:p>/g,paragraph=>{
  return paragraph.replace(/<w:r(?:\s[^>]*)?>[\s\S]*?<\/w:r>/g,run=>{
   const color=run.match(/<w:color\b[^>]*w:val="([^"]+)"/i)?.[1]?.toUpperCase();
   if(color==='FF0000')return run.replace(/<w:t(?:\s[^>]*)?>[\s\S]*?<\/w:t>/g,'<w:t></w:t>');
   return run;
  });
 });
}
function fields(form:FormData){
 const p=form.principal??{},co=form.coResearchers?.[0]??{},schedule=form.schedule??[],bio=form.principalBiography??{},experts=form.experts??[],signatures=form.signatures??[];
 const values=new Map<number,string>([
  [3,`(ภาษาไทย) ${text(form.titleTH)}`],[4,`(ภาษาอังกฤษ) ${text(form.titleEN)}`],
  [33,text(form.researchType)],[37,text(form.significance)],[39,text(form.objectives)],[41,text(form.literature)],[43,referencesText(text(form.references))],
  [56,`1. ${text(schedule[0]?.activity)}`],[57,text(schedule[0]?.period)],[58,`2. ${text(schedule[1]?.activity)}`],[59,text(schedule[1]?.period)],[60,`3. ${text(schedule[2]?.activity)}`],[61,text(schedule[2]?.period)],[62,`4. ${text(schedule[3]?.activity)}`],[63,text(schedule[3]?.period)],
  [72,[text(form.outcomes),text(form.publicationOther)].filter(Boolean).join('\n')],[78,[text(form.integration),text(form.integrationDetails)].filter(Boolean).join(': ')],
  [162,text(form.otherNotes)],[166,`(${text(form.advisorDetails?.name)})`],[172,`(${text(p.name)})`],[178,`(${text(co.name)})`],
 ]);
 const appends=new Map<number,string>([[14,text(p.name)],[15,text(p.affiliation)],[16,text(p.phone)],[17,text(p.email)],[18,text(p.responsibility)],[19,text(p.share)],[21,text(co.name)],[22,text(co.affiliation)],[23,text(co.phone)],[24,text(co.email)],[25,text(co.responsibility)],[26,text(co.share)],[29,joined(form.advisorDetails)],[31,joined(form.collaborationDetails)],[35,`ภาษาไทย: ${text(form.keywordsTH)}   ภาษาอังกฤษ: ${text(form.keywordsEN)}`],[45,text(form.methodology)],[47,text(form.scope)],[53,`${text(form.start)} ถึง ${text(form.end)}`],[65,text(form.progress)],[168,text(signatures[0]?.signedDate)],[174,text(signatures[1]?.signedDate)],[180,text(signatures[2]?.signedDate)],[188,`${text(bio.thaiName)} / ${text(bio.englishName)}`],[189,text(bio.academicPosition)],[190,text(bio.nationalId)],[191,text(bio.education)],[192,text(bio.employment)],[193,text(bio.expertise)],[194,text(bio.publications)],[195,text(bio.presentations)],[196,text(bio.intellectualProperty)],[197,text(bio.researchManagementExperience)],[198,text(bio.completedResearch)],[199,text(bio.ongoingResearch)]]);
 const expertStarts=[223,228,233];experts.slice(0,3).forEach((expert,i)=>{const n=expertStarts[i];appends.set(n,text(expert.name));appends.set(n+1,text(expert.academicPosition));appends.set(n+2,text(expert.affiliation));appends.set(n+3,text(expert.email))});
 const budgetGroups=[{category:'ค่าตอบแทน',header:88,slots:[90,92,94,96]},{category:'ค่าใช้สอย',header:98,slots:[100,102,104,106,108,110,112,114,116,118,120,122,124,126,128,130]},{category:'วัสดุ',header:133,slots:[135,137,139,141]},{category:'สาธารณูปโภค',header:143,slots:[145,147,149]}];
 const entered=(form.budgetRows??[]).filter(row=>text(row.description)||text(row.breakdown)||text(row.amount));
 for(const group of budgetGroups){const rows=entered.filter(row=>text(row.category)===group.category);if(!rows.length)values.set(group.header,'__REMOVE_BUDGET_ROW__');group.slots.forEach((slot,i)=>{const row=rows[i];if(!row){values.set(slot,'__REMOVE_BUDGET_ROW__');return;}values.set(slot,[text(row.description),text(row.breakdown)].filter(Boolean).join(' — '));values.set(slot+1,text(row.amount))})}
 const total=entered.reduce((sum,row)=>sum+(Number(text(row.amount).replace(/,/g,''))||0),0);values.set(152,total?total.toLocaleString('th-TH'):'0' );
 const publication=text(form.publication),standards=new Set(form.researchStandard??[]),strategy=text(form.strategy);
 const strategies=['สอดคล้องกับคุณวุฒิ หรือสาขาวิชา หรือภาระงาน','การพัฒนากำลังคนและสถาบันความรู้','การวิจัยและสร้างนวัตกรรมเพื่อตอบโจทย์ท้าทายของสังคม','การวิจัยและสร้างนวัตกรรมเพื่อเพิ่มขีดความสามารถการแข่งขัน','การวิจัยและสร้างนวัตกรรมเพื่อการพัฒนาเชิงพื้นที่และลดความเหลื่อมล้ำ'];
 const strategyId=Number(strategy.match(/^(?:strategy_)?([1-5])(?:\.|$)/)?.[1]??(strategies.indexOf(strategy)+1));
 const checks=new Map<number,boolean>([[6,strategyId===1],[7,strategyId===2],[8,strategyId===3],[9,strategyId===4],[10,strategyId===5],[67,publication==='international-journal'],[68,publication==='national-journal'],[69,publication==='international-conference'],[70,publication==='intellectual-property'],[71,publication==='other'],[80,text(form.transfer).includes('ระดับภูมิภาค')],[81,text(form.transfer).includes('เฉพาะกลุ่มอาชีพ')],[82,text(form.transfer).includes('ไม่มีการนำไป')],[155,standards.has('none')],[156,standards.has('human')],[157,standards.has('animal')],[158,standards.has('plant')]]);
 return {values,appends,checks};
}

export async function POST(request:Request){
 try{
  const form=await request.json() as FormData;
  const template=await readFile(path.join(process.cwd(),'public','templates','rs1-private-template.docx'));
  const zip=await JSZip.loadAsync(template);
  const document=zip.file('word/document.xml');if(!document)throw new Error('ไม่พบโครงสร้างเอกสาร Word');
  const xml=await document.async('string');const {values,appends,checks}=fields(form);
  const filled=removeUnusedBudgetRows(insertAdditionalCoResearchers(fillParagraphs(xml,values,appends,checks),form.coResearchers??[]));
  zip.file('word/document.xml',normalizeBodyTypography(stripRedGuidance(improvePageFlow(filled))));
  const output=await zip.generateAsync({type:'uint8array',compression:'DEFLATE'});
  const body=output.buffer.slice(output.byteOffset,output.byteOffset+output.byteLength) as ArrayBuffer;
  return new NextResponse(body,{headers:{'Content-Type':'application/vnd.openxmlformats-officedocument.wordprocessingml.document','Content-Disposition':"attachment; filename*=UTF-8''RS-1-filled.docx",'Cache-Control':'no-store'}});
 }catch(error){return NextResponse.json({error:error instanceof Error?error.message:'สร้างเอกสารไม่สำเร็จ'},{status:500})}
}
