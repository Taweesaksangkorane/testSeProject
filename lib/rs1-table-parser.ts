/**
 * Private, deterministic RS-1 table interpretation.
 * This code uses the table's own content rather than fixed column offsets.
 * Intended to be called only on a table already assigned to section A:12 or A:17.
 */
export type Mark = {state: 'checked' | 'unchecked' | 'unknown'; code?: string; font?: string};
export type InputCell = {text: string; columnSpan?: number; verticalMerge?: 'restart' | 'continue' | null; checkboxes?: Mark[]};
export type InputTable = {rows: string[][]; structuredRows?: {cells: InputCell[]}[]};
export type LogicalCell = {text: string; marks: Mark[]; sourceColumn: number; continuation: boolean};
export type LogicalGrid = LogicalCell[][];
export type ScheduleActivity = {activity: string; period: string | null; months: string[]; uncertainMonths: string[]; responsible: string | null; sourceRow: number};
export type BudgetLine = {category: string; description: string; quantity: string; amount: number | null; sourceRow: number};
export type ParsedRows<T> = {items: T[]; warnings: string[]; unmappedRows: number[]};

const norm = (v: string = '') => v.normalize('NFC').replace(/\u00a0/g, ' ').replace(/\s+/gu, ' ').trim();
const nonBlank = (s: string) => Boolean(norm(s) && !/^[.…_\s\-–—]+$/u.test(norm(s)));
const isHeaderLabel = (s: string) => /(?:กิจกรรม|รายการ|จำนวนเงิน|ราคา|งบประมาณ|ผู้รับผิดชอบ|เดือน|ระยะเวลา|task|period|amount|expense|description|category|quantity|unit|responsible|month|activity)/iu.test(s);
const isCategory = (s: string) => /^(?:(?:\d+[.)]\s*)?(?:หมวด|งบดำเนินงาน|งบลงทุน|ค่าตอบแทน|ค่าใช้สอย|วัสดุ|สาธารณูปโภค)|category\s*\d+\s*[:\-]|budget for)/iu.test(norm(s));
const isTotal = (s: string) => /(?:รวมงบประมาณ|ยอดรวม|รวมทั้งสิ้น|grand\s*total|total\s*budget|the\s*total\s*budget)/iu.test(norm(s));
const isPeriodHeading = (s: string) => /^(?:ระยะเวลา|ช่วงเวลา|period|duration|timeline|date(?:s)?)$/iu.test(norm(s));
const isActivityHeading = (s: string) => /(?:กิจกรรม(?:วิจัย)?|รายการกิจกรรม|task|activit|work\s*item)/iu.test(norm(s));
const isResponsibleHeading = (s: string) => /(?:ผู้รับผิดชอบ|responsible|person\s*in\s*charge|owner)/iu.test(norm(s));
const isAmountHeading = (s: string) => /(?:จำนวนเงิน|ยอดเงิน|จำนวน\s*\(?บาท|ราคา|cost|amount|total\s*\(?thb|บาท|baht|price)/iu.test(norm(s));
const isDescriptionHeading = (s: string) => /(?:รายการค่าใช้จ่าย|ชื่อรายการ|รายละเอียด|รายการ|item|description|expense\s*list|particulars?)/iu.test(norm(s));
const isQuantityHeading = (s: string) => /^(?:จำนวน|จำนวน\s*\(?หน่วย|จำนวนหน่วย|ปริมาณ|จำนวนครั้ง|ตัวคูณ|quantity|qty|units?|rate|multipliers?)$/iu.test(norm(s));
const numberMonth = (s: string) => /^(?:\d{1,2}|ม\.?(?:ค|ย)\.?|ก\.?พ\.?|มี\.?ค\.?|เม\.?ย\.?|พ\.?ค\.?|มิ\.?ย\.?|ก\.?ค\.?|ส\.?ค\.?|ก\.?ย\.?|ต\.?ค\.?|พ\.?ย\.?|ธ\.?ค\.?|jan(?:uary)?|feb(?:ruary)?|mar(?:ch)?|apr(?:il)?|may|jun(?:e)?|jul(?:y)?|aug(?:ust)?|sep(?:tember)?|oct(?:ober)?|nov(?:ember)?|dec(?:ember)?)$/iu.test(norm(s));
const markInText = (s: string) => /^(?:[✓✔☑☒●■\u221a\u2713\u2714]|[xX])$/u.test(norm(s));
const cleanActivity = (s: string) => norm(s).replace(/^\d{1,3}[.)]\s*/u, '').replace(/^[.…_\-\s]+|[.…_\-\s]+$/gu, '').trim();

/** Represent merged columns and vertically merged values at logical positions. */
export function logicalGrid(input: InputTable): LogicalGrid {
  const result: LogicalGrid = [];
  const carry = new Map<number, LogicalCell>();
  const maxWidth = Math.max(0, ...input.rows.map(r=>r.length), ...((input.structuredRows??[]).map(r=>r.cells.reduce((n,c)=>n+Math.max(1,c.columnSpan??1),0))));
  input.rows.forEach((strings, rowIndex) => {
    const source = input.structuredRows?.[rowIndex]?.cells ?? strings.map(text=>({text, columnSpan:1,verticalMerge:null,checkboxes:[]}));
    const line: LogicalCell[] = [];
    let col=0;
    for(let physical=0;physical<source.length;physical++){
      const cell=source[physical];
      const span=Math.max(1,cell.columnSpan??1);
      const text=norm(cell.text??'');
      for(let j=0;j<span;j++){
        const column=col+j;
        let out:LogicalCell={text,marks:cell.checkboxes??[],sourceColumn:physical,continuation:j>0};
        if(cell.verticalMerge==='continue') {
          const previous=carry.get(column);
          if(previous)out={...previous, continuation:true};
        }
        if(cell.verticalMerge==='restart')carry.set(column,out);
        else if(cell.verticalMerge!=='continue')carry.delete(column);
        line[column]=out;
      }
      col+=span;
    }
    // Optional empty values are important: don't shift subsequent columns.
    for(let i=0;i<Math.max(col,maxWidth);i++)if(!line[i])line[i]={text:'',marks:[],sourceColumn:i,continuation:false};
    result.push(line);
  });
  return result;
}
const cell=(r:LogicalCell[],i:number) => r[i]?.text??'';
const dataMarks=(r:LogicalCell[],i:number):{selected:boolean;uncertain:boolean} => {
  const m=r[i]?.marks??[];
  return {selected:m.some(v=>v.state==='checked')||markInText(cell(r,i)),uncertain:m.some(v=>v.state==='unknown')};
};
const dedupe = <T>(arr:T[]) => [...new Set(arr)];

function columnRoles(grid:LogicalGrid,kind:'schedule'|'budget'){
  const width=Math.max(0,...grid.map(r=>r.length));
  const head=grid.slice(0,Math.min(4,grid.length));
  const headerCandidates = head.map((row,index)=>({row,index,score:row.filter(c=>kind==='schedule'?
    isActivityHeading(c.text)||isPeriodHeading(c.text)||isResponsibleHeading(c.text)||numberMonth(c.text):
    isDescriptionHeading(c.text)||isAmountHeading(c.text)||isQuantityHeading(c.text)).length}));
  // A month-number row is generally better than the merged "Month 1-8" group above it.
  const top=headerCandidates.sort((a,b)=>b.score-a.score||b.index-a.index)[0];
  const index=top?.score?top.index:-1;
  const row=grid[index]??[];
  const candidate=(fn:(s:string)=>boolean)=>Array.from({length:width},(_,i)=>i).find(i=>fn(cell(row,i)) || (index>0&&fn(cell(grid[index-1],i))));
  return {index, row, width,
    activity:candidate(isActivityHeading), period:candidate(isPeriodHeading), responsible:candidate(isResponsibleHeading),
    amount:candidate(isAmountHeading),description:candidate(isDescriptionHeading),quantity:candidate(isQuantityHeading)};
}

export function interpretSchedule(table:InputTable):ParsedRows<ScheduleActivity>{
  const grid=logicalGrid(table), roles=columnRoles(grid,'schedule');
  const warnings:string[]=[], unmappedRows:number[]=[], items:ScheduleActivity[]=[];
  if(!grid.length)return {items,warnings:['ไม่พบแถวตาราง'],unmappedRows};
  let activityCol=roles.activity??0, responsibleCol=roles.responsible;
  // Some DOCX readers expose a short merged heading row as 3 cells while
  // the following row has 10 logical columns. The rightmost header stays rightmost.
  if(responsibleCol!==undefined && responsibleCol<roles.width-1){
    const shortHeader=table.rows.slice(0,3).find(r=>r.length<roles.width && isResponsibleHeading(r[r.length-1]??''));
    if(shortHeader)responsibleCol=roles.width-1;
  }
  const dataStart=roles.index<0?0:roles.index+1;
  // A two-column table is a Task/Period list, regardless of the column order.
  const listMode=roles.width<=2 && !grid.slice(dataStart).some(row=>row.some(c=>c.marks.length));
  if(listMode){
    const periodCol=roles.period??(activityCol===0?1:0);
    if(roles.period!==undefined && roles.activity===undefined)activityCol=periodCol===0?1:0;
    for(let ri=dataStart;ri<grid.length;ri++){
      const row=grid[ri],activity=cleanActivity(cell(row,activityCol)),period=norm(cell(row,periodCol));
      if(!nonBlank(activity)&&!nonBlank(period))continue;
      if(!nonBlank(activity)||isActivityHeading(activity)){unmappedRows.push(ri);continue;}
      items.push({activity,period:nonBlank(period)?period:null,months:[],uncertainMonths:[],responsible:null,sourceRow:ri});
      if(!nonBlank(period))warnings.push(`กิจกรรมแถว ${ri+1} ไม่มีช่วงเวลา`);
    }
    return {items,warnings:dedupe(warnings),unmappedRows};
  }
  // Month labels may be in a second row underneath a merged parent heading.
  let monthHeader=grid.findIndex((row,idx)=>idx<Math.min(5,grid.length)&&row.filter(c=>numberMonth(c.text)&&!c.continuation).length>=2);
  if(monthHeader<0)monthHeader=roles.index;
  const header=grid[monthHeader]??[];
  let monthCols:Array<{col:number;label:string}>=[];
  for(let i=0;i<roles.width;i++)if(i!==activityCol && i!==responsibleCol && numberMonth(cell(header,i)))monthCols.push({col:i,label:cell(header,i)});
  if(!monthCols.length){
    // Plain matrix with no readable month header: preserve column index, mark it uncertain.
    monthCols=Array.from({length:roles.width},(_,col)=>col).filter(col=>col!==activityCol&&col!==responsibleCol).map(col=>({col,label:String(col+1)}));
    warnings.push('ไม่พบชื่อเดือนในหัวตาราง ใช้ตำแหน่งคอลัมน์ชั่วคราว กรุณาตรวจสอบ');
  }
  for(let ri=Math.max(dataStart,monthHeader+1);ri<grid.length;ri++){
    const row=grid[ri],activity=cleanActivity(cell(row,activityCol));
    if(!nonBlank(activity)){
      if(row.some(c=>nonBlank(c.text)||c.marks.length))unmappedRows.push(ri);
      continue;
    }
    const months:string[]=[],uncertainMonths:string[]=[];
    for(const {col,label} of monthCols){const state=dataMarks(row,col);if(state.selected)months.push(label);else if(state.uncertain)uncertainMonths.push(label);}
    if(!months.length&&!uncertainMonths.length)warnings.push(`กิจกรรมแถว ${ri+1} ไม่พบเดือนที่เลือก`);
    const responsible=responsibleCol===undefined?null:norm(cell(row,responsibleCol))||null;
    items.push({activity,period:null,months,uncertainMonths,responsible,sourceRow:ri});
  }
  if(items.length===0)warnings.push('ไม่พบกิจกรรมวิจัยจากตาราง');
  return {items,warnings:dedupe(warnings),unmappedRows};
}

export function money(s:string):number|null{
  const compact=norm(s).replace(/\s*,\s*/g,',').replace(/,/g,'');
  // Only an entire monetary cell, never a number embedded in a description.
  const m=compact.match(/^\s*(?:฿\s*)?(\d+(?:\.\d{1,2})?)\s*(?:บาท|THB)?\s*$/iu);
  return m?Number(m[1]):null;
}

export function interpretBudget(table:InputTable):ParsedRows<BudgetLine>{
  const grid=logicalGrid(table), roles=columnRoles(grid,'budget');
  const warnings:string[]=[],unmappedRows:number[]=[],items:BudgetLine[]=[];
  if(!grid.length)return {items,warnings:['ไม่พบแถวตาราง'],unmappedRows};
  let amountCol=roles.amount,descriptionCol=roles.description;
  const dataStart=roles.index<0?0:roles.index+1;
  if(amountCol===undefined){
    let best=-1,score=-1;
    for(let c=0;c<roles.width;c++){
      const values=grid.slice(dataStart).map(r=>cell(r,c)).filter(nonBlank);
      const numbers=values.filter(x=>money(x)!==null).length;
      if(numbers>score){score=numbers;best=c;}
    }
    if(score>0)amountCol=best;
  }
  if(descriptionCol===undefined){
    // Prefer non-numeric, meaningful prose over a fixed leftmost column.
    const counts=Array.from({length:roles.width},(_,col)=>({col,score:grid.slice(dataStart).filter(r=>nonBlank(cell(r,col))&&money(cell(r,col))===null).length})).filter(x=>x.col!==amountCol).sort((a,b)=>b.score-a.score);
    descriptionCol=counts[0]?.col;
  }
  if(amountCol===undefined||descriptionCol===undefined){
    return {items,warnings:['ไม่สามารถระบุคอลัมน์รายการและจำนวนเงินได้'],unmappedRows:grid.map((_,i)=>i)};
  }
  let category='';
  for(let ri=dataStart;ri<grid.length;ri++){
    const row=grid[ri], cells=row.map(c=>norm(c.text)), textCells=cells.filter(nonBlank);
    if(textCells.length===0)continue;
    const description=norm(cell(row,descriptionCol));
    const rawAmount=cell(row,amountCol);
    const amount=money(rawAmount);
    if(textCells.some(isTotal))continue;
    const categoryText=textCells.find(isCategory);
    // A word such as "materials" may be either a category label or a real
    // line item. Treat it as a category only when the row has no item detail.
    if(categoryText && amount===null && (!nonBlank(description) || !nonBlank(roles.quantity===undefined?'':cell(row,roles.quantity)))){category=categoryText;continue;}
    if(!nonBlank(description) || isDescriptionHeading(description)){
      unmappedRows.push(ri);continue;
    }
    const other=cells.filter((v,col)=>col!==amountCol&&col!==descriptionCol && col!==roles.quantity && nonBlank(v));
    const quantity=roles.quantity!==undefined && roles.quantity!==descriptionCol && roles.quantity!==amountCol ? norm(cell(row,roles.quantity)) : other.join(' × ');
    if(amount===null&&rawAmount.trim())warnings.push(`จำนวนเงินแถว ${ri+1} อ่านไม่ได้`);
    if(amount===null&&!nonBlank(quantity)){
      // An unfilled official form may contain many budget item labels.
      // Keep these rows as raw/unmapped evidence, not confirmed extracted data.
      unmappedRows.push(ri);
      continue;
    }
    if(amount===null)warnings.push(`รายการแถว ${ri+1} ไม่มีจำนวนเงิน`);
    items.push({category,description,quantity,amount,sourceRow:ri});
  }
  if(!items.length)warnings.push('ไม่พบรายการงบประมาณ');
  return {items,warnings:dedupe(warnings),unmappedRows};
}
