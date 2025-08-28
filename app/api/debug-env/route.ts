import { NextResponse } from 'next/server'

export async function GET() {
  // 環境変数の存在確認（値は表示しない）
  const envCheck = {
    GOOGLE_PROJECT_ID: !!process.env.GOOGLE_PROJECT_ID,
    GOOGLE_PRIVATE_KEY_ID: !!process.env.GOOGLE_PRIVATE_KEY_ID,
    GOOGLE_PRIVATE_KEY: !!process.env.GOOGLE_PRIVATE_KEY,
    GOOGLE_CLIENT_EMAIL: !!process.env.GOOGLE_CLIENT_EMAIL,
    GOOGLE_CLIENT_ID: !!process.env.GOOGLE_CLIENT_ID,
    GOOGLE_CLIENT_CERT_URL: !!process.env.GOOGLE_CLIENT_CERT_URL,
    SPREADSHEET_ID: !!process.env.SPREADSHEET_ID,
    // 秘密鍵の最初の数文字だけ確認（デバッグ用）
    PRIVATE_KEY_START: process.env.GOOGLE_PRIVATE_KEY?.substring(0, 30) || 'NOT SET',
    SPREADSHEET_ID_VALUE: process.env.SPREADSHEET_ID || 'NOT SET',
    CLIENT_EMAIL_VALUE: process.env.GOOGLE_CLIENT_EMAIL || 'NOT SET',
  }

  return NextResponse.json({ 
    message: '環境変数チェック',
    env: envCheck,
    timestamp: new Date().toISOString()
  })
}