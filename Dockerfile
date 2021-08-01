FROM public.ecr.aws/bitnami/node:14

# アプリケーションディレクトリを作成する
WORKDIR /usr/src/app

# アプリケーションの依存関係をインストールする
# ワイルドカードを使用して、package.json と package-lock.json の両方が確実にコピーされるようにします。
# 可能であれば (npm@5+)
COPY package*.json ./
COPY .env ./

RUN npm ci --only=production --unsafe-perms
# 本番用にコードを作成している場合
# RUN npm install --only=production

# アプリケーションのソースをバンドルする
COPY dist dist

EXPOSE 4000
CMD [ "node", "dist/init.js" ]