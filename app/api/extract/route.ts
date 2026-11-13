import {NextResponse} from 'next/server';
import {readDocx} from '../../../lib/docx';
import {runRs1Pipeline} from '../../../lib/rs1-pipeline';

export const runtime = 'nodejs';

const MAX_FILE_SIZE = 10 * 1024 * 1024;

function errorResponse(message: string, status: number) {
  return NextResponse.json({error: message}, {status,headers:{'Cache-Control':'no-store','X-Content-Type-Options':'nosniff'}});
}

export async function POST(request: Request) {
  try {
    const form = await request.formData();
    const entry = form.get('file');
    if (!(entry instanceof File)) return errorResponse('กรุณาเลือกไฟล์เอกสาร', 400);
    if (entry.size === 0) return errorResponse('ไฟล์เอกสารว่างเปล่า', 400);
    if (entry.size > MAX_FILE_SIZE) return errorResponse('ไฟล์มีขนาดเกิน 10 MB', 413);

    const filename = entry.name.toLowerCase();
    const data = Buffer.from(await entry.arrayBuffer());
    if (!filename.endsWith('.docx')) return errorResponse('รองรับเฉพาะไฟล์ .docx ที่ประมวลผลภายในระบบ', 415);
    const document = await readDocx(data);

    return NextResponse.json(runRs1Pipeline(document),{headers:{'Cache-Control':'no-store','X-Content-Type-Options':'nosniff'}});
  } catch (error) {
    const message = error instanceof Error ? error.message : 'ไม่สามารถอ่านเอกสารได้';
    return errorResponse(message, 422);
  }
}
