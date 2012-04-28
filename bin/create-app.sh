
mkdir -p ./app
mkdir -p ./app/controller
mkdir -p ./app/model
mkdir -p ./app/view

mkdir -p ./public
mkdir -p ./public/image
mkdir -p ./public/stylesheet
mkdir -p ./public/javascript
mkdir -p ./public/javascript/controller
mkdir -p ./public/javascript/model
mkdir -p ./public/javascript/view
mkdir -p ./public/javascript/plugin
mkdir -p ./public/javascript/vendor

mkdir -p ./test

cp -r node_modules/sayndo/example/dummy/view ./public/view
cp -r node_modules/sayndo/example/dummy/config ./config
cp node_modules/sayndo/example/dummy/server.js .

