FROM playwright/base

ENV NODE_ENV=production

USER pwuser

ENV PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD=1

WORKDIR /home/pwuser

ARG NPM_LOGLEVEL=info

COPY . .

RUN rm yarn.lock

RUN npm install --loglevel ${NPM_LOGLEVEL} --force

CMD [ "node", "build/src/main.js" ]

EXPOSE 3000/tcp

