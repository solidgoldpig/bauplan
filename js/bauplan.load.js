define([
    "bauplan",
    "jquery",
    "thorax",
    "larynx"
], function (Bauplan) {
/**
 * @description Load modules that require config
 * - initialises i18n {@link module:bauplan%i18n}
 * - requires
 *     - {@link module:bauplan%thorax%patch}
 *     - {@link module:bauplan%helpers}
 *     - {@link module:bauplan%ajax}
 *     - {@link module:bauplan%controls}
 * - initialises templates {@link module:bauplan%templates}
 *
 * @module bauplan%load
 */
    Bauplan.I18N.init(function () {
        require([
            "bauplan.thorax.patch",
            "bauplan.helpers",
            "bauplan.ajax",
            "bauplan.controls"
        ], function () {
            var views = [];
            //"default.abstract.view"
            var paths = Bauplan.Config.config.paths;
            for (var path in paths) {
                if (path.match(/\.view/)) {
                    views.push(path);
                }
            }
            require(views, function () {
                Bauplan.Templates.init(function () {
                    require(["bauplan.app"]);
                });
            });
        });
    });
});
