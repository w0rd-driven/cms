var gulp = require("gulp");

// Include plugins
var plugins = require("gulp-load-plugins")({
  pattern: ["gulp-*", "gulp.*", "main-bower-files", "del", "glob", "browser-sync"],
  replaceString: /\bgulp[\-.]/
});

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

gulp.task("bower", ["clean"], function() {
  return gulp.src(plugins.mainBowerFiles({ includeDev: true }), { base: config.paths.bower.source })
    .pipe(gulp.dest(config.paths.bower.destination));
});

gulp.task("clean", function() {
  return plugins.del(["build/**"]);
});

gulp.task("html", ["javascript", "images", "fonts", "verbatim", "documentation", "css", "sass"], function() {
  return gulp.src(config.paths.html.source)
    .pipe(plugins.inject(gulp.src(plugins.mainBowerFiles({ includeDev: true }), { read: false, cwd: config.paths.bower.source }), {
      addRootSlash: false,
      ignorePath: config.paths.html.destination,
      name: "bower",
      addPrefix: "lib"
    }))
    .pipe(plugins.minifyHtml())
    .pipe(gulp.dest(config.paths.html.destination));
});

gulp.task("javascript", function() {
  return gulp.src(config.paths.javascript.source)
    .pipe(plugins.sourcemaps.init())
    .pipe(plugins.concat("app.min.js"))
    .pipe(plugins.uglify())
    .pipe(plugins.sourcemaps.write())
    .pipe(gulp.dest(config.paths.javascript.destination));
});

gulp.task("css", function() {
  return gulp.src(config.paths.css.source)
    .pipe(plugins.sourcemaps.init())
    .pipe(plugins.cssmin())
    .pipe(plugins.sourcemaps.write("."))
    .pipe(gulp.dest(config.paths.css.destination))
    .pipe(plugins.browserSync.reload({stream: true}));
});

gulp.task("images", function() {
  return gulp.src(config.paths.images.source)
    .pipe(plugins.imagemin({
      progressive: true,
      interlaced: true
    }))
    .pipe(gulp.dest(config.paths.images.destination));
});

gulp.task("less", function() {
  return gulp.src(config.paths.less.source)
    .pipe(plugins.sourcemaps.init())
    .pipe(plugins.less({
      paths: ["bower_components/bootstrap/less"]
    }))
    .pipe(plugins.uncss({
      html: plugins.glob.sync(config.paths.html.source),
    }))
    .pipe(plugins.concat("main.min.css"))
    .pipe(plugins.sourcemaps.write("."))
    .pipe(gulp.dest(config.paths.css.destination))
    .pipe(plugins.filter("**/*.css"))
    .pipe(plugins.browserSync.reload({stream: true}));
});

gulp.task("sass", function() {
  return gulp.src(config.paths.sass.source)
    .pipe(plugins.sourcemaps.init())
    .pipe(plugins.sass({
      outputStyle: "compressed",
      includePaths: [ config.paths.bower.source + "/bootstrap-sass/assets/stylesheets", config.paths.bower.source + "/font-awesome/scss" ],
      sourceComments: false
    }).on("error", plugins.sass.logError))
    .pipe(plugins.uncss({
      html: plugins.glob.sync(config.paths.html.source),
    }))
    .pipe(plugins.concat("main.min.css"))
    .pipe(plugins.sourcemaps.write("."))
    .pipe(gulp.dest(config.paths.css.destination))
    .pipe(plugins.filter("**/*.css"))
    .pipe(plugins.browserSync.reload({stream: true}));
});

gulp.task("fonts", function() {
  return gulp.src(config.paths.fonts.source)
    .pipe(gulp.dest(config.paths.fonts.destination));
});

gulp.task("verbatim", function() {
  return gulp.src(config.paths.verbatim.source)
    .pipe(gulp.dest(config.paths.verbatim.destination));
});

gulp.task("documentation", function() {
  return gulp.src(config.paths.documentation.source)
    .pipe(gulp.dest(config.paths.documentation.destination));
});

gulp.task("browser-sync", ["bower"], function() {
  return plugins.browserSync({
    server: {
      baseDir: config.paths.html.destination
    }
  });
});

gulp.task("watch", ["build"], function() {
  // Watch .html files
  gulp.watch(config.paths.html.source, ["html", plugins.browserSync.reload]);
  // Watch .js files
  gulp.watch(config.paths.javascript.source, ["javascript", plugins.browserSync.reload]);
  // Watch image files
  gulp.watch(config.paths.images.source, ["images", plugins.browserSync.reload]);
  // Watch font files
  gulp.watch(config.paths.fonts.source, ["fonts", plugins.browserSync.reload]);
  // Watch for files we copy verbatim
  gulp.watch(config.paths.verbatim.source, ["verbatim", plugins.browserSync.reload]);
  // Watch .md files
  gulp.watch(config.paths.documentation.source, ["documentation", plugins.browserSync.reload]);

  // Watch .css files
  gulp.watch(config.paths.css.source, ["css"]);
  // Watch .less files
  //gulp.watch(config.paths.less.source, ["less"]);
  // Watch .scss files
  gulp.watch(config.paths.sass.source, ["sass"]);

  // Watch bower files
  gulp.watch(config.paths.bower.source, ["bower", plugins.browserSync.reload]);
});

// We only run the node tasks, relying on their dependencies to finish first
gulp.task("build", ["bower"], function() {
  gulp.start("html");
});

// Default Task
gulp.task("default", ["watch", "browser-sync"]);
