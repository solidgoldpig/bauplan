define(function () {
/**
 * @description ## RequireJS for Bauplan bundle
 * Convenience module for loading lang and template files into same require context
 * @module bauplan%require
 */
    var defaultLoadMethods = {
        processKey: function defaultLoadMethodsprocessKey (key) {
            return key.replace(/^[^!]+!/, "");
        }
    };

    var BauplanRequire = {
        /**
         * @method load
         * @instance
         * @param {object} modules
         * @param {function} callback
         */
        load: function BauplanRequireLoad (modules, callback) {
            var lmodules;
            var moduleKeys;
            if (Array.prototype.isPrototypeOf(modules)) {
                lmodules = modules.slice(0);
            } else {
                delete modules.originalkeys;
                lmodules = [];
                for (var modprop in modules) {
                    lmodules.push(modprop);
                }
                moduleKeys = lmodules.slice(0);
            }

            // or did we pass options style?
            var keys;
            var options = {};
            if (typeof arguments[1] === "object") {
                options = arguments[1];
                callback = options.callback;
                keys = options.keys;
            }
            for (var meth in defaultLoadMethods) {
                if (!options[meth]) {
                    options[meth] = defaultLoadMethods[meth];
                }
            }
            options.defaults = defaultLoadMethods;


            if (options.preprocessModule) {
                lmodules.forEach(function(value, index, array) {
                    array[index] = options.preprocessModule(value, index, array, options);
                });
            }

            if (options.plugin) {
                lmodules.forEach(function(value, index, array) {
                    var addplugin = true;
                    var modvalue = modules[value];
                    if (modvalue) {
                        if (modvalue.match(/\.js$/)) {
                            addplugin = false;
                        } else if (modvalue.indexOf("//") === 0) {
                            addplugin = false;
                        } else if (modvalue.indexOf("!") !== -1) {
                            addplugin = false;
                        }
                    }
                    if (addplugin) {
                        array[index] = options.plugin + "!" + value;
                    }
                });
            }


            if (!keys) {
                keys = moduleKeys || modules.slice(0);
            }

            /*if (options.debug) {
                console.log("loading", lmodules, "into", keys, "using", modules);
            }*/

            this.require(lmodules, function() {
                //var loaded = Array.prototype.slice.call(arguments);
                var output = [];
                for (var i = 0, argslen = arguments.length; i < argslen; i++) {
                    var key = keys[i];
                    var value = arguments[i];
                    var processbundle = {
                        key: key,
                        value: value,
                        keys: keys
                    };
                    if (options.processKey) {
                        key = options.processKey(key, processbundle, options);
                    }
                    if (options.processValue) {
                        value = options.processValue(value, processbundle, options);
                    }
                    output.push({
                        key: key,
                        value: value
                    });
                }
                if (options.process) {
                    output = options.process(output, options);
                }
                //return output;
                if (callback) {
                    callback(output);
                }
            });
        },
        /**
         * @method paths
         * @instance
         * @param {object} modules
         * @param {object} options
         */
        paths: function (modules, options) {
            var paths = {};
            var originalkeys = [];
            var rgxJs = /\.js$/;
            var suffix = options.suffix;
            var rgxSuffix = new RegExp("-" + suffix + "$");
            var extension = options.extension;
            var rgxExtension = new RegExp("\\." + extension + "$");
            for (var module in modules) {
                var moduleval = modules[module];
                if (!moduleval.match(rgxJs)) {
                    if (!moduleval.match(rgxExtension)) {
                        moduleval += "." + extension;
                    }
                    /*if (moduleval.match(/^\/\//)) {
                        moduleval += ".js";
                    }*/
                }
                var modulekey = module;
                if (!modulekey.match(rgxSuffix)) {
                    modulekey = modulekey.replace(/\./g, "-") + "-" + suffix;
                }
                paths[modulekey] = moduleval;
                originalkeys.push(module);
            }

            this.require.config({
                paths: paths
            });

            paths.originalkeys = originalkeys;
            return paths;
            // if we want to reload a particular module file
            // a) require.undef(module) - not forgetting text! if needed
            // b) update the module's config path value
            // c) re-require it
            // also skip, if we already have the same details

            // wrap callback if needed
            //
            //paths = [];
        }
    };
    return BauplanRequire;
});

/*
http://rockycode.com/blog/cross-domain-requirejs-text/
requirejs.config({ 
    text: { 
        useXhr: function (url, protocol, hostname, port) { 
            //return true if you want to allow this url, given that the 
            //text plugin thinks the request is coming from protocol, 
hostname, port. 
        } 
    } 
});
*/