# gulp-split-locales [![Build Status](https://travis-ci.org/denisborovikov/gulp-split-locales.svg?branch=master)](https://travis-ci.org/denisborovikov/gulp-split-locales)

> My mathematical gulp plugin


## Install

```
$ npm install --save-dev gulp-split-locales
```


## Usage

```js
var gulp = require('gulp');
var splitLocales = require('gulp-split-locales');

gulp.task('default', function () {
	return gulp.src('src/file.ext')
		.pipe(splitLocales())
		.pipe(gulp.dest('dist'));
});
```


## API

### splitLocales(options)

#### options

##### foo

Type: `boolean`  
Default: `false`

Lorem ipsum.


## License

MIT © [Denis Borovikov](https://github.com/denisborovikov)
