#!/bin/bash
git fetch --all  
git reset --hard origin/master
git push
# supervisorctl restart monitorx
