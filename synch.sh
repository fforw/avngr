#!/bin/bash
npm run build
rsync -rvIz --rsh=ssh --delete --exclude=.git --exclude=*.blend ./web/ newweb:/var/www/static/demo/avngr
