install:
	yarn install

build: javascript
	zola build

serve: javascript
	zola serve

javascript:
	npx browserify src/js/main.js -o static/js/bundle.js -p tinyify

spelling:
	for f in content/*/**.md; do aspell check $$f; done
