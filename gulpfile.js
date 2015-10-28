require('babel/register');

const gulp = require('gulp');
const gulpWebpack = require('gulp-webpack');
const shell = require('gulp-shell');
const watch = require('gulp-watch');
const webpack = require('webpack');

const webpackConfig = require('./webpack.config');
webpackConfig.output = { filename: 'app.js'};

gulp.task('webpack', function () {
  return gulp.src(webpackConfig.entry)
    .pipe(gulpWebpack(webpackConfig, webpack))
    .pipe(gulp.dest('dist/'));
});

gulp.task('watch-webpack', ['webpack'], function () {
  return watch(['src/**/*.js', 'src/**/*.jsx', 'src/**/*.styl'], function (file) {
    console.log(file.path, 'was changed');
    return gulp.src(webpackConfig.entry)
      .pipe(gulpWebpack(webpackConfig, webpack))
      .pipe(gulp.dest('dist/'));
  });
});

gulp.task('watch-server', shell.task('nodemon --exec babel-node --ignore="src" -- server/index.js'));

gulp.task('watch', ['watch-webpack', 'watch-server']);
