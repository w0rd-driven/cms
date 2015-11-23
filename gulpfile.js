var gulp           = require("gulp"),
  minifyHTML     = require("gulp-minify-html"),
  concat         = require("gulp-concat"),
  uglify         = require("gulp-uglify"),
  cssmin         = require("gulp-cssmin"),
  uncss          = require("gulp-uncss"),
  imagemin       = require("gulp-imagemin"),
  sourcemaps     = require("gulp-sourcemaps"),
  mainBowerFiles = require("main-bower-files"),
  inject         = require("gulp-inject"),
  less           = require("gulp-less"),
  sass           = require("gulp-sass"),
  filter         = require("gulp-filter"),
  glob           = require("glob"),
  browserSync    = require("browser-sync");

var config = {
  paths: {
    bower: {
      source: "bower_components",
      destination: "build/lib"
    },
    html: {
      source:  "app/**/*.html",
      destination: "build"
    },
    javascript: {
      source:  ["app/js/**/*.js"],
      destination: "build/js"
    },
    css: {
      source: ["app/css/**/*.css"],
      destination: "build/css"
    },
    images: {
      source: ["app/images/**/*.jpg", "app/images/**/*.jpeg", "app/images/**/*.png"],
      destination: "build/images"
    },
    less: {
      source: ["app/less/**/*.less", "!app/less/includes/**"],
      destination: "build/css"
    },
    sass: {
      source: ["app/sass/**/*.scss", "!app/sass/includes/**"],
      destination: "build/css"
    },
    fonts: {
      source: ["app/fonts/**", "bower_components/font-awesome/fonts/**"],
      destination: "build/fonts"
    },
    verbatim: {
      source: ["app/manifest.json", "app/favicon.png"],
      destination: "build"
    },
    documentation: {
      source:  ["app/**/*.md"],
      destination: "build"
    }
  }
};

gulp.task("bower", function(){
  return gulp.src(mainBowerFiles({ includeDev: true }), { base: config.paths.bower.source })
    .pipe(gulp.dest(config.paths.bower.destination));
});

gulp.task("html", function(){
  return gulp.src(config.paths.html.source)
    .pipe(inject(gulp.src(mainBowerFiles({ includeDev: true }), { read: false, cwd: config.paths.bower.source }), {
      name: "bower",
      addPrefix: "lib"
    }))
    .pipe(minifyHTML())
    .pipe(gulp.dest(config.paths.html.destination));
});

gulp.task("javascript", function(){
  return gulp.src(config.paths.javascript.source)
    .pipe(sourcemaps.init())
    .pipe(concat("app.min.js"))
    .pipe(uglify())
    .pipe(sourcemaps.write())
    .pipe(gulp.dest(config.paths.javascript.destination));
});

gulp.task("css", function(){
  return gulp.src(config.paths.css.source)
    .pipe(sourcemaps.init())
    .pipe(cssmin())
    .pipe(sourcemaps.write("."))
    .pipe(gulp.dest(config.paths.css.destination))
    .pipe(browserSync.reload({stream: true}));
});

gulp.task("images", function(){
  return gulp.src(config.paths.images.source)
    .pipe(imagemin({
      progressive: true,
      interlaced: true
    }))
    .pipe(gulp.dest(config.paths.images.destination));
});

gulp.task("less", function(){
  return gulp.src(config.paths.less.source)
    .pipe(sourcemaps.init())
    .pipe(less({
      paths: ["bower_components/bootstrap/less"]
    }))
    .pipe(uncss({
      html: glob.sync(config.paths.html.source),
    }))
    .pipe(concat("main.min.css"))
    .pipe(sourcemaps.write("."))
    .pipe(gulp.dest(config.paths.css.destination))
    .pipe(filter("**/*.css"))
    .pipe(browserSync.reload({stream: true}));
});

gulp.task("sass", function(){
  return gulp.src(config.paths.sass.source)
    .pipe(sourcemaps.init())
    .pipe(sass({
      outputStyle: "compressed",
      includePaths: [ config.paths.bower.source + "/bootstrap-sass/assets/stylesheets", config.paths.bower.source + "/font-awesome/scss" ],
      sourceComments: false
    }).on("error", sass.logError))
    .pipe(uncss({
      html: glob.sync(config.paths.html.source),
    }))
    .pipe(concat("main.min.css"))
    .pipe(sourcemaps.write("."))
    .pipe(gulp.dest(config.paths.css.destination))
    .pipe(filter("**/*.css"))
    .pipe(browserSync.reload({stream: true}));
});

gulp.task("fonts", function () {
  return gulp.src(config.paths.fonts.source)
    .pipe(gulp.dest(config.paths.fonts.destination));
});

gulp.task("verbatim", function(){
  return gulp.src(config.paths.verbatim.source)
    .pipe(gulp.dest(config.paths.verbatim.destination));
});

gulp.task("documentation", function () {
  return gulp.src(config.paths.documentation.source)
    .pipe(gulp.dest(config.paths.documentation.destination));
});

gulp.task("browser-sync", function() {
  return browserSync({
    server: {
      baseDir: config.paths.html.destination
    }
  });
});

gulp.task("build", ["bower", "html", "javascript", "images", "fonts", "verbatim", "documentation", "css", "sass"]);

gulp.task("default", ["build", "browser-sync"], function(){
  // Watch .html files
  gulp.watch(config.paths.html.source, ["html", browserSync.reload]);
  // Watch .js files
  gulp.watch(config.paths.javascript.source, ["javascript", browserSync.reload]);
  // Watch image files
  gulp.watch(config.paths.images.source, ["images", browserSync.reload]);
  // Watch font files
  gulp.watch(config.paths.fonts.source, ["fonts", browserSync.reload]);
  // Watch for files we copy verbatim
  gulp.watch(config.paths.verbatim.source, ["verbatim", browserSync.reload]);
  // Watch .md files
  gulp.watch(config.paths.documentation.source, ["documentation", browserSync.reload]);

  // Watch .css files
  gulp.watch(config.paths.css.source, ["css"]);
  // Watch .less files
  //gulp.watch(config.paths.less.source, ["less"]);
  // Watch .scss files
  gulp.watch(config.paths.sass.source, ["sass"]);

  // Watch bower files
  gulp.watch(config.paths.bower.source, ["bower", browserSync.reload]);
});
