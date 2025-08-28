import { google } from 'googleapis'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    // 環境変数の確認
    console.log('環境変数チェック:', {
      hasProjectId: !!process.env.GOOGLE_PROJECT_ID,
      hasPrivateKeyId: !!process.env.GOOGLE_PRIVATE_KEY_ID,
      hasPrivateKey: !!process.env.GOOGLE_PRIVATE_KEY,
      hasClientEmail: !!process.env.GOOGLE_CLIENT_EMAIL,
      hasClientId: !!process.env.GOOGLE_CLIENT_ID,
      hasSpreadsheetId: !!process.env.SPREADSHEET_ID,
      privateKeyLength: process.env.GOOGLE_PRIVATE_KEY?.length || 0,
    })

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
    
    console.log('スプレッドシートID:', spreadsheetId)
    console.log('読み取り範囲:', range)
    
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range,
    })

    const rows = response.data.values || []
    
    console.log('取得したデータ行数:', rows.length)
    console.log('最初の5行:', rows.slice(0, 5))
    
    // データを整形 (character1〜character24のチェック状態)
    const characterStatus: Record<string, boolean> = {}
    
    rows.forEach((row, index) => {
      if (index > 0 && index <= 24) { // ヘッダーをスキップ、1-24のキャラクターのみ
        const characterKey = `character${index}`
        // チェックボックスの値（TRUE/FALSE）を判定
        characterStatus[characterKey] = row[1] === 'TRUE' || row[1] === true
        if (row[1] === 'TRUE' || row[1] === true) {
          console.log(`${characterKey} is checked`)
        }
      }
    })

    console.log('最終的なステータス:', characterStatus)
    
    return NextResponse.json({ status: characterStatus })
  } catch (error) {
    console.error('Google Sheets API エラー詳細:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
    })
    return NextResponse.json(
      { 
        error: 'データの取得に失敗しました',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}