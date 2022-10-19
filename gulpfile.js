const { src, dest, watch, parallel } = require('gulp')
const sass = require('gulp-sass')(require('sass')); // 使用sass
const gls = require('gulp-live-server') // 创建服务
const uglify = require('gulp-uglify'); // 压缩js
const cleanCSS = require('gulp-clean-css'); // 压缩css
const fileinclude = require('gulp-file-include');
const connect = require('gulp-connect');



// 跨域设置
const cors = function(req, res, next) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Headers', '*');
    res.setHeader('Access-Control-Allow-Methods', '*');
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    // 浏览器缓存预检请求结果时间,单位:秒，24小时
    res.setHeader('Access-Control-Max-Age', '86400');
    next();
};


// 处理html：输出
function html() {
    return src('src/pages/**/*.html', '!page/include/**.html').pipe(fileinclude({
        prefix: '@@',
        basepath: '@file'
    })).pipe(dest('dist')).pipe(connect.reload())
}
// 处理css库：压缩，输出
function cssInit() {
    return src('src/css/*.css').pipe(cleanCSS({ compatibility: 'ie8' })).pipe(dest('dist/css')).pipe(connect.reload())
}
// 处理样式：编译sass，压缩，输出
function css() {
    return src('src/css/*.scss').pipe(sass()).pipe(cleanCSS({ compatibility: 'ie8' })).pipe(dest('dist/css')).pipe(connect.reload())
}
// 处理js库，不需压缩直接输出
function jsLibInit() {
    return src('src/js/lib/*.js').pipe(dest('dist/js/lib'))
}
// 处理js：抛去库，压缩，输出
function js() {
    return src(['src/js/**/*.js', '!src/js/lib/**']).pipe(uglify()).pipe(dest('dist/js')).pipe(connect.reload())
}
// 处理图片：输出
function img() {
    return src('src/images/**').pipe(dest('dist/img')).pipe(connect.reload())
}

// 启动server
function server() {
    connect.server({
        root: 'dist',
        port: 2333,
        livereload: true,
        middleware: function(connect, opt) {
            return [cors];
        }
    })
}
// 监听变化
function watchChange(cb) {
    watch('src/**/*.html', html)
    watch('src/css/*.scss', css)
    watch(['src/js/**/*.js', '!src/js/lib/**'], js)
    watch('src/images/**', img)
    cb()
}
exports.server = parallel(html, cssInit, css, img, jsLibInit, js, server, watchChange)