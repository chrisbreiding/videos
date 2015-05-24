require('babel/register');

const gulp = require('gulp');
const shell = require('gulp-shell');
const watch = require('gulp-watch');
const webpack = require('gulp-webpack');

const webpackConfig = require('./webpack.config');
webpackConfig.output = { filename: 'app.js'};

gulp.task('webpack', function () {
  return gulp.src(webpackConfig.entry)
    .pipe(webpack(webpackConfig))
    .pipe(gulp.dest('dist/'));
});

gulp.task('watch-webpack', ['webpack'], function () {
  return watch(['src/**/*.js', 'src/**/*.styl'], function (file) {
    console.log(file.path, 'was changed');
    return gulp.src(webpackConfig.entry)
      .pipe(webpack(webpackConfig))
      .pipe(gulp.dest('dist/'));
  });
});

gulp.task('watch-server', shell.task('nodemon --exec babel-node --ignore="src" -- server/index.js'));

gulp.task('watch', ['watch-webpack', 'watch-server']);
