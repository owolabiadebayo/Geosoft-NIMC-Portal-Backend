FROM node

WORKDIR /app

COPY package.json .

# Install PM2 globally
RUN npm install -g pm2

RUN npm install

COPY . .

EXPOSE 3500

CMD ["pm2-runtime", "ecosystem.config.js"]