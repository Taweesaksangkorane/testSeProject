export const labeledDetails=(fields:ReadonlyArray<readonly [string,string]>)=>fields
 .filter(([,value])=>value.trim())
 .map(([label,value])=>`${label}: ${value.trim()}`)
 .join('\n');
