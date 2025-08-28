import { google } from 'googleapis'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    // Google Sheets APIの認証設定
    const auth = new google.auth.GoogleAuth({
      credentials: {
        type: 'service_account',
        project_id: process.env.GOOGLE_PROJECT_ID,
        private_key_id: process.env.GOOGLE_PRIVATE_KEY_ID,
        private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
        client_email: process.env.GOOGLE_CLIENT_EMAIL,
        client_id: process.env.GOOGLE_CLIENT_ID,
        auth_uri: 'https://accounts.google.com/o/oauth2/auth',
        token_uri: 'https://oauth2.googleapis.com/token',
        auth_provider_x509_cert_url: 'https://www.googleapis.com/oauth2/v1/certs',
        client_x509_cert_url: process.env.GOOGLE_CLIENT_CERT_URL,
      },
      scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'],
    })

    const sheets = google.sheets({ version: 'v4', auth })
    
    // スプレッドシートIDと範囲を指定
    const spreadsheetId = process.env.SPREADSHEET_ID || ''
    const range = 'A:B' // A列:キャラクター名、B列:チェックボックス
    
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range,
    })

    const rows = response.data.values || []
    
    // データを整形 (character1〜character24のチェック状態)
    const characterStatus: Record<string, boolean> = {}
    
    rows.forEach((row, index) => {
      if (index > 0 && index <= 24) { // ヘッダーをスキップ、1-24のキャラクターのみ
        const characterKey = `character${index}`
        // チェックボックスの値（TRUE/FALSE）を判定
        characterStatus[characterKey] = row[1] === 'TRUE' || row[1] === true
      }
    })

    return NextResponse.json({ status: characterStatus })
  } catch (error) {
    console.error('Google Sheets API エラー:', error)
    return NextResponse.json(
      { error: 'データの取得に失敗しました' },
      { status: 500 }
    )
  }
}