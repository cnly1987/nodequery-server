FROM python:3.7.9-alpine3.12

WORKDIR /app

RUN sed -i 's/dl-cdn.alpinelinux.org/mirrors.aliyun.com/g' /etc/apk/repositories && \
  apk add --no-cache mariadb-dev build-base jpeg-dev libffi-dev

COPY ./requirement-docker.txt /app

RUN   pip3 install -r requirement-docker.txt

COPY . /app

RUN chmod +x /app/docker-entrypoint.sh

ENTRYPOINT [ "/app/docker-entrypoint.sh" ]