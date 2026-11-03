import type {DocContent,SourceTable} from './docx';

/**
 * Route RS-1 by semantic section headers, not page/paragraph offsets.
 * Preserves the original paragraph + table order for later field-specific parsing.
 * Pictures and scanned pages require a separate OCR/vision step.
 */
export type Rs1RoutedBlock =
  | {type:'paragraph'; sourceIndex:number; text:string}
  | {type:'table'; sourceIndex:number; rows:string[][];table?:SourceTable};
export type Rs1RoutedSection = {
  key:string; part:'intro'|'A'|'B'|'C'; heading:string; sourceIndex:number;
  paragraphs:string[]; tables:string[][][]; blocks:Rs1RoutedBlock[];
  text:string; matchedBy:'number-and-label'|'label';
};
export type Rs1SectionMap = {
  sections:Record<string,Rs1RoutedSection>;
  occurrences:Record<string,Rs1RoutedSection[]>;
  order:string[];
  warnings:string[];
};
type Part='intro'|'A'|'B'|'C';
type Spec={key:string;part:Part;number:number;names:RegExp[]};
const A:[number,RegExp[]][]=[
 [1,[/^คณะผู้วิจัย/u,/^(?:the )?researchers?\b/i]],
 [2,[/^ที่ปรึกษาโครงการวิจัย/u,/^project advisor/i]],
 [3,[/^ความร่วมมือด้านการวิจัยกับหน่วยงานภายนอก/u,/^cooperation from other agenc/i,/^research collaboration/i]],
 [4,[/^ประเภทของการวิจัย/u,/^type of (?:the )?research/i]],
 [5,[/^คำสำคัญ/u,/^keywords?(?: of (?:the )?(?:project|research))?/i]],
 [6,[/^ความสำคัญ.*?(?:ที่มา|ปัญหา|กรอบแนว)/u,/^(?:the )?background of (?:the )?research/i,/^background and conceptual framework/i]],
 [7,[/^วัตถุประสงค์ของโครงการวิจัย/u,/^objectives? of (?:the )?research/i]],
 [8,[/^การทบทวนวรรณกรรม/u,/^literature review/i]],
 [9,[/^เอกสารอ้างอิง/u,/^references?\b/i]],
 [10,[/^กระบวนการและวิธีการดำเนิน/u,/^วิธีดำเนินการวิจัย/u,/^methodology\b/i]],
 [11,[/^ขอบเขตของโครงการวิจัย/u,/^scope of (?:the )?research/i]],
 [12,[/^แผนการดำเนินงานตลอดโครงการวิจัย/u,/^working plan throughout/i,/^research work plan/i]],
 [13,[/^ผลงานตามระยะเวลาการรายงานความก้าวหน้า/u,/^research progress according/i,/^research progress report/i]],
 [14,[/^ผลลัพธ์ที่คาดว่าจะได้รับ/u,/^expected outcomes? of (?:the )?research/i]],
 [15,[/^การบูรณาการงานวิจัย/u,/^integration of research/i]],
 [16,[/^ระดับการถ่ายทอดสู่สังคม/u,/^level of publishing to societ/i,/^social dissemination/i]],
 [17,[/^รายละเอียดงบประมาณการวิจัย/u,/^details regarding (?:the )?research budgets?/i,/^research budgets?\b/i]],
 [18,[/^มาตรฐานการวิจัย/u,/^research standards?\b/i]],
 [19,[/^คำชี้แจงอื่น/u,/^other clarifications?/i]]
];
const B:[number,RegExp[]][]=[
 [1,[/^ชื่อ\s*[-–]?\s*สกุล/u,/^ชื่อ(?:\s|[-–]|$)/u,/^full name/i]],
 [2,[/^ตำแหน่งทางวิชาการ/u,/^academic position/i]],
 [3,[/^รหัสประจำตัวนักวิจัยแห่งชาติ/u,/^national researcher identification/i]],
 [4,[/^ประวัติการศึกษา/u,/^educational background/i]],
 [5,[/^ประวัติการทำงาน/u,/^working experiences?/i]],
 [6,[/^สาขาวิชาการที่มีความชำนาญ/u,/^academic disciplines? with special/i]],
 [7,[/^ประวัติการเผยแพร่ผลงานวิจัย/u,/^history of publishing research/i]],
 [8,[/^ประวัติการนำเสนอผลงานวิจัย/u,/^history of research presentations?/i]],
 [9,[/^ผลงานวิจัยที่ได้รับการจดทะเบียน/u,/^research that has been registered/i]],
 [10,[/^ประสบการณ์ที่เกี่ยวข้องกับการบริหารงานวิจัย/u,/^experience related to research management/i]]
];
const specs:Spec[]=[
 {key:'intro:title',part:'intro',number:1,names:[/^ชื่อโครงการ(?:วิจัย)?/u,/^project title/i]},
 {key:'intro:strategy',part:'intro',number:2,names:[/^ระบุความสอดคล้องของโครงการวิจัย/u,/^the project corresponds to the strateg/i]},
 ...A.map(([number,names])=>({key:'A:'+number,part:'A' as Part,number,names})),
 ...B.map(([number,names])=>({key:'B:'+number,part:'B' as Part,number,names}))
];
function clean(s:string){return s.normalize('NFC').replace(/\u00a0/g,' ').replace(/[ \t]+/g,' ').trim();}
function getNumber(s:string){
 const m=s.match(/^(?:ข้อ\s*)?(\d{1,2})(?:\s*[.)．:：]\s*|\s+)(?!\d)([\s\S]*)$/u);
 return m?{n:Number(m[1]),rest:m[2].trim()}:{n:null,rest:s};
}
function detectPart(s:string):Part|null{
 if(/^(?:ส่วน\s*ก\s*[:：-]?\s*(?:สาระสำคัญ|ข้อมูล)|part\s*a\s*[:：-]?\s*project information)/iu.test(s))return 'A';
 if(/^(?:ส่วน\s*ข\s*[:：-]?\s*ประวัติ|part\s*b\s*[:：-]?\s*autobiograph)/iu.test(s))return 'B';
 if(/^(?:ส่วน\s*ค\s*[:：-]?\s*เสนอชื่อ|part\s*c\s*[:：-]?\s*list of reviewers)/iu.test(s))return 'C';
 return null;
}
function detectHeading(s:string,part:Part){
 const {n,rest}=getNumber(s);
 for(const spec of specs){
  if(spec.part!==part)continue;
  for(const alias of spec.names){
   const m=rest.match(alias);
   if(!m)continue;
   if(n===null && rest.length>150 && part!=='B')continue;
   // Labels win over section numbers: reordered or renumbered templates
   // still map to the same canonical RS-1 field.
   if(n!==null && n!==spec.number && m[0].length<10)continue;
   const trailing=rest.slice(m[0].length);
   const explicit=trailing.match(/^\s*[:：]\s*(.+)$/u);
   const suffix=explicit?.[1]?.trim()??(part==='B'&&spec.number===1&&trailing.length<100?trailing.trim():'');
   return {spec,suffix,matchedBy:n===spec.number?'number-and-label' as const:'label' as const};
  }
 }
 return null;
}
function append(section:Rs1RoutedSection,block:Rs1RoutedBlock){
 section.blocks.push(block);
 if(block.type==='paragraph')section.paragraphs.push(block.text);
 else section.tables.push(block.rows);
 section.text=section.blocks.map(b=>b.type==='paragraph'?b.text:b.rows.map(r=>r.join('\t')).join('\n')).filter(Boolean).join('\n').trim();
}
function create(key:string,part:Part,heading:string,index:number,matchedBy:Rs1RoutedSection['matchedBy']):Rs1RoutedSection{
 return {key,part,heading,sourceIndex:index,paragraphs:[],tables:[],blocks:[],text:'',matchedBy};
}
export function segmentRs1Sections(doc:Pick<DocContent,'blocks'>):Rs1SectionMap{
 const result:Rs1SectionMap={sections:{},occurrences:{},order:[],warnings:[]};
 let part:Part='intro',current:Rs1RoutedSection|null=null,hasPartMarker=false;
 doc.blocks.forEach((block,index)=>{
  if(block.type==='table'){
   if(current)append(current,{type:'table',sourceIndex:index,rows:block.rows,table:block.table});
   return;
  }
  const paragraph=clean(block.text);
  if(!paragraph)return;
  const nextPart=detectPart(paragraph);
  if(nextPart){part=nextPart;current=null;hasPartMarker=true;return;}
  let match=detectHeading(paragraph,part);
  if(!match&&part==='intro'&&!hasPartMarker){
   const fallback=detectHeading(paragraph,'A');
   if(fallback){part='A';match=fallback;}
  }
  if(match){
   const key=match.spec.key;
   if(result.sections[key]){
    result.warnings.push('หัวข้อซ้ำ: '+key);
    if(part==='B'){
     current=create(key,part,paragraph,index,match.matchedBy);
     result.occurrences[key].push(current);
     result.order.push(`${key}#${result.occurrences[key].length}`);
     if(match.suffix)append(current,{type:'paragraph',sourceIndex:index,text:match.suffix});
    }else{
     current=result.sections[key];
    }
    return;
   }
   current=create(key,part,paragraph,index,match.matchedBy);
   result.sections[key]=current;result.occurrences[key]=[current];result.order.push(key);
   if(match.suffix)append(current,{type:'paragraph',sourceIndex:index,text:match.suffix});
   return;
  }
  if(part==='C'&&!current){
   current=create('C:reviewers','C','ส่วน ค / Part C',index,'label');
   result.sections[current.key]=current;result.occurrences[current.key]=[current];result.order.push(current.key);
  }
  if(current)append(current,{type:'paragraph',sourceIndex:index,text:paragraph});
 });
 for(let i=1;i<=19;i++)if(!result.sections['A:'+i])result.warnings.push('ไม่พบส่วน ก ข้อ '+i);
 return result;
}
