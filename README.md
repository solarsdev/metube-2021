# MeTube

## ユーチューブをクローンしたウェブサイト（ver. 2021）

##### このプロジェクトで利用した技術スタック

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
  - CodeDeploy (deploy to ECS)

## Dockerfile

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
