import fs from "fs";
import gulp from "gulp";
import ejs from "gulp-ejs";
import sass from "gulp-sass";
import cssnext from "gulp-cssnext";
import plumber from "gulp-plumber";
import imagemin from "gulp-imagemin";
import prettify from "gulp-prettify";
import sourcemaps from "gulp-sourcemaps";
import browserSync from "browser-sync";


const path = {
    html  : "src/",
    layout: "src/layout",
    scss  : "src/css",
    img   : "src/img",
    built : "built"
}

gulp.task("browsersync", () => {
    browserSync.init({
        server: {
            baseDir: path.built,
            index: "index.html"
        },
        notify: true
    });
});

gulp.task("imagemin", () => gulp.src(`${path.img}**/*.*(jpg|png|gif|svg)`)
    .pipe(imagemin({}))
    .pipe(gulp.dest(path.built)));

gulp.task("template", () => {
    const variables = JSON.parse(fs.readFileSync("./src/variables.json"));
    gulp.src([`${path.html}**/*.ejs`, `!${path.layout}**/*.ejs`])
        .pipe(plumber())
        .pipe(ejs(variables, {"ext": ".html"}))
        .pipe(gulp.dest(path.built))
})

gulp.task("prettify", () => gulp.src(`${path.html}**/*.html`)
    .pipe(prettify({
        "brace_style": "collapse",
        "indent_size": 4,
        "indent_char": " "
    }))
    .pipe(gulp.dest(path.built))
    .pipe(browserSync.reload({
        stream: true
    }))
);

gulp.task("scss", () => gulp.src(`${path.scss}**/*.scss`)
    .pipe(sourcemaps.init())
    .pipe(plumber())
    .pipe(sass({
        outputStyle: "expanded"}))
    .on("error", error => console.log(error.message))
    .pipe(cssnext())
    .pipe(sourcemaps.write())
    .pipe(gulp.dest(path.built))
    .pipe(browserSync.reload({
        stream: true
    }))
);

gulp.task("watch", () => {
    gulp.watch([`${path.html}**/*.ejs`], ["template"]);
    gulp.watch([`${path.html}**/*.html`], ["prettify"]);
    gulp.watch([`${path.scss}**/*.scss`], ["scss"]);
    gulp.watch([`${path.img}**/*.+(jpg|png|gif|svg)`], ["imagemin"]);
});

gulp.task("default", ["browsersync", "template", "imagemin", "scss", "watch"]);
