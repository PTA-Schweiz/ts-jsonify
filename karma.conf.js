module.exports = function(config) {
    config.set({
        frameworks: ["jasmine", "karma-typescript"],
        files: [
            { pattern: "lib/**/*.ts" },
            { pattern: "specs/**/*.ts" }
        ],

        preprocessors: {
            "lib/**/*.ts": ["karma-typescript", "coverage"],
            "specs/**/*.ts": ["karma-typescript"]
        },
        karmaTypescriptConfig: {
            compilerOptions: {
                allowJs: true
            }
        },
        reporters: ["progress", "karma-typescript"],
        browsers: ["Chrome"]
    });
};