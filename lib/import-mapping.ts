export type CollaborationParts={person:string;organization:string;address:string;description:string};

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
