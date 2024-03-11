FROM node:20.11.0

WORKDIR /usr/src/app/

COPY . /usr/src/app/

EXPOSE 5000

RUN  npm install && npm run build

CMD ["npm", "run", "preview", "--", "--host"]

