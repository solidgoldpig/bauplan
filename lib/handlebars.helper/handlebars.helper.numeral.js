(function(moduleFactory) {
    if(typeof exports === "object") {
        module.exports = moduleFactory(require("lodash"), require("numeral"), require("cardinal"), require("handlebars"));
    } else if(typeof define === "function" && define.amd) {
        define(["underscore", "numeral", "cardinal", "handlebars"], moduleFactory);
    }
}(function(_, numeral, cardinal, Handlebars) {

    var NumeralHelpers = function() {

        /* numeral.js language configuration
        * language : english united kingdom (uk)
        * author : Dan Ristic : https://github.com/dristic
        */
        var enLanguage = {
            delimiters: {
                thousands: ",",
                decimal: "."
            },
            abbreviations: {
                thousand: "k",
                million: "m"
            },
            ordinal: function (number) {
                var b = number % 10;
                return (~~ (number % 100 / 10) === 1) ? "th" :
                (b === 1) ? "st" :
                (b === 2) ? "nd" :
                (b === 3) ? "rd" : "th";
            },
            currency: {
                symbol: "£"
            }
        };
        numeral.language("en", enLanguage);

        var defaults = {};
        var lang = "en";

        defaults.en = {
            zero: "n/a",
            number: "0,000[.]00",
            currency: "$0,000.00",
            byte: "0,000b"
        };

        function numeralHelper () {
            var args = Array.prototype.slice.call(arguments),
                options = args.pop(),
                helperType = args.shift(),
                number = args.shift(),
                format = args.shift(),
                formatParams = args.shift(),
                formatParams1 = args.shift(),
                formatParams2 = args.shift();

            if (options.hash && options.hash.params) {
                options.hash = _.extend({}, options.hash.params, options.hash);
                delete options.hash.params;
            }
            var params = options.hash;
            if (!number) {
                number = params.number;
            }
            number = +number;
            if (isNaN(number)) {
                number = 0;
            }

            var defaultFormat = defaults[lang][helperType];
            if (format === undefined) {
                format = params.format;
                if (format === undefined) {
                    format = defaultFormat;
                }
            }

            var numeralObj = numeral(number);

            return numeralObj.format(format);// + "; - " + format;
        }

        Handlebars.registerHelper("number", function(){
            [].unshift.call(arguments, "number");
            return numeralHelper.apply(this, arguments);
        });

        Handlebars.registerHelper("currency", function(){
            [].unshift.call(arguments, "currency");
            return numeralHelper.apply(this, arguments);
        });

        Handlebars.registerHelper("byte", function(){
            [].unshift.call(arguments, "byte");
            return numeralHelper.apply(this, arguments);
        });

        Handlebars.registerHelper("numeral", function(num){
            return cardinal.numeral(num);
        });

        Handlebars.registerHelper("ordinal", function(){
            var args = Array.prototype.slice.call(arguments);
            var options;
            if (typeof args[args.length-1] === "object") {
                options = args.pop();
            }

            var number = args.shift();
            var asNumber = args.shift();

            if (options.hash && options.hash.params) {
                options.hash = _.extend({}, options.hash.params, options.hash);
                delete options.hash.params;
            }
            var params = options.hash;
            if (!number) {
                number = params.number;
            }
            if (asNumber === undefined) {
                if (params.number !== undefined) {
                    asNumber = params.number;
                } else {
                    asNumber = params.asnumber;
                }
            }
            number = +number;

            var method = asNumber ? "ordinalAsNumber" : "ordinal";
            return cardinal[method](number);
        });

    };

    return {
        registerHelpers: function(hbars){
            Handlebars = hbars;
            NumeralHelpers();
        }
    };


}));