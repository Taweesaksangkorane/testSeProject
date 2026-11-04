'use client';

import {useEffect, useMemo, useState} from 'react';
import type {ProjectForm} from './rs1-app';

const escapeHtml=(value:string)=>value.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#39;');
const filled=(value:string)=>value.trim()?escapeHtml(value.trim()):'';
const attr=(value:string)=>escapeHtml(value).replace(/`/g,'&#96;');

type TemplateProps={form:ProjectForm;onBack:()=>void;onPreview?:()=>void;onChange?:<K extends keyof ProjectForm>(key:K,value:ProjectForm[K])=>void};

function applyValues(source:string,form:ProjectForm){
 const principal=form.principal;
 const co=form.coResearchers[0]??{name:'',affiliation:'',phone:'',email:'',responsibility:'',share:''};
 const input=(value:string,large=false)=>value.trim()?`<span class="${large?'template-filled template-filled-large':'template-filled'}">${filled(value).replace(/\r?\n/g,'<br>')}</span>`:'';
 const paragraphText=(paragraph:string)=>paragraph.replace(/<[^>]+>/g,' ').replace(/&nbsp;/g,' ').replace(/\s+/g,' ').trim();
 const appendAfter=(html:string,match:string,value:string,large=false)=>{
  if(!value.trim())return html;
  let used=false;
  return html.replace(/<p\b[^>]*>[\s\S]*?<\/p>/gi,paragraph=>{
   if(!used&&paragraphText(paragraph).includes(match)){used=true;return `${paragraph}<div class="template-insert">${input(value,large)}</div>`;}
   return paragraph;
  });
 };
 let result=source;
 result=result.replace(/(<p\b[^>]*>[\s\S]*?\(ภาษาไทย\)[\s\S]*?)(…+|\.{7,})([\s\S]*?<\/p>)/i,`$1${input(form.titleTH)}$3`);
 result=result.replace(/(<p\b[^>]*>[\s\S]*?\(ภาษาอังกฤษ\)[\s\S]*?)(…+|\.{7,})([\s\S]*?<\/p>)/i,`$1${input(form.titleEN)}$3`);
 const people=[principal,co];
 people.forEach((person,index)=>{
  const personFields=['name','affiliation','phone','email','responsibility','share'] as const;
  ['ชื่อ-สกุล','สังกัดหน่วยงาน','เบอร์โทรศัพท์ที่ติดต่อได้','อีเมล','ความรับผิดชอบต่อโครงการที่เสนอ','คิดเป็นสัดส่วนการวิจัยร้อยละ'].forEach((label,field)=>{
   let seen=0;
   result=result.replace(/<p\b[^>]*>[\s\S]*?<\/p>/gi,paragraph=>{
    const text=paragraphText(paragraph);
    if(text===label&&seen++===index)return paragraph.replace(/<\/p>\s*$/i,` ${input(person[personFields[field]])}</p>`);
    return paragraph;
   });
  });
 });
 const sections=[
  ['6.','ความสำคัญที่มาของปัญหาที่ทำการวิจัย',form.significance,true],
  ['7.','วัตถุประสงค์ของโครงการวิจัย',form.objectives,true],
  ['8.','การทบทวนวรรณกรรม',form.literature,true],
  ['9.','เอกสารอ้างอิงของโครงการวิจัย',form.references,true],
  ['10.','กระบวนการและ วิธีการดำเนินโครงการวิจัย',form.methodology,true],
  ['11.','ขอบเขตของโครงการวิจัย',form.scope,true],
  ['13.','ผลงานตามระยะเวลาการรายงานความก้าวหน้า',form.progress,true],
  ['14.','ผล ลัพธ์ ที่คาดว่าจะได้รับ',`${form.outcomes}\n${form.publicationOther}`,true],
  ['15.','การบูรณาการ งานวิจัย',form.integrationDetails||form.integration,true],
  ['19.','คำชี้แจงอื่น ๆ',form.otherNotes,true]
 ] as const;
 for(const [,heading,value,large] of sections)result=appendAfter(result,heading,value,large);

 result=appendAfter(result,'2. ที่ปรึกษาโครงการวิจัย',[form.advisorDetails.name,form.advisorDetails.qualification,form.advisorDetails.academicPosition,form.advisorDetails.affiliation,form.advisorDetails.email,form.advisorDetails.phone].filter(Boolean).join('\n'),false);
 result=appendAfter(result,'3. ความร่วมมือด้านการวิจัย',[form.collaborationDetails.person,form.collaborationDetails.organization,form.collaborationDetails.address,form.collaborationDetails.description].filter(Boolean).join('\n'),false);
 result=appendAfter(result,'4. ประเภทของการวิจัย',form.researchType,false);
 result=appendAfter(result,'5. คำสำคัญ',`ภาษาไทย: ${form.keywordsTH}\nภาษาอังกฤษ: ${form.keywordsEN}`,false);
 const total=form.budgetRows.reduce((sum,row)=>sum+(Number(row.amount.replace(/,/g,''))||0),0);
 result=appendAfter(result,'18. มาตรฐานการวิจัย',form.researchStandard.join(', '),false);

 const biography=form.principalBiography;
 const biographyValues=[
  ['1. ชื่อ- สกุล',`${biography.thaiName}\n${biography.englishName}`],
  ['2. ตำแหน่งทางวิชาการ',biography.academicPosition],
  ['3. รหัสประจำตัวนักวิจัยแห่งชาติ',biography.nationalId],
  ['4. ประวัติการศึกษา',biography.education],
  ['5. ประวัติการทำงาน',biography.employment],
  ['6. สาขาวิชาการที่มีความชำนาญพิเศษ',biography.expertise],
  ['7. ประวัติการเผยแพร่ผลงานวิจัย',biography.publications],
  ['8. ประวัติการนำเสนอผลงานวิจัย',biography.presentations],
  ['9. ผลงานวิจัยที่ได้รับการจดทะเบียน',biography.intellectualProperty],
  ['10. ประสบการณ์ที่เกี่ยวข้องกับการบริหารงานวิจัย',biography.researchManagementExperience],
  ['10.1 งานวิจัยที่ทำเสร็จแล้ว',biography.completedResearch],
  ['10.2 งานวิจัยที่กำลังทำ',biography.ongoingResearch]
 ] as const;
 for(const [heading,value] of biographyValues)result=appendAfter(result,heading,value,true);
 for(const [index,bio] of form.coBiographies.entries()){
  result=appendAfter(result,`ผู้ร่วมโครงการวิจัย${index+1}`,Object.values(bio).filter(Boolean).join('\n'),true);
 }

 const signatures=form.signatures;
 const signerNames=[form.advisorDetails.name,form.principal.name,form.coResearchers[0]?.name??''];
 let signatureIndex=0;
 result=result.replace(/\(…+\)|\(\.{7,}\)/g,()=>`(${filled(signerNames[signatureIndex++]||'')||' '})`);
 let dateIndex=0;
 result=result.replace(/วันที่ (…+|\.{7,})/g,()=>`วันที่ ${filled(signatures[dateIndex++]?.signedDate||'')||' '}`);

 let strategyIndex=0;
 const strategyOptions=[
  'คุณวุฒิ หรือสาขาวิชา หรือภาระงาน',
  'การพัฒนากำลังคนและสถาบันความรู้',
  'ตอบโจทย์ท้าทายของสังคม',
  'เพิ่มขีดความสามารถการแข่งขัน',
  'พัฒนาเชิงพื้นที่และลดความเหลื่อมล้ำ'
 ];
 const strategyChoice=strategyOptions.findIndex(option=>form.strategy.includes(option));
 result=result.replace(/<p\b[^>]*>[\s\S]*?<\/p>/gi,paragraph=>{
  if(!paragraphText(paragraph).match(/^[1-5]\.\s/))return paragraph;
  const choice=strategyIndex++;
  return choice<5&&choice===strategyChoice?paragraph.replace(/<span class="cb"><\/span>/i,'<span class="cb checked">✓</span>'):paragraph;
 });
 const checkedText=(paragraph:string,selected:boolean)=>selected?paragraph.replace(/<span class="cb"><\/span>/i,'<span class="cb checked">✓</span>'):paragraph;
 result=result.replace(/<p\b[^>]*>[\s\S]*?<\/p>/gi,paragraph=>{
  const text=paragraphText(paragraph);
  if(text.includes('ไม่มีการทำวิจัยในมนุษย์'))return checkedText(paragraph,form.researchStandard.includes('none'));
  if(text.includes('มีการทำวิจัยในมนุษย์'))return checkedText(paragraph,form.researchStandard.includes('human'));
  if(text.includes('มีการใช้สัตว์ทดลอง'))return checkedText(paragraph,form.researchStandard.includes('animal'));
  if(text.includes('เก็บ จัดหา หรือรวบรวมพันธุ์พืช'))return checkedText(paragraph,form.researchStandard.includes('plant'));
  if(text.includes('ระดับภูมิภาค ประเทศ หรือนานาชาติ'))return checkedText(paragraph,form.transfer.includes('ระดับภูมิภาค'));
  if(text.includes('เฉพาะกลุ่มอาชีพ ชุมชน หรือจังหวัด'))return checkedText(paragraph,form.transfer.includes('เฉพาะกลุ่มอาชีพ'));
  if(text.includes('ไม่มีการนำไปถ่ายทอดสู่สังคม'))return checkedText(paragraph,form.transfer.includes('ไม่มีการนำไปถ่ายทอด'));
  if(text.includes('ระดับนานาชาติ')&&form.publication==='international-journal')return checkedText(paragraph,true);
  if(text.includes('ระดับชาติ')&&form.publication==='national-journal')return checkedText(paragraph,true);
  if(text.includes('นำเสนอในการประชุมวิชาการระดับนานาชาติ')&&form.publication==='international-conference')return checkedText(paragraph,true);
  if(text.includes('ทรัพย์สินทางปัญญา')&&form.publication==='intellectual-property')return checkedText(paragraph,true);
  return paragraph;
 });
 result=result.replace(/[.…·]{2,}/g,'');
 result=result.replace(/<span class="cb checked">✓<\/span>/g,'<span class="cb checked">✓</span>');
 result=result.replace(/<span class="cb"><\/span>/g,'<span class="cb"></span>');
 if(typeof DOMParser==='undefined')return result;
 const parsed=new DOMParser().parseFromString(result,'text/html');
 parsed.querySelectorAll('[style*="FF0000" i],[style*="red" i]').forEach(element=>element.remove());
 parsed.querySelectorAll('.paper p,.paper td,.paper th').forEach(element=>{
  const paragraph=element as HTMLElement;
  paragraph.style.marginLeft='0';
  paragraph.style.marginRight='0';
  paragraph.style.textIndent='0';
 });
 parsed.querySelectorAll('p').forEach(element=>{
  const paragraph=element as HTMLElement;
  const text=paragraph.textContent?.replace(/\s+/g,' ').trim()??'';
  if(/^[●•▪◦]/.test(text)){
   paragraph.style.marginLeft='18pt';
   paragraph.style.textIndent='-12pt';
   paragraph.style.marginBottom='0';
   paragraph.style.lineHeight='1.25';
  }else if(/^\d+(?:\.\d+)+\s*/.test(text)&&!paragraph.querySelector('.cb')){
   paragraph.classList.add('numeric-subheading');
   paragraph.style.marginLeft='18pt';
   paragraph.style.textIndent='0';
   paragraph.style.marginBottom='0';
   paragraph.style.lineHeight='1.25';
  }else if(/^\d+[.)]\s*/.test(text)&&!paragraph.querySelector('.cb')){
   paragraph.classList.add('numeric-heading');
   paragraph.style.marginBottom='0';
   paragraph.style.lineHeight='1.25';
  }
  if(/^\d+(?:\.\d+)*[.)]?\s*/.test(text)&&!paragraph.querySelector('.cb')){
   paragraph.querySelectorAll('i.tab').forEach(tab=>tab.replaceWith(parsed.createTextNode(' ')));
  }
 });
 const sectionC=Array.from(parsed.querySelectorAll('.paper p')).find(paragraph=>{
  const text=paragraph.textContent?.replace(/\s+/g,' ').trim()??'';
  return /^ส่วน\s*ค(?:\s|:|：)/.test(text);
 });
 if(sectionC){
  let node:Node|null=sectionC;
  while(node){
   const next:Node|null=node.nextSibling;
   node.parentNode?.removeChild(node);
   node=next;
  }
 }
 const setCheckbox=(needle:string,selected:boolean)=>{
  parsed.querySelectorAll('p').forEach(paragraph=>{
   if(!paragraph.textContent?.includes(needle))return;
   const checkbox=paragraph.querySelector('.cb');
   if(!checkbox)return;
   checkbox.textContent=selected?'✓':'';
   checkbox.classList.toggle('checked',selected);
  });
 };
 const strategyNeedles=[
  'คุณวุฒิ หรือสาขาวิชา หรือภาระงาน',
  'การพัฒนากำลังคนและสถาบันความรู้',
  'ตอบโจทย์ท้าทายของสังคม',
  'เพิ่มขีดความสามารถการแข่งขัน',
  'พัฒนาเชิงพื้นที่และลดความเหลื่อมล้ำ'
 ];
 strategyNeedles.forEach((needle,index)=>setCheckbox(needle,index===strategyChoice));
 setCheckbox('ไม่มีการทำวิจัยในมนุษย์',form.researchStandard.includes('none'));
 setCheckbox('มีการทำวิจัยในมนุษย์',form.researchStandard.includes('human'));
 setCheckbox('มีการใช้สัตว์ทดลอง',form.researchStandard.includes('animal'));
 setCheckbox('เก็บ จัดหา หรือรวบรวมพันธุ์พืช',form.researchStandard.includes('plant'));
 setCheckbox('ระดับภูมิภาค ประเทศ หรือนานาชาติ',form.transfer.includes('ระดับภูมิภาค'));
 setCheckbox('เฉพาะกลุ่มอาชีพ ชุมชน หรือจังหวัด',form.transfer.includes('เฉพาะกลุ่มอาชีพ'));
 setCheckbox('ไม่มีการนำไปถ่ายทอดสู่สังคม',form.transfer.includes('ไม่มีการนำไปถ่ายทอด'));
 const makeCell=(value:string)=>{
  const cell=parsed.createElement('td');cell.textContent=value;return cell;
 };
 parsed.querySelectorAll('table').forEach(table=>{
  const tableText=table.textContent??'';
  const body=table.querySelector('tbody')??table;
  if(tableText.includes('กิจกรรมวิจัย')){
   Array.from(body.querySelectorAll('tr')).slice(1).forEach(row=>row.remove());
   form.schedule.filter(row=>row.activity.trim()||row.period.trim()).forEach(row=>{
    const tr=parsed.createElement('tr');tr.append(makeCell(row.activity),makeCell(row.period));body.append(tr);
   });
  }
  if(tableText.includes('รายการค่าใช้จ่าย')||tableText.includes('จำนวนเงิน')){
   Array.from(body.querySelectorAll('tr')).slice(1).forEach(row=>row.remove());
   form.budgetRows.filter(row=>row.description.trim()||row.breakdown.trim()||row.amount.trim()).forEach(row=>{
    const tr=parsed.createElement('tr');
    tr.append(makeCell(row.description||row.category),makeCell(row.amount));
    body.append(tr);
   });
   const total=form.budgetRows.reduce((sum,row)=>sum+(Number(row.amount.replace(/,/g,''))||0),0);
   if(total||form.budgetRows.some(row=>row.amount.trim())){
    const tr=parsed.createElement('tr');tr.append(makeCell('รวมงบประมาณที่ใช้ในการวิจัย'),makeCell(total.toLocaleString('th-TH')));body.append(tr);
   }
  }
 });
 return parsed.documentElement.outerHTML;
}

export default function Rs1Preview({form,onBack}:{form:ProjectForm;onBack:()=>void}){
 const [template,setTemplate]=useState('');
 const [error,setError]=useState('');
 useEffect(()=>{
  fetch('/templates/rs1-private-template.html')
   .then(response=>response.ok?response.text():Promise.reject(new Error('โหลดเทมเพลต RS-1 ไม่สำเร็จ')))
   .then(setTemplate)
   .catch(reason=>setError(reason instanceof Error?reason.message:'โหลดเทมเพลต RS-1 ไม่สำเร็จ'));
 },[]);
 const html=useMemo(()=>applyValues(template,form),[template,form]);
 const body=html.match(/<body[^>]*>([\s\S]*?)<\/body>/i)?.[1]??html;
 const styles=`${html.match(/<style[^>]*>([\s\S]*?)<\/style>/gi)?.join('')??''}<style>
 .template-filled{white-space:pre-wrap;border:0!important;outline:0!important;background:transparent!important}
 .template-insert{display:block!important;margin:0!important;padding:0!important;text-indent:0!important}
 .template-filled-large{display:block;min-height:0!important;margin:4pt 0 8pt;padding:0!important}
 .cb.checked{font-size:12pt!important;border:0!important;width:.62em;height:.62em;line-height:.62em;font-family:Arial,sans-serif}
 body{font-size:16pt!important}.paper{font-size:16pt!important;box-shadow:none!important}
 .paper p,.paper td,.paper th{margin-left:0!important;margin-right:0!important;text-indent:0!important}
 .paper p{line-height:1.35!important}
 .paper p[style*="margin-left: 18pt"]{margin-left:18pt!important;text-indent:-12pt!important;margin-bottom:0!important;line-height:1.25!important}
 .paper p[style*="margin-bottom: 0"]{margin-bottom:0!important;line-height:1.25!important}
 .paper p.numeric-subheading{margin-left:18pt!important;text-indent:0!important}
 .paper p.numeric-heading{margin-left:0!important;text-indent:0!important}
 .paper p,.paper td,.paper th,.paper span{font-size:16pt!important}
 .paper table{font-size:16pt!important}
 </style>`;
 return <div className="template-preview-screen">
  <div className="preview-toolbar">
   <button className="secondary" onClick={onBack}>กลับไปแก้ไข</button>
   <div><strong>พรีวิวจากเทมเพลต HTML RS-1</strong><span>ใช้แบบฟอร์ม HTML ต้นฉบับโดยตรง</span></div>
   <button onClick={()=>window.print()}>พิมพ์ / บันทึกเป็น PDF</button>
  </div>
  {error&&<div className="error notice">{error}</div>}
  {!template&&!error&&<div className="template-loading">กำลังโหลดเทมเพลต...</div>}
  {template&&<div className="template-preview-document" dangerouslySetInnerHTML={{__html:`${styles}<div class="template-content">${body}</div>`}}/>}
 </div>;
}

const editorValues=(form:ProjectForm)=>[
 form.titleTH,form.titleEN,form.principal.name,form.principal.affiliation,form.principal.phone,form.principal.email,form.principal.responsibility,form.principal.share,
 form.coResearchers[0]?.name??'',form.coResearchers[0]?.affiliation??'',form.coResearchers[0]?.phone??'',form.coResearchers[0]?.email??'',form.coResearchers[0]?.responsibility??'',form.coResearchers[0]?.share??'',
 form.advisorDetails.name,form.collaborationDetails.organization,form.researchType,form.keywordsTH,form.keywordsEN,form.significance,form.objectives,form.literature,form.references,form.methodology
];

export function Rs1TemplateEditor({form,onBack,onPreview,onChange}:TemplateProps){
 const [template,setTemplate]=useState('');
 const [error,setError]=useState('');
 const rootId='rs1-template-editor';
 useEffect(()=>{
  fetch('/templates/rs1-private-template.html').then(response=>response.ok?response.text():Promise.reject(new Error('โหลดเทมเพลต RS-1 ไม่สำเร็จ'))).then(setTemplate).catch(reason=>setError(reason instanceof Error?reason.message:'โหลดเทมเพลต RS-1 ไม่สำเร็จ'));
 },[]);
 const html=useMemo(()=>{
  const values=editorValues(form);
  let index=0;
  return template.replace(/[.…·]{2,}/g,match=>{
   const field=index++;
   return `<input class="template-entry" data-template-field="${field}" value="${attr(values[field]??'')}" placeholder="${match}">`;
  });
 },[template,form]);
 useEffect(()=>{
  const root=document.getElementById(rootId);
  if(!root||!onChange)return;
  const handler=(event:Event)=>{
   const target=event.target as HTMLInputElement;
   const field=Number(target.dataset.templateField);
   const value=target.value;
   if(field===0)onChange('titleTH',value);
   else if(field===1)onChange('titleEN',value);
   else if(field>=2&&field<=7)onChange('principal',{...form.principal,[['name','affiliation','phone','email','responsibility','share'][field-2]]:value});
   else if(field>=8&&field<=13){const co=form.coResearchers[0]??{name:'',affiliation:'',phone:'',email:'',responsibility:'',share:''};onChange('coResearchers',[{...co,[['name','affiliation','phone','email','responsibility','share'][field-8]]:value},...form.coResearchers.slice(1)]);}
   else if(field===14)onChange('advisorDetails',{...form.advisorDetails,name:value});
   else if(field===15)onChange('collaborationDetails',{...form.collaborationDetails,organization:value});
   else if(field===16)onChange('researchType',value);
   else if(field===17)onChange('keywordsTH',value);
   else if(field===18)onChange('keywordsEN',value);
   else if(field===19)onChange('significance',value);
   else if(field===20)onChange('objectives',value);
   else if(field===21)onChange('literature',value);
   else if(field===22)onChange('references',value);
   else if(field===23)onChange('methodology',value);
  };
  root.addEventListener('input',handler);
  return()=>root.removeEventListener('input',handler);
 },[form,onChange]);
 const body=html.match(/<body[^>]*>([\s\S]*?)<\/body>/i)?.[1]??html;
 const styles=html.match(/<style[^>]*>([\s\S]*?)<\/style>/gi)?.join('')??'';
 return <div className="template-preview-screen template-editor-screen">
  <div className="preview-toolbar"><button className="secondary" onClick={onBack}>กลับ</button><div><strong>กรอกข้อมูลบนเทมเพลต HTML RS-1</strong><span>ช่องว่างในแบบฟอร์มคือช่องกรอกข้อมูล</span></div>{onPreview&&<button onClick={onPreview}>พรีวิว / บันทึกเป็น PDF</button>}</div>
  {error&&<div className="error notice">{error}</div>}
  {!template&&!error&&<div className="template-loading">กำลังโหลดเทมเพลต...</div>}
  {template&&<div id={rootId} className="template-preview-document" dangerouslySetInnerHTML={{__html:`${styles}<div class="template-content">${body}</div>`}}/>}
 </div>;
}
