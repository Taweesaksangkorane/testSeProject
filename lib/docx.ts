import JSZip from 'jszip';
import { XMLParser } from 'fast-xml-parser';

export type DocBlock = { type: 'paragraph'; text: string } | {type:'table'; rows: string[][]};
export type CheckboxMark = {state:'checked'|'unchecked'|'unknown'; code:string; font:string};
export type ParagraphInfo = {text:string; checkboxes:CheckboxMark[]};
export type DocContent = {blocks:DocBlock[]; paragraphs:string[]; paragraphDetails:ParagraphInfo[]; tables:string[][][]};
// preserveOrder keeps adjacent w:t fragments in their original XML order.
// Important for Thai combining marks spread across Word runs.
type XmlNode = Record<string, any>;
const parser = new XMLParser({preserveOrder:true, ignoreAttributes:false, trimValues:false, processEntities:true});
function getNodeContents(list:XmlNode[], tag:string):XmlNode[][] {
  const found:XmlNode[][]=[];
  for(const node of list){ if(Array.isArray(node[tag])) found.push(node[tag]); }
  return found;
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
function checkboxMarks(nodes:XmlNode[]):CheckboxMark[] {
  const marks:CheckboxMark[]=[];
  for(const node of nodes){
    for(const [tag,value] of Object.entries(node)){
      if(tag===':@')continue;
      if(tag==='w:sym'){
        const attrs=(node[':@']??{}) as Record<string,string>;
        const code=(attrs['@_w:char']??'').toUpperCase();
        const font=attrs['@_w:font']??'';
        const state=code==='F0FE'||code==='F0FC'||code==='2611'||code==='2612'||code==='2713'||code==='2714'
          ? 'checked' : code==='F0A8'||code==='2610' ? 'unchecked' : 'unknown';
        marks.push({state,code,font});
      } else if(Array.isArray(value)) marks.push(...checkboxMarks(value));
    }
  }
  return marks;
}
function paraInfo(p:XmlNode[]):ParagraphInfo {
  return {text:inlineText(p).replace(/\u00a0/g,' ').trim(),checkboxes:checkboxMarks(p)};
}
function para(p:XmlNode[]):string { return paraInfo(p).text; }
function table(node:XmlNode[]):string[][] {
  const rows:string[][]=[];
  for(const tr of getNodeContents(node,'w:tr')){
    const cells:string[]=[];
    for(const tc of getNodeContents(tr,'w:tc')){
      const texts=getNodeContents(tc,'w:p').map(para).filter(Boolean);
      cells.push(texts.join('\n'));
    }
    if(cells.length) rows.push(cells);
  }
  return rows;
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
  const blocks:DocBlock[]=[];
  const paragraphDetails:ParagraphInfo[]=[];
  for(const n of body){
    if(n['w:p']) {const info=paraInfo(n['w:p']);if(info.text) {blocks.push({type:'paragraph',text:info.text});paragraphDetails.push(info);}}
    if(n['w:tbl']) {
      const rows=table(n['w:tbl']);
      for(const p of collectParagraphNodes(n['w:tbl'])){
        const info=paraInfo(p);
        if(info.text) paragraphDetails.push(info);
      }
      if(rows.length) blocks.push({type:'table',rows});
    }
  }
  return {blocks, paragraphs:paragraphDetails.map(x=>x.text), paragraphDetails, tables:blocks.filter(x=>x.type==='table').map(x=>x.rows)};
}
