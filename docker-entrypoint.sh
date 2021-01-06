#!/bin/sh

while ! nc -z mysql 3306;
do
    echo "wait for database";
    sleep 1;
done;
python manage.py migrate && \
gunicorn -w 4 -b 0.0.0.0 nqmonitor.wsgi