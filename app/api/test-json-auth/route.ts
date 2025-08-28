import { google } from 'googleapis'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    // JSONキー全体を環境変数から取得する方法をテスト
    let auth;
    
    // オプション1: JSON文字列として環境変数を設定
    if (process.env.GOOGLE_SERVICE_ACCOUNT_KEY) {
      console.log('Using GOOGLE_SERVICE_ACCOUNT_KEY (JSON string)');
      
      try {
        const serviceAccountKey = JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_KEY);
        
        auth = new google.auth.GoogleAuth({
          credentials: serviceAccountKey,
          scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'],
        });
      } catch (e) {
        throw new Error(`Failed to parse GOOGLE_SERVICE_ACCOUNT_KEY: ${e}`);
      }
    } 
    // オプション2: Base64エンコードされたJSONとして設定
    else if (process.env.GOOGLE_SERVICE_ACCOUNT_KEY_BASE64) {
      console.log('Using GOOGLE_SERVICE_ACCOUNT_KEY_BASE64');
      
      try {
        const decoded = Buffer.from(process.env.GOOGLE_SERVICE_ACCOUNT_KEY_BASE64, 'base64').toString('utf-8');
        const serviceAccountKey = JSON.parse(decoded);
        
        auth = new google.auth.GoogleAuth({
          credentials: serviceAccountKey,
          scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'],
        });
      } catch (e) {
        throw new Error(`Failed to decode/parse GOOGLE_SERVICE_ACCOUNT_KEY_BASE64: ${e}`);
      }
    }
    // オプション3: 個別の環境変数から組み立て（現在の方法を改善）
    else {
      console.log('Using individual environment variables with fixed private key');
      
      // 秘密鍵の修正版
      let privateKey = process.env.GOOGLE_PRIVATE_KEY || '';
      
      // Vercel環境での追加処理
      // もし改行が正しくない場合、手動で修正
      if (privateKey && !privateKey.includes('-----BEGIN PRIVATE KEY-----\n')) {
        console.log('Fixing private key format');
        // ヘッダーとフッターを分離
        privateKey = privateKey
          .replace('-----BEGIN PRIVATE KEY-----', '')
          .replace('-----END PRIVATE KEY-----', '')
          .trim();
        
        // 64文字ごとに改行を挿入（PEM形式の標準）
        const chunks = [];
        for (let i = 0; i < privateKey.length; i += 64) {
          chunks.push(privateKey.substring(i, i + 64));
        }
        
        privateKey = `-----BEGIN PRIVATE KEY-----\n${chunks.join('\n')}\n-----END PRIVATE KEY-----\n`;
      }
      
      const credentials = {
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
      };
      
      auth = new google.auth.GoogleAuth({
        credentials,
        scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'],
      });
    }
    
    // 認証をテスト
    const authClient = await auth.getClient();
    console.log('Auth client created successfully');
    
    // スプレッドシートAPIを初期化
    const sheets = google.sheets({ version: 'v4', auth });
    
    // テスト読み取り
    const spreadsheetId = process.env.SPREADSHEET_ID || process.env.GOOGLE_SHEETS_SPREADSHEET_ID || '';
    console.log('Testing spreadsheet access for ID:', spreadsheetId);
    
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: 'A1:B5', // 最初の5行をテスト
    });
    
    return NextResponse.json({
      success: true,
      message: 'Authentication successful using JSON method!',
      authMethod: process.env.GOOGLE_SERVICE_ACCOUNT_KEY ? 'JSON' : 
                   process.env.GOOGLE_SERVICE_ACCOUNT_KEY_BASE64 ? 'Base64' : 
                   'Individual',
      data: response.data.values,
    });
    
  } catch (error: any) {
    console.error('JSON Auth test failed:', error);
    
    return NextResponse.json({
      success: false,
      error: error.message || 'Unknown error',
      suggestion: 'Try setting GOOGLE_SERVICE_ACCOUNT_KEY or GOOGLE_SERVICE_ACCOUNT_KEY_BASE64 environment variable',
    }, { status: 500 });
  }
}