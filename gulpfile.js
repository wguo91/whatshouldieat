var gulp = require('gulp');
var inject = require('gulp-inject');

gulp.task('default',['layout', 'index', 'map']);

gulp.task('layout', function () {
  var target = gulp.src('./views/layouts/layout.handlebars');
  // It's not necessary to read the files (will speed up things), we're only after their paths:
  var sources = gulp.src(['./public/css/main.min.css'], {read: false});
  return target.pipe(inject(sources))
    .pipe(gulp.dest('./views/layouts/'));
});

gulp.task('index', function () {
  var target = gulp.src('./views/index.handlebars');
  // It's not necessary to read the files (will speed up things), we're only after their paths:
  var sources = gulp.src(['./public/js/index.min.js'], {read: false});
  return target.pipe(inject(sources))
    .pipe(gulp.dest('./views/'));
});

gulp.task('map', function () {
  var target = gulp.src('./views/map.handlebars');
  // It's not necessary to read the files (will speed up things), we're only after their paths:
  var sources = gulp.src(['./public/js/main.min.js'], {read: false});
  return target.pipe(inject(sources))
    .pipe(gulp.dest('./views/'));
});
