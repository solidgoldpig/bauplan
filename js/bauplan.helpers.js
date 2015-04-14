/**
 * @module bauplan%helpers
 * @description ## Helpers for Handlebars
 * Registers helpers provided by [Larynx](http://larynx.solidgoldpig.com), setting locale and languages
 * Registers additional helpers
 *
 * ### Additional helpers
 * - {@link template:asset}
 * - {@link template:price}
 * - {@link template:console}
 * - {@link template:compile}
 * - {@link template:link}
 * - {@link template:if}
 * - {@link template:all}
 * - {@link template:or}
 *
 * ### Client-side
 * - {@link template:routeurl}
 * - {@link template:authrouteurl}
 * - {@link template:layout}
 */
(function (moduleFactory) {
    if (typeof exports === "object") {
        module.exports = moduleFactory(
            require("lodash"),
            require("bauplan"),
            require("handlebars"),
            require("larynx")
        );
    } else if (typeof define === "function" && define.amd) {
        define([
            "lodash",
            "bauplan",
            "handlebars",
            "larynx",
            "jquery",
            "thorax",
            "router"
        ], moduleFactory);
    }
}(function (
    _,
    Bauplan,
    Handlebars,
    Larynx,
    jQuery,
    Thorax,
    Router
) {

    // Set up Larynx helpers
    Larynx.registerHelpers(Handlebars);
    Larynx.setLanguages(Bauplan.I18N.langs);

    // Convenience filter for phrases
    Larynx.Phrase.setFilter(function (str) {
        return str.replace(/##(.*?)##/g, "<span>$1</span>");
    });

    // Register additional helpers

    /**
     * @template asset
     * @block helper
     * @description  Outputs an asset path using an i18n key
     *
     * Given a i18n key/value pair: "logo.src=/path/to/logo.png"
     * 
     *     <img src="{{asset "logo.src"}}"> -> '<img src="/path/to/logo.png">'
     *
     * asset is currently just a wrapper for Handlebars.helpers.phrase
     */
    Handlebars.registerHelper("asset", function () {
        return Handlebars.helpers.phrase.apply({}, arguments);
    });

    /**
     * @template currentTime
     * @block helper
     * @description Outputs the current time
     *
     *     {{currentTime}}
     */
    Handlebars.registerHelper("currentTime", function (block) {
        return Date.now();
    });

    /**
     * @template price
     * @block helper
     * @param {number} 0 Amount
     * @description Outputs an amount in 1/100th of monetary unit as monetary unit
     *
     *     {{price 2999}} -> "29.99"
     * 
     *     {{price 3000}} -> "30"
     *
     * Calls Handlebars.helpers.number, so accepts the same arguments and has the same defaults, eg.
     *
     *     {{price 3000 format="0.00"}} -> "30.00"
     */
    Handlebars.registerHelper("price", function (block) {
        var args = Array.prototype.slice.call(arguments);
        var price = args[0];
        if (price) {
            args[0] = price/100;
        }
        return Handlebars.helpers.number.apply({}, args);
    });

    /**
     * @template console
     * @block helper
     * @param {*} 0 Item to dump
     * @description Dumps output using console.log
     * 
     *     {{console foo}}
     */
    Handlebars.registerHelper("console", function (block) {
        console.log(arguments[0], Date.now());
    });

    /**
     * @template compile
     * @block helper
     * @param {string} 0 String to compile
     * @param {string} [context] Pass a different context - (the value must be a property key of the current context)
     * @description Compile a string as a template
     *
     * Given a context where {bar: "baz", wham: {bar: "whizz"}}
     * 
     *     {{compile "foo {{bar}}"}} -> "foo bar"
     *
     *     {{{compile "foo {{bar}}" context="wham"}}} -> "foo whizz"
     *
     *     {{{compile "foo {{bar}}" context="nosuch"}}} -> "foo "
     */
    Handlebars.registerHelper("compile", function (templatestr) {
        var template = Handlebars.compile(templatestr);
        var hash = arguments[1].hash;
        var context = this;
        if (hash.context) {
            context = context[hash.context] || {};
        }
        return template(context);
    });

    /**
     * @template set
     * @block helper
     * @param {string} 0 Property to set
     * @param {*} 1 Value to be set
     * @description Sets a value within the current context
     * @example {{set foo "bar"}}
     */
    Handlebars.registerHelper("set", function (name, value) {
        //console.log(arguments[0], (new Date()).getTime());
        var setReturn = "";
        if (typeof name === "string") {
            this[name] = value;
        } else {
            var options = name;
            var hash = options.hash;
            if (options.fn) {
                var context = _.extend({}, this, hash);
                setReturn = options.fn(context);
            } else {
                for (var prop in hash) {
                    this[prop] = hash[prop];
                }
            }
        }
        return setReturn;
    });

    /**
     * @template link
     * @block helper
     * @param {string} 0 String to use for URL
     * @param {string} [target] Window target for URL - defaults to "external" 
     * @param {string} [content] Content of the link - supercedes any yielded value
     * @description Generates links using urls or localisation keys, prefixing with domain if necessary.
     *
     * Accepts protocol-less URLs and email addresses
     *
     * Given:
     * 
     * - a i18n key/value pair: "foo.href=/foo"
     * - the current hostname: "http://domain"
     *
     *       {{#link "/foo"}}Bar{{/link}}
     *          -> '<a href="http://domain/foo" target="external">Bar</a>'
     *
     * Specify a different target
     * 
     *       {{#link "/foo" target="newtarget"}}Bar{{/link}}
     *          -> '<a href="http://domain/foo" target="newtarget">Bar</a>'
     *
     * Specify no target
     * 
     *       {{#link "/foo" target=""}}Bar{{/link}}
     *          -> '<a href="http://domain/foo">Bar</a>'
     *
     * Pass content explicitly
     * 
     *       {{link "/foo" content="Bar"}}
     *          -> '<a href="http://domain/foo" target="external">Bar</a>'
     *
     * Use a i18n key
     *
     *       {{#link "foo.href"}}Bar{{/link}}
     *          -> '<a href="http://domain/foo" target="external">Bar</a>'
     *
     * URLs with a protocol
     *       {{#link "https://externaldomain/foo"}}Bar{{/link}}
     *          -> '<a href="https://externaldomain/foo" target="external">Bar</a>'
     *
     * Protocol-less URLs
     * 
     *       {{#link "//anotherdomain/foo"}}Bar{{/link}}
     *          -> '<a href="//anotherdomain/foo" target="external">Bar</a>'
     *
     * But if context contains {isMail: true}
     * 
     *       {{#link "//anotherdomain/foo"}}Bar{{/link}}
     *          -> '<a href="https://anotherdomain/foo" target="external">Bar</a>'
     *
     * Email addresses
     * 
     *       {{#link "foo@domain"}}Bar{{/link}}
     *          -> '<a href="mailto:/foo@domain">Bar</a>'
     */
    var hostname = document.location.origin; //"//" + document.location.host;
    Handlebars.registerHelper("link", function () {
        var args = Array.prototype.slice.call(arguments);
        var options = args.pop();
        var url = args[0];
        if (url) {
            var urlphrase = Larynx.Phrase.get(url, {hostname: hostname});
            if (urlphrase) {
                url = urlphrase.toString();
            }
        } else {
            url = "/";
        }
        if (url === "/") {
            url = hostname;
        } else if (url.match(/^\/[^\/]/)) {
            url = hostname + url;
        }
        var params = options.hash || {};
        var content = params.content || (options.fn && options.fn()) || url.replace(/.*\/\//, "");

        if (params.target === undefined && url.match(/\/\//)) {
            params.target = "external";
        }
        if (this.isMail) {
            if (url.indexOf("//") === 0) {
                url = "https:" + url;
            }
        }
        if (url.match(/@/) && url.indexOf("mailto:") !== 0) {
            url = "mailto:" + url;
        }
        return new Handlebars.SafeString('<a href="' + url + '"' + (params.target ? ' target="' + params.target + '"' : '') + '>' + content + '</a>');
    });

    /**
     * @template if
     * @block helper
     * @extends Handlebars.helpers
     * @override
     * @param {*} 0 Item to compare
     * @param {string} [1] Operator
     * @param {*} [2] Item to be compared to
     * @param {...*} [3...] See individual operators to see how further param works
     * @description  Overrides Handlebars.helpers.if
     *
     * ### No operator
     * Truthiness - standard Handlebars if helper behaviour
     *
     *     {{#if "foo"}}Yes{{/if}} -> "Yes"
     *
     *     {{#if ""}}Yes{{else}}No{{/if}} -> "No"
     *     
     * ### ==
     * ‘Truthy’ equality
     *
     *     {{#if "1" "==" 1}}Yes{{/if}} -> "Yes"
     *
     *     {{#if "1" "==" "2"}}Yes{{else}}No{{/if}} -> "No"
     *
     * ### ===
     * Strict equality
     *
     *     {{#if "1" "===" "1"}}Yes{{/if}} -> "Yes"
     *
     *     {{#if "1" "===" 1}}Yes{{else}}No{{/if}} -> "No"
     *
     * ### !=
     * ‘Truthy’ inequality
     *
     *     {{#if "1" "!=" "2"}}Yes{{/if}} -> "Yes"
     *
     *     {{#if "1" "!=" 1}}Yes{{else}}No{{/if}} -> "No"
     *
     * ### !==
     * Strict inequality
     *
     *     {{#if "1" "!==" 1}}Yes{{/if}} -> "Yes"
     *
     *     {{#if "1" "!==" "1"}}Yes{{else}}No{{/if}} -> "No"
     *
     * ### <
     * Less than
     *
     *     {{#if 1 "<" 2}}Yes{{/if}} -> "Yes"
     *
     * ### >
     * More than
     *
     *     {{#if 2 ">" 1}}Yes{{/if}} -> "Yes"
     *
     * ### <
     * Less than or equal
     *
     *     {{#if 1 "<=" 1}}Yes{{/if}} -> "Yes"
     *
     * ### >
     * More than or equal
     *
     *     {{#if 1 ">=" 1}}Yes{{/if}} -> "Yes"
     * 
     * ### &&
     * And operator
     *
     *     {{#if "foo" "&&" "bar"}}Yes{{/if}} -> "Yes"
     *
     *     {{#if "foo" "&&" "bar" "&&" "baz"}}Yes{{/if}} -> "Yes"
     *
     *     {{#if "foo" "&&" "bar" "&&" ""}}Yes{{else}}No{{/if}} -> "No"
     *
     * NB. You cannot mix different operators
     * See also {@link template:all}
     * 
     * ### ||
     * Or operator
     *
     *     {{#if "" "||" "bar"}}Yes{{/if}} -> "Yes"
     *
     *     {{#if "foo" "||" "" "||" "baz"}}Yes{{/if}} -> "Yes"
     *
     *     {{#if "" "||" 0 "||" ""}}Yes{{else}}No{{/if}} -> "No"
     *
     * NB. You cannot mix different operators
     * See also {@link template:or}
     *
     * ### is
     * Lodash is* methods
     *
     *     {{#if "foo" "is" "String"}}Yes{{/if}} -> "Yes"
     *
     * Method has first letter uppercased automatically
     *
     *     {{#if "foo" "is" "string"}}Yes{{/if}} -> "Yes"
     *
     * ### constructor
     *
     *     {{#if "foo" "constructor" "String"}}Yes{{/if}} -> "Yes"
     *
     *     {{#if "foo" "constructor" "string"}}Yes{{else}}No{{/if}} -> "No"
     *
     * ### typeof
     * 
     *     {{#if "foo" "typeof" "string"}}Yes{{/if}} -> "Yes"
     *
     *     {{#if "foo" "typeof" "String"}}Yes{{else}}No{{/if}} -> "No"
     *
     * ### has
     *
     *     {{#if "foo" "has" "oo"}}Yes{{/if}} -> "Yes"
     *
     * Also aliased to <code>contains</code>
     *
     *     {{#if "foo" "contains" "oo"}}Yes{{/if}} -> "Yes"
     *
     * See also {@link template:has}
     *
     * ### matches
     *
     *     {{#if "foo" "matches" "fo{2,}"}}Yes{{/if}}
     *
     * Also aliased to <code>match</code>
     *
     *     {{#if "foo" "match" "fo{2,}"}}Yes{{/if}}
     *
     * See also {@link template:match}
     *
     * ### in
     *
     *     {{#if "foo" "in" "foo" "bar" "baz"}}Yes{{/if}} -> "Yes"
     *
     *     {{#if "fo" "in" "foo" "bar" "baz"}}Yes{{else}}No{{/if}} -> "No"
     *
     * ### matchesin
     *
     *     {{#if "foo" "matchesin" "fo" "bar" "daz"}}Yes{{/if}} -> "Yes"
     *
     *     {{#if "foo" "matchesin" "fo\b" "bar" "daz"}}Yes{{else}}No{{/if}} -> "No"
     *
     * Also aliased to <code>matchin</code>
     *
     *     {{#if "foo" "matchin" "fo" "bar" "daz"}}Yes{{/if}} -> "Yes"
     *
     * ### matchesall
     *
     *     {{#if "foo" "matchesall" "f.{2}" "o+"}}Yes{{/if}} -> "Yes"
     *
     *     {{#if "foo" "matchesin" "f.{2}" "\bo+"}}Yes{{else}}No{{/if}} -> "No"
     *
     * Also aliased to <code>matchin</code>
     *
     *     {{#if "foo" "matchall" "f.{2}" "o+"}}Yes{{/if}} -> "Yes"
     *
     */
    /*
    {{!--
    Not implemented - but maybe a good idea
    {{#has x $has}}foo{{/has}}
    {{#match x $match}}foo{{/match}}
    {{#in x $match1 $match2}}foo{{/in}} - contained?
    {{#matchin x $match1 $match2}}foo{{/matchin}}
    {{#matchin x $match1 $match2}}foo{{/matchin}}
    {{#fallback valueToUse}}Fallback value{{/fallback}}
    {{#if x "defined"}}
    {{exists x y z}}
    {{defined x y z}} -> print first value that is defined
    no need for a defaultified version - just make sure the last one is an actual value
    - but, what if we want to use it as a key for phrase?
    - well, don't do that do {{#if x "||" y "||" z}}{{exists x y z}}{{else}}{{phrase default}}{{/if}} - hmmmm
    - use “standard” @@foo@@ syntax?  @foo@ [@foo@] 
    {{first x y z}} -> print first value to exist
    {{last x y z}} -> prints first value to exist or last if none do
    {{every x y z}} -> prints all values that exist
    NB. "0" will be skipped
    --}}
    */
    function rightify(r, rs) {
        if (typeof r === "object") {
            rs = r;
        }
        return rs;
    }
    var operators = {
        "==": function (l, r) { return l == r; },
        "===": function (l, r) { return l === r; },
        "!=": function (l, r) { return l != r; },
        "!==": function (l, r) { return l !== r; },
        "<": function (l, r) { return l < r; },
        ">": function (l, r) { return l > r; },
        "<=": function (l, r) { return l <= r; },
        ">=": function (l, r) { return l >= r; },
        "&&": function (l, r, rs) {
            var truth = l && r;
            if (truth && rs[1]) {
                rs.shift();
                var operator = rs.shift();
                r = rs.shift();
                if (operator === "&&") {
                    truth = operators["&&"](l, r, rs);
                } else {
                    truth = false;
                }
            }
            return truth;
        },
        "||": function (l, r, rs) {
            var truth = l || r;
            if (!truth && rs[1]) {
                rs.shift();
                var operator = rs.shift();
                r = rs.shift();
                if (operator === "||") {
                    truth = operators["||"](l, r, rs);
                }
            }
            return truth;
        },
        "is": function (l, r) {
            var method = "is" + r.replace(/^(.)/, function (x){
                return x.toUpperCase();
            });
            if (!_[method]) {
                return false;
            }
            return _[method](l);
        },
        "constructor": function (l, r) { return l && l.constructor && l.constructor.name == r; },
        "typeof": function (l, r) { return typeof l == r; },
        "has": function (l, r) { return l && l.indexOf(r) !== -1; },
        "matches": function (l, r, rs) {
            var matchreg = r.constructor.name === "RegExp" ? r : new RegExp(r, rs[1]);
            return matchreg.exec(l) !== null;
        },
        "in": function (l, r, rs) {
            rs = rightify(r, rs);
            if (_.isArray(rs)) {
                for (var ai = 0, rslen = rs.length; ai < rslen; ai++) {
                    if (l === rs[ai]) {
                        return true;
                    }
                }
            } else if (_.isObject(rs)) {
                for (var oi in rs) {
                    if (l === rs[oi]) {
                        return true;
                    }
                }
            }
            return false;
        },
        "matchesin": function (l, r, rs) {
            rs = rightify(r, rs);
            for (var ai = 0, rslen = rs.length; ai < rslen; ai++) {
                if (operators.matches(l, rs[ai], [])) {
                    return true;
                }
            }
            return false;
        },
        "matchesall": function (l, r, rs) {
            rs = rightify(r, rs);
            for (var ai = 0, rslen = rs.length; ai < rslen; ai++) {
                if (!operators.matches(l, rs[ai], [])) {
                    return false;
                }
            }
            return true;
        }
    };
    operators.contains = operators.has;
    operators.match = operators.matches;
    operators.matchin = operators.matchesin;
    operators.matchall = operators.matchesall;
    Handlebars.registerHelper("if", function () {
        var args = Array.prototype.slice.call(arguments),
            options = args.pop(),
            lvalue = args.shift(),
            operator = args.shift(),
            rvalues = _.extend([], args),
            rvalue = args.shift(),
            result = lvalue;

        if (operator !== undefined) {

            if (arguments.length < 3) {
                throw new Error("Handlerbars Helper 'if' needs 2 parameters");
            }

            if (options === undefined) {
                options = rvalue;
                rvalue = operator;
                operator = "==";
            }

            if (!operators[operator]) {
                throw new Error("Handlerbars Helper 'if' doesn't know the operator " + operator);
            }

            result = operators[operator](lvalue, rvalue, rvalues);
        }

        var context = this; //_.extend({}, this, options.hash);
        //console.log("context", context);
        if (result) {
            return options.fn(context);
        } else {
            return options.inverse(context);
        }

    });
    /**
     * @template all
     * @block helper
     * @description Outputs the yielded content if all conditions are met
     * 
     *     {{#all "a" "b" 3}}This will be output{{/all}} -> "This will be output"
     *     
     *     {{#all "a" "" 3}}This will not be output{{/all}} -> ""
     *
     * See also {@link template:if}~&&
     */
    Handlebars.registerHelper("all", function () {
        var args = Array.prototype.slice.call(arguments);
        var options = args.pop();
        var result = true;
        for (var i = 0, argslen = args.length; i < argslen; i++) {
            if (!args[i]) {
                result = false;
                break;
            }
        }
        if (result) {
            return options.fn(this);
        } else {
            return options.inverse(this);
        }
    });
    /**
     * @template or
     * @block helper
     * @description Outputs the yielded content if any of the conditions are met
     * 
     *     {{#or "" "b" ""}}This will be output{{/or}} -> "This will be output"
     * 
     *     {{#or "" 0 ""}}This will not be output{{/or}} -> ""
     *
     * See also {@link template:if}~||
     */
    Handlebars.registerHelper("or", function () {
        var args = Array.prototype.slice.call(arguments);
        var options = args.pop();
        var result = false;
        for (var i = 0, argslen = args.length; i < argslen; i++) {
            if (args[i]) {
                result = true;
                break;
            }
        }
        if (result) {
            return options.fn(this);
        } else {
            return options.inverse(this);
        }
    });

    /*
        Client-side helpers
    */
    if (Router) {
        /**
         * @template routeurl
         * @block helper
         * @param {string} 0 Route name
         * @param {object} [params] Additional params to be passed to the underlying router method
         * @description Outputs a URL given the name of a route
         * 
         *      {{routeurl "route.key"}}
         *
         * See {@link module:bauplan%router%base.reverse}
         */
        Handlebars.registerHelper("routeurl", function () {
            var route = arguments[0];
            var params = {};
            var options = arguments[1];
            if (options.hash) {
                params = _.extend((options.hash.params) || {}, options.hash);
                delete options.hash.params;
            }
            var url = Router.reverse(route, params);
            return url;
        });
        /**
         * @template authrouteurl
         * @block helper
         * @param {string} 0 Route name
         * @param {object} [params] Additional params to be passed to the underlying router method
         * @description Outputs a URL given the name of a route that ensures that the user is logged in first
         * 
         *      {{authrouteurl "route.key"}}
         *
         * See {@link module:bauplan%router%base.reverseWithAuth}
         *
         * (Possibly somewhat redundant since protected URLs will always redirect to the auth'd URL any way)
         */
        Handlebars.registerHelper("authrouteurl", function () {
            var route = arguments[0];
            var params = {};
            var options = arguments[1];
            if (options.hash) {
                params = _.extend((options.hash.params) || {}, options.hash);
                delete options.hash.params;
            }
            var url = Router.reverseWithAuth(route, params);
            return url;
        });
        /**
         * @template layout
         * @block helper
         * @param {string} view Name of view to load
         * @param {string} [id] Id to override default Id
         * @param {object} [options] Options to pass to view loaded by layout view
         * @param {string} [tagName] Tag name to override layout view’s default tag
         * @param {string} [role] Role to add to layout view element
         * @description  Inserts a Thorax.LayoutView and loads a view
         * 
         *     {{layout view="foo"}}
         *
         *     {{layout id="bar" view=view options=viewOptions}}
         *     
         *     {{layout tagName="header" role="banner" view="site-header"}}
         */
        var layoutCallback = 0;
        Handlebars.registerHelper("layout", function () {
            var name;
            var options;

            if (arguments.length > 1) {
                name = arguments[0];
                options = arguments[1];
            } else {
                options = arguments[0];
            }

            var lOptions = options.hash || {};
            if (name) {
                lOptions.name = name;
            }

            var layoutView = new Thorax.LayoutView(lOptions);
            if (lOptions.view) {
                var nestedView = Thorax.LayoutViews[lOptions.view] || Thorax.Views[lOptions.view];
                var nested = new nestedView(lOptions.options);
                layoutView.setView(nested);
            }
            var callbackCount = 0;
            var placeholder = "layoutViewPlaceholder" + layoutCallback;
            var selector = "#" + placeholder;
            function appendLayout() {
                // Nasty - we have to keep checking until the element exists within the DOM,
                // unfortunately a limitation of Thorax
                if (!jQuery(selector).length) {
                    callbackCount++;
                    var pause = callbackCount > 1000 ? 1000 : 1;
                    setTimeout(appendLayout, pause);
                } else {
                    jQuery(selector).replaceWith(layoutView.el);
                    layoutView.$el.find("[layoutshim]").remove();
                    jQuery("[layoutshim]").remove();
                }
            }
            setTimeout(appendLayout, 0);
            layoutCallback++;
            return new Handlebars.SafeString("<span id=\"" + placeholder + "\"></span>");
        });
    }

    return Handlebars;

}));