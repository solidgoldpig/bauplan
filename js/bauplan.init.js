if (!this.BauplanData) {
    this.BauplanData = {};
}
define([], function () {
/**
 * @description ## App bootstraper
 * - load config files
 * - merge config files
 * - set requirejs config to resulting config
 * - require {@link module:Bauplan}
 * - require {@link module:bauplan%load}
 *     - initialises i18n {@link module:bauplan%i18n}
 *     - requires
 *         - {@link module:bauplan%thorax%patch}
 *         - {@link module:bauplan%helpers}
 *         - {@link module:bauplan%ajax}
 *         - {@link module:bauplan%controls}
 *     - initialises templates {@link module:bauplan%templates}
 * - require {@link module:bauplan%app}
 * 
 * @module bauplan%init
 */
    var cfgs = [];
    var config = BauplanConfig;
    var callback = config.callback;
    delete config.callback;
    function processConfigs () {
        define("default.shim", [], function() {
            if (!this.console) {
                this.console = {
                    log: function () {}
                };
            }
        });
        require(["default.shim"], function () {


            config.original = BauplanConfig;
            config.searchpaths = cfgs;

            //require(cfgs, function() {
            //    for (var ai = 0, aimax = arguments.length; ai < aimax; ai++) {
            //        var cfg = cfgs[ai];
            //        config[cfg] = arguments[ai];
            //    }

            for (var conf = 0, confmax = cfgs.length; conf < confmax; conf++) {
                var cfg = cfgs[conf];
                if (!config[cfg].baseUrl) {
                        if (BauplanConfig[cfg] && BauplanConfig[cfg].baseUrl) {
                            config[cfg].baseUrl = BauplanConfig[cfg].baseUrl;
                        } else {
                            config[cfg].baseUrl = BauplanConfig.baseUrl;
                        }
                }
            }

            var fileprotocol = typeof location !== "undefined" && location.protocol === "file:";
            function baseify (path, base) {
                if (base) {
                    if (typeof path === "string") {
                        if (path.indexOf("/") !== 0) {
                            path = base + path;
                        } else if (fileprotocol && path.indexOf("//") === 0) {
                            path = "https:" + path;
                        }
                    } else {
                        for (var pi = 0; pi < path.length; pi++) {
                            if (path[pi].indexOf("/") !== 0) {
                                path[pi] = base + path[pi];
                            } else if (fileprotocol && path[pi].indexOf("//") === 0) {
                            path[pi] = "https:" + path[pi];
                        }
                        }
                    }
                }
                return path;
            }
            function mergeConfig (conf, type, options) {
                if (conf[type] === undefined) {
                    return;
                }
                config[type] = config[type] || {};
                options = options || {};
                if (typeof options === "string") {
                    var opts = options.split(" ");
                    options = {};
                    for (var oi = 0; oi < opts.length; oi++) {
                        options[opts[oi]] = true;
                    }
                }
                if (options.keys) {
                    var base = config.baseUrl;
                    for (var prop in conf[type]) {
                        var propval = conf[type][prop];
                        if (options.baseify) {
                            propval = baseify(propval, base);
                        }
                        config[type][prop] = propval;
                    }
                } else {
                    config[type] = conf[type];
                }
            }

            var spaths = cfgs || [];

            for (var cfig in spaths) {
                var spath = config[spaths[cfig]];
                if (!spath) {
                    continue;
                }
                mergeConfig(spath, "waitSeconds");
                mergeConfig(spath, "map");
                mergeConfig(spath, "shim", "keys");
                mergeConfig(spath, "paths", "baseify keys");
                mergeConfig(spath, "templates", "baseify keys");
                mergeConfig(spath, "langs", "baseify keys");
                mergeConfig(spath, "defaultlang");
            }

            require.config(config);
            // Thorax needs _ and Handlebars to exist in the global scope
            require(["underscore", "handlebars"], function(_, Handlebars) {
                // Load bauplan and then let bauplan load
                require(["bauplan"], function (Bauplan) {
                    Bauplan.namespace("Config");
                    Bauplan.Config.config = config;
                    Bauplan.Config.callback = callback;
                    require(["bauplan.load"]);
                });
            });

        });
    }

    /**
     * @function loadConfig
     * @description [loadConfig description]
     * @param {url} conf Configuration file URL
     */
    function loadConfig(conf) {
        //conf = [conf];
        require([conf], function (Conf) {
            cfgs.unshift(conf);
            config[conf] = Conf;
            //for (var ai = 0, aimax = arguments.length; ai < aimax; ai++) {
            if (Conf.deps) {
                loadConfig(Conf.deps);
            } else {
                processConfigs();
            }
        });
    }

    require.config(BauplanConfig);
    loadConfig(BauplanConfig.config);
});

require.defineBasicView = function defineBasicView (options) {
    define([
        "bauplan"
    ], function (Bauplan) {
        if (typeof options === "string") {
            options = {
                name: options
            };
        }
        return Bauplan.View.extend(options);
    });
};
