# Copyroam

[English](./README.md)

コピー・切り取り・貼り付け・右クリック・テキスト選択を禁止しているページで、それらを復活させるブラウザ拡張機能です。ポップアップも設定画面もなく、ツールバーのアイコンをクリックするだけで切り替えられます。

## なぜ作ったか

一部のサイトはJavaScriptやCSSでクリップボード操作・右クリックメニュー・テキスト選択を無効化し、コピーを防ごうとします。Copyroamはページを恒久的に書き換えることなく、必要なときだけその場でこれらの制限を無効化します。

## 特徴

- ワンクリックでON/OFF切り替え — ポップアップUIはなく、ツールバーアイコン自体が状態を示します(グレーがOFF、緑がON)
- `copy` / `cut` / `paste`、右クリック、マウスでの手動選択を復活
- `mousedown`によるドラッグ選択のブロック、キーボードショートカット(Ctrl/Cmd+C/X/V/A)、インラインイベントハンドラ属性、CSSの`user-select`によるブロックにも対応
- デフォルトはOFF。切り替えると現在のタブが自動でリロードされ、即座に反映されます

## インストール(開発モード)

```bash
npm install
npm run dev
```

拡張機能が読み込まれた状態のブラウザが開き、ファイルの変更が自動で反映されます。

## ビルド

```bash
npm run build
```

`.output/chrome-mv3/` に展開済み拡張機能が出力されます。ブラウザの「パッケージ化されていない拡張機能を読み込む」から読み込んでください。

## 仕組み

トグルをONにすると、`document_start`のタイミングで`MAIN`ワールドのコンテンツスクリプトを動的登録します(`chrome.scripting.registerContentScripts`)。このスクリプトは:

- サイトがコピー阻止に使う特定のイベント種別(`copy`、`cut`、`paste`、`contextmenu`、`selectstart`、`mousedown`)に限り、`Event.prototype.preventDefault()`を何もしないようにします。他のリスナーはすべて通常通り実行され、キャンセルの効果だけが無効化されます
- Ctrl/Cmd+C/X/V/Aに限定して`keydown`/`keyup`の伝播を止め、それ以外のキーボードショートカットには一切影響しません
- `onmousedown="return false"`のようなインラインハンドラのプロパティを無効化します
- `user-select: text`と通常のカーソル表示を強制するスタイルを注入します

ページのデータを読み取ったり、書き換えたり、どこかに送信したりすることは一切ありません。

## 技術スタック

[WXT](https://wxt.dev) と TypeScript で構築しています。

## 作者

[Ketyap](https://ketyap.me) — 質問・不具合報告など: [me@ketyap.me](mailto:me@ketyap.me)

## ライセンス

[MIT](./LICENSE) — ソースコードのみが対象です。[`public/icon/`](./public/icon)内のアイコンは対象外です。詳細は[こちら](./public/icon/NOTICE.md)。
