(function(moduleFactory) {
    if(typeof exports === "object") {
        module.exports = moduleFactory(require("lodash"), require("handlebars"));
    } else if(typeof define === "function" && define.amd) {
        define(["underscore", "handlebars"], moduleFactory);
    }
}(function(_, Handlebars) {

    var languageRegister;
    var phraseRegister = {};
    var phraseStrings = {}; // raw lang strings that can be reurned as is
    var phraseTemplates = {}; // compiled lang template cache
    var locale = "default";
    var pendDelimiter = ".";

    var Phrase = (function () {
        // Larynx
        // Lungs, Pulmonary, Pneumatic, Trachea

        var PhraseHelper = function() {
            var args = Array.prototype.slice.call(arguments);
            var isGet = false;
            if (args[0] === "get") {
                isGet = true;
                args.shift();
            }
            // if we don't pass key, how can we tell that arg isn't a locale?
            var key = args[0];
            var originalKey = key;
            var params = {};
            var options = args[args.length-1];
            var tmpLocale = args.length === 3 ? args[1] : locale;

            if (!phraseRegister[tmpLocale]) {
                phraseRegister[tmpLocale] = {};
                phraseStrings[tmpLocale] = {};
                phraseTemplates[tmpLocale] = {};
            }
            // allow helper context to be overridden
            try {
                // add in this before opions.hash.params
                // however, that means all vars rampage through all scopes
                params = _.extend({}, (options.hash.params || {}), options.hash);
                delete options.hash.params;
            } catch (e) {
                console.log(e, options, arguments);
            }
            if (params._append) {
                key += pendDelimiter + params._append;
                if (params._appendix) {
                    key += pendDelimiter + params._appendix;
                }
            }
            if (params._prepend) {
                key = params._prepend + pendDelimiter + key;
                if (params._prependix) {
                    key = params._prependix + pendDelimiter + key;
                }
            }

            if (!phraseRegister[tmpLocale][key]) {
                // phraseLocale
                var templateString = languageRegister[tmpLocale][key];
                if (templateString !== undefined) {
                    if (templateString.indexOf("{{") === -1) {
                        phraseStrings[tmpLocale][key] = templateString;
                        // possible to cache if compilable but
                        // just reference to another static phrase?
                    } else {
                        phraseTemplates[tmpLocale][key] = Handlebars.compile(templateString);
                    }
                }
                phraseRegister[tmpLocale][key] = true;
            }

            var langValue;
            if (phraseStrings[tmpLocale][key]) {
                langValue = phraseStrings[tmpLocale][key];
            } else if (phraseTemplates[tmpLocale][key]) {

                // if view keys were excluded, could cache the ouput to, based on stringification of what's left
                // but would that be any quicker?
                var data = _.extend({}, this, params);
                var template = phraseTemplates[tmpLocale][key];
                langValue = template.call(this, data);
            } else {
                if (!isGet) {
                    langValue = key;
                    if (key.indexOf(" ") === -1) {
                        //langValue = "{{" + langValue + "}}";
                    }
                }
            }
            if (langValue && params._debug) {
                langValue = '<phrase data-phrase-key="' + key + '">' + langValue + "</phrase>";
            }
            return langValue ? new Handlebars.SafeString(langValue) : "";
        };

        function F() {}
        F.prototype = {};
        var external = new F();

        external.locale = function (loc) {
            if (loc) {
                locale = loc;
            }
            return locale;
        };
        external.get = function (phrase, args, context, locale) {
            if (!args) {
                args = {};
            }
            context = context || this;
            var params = ["get", phrase, {hash: args}];
            if (locale) {
                params.splice(1, 0, locale);
            }
            return PhraseHelper.apply(context, params);
        };
        external.getString = function (phrase, args, context, locale) {
            var value = external.get(phrase, args, context, locale);
            return value ? value.toString() : undefined;
        };
        external.setLanguages = function(languages) {
            phraseRegister = {};
            phraseStrings = {};
            phraseTemplates = {};
            languageRegister = languages;
        };
        external.registerHelper = function(hbars) {
            Handlebars = hbars;
            Handlebars.registerHelper("phrase", PhraseHelper);
        };

        return external;
    })();

    return Phrase;

}));