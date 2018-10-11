FROM node:8-alpine as build

WORKDIR /tmp

COPY package*.json /tmp/settlement-report/

RUN cd settlement-report && npm install


FROM node:8-alpine

ENV TERM=xterm-256color

RUN apk update && \
    apk add --no-cache python2 py-pip && \
    pip install google && \
    pip install protobuf

COPY --from=build /tmp/settlement-report/node_modules /settlement-report/node_modules

COPY ./docker/start.sh /

COPY ./python /settlement-query

COPY . /settlement-report

WORKDIR /

ENTRYPOINT [ "/start.sh" ]