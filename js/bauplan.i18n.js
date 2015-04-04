define([], function () {
/**
* @module bauplan%i18n
* @description ## Internationalisation (i18n)
* 
* Loads and parse lang files for use by Larynx and specifically {@link template:phrase}, the Larynx Handlebars helper
*
* As the phrase helper is essentially a Handlebars template in its own right, it can contain variables and nested phrases
*
* @see template:phrase
*
* @return {instance} BauplanI18N
*/
    var BauplanI18N = {
        langs: {},
        raw: {},
        parsed: {},
        /**
         * @method init
         * @param  {function} callback
         * @instance
         */
        init: function (callback) {
            this.load(this.Config.config.langs, callback);
        },
        /**
         * @method load
         * @instance
         * @description Load app lang files
         * @param {object} langs Language path key/value pairs
         * @param {function} callback
         */
        load: function BauplanI18NLoad (langs, callback) {
            var paths = this.Require.paths(langs, {
                suffix: "lang",
                extension: "properties"
            });
            var i18n = this;
            this.Require.load(paths, {
                plugin: "text",
                paths: paths,
                keys: paths.originalkeys,
                callback: function(langs) {
                    i18n.process(langs, callback);
                }
            });
        },
        /**
         * @method process
         * @instance
         * @param {array} langs Array of language key/value pairs
         * @param {function} callback
         * @description Parses all lang files and then merges the results for all defined locales
         *
         * First specified values for a phrase key are always honoured
         */
        process: function (langs, callback) {
            var tlangs = {};
            for (var lang = 0, langmax = langs.length; lang < langmax; lang++) {
                var data = langs[lang];
                var loc = data.key;
                if (!this.raw[loc] || this.raw[loc] !== data.value) {
                    this.raw[loc] = data.value;
                    this.parsed[loc] = this.parse(data.value);
                }
                var normalisedloc = loc.replace(/\..*$/, "");
                tlangs[normalisedloc] = tlangs[normalisedloc] || {};
                for (var phrase in this.parsed[loc]) {
                    tlangs[normalisedloc][phrase] = this.parsed[loc][phrase];
                }
            }
            var deflang = this.defaultlang();
            for (var dlang in tlangs) {
                if (dlang !== deflang) {
                    for (var dphrase in tlangs[deflang]) {
                        if (tlangs[dlang][dphrase] === undefined) {
                            tlangs[dlang][dphrase] = tlangs[deflang][dphrase];
                        }
                    }
                }
            }
            this.langs = tlangs;
            if (callback) {
                callback(this.langs);
            }
            return this.langs;
        },
        /**
         * @method parse
         * @instance
         * @param {string} data
         * @description Parses a string representing a resource bundle .properties file
         * 
         * - lines beginning with comments are ignored
         * - values can span multiple lines
         * 
         * @return {object} lang
         */
        parse: function parseLangProperties (data) {
            var lang = {};
            var dataLines = data.split("\n");
            dataLines[dataLines.length-1] = dataLines[dataLines.length-1].replace(/\s+$/, "");
            var lineProp;

            for (var l = 0, dataLen = dataLines.length; l < dataLen; l++) {
                var line = dataLines[l];
                if (line.indexOf("#") === 0) {
                    continue;
                }
                if (line.indexOf("\\#") === 0) {
                    line = line.replace(/^\\/, "");
                }
                var lineVal = line;
                var lineMatch = line.match(/^([\S]+?)\s*=\s*(.*)/);
                if (lineMatch) {
                    if (l) {
                        dataLines[l-1] = dataLines[l-1].replace(/\s+$/, "");
                    }
                    lineProp = lineMatch[1];
                    lineVal = lineMatch[2];
                } else {
                    lineVal = "\n" + lineVal;
                }
                if (!lang[lineProp]) {
                    lang[lineProp] = "";
                }
                lang[lineProp] += lineVal;
            }

            return lang;
        },
        /**
         * @method defaultlang
         * @description Gets the default language as specified in the config
         * @instance
         * @return {string} Default language
         */
        defaultlang: function() {
            return this.Config.config.defaultlang;
        }
    };
    return BauplanI18N;
});