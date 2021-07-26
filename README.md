# MeTube

## ユーチューブをクローンしたウェブサイト（ver. 2021）

このプロジェクトで利用した技術スタック

- pug (html template engine for nodejs)
- javascript
- scss
- webpack
- nodejs
- mongodb
- docker
- AWS
  - CodePipeline
  - CodeBuild (using build docker)
  - CodeDeploy (deploy to ECR)

## Dockerfile

#####ビルドコマンド

```bash
$ docker image build . -t <accountName>/<imageName>
```

#####起動コマンド

```bash
$ docker container run -p <hostPort>:4000 -d <accountName>/<imageName>
```

## Routers

#####グローバル

- [x] / &ensp;：&ensp; ホームページ
- [x] /join &ensp;：&ensp; 会員登録
- [x] /login &ensp;：&ensp; ログイン
- [x] /search &ensp;：&ensp; 検索

##### ユーザー

- [x] /users/edit &ensp;：&ensp; ユーザー編集
- [x] /users/delete &ensp;：&ensp; ユーザー削除

##### ビデオ

- [x] /videos/watch &ensp;：&ensp; 動画視聴
- [x] /videos/edit &ensp;：&ensp; 動画の説明編集
- [x] /videos/delete &ensp;：&ensp; 動画削除
- [x] /videos/comments &ensp;：&ensp; コメント登録
- [x] /videos/comments/delete &ensp;：&ensp; コメント削除
