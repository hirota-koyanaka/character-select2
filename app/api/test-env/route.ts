import { NextResponse } from 'next/server'

export async function GET() {
  // 環境変数が正しく設定されているかチェック
  const envCheck = {
    GOOGLE_PROJECT_ID: !!process.env.GOOGLE_PROJECT_ID,
    GOOGLE_PRIVATE_KEY_ID: !!process.env.GOOGLE_PRIVATE_KEY_ID,
    GOOGLE_PRIVATE_KEY: !!process.env.GOOGLE_PRIVATE_KEY,
    GOOGLE_CLIENT_EMAIL: !!process.env.GOOGLE_CLIENT_EMAIL,
    GOOGLE_CLIENT_ID: !!process.env.GOOGLE_CLIENT_ID,
    GOOGLE_CLIENT_CERT_URL: !!process.env.GOOGLE_CLIENT_CERT_URL,
    SPREADSHEET_ID: !!process.env.SPREADSHEET_ID,
  }

  // 値の長さも確認（セキュリティのため値そのものは表示しない）
  const valueLengths = {
    GOOGLE_PROJECT_ID: process.env.GOOGLE_PROJECT_ID?.length || 0,
    GOOGLE_PRIVATE_KEY_ID: process.env.GOOGLE_PRIVATE_KEY_ID?.length || 0,
    GOOGLE_PRIVATE_KEY: process.env.GOOGLE_PRIVATE_KEY?.length || 0,
    GOOGLE_CLIENT_EMAIL: process.env.GOOGLE_CLIENT_EMAIL?.length || 0,
    GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID?.length || 0,
    GOOGLE_CLIENT_CERT_URL: process.env.GOOGLE_CLIENT_CERT_URL?.length || 0,
    SPREADSHEET_ID: process.env.SPREADSHEET_ID?.length || 0,
  }

  const allSet = Object.values(envCheck).every(v => v === true)

  return NextResponse.json({
    allEnvironmentVariablesSet: allSet,
    individualCheck: envCheck,
    valueLengths,
    message: allSet ? '全ての環境変数が設定されています' : '一部の環境変数が未設定です'
  })
}