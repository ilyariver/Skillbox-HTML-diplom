var projectFolder = require('path').basename(__dirname);
var sourceFolder = '#src';

var fs = require('fs');

var path = {
   build: {
      html: projectFolder + '/',
      css: projectFolder + '/css/',
      js: projectFolder + '/js/',
      img: projectFolder + '/img/',
      fonts: projectFolder + '/fonts/',
   },
   src: {
      html: [sourceFolder + '/*.html', '!' + sourceFolder + '/_*.html'],
      css: sourceFolder + '/scss/style.scss',
      js: sourceFolder + '/js/script.js',
      img: sourceFolder + '/img/**/*.{jpg,png,svg,gif,ico,webp}',
      fonts: sourceFolder + '/fonts/*.{woff2,woff}',
   },
   watch: {
      html: sourceFolder + '/**/*.html',
      css: sourceFolder + '/scss/**/*.scss',
      js: sourceFolder + '/js/**/*.js',
      img: sourceFolder + '/img/**/*.{jpg,png,svg,gif,ico,webp}',
   },
   clean: './' + projectFolder + '/'
}

var { src, dest } = require('gulp');
var gulp = require('gulp');
var browsersync = require('browser-sync').create();
var fileInclude = require('gulp-file-include');
var del = require('del');
var scss = require('gulp-sass');
var autoprefixer = require('gulp-autoprefixer');
var cleanCss = require('gulp-clean-css');
var rename = require('gulp-rename');
var groupMedia = require('gulp-group-css-media-queries');
var uglify = require('gulp-uglify-es').default;
var imagemin = require('gulp-imagemin');
var webp = require('gulp-webp');
var webpHtml = require('gulp-webp-html');
var webpCss = require('gulp-webpcss');
var svgSprite = require('gulp-svg-sprite');
var ttf2woff = require('gulp-ttf2woff');
var ttf2woff2 = require('gulp-ttf2woff2');
var fonter = require('gulp-fonter');



function browserSync(params) {
   browsersync.init({
      server: {
         baseDir: './' + projectFolder + '/'
      },
      port: 3000,
      notify: false
   })
}

function html() {
   return src(path.src.html)
      .pipe(fileInclude())
      .pipe(webpHtml())
      .pipe(dest(path.build.html))
      .pipe(browsersync.stream())
}

function css() {
   return src(path.src.css)
      .pipe(
         scss({
            outputStyle: 'expanded'
         })
      )
      .pipe(
         groupMedia()
      )
      .pipe(
         autoprefixer({
            overrideBrowserslist: ['last 5 versions'],
            cascade: true
         })
      )
      .pipe(webpCss())
      .pipe(dest(path.build.css))
      .pipe(cleanCss())
      .pipe(
         rename({
            extname: '.min.css'
         })
      )
      .pipe(dest(path.build.css))
      .pipe(browsersync.stream())
}

function js() {
   return src(path.src.js)
      .pipe(fileInclude())
      .pipe(dest(path.build.js))
      .pipe(
         uglify()
      )
      .pipe(
         rename({
            extname: '.min.js'
         })
      )
      .pipe(dest(path.build.js))
      .pipe(browsersync.stream())
}

function images() {
   return src(path.src.img)
      .pipe(
         webp({
            quality: 70
         })
      )
      .pipe(dest(path.build.img))
      .pipe(src(path.src.img))
      .pipe(
         imagemin({
            progressive: true,
            svgoPlugins: [{ removeViewBox: false }],
            interlaced: true,
            optimizationLevel: 3
         })
      )
      .pipe(dest(path.build.img))
      .pipe(browsersync.stream())
}

function fonts() {
   src(path.src.fonts)
      .pipe(ttf2woff())
      .pipe(dest(path.build.fonts))
   return src(path.src.fonts)
      .pipe(ttf2woff2())
      .pipe(dest(path.build.fonts))
}

gulp.task('otf2ttf', function () {
   return src([sourceFolder + '/fonts/*.otf'])
      .pipe(fonter({
         formats: ['ttf']
      }))
      .pipe(dest(sourceFolder + '/fonts/'))
})

gulp.task('svgSprite', function () {
   return gulp.src([sourceFolder + '/iconsprite/*.svg'])
      .pipe(svgSprite({
         mode: {
            stack: {
               sprite: '../icons/icons.svg',
            }
         }
      }))
      .pipe(dest(path.build.img))
})

function fontsStyle(params) {

   let file_content = fs.readFileSync(sourceFolder + '/scss/fonts.scss');
   if (file_content == '') {
      fs.writeFile(sourceFolder + '/scss/fonts.scss', '', cb);
      return fs.readdir(path.build.fonts, function (err, items) {
         if (items) {
            let c_fontname;
            for (var i = 0; i < items.length; i++) {
               let fontname = items[i].split('.');
               fontname = fontname[0];
               if (c_fontname != fontname) {
                  fs.appendFile(sourceFolder + '/scss/fonts.scss', '@include font("' + fontname + '", "' + fontname + '", "400", "normal");\r\n', cb);
               }
               c_fontname = fontname;
            }
         }
      })
   }
}

function cb() {

}

function watchFiles(params) {
   gulp.watch([path.watch.html], html);
   gulp.watch([path.watch.css], css);
   gulp.watch([path.watch.js], js);
   gulp.watch([path.watch.img], images);
}

function clean(params) {
   return del(path.clean);
}

var build = gulp.series(clean, gulp.parallel(css, html, js, images, fonts), fontsStyle);
var watch = gulp.parallel(build, watchFiles, browserSync);

exports.fontsStyle = fontsStyle;
exports.fonts = fonts;
exports.images = images;
exports.js = js;
exports.css = css;
exports.html = html;
exports.build = build;
exports.watch = watch;
exports.default = watch;