# MeTube

- ユーチューブをクローンしたウェブサイト（ver. 2021）

##### 既存バージョンとの違い

- Dockerize
- AWS managed CICD (using CodePipiline)
- ECS でコンテナー化

##### このプロジェクトで利用した技術スタック

- Pug (html template engine for nodejs)
- JavaScript
- Scss
- webpack
- Node.js
- MongoDB `as AWS DocumentDB`
- Docker
- AWS
  - CodePipeline (AWS managed CICD)
  - CodeBuild (using build docker and push to ECR)
  - CodeDeploy (deploy to ECS)
  - DocumentDB (alternative to MongoDB)

## SourceCode Structure

```bash
.
├── Dockerfile            # Dockerize Definition
├── README.md
├── babel.config.json     # ES6 Compiler Environment
├── buildspec.yml         # AWS CodeBuild Spec
├── package-lock.json
├── package.json
└── src                   # Source Code
    ├── controllers
    │   ├── userController.js
    │   └── videoController.js
    ├── routers
    │   ├── globalRouter.js
    │   ├── userRouter.js
    │   └── videoRouter.js
    ├── server.js
    └── views
        ├── base.pug      # Base Template Layout
        ├── home.pug
        └── partials
            └── footer.pug
```

## インフラ構成図

image here

## Dockerize

デモ環境は AWS CodeBuild を利用して自動的に ECR にビルドされ、ECS に配布します。
個別テスト用に Docker Image を作成するには下記のコマンドで。

##### ビルドコマンド

```bash
$ docker image build . -t <accountName>/<imageName>
```

##### 起動コマンド

```bash
$ docker container run -p <hostPort>:4000 -d <accountName>/<imageName>
```

## ToDos

##### グローバル

- [ ] / &ensp;：&ensp; ホームページ
- [ ] /join &ensp;：&ensp; 会員登録
- [ ] /login &ensp;：&ensp; ログイン
- [ ] /search &ensp;：&ensp; 検索

##### ユーザー

- [ ] /users/:id &ensp;：&ensp; ユーザーのプロフィール
- [ ] /users/logout &ensp;：&ensp; ログアウト
- [ ] /users/edit &ensp;：&ensp; 自分のアカウント情報を編集
- [ ] /users/delete &ensp;：&ensp; 自分のアカウント削除

##### ビデオ

- [ ] /videos/:id &ensp;：&ensp; 動画視聴
- [ ] /videos/:id/edit &ensp;：&ensp; 動画の説明編集
- [ ] /videos/:id/delete &ensp;：&ensp; 動画削除
- [ ] /videos/upload &ensp;：&ensp; 動画のアップロード
