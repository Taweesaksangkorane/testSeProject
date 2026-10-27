import {execFile} from 'node:child_process';
import {mkdtemp,readFile,rm,writeFile} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import path from 'node:path';
import {promisify} from 'node:util';
import {NextResponse} from 'next/server';

export const runtime='nodejs';
const run=promisify(execFile);
const MAX_SIZE=10*1024*1024;

export async function POST(request:Request){
 let working='';
 try{
  const data=await request.formData();const entry=data.get('file');
  if(!(entry instanceof File)||!entry.name.toLowerCase().endsWith('.docx'))return NextResponse.json({error:'ต้องใช้ไฟล์ DOCX ที่ระบบสร้างขึ้น'},{status:400});
  if(entry.size===0||entry.size>MAX_SIZE)return NextResponse.json({error:'ไฟล์ DOCX มีขนาดไม่ถูกต้อง'},{status:413});
  if(process.platform!=='win32')return NextResponse.json({error:'การแสดง PDF แบบตรงกับ Word ต้องรันบน Windows ที่ติดตั้ง Microsoft Word'},{status:501});
  working=await mkdtemp(path.join(tmpdir(),'rs1-pdf-'));const input=path.join(working,'input.docx'),output=path.join(working,'output.pdf');
  await writeFile(input,Buffer.from(await entry.arrayBuffer()));
  const powershell=path.join(process.env.SystemRoot??'C:\\Windows','System32','WindowsPowerShell','v1.0','powershell.exe');
  await run(powershell,['-NoProfile','-NonInteractive','-ExecutionPolicy','Bypass','-File',path.join(process.cwd(),'scripts','convert-docx-to-pdf.ps1'),'-InputPath',input,'-OutputPath',output],{timeout:120000,windowsHide:true});
  const pdf=await readFile(output);const body=pdf.buffer.slice(pdf.byteOffset,pdf.byteOffset+pdf.byteLength) as ArrayBuffer;
  return new NextResponse(body,{headers:{'Content-Type':'application/pdf','Content-Disposition':'inline; filename="RS-1-preview.pdf"','Cache-Control':'no-store'}});
 }catch(error){return NextResponse.json({error:error instanceof Error?error.message:'สร้าง PDF ไม่สำเร็จ'},{status:500})}
 finally{if(working)await rm(working,{recursive:true,force:true}).catch(()=>{})}
}
