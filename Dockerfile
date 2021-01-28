FROM node:12

WORKDIR /usr/src/SuperBot
VOLUME ["/usr/src/SuperBot/dist/data"];

COPY . .

RUN npm install
RUN npm run build

CMD [ "node", "./dist/app.js" ]