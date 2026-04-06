const { src, dest, watch, series, parallel } = require('gulp');

const sass = require('gulp-sass')(require('sass'));
const pug = require('gulp-pug');
const babel = require('gulp-babel');
const uglify = require('gulp-uglify');
const concat = require('gulp-concat');
const browserSync = require('browser-sync').create();
const { deleteAsync } = require('del');
const sourcemaps = require('gulp-sourcemaps');
const plumber = require('gulp-plumber');


const paths = {
    styles: 'src/styles/**/*.scss',
    scripts: 'src/scripts/**/*.js',
    views: 'src/views/pages/**/*.pug',
    assets: 'src/assets/**/*'
};

function styles() {
    return src(paths.styles)
        .pipe(plumber())
        .pipe(sourcemaps.init())
        .pipe(sass({ outputStyle: 'compressed' }))
        .pipe(sourcemaps.write('.'))
        .pipe(dest('public/css'))
        .pipe(browserSync.stream());
}

function views() {
    return src(paths.views)
        .pipe(plumber())
        .pipe(pug({ pretty: true }))
        .pipe(dest('public'))
        .pipe(browserSync.stream());
}

function scripts() {
    return src(paths.scripts)
        .pipe(plumber())
        .pipe(sourcemaps.init())
        .pipe(babel({
            presets: ['@babel/preset-env']
        }))
        .pipe(concat('app.js'))
        .pipe(uglify())
        .pipe(sourcemaps.write('.'))
        .pipe(dest('public/js'))
        .pipe(browserSync.stream());
}

function assets() {
    return src(paths.assets)
        .pipe(dest('public/assets'));
}

async function clean() {
    return await deleteAsync(['public']);
}

function serve() {
    browserSync.init({
        server: {
            baseDir: 'public',
        },
        port: 3030,
        ui: {
            port: 3031,
        },
        open: false,
        notify: false
    });

    watch(paths.styles, styles);
    watch(paths.scripts, scripts);
    watch(paths.views, views);
}

exports.default = series(
    clean,
    parallel(styles, scripts, views, assets),
    serve
);