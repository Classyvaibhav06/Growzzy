import { NextResponse } from 'next/server'
import { S3Client, ListBucketsCommand, PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3'
import { requireRole } from '@/lib/api-helpers'
import { Role } from '@prisma/client'

export async function GET() {
  try {
    const s3 = new S3Client({
      region: process.env.AWS_REGION!,
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
      },
    })

    const bucket = process.env.AWS_S3_BUCKET!
    const testKey = `_test/connection-check-${Date.now()}.txt`

    // 1. Upload a tiny test file
    await s3.send(new PutObjectCommand({
      Bucket: bucket,
      Key: testKey,
      Body: 'Growwzzy S3 connection test OK',
      ContentType: 'text/plain',
    }))

    // 2. Delete it immediately (cleanup)
    await s3.send(new DeleteObjectCommand({ Bucket: bucket, Key: testKey }))

    return NextResponse.json({
      success: true,
      message: '✅ S3 connection is working perfectly!',
      config: {
        bucket,
        region: process.env.AWS_REGION,
      },
    })
  } catch (e: any) {
    console.error('[S3 Test Error]', e)
    return NextResponse.json({
      success: false,
      error: e?.message ?? 'S3 connection failed',
      hint: e?.Code === 'NoSuchBucket'
        ? 'Bucket not found. Check that AWS_S3_BUCKET matches your bucket name exactly.'
        : e?.Code === 'InvalidAccessKeyId'
        ? 'Invalid AWS Access Key ID. Double-check AWS_ACCESS_KEY_ID in .env.'
        : e?.Code === 'SignatureDoesNotMatch'
        ? 'Invalid AWS Secret Key. Double-check AWS_SECRET_ACCESS_KEY in .env.'
        : 'Check your AWS credentials and bucket region.',
    }, { status: 500 })
  }
}
