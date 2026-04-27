const { dest, watch, series, parallel } = require('gulp');

const sass = require('gulp-sass')(require('sass'));
const rollup = require('@rollup/stream');
const resolve = require('@rollup/plugin-node-resolve');
const commonjs = require('@rollup/plugin-commonjs');
const { string } = require('rollup-plugin-string');
const uglify = require('gulp-uglify');
const source = require('vinyl-source-stream');
const buffer = require('vinyl-buffer');
const browserSync = require('browser-sync').create();
const { deleteAsync } = require('del');
const sourcemaps = require('gulp-sourcemaps');
const plumber = require('gulp-plumber');
const nodemon = require('gulp-nodemon');
const { src } = require('gulp');

const paths = {
    styles: 'src/styles/main.scss',
    watchStyles: 'src/styles/**/*.scss',
    scripts: 'src/scripts/**/*.js',
    shaders: 'src/shaders/**/*.glsl',
    views: 'src/views/pages/**/*.pug',
    allViews: 'src/views/**/*.pug',
    assets: 'src/assets/**/*'
};

const port = 3000

function styles() {
    return src(paths.styles)
        .pipe(plumber({
            errorHandler: function (err) {
                console.error(err.message);
                browserSync.notify(`SCSS Error: ${err.messageOriginal || err.message}`, 10000);
                this.emit('end');
            }
        }))
        .pipe(sourcemaps.init())
        .pipe(sass({
            outputStyle: 'compressed',
            quietDeps: true,
            includePaths: ['node_modules']
        }))
        .pipe(sourcemaps.write('.'))
        .pipe(dest('public/css'))
        .pipe(browserSync.stream({ match: '**/*.css' }));
}

function views(cb) {
    browserSync.reload();
    cb();
}

function scripts() {
    return rollup({
        input: 'src/scripts/app.js',
        plugins: [string({ include: '**/*.glsl' }), resolve.default(), commonjs.default()],
        output: {
            format: 'iife'
        }
    })
        .pipe(source('app.js'))
        .pipe(buffer())
        .pipe(uglify())
        .pipe(dest('public/js'))
        .pipe(browserSync.stream({ stream: true }));
}

function assets() {
    return src(paths.assets, { encoding: false })
        .pipe(dest('public/assets', { encoding: false }));
}

async function clean() {
    return await deleteAsync(['public']);
}

function server(cb) {
    let started = false;

    return nodemon({
        script: 'src/app.js',
        watch: ['src'],
        ext: 'js json',
        ignore: ['src/styles/**', 'src/scripts/**', 'src/views/**', 'public/**', 'node_modules/**']
    }).on('start', function () {
        if (!started) {
            cb();
            started = true;
        }
    }).on('restart', function () {
        setTimeout(() => browserSync.reload({ stream: false }), 1000);
    });
}

function serve() {
    browserSync.init({
        proxy: `http://localhost:${port}`,
        port: 4000,
        ui: {
            port: 4001,
        },
        open: 'local'
    });

    watch(paths.watchStyles, styles);
    watch([paths.scripts, paths.shaders], scripts);
    watch(paths.allViews, views);
}

exports.build = series(
    clean,
    parallel(styles, scripts, assets)
);

exports.default = series(
    clean,
    parallel(styles, scripts, assets),
    server,
    serve
);
