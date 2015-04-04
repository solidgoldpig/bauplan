(function(moduleFactory) {
    if(typeof exports === "object") {
        module.exports = moduleFactory(require("lodash"),require("handlebars"));
    } else if(typeof define === "function" && define.amd) {
        define(["lodash", "handlebars"], moduleFactory);
    }
}(function(_, Handlebars) {

    var locale = "default";

    var choiceRegister = {};
    function registerChoice (options) {
        // @param options.name {string}
        // @param options.fn {function}
        // @param [options.locale] {string} 
        options.locale = options.locale || locale;
        choiceRegister[options.locale] = choiceRegister[options.locale] || {};
        choiceRegister[options.locale][options.name] = options.fn;
    }
    function unregisterChoice (name, loc) {
        delete choiceRegister[loc][name];
    }

    var getPluralKeyword = function(num) {
        var keyword;
        if (num === 0) {
            keyword = "zero";
        } else if (num === 1) {
            keyword = "one";
        } else {
            keyword = "other";
        }
        return keyword;
    };
    var getPluralKeywordOptions = {
        name: "getPluralKeyword",
        fn: getPluralKeyword
    };
    var getBoolean = function(bool) {
        return bool ? "true" : "false";
    };
    registerChoice(getPluralKeywordOptions);
    getPluralKeywordOptions.locale = "en";
    registerChoice(getPluralKeywordOptions);

    //console.log(choiceRegister);

    var ChoiceHelpers = function() {
        Handlebars.registerHelper("choose", function() {
            var args = Array.prototype.slice.call(arguments),
                options = args.pop();

            var choiceOperationVar = args.shift();
            var that = _.extend({}, this || {});

            if (typeof choiceOperationVar === "function") {
                that.helperChoice = choiceOperationVar(options.hash);
            } else if (options.hash["function"]) {
                that.helperChoice = options.hash["function"](choiceOperationVar, options.hash);
                console.log("fn", that.helperChoice);
            } else if (typeof choiceOperationVar === "boolean") {
                that.helperChoice = getBoolean(choiceOperationVar);
            } else if (typeof choiceOperationVar === "number") {
                var getPluralKeyword = choiceRegister[locale].getPluralKeyword || choiceRegister["default"].getPluralKeyword;
                that.helperChoice = getPluralKeyword(choiceOperationVar);
            } else {
                that.helperChoice = choiceOperationVar;
            }
            var helperChoiceOption = options.hash[that.helperChoice];
            var chosenStr = helperChoiceOption !== undefined ? helperChoiceOption : options.fn(that);
            if (options.hash.trim !== false) {
                chosenStr = chosenStr.replace(/^\s*(.*)/, "$1").replace(/(.*)\s*$/, "$1");
            }
            return chosenStr;
        });
        Handlebars.registerHelper("choice", function() {
            var args = Array.prototype.slice.call(arguments),
                options = args.pop();
            var choiceVar = args.shift();
            if (!_.isArray(choiceVar)) {
                choiceVar = choiceVar.split(" ");
            }
           //console.log(this.helperChoice, choiceVar);

            return choiceVar.indexOf(this.helperChoice) !== -1 ? options.fn(this) : "";
        });
    };

    var Choice = (function () {
        var external = {
            locale: function (loc) {
                if (loc) {
                    locale = loc;
                    if (!choiceRegister[locale]) {
                        choiceRegister[locale] = {};
                    }
                }
                return locale;
            },
            registerHelpers: function(hbars) {
                Handlebars = hbars;
                ChoiceHelpers();
            }
        };
        return external;
    })();

    return Choice;

}));