# Habit Tracker を GitHub Pages で公開する手順

このリポジトリの静的ファイル（index.html, style.css, script.js）をそのまま GitHub Pages で公開できます。

前提:
- Git と GitHub アカウントが必要です（ローカルで git が使えない環境の場合は、GitHub のウェブUIからファイルをアップロードできます）。

1. リポジトリを作成
- GitHub で新しいリポジトリを作成します（例: `habit-tracker`）。
- ローカルで作業している場合:

```bash
# 初回のみ（git が使える場合）
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/<あなたのユーザー名>/habit-tracker.git
git push -u origin main
```

2. GitHub Pages の公開設定
- リポジトリの `Settings` → `Pages` を開きます。
- `Source` を `main` ブランチ、`/root`（または `docs/` フォルダを使う場合は `docs`）に設定して保存します。
- 数分で `https://<あなたのユーザー名>.github.io/habit-tracker/` で公開されます。

3. GitHub のウェブUIでファイルをアップロードする方法
- ローカルに git がない場合、リポジトリのトップ画面で `Add file` → `Upload files` から `index.html`, `style.css`, `script.js`, `README.md` をアップロードし、コミットします。
- その後、上記と同じように `Settings` → `Pages` を設定してください。

4. カスタムドメインや HTTPS
- カスタムドメインを使う場合は `CNAME` を追加し、DNS を設定してください。GitHub Pages は自動で HTTPS を提供します。

ローカルで簡単に確認する方法（Python がある場合）:

```bash
python -m http.server 8000
# ブラウザで http://localhost:8000 を開く
```

質問があれば、あなたの環境に合わせてコマンドや手順をさらに自動化します。