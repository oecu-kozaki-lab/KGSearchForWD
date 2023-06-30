# KGSearchForWD
Wikidataを使った「**知識グラフ検索ツール**」 開発用のライブラリです．  

[<img width="600" alt="kgs_image" src="https://raw.githubusercontent.com/oecu-kozaki-lab/KGSearchForWD/main/doc/kgs_image.png">](https://kgs.hozo.jp/sample/UnivEx_list.html)


本ライブラリを使った検索ツールの作成例は「**[こちら](https://kgs.hozo.jp/sample/)**」から  

作成例の中でも特におススメは，下記のものです．
- **[Wikidata全体からのEntity検索](https://kgs.hozo.jp/sample/list.html)**：キーワードで簡単にWikidataを検索するサービス例（[分類付きバージョン](https://kgs.hozo.jp/sample/wd-search.html)）  
  →このサービスを元に，検索用の設定を行うと，「**オリジナルの検索サービス**」が簡単に作成できます．
- **[SPARQL検索用の基本テンプレート](https://kgs.hozo.jp/sample/template.html)**：任意のSPARQLエンドポイントに対して検索をする際のテンプレートとなる例

ソースコードの全体は，  
[https://github.com/oecu-kozaki-lab/KGSearchForWD](https://github.com/oecu-kozaki-lab/KGSearchForWD)  
にて公開しています．

## Wikidataを使った「知識グラフ検索サービス」の作り方   
「**[検索サービス作成用のテンプレートプログラム](https://kgs.hozo.jp/doc/KGS4WD.zip)**」(ZIP形式)をダウンロードし，簡単な設定を行ってカスタマイズすることで，
「Wikidataを使ったオリジナルの検索サービス」を作成できます．  

作成方法の詳細は，「**[こちらの解説資料](https://docs.google.com/presentation/d/1Mq0ZTU0hoQikX5rEB5m2rlGAPzdD0Wp2nLuOD04lRGY/)**」をご覧ください．
- [こちら](https://lodc2022wds.peatix.com/)のイベントで使用した解説資料を加筆したものです． 
- イベントの[動画アーカイブ](https://www.youtube.com/watch?v=ZcZyXu8PygI&t=0s)にて使い方の上記の資料を使った説明をしています（※資料は一部，動画版より更新しています）．
  
## 更新内容
### 2022/10/09 
- 検索結果で見つかったデータの詳細表示をする画面を「iframeでの同一ページ内」「別ウィンドウ」「別タブ」から指定できるようにしました．
- 検索結果の一覧で同一データの内容は「セル結合」で表示するように変更しました．
- 作成したサービスをカスタマイズしやすいように，スタイルファイルを見直しました．
- 作成したサービスを公開するように「検索設定のカスタマイズ」を非表示にするオプションを追加しました．

## ライセンス
本ソフトウェアは[Apache License 2.0 ライセンス](https://github.com/oecu-kozaki-lab/KGSearchForWD/blob/main/LICENSE)にて公開しています．

