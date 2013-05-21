APP_LESS=./app.less
INDEX_LESS=./index.less
APP_CSS_MIN=../app.min.css
INDEX_CSS_MIN=../index.min.css

#
# WATCH LESS FILES
#

build:
	lessc ${INDEX_LESS} > ${INDEX_CSS_MIN}
	lessc ${APP_LESS} > ${APP_CSS_MIN}

watch:
	echo "Watching less files..."
	watchmedo shell-command \
	--patterns="*.less" \
	--recursive \
	--command='make build' \
	.

js-build:
	cat js/sws-dropdown.js \
	> /tmp/sws.js
	uglifyjs -nc /tmp/sws.js > ${SWS_MIN_JS}


.PHONY: watch
