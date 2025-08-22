import { NextRequest, NextResponse } from 'next/server'
import ImageKit from 'imagekit'
import { imageKitConfig } from '@/lib/imagekit'

const imagekit = new ImageKit({
  publicKey: imageKitConfig.publicKey,
  privateKey: imageKitConfig.privateKey,
  urlEndpoint: imageKitConfig.urlEndpoint,
})

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File
    const fileName = formData.get('fileName') as string
    const folder = formData.get('folder') as string || '/'

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      )
    }

    // Convert file to buffer
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    // Upload to ImageKit
    const uploadResponse = await imagekit.upload({
      file: buffer,
      fileName: fileName || file.name,
      folder: folder,
      useUniqueFileName: true,
    })

    return NextResponse.json({
      success: true,
      url: uploadResponse.url,
      fileId: uploadResponse.fileId,
      name: uploadResponse.name,
    })
  } catch (error) {
    console.error('Upload error:', error)
    return NextResponse.json(
      { error: 'Upload failed' },
      { status: 500 }
    )
  }
}