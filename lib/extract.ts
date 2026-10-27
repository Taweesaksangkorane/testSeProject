import type {DocContent} from './docx';
export type Field = {value:string|null; status:'found'|'missing'|'review'; source:string|null; warning?:string};
export type Person = {name:string; affiliation:string; phone:string; email:string; responsibility:string; share:string};
export type Biography = {thaiName:string;englishName:string;academicPosition:string;nationalId:string;education:string;employment:string;expertise:string;publications:string;presentations:string;intellectualProperty:string;researchManagementExperience:string;completedResearch:string;ongoingResearch:string};
export type Expert = {name:string; academicPosition:string; affiliation:string; email:string};
export type Extraction = {fields:{
 projectTitleTH:Field;projectTitleEN:Field;principalInvestigator:Field;coResearchers:Field;strategy:Field;
 durationStart:Field;durationEnd:Field;researchType:Field;keywordsTH:Field;keywordsEN:Field;
 objectives:Field;expectedOutcomes:Field;totalBudget:Field;documentCompleteness:Field;advisor:Field;collaboration:Field;transfer:Field;schedule:Field;
 significance:Field;literature:Field;references:Field;methodology:Field;scope:Field;progress:Field;integration:Field;otherNotes:Field;
};principalDetails:Person;coResearchers:Person[];biographies:Biography[];experts:Expert[];researchStandards:string[];publicationType:string|null;checkboxStatus:'found'|'ambiguous'|'unavailable';budgetItems:{category:string;description:string;breakdown:string;amount:number|null}[];calculatedBudget:number|null;warnings:string[];thaiChecks:{replacementCharacter:boolean;zeroWidthCharacters:boolean;isolatedCombiningMarks:boolean};metadata:{paragraphCount:number;tableCount:number}};
const empty=():Field=>({value:null,status:'missing',source:null});
const clean=(s:string)=>s.replace(/\u00a0/g,' ').trim();
const withoutPlaceholder=(s:string)=>clean(s).replace(/^[.…\s:_-]+|[.…\s:_-]+$/g,'').trim();
const make=(value:string|null,source:string|null):Field=>value ? {value,status:'found',source}:{...empty(),source};
const num=(s:string):number|null=> {const m=clean(s).replace(/,/g,'').match(/^\s*(\d+(?:\.\d{1,2})?)\s*(?:บาท)?\s*$/);return m?Number(m[1]):null;};
function heading(s:string,re:RegExp){return re.test(s.replace(/^[\s\d.()]+/,'').trim());}
function isFormInstruction(s:string):boolean {
 return /^(?:ระบุชื่อบุคคล|ระบุคำสำคัญ|อธิบายวิธีการและขั้นตอน|ระบุขอบเขตการศึกษา|ระยะเวลาที่ทำการวิจัย\s*\.\.\.|ร้อยละ\s*50\s*ของแผนการดำเนินงาน|ภายใต้โครงการวิจัยมีการดำเนินงานวิจัยแบบบูรณาการ|ทุนวิจัยส่วนตัว\s*ต้องแสดงรายการค่าใช้จ่าย|\(ทุนวิจัยส่วนตัว|หมายเหตุ\.?\s*ต้องเซ็น)/.test(s.trim()) || /^[.…\s_]{10,}$/.test(s.trim());
}
function stripFormInstruction(s:string):string {
 let value=clean(s);
 const prefixes=[
  /^ระบุคำสำคัญทั้งภาษาไทยและภาษาอังกฤษ\s*/,
  /^ระบุชื่อบุคคล\s+คุณวุฒิ\s+ตำแหน่งทางวิชาการ\s+สังกัดหน่วยงาน\s*/,
  /^ระบุชื่อบุคคล\s+ชื่อหน่วยงาน\s+ที่อยู่\s+และลักษณะความร่วมมือทางวิจัย\s*/,
  /^อธิบายวิธีการและขั้นตอนในการวิจัยโดยละเอียด.*?ควรแนบตัวอย่างแบบสอบถามด้วย\s*/,
  /^ระบุขอบเขตการศึกษาของโครงการวิจัยวิจัย?.*?วัตถุประสงค์ของโครงการวิจัย\s*/,
  /^ร้อยละ\s*50\s*ของแผนการดำเนินงาน.*?ประกอบการพิจารณาประเมินความก้าวหน้าของโครงการ\s*/,
  /^ภายใต้โครงการวิจัยมีการดำเนินงานวิจัยแบบบูรณาการ.*?\(โปรดอธิบาย\)\s*/
 ];
 for(const prefix of prefixes){const next=value.replace(prefix,'');if(next!==value){value=next;break;}}
 return withoutPlaceholder(value);
}
const headingPatterns=[/^การทบทวนวรรณกรรม/,/^เอกสารอ้างอิง/,/^กระบวนการและวิธีการดำเนิน/,/^ขอบเขตของโครงการวิจัย/,/^แผนการดำเนินงาน/,/^ความสำคัญที่มา/,/^คำสำคัญ/,/^ผลลัพธ์ที่คาด/,/^ส่วน\s*[ขค]\s*:/];
function section(p:string[],start:RegExp,end:RegExp[]):{text:string;index:number} {
 const index=p.findIndex(s=>heading(s,start));
 if(index<0)return {text:'',index:-1};
 const stop=p.findIndex((s,i)=>i>index&&end.some(re=>heading(s,re)));
 return {text:p.slice(index+1,stop<0?p.length:stop).map(stripFormInstruction).filter(Boolean).filter(line=>!isFormInstruction(line)).join('\n').trim(),index};
}
function labelledValue(lines:string[], labels:RegExp[]):string|null {
 for(const line of lines) for(const label of labels) {
  const match=line.match(label);
  if(match) {
   const value=withoutPlaceholder(match[1]??'');
   if(value)return value;
  }
 }
 return null;
}
// Dates from the original RS-1 template and from our Word generator.
// Do not search the entire document: unrelated biographies may contain dates.
function firstDate(text:string,which:'start'|'end'):string|null {
 const date=String.raw`(?:\d{4}-\d{1,2}-\d{1,2}|\d{1,2}[/-]\d{1,2}[/-]\d{2,4}|\d{1,2}\s+[^\d\s]+\s+\d{4})`;
 const startLabel=String.raw`(?:วันเริ่มต้น|วันที่เริ่มต้น|เริ่มต้น)`;
 const endLabel=String.raw`(?:วันสิ้นสุด|วันที่สิ้นสุด|สิ้นสุด)`;
 const label=which==='start'?startLabel:endLabel;
 const labelled=text.match(new RegExp(`${label}\\s*[:：-]\\s*(${date})`,'u'));
 if(labelled)return labelled[1];
 // Supports "ระยะเวลาที่ทำการวิจัย ... 2027-01-01 ถึง 2027-12-31".
 const ranges=[
  new RegExp(String.raw`ระยะเวลาที่ทำการวิจัย[^\n]{0,500}?(${date})\s*(?:ถึง|จนถึง|to|–|—|\s+-\s+)\s*(${date})`,'iu'),
  new RegExp(String.raw`(${date})\s*(?:ถึง|จนถึง|to|–|—|\s+-\s+)\s*(${date})`,'iu')
 ];
 for(const re of ranges){const m=text.match(re);if(m)return m[which==='start'?1:2];}
 return null;
}
function selectedCheckbox(text:string,marks:{state:string}[]):boolean {
 if(marks.some(mark=>mark.state==='checked'))return true;
 return /^\s*(?:✓|☑|☒|✔|\uF0FE|\uF0FC)/u.test(text);
}
function peopleInSection(lines:string[]):Person[] {
 const result:Person[]=[];
 const labels: {key:keyof Person; re:RegExp}[]=[
  {key:'name',re:/^ชื่อ\s*[-–]?\s*สกุล\s*[:：]?\s*(.*)$/},
  {key:'affiliation',re:/^สังกัดหน่วยงาน\s*[:：]?\s*(.*)$/},
  {key:'phone',re:/^เบอร์โทรศัพท์ที่ติดต่อได้\s*[:：]?\s*(.*)$/},
  {key:'email',re:/^อีเมล\s*[:：]?\s*(.*)$/},
  {key:'responsibility',re:/^ความรับผิดชอบต่อโครงการที่เสนอ\s*[:：]?\s*(.*)$/},
  {key:'share',re:/^(?:คิดเป็น)?\s*สัดส่วนการวิจัย(?:ร้อยละ)?\s*[:：]?\s*(.*)$/}
 ];
 const blank=():Person=>({name:'',affiliation:'',phone:'',email:'',responsibility:'',share:''});
 let person:Person|null=null;
 for(let i=0;i<lines.length;i++){
  const line=clean(lines[i]);
  const label=labels.find(item=>item.re.test(line));
  if(!label)continue;
  let value=withoutPlaceholder(line.match(label.re)?.[1]??'');
  if(!value&&i+1<lines.length){
   const next=clean(lines[i+1]);
   if(next&&!labels.some(item=>item.re.test(next))&&!/^(?:ที่ปรึกษาโครงการวิจัย|\d+\.\s)/.test(next)) {value=withoutPlaceholder(next);i++;}
  }
  if(label.key==='name'){
   if(person&&Object.values(person).some(Boolean))result.push(person);
   person=blank();person.name=value;
  }else if(person)person[label.key]=value;
 }
 if(person&&Object.values(person).some(Boolean))result.push(person);
 return result;
}
export function extractRs1(doc:DocContent):Extraction {
 const p=doc.paragraphs.map(clean);const warnings:string[]=[];
 const details=doc.paragraphDetails??p.map(text=>({text,checkboxes:[]}));
 const strategyOptions=[
  'สอดคล้องกับคุณวุฒิ หรือสาขาวิชา หรือภาระงาน',
  'การพัฒนากำลังคนและสถาบันความรู้',
  'การวิจัยและสร้างนวัตกรรมเพื่อตอบโจทย์ท้าทายของสังคม',
  'การวิจัยและสร้างนวัตกรรมเพื่อเพิ่มขีดความสามารถการแข่งขัน',
  'การวิจัยและสร้างนวัตกรรมเพื่อการพัฒนาเชิงพื้นที่และลดความเหลื่อมล้ำ'
 ];
 const strategyDetails=details.filter(detail=>/^\s*(?:[☐☑☒✓✔]\s*)?[1-5][.)]\s*/u.test(detail.text) && strategyOptions.some(option=>detail.text.replace(/\s+/g,' ').includes(option)));
 const pickedStrategies=strategyDetails.filter(detail=>selectedCheckbox(detail.text,detail.checkboxes));
 const strategy=make(pickedStrategies.length===1?strategyOptions.find(option=>pickedStrategies[0].text.replace(/\s+/g,' ').includes(option))??null:null,'ส่วนประเด็นยุทธศาสตร์การวิจัย');
 if(pickedStrategies.length>1){strategy.status='review';warnings.push('ยุทธศาสตร์การวิจัยถูกเลือกมากกว่าหนึ่งข้อ กรุณาตรวจสอบ');}
 if(pickedStrategies.length===0&&strategyDetails.length)warnings.push('ไม่พบยุทธศาสตร์การวิจัยที่ถูกเลือกในเอกสาร');
 const experts:Expert[]=[];
 const expertSection=p.findIndex(s=>heading(s,/^ส่วน\s*ค\s*:/));
 if(expertSection>=0){
  const end=p.findIndex((s,i)=>i>expertSection&&heading(s,/^(?:หมายเหตุ|ภาคผนวก|ลงชื่อ)/));
  const area=p.slice(expertSection,end<0?p.length:end);
  const labels=[
   {key:'name',re:/^ชื่อ\s*-\s*สกุล\s*[:：]?\s*/},
   {key:'academicPosition',re:/^ตำแหน่งทางวิชาการ\s*[:：]?\s*/},
   {key:'affiliation',re:/^สังกัด\s*[:：]?\s*/},
   {key:'email',re:/^อีเมล\s*[:：]?\s*/}
  ] as const;
  let current:Expert|null=null;
  for(const line of area){
   const match=labels.find(label=>label.re.test(line));
   if(!match)continue;
   const value=withoutPlaceholder(line.replace(match.re,''));
   if(match.key==='name'){
    if(current && (current.name||current.email||current.affiliation))experts.push(current);
    current={name:value,academicPosition:'',affiliation:'',email:''};
   } else if(current) current[match.key]=value;
  }
  if(current && (current.name||current.email||current.affiliation))experts.push(current);
 }
 const emptyBiography=():Biography=>({thaiName:'',englishName:'',academicPosition:'',nationalId:'',education:'',employment:'',expertise:'',publications:'',presentations:'',intellectualProperty:'',researchManagementExperience:'',completedResearch:'',ongoingResearch:''});
 const cleanBiographyValue=(key:keyof Biography,value:string):string=>{
  let result=withoutPlaceholder(value);
  const prefixes:Partial<Record<keyof Biography,RegExp[]>>={
   expertise:[/^\(แตกต่างจากวุฒิการศึกษา\)\s*/,/^ระบุสาขาวิชาการ\s*/],
   publications:[/^ทั้งภายในและภายนอกประเทศ.*?ตามระบบสากล\s*/],
   presentations:[/^ทั้งภายในและภายนอกประเทศ.*?ตามระบบสากล\s*/],
   researchManagementExperience:[/^ทั้งภายในและต่างประเทศ.*?สถานภาพของงานวิจัยด้วย\s*/],
   completedResearch:[/^ชื่อข้อเสนอโครงการวิจัย.*?การเผยแพร่ผลงานวิจัย\s*/],
   ongoingResearch:[/^ชื่อข้อเสนอโครงการวิจัย[\s\S]*?สถานภาพของงานวิจัย\s*/]
  };
  for(const prefix of prefixes[key]??[])result=result.replace(prefix,'').trim();
  return withoutPlaceholder(result);
 };
 const documentLines=[...p,...doc.tables.flat(2).map(clean)].filter(Boolean);
 const biographyLabels=[
  {key:'englishName',re:/^(?:ชื่อ[-\s]*สกุลภาษาอังกฤษ|ชื่อ[-\s]*สกุล\s*\(ภาษาอังกฤษ\))\s*[:：-]?\s*(.*)$/i},
  {key:'academicPosition',re:/^ตำแหน่งทางวิชาการ\s*[:：-]?\s*(.*)$/},
  {key:'nationalId',re:/^(?:รหัสประจำตัวนักวิจัยแห่งชาติ|รหัสนักวิจัย)(?:\s*\(ถ้ามี\))?\s*[:：-]?\s*(.*)$/},
  {key:'education',re:/^ประวัติการศึกษา\s*[:：-]?\s*(.*)$/},
  {key:'employment',re:/^ประวัติการทำงาน\s*[:：-]?\s*(.*)$/},
  {key:'expertise',re:/^(?:สาขาวิชาการที่(?:เชี่ยวชาญ|มีความชำนาญพิเศษ)|ความเชี่ยวชาญ)\s*[:：-]?\s*(.*)$/},
  {key:'publications',re:/^ประวัติการเผยแพร่ผลงานวิจัย\s*[:：-]?\s*(.*)$/},
  {key:'presentations',re:/^ประวัติการนำเสนอผลงานวิจัย\s*[:：-]?\s*(.*)$/},
  {key:'intellectualProperty',re:/^(?:ผลงาน(?:วิจัย)?ที่ได้รับการจดทะเบียนทรัพย์สินทางปัญญา(?:\s+หรือผลงานวิจัยที่อยู่ระหว่างการยื่น\s*ขอจดทะเบียนทรัพย์สินทางปัญญา)?|ผลงานทรัพย์สินทางปัญญา)\s*[:：-]?\s*(.*)$/},
  {key:'researchManagementExperience',re:/^ประสบการณ์ที่เกี่ยวข้องกับการบริหารงานวิจัย\s*[:：-]?\s*(.*)$/},
  {key:'completedResearch',re:/^งานวิจัยที่ทำเสร็จแล้ว\s*[:：-]?\s*(.*)$/},
  {key:'ongoingResearch',re:/^[\d.)\s]*งานวิจัยที่กำลังทำ\s*[:：-]?\s*(.*)$/}
 ] as const;
 const biographies:Biography[]=[];
 const bioStart=documentLines.findIndex(line=>/^(?:ส่วน\s*ข\s*:\s*)?ประวัติคณะผู้วิจัย|ประวัติหัวหน้าโครงการวิจัย/.test(line));
 if(bioStart>=0){
  const bioEnd=documentLines.findIndex((line,index)=>index>bioStart&&/^ส่วน\s*ค\s*:/.test(line));
  const area=documentLines.slice(bioStart+1,bioEnd>=0?bioEnd:documentLines.length);
  let current=emptyBiography();
  let activeKey:keyof Biography|null=null;
  for(const line of area){
   const embeddedOngoing=line.match(/^([\s\S]*?)งานวิจัยที่กำลังทำ\s*[:：-]?\s*([\s\S]*)$/);
   if(embeddedOngoing){
    const preceding=withoutPlaceholder(embeddedOngoing[1]??'');
    if(preceding&&activeKey)current[activeKey]=[current[activeKey],preceding].filter(Boolean).join('\n');
    activeKey='ongoingResearch';
    current.ongoingResearch=cleanBiographyValue('ongoingResearch',embeddedOngoing[2]??'');
    continue;
   }
   const combinedName=line.match(/^ชื่อ\s*-?\s*สกุล\s*\(ภาษาไทย\/ภาษาอังกฤษ\)\s*[:：-]?\s*(.*)$/i);
   if(combinedName){
    if(current.thaiName||current.englishName){biographies.push(current);current=emptyBiography();}
    const [thaiName='',englishName='']=withoutPlaceholder(combinedName[1]).split(/\s+\/\s+/,2);
    current.thaiName=thaiName.trim();current.englishName=englishName.trim();activeKey='englishName';continue;
   }
   const label=biographyLabels.find(item=>item.re.test(line));
   if(/ประวัติผู้ร่วมโครงการ/.test(line)){
    if(Object.values(current).some(Boolean))biographies.push(current);
    current=emptyBiography();activeKey=null;continue;
   }
   if(label){
    activeKey=label.key;
    current[label.key]=cleanBiographyValue(label.key,line.match(label.re)?.[1]??'');
    continue;
   }
   if(activeKey && !isFormInstruction(line) && !/^ส่วน\s*[ขค]\s*:|^ลงชื่อ|^ข้อมูลประวัติในส่วนนี้/.test(line)){
    const value=cleanBiographyValue(activeKey,line);
    if(value)current[activeKey]=[current[activeKey],value].filter(Boolean).join('\n');
   }
  }
  if(Object.values(current).some(Boolean))biographies.push(current);
 }
 // Locate both languages within the proposal-title section only.
 let projectTitleTH=empty(),projectTitleEN=empty();
 const titleSectionStart=p.findIndex(s=>/^ชื่อโครงการ\s*$/.test(s.replace(/^\d+[.\s]*/,'')));
 const titleScope=titleSectionStart>=0?p.slice(titleSectionStart+1,titleSectionStart+7):p.slice(0,12);
 for(const [i,s] of titleScope.entries()){
  const th=s.match(/^\(?ภาษาไทย\)?\s*[:：]?\s*(.*)$/);
  const en=s.match(/^\(?ภาษาอังกฤษ\)?\s*[:：]?\s*(.*)$/);
  if(th){let v=withoutPlaceholder(th[1]);if(!v && titleScope[i+1]&&!/ภาษาอังกฤษ/.test(titleScope[i+1]))v=withoutPlaceholder(titleScope[i+1]);projectTitleTH=make(v,`ย่อหน้า: ${(titleSectionStart>=0?titleSectionStart+1:0)+i+1}`);}
  if(en){let v=withoutPlaceholder(en[1]);if(!v && titleScope[i+1]&&!/ยุทธศาสตร์|ส่วน\s*ก/.test(titleScope[i+1]))v=withoutPlaceholder(titleScope[i+1]);projectTitleEN=make(v,`ย่อหน้า: ${(titleSectionStart>=0?titleSectionStart+1:0)+i+1}`);}
 }
 // Parse each person in one pass; never increment an index before creating its record.
 const coStart=p.findIndex(s=>heading(s,/^ผู้ร่วมโครงการวิจัย/));
 const coEnd=p.findIndex((s,i)=>i>coStart&&heading(s,/^ที่ปรึกษาโครงการวิจัย/));
 const coResearchers=coStart>=0?peopleInSection(p.slice(coStart+1,coEnd>=0?coEnd:coStart+30)).filter(person=>person.name):[];
 const coResearcherField=make(coResearchers.map(x=>x.name).join('\n')||null,coStart>=0?'ส่วนคณะผู้วิจัย: ผู้ร่วมโครงการวิจัย':null);
 const duration=section(p,/^แผนการดำเนินงานตลอดโครงการวิจัย/,[/^ผลงานตามระยะเวลา/,/^ผลลัพธ์ที่คาด/]);
 const durationEndIndex=duration.index>=0?p.findIndex((line,i)=>i>duration.index&&heading(line,/^ผลงานตามระยะเวลา/)):-1;
 const durationText=duration.index>=0?p.slice(duration.index,durationEndIndex>=0?durationEndIndex:duration.index+15).join('\n'):'';
 const dateText=durationText; // Do not pick a date from another section of the document.
 const durationStart=make(firstDate(dateText,'start'),duration.index>=0?'ส่วนแผนการดำเนินงาน':'เอกสาร RS-1');
 const durationEnd=make(firstDate(dateText,'end'),duration.index>=0?'ส่วนแผนการดำเนินงาน':'เอกสาร RS-1');
 if(durationStart.status==='missing'||durationEnd.status==='missing')warnings.push('ไม่พบวันเริ่มต้นหรือวันสิ้นสุดโครงการ กรุณาตรวจสอบ');
 const type=section(p,/^ประเภทของการวิจัย/,[/^คำสำคัญ/]);
 const researchType=make(type.text||null,type.index>=0?'ส่วน ก: ประเภทของการวิจัย':null);
 if(researchType.value&&/ไม่มีการทำวิจัย|มีการทำวิจัย|มีการใช้สัตว์ทดลอง|พันธุ์พืช/.test(researchType.value))researchType.status='review';
 const keyword=section(p,/^คำสำคัญ\s*\(Keywords\)/,[/^ความสำคัญที่มา/,/^วัตถุประสงค์/]);
 const keywordLines=keyword.text.split(/\n/).map(stripFormInstruction).filter(Boolean);
 const keywordText=keywordLines.join('\n');
 const combinedTH=keywordText.match(/(?:คำสำคัญภาษาไทย|ภาษาไทย)\s*[:：-]\s*(.+?)(?=\s*(?:คำสำคัญภาษาอังกฤษ|ภาษาอังกฤษ|English)\s*[:：-]|$)/i)?.[1];
 const combinedEN=keywordText.match(/(?:คำสำคัญภาษาอังกฤษ|ภาษาอังกฤษ|English)\s*[:：-]\s*(.+)$/i)?.[1];
 const keywordsTH=make(withoutPlaceholder(combinedTH??labelledValue(keywordLines,[/^(?:คำสำคัญภาษาไทย|ภาษาไทย)\s*[:：-]\s*(.+)$/i])??keywordLines[0]??''),keyword.index>=0?'ส่วนคำสำคัญ (Keywords)':null);
 const keywordsEN=make(withoutPlaceholder(combinedEN??labelledValue(keywordLines,[/^(?:คำสำคัญภาษาอังกฤษ|ภาษาอังกฤษ|English)\s*[:：-]\s*(.+)$/i])??keywordLines[1]??''),keyword.index>=0?'ส่วนคำสำคัญ (Keywords)':null);
 // Investigator is from section 1.1 only, not co-investigators or Part B.
 const leaderIndex=p.findIndex(s=>/^(?:1\.1\s*)?หัวหน้าโครงการวิจัย\s*$/.test(s));
 const leaderStop=leaderIndex>=0?p.findIndex((s,i)=>i>leaderIndex&&/^(?:1\.2\s*)?ผู้ร่วมโครงการวิจัย$|^ที่ปรึกษาโครงการวิจัย$/.test(s)):-1;
 const leader=leaderIndex>=0?peopleInSection(p.slice(leaderIndex+1,leaderStop>=0?leaderStop:leaderIndex+20))[0]:undefined;
 const principalDetails:Person=leader??{name:'',affiliation:'',phone:'',email:'',responsibility:'',share:''};
 const principalInvestigator=make(principalDetails.name||null,leaderIndex>=0?'ส่วนหัวหน้าโครงการวิจัย':null);
 // Capture objective text between section 7 and 8. Do not include instruction headings.
 let objectives=empty();
 const objStart=p.findIndex(s=>heading(s,/^วัตถุประสงค์ของโครงการวิจัย/));
 if(objStart>=0){let end=p.findIndex((s,i)=>i>objStart && heading(s,/^การทบทวนวรรณกรรม/));if(end<0)end=Math.min(p.length,objStart+10);
  const header=p[objStart].replace(/^.*?วัตถุประสงค์ของโครงการวิจัย\s*[:：]?/,'').trim();
  const body=[header,...p.slice(objStart+1,end)].filter(s=>s && !headingPatterns.some(r=>heading(s,r))).join('\n').trim();objectives=make(withoutPlaceholder(body),`ระหว่างหัวข้อวัตถุประสงค์และการทบทวนวรรณกรรม`);
 }
 const outcome=section(p,/^ผลลัพธ์ที่คาดว่าจะได้รับจากงานวิจัย/,[/^การบูรณาการงานวิจัย/,/^ระดับการถ่ายทอดสู่สังคม/,/^รายละเอียดงบประมาณ/,/^มาตรฐานการวิจัย/]);
 const outcomeLines=outcome.text.split('\n').map(withoutPlaceholder).filter(line=>line&&!/^\s*(?:✓|☑|☒|☐)?\s*(?:ตีพิมพ์ในวารสาร|ตีพิมพ์วารสาร|นำเสนอในการประชุม|ทรัพย์สินทางปัญญา|อื่น ๆ)|^การบูรณาการงานวิจัย|^ภายใต้โครงการวิจัย|^ระดับการถ่ายทอดสู่สังคม|^สามารถนำไปถ่ายทอด|^ไม่มีการนำไปถ่ายทอด|^โปรดระบุ|^ระบุรายละเอียด|^เก็บข้อมูล/.test(line)&&!/^[.…\s_]+$/.test(line));
 const expectedOutcomes=make(outcomeLines.join('\n')||null,outcome.index>=0?'ส่วนผลลัพธ์ที่คาดว่าจะได้รับ':null);
 const significance=make(section(p,/^ความสำคัญที่มา/,[/^วัตถุประสงค์/]).text||null,'ส่วนความสำคัญ ที่มา และกรอบแนวความคิด');
 const literature=make(section(p,/^การทบทวนวรรณกรรม/,[/^เอกสารอ้างอิง/]).text||null,'ส่วนการทบทวนวรรณกรรม');
 const referenceSection=section(p,/^เอกสารอ้างอิง/,[/^กระบวนการและวิธีการดำเนิน/]);
 const references=make(referenceSection.text||null,'ส่วนเอกสารอ้างอิง');
 const methodology=make(section(p,/^กระบวนการและวิธีการดำเนิน/,[/^ขอบเขตของโครงการวิจัย/]).text||null,'ส่วนกระบวนการและวิธีการดำเนินโครงการวิจัย');
 const scope=make(section(p,/^ขอบเขตของโครงการวิจัย/,[/^แผนการดำเนินงาน/]).text||null,'ส่วนขอบเขตของโครงการวิจัย');
 const progress=make(section(p,/^ผลงานตามระยะเวลาการรายงานความก้าวหน้า/,[/^ผลลัพธ์ที่คาด/]).text||null,'ส่วนผลงานตามระยะเวลาการรายงานความก้าวหน้า');
 const integration=make(section(p,/^การบูรณาการงานวิจัย/,[/^ระดับการถ่ายทอดสู่สังคม/]).text||null,'ส่วนการบูรณาการงานวิจัย');
 const otherNotes=make(section(p,/^คำชี้แจงอื่น ๆ/,[/^ลงชื่อ|^ส่วน\s*[ขค]\s*:/]).text||null,'ส่วนคำชี้แจงอื่น ๆ');
 const advisor=make(section(p,/^ที่ปรึกษาโครงการวิจัย/,[/^ความร่วมมือด้านการวิจัย/]).text||null,'ส่วนที่ปรึกษาโครงการวิจัย');
 const collaboration=make(section(p,/^ความร่วมมือด้านการวิจัยกับหน่วยงานภายนอก/,[/^ประเภทของการวิจัย/]).text||null,'ส่วนความร่วมมือด้านการวิจัยกับหน่วยงานภายนอก');
 let transfer=empty();
 const scheduleSection=section(p,/^แผนการดำเนินงานตลอดโครงการวิจัย/,[/^ผลงานตามระยะเวลา/]);
 const scheduleTable=doc.tables.find(table=>/กิจกรรมวิจัย/.test(table.flat().join('\n')));
 const scheduleRows=scheduleTable?.slice(1).map((row,index)=>{
  const activity=clean(row[0]??'').replace(/^\d+[.)]\s*/,'');
  const period=clean(row[1]??'');
  return activity&&period&&!/กิจกรรมวิจัย|ระยะเวลา/.test(activity)?`${index+1}. ${activity} | ระยะเวลา: ${period}`:'';
 }).filter(Boolean)??[];
 const scheduleIntro=scheduleSection.text.split('\n').map(clean).filter(line=>line&&!/^กิจกรรมวิจัย$|^ระยะเวลา$|^\d+[.)]?\s*$|^\d+[.)]\s+/.test(line)&&!scheduleRows.some(row=>row.includes(line)));
 const schedule=make([...scheduleIntro,...scheduleRows].filter(Boolean).join('\n')||null,'ส่วนแผนการดำเนินงาน');
 const checkboxText=(text:string)=>text
  .replace(/^\s*\d+[.)]?\s*/u,'')
  .replace(/^\s*(?:✓|☑|☒|☐|\uF0FE|\uF0FC)\s*/u,'')
  .trim();
 const selected=(pattern:RegExp):boolean=>details.some(detail=>pattern.test(checkboxText(detail.text))&&(
  selectedCheckbox(detail.text,detail.checkboxes)
 ));
 const hasCheckboxes=(patterns:RegExp[]):boolean=>details.some(detail=>patterns.some(pattern=>pattern.test(checkboxText(detail.text)))&&(
  detail.checkboxes.length>0||/^\s*(?:✓|☑|☒|☐)/u.test(detail.text)
 ));
 const standardOptions=[
  {value:'none',pattern:/^ไม่มีการทำวิจัยในมนุษย์/},
  {value:'human',pattern:/^มีการทำวิจัยในมนุษย์/},
  {value:'animal',pattern:/^มีการใช้สัตว์ทดลอง/},
  {value:'plant',pattern:/^มีการเก็บ\s*จัดหา|^มีการเก็บ จัดหา/}
 ];
 const standardsAvailable=hasCheckboxes(standardOptions.map(option=>option.pattern));
 const researchStandards=standardsAvailable?standardOptions.filter(option=>selected(option.pattern)).map(option=>option.value):[];
 if(researchStandards.includes('none')&&researchStandards.some(value=>value!=='none'))warnings.push('พบการเลือกมาตรฐานการวิจัยที่ขัดกัน: เลือกทั้ง “ไม่มีการทำวิจัยในมนุษย์/สัตว์ทดลอง” และรายการที่มีมาตรฐาน กรุณาตรวจสอบต้นฉบับ');
 const publicationOptions=[
  {value:'international-journal',pattern:/^ตีพิมพ์ในวารสารทางวิชาการระดับนานาชาติ/},
  {value:'national-journal',pattern:/^ตีพิมพ์วารสารทางวิชาการระดับชาติ/},
  {value:'international-conference',pattern:/^นำเสนอในการประชุมวิชาการระดับนานาชาติ/},
  {value:'national-conference',pattern:/^นำเสนอในการประชุมวิชาการระดับชาติ/},
  {value:'intellectual-property',pattern:/^ทรัพย์สินทางปัญญา/},
  {value:'other',pattern:/^อื่น ๆ/}
 ];
 const publicationAvailable=hasCheckboxes(publicationOptions.map(option=>option.pattern));
 const selectedPublication=publicationAvailable?publicationOptions.find(option=>selected(option.pattern))?.value??null:null;
 const transferOptions=[
  {value:'ถ่ายทอดเป็นต้นแบบและแนวทางได้ในระดับภูมิภาค ประเทศ หรือนานาชาติ',pattern:/^สามารถนำไปถ่ายทอดเป็นต้นแบบและแนวทางได้ในระดับภูมิภาค/},
  {value:'ถ่ายทอดเป็นต้นแบบและแนวทางได้เฉพาะกลุ่มอาชีพ ชุมชน หรือจังหวัด',pattern:/^สามารถนำไปถ่ายทอดเป็นต้นแบบและแนวทางได้เฉพาะกลุ่มอาชีพ/},
  {value:'ไม่มีการนำไปถ่ายทอดสู่สังคม',pattern:/^ไม่มีการนำไปถ่ายทอดสู่สังคม/}
 ];
 const transferAvailable=hasCheckboxes(transferOptions.map(option=>option.pattern));
 transfer=make(transferAvailable?transferOptions.find(option=>selected(option.pattern))?.value??null:null,'ส่วนระดับการถ่ายทอดสู่สังคม');
 const checkboxStatus=standardsAvailable||publicationAvailable
  ? (details.some(detail=>detail.checkboxes.some(mark=>mark.state==='unknown'))?'ambiguous':'found')
  : 'unavailable';
 if(checkboxStatus==='unavailable')warnings.push('ไม่พบสถานะ checkbox ที่อ่านได้จากเอกสาร กรุณาเลือกประเภทการเผยแพร่และมาตรฐานการวิจัยเอง');
 if(checkboxStatus==='ambiguous')warnings.push('พบ checkbox แต่สถานะบางรายการไม่ชัดเจน กรุณาตรวจสอบตัวเลือกก่อนบันทึก');
 // Read budget only from amount cells, never trust incidental numbers in descriptions.
 let totalBudget=empty();const budgetItems:{category:string;description:string;breakdown:string;amount:number|null}[]=[];
 const budgetTable=doc.tables.find(t=>{
  const text=t.flat().join('\n');
  return /(?:งบดำเนินงาน|หมวดค่าตอบแทน|หมวดค่าใช้สอย|หมวดวัสดุ|รวมงบประมาณ)/.test(text)
    && t.some(row=>row.some(cell=>/^\s*(?:[\d,]+(?:\.\d{1,2})?|[-–])\s*$/.test(clean(cell))));
 });
 let calculatedBudget:number|null=null;
 if(budgetTable){let sum=0,hasAmount=false,currentCategory='';for(const [idx,row] of budgetTable.entries()){
  const label=clean(row[0]??''), money=clean(row[row.length-1]??'');
  const categoryMatch=label.match(/^\d+[.)]?\s*หมวด(.+)$/);
  if(categoryMatch){currentCategory=clean(categoryMatch[1]);continue;}
  if(/รวมงบประมาณที่ใช้ในการวิจัย|รวมงบประมาณ/.test(label)){totalBudget=make(num(money)?.toString()??null,`ตารางงบประมาณ แถว ${idx+1}`);continue;}
  if(!money || /จำนวนเงิน/.test(money))continue;
  const amount=num(money);if(amount!==null){if(amount===0)continue;const parenthesized=label.match(/\s*\(([^)]*(?:×|x)[^)]*)\)\s*$/i);const inline=label.match(/\s+(\d[\d,]*(?:\.\d+)?\s+[^\s×x]+(?:\s*[×x]\s*\d[\d,]*(?:\.\d+)?\s+[^\s×x]+)+)\s*$/i);const factor=parenthesized??inline;const rawDescription=factor&&factor.index!==undefined?label.slice(0,factor.index).trim():label;const [itemLabel, ...breakdownParts]=label.split(/\s+—\s+/);const description=(breakdownParts.length?itemLabel:rawDescription).replace(/^\s*-\s*/,'').trim();const breakdown=breakdownParts.join(' — ').trim()||factor?.[1]?.trim()||'';budgetItems.push({category:currentCategory,description,breakdown,amount});sum+=amount;hasAmount=true;}
 }
 if(hasAmount)calculatedBudget=sum;
 }else{warnings.push('ไม่พบตารางงบประมาณรูปแบบ RS-1');}
 if(budgetTable&&budgetItems.length===0)warnings.push('พบตารางงบประมาณ แต่ยังไม่มีรายการที่กรอกจำนวนเงิน');
 if(totalBudget.value!==null && calculatedBudget!==null && Number(totalBudget.value)!==calculatedBudget){totalBudget.status='review';totalBudget.warning=`ยอดรวมในเอกสาร ${totalBudget.value} ไม่ตรงผลรวมรายการ ${calculatedBudget}`;warnings.push(totalBudget.warning);}
 const required={projectTitleTH,projectTitleEN,principalInvestigator,coResearchers:coResearcherField,strategy,durationStart,durationEnd,researchType,keywordsTH,keywordsEN,objectives,expectedOutcomes,totalBudget,significance,literature,references,methodology,scope,progress,integration,otherNotes,advisor,collaboration,transfer,schedule};
 const mandatoryKeys=['projectTitleTH','projectTitleEN','principalInvestigator','strategy','durationStart','durationEnd','researchType','objectives','methodology','totalBudget'] as const;
 const completeness=mandatoryKeys.every(key=>required[key].status==='found');
 const documentCompleteness:Field={value:completeness?'ครบถ้วน':'ต้องตรวจสอบ',status:completeness?'found':'review',source:'ตรวจจากฟิลด์ทะเบียน RS-1'};
 const fields={...required,documentCompleteness};
 for(const key of mandatoryKeys)if(fields[key].status==='missing')warnings.push(`ไม่พบข้อมูลที่จำเป็น ${key} กรุณาตรวจสอบ`);
 if(documentCompleteness.status==='review')warnings.push('ข้อมูลทะเบียน RS-1 ยังไม่ครบทุกฟิลด์ ควรตรวจสอบเอกสารต้นฉบับ');
 const all=[...p,...doc.tables.flat(2)].join('\n');
 const thaiChecks={replacementCharacter:all.includes('\uFFFD'),zeroWidthCharacters:/[\u200B\u200C\u200D\uFEFF]/u.test(all),isolatedCombiningMarks:/(?:^|[\s\r\n])[\u0E31\u0E34-\u0E3A\u0E47-\u0E4E]/u.test(all)};
 if(thaiChecks.replacementCharacter)warnings.push('พบอักขระทดแทน � ซึ่งอาจหมายถึงข้อความที่ถอดรหัสผิด');
 if(thaiChecks.zeroWidthCharacters)warnings.push('พบอักขระ Zero-width ในภาษาไทย ควรตรวจสอบก่อนแก้ไข');
 if(thaiChecks.isolatedCombiningMarks)warnings.push('พบสระหรือวรรณยุกต์ไทยแยกเดี่ยว ควรตรวจสอบต้นฉบับ');
 return {fields,principalDetails,coResearchers,biographies,experts,researchStandards,publicationType:selectedPublication,checkboxStatus,budgetItems,calculatedBudget,warnings,thaiChecks,metadata:{paragraphCount:p.length,tableCount:doc.tables.length}};
}
