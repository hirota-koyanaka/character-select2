# Google Sheets連携の設定方法

## 1. Google Cloud Consoleでプロジェクトを作成

1. [Google Cloud Console](https://console.cloud.google.com/)にアクセス
2. 新しいプロジェクトを作成または既存のプロジェクトを選択
3. Google Sheets APIを有効化

## 2. サービスアカウントを作成

1. 左側メニューの「APIとサービス」→「認証情報」を選択
2. 「認証情報を作成」→「サービスアカウント」を選択
3. サービスアカウントに名前を付けて作成
4. 作成したサービスアカウントをクリックし、「キー」タブを選択
5. 「鍵を追加」→「新しい鍵を作成」→「JSON」を選択してダウンロード

## 3. スプレッドシートの準備

1. Google Sheetsで新しいスプレッドシートを作成
2. A列にキャラクター名、B列にチェックボックスを設定:
   - A1: `ヘッダー（任意）`
   - A2: `character1`
   - A3: `character2`
   - ...
   - A25: `character24`
   - B列: チェックボックスを挿入（データ→チェックボックス）
3. スプレッドシートを作成したサービスアカウントのメールアドレスで共有（閲覧権限でOK）
4. URLからスプレッドシートIDを取得:
   `https://docs.google.com/spreadsheets/d/{SPREADSHEET_ID}/edit`

## 4. 環境変数の設定

1. `.env.local`ファイルをプロジェクトルートに作成
2. ダウンロードしたJSONファイルから以下の値をコピー:

```env
GOOGLE_PROJECT_ID=your-project-id
GOOGLE_PRIVATE_KEY_ID=your-private-key-id
GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYOUR_PRIVATE_KEY\n-----END PRIVATE KEY-----\n"
GOOGLE_CLIENT_EMAIL=your-service-account@your-project.iam.gserviceaccount.com
GOOGLE_CLIENT_ID=your-client-id
GOOGLE_CLIENT_CERT_URL=https://www.googleapis.com/robot/v1/metadata/x509/your-service-account%40your-project.iam.gserviceaccount.com
SPREADSHEET_ID=your-spreadsheet-id
```

## 5. 動作確認

1. `pnpm dev`で開発サーバーを起動
2. スプレッドシートのチェックボックスにチェックを入れる
3. 5秒以内に画面上のキャラクターに網掛けが表示されることを確認

## 使い方

- スプレッドシートでキャラクターのチェックボックスにチェックを入れると、該当キャラクターが無効化（グレーアウト＋網掛け）されます
- チェックを外すと再度選択可能になります
- データは5秒ごとに自動更新されます