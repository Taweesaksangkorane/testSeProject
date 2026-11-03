import {NextResponse} from 'next/server';
import {readDocx, readLegacyDoc} from '../../../lib/docx';
import {extractRs1} from '../../../lib/extract';
import {segmentRs1Sections} from '../../../lib/rs1-sections';

export const runtime = 'nodejs';

const MAX_FILE_SIZE = 10 * 1024 * 1024;

function errorResponse(message: string, status: number) {
  return NextResponse.json({error: message}, {status});
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
    if (!filename.endsWith('.docx') && !filename.endsWith('.doc')) return errorResponse('รองรับเฉพาะไฟล์ .doc และ .docx', 415);
    const document = filename.endsWith('.docx') ? await readDocx(data) : await readLegacyDoc(data);

    const extraction = extractRs1(document);
    const sectionMap = segmentRs1Sections(document);
    return NextResponse.json({...extraction, sectionMap});
  } catch (error) {
    const message = error instanceof Error ? error.message : 'ไม่สามารถอ่านเอกสารได้';
    return errorResponse(message, 422);
  }
}
