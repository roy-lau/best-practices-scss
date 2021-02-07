// https://github.com/gulpjs/gulp
import gulp from 'gulp';

import htmlmin from 'gulp-htmlmin'; //引入html压缩模块
import sass from 'gulp-sass';
sass.compiler = require('node-sass');

import babel from 'gulp-babel';
import concat from 'gulp-concat';
import uglify from 'gulp-uglify';
import cleanCSS from 'gulp-clean-css';
import imagemin from 'gulp-imagemin';
import del from 'del';
import connect from 'gulp-connect';

const paths = {
  html: {
    src: 'views/**/*.html',
    dest: 'dist/views'
  },
  styles: {
    src: 'scss/**/*.scss',
    dest: 'dist/css/'
  },
  scripts: {
    src: 'scripts/**/*.js',
    dest: 'dist/scripts/'
  },
  images: {
    src: 'images/**/*.{jpg,jpeg,png,ico}',
    dest: 'dist/imgs/'
  }
};

/*
 * For small tasks you can export arrow functions
 */
export const clean = () => del(['dist']);

export function html() {
  /*一个*表示所有文件，两个*表示所有目录*/
  return gulp.src(paths.html.src) //打开读取文件
    .pipe(htmlmin({
      removeComments: true, //清除HTML注释
      collapseWhitespace: true, //压缩HTML
      collapseBooleanAttributes: true, //省略布尔属性的值 <input checked="true"/> ==> <input checked />
      removeEmptyAttributes: true, //删除所有空格作属性值 <input id="" /> ==> <input />
      removeScriptTypeAttributes: false, //删除<script>的type="text/javascript"
      removeStyleLinkTypeAttributes: true, //删除<style>和<link>的type="text/css"
      minifyJS: true, //压缩页面JS
      minifyCSS: true //压缩页面CSS
    })) //管道流操作，压缩文件
    .pipe(gulp.dest(paths.html.dest)) //指定压缩文件放置的目录
    .pipe(connect.reload());
}

export function styles() {
  return gulp.src(paths.styles.src)
    // 嵌套输出方式 nested
    // 展开输出方式 expanded 全部展开
    // 紧凑输出方式 compact 一个类名一行
    // 压缩输出方式 compressed

    .pipe(sass.sync({outputStyle: 'compact'}).on('error', sass.logError))
    .pipe(cleanCSS())
    .pipe(gulp.dest(paths.styles.dest))
    .pipe(connect.reload());
}

export function scripts() {
  return gulp.src(paths.scripts.src, { sourcemaps: true })
    .pipe(babel())
    .pipe(uglify())
    .pipe(concat('main.min.js'))
    .pipe(gulp.dest(paths.scripts.dest))
    .pipe(connect.reload());
}

// https://www.npmjs.com/package/gulp-imagemin
export function images() {
  return gulp.src(paths.images.src, { since: gulp.lastRun(images) })
    .pipe(imagemin([
      imagemin.gifsicle({ interlaced: true }), // 类型：Boolean 默认：false 隔行扫描gif进行渲染
      imagemin.mozjpeg({ quality: 75, progressive: true }),  // 类型：Boolean 默认：false 无损压缩jpg图片
      imagemin.optipng({ optimizationLevel: 5 }), // 类型：Number  默认：3  取值范围：0-7（优化等级）
      imagemin.svgo({
        plugins: [
          { removeViewBox: true }, // 移除svg的viewbox属性
          { cleanupIDs: false }
        ]
      })
    ]))
    .pipe(gulp.dest(paths.images.dest))
    .pipe(connect.reload());
}

function watchFiles() {
  gulp.watch(paths.html.src, html);
  gulp.watch(paths.scripts.src, scripts);
  gulp.watch(paths.styles.src, styles);
  gulp.watch(paths.images.src, images);
  // https://www.npmjs.com/package/gulp-connect
  connect.server({
    name: 'Dev App',
    root: 'dist',
    fallback: paths.html.dest + '/index.html',
    // debug: true,
    livereload: true
  });
}
export { watchFiles as watch };

/*
 * Specify if tasks run in series or parallel using `gulp.series` and `gulp.parallel`
 */
const build = gulp.series(clean, gulp.parallel(html, styles, scripts, images));

/*
 * Export a default task
 */
export default build;
