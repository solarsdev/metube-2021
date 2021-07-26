# ミーチューブ

### ユーチューブをクローンしたウェブサイト（ver. 2021）

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

### Dockerfile

##### ビルドコマンド

- docker image build . -t (accountName)/(imageName)

##### 起動コマンド

- docker container run -p (hostPort):4000 -d (accountName)/(imageName)

### Routers ToDo

##### グローバル

- [x] / &ensp;：&ensp; ホームページ
- [ ] /join &ensp;：&ensp; 会員登録
- [ ] /login &ensp;：&ensp; ログイン
- [ ] /search &ensp;：&ensp; 検索

##### ユーザー

- [x] /users/edit &ensp;：&ensp; 検索
- [ ] /users/delete &ensp;：&ensp; 検索

##### ビデオ

- [x] /videos/watch &ensp;：&ensp; 動画視聴
- [ ] /videos/edit &ensp;：&ensp; 動画説明編集
- [ ] /videos/delete &ensp;：&ensp; 動画削除
- [ ] /videos/comments &ensp;：&ensp; コメント登録
- [ ] /videos/comments/delete &ensp;：&ensp; コメント削除
