import { NextResponse } from 'next/server'

export async function GET() {
  try {
    // 環境変数の詳細チェック
    const privateKey = process.env.GOOGLE_PRIVATE_KEY || '';
    
    // 秘密鍵の形式を詳細に調査
    const analysis = {
      exists: !!privateKey,
      length: privateKey.length,
      first50chars: privateKey.substring(0, 50),
      last50chars: privateKey.substring(privateKey.length - 50),
      hasLiteralNewline: privateKey.includes('\n'),
      hasEscapedNewline: privateKey.includes('\\n'),
      startsWithQuote: privateKey.startsWith('"'),
      endsWithQuote: privateKey.endsWith('"'),
      startsWithBegin: privateKey.startsWith('-----BEGIN'),
      includesEnd: privateKey.includes('-----END'),
      // 各文字のコードポイントを確認（最初の20文字）
      firstCharsCode: privateKey.substring(0, 20).split('').map(c => ({
        char: c,
        code: c.charCodeAt(0),
        isNewline: c === '\n',
        isBackslash: c === '\\'
      }))
    };
    
    return NextResponse.json({
      message: 'Private key analysis',
      analysis,
      allEnvVars: {
        hasProjectId: !!process.env.GOOGLE_PROJECT_ID,
        hasPrivateKeyId: !!process.env.GOOGLE_PRIVATE_KEY_ID,
        hasClientEmail: !!process.env.GOOGLE_CLIENT_EMAIL,
        hasClientId: !!process.env.GOOGLE_CLIENT_ID,
        hasSpreadsheetId: !!process.env.SPREADSHEET_ID,
      }
    });
  } catch (error) {
    return NextResponse.json({
      error: error instanceof Error ? error.message : 'Unknown error',
    }, { status: 500 });
  }
}