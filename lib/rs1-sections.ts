import type {DocContent,SourceTable} from './docx';

/**
 * Route RS-1 by semantic section headers, not page/paragraph offsets.
 * Preserves the original paragraph + table order for later field-specific parsing.
 * Images are retained as evidence only. This parser never infers their content.
 */
export type Rs1RoutedBlock =
  | {type:'paragraph'; sourceIndex:number; text:string;images?:DocContent['sourceDocument']['images']}
  | {type:'table'; sourceIndex:number; rows:string[][];table?:SourceTable;images?:DocContent['sourceDocument']['images']};
export type Rs1RoutedSection = {
  key:string; part:'intro'|'A'|'B'|'C'; heading:string; sourceIndex:number;
  paragraphs:string[]; tables:string[][][]; blocks:Rs1RoutedBlock[];
  text:string; matchedBy:'number-and-label'|'label'|'fuzzy-label';
};
export type Rs1SectionMap = {
  sections:Record<string,Rs1RoutedSection>;
  occurrences:Record<string,Rs1RoutedSection[]>;
  order:string[];
  warnings:string[];
};
type Part='intro'|'A'|'B'|'C';
type Spec={key:string;part:Part;number:number;names:RegExp[]};
export type HeadingDetectionOptions={aliases?:Record<string,string[]>;fuzzyThreshold?:number};
export const DEFAULT_HEADING_ALIASES:Record<string,string[]>={
 'intro:title':['ชื่อโครงการวิจัย','ชื่อโครงการ','ชื่อเรื่องโครงการวิจัย','ชื่อเรื่องงานวิจัย','research project title','project title','research title'],
 'intro:strategy':['ความสอดคล้องกับประเด็นยุทธศาสตร์','ความสอดคล้องกับยุทธศาสตร์การวิจัย','ประเด็นยุทธศาสตร์การวิจัย','research strategy alignment','strategic alignment'],
 'A:1':['คณะผู้วิจัย','ทีมนักวิจัย','รายชื่อคณะผู้วิจัย','ผู้วิจัยและผู้ร่วมโครงการ','research team','researchers','investigators'],
 'A:2':['ที่ปรึกษาโครงการวิจัย','ที่ปรึกษางานวิจัย','อาจารย์ที่ปรึกษาโครงการ','project advisor','research advisor','project consultant'],
 'A:3':['ความร่วมมือด้านการวิจัยกับหน่วยงานภายนอก','ความร่วมมือกับหน่วยงานภายนอก','หน่วยงานร่วมวิจัย','เครือข่ายความร่วมมือวิจัย','external research collaboration','research collaboration','collaborating organization'],
 'A:4':['ประเภทของการวิจัย','ประเภทงานวิจัย','รูปแบบการวิจัย','ชนิดของการวิจัย','type of research','research type','study type'],
 'A:5':['คำสำคัญ','คำสำคัญของโครงการ','คำหลัก','คำค้น','keywords','key words','research keywords'],
 'A:6':['ความสำคัญและที่มาของปัญหา','ความสำคัญที่มาของปัญหา','หลักการและเหตุผล','ที่มาและความสำคัญ','ความเป็นมาและความสำคัญของปัญหา','กรอบแนวคิดการวิจัย','background of the research','background and significance','rationale and conceptual framework'],
 'A:7':['วัตถุประสงค์ของโครงการวิจัย','วัตถุประสงค์การวิจัย','จุดมุ่งหมายของการวิจัย','เป้าหมายการวิจัย','objectives of the research','research objectives','study objectives'],
 'A:8':['การทบทวนวรรณกรรม','ทบทวนวรรณกรรม','งานวิจัยที่เกี่ยวข้อง','เอกสารและงานวิจัยที่เกี่ยวข้อง','แนวคิดทฤษฎีและงานวิจัยที่เกี่ยวข้อง','literature review','related literature','related research'],
 'A:9':['เอกสารอ้างอิง','บรรณานุกรม','รายการอ้างอิง','หนังสืออ้างอิง','references','bibliography','reference list'],
 'A:10':['กระบวนการและวิธีการดำเนินการ','กระบวนการและวิธีดำเนินโครงการวิจัย','วิธีดำเนินการวิจัย','ระเบียบวิธีวิจัย','วิธีการวิจัย','ขั้นตอนการดำเนินงานวิจัย','methodology','research methodology','research methods','study procedures'],
 'A:11':['ขอบเขตของโครงการวิจัย','ขอบเขตการวิจัย','ขอบเขตของการศึกษา','ขอบเขตงานวิจัย','scope of the research','research scope','scope of study'],
 'A:12':['แผนการดำเนินงานตลอดโครงการวิจัย','แผนการดำเนินงานวิจัย','แผนงานวิจัย','แผนปฏิบัติงาน','ตารางดำเนินงานวิจัย','research work plan','work plan','research timeline','project schedule'],
 'A:13':['ผลงานตามระยะเวลาการรายงานความก้าวหน้า','ผลผลิตตามแผนความก้าวหน้า','ผลงานเมื่อครบกึ่งหนึ่งของแผน','ผลที่คาดว่าจะได้รับระหว่างดำเนินงาน','research progress report','progress deliverables','interim outputs'],
 'A:14':['ผลลัพธ์ที่คาดว่าจะได้รับ','ผลที่คาดว่าจะได้รับ','ผลผลิตที่คาดว่าจะได้รับ','ประโยชน์ที่คาดว่าจะได้รับ','ผลสัมฤทธิ์ของโครงการ','expected outcomes','expected results','expected outputs'],
 'A:15':['การบูรณาการงานวิจัย','การบูรณาการโครงการวิจัย','การวิจัยแบบบูรณาการ','การบูรณาการข้ามศาสตร์','integration of research','research integration','interdisciplinary integration'],
 'A:16':['ระดับการถ่ายทอดสู่สังคม','การถ่ายทอดผลการวิจัยสู่สังคม','การนำผลวิจัยไปใช้ประโยชน์','การเผยแพร่และถ่ายทอดองค์ความรู้','social dissemination','knowledge transfer','research utilization','social impact'],
 'A:17':['รายละเอียดงบประมาณการวิจัย','งบประมาณการวิจัย','รายละเอียดค่าใช้จ่าย','แผนงบประมาณ','ค่าใช้จ่ายในการวิจัย','research budget','budget details','project budget','research expenses'],
 'A:18':['มาตรฐานการวิจัย','มาตรฐานและจริยธรรมการวิจัย','จริยธรรมการวิจัย','การรับรองมาตรฐานงานวิจัย','research standards','research ethics','ethical approval','research compliance'],
 'A:19':['คำชี้แจงอื่น','คำชี้แจงเพิ่มเติม','ข้อมูลเพิ่มเติม','หมายเหตุเพิ่มเติม','รายละเอียดอื่น ๆ','other clarifications','additional information','additional notes','other remarks'],
 'B:1':['ชื่อสกุล','ชื่อและนามสกุล','ชื่อผู้วิจัย','full name','researcher name'], 'B:2':['ตำแหน่งทางวิชาการ','ตำแหน่งวิชาการ','academic position','academic rank'],
 'B:3':['รหัสประจำตัวนักวิจัยแห่งชาติ','รหัสนักวิจัย','เลขประจำตัวนักวิจัย','national researcher id','researcher identification'],
 'B:4':['ประวัติการศึกษา','คุณวุฒิการศึกษา','การศึกษา','education','educational background'], 'B:5':['ประวัติการทำงาน','ประสบการณ์ทำงาน','working experience','employment history'],
 'B:6':['สาขาวิชาการที่มีความชำนาญ','ความเชี่ยวชาญ','ความชำนาญพิเศษ','field of expertise','specialization'],
 'B:7':['ประวัติการเผยแพร่ผลงานวิจัย','ผลงานตีพิมพ์','ผลงานวิชาการ','research publications','publication history'],
 'B:8':['ประวัติการนำเสนอผลงานวิจัย','ผลงานนำเสนอ','การประชุมวิชาการ','research presentations','conference presentations'],
 'B:9':['ผลงานวิจัยที่ได้รับการจดทะเบียน','ทรัพย์สินทางปัญญา','สิทธิบัตรและอนุสิทธิบัตร','intellectual property','patents'],
 'B:10':['ประสบการณ์ที่เกี่ยวข้องกับการบริหารงานวิจัย','ประสบการณ์บริหารงานวิจัย','research management experience','research administration experience'],
 'C:reviewers':['เสนอชื่อผู้ทรงคุณวุฒิ','ผู้ทรงคุณวุฒิอ่านรายงานวิจัย','รายชื่อผู้ทรงคุณวุฒิ','proposed reviewers','external reviewers']
};
const A:[number,RegExp[]][]=[
 [1,[/^คณะผู้วิจัย/u,/^(?:the )?researchers?\b/i]],
 [2,[/^ที่ปรึกษาโครงการวิจัย/u,/^project advisor/i]],
 [3,[/^ความร่วมมือด้านการวิจัยกับหน่วยงานภายนอก/u,/^cooperation from other agenc/i,/^research collaboration/i]],
 [4,[/^ประเภทของการวิจัย/u,/^type of (?:the )?research/i]],
 [5,[/^คำสำคัญ/u,/^keywords?(?: of (?:the )?(?:project|research))?/i]],
 [6,[/^(?:ความสำคัญ|ที่มา|หลักการและเหตุผล|ความเป็นมา).*?(?:ที่มา|ปัญหา|กรอบแนว|ความสำคัญ)?/u,/^(?:the )?background of (?:the )?research/i,/^background and (?:significance|conceptual framework)/i,/^rationale/i]],
 [7,[/^วัตถุประสงค์ของโครงการวิจัย/u,/^objectives? of (?:the )?research/i]],
 [8,[/^การทบทวนวรรณกรรม/u,/^literature review/i]],
 [9,[/^เอกสารอ้างอิง/u,/^references?\b/i]],
 [10,[/^กระบวนการและวิธีการดำเนิน/u,/^วิธีดำเนินการวิจัย/u,/^ระเบียบวิธีวิจัย/u,/^วิธีการวิจัย/u,/^methodology\b/i,/^research methods?/i]],
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
function fuzzyText(s:string){return clean(s).toLocaleLowerCase('en-US').replace(/[^\p{L}\p{N}]+/gu,'');}
function editDistance(a:string,b:string){
 const previous=Array.from({length:b.length+1},(_,i)=>i);
 for(let i=1;i<=a.length;i++){let diagonal=previous[0];previous[0]=i;for(let j=1;j<=b.length;j++){const old=previous[j];previous[j]=Math.min(previous[j]+1,previous[j-1]+1,diagonal+(a[i-1]===b[j-1]?0:1));diagonal=old;}}
 return previous[b.length];
}
function similarity(a:string,b:string){const x=fuzzyText(a),y=fuzzyText(b);return x&&y?1-editDistance(x,y)/Math.max(x.length,y.length):0;}
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
function detectHeading(s:string,part:Part,options:HeadingDetectionOptions={}){
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
 const threshold=options.fuzzyThreshold??0.84;
 if(rest.length<=120){
  const candidates=specs.filter(spec=>spec.part===part && (n===null||n===spec.number));
  let best:{spec:Spec;alias:string;score:number}|null=null;
  for(const spec of candidates)for(const alias of options.aliases?.[spec.key]??DEFAULT_HEADING_ALIASES[spec.key]??[]){
   const candidate=rest.slice(0,alias.length+Math.max(3,Math.ceil(alias.length*0.15)));
   const score=Math.max(similarity(candidate,alias),similarity(rest,alias));
   if(!best||score>best.score)best={spec,alias,score};
  }
  if(best&&best.score>=threshold)return {spec:best.spec,suffix:'',matchedBy:'fuzzy-label' as const};
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
export function segmentRs1Sections(doc:Pick<DocContent,'blocks'>,options:HeadingDetectionOptions={}):Rs1SectionMap{
 const result:Rs1SectionMap={sections:{},occurrences:{},order:[],warnings:[]};
 let part:Part='intro',current:Rs1RoutedSection|null=null,hasPartMarker=false;
 doc.blocks.forEach((block,index)=>{
  if(block.type==='table'){
   if(current)append(current,{type:'table',sourceIndex:index,rows:block.rows,table:block.table,images:block.images});
   return;
  }
  const paragraph=clean(block.text);
  if(!paragraph)return;
  const nextPart=detectPart(paragraph);
  if(nextPart){part=nextPart;current=null;hasPartMarker=true;return;}
  let match=detectHeading(paragraph,part,options);
  if(!match&&part==='intro'&&!hasPartMarker){
   const fallback=detectHeading(paragraph,'A',options);
   if(fallback){part='A';match=fallback;}
  }
  if(match){
   const key=match.spec.key;
   if(result.sections[key]){
    if(part!=='B'&&current?.key===key&&getNumber(paragraph).n===null){
     append(current,{type:'paragraph',sourceIndex:index,text:paragraph,images:block.images});
     result.warnings.push('ข้อความคล้ายหัวข้อซ้ำ เก็บเป็นเนื้อหาเพื่อตรวจสอบ: '+key);
     return;
    }
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
  if(current)append(current,{type:'paragraph',sourceIndex:index,text:paragraph,images:block.images});
 });
 for(let i=1;i<=19;i++)if(!result.sections['A:'+i])result.warnings.push('ไม่พบส่วน ก ข้อ '+i);
 return result;
}
