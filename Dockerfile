FROM node:20.11.0

RUN useradd --user-group --create-home --shell /bin/false app &&\
    npm install --global npm@10.3.0

ENV HOME=/home/app

COPY package.json npm-shrinkwrap.json $HOME/trunfo/
RUN chown -R app:app $HOME/*

USER app
WORKDIR $HOME/trunfo
RUN npm cache clean --force && npm install --silent --progress=false

USER root
COPY . $HOME/trunfo

RUN chown -R app:app $HOME/*
USER app

CMD ["node", "index.js"]