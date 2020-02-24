FROM playwright/package

WORKDIR /home/pwuser

COPY package*.json ./

COPY . .

CMD [ "node", "build/src/main.js" ]

EXPOSE 3000/tcp


