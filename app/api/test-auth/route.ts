import { google } from 'googleapis'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    console.log('Starting authentication test...');
    
    // すべての環境変数を確認
    const envCheck = {
      GOOGLE_PROJECT_ID: process.env.GOOGLE_PROJECT_ID || 'NOT SET',
      GOOGLE_PRIVATE_KEY_ID: process.env.GOOGLE_PRIVATE_KEY_ID || 'NOT SET',
      GOOGLE_CLIENT_EMAIL: process.env.GOOGLE_CLIENT_EMAIL || 'NOT SET',
      GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID || 'NOT SET',
      GOOGLE_CLIENT_CERT_URL: process.env.GOOGLE_CLIENT_CERT_URL || 'NOT SET',
      SPREADSHEET_ID: process.env.SPREADSHEET_ID || 'NOT SET',
    };
    
    console.log('Environment variables:', envCheck);
    
    // 秘密鍵は既に正しい形式
    const privateKey = process.env.GOOGLE_PRIVATE_KEY || '';
    
    const credentials = {
      type: 'service_account' as const,
      project_id: process.env.GOOGLE_PROJECT_ID || '',
      private_key_id: process.env.GOOGLE_PRIVATE_KEY_ID || '',
      private_key: privateKey,
      client_email: process.env.GOOGLE_CLIENT_EMAIL || '',
      client_id: process.env.GOOGLE_CLIENT_ID || '',
      auth_uri: 'https://accounts.google.com/o/oauth2/auth',
      token_uri: 'https://oauth2.googleapis.com/token',
      auth_provider_x509_cert_url: 'https://www.googleapis.com/oauth2/v1/certs',
      client_x509_cert_url: process.env.GOOGLE_CLIENT_CERT_URL || '',
      universe_domain: 'googleapis.com',
    };
    
    console.log('Creating GoogleAuth instance...');
    
    // Google Sheets APIの認証設定
    const auth = new google.auth.GoogleAuth({
      credentials,
      scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'],
    });
    
    console.log('Getting auth client...');
    
    // 認証クライアントを取得してテスト
    const authClient = await auth.getClient();
    
    console.log('Auth client created successfully');
    
    // スプレッドシートAPIを初期化
    const sheets = google.sheets({ version: 'v4', auth });
    
    // テスト読み取り
    const spreadsheetId = process.env.SPREADSHEET_ID || '';
    console.log('Testing spreadsheet access for ID:', spreadsheetId);
    
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: 'A1:B1', // 最小限の範囲でテスト
    });
    
    return NextResponse.json({
      success: true,
      message: 'Authentication successful!',
      data: response.data,
      envCheck,
    });
    
  } catch (error: any) {
    console.error('Authentication test failed:', error);
    
    // エラーの詳細を返す
    return NextResponse.json({
      success: false,
      error: error.message || 'Unknown error',
      errorType: error.constructor.name,
      errorStack: error.stack,
      errorDetails: error.errors || error.response?.data || null,
    }, { status: 500 });
  }
}