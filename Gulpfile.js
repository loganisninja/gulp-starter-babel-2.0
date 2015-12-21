// GLOBALS
var gulp         = require("gulp");
		plugins      = require("gulp-load-plugins")(),
		runSequence  = require("run-sequence"),
		del          = require("del"),
		browserSync	 = require("browser-sync").create();


// DIRECTORIES
var dir = {
	root 			: "http://fe-boiler.dev",
	public		: "../public/",
	source 		: "assets/",
	init 			: function() {
		this.dest = this.public + this.source
	}
};
dir.init();


// PATHS
var scripts 	= "scripts/",
		styles 		= "styles/",
		images 		= "images/",
		modules 	= "modules/",
		vendor 		= "node_modules/",
		icons 		= "icons/",
		fonts 		= "fonts/";


// WATCH GLOBS
var watchScripts 		= [ dir.source + scripts + "*.js", dir.source + scripts + "**/*.js", dir.source + scripts + "**/**/*.js", ],
		watchStyles 		= [ dir.source + styles + "*.scss", dir.source + styles + "**/*.scss", dir.source + styles + "**/**/*.scss", ],
		watchViews			= [ dir.public + "*.php", dir.public + "**/*.php", dir.public + "**/**/*.php",];


// CLEAN (DELETE) PRODUCED ASSETS
gulp.task("clean", function(callback) { del(dir.dest); }); 


// MOVE PROJECT DEPENDENCIES INTO THEIR CORRECT WORKING DIRECTORIES
gulp.task("vendor", function() {

  // JQUERY DEPENDENCY
  gulp.src( vendor + "jquery/dist/jquery.min.js" )
  .pipe(gulp.dest( dir.dest + scripts ));
});


// STYLE DEVELOPMENT TASK
gulp.task("style", function() {
  return gulp.src( dir.source + styles + "app.scss" )
  .pipe(plugins.plumber(function(error) {
    plugins.util.log(
      plugins.util.colors.red(error.message),
      plugins.util.colors.yellow('\r\nOn line: '+error.line),
      plugins.util.colors.yellow('\r\nCode Extract: '+error.extract)
      );
    this.emit('end');
  }))
  .pipe(plugins.sass())
  .pipe(plugins.rucksack({
    autoprefixer: true
  }))
  .pipe(plugins.rename('app.css'))
  .pipe(gulp.dest( dir.dest + styles ))
  .pipe(browserSync.stream())
  .pipe(plugins.minifyCss())
  .pipe(plugins.rename('app.min.css'))
  .pipe(gulp.dest( dir.dest + styles ))
});


// JAVASCRIPT DEVELOPMENT TASK
gulp.task("script", function() {
  return gulp.src( dir.source + scripts + "**" )
  .pipe(plugins.plumber(function(error) {
    plugins.util.log(
      plugins.util.colors.red(error.message),
      plugins.util.colors.yellow('\r\nOn line: '+error.line),
      plugins.util.colors.yellow('\r\nCode Extract: '+error.extract)
      );
    this.emit('end');
  }))
  .pipe(plugins.babel())
  .pipe(plugins.concat('app.js'))
  .pipe(gulp.dest( dir.dest + scripts ))
  .pipe(plugins.uglify())
  .pipe(plugins.rename('app.min.js'))
  .pipe(gulp.dest( dir.dest + scripts ))
  .pipe(browserSync.stream());
});


// IMAGE TASK - COPY & COMPRESS
gulp.task("image", function() {
  return gulp.src( dir.source + images + "**" )
    .pipe(plugins.imagemin({
      progressive: true,
      interlaced: true,
      svgoPlugins: [{removeUnknownsAndDefaults: false}, {cleanupIDs: false}]
    }))
    .pipe(gulp.dest( dir.dest + images ))
});


// ICONFONTS TASK - reference for svg setup: https://github.com/nfroidure/gulp-iconfont
gulp.task('iconfont', function() {
  gulp.src([ dir.source + icons + 'svg/*.svg'])
    .pipe(plugins.iconfont({ fontName: 'website-icons' }))
    .on('glyphs', function(glyphs, options) {
      gulp.src( dir.source + icons + 'iconfont.template')
        .pipe(plugins.consolidate('lodash', {
          glyphs: glyphs,
          fontName: 'website-icons',
          fontPath: '../fonts/',
          timestamp: Date.now(),
          className: 'icon'
        }))
        .pipe(plugins.rename('_iconfont.scss'))
        .pipe(gulp.dest( dir.source + styles + 'common/'));
    })
    .pipe(gulp.dest( dir.source + fonts ));

  gulp.src( dir.source + icons + 'flexslider/*')
    .pipe(gulp.dest( dir.source + fonts ));
});


// FONTS TASK
gulp.task('font', ["iconfont"], function() {
  return gulp.src( dir.source + fonts + "**" )
    .pipe(gulp.dest( dir.dest + fonts ))
});


// MODULES TASK - A task to be used lightly, only when it's possible to limit a library/module (such as a calendar or lightbox) to a single or few pages it's being used on.
gulp.task("modules", function() {
	return gulp.src( dir.source + modules + "**" )
		.pipe(gulp.dest( dir.dest + modules ))
});


// START BROWSERSYNC TASKS

	// MAIN BROWSERSYNC TASK
	gulp.task("watch", ["script", "style"], function() {

		// Serve files from the root of this project
		browserSync.init({
			proxy : dir.root
		});

		// Watch file tasks and run corresponding tasks
		gulp.watch( watchScripts, ["script"] );
		gulp.watch( watchStyles, ["style"] );
		gulp.watch( watchViews ).on("change", browserSync.reload);
	});

	
// END BROWSERSYNC TASKS


// INITIALIZE PROJECT TASK
gulp.task("default", function(callback) {
  runSequence("vendor",
              "style",
              "script",
              "image",
              "font",
              "modules",
              callback);
});



