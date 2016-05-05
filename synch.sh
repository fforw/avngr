#!/bin/bash

rsync -rvIz --rsh=ssh --delete --exclude=.git ./web/ newweb:/var/www/static/demo/avngr
