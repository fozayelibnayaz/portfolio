import { NextRequest, NextResponse } from 'next/server';
import { timingSafeEqual, randomUUID } from 'node:crypto';
import fs from 'node:fs/promises';
import path from 'node:path';
import { uploadsDirectory } from '../../../lib/storage';
export const runtime='nodejs';
export async function POST(request:NextRequest){
 const required=process.env.CMS_PASSWORD;if(!required)return NextResponse.json({error:'CMS_PASSWORD is not configured.'},{status:503});
 const supplied=Buffer.from(request.headers.get('x-cms-password')||''),secret=Buffer.from(required);
 if(supplied.length!==secret.length||!timingSafeEqual(supplied,secret))return NextResponse.json({error:'Incorrect CMS password.'},{status:401});
 try{
   const form=await request.formData(),file=form.get('file');if(!(file instanceof File))return NextResponse.json({error:'Choose a file to upload.'},{status:400});
   const bytes=Buffer.from(await file.arrayBuffer());if(!bytes.length||bytes.length>12*1024*1024)return NextResponse.json({error:'Images must be under 4 MB; PDF files under 12 MB.'},{status:413});
   let ext='';const mime=file.type.toLowerCase();
   if(mime==='image/jpeg'&&bytes[0]===0xff&&bytes[1]===0xd8&&bytes[2]===0xff)ext='jpg';
   else if(mime==='image/png'&&bytes.subarray(0,8).equals(Buffer.from([137,80,78,71,13,10,26,10])))ext='png';
   else if(mime==='image/webp'&&bytes.toString('ascii',0,4)==='RIFF'&&bytes.toString('ascii',8,12)==='WEBP')ext='webp';
   else if(mime==='application/pdf'&&bytes.toString('ascii',0,5)==='%PDF-')ext='pdf';
   else return NextResponse.json({error:'Supported uploads: verified JPEG, PNG, WebP images or PDF documents.'},{status:415});
   if(ext!=='pdf'&&bytes.length>4*1024*1024)return NextResponse.json({error:'Image uploads must be 4 MB or smaller.'},{status:413});
   const directory=uploadsDirectory();await fs.mkdir(directory,{recursive:true});const filename=`${randomUUID()}.${ext}`;await fs.writeFile(path.join(/*turbopackIgnore: true*/ directory,filename),bytes,{flag:'wx'});
   return NextResponse.json({url:`/uploads/${filename}`,name:file.name,size:bytes.length});
 }catch{return NextResponse.json({error:'Upload failed. Please try a smaller file.'},{status:400})}
}
