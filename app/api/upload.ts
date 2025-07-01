import { NextResponse } from 'next/server';
import { v2 as cloudinary } from 'cloudinary';
import formidable, { File as FormidableFile, Fields, Files } from 'formidable';
import { Readable } from 'stream';

cloudinary.config({
  cloud_name: 'dwngsjipv',
  api_key: '491443193989922',
  api_secret: 'dFaNR2wkqK96TTNPRoL_Z8KNpuc',
});

export const config = {
  api: {
    bodyParser: false,
  },
};

async function parseFormData(request: Request): Promise<{ fields: Fields; files: Files }> {
  const form = formidable();
  const buffers: Buffer[] = [];
  const reader = request.body?.getReader();
  if (!reader) throw new Error('No body found');
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    if (value) buffers.push(Buffer.from(value));
  }
  const buffer = Buffer.concat(buffers);

  return new Promise((resolve, reject) => {
    form.parse(
      // @ts-ignore
      Readable.from(buffer),
      (err, fields, files) => {
        if (err) reject(err);
        else resolve({ fields, files });
      }
    );
  });
}

export async function POST(request: Request) {
  try {
    const { fields, files } = await parseFormData(request);
    const file = Array.isArray(files.file) ? files.file[0] : files.file;
    if (!file) {
      return NextResponse.json({ error: 'No se envió ningún archivo.' }, { status: 400 });
    }
    const uploadResult = await cloudinary.uploader.upload((file as FormidableFile).filepath, {
      public_id: Array.isArray(fields.publicId) ? fields.publicId[0] : fields.publicId,
    });
    return NextResponse.json({ url: uploadResult.secure_url });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
} 