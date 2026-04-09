const { src, dest, watch, series, parallel } = require('gulp');

const sass = require('gulp-sass')(require('sass'));
const babel = require('gulp-babel');
const uglify = require('gulp-uglify');
const concat = require('gulp-concat');
const browserSync = require('browser-sync').create();
const { deleteAsync } = require('del');
const sourcemaps = require('gulp-sourcemaps');
const plumber = require('gulp-plumber');
const nodemon = require('gulp-nodemon');

const paths = {
    styles: 'src/styles/main.scss',
    watchStyles: 'src/styles/**/*.scss',
    scripts: 'src/scripts/**/*.js',
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
    watch(paths.scripts, scripts);
    watch(paths.allViews, views);
}

exports.default = series(
    clean,
    parallel(styles, scripts, views, assets),
    server,
    serve
);