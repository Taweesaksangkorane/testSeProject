import type {SourceTable,TableKind} from './docx';

export type EditableSourceTable={
 id:string;kind:TableKind;confidence:'high'|'medium'|'low';reason:string;
 source:SourceTable;workingRows:string[][];changed:boolean;
};

function rectangularRows(table:SourceTable):string[][]{
 const expanded=table.structuredRows.map(row=>row.cells.flatMap(cell=>Array.from({length:Math.max(1,cell.columnSpan)},(_,index)=>index===0?cell.text:'')));
 const width=Math.max(1,...expanded.map(row=>row.length));
 return expanded.map(row=>Array.from({length:width},(_,index)=>row[index]??''));
}

export function createEditableTables(tables:SourceTable[]=[]):EditableSourceTable[]{
 return tables.map((source,index)=>({id:`source-table-${index+1}`,kind:source.classification.kind,confidence:source.classification.confidence,reason:source.classification.reason,source,workingRows:rectangularRows(source),changed:false}));
}

export function editTableCell(table:EditableSourceTable,row:number,column:number,value:string):EditableSourceTable{
 return {...table,changed:true,workingRows:table.workingRows.map((line,index)=>index===row?line.map((cell,cellIndex)=>cellIndex===column?value:cell):line)};
}

export function addTableRow(table:EditableSourceTable):EditableSourceTable{
 const width=Math.max(1,...table.workingRows.map(row=>row.length));
 return {...table,changed:true,workingRows:[...table.workingRows,Array.from({length:width},()=>'' )]};
}

export function deleteTableRow(table:EditableSourceTable,row:number):EditableSourceTable{
 return {...table,changed:true,workingRows:table.workingRows.filter((_,index)=>index!==row)};
}

export function addTableColumn(table:EditableSourceTable):EditableSourceTable{
 return {...table,changed:true,workingRows:table.workingRows.map(row=>[...row,''])};
}

export function deleteTableColumn(table:EditableSourceTable,column:number):EditableSourceTable{
 return {...table,changed:true,workingRows:table.workingRows.map(row=>row.filter((_,index)=>index!==column))};
}

export function resetEditableTable(table:EditableSourceTable):EditableSourceTable{
 return {...table,workingRows:rectangularRows(table.source),changed:false};
}
