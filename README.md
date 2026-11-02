# おしりーす

推し活用品レンタルサービスのコンテスト提出用アプリです。

## 開発

```sh
npm ci
npm run dev
```

開発サーバーは `http://localhost:4173` です。同じポートで起動済みの場合は、既存のサーバーを使用してください。

```sh
npm run build
npm test
```

CSSは `src/scss/` のSassから生成します。`style.css` を直接編集せず、生成後の差分も確認してください。

## 構成

- ルートのHTML: 利用者画面と管理者画面
- `assets/js/`: ページの処理、Firebaseとの通信、初期化処理
- `assets/images/`: 表示用画像とアイコン
- `src/scss/style.scss`: 共通スタイルと各部分の読み込み
- `src/scss/_*.scss`: 商品詳細・管理・カウントダウンなどのスタイル
- `tests/`: 保存処理、在庫、画面構造、参照ファイルのテスト

## Firebase

`assets/js/firebase_config.js` のプロジェクトを使用します。ルールを変更した場合は、`firestore.rules` の内容をFirebaseコンソールで公開してください。

`firebase_seed.html` は管理者による商品初期登録用です。通常の画面からリンクしていませんが、セットアップに使用するため残しています。

会員情報、お気に入り、カート、ライブ予定は利用者ごとに保存します。カウントダウンは `users/{uid}/countdown/current`、お問い合わせは `contacts`、返信通知は `notifications` を使用します。

## 互換性と素材

- 商品詳細は `product_detail.html?id=商品ID` に統一しています。
- 旧 `set.html` は `product_detail.html?id=set` への転送専用です。
- Firebaseに画像パスが保存されている場合があるため、商品画像はコードからの参照だけで削除しないでください。
- `lucide_license.txt` と画像生成プロンプトは、素材のライセンス・制作記録として残しています。

変更したら、ビルド・テストの後にログイン、商品選択、注文、管理画面の主要な導線も確認してください。自動テストのFirebase処理はモックであり、公開済みルールと実際の端末間同期は別途確認が必要です。
