import { google } from 'googleapis'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    let auth;
    
    // オプション1: Base64エンコードされたJSONキーを使用
    if (process.env.GOOGLE_SERVICE_ACCOUNT_KEY_BASE64) {
      console.log('Using Base64 encoded service account key');
      try {
        const decoded = Buffer.from(process.env.GOOGLE_SERVICE_ACCOUNT_KEY_BASE64, 'base64').toString('utf-8');
        const serviceAccountKey = JSON.parse(decoded);
        
        auth = new google.auth.GoogleAuth({
          credentials: serviceAccountKey,
          scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'],
        });
      } catch (e) {
        console.error('Failed to decode Base64 key:', e);
        throw new Error('Invalid Base64 encoded service account key');
      }
    } 
    // オプション2: 個別の環境変数を使用（現在の方法）
    else if (process.env.GOOGLE_PRIVATE_KEY) {
      console.log('Using individual environment variables');

    // 秘密鍵の処理を改善
    let privateKey = process.env.GOOGLE_PRIVATE_KEY || '';
    
    // デバッグ: 環境変数の最初の100文字を確認
    console.log('Raw GOOGLE_PRIVATE_KEY (first 100 chars):', privateKey.substring(0, 100));
    console.log('Raw key includes \\n?:', privateKey.includes('\\n'));
    console.log('Raw key includes actual newline?:', privateKey.includes('\n'));
    
    // パターン1: ダブルクォートで囲まれている場合
    if (privateKey.startsWith('"') && privateKey.endsWith('"')) {
      console.log('Removing surrounding quotes');
      privateKey = privateKey.slice(1, -1);
    }
    
    // パターン2: \nがエスケープされている場合
    if (privateKey.includes('\\n')) {
      console.log('Replacing escaped newlines');
      privateKey = privateKey.replace(/\\n/g, '\n');
    }
    
    // パターン3: スペースで区切られている場合（Vercelの仕様）
    if (!privateKey.includes('\n') && privateKey.includes('-----BEGIN')) {
      console.log('Trying to fix space-separated key');
      // PEMフォーマットの各行は64文字
      const lines = [];
      let currentPos = 0;
      const keyContent = privateKey.replace('-----BEGIN PRIVATE KEY-----', '').replace('-----END PRIVATE KEY-----', '').trim();
      
      lines.push('-----BEGIN PRIVATE KEY-----');
      while (currentPos < keyContent.length) {
        lines.push(keyContent.substr(currentPos, 64));
        currentPos += 64;
      }
      lines.push('-----END PRIVATE KEY-----');
      privateKey = lines.join('\n');
    }
    
    console.log('秘密鍵の処理後:', {
      length: privateKey.length,
      hasNewlines: privateKey.includes('\n'),
      startsCorrectly: privateKey.startsWith('-----BEGIN'),
      endsCorrectly: privateKey.includes('-----END'),
      lineCount: privateKey.split('\n').length,
      first100: privateKey.substring(0, 100),
    });

      // Google Sheets APIの認証設定
      auth = new google.auth.GoogleAuth({
        credentials: {
          type: 'service_account',
          project_id: process.env.GOOGLE_PROJECT_ID,
          private_key_id: process.env.GOOGLE_PRIVATE_KEY_ID,
          private_key: privateKey,
          client_email: process.env.GOOGLE_CLIENT_EMAIL,
          client_id: process.env.GOOGLE_CLIENT_ID,
          auth_uri: 'https://accounts.google.com/o/oauth2/auth',
          token_uri: 'https://oauth2.googleapis.com/token',
          auth_provider_x509_cert_url: 'https://www.googleapis.com/oauth2/v1/certs',
          client_x509_cert_url: process.env.GOOGLE_CLIENT_CERT_URL,
        },
        scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'],
      });
    } else {
      throw new Error('No authentication credentials found. Set either GOOGLE_SERVICE_ACCOUNT_KEY_BASE64 or individual environment variables.');
    }

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