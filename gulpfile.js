// load everything
var gulp = require('gulp');

var browserSync = require('browser-sync').create();
var del = require('del');
var sass = require('gulp-sass');
var sourcemaps = require('gulp-sourcemaps');
var postcss = require('gulp-postcss');
var autoprefixer = require('autoprefixer');
var csso = require('gulp-csso');
var twig = require('gulp-twig');
var fs = require('fs');
var surge = require('gulp-surge');


// Now define some tasks

// a task to delete all css files in dist/assets folder
gulp.task('css:clean', function(){
    return del('dist/assets/css/master.css*' , { force: true });
});

// CSS compilation (also deletes css files first using previously defined task)
gulp.task('css:compile', ['css:clean'], function(){
    return gulp
        .src('src/scss/master.scss') // this is the source of for compilation
        .pipe(sass().on('error', sass.logError)) // compile sass to css and also tell us about a problem if happens
        .pipe(sourcemaps.init()) // initalizes a sourcemap
        .pipe(postcss([autoprefixer( // supported browsers (from Bootstrap 4 beta: https://github.com/twbs/bootstrap/blob/v4-dev/build/postcss.config.js)
            //
            // Official browser support policy:
            // https://v4-alpha.getbootstrap.com/getting-started/browsers-devices/#supported-browsers
            //
            'Chrome >= 45', // Exact version number here is kinda arbitrary
            'Firefox ESR',
            // Note: Edge versions in Autoprefixer & Can I Use refer to the EdgeHTML rendering engine version,
            // NOT the Edge app version shown in Edge's "About" screen.
            // For example, at the time of writing, Edge 20 on an up-to-date system uses EdgeHTML 12.
            // See also https://github.com/Fyrd/caniuse/issues/1928
            'Edge >= 12',
            'Explorer >= 10',
            // Out of leniency, we prefix these 1 version further back than the official policy.
            'iOS >= 9',
            'Safari >= 9',
            // The following remain NOT officially supported, but we're lenient and include their prefixes to avoid severely breaking in them.
            'Android >= 4.4',
            'Opera >= 30'
        ), require('postcss-flexbugs-fixes')]))
        .pipe(csso()) // compresses CSS
        .pipe(sourcemaps.write('.')) // writes the sourcemap
        .pipe(gulp.dest('./dist/assets/css')) // destination of the resulting css
        .pipe(browserSync.stream()); // tell browsersync to reload CSS (injects compiled CSS)
});

// clean css of assets in public
gulp.task('css:public-clean', function(){
    return del('public/assets/css/master.css*' , { force: true });
});

// copy css to public's assets
gulp.task('css:public', ['css:public-clean','css:compile'], function(){
    return gulp.src('dist/assets/css/*')
        .pipe(gulp.dest('public/assets/css'));
});

// delete all html files in dist/assets folder
gulp.task('html:clean', function(){
    return del('dist/**/*.html', { force: true });
});

// HTML compilation from views
gulp.task('html:compile', ['html:clean'], function(){
    return gulp.src('src/views/**/*.twig')
    // compile twig view to html files
        .pipe(twig({ data: JSON.parse(fs.readFileSync('src/json/color.json'))})) // import from data.json
        .pipe(gulp.dest('./dist/')) // where to put compiled html
        .on('end', function(){ // after compilation finishes…
            browserSync.reload() // … tell Browsersync to reload
        });
});

// delete all php files in dist/assets folder
gulp.task('php:clean', function(){
    return del('dist/**/*.php', { force: true });
});

// PHP compilation from views
gulp.task('php:compile', ['php:clean'], function(){
    return gulp.src('src/views/**/*.twig')
    // compile twig view to php files
        .pipe(twig({ data: JSON.parse(fs.readFileSync('src/json/color.json')), debug: true, extname: '.php' })) // import from data.json
        .pipe(gulp.dest('./dist/')) // where to put compiled PHP
        .on('end', function(){ // after compilation finishes…
            browserSync.reload() // … tell Browsersync to reload
        });
});

// Static files cleanup
gulp.task('static:clean', function(){
    return del([
        'dist/assets/**/*', // delete all files from src
        '!dist/assets/**/*.php', // except php files
        '!dist/assets/**/*.html', // except html files
        '!dist/assets/css/master.*', // and css
        '!dist/assets/**/*.map' // and sourcemaps
    ], { force: true });
});

// copy dependancy js
gulp.task('static:copy-js',['static:clean'], function(){
    return gulp.src([
			'node_modules/bootstrap/dist/js/bootstrap.min.*',
			'node_modules/popper.js/dist/umd/popper.min.*',
			'node_modules/jquery/dist/jquery.min.*',
      'node_modules/history.js/history.js'])
        .pipe(gulp.dest('dist/assets/js'));
});

// copy everything to static folder
gulp.task('static:copy', ['static:copy-js'], function(){
    return gulp.src('src/static/**/*')
        .pipe(gulp.dest('dist/assets'))
        .on('end', function(){ // after copying finishes…
            browserSync.reload() // … tell Browsersync to reload
        });
});

// copy static to public's assets
gulp.task('static:public', ['static:copy'],function(){
    return gulp.src('dist/assets/**/*')
        .pipe(gulp.dest('public/assets'));
});

// build everything
gulp.task('php:build', ['css:compile', 'php:compile', 'static:copy']);
gulp.task('build', ['css:compile', 'html:compile', 'static:copy']);

// copy to public after build everything
gulp.task('php:public', ['css:public', 'php:compile', 'static:public']);
gulp.task('public', ['css:public', 'html:compile', 'static:public']);

// development with automatic refreshing
gulp.task('develop', ['public'], function(){
    browserSync.init({ // initalize Browsersync
        // set what files be served
        server: {
            baseDir: 'dist', // serve from this folder
            serveStaticOptions: {
                // trying a extension when one isn't specified:
                // effectively means that http://localhost:3000/another-page shows another-page.php
                extensions: ['html']
            }
        },
		ui: {
			port: 8080,
			weinre: {
				port :9090
			}
		}
    });
    gulp.watch('src/scss/**/*', ['css:public']); // watch for changes in scss
    gulp.watch('src/json/**/*', ['html:compile']); // watch for changes in scss
    gulp.watch('src/views/**/*', ['html:compile']); // watch for changes in views
    gulp.watch('src/include/**/*', ['html:compile']); // watch for changes in include
    gulp.watch('src/static/**/*', ['static:public']); // watch for changes in static files
});

// development with automatic refreshing
gulp.task('php:develop', ['php:public'], function(){
    browserSync.init({ // initalize Browsersync
        // set what files be served
        server: {
            baseDir: 'dist', // serve from this folder
            serveStaticOptions: {
                // trying a extension when one isn't specified:
                // effectively means that http://localhost:3000/another-page shows another-page.php
                extensions: ['php']
            }
        },
		ui: {
			port: 8080,
			weinre: {
				port :9090
			}
		}
    });
    gulp.watch('src/scss/**/*', ['css:public']); // watch for changes in scss
    gulp.watch('src/json/**/*', ['php:compile']); // watch for changes in scss
    gulp.watch('src/views/**/*', ['php:compile']); // watch for changes in views
    gulp.watch('src/include/**/*', ['php:compile']); // watch for changes in include
    gulp.watch('src/static/**/*', ['static:public']); // watch for changes in static files
});

// deployment to surge.sh
gulp.task('deploy', ['build'], function(){
    return surge({
        project: 'dist',
        domain: 'https://wonnykim.surge.sh'
    })
});

// set develop as a default task (gulp runs this when you don't specify a task)
gulp.task('php', ['php:develop']);
gulp.task('default', ['develop']);
