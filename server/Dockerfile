FROM node:12-alpine

WORKDIR /app

#COPY package*.json ./

COPY ./package.json .
#COPY ./package-lock.json .

RUN npm install

COPY . .

EXPOSE 5000

CMD ["npm", "run", "start"]