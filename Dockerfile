FROM playwright/base

ENV NODE_ENV=production

ENV PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD=1

WORKDIR /home/pwuser

ARG NPM_LOGLEVEL=info

USER root

RUN mkdir -p /home/pwuser/.cache/dconf /home/pwuser/.config
RUN chown -R pwuser:pwuser /home/pwuser

COPY --chown=pwuser:pwuser . .

USER pwuser

RUN rm -f yarn.lock

RUN corepack pnpm install --prod --frozen-lockfile

CMD [ "node", "build/src/main.js" ]

EXPOSE 3000/tcp

