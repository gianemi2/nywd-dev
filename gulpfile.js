var gulp = require('gulp');
var sass = require('gulp-sass')(require('sass-embedded'));
var sassGlob = require('gulp-sass-glob');
var browserSync = require('browser-sync').create();
var postcss = require('gulp-postcss');
var autoprefixer = require('autoprefixer');
var concat = require('gulp-concat');
var rename = require('gulp-rename');
var uglify = require('gulp-uglify');
var cleanCSS = require('gulp-clean-css');
var purgecss = require('gulp-purgecss');
var fileinclude = require('gulp-file-include');
var del = require('del');
var tailwindcss = require('tailwindcss');

// js file paths
var utilJsPath = 'node_modules/codyhouse-framework/main/assets/js'; // util.js path - you may need to update this if including the framework as external node module
var componentsJsPath = 'main/assets/js/components/*.js'; // component js files
var scriptsJsPath = 'main/assets/js'; //folder for final scripts.js/scripts.min.js files

// css file paths
var cssFolder = 'main/assets/css'; // folder for final style.css/style-custom-prop-fallbac.css files
var scssFilesPath = 'main/assets/css/**/*.scss'; // scss files to watch
var tailwindPath = 'main/assets/css/tailwind.css';

async function reload(done) {
  browserSync.reload();
  done();
}

// Processa Tailwind e autoprefixer
function compileTailwind() {
  return gulp.src(tailwindPath)
    .pipe(postcss([tailwindcss(), autoprefixer()]))
    .pipe(gulp.dest('dist/assets/css/'));
}

/* Gulp watch tasks */
// This task is used to convert the scss to css and compress it.
gulp.task('sass', function () {
  return gulp.src(scssFilesPath)
    .pipe(sassGlob({ sassModules: true }))
    .pipe(sass().on('error', sass.logError))
    .pipe(postcss([autoprefixer()]))
    .pipe(gulp.dest(cssFolder))
    .pipe(browserSync.reload({
      stream: true
    }))
    .pipe(rename('style.min.css'))
    .pipe(cleanCSS())
    .pipe(gulp.dest(cssFolder))
    .pipe(browserSync.reload({
      stream: true
    }));
});
// This task is used to combine all js files in a single scripts.min.js.
gulp.task('scripts', function () {
  return gulp.src([utilJsPath + '/util.js', componentsJsPath])
    .pipe(concat('scripts.js'))
    .pipe(gulp.dest(scriptsJsPath))
    .pipe(browserSync.reload({
      stream: true
    }))
    .pipe(rename('scripts.min.js'))
    .pipe(uglify())
    .pipe(gulp.dest(scriptsJsPath))
    .pipe(browserSync.reload({
      stream: true
    }));
});
// This task is used to reload the project whan changes are made to a html/scss/js file.
gulp.task('browserSync', gulp.series(function (done) {
  browserSync.init({
    server: {
      baseDir: 'dist'
    },
    notify: false
  })
  done();
}));

function includeHTML() {
  return new Promise(function (resolve, reject) {
    var stream = gulp.src([
      'main/*.html',
      '!header.html', // ignore
      '!footer.html' // ignore
    ])
      .pipe(fileinclude({
        prefix: '@@',
        basepath: '@file'
      }))
      .pipe(gulp.dest(distFolder))

    stream.on('finish', function () {
      resolve();
    });
  });
}

function includeHTMLES() {
  return new Promise(function (resolve, reject) {
    var stream = gulp.src([
      'main/es/*.html',
      '!main/es/components/*.html'
    ])
      .pipe(fileinclude({
        prefix: '@@',
        basepath: '@file'
      }))
      .pipe(gulp.dest(distFolder + 'es'))

    stream.on('finish', function () {
      resolve();
    });
  });
}

gulp.task('watch', gulp.series(['browserSync', 'sass', 'scripts'], async function () {
  await moveContent();
  await moveEsTranslation();
  await cleanCSS();
  await purgeCSS();
  // minify the scripts.js file and copy it to the dist folder
  await minifyJs();
  // copy any additional js files to the dist folder
  await moveJS();
  // copy all the assets inside main/assets/img folder to the dist folder
  await moveAssets();
  await moveFavicon();
  gulp.watch('main/assets/css/**/*.scss', gulp.series(['sass', moveAssets, compileTailwind, reload]));
  gulp.watch(componentsJsPath, gulp.series(['scripts', moveAssets, moveJS, reload]));
  //gulp.watch(scriptsJsPath + '/*.js', gulp.series(['scripts', moveAssets, reload]));
  await moveJS();
  gulp.watch(['main/*.html', 'main/components/*.html'], gulp.series([
    compileTailwind,
    moveContent,
    includeHTML,
    reload
  ]));
  gulp.watch(['main/es/*.html', 'main/es/components/*.html'], gulp.series([
    compileTailwind,
    moveEsTranslation,
    includeHTMLES,
    reload
  ]))
}));

/* Gulp dist task */
// create a distribution folder for production
var distFolder = 'dist/';
var assetsFolder = 'dist/assets/';

gulp.task('dist', async function () {
  await cleanDist();
  // remove unused classes from the style.css file with PurgeCSS and copy it to the dist folder
  await purgeCSS();
  // minify the scripts.js file and copy it to the dist folder
  await minifyJs();
  // copy any additional js files to the dist folder
  await moveJS();
  // copy all the assets inside main/assets/img folder to the dist folder
  await moveAssets();
  await moveFavicon();
  // copy all html files inside main folder to the dist folder 
  await moveContent();
  await moveEsTranslation();
  await includeHTML();
  await includeHTMLES();
  console.log('Distribution task completed!')
});

function cleanDist() {
  return del('dist/**')
}

function cleanCSS() {
  return del('dist/assets/css/**')
}

function purgeCSS() {
  return new Promise(function (resolve, reject) {
    var stream = gulp.src(cssFolder + '/style.css')
      .pipe(purgecss({
        content: ['main/*.html', scriptsJsPath + '/scripts.js', 'main/**/*.html'],
        safelist: {
          standard: ['.is-hidden', '.is-visible'],
          deep: [/class$/],
          greedy: []
        },
        defaultExtractor: content => content.match(/[\w-/:%@]+(?<!:)/g) || []
      }))
      .pipe(cleanCSS())
      .pipe(gulp.dest(distFolder + '/assets/css'));

    stream.on('finish', function () {
      resolve();
    });
  });
};

function minifyJs() {
  return new Promise(function (resolve, reject) {
    var stream = gulp.src(scriptsJsPath + '/scripts.js')
      .pipe(uglify())
      .pipe(gulp.dest(distFolder + '/assets/js'));

    stream.on('finish', function () {
      resolve();
    });
  });
};

function moveJS() {
  return new Promise(function (resolve, reject) {
    var stream = gulp.src([scriptsJsPath + '/*.js', '!' + scriptsJsPath + '/scripts.js', '!' + scriptsJsPath + '/scripts.min.js'], { allowEmpty: true })
      .pipe(gulp.dest(assetsFolder + 'js'));

    stream.on('finish', function () {
      resolve();
    });
  });
};

function moveAssets() {
  return new Promise(function (resolve, reject) {
    var stream = gulp.src(['main/assets/img/**'], { allowEmpty: true, encoding: false })
      .pipe(gulp.dest(assetsFolder + 'img'));

    stream.on('finish', function () {
      resolve();
    });
  });
};

function moveFavicon() {
  return new Promise(function (resolve, reject) {
    var stream = gulp.src(['main/assets/favicon/**'], { allowEmpty: true })
      .pipe(gulp.dest(assetsFolder + 'favicon'));

    stream.on('finish', function () {
      resolve();
    });
  });
};

function moveEsTranslation() {
  return new Promise(function (resolve, reject) {
    var stream = gulp.src('main/es/*.html')
      .pipe(gulp.dest(distFolder + 'es'));

    stream.on('finish', function () {
      console.log("Moved content");
      resolve();
    });
  });
}

function moveContent() {
  return new Promise(function (resolve, reject) {
    var stream = gulp.src('main/*.html')
      .pipe(gulp.dest(distFolder));

    stream.on('finish', function () {
      console.log("Moved content");
      resolve();
    });
  });
};
