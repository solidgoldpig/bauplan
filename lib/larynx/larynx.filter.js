(function(moduleFactory) {
    if(typeof exports === 'object') {
        module.exports = moduleFactory(require('handlebars'));
    } else if(typeof define === 'function' && define.amd) {
        define(['handlebars'], moduleFactory);
    }
}(function(Handlebars) {


    var locale = "default";

    var filterRegister = {};
    filterRegister.uppercase = function (str) {
        return str.toUpperCase();
    };
    filterRegister.lowercase = function (str) {
        return str.toLowerCase();
    };
    filterRegister.camelcase = function (str) {
        return str.toLowerCase();
    };
    filterRegister.capitalize = function (str) {
        var words = str.split(" ");
        var capitalize = function() {
            return arguments[1].toUpperCase();
        };
        for (var word in words) {
            words[word] = words[word].replace(/^(["']*.)/, capitalize);
        }
        return words.join(" ");
    };


    filterRegister.titlecase = (function(){
        var small = "(a|an|and|as|at|but|by|en|for|if|in|of|on|or|the|to|v[.]?|via|vs[.]?)";
        var punct = "([!\"#$%&'()*+,./:;<=>?@[\\\\\\]^_`{|}~-]*)";

        var titleCaps = function(title){
            var parts = [],
                split = /[:.;?!] |(?: |^)["Ò]/g,
                index = 0;

            var upperAll = function(all){
                return (/[A-Za-z]\.[A-Za-z]/).test(all) ? all : upper(all);
            };

            var upperPunct = function(all, punct, word){
                return punct + upper(word);
            };

            while (true) {
                var m = split.exec(title);

                parts.push( title.substring(index, m ? m.index : title.length)
                    .replace(/\b([A-Za-z][a-z.'Õ]*)\b/g, upperAll)
                    .replace(RegExp("\\b" + small + "\\b", "ig"), lower)
                    .replace(RegExp("^" + punct + small + "\\b", "ig"), upperPunct)
                    .replace(RegExp("\\b" + small + punct + "$", "ig"), upper));

                index = split.lastIndex;

                if (m) {
                    parts.push(m[0]);
                } else {
                    break;
                }
            }

            return parts.join("").replace(/ V(s?)\. /ig, " v$1. ")
                .replace(/(['Õ])S\b/ig, "$1s")
                .replace(/\b(AT&T|Q&A)\b/ig, function(all){
                    return all.toUpperCase();
                });
        };

        function lower(word){
            return word.toLowerCase();
        }

        function upper(word){
          return word.substr(0,1).toUpperCase() + word.substr(1);
        }

        return titleCaps;
    })();

    var FilterHelper = function() {
        Handlebars.registerHelper("filter", function() {
            var args = Array.prototype.slice.call(arguments),
                options = args.pop(),
                str;

            if (args.length > 1 && !filterRegister[args[0]]) {
                // allow calls like {{filter content filterName}}
                str = args.shift();
            } else {
                // otherwise {{#filter filterName anotherFilter }}content{{/filter}}
                str = options.fn(this);
            }
            for (var arg in args) {
                if (filterRegister[args[arg]]) {
                    str = filterRegister[args[arg]](str);
                }
            }
            return str;
        });
    };

    var Filter = (function () {
        var external = {
            locale: function (loc) {
                if (loc) {
                    locale = loc;
                }
                return locale;
            },
            registerFilter: function (name, fn) {
                filterRegister[name] = fn;
            },
            unregisterFilter: function (name) {
                delete filterRegister[name];
            },
            registerHelper: function(hbars) {
                Handlebars = hbars;
                FilterHelper();
            }

        };
        return external;
    })();

    return Filter;
}));