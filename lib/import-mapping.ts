export type CollaborationParts={person:string;organization:string;address:string;description:string};
export type AdvisorParts={name:string;qualification:string;academicPosition:string;affiliation:string};

const academicPositionPattern=/^(ศาสตราจารย์|รองศาสตราจารย์|ผู้ช่วยศาสตราจารย์|อาจารย์|ศ\.|รศ\.|ผศ\.|อ\.)\s*[,;:：-]?\s*/u;
const degreePattern=/(?:ปริญญา|ปร\.ด\.|วท\.ด\.|กศ\.ด\.|ศษ\.ด\.|ค\.ด\.|Ph\.?D\.?|Ed\.?D\.?|วท\.ม\.|ศษ\.ม\.|กศ\.ม\.|M\.?[A-Za-z]*\.?|วท\.บ\.|ศษ\.บ\.|กศ\.บ\.|B\.?[A-Za-z]*\.?)/i;
const organizationPattern=/(?:มหาวิทยาลัย|สำนักวิชา|คณะ|วิทยาลัย|สถาบัน|ศูนย์|หน่วยงาน|โรงพยาบาล|บริษัท|กรม|กระทรวง)/u;
function fullAcademicPosition(value:string):string {
 const normalized=value.trim();
 const positions:Record<string,string>={
  'ศ.':'ศาสตราจารย์',
  'รศ.':'รองศาสตราจารย์',
  'ผศ.':'ผู้ช่วยศาสตราจารย์',
  'อ.':'อาจารย์'
 };
 return positions[normalized]??normalized;
}

export function parseAdvisor(value:string):AdvisorParts {
 const text=value.replace(/\r/g,'').trim();
 const advisorLabels='ชื่อบุคคล|ชื่อที่ปรึกษา|คุณวุฒิ|วุฒิการศึกษา|ตำแหน่งทางวิชาการ|ตำแหน่ง|สังกัดหน่วยงาน|สังกัด';
 const labelled=(labels:string)=>text.match(new RegExp(`(?:^|\\n|\\s)(?:${labels})\\s*(?:[:：=-]\\s*|\\n\\s*)([\\s\\S]*?)(?=\\s*(?:${advisorLabels})\\s*(?:[:：=-]\\s*|\\n\\s*)|$)`,'i'))?.[1]?.trim()??'';
 const labelledResult:AdvisorParts={
  name:labelled('ชื่อบุคคล|ชื่อที่ปรึกษา'),
  qualification:labelled('คุณวุฒิ|วุฒิการศึกษา'),
  academicPosition:labelled('ตำแหน่งทางวิชาการ|ตำแหน่ง'),
  affiliation:labelled('สังกัดหน่วยงาน|สังกัด')
 };
 if(Object.values(labelledResult).some(Boolean)){
  const position=labelledResult.affiliation.match(academicPositionPattern);
  if(position){
   if(!labelledResult.academicPosition)labelledResult.academicPosition=fullAcademicPosition(position[1]);
   labelledResult.affiliation=labelledResult.affiliation.slice(position[0].length).trim();
  }
  labelledResult.academicPosition=fullAcademicPosition(labelledResult.academicPosition);
  return labelledResult;
 }
 const parts=text.split(/\s*(?:;|\n|,)\s*/).map(item=>item.trim()).filter(Boolean);
 let name=parts.shift()??'',qualification='',academicPosition='',affiliation='';
 const namePosition=name.match(academicPositionPattern);
 if(namePosition){academicPosition=fullAcademicPosition(namePosition[1]);name=name.slice(namePosition[0].length).trim();}
 for(const rawPart of parts){
  let part=rawPart;
  const position=part.match(academicPositionPattern);
  if(position){
   if(!academicPosition)academicPosition=fullAcademicPosition(position[1]);
   // Always remove a repeated/full position before classifying affiliation.
   part=part.slice(position[0].length).trim();
   if(!part)continue;
  }
  if(!qualification&&degreePattern.test(part)){qualification=part;continue;}
  if(organizationPattern.test(part)||affiliation){affiliation=[affiliation,part].filter(Boolean).join(', ');continue;}
  affiliation=[affiliation,part].filter(Boolean).join(', ');
 }
 return {name,qualification,academicPosition,affiliation};
}

const blank=():CollaborationParts=>({person:'',organization:'',address:'',description:''});
const labelAliases={
 person:'ชื่อบุคคล|ผู้ประสานงาน(?:ภายนอก)?',
 organization:'ชื่อหน่วยงาน|หน่วยงาน|สังกัด(?:หน่วยงาน)?',
 address:'ที่อยู่(?:สำหรับตัวอย่าง)?|สถานที่ตั้ง',
 description:'ลักษณะความร่วมมือ(?:ทางวิจัย)?|รายละเอียดความร่วมมือ'
} as const;
const allLabels=Object.values(labelAliases).join('|');

function labelled(text:string,labels:string):string {
 const separator=String.raw`(?:\s*[:：=-]\s*|\s*\n\s*)`;
 return text.match(new RegExp(`(?:^|\\n|\\s)(?:${labels})${separator}([\\s\\S]*?)(?=\\s*(?:${allLabels})${separator}|$)`,'i'))?.[1]?.trim()??'';
}

function splitAddress(value:string):{organization:string;address:string} {
 const text=value.trim();
 const marker=/(?:^|[ ,])((?:บ้านเลขที่|หมู่(?:ที่)?|ซอย|ถนน|ตำบล|ต\.|อำเภอ|อ\.|จังหวัด|จ\.|แขวง|เขต)\s*[^;]*)$/u;
 const marked=text.match(marker);
 if(marked&&marked.index!==undefined)return {organization:text.slice(0,marked.index).replace(/[ ,]+$/,'').trim(),address:marked[1].trim()};
 const postal=text.match(/(?:^|[ ,])([^,;]*\b\d{5})$/u);
 if(postal&&postal.index!==undefined){
  const tail=postal[1].trim();
  // A postal code by itself is not enough to identify where a long organization name ends.
  const province=tail.match(/(?:จังหวัด|จ\.)\s*[^,;]*\b\d{5}$/u);
  if(province&&province.index!==undefined){
   const start=text.lastIndexOf(province[0]);
   return {organization:text.slice(0,start).replace(/[ ,]+$/,'').trim(),address:text.slice(start).trim()};
  }
 }
 return {organization:text,address:''};
}

function splitDescription(text:string):{identity:string;description:string} {
 const semicolon=text.match(/[;；]/u);
 if(semicolon&&semicolon.index!==undefined)return {identity:text.slice(0,semicolon.index).trim(),description:text.slice(semicolon.index+1).trim()};
 const lines=text.split(/\n+/).map(x=>x.trim()).filter(Boolean);
 const action=lines.findIndex((line,index)=>index>0&&/^(?:ร่วม|ให้|สนับสนุน|ประสาน|ทำหน้าที่|เป็นที่ปรึกษา|แลกเปลี่ยน|อนุเคราะห์)/u.test(line));
 if(action>0)return {identity:lines.slice(0,action).join(' '),description:lines.slice(action).join('\n')};
 return {identity:text.trim(),description:''};
}

export function parseCollaboration(value:string):CollaborationParts {
 const text=value.replace(/\r/g,'').replace(/[\t ]+/g,' ').trim();
 if(!text)return blank();
 const result:CollaborationParts={
  person:labelled(text,labelAliases.person),
  organization:labelled(text,labelAliases.organization),
  address:labelled(text,labelAliases.address),
  description:labelled(text,labelAliases.description)
 };
 if(Object.values(result).some(Boolean))return result;

 const {identity,description}=splitDescription(text);
 const dash=identity.match(/\s+(?:—|–|-)\s+/u);
 let person='',remainder='';
 if(dash&&dash.index!==undefined){
  person=identity.slice(0,dash.index).trim();
  remainder=identity.slice(dash.index+dash[0].length).trim();
 }else{
  const lines=identity.split(/\n+/).map(x=>x.trim()).filter(Boolean);
  if(lines.length>=2){
   person=lines[0];
   remainder=lines.slice(1).join(' ');
  }
  if(!person){
   const organizationStart=identity.search(/(?:ศูนย์|มหาวิทยาลัย|สถาบัน|โรงพยาบาล|บริษัท|ห้างหุ้นส่วน|โรงเรียน|วิทยาลัย|สำนัก|คณะ|หน่วยงาน)/u);
   if(organizationStart>0){person=identity.slice(0,organizationStart).replace(/[ ,]+$/,'').trim();remainder=identity.slice(organizationStart).trim();}
  }
 }
 if(!person||!remainder)return {...blank(),description:text};
 const location=splitAddress(remainder);
 return {person,organization:location.organization,address:location.address,description};
}
