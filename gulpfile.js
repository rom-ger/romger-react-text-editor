var gulp = require('gulp');
var sass = require('gulp-sass');
var autoprefixer = require('gulp-autoprefixer');
var sourcemaps = require("gulp-sourcemaps");
var gutil = require("gulp-util");
var concat = require("gulp-concat");
var $ = require('gulp-load-plugins')();
var minifyCSS = require('gulp-minify-css');
var buffer = require('vinyl-buffer');
var uglify = require('gulp-uglify');
var path = require('path');
var eslint = require('gulp-eslint');
const babel = require('gulp-babel');
const del = require('del');

var errorHandler = function (title) {
    'use strict';

    return function (err) {
        gutil.log(gutil.colors.red('[' + title + ']'), err.toString());
        this.emit('end');
    };
};

var buildStyles = function (serve = false) {
    return gulp.src([
        'src/**/*.scss',
        './node_modules/ws-react-modal-dialog/lib/index.css'
    ])
        .pipe($.sourcemaps.init())
        .pipe($.sass({ style: 'expanded' })).on('error', errorHandler('Sass'))
        .pipe($.autoprefixer()).on('error', errorHandler('Autoprefixer'))
        .pipe(minifyCSS())
        .pipe($.sourcemaps.write())
        .pipe(concat('index.css'))
        .pipe(gulp.dest('./lib'));
};

gulp.task('lint', function () {
    return gulp.src(['./src/**/*.js', './src/**/*.jsx'])
        .pipe(eslint())
        .pipe(eslint.format());
});

const paths = {
    allSrcJs: 'src/**/*.js',
    libDir: 'lib',
};

gulp.task('clean', () => {
    return del(paths.libDir);
});

gulp.task('index.d.ts', () => {
    return gulp.src('src/index.d.ts')
        .pipe(gulp.dest(paths.libDir));
});

gulp.task('build', ['clean', 'lint', 'index.d.ts'], () => {
    buildStyles();
    return gulp.src(paths.allSrcJs)
      .pipe(babel())
      .pipe(buffer()).pipe(uglify())
      .pipe(gulp.dest(paths.libDir));
  });
