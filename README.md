# Obsidian textlint Plugin

VSCodeスタイルのリアルタイムtextlintingをObsidianで実現するプラグインです。

## 機能

- ✨ リアルタイムテキストlinting
- 🎯 VSCodeスタイルの下線表示（エラー: 赤い点線、警告: オレンジ点線）
- 💬 ホバーツールチップでのエラー詳細表示
- ⚙️ 設定画面でのlinting有効/無効切り替え
- 🚀 textlintルールの動的管理（予定）

## インストール

### BRAT経由（推奨）

1. [BRAT](https://github.com/TfTHacker/obsidian42-brat)プラグインをインストール
2. BRATの設定で以下のGitHubリポジトリを追加：
   ```
   atosh/obsidian-textlint
   ```

### 手動インストール

1. [Releases](https://github.com/atosh/obsidian-textlint/releases)から最新版をダウンロード
2. `main.js`、`manifest.json`、`styles.css`をvault内の`.obsidian/plugins/obsidian-textlint/`フォルダにコピー
3. Obsidianを再起動してプラグインを有効化

## 使い方

1. プラグインを有効化
2. 設定でtextlintを有効にする（デフォルトで有効）
3. Markdownファイルを編集すると自動的にlintingが実行される
4. エラー箇所に赤い点線、警告箇所にオレンジ点線が表示される
5. 問題箇所にカーソルをホバーすると詳細情報がツールチップで表示される

## 開発

```bash
# 依存関係のインストール
npm install

# 開発モードで実行
npm run dev

# ビルド
npm run build
```

## ライセンス

MIT

## 今後の予定

- [ ] npmからのtextlintルール検索・インストール機能
- [ ] カスタムルールファイルサポート
- [ ] より詳細な設定UI
- [ ] 自動修正機能