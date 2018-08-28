FROM node:8

WORKDIR /app
COPY package.json ./
COPY yarn.lock ./
RUN yarn

COPY . .
CMD ["yarn", "start"]
