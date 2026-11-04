import JSZip from 'jszip';
import { XMLParser } from 'fast-xml-parser';
import WordExtractor from 'word-extractor';

export type TableKind='schedule'|'budget'|'biography'|'unknown';
export type TableClassification={kind:TableKind;confidence:'high'|'medium'|'low';reason:string};
export type ParagraphRun={
 type:'text'|'symbol'|'tab'|'break';text:string;symbolCode?:string;symbolFont?:string;
 bold?:boolean;italic?:boolean;underline?:string|null;font?:string|null;fontSizeHalfPoints?:number|null;color?:string|null;
};
export type ParagraphNumbering={numId:string;level:number;format:string|null;levelText:string|null;start:number|null;marker:string|null};
export type ParagraphLayout={
 styleId:string|null;alignment:string|null;
 indentation:{leftTwips:number|null;rightTwips:number|null;firstLineTwips:number|null;hangingTwips:number|null};
 spacing:{beforeTwips:number|null;afterTwips:number|null;line:number|null;lineRule:string|null};
 numbering:ParagraphNumbering|null;keepNext:boolean;pageBreakBefore:boolean;
};
export type SourceTableCell={
 text:string;columnSpan:number;verticalMerge:'restart'|'continue'|null;widthTwips:number|null;
 checkboxes:CheckboxMark[];images:ImageEvidence[];paragraphs?:ParagraphInfo[];
};
export type SourceTableRow={cells:SourceTableCell[]};
export type SourceTable={rows:string[][];structuredRows:SourceTableRow[];classification:TableClassification};
export type DocBlock = { type: 'paragraph'; text: string;paragraph?:ParagraphInfo;images?:ImageEvidence[];checkboxes?:CheckboxMark[] } | {type:'table'; rows: string[][];table?:SourceTable;images?:ImageEvidence[];checkboxes?:CheckboxMark[]};
export type CheckboxMark = {state:'checked'|'unchecked'|'unknown'; code:string; font:string};
export type ImageEvidence = {id:string;relationshipId:string;path:string;contentType:string;size:number;dataBase64?:string};
export type ParagraphInfo = {text:string;checkboxes:CheckboxMark[];images:ImageEvidence[];runs:ParagraphRun[];symbols:{code:string;font:string;text:string}[];layout:ParagraphLayout};
export type SourceDocumentBlock =
 | {id:string;index:number;type:'paragraph';text:string;paragraph?:ParagraphInfo;checkboxes:CheckboxMark[];images?:ImageEvidence[]}
 | {id:string;index:number;type:'table';rows:string[][];table:SourceTable;checkboxes:CheckboxMark[];images?:ImageEvidence[]};
export type SourceDocumentJson = {
 version:2;
 sourceType:'docx'|'doc';
 text:string;
 blocks:SourceDocumentBlock[];
 tables?:SourceTable[];
 images?:ImageEvidence[];
 stats:{paragraphs:number;tables:number;checkboxes:number;images?:number};
};
export type DocContent = {blocks:DocBlock[]; paragraphs:string[]; paragraphDetails:ParagraphInfo[]; tables:string[][][]; sourceDocument:SourceDocumentJson};
// preserveOrder keeps adjacent w:t fragments in their original XML order.
// Important for Thai combining marks spread across Word runs.
type XmlNode = Record<string, any>;
const parser = new XMLParser({preserveOrder:true, ignoreAttributes:false, trimValues:false, processEntities:true});
type NumberLevel={format:string|null;levelText:string|null;start:number|null};
type NumberingContext={levels:Map<string,Map<number,NumberLevel>>;counters:Map<string,number[]>};
const checkedTextMarks=new Set(['☑','☒','✓','✔','✅','✗','✘','■','●','◉','⦿']);
const uncheckedTextMarks=new Set(['☐','□','▢','⬜','○','◯']);
function booleanState(raw:string):CheckboxMark['state'] {
  return /^(?:1|true|on|yes|checked)$/i.test(raw)?'checked'
    : /^(?:0|false|off|no|unchecked)$/i.test(raw)?'unchecked'
    : 'unknown';
}
function nestedAttribute(nodes:XmlNode[],tags:Set<string>):string|null {
  for(const node of nodes){
    for(const [tag,value] of Object.entries(node)){
      if(tag===':@')continue;
      if(tags.has(tag)){
        const attrs=(node[':@']??{}) as Record<string,string>;
        const raw=attrs['@_w:val']??attrs['@_w14:val']??attrs['@_val'];
        if(raw!==undefined)return raw;
      }
      if(Array.isArray(value)){
        const nested=nestedAttribute(value,tags);
        if(nested!==null)return nested;
      }
    }
  }
  return null;
}
function getNodeContents(list:XmlNode[], tag:string):XmlNode[][] {
  const found:XmlNode[][]=[];
  for(const node of list){ if(Array.isArray(node[tag])) found.push(node[tag]); }
  return found;
}
function findTagAttributes(nodes:XmlNode[],tag:string):Record<string,string>|null {
 for(const node of nodes){
  for(const [key,value] of Object.entries(node)){
   if(key===':@')continue;
   if(key===tag)return (node[':@']??{}) as Record<string,string>;
   if(Array.isArray(value)){
    const nested=findTagAttributes(value,tag);
    if(nested)return nested;
   }
  }
 }
 return null;
}
function inlineText(nodes:XmlNode[]):string {
  let result='';
  for(const node of nodes){
    for(const [tag,value] of Object.entries(node)){
      if(tag === ':@') continue;
      if(tag==='w:t' || tag==='w:instrText') {
        // Never include instruction field codes into extracted text.
        if(tag==='w:t') result += (value as XmlNode[]).map(x=>x['#text'] ?? '').join('');
      } else if(tag==='w:tab') result+='\t';
      else if(tag==='w:br' || tag==='w:cr') result+='\n';
      else if(tag==='w:pPr' || tag==='w:rPr' || tag==='w:fldChar' || tag==='w:del' || tag==='w:delText') continue;
      else if(Array.isArray(value)) result+=inlineText(value);
    }
  }
  return result;
}
function nullableNumber(value:string|undefined):number|null {const n=Number(value);return value!==undefined&&Number.isFinite(n)?n:null;}
function hasTag(nodes:XmlNode[],tag:string):boolean {return nodes.some(node=>node[tag]!==undefined||(Object.entries(node).some(([key,value])=>key!==':@'&&Array.isArray(value)&&hasTag(value,tag))));}
function runFormat(nodes:XmlNode[]){
 const rPr=getNodeContents(nodes,'w:rPr')[0]??[];
 const fonts=findTagAttributes(rPr,'w:rFonts');
 return {
  bold:hasTag(rPr,'w:b'),italic:hasTag(rPr,'w:i'),underline:findTagAttributes(rPr,'w:u')?.['@_w:val']??null,
  font:fonts?.['@_w:ascii']??fonts?.['@_w:eastAsia']??fonts?.['@_w:hAnsi']??null,
  fontSizeHalfPoints:nullableNumber(findTagAttributes(rPr,'w:sz')?.['@_w:val']),color:findTagAttributes(rPr,'w:color')?.['@_w:val']??null
 };
}
function paragraphRuns(nodes:XmlNode[],format:ReturnType<typeof runFormat>|null=null):ParagraphRun[]{
 const runs:ParagraphRun[]=[];
 for(const node of nodes)for(const [tag,value] of Object.entries(node)){
  if(tag===':@'||tag==='w:pPr'||tag==='w:rPr'||tag==='w:instrText'||tag==='w:del'||tag==='w:delText')continue;
  if(tag==='w:r'&&Array.isArray(value)){runs.push(...paragraphRuns(value,runFormat(value)));continue;}
  if(tag==='w:t'){
   const text=(value as XmlNode[]).map(item=>item['#text']??'').join('');
   if(text)runs.push({type:'text',text,...(format??{})});
  }else if(tag==='w:sym'){
   const attrs=(node[':@']??{}) as Record<string,string>;const code=(attrs['@_w:char']??'').toUpperCase();const font=attrs['@_w:font']??'';
   runs.push({type:'symbol',text:`[${font||'symbol'}:${code||'unknown'}]`,symbolCode:code,symbolFont:font,...(format??{})});
  }else if(tag==='w:tab')runs.push({type:'tab',text:'\t',...(format??{})});
  else if(tag==='w:br'||tag==='w:cr')runs.push({type:'break',text:'\n',...(format??{})});
  else if(Array.isArray(value))runs.push(...paragraphRuns(value,format));
 }
 return runs;
}
function alpha(value:number,upper=false){let result='';for(let n=Math.max(1,value);n>0;n=Math.floor((n-1)/26))result=String.fromCharCode(97+(n-1)%26)+result;return upper?result.toUpperCase():result;}
function roman(value:number){const pairs:[[number,string],...Array<[number,string]>]=[[1000,'M'],[900,'CM'],[500,'D'],[400,'CD'],[100,'C'],[90,'XC'],[50,'L'],[40,'XL'],[10,'X'],[9,'IX'],[5,'V'],[4,'IV'],[1,'I']];let n=value,result='';for(const [amount,glyph] of pairs)while(n>=amount){result+=glyph;n-=amount;}return result;}
function formattedCounter(value:number,format:string|null){if(format==='lowerLetter')return alpha(value);if(format==='upperLetter')return alpha(value,true);if(format==='lowerRoman')return roman(value).toLowerCase();if(format==='upperRoman')return roman(value);return String(value);}
function numberingContext(xml:string):NumberingContext{
 const abstract=new Map<string,Map<number,NumberLevel>>();
 for(const match of xml.matchAll(/<w:abstractNum\b[^>]*w:abstractNumId="([^"]+)"[^>]*>([\s\S]*?)<\/w:abstractNum>/g)){
  const levels=new Map<number,NumberLevel>();
  for(const level of match[2].matchAll(/<w:lvl\b[^>]*w:ilvl="(\d+)"[^>]*>([\s\S]*?)<\/w:lvl>/g)){
   const pick=(tag:string)=>level[2].match(new RegExp(`<w:${tag}\\b[^>]*w:val="([^"]*)"`))?.[1]??null;
   levels.set(Number(level[1]),{format:pick('numFmt'),levelText:pick('lvlText'),start:nullableNumber(pick('start')??undefined)});
  }
  abstract.set(match[1],levels);
 }
 const levels=new Map<string,Map<number,NumberLevel>>();
 for(const match of xml.matchAll(/<w:num\b[^>]*w:numId="([^"]+)"[^>]*>([\s\S]*?)<\/w:num>/g)){
  const abstractId=match[2].match(/<w:abstractNumId\b[^>]*w:val="([^"]+)"/)?.[1];
  if(abstractId&&abstract.has(abstractId))levels.set(match[1],abstract.get(abstractId)!);
 }
 return {levels,counters:new Map()};
}
function paragraphLayout(p:XmlNode[],numbers:NumberingContext):ParagraphLayout{
 const pPr=getNodeContents(p,'w:pPr')[0]??[];const ind=findTagAttributes(pPr,'w:ind')??{};const spacing=findTagAttributes(pPr,'w:spacing')??{};
 const numPr=getNodeContents(pPr,'w:numPr')[0]??[];const numId=findTagAttributes(numPr,'w:numId')?.['@_w:val'];const level=Number(findTagAttributes(numPr,'w:ilvl')?.['@_w:val']??0);
 let numbering:ParagraphNumbering|null=null;
 if(numId!==undefined){
  const definition=numbers.levels.get(numId)?.get(level)??{format:null,levelText:null,start:1};const counters=numbers.counters.get(numId)??[];
  counters[level]=(counters[level]??((definition.start??1)-1))+1;counters.length=level+1;numbers.counters.set(numId,counters);
  const marker=definition.levelText?.replace(/%(\d)/g,(_,raw)=>{const index=Number(raw)-1;const def=numbers.levels.get(numId)?.get(index);return formattedCounter(counters[index]??def?.start??1,def?.format??null);})??null;
  numbering={numId,level,format:definition.format,levelText:definition.levelText,start:definition.start,marker};
 }
 return {styleId:findTagAttributes(pPr,'w:pStyle')?.['@_w:val']??null,alignment:findTagAttributes(pPr,'w:jc')?.['@_w:val']??null,
  indentation:{leftTwips:nullableNumber(ind['@_w:left']??ind['@_w:start']),rightTwips:nullableNumber(ind['@_w:right']??ind['@_w:end']),firstLineTwips:nullableNumber(ind['@_w:firstLine']),hangingTwips:nullableNumber(ind['@_w:hanging'])},
  spacing:{beforeTwips:nullableNumber(spacing['@_w:before']),afterTwips:nullableNumber(spacing['@_w:after']),line:nullableNumber(spacing['@_w:line']),lineRule:spacing['@_w:lineRule']??null},
  numbering,keepNext:hasTag(pPr,'w:keepNext'),pageBreakBefore:hasTag(pPr,'w:pageBreakBefore')};
}
function checkboxMarks(nodes:XmlNode[]):CheckboxMark[] {
  const marks:CheckboxMark[]=[];
  for(const node of nodes){
    for(const [tag,value] of Object.entries(node)){
      if(tag===':@')continue;
      if(tag==='w:sym'){
        const attrs=(node[':@']??{}) as Record<string,string>;
        const code=(attrs['@_w:char']??'').toUpperCase();
        const font=attrs['@_w:font']??'';
        // Word stores checkbox glyphs as font-specific symbol codes. In
        // Wingdings 2, P (F050) is a check mark and R (F052) is a checked box.
        const state=code==='F050'||code==='F052'||code==='F0FE'||code==='F0FC'||code==='2611'||code==='2612'||code==='2713'||code==='2714'
          ? 'checked' : code==='F0A8'||code==='2610' ? 'unchecked' : 'unknown';
        marks.push({state,code,font});
      } else if(tag==='w14:checked'){
        const attrs=(node[':@']??{}) as Record<string,string>;
        const raw=attrs['@_w14:val']??attrs['@_w:val']??'';
        marks.push({state:booleanState(raw),code:raw,font:'OOXML-content-control'});
      } else if(tag==='w:checkBox'&&Array.isArray(value)){
        // Legacy Word form fields store their state under w:ffData/w:checkBox.
        const raw=nestedAttribute(value,new Set(['w:checked','w:default']))??'';
        marks.push({state:booleanState(raw),code:raw,font:'OOXML-legacy-form-field'});
      } else if(Array.isArray(value)) marks.push(...checkboxMarks(value));
    }
  }
  return marks;
}
function relationshipIds(nodes:XmlNode[]):string[] {
  const ids:string[]=[];
  for(const node of nodes){
    const attrs=(node[':@']??{}) as Record<string,string>;
    const id=attrs['@_r:embed']??attrs['@_r:link'];
    if(id&&!ids.includes(id))ids.push(id);
    for(const [tag,value] of Object.entries(node))if(tag!==':@'&&Array.isArray(value))ids.push(...relationshipIds(value).filter(item=>!ids.includes(item)));
  }
  return ids;
}
function paraInfo(p:XmlNode[],imageByRelationship:Map<string,ImageEvidence>=new Map(),numbers:NumberingContext={levels:new Map(),counters:new Map()}):ParagraphInfo {
  const text=inlineText(p).replace(/\u00a0/g,' ').normalize('NFC').trim();
  const checkboxes=checkboxMarks(p);
  // Pasted Unicode checkboxes and radio buttons have no OOXML state metadata.
  if(!checkboxes.length){
    const match=text.match(/^\s*(?:[-–—•·]\s*)?([☑☒✓✔✅✗✘■●◉⦿☐□▢⬜○◯])/u);
    const mark=match?.[1];
    if(mark&&checkedTextMarks.has(mark))checkboxes.push({state:'checked',code:mark,font:'Unicode'});
    else if(mark&&uncheckedTextMarks.has(mark))checkboxes.push({state:'unchecked',code:mark,font:'Unicode'});
  }
  const images=relationshipIds(p).map(id=>imageByRelationship.get(id)).filter((item):item is ImageEvidence=>Boolean(item));
  const runs=paragraphRuns(p);const symbols=runs.filter(run=>run.type==='symbol').map(run=>({code:run.symbolCode??'',font:run.symbolFont??'',text:run.text}));
  return {text,checkboxes,images,runs,symbols,layout:paragraphLayout(p,numbers)};
}
function para(p:XmlNode[]):string { return paraInfo(p).text; }
function classifyTable(rows:string[][]):TableClassification {
 const firstRows=rows.slice(0,4).flat().join(' ').replace(/\s+/g,' ').trim();
 const allText=rows.flat().join(' ').replace(/\s+/g,' ').trim();
 const scheduleActivity=/(?:กิจกรรม(?:วิจัย)?|task|activit)/iu.test(firstRows);
 const schedulePeriod=/(?:ระยะเวลา|เดือนที่|ผู้รับผิดชอบ|period|month|responsible)/iu.test(firstRows);
 if(scheduleActivity&&schedulePeriod)return {kind:'schedule',confidence:'high',reason:'หัวตารางมีทั้งกิจกรรมและช่วงเวลา'};
 if(scheduleActivity)return {kind:'schedule',confidence:'medium',reason:'พบหัวตารางกิจกรรม'};
 const budgetDescription=/(?:รายการค่าใช้จ่าย|งบดำเนินงาน|หมวดค่าตอบแทน|expense list|research budget|compensation)/iu.test(firstRows);
 const budgetAmount=/(?:จำนวนเงิน|บาท|amount|baht)/iu.test(firstRows);
 if(budgetDescription&&budgetAmount)return {kind:'budget',confidence:'high',reason:'หัวตารางมีรายการค่าใช้จ่ายและจำนวนเงิน'};
 if(budgetDescription||budgetAmount)return {kind:'budget',confidence:'medium',reason:'พบคำที่เกี่ยวข้องกับงบประมาณ'};
 const biographyYear=/(?:^|\s)(?:year|พ\.?ศ\.?|ค\.?ศ\.?)\b/iu.test(firstRows);
 const biographyPosition=/(?:position|ตำแหน่ง|working experience|ประวัติการทำงาน)/iu.test(allText);
 if(biographyYear&&biographyPosition)return {kind:'biography',confidence:'high',reason:'หัวตารางมีปีและตำแหน่งงาน'};
 return {kind:'unknown',confidence:'low',reason:'ไม่ตรงกับตารางมาตรฐานที่ระบบรู้จัก'};
}
function table(node:XmlNode[],imageByRelationship:Map<string,ImageEvidence>=new Map(),numbers:NumberingContext={levels:new Map(),counters:new Map()}):SourceTable {
  const rows:string[][]=[];const structuredRows:SourceTableRow[]=[];
  for(const tr of getNodeContents(node,'w:tr')){
    const cells:string[]=[];const structuredCells:SourceTableCell[]=[];
    for(const tc of getNodeContents(tr,'w:tc')){
       const infos=getNodeContents(tc,'w:p').map(p=>paraInfo(p,imageByRelationship,numbers));
      const text=infos.map(info=>info.text).filter(Boolean).join('\n');
      const gridSpan=Number(findTagAttributes(tc,'w:gridSpan')?.['@_w:val']??1);
      const vMergeAttrs=findTagAttributes(tc,'w:vMerge');
      const verticalMerge=vMergeAttrs===null?null:(vMergeAttrs['@_w:val']==='restart'?'restart':'continue');
      const width=Number(findTagAttributes(tc,'w:tcW')?.['@_w:w']);
      const cell:SourceTableCell={
       text,columnSpan:Number.isFinite(gridSpan)&&gridSpan>0?gridSpan:1,verticalMerge,
       widthTwips:Number.isFinite(width)?width:null,
        checkboxes:infos.flatMap(info=>info.checkboxes),images:infos.flatMap(info=>info.images),paragraphs:infos
      };
      cells.push(text);structuredCells.push(cell);
    }
    if(cells.length){rows.push(cells);structuredRows.push({cells:structuredCells});}
  }
  return {rows,structuredRows,classification:classifyTable(rows)};
}
function collectParagraphNodes(value:any,out:XmlNode[][]=[]):XmlNode[][] {
 if(Array.isArray(value)){for(const item of value)collectParagraphNodes(item,out);return out;}
 if(!value||typeof value!=='object')return out;
 for(const [tag,child] of Object.entries(value)){
  if(tag==='w:p'&&Array.isArray(child))out.push(child as XmlNode[]);
  else if(tag!==':@')collectParagraphNodes(child,out);
 }
 return out;
}
export async function readDocx(data: Buffer):Promise<DocContent> {
  const zip=await JSZip.loadAsync(data,{checkCRC32:true});
  const entry=zip.file('word/document.xml');
  if(!entry) throw new Error('ไม่พบ word/document.xml: ไฟล์นี้อาจไม่ใช่ DOCX');
  const xml=await entry.async('string');
  if(xml.length>15_000_000) throw new Error('เอกสารมี XML ใหญ่เกินขีดจำกัด PoC');
  const doc=parser.parse(xml) as XmlNode[];
  const docNode=doc.find(n=>n['w:document']);
  if(!docNode) throw new Error('DOCX XML ไม่ถูกต้อง');
  const body=getNodeContents(docNode['w:document'],'w:body')[0]??[];
  const relationshipsXml=await zip.file('word/_rels/document.xml.rels')?.async('string');
  const contentTypesXml=await zip.file('[Content_Types].xml')?.async('string');
  const numberingXml=await zip.file('word/numbering.xml')?.async('string')??'';
  const numbers=numberingContext(numberingXml);
  const contentTypeByExtension=new Map<string,string>();
  for(const match of contentTypesXml?.matchAll(/<Default\s+[^>]*Extension="([^"]+)"[^>]*ContentType="([^"]+)"/g)??[])contentTypeByExtension.set(match[1].toLowerCase(),match[2]);
  const imageByRelationship=new Map<string,ImageEvidence>();
  for(const match of relationshipsXml?.matchAll(/<Relationship\s+[^>]*Id="([^"]+)"[^>]*Type="[^"]+\/image"[^>]*Target="([^"]+)"/g)??[]){
    const [,relationshipId,target]=match;
    const normalized=('word/'+target).replace(/\\/g,'/').replace('/../','/');
    const file=zip.file(normalized);
    if(!file)continue;
    const bytes=await file.async('uint8array');
    const extension=normalized.split('.').pop()?.toLowerCase()??'';
    imageByRelationship.set(relationshipId,{id:`image-${imageByRelationship.size+1}`,relationshipId,path:normalized,contentType:contentTypeByExtension.get(extension)??`image/${extension||'unknown'}`,size:bytes.byteLength,dataBase64:Buffer.from(bytes).toString('base64')});
  }
  const blocks:DocBlock[]=[];
  const blockCheckboxes:CheckboxMark[][]=[];
  const blockImages:ImageEvidence[][]=[];
  const paragraphDetails:ParagraphInfo[]=[];
  for(const n of body){
    if(n['w:p']) {const info=paraInfo(n['w:p'],imageByRelationship,numbers);if(info.text||info.images.length||info.runs.length) {blocks.push({type:'paragraph',text:info.text,paragraph:info,images:info.images,checkboxes:info.checkboxes});blockCheckboxes.push(info.checkboxes);blockImages.push(info.images);paragraphDetails.push(info);}}
    if(n['w:tbl']) {
      const tableEvidence=table(n['w:tbl'],imageByRelationship,numbers);
      const rows=tableEvidence.rows;
      const infos=tableEvidence.structuredRows.flatMap(row=>row.cells.flatMap(cell=>cell.paragraphs??[]));
      const tableMarks=infos.flatMap(info=>info.checkboxes);const images=infos.flatMap(info=>info.images);
      paragraphDetails.push(...infos.filter(info=>info.text||info.images.length||info.runs.length));
      if(rows.length){blocks.push({type:'table',rows,table:tableEvidence,images,checkboxes:tableMarks});blockCheckboxes.push(tableMarks);blockImages.push(images);}
    }
  }
  const paragraphs=paragraphDetails.map(x=>x.text);
  const tables=blocks.filter(x=>x.type==='table').map(x=>x.rows);
  let paragraphIndex=0,tableIndex=0;
  const sourceBlocks:SourceDocumentBlock[]=blocks.map((block,index)=>{
    if(block.type==='table')return {id:`table-${++tableIndex}`,index,type:'table',rows:block.rows,table:block.table??{rows:block.rows,structuredRows:block.rows.map(row=>({cells:row.map(text=>({text,columnSpan:1,verticalMerge:null,widthTwips:null,checkboxes:[],images:[]}))})),classification:classifyTable(block.rows)},checkboxes:blockCheckboxes[index]??[],images:blockImages[index]??[]};
    paragraphIndex++;
    return {id:`paragraph-${paragraphIndex}`,index,type:'paragraph',text:block.text,paragraph:block.paragraph,checkboxes:blockCheckboxes[index]??[],images:blockImages[index]??[]};
  });
  const sourceDocument:SourceDocumentJson={
    version:2,
    sourceType:'docx',
    text:blocks.map(block=>block.type==='paragraph'?block.text:block.rows.map(row=>row.join('\t')).join('\n')).join('\n'),
    blocks:sourceBlocks,
    tables:sourceBlocks.filter((block):block is Extract<SourceDocumentBlock,{type:'table'}>=>block.type==='table').map(block=>block.table),
    images:[...imageByRelationship.values()],
    stats:{paragraphs:paragraphDetails.length,tables:tables.length,checkboxes:paragraphDetails.reduce((sum,item)=>sum+item.checkboxes.length,0),images:imageByRelationship.size}
  };
  return {blocks,paragraphs,paragraphDetails,tables,sourceDocument};
}

export async function readLegacyDoc(data: Buffer):Promise<DocContent> {
  const extractor=new WordExtractor();
  const document=await extractor.extract(data);
  const body=document.getBody().replace(/\r/g,'');
  const paragraphs=body.split(/\n+/).map((text:string)=>text.trim()).filter(Boolean);
  const emptyLayout:ParagraphLayout={styleId:null,alignment:null,indentation:{leftTwips:null,rightTwips:null,firstLineTwips:null,hangingTwips:null},spacing:{beforeTwips:null,afterTwips:null,line:null,lineRule:null},numbering:null,keepNext:false,pageBreakBefore:false};
  const paragraphDetails=paragraphs.map((text:string):ParagraphInfo=>({text,checkboxes:[],images:[],runs:[{type:'text',text}],symbols:[],layout:emptyLayout}));
  const blocks=paragraphs.map((text:string)=>({type:'paragraph' as const,text}));
  return {
    blocks,
    paragraphs,
    paragraphDetails,
    tables:[],
    sourceDocument:{version:2,sourceType:'doc',text:paragraphs.join('\n'),blocks:blocks.map((block,index)=>({id:`paragraph-${index+1}`,index,type:'paragraph',text:block.text,paragraph:paragraphDetails[index],checkboxes:[]})),stats:{paragraphs:paragraphs.length,tables:0,checkboxes:0}}
  };
}
