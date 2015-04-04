define([
        "underscore",
        "jquery",
        "backbone",
        "bauplan.authentication",
        "bauplan.tracker"
    ], function (_, jQuery, Backbone, BauplanAuthentication, Tracker) {
/**
 * @module bauplan%router%base
 * @description ## RouterBase
 *
 *     var BauplanRouterBase = require("bauplan.router.base");
 *
 * or as part of the Bauplan bundle
 *
 *     var Bauplan = require("bauplan");
 *     var BauplanRouterBase = Bauplan.BauplanRouterBase;
 *
 * To create and instantiate a new Router instance
 *
 *     var Router = RouterBase.extend();
 *     var router = new Router({
 *         config: {
 *             "foo/:param": "foo"
 *         },
 *         methods: {
 *             "foo": function (param) {
 *                 …
 *             }
 *         }
 *     });
 *
 * This creates a route with a URL pattern
 * 
 * - foo - /^\/foo\/([^\/]+)$/ eg. /foo/lish
 * 
 * When called invokes the foo method with the argument param (lish)
 *
 * The individual config properties can also be passed as objects 
 * 
 *     var router = new Router({
 *         config: {
 *             "bar" : {
 *                 name: "barbar",
 *                 authenticated: true
 *             },
 *             "baz/:a/:b/*c": {
 *                 name: "baz",
 *                 method: function (a, b, c) {}
 *             }
 *         },
 *         methods: {
 *             "barbar": function () {}
 *         }
 *     });
 *
 * This creates 2 routes with the following URL patterns
 * 
 * 1. barbar - /^\/bar$/ ie. /bar
 * 2. baz - /^\/baz\/([^\/]+)\/([^\/]+)\/(.*)$/ eg. /baz/tas/tic/al/journey
 *
 * The barbar route requires authentication and invokes the barbar method
 *
 * The baz route invokes the method defined in the method property of config.baz, with the arguments a (tas), b (tic) and c (al/journey)
 *
 * 
 * ### Link handling
 *
 * All a element clicks are intercepted
 * unless:
 * - _target
 * - .external
 * - mailto:
 *
 * See {@link module:bauplan%router%base~window:on:click:a}
 * 
 * @return {constructor} BauplanRouterBase
 */
    // alias
    var windoc = window.document;

    /**
     * @method jQuery%rootCookie
     * @description Set cookie operation at the root path
     * @param  {string} name Cookie name
     * @param  {string|object} value Cookie value
     * @param  {object} [options] Options to pass to jQuery.cookie
     * @return Cookie value
     */
    jQuery.rootCookie = function(name, value, options) {
        options = options || {};
        options.path = "/";
        return jQuery.cookie(name, value, options);
    };

    /**
     * @method jQuery%removeRootCookie
     * @description Delete cookie at the root path
     * @param  {string} name Cookie name
     * @param  {object} [options] Options to pass to jQuery.cookie
     */
    jQuery.removeRootCookie = function(name, options) {
        options = options || {};
        options.path = "/";
        return jQuery.removeCookie(name, options);
    };

    jQuery.fn.outerHtml = function(){
        // IE, Chrome & Safari will comply with the non-standard outerHTML, all others (FF) will have a fall-back for cloning
        return (!this.length) ? this : (this[0].outerHTML || (
          function(el){
              var div = document.createElement("div");
              div.appendChild(el.cloneNode(true));
              var contents = div.innerHTML;
              div = null;
              return contents;
        })(this[0]));
    };

    // Alternatively, checkout http://madapaja.github.io/jquery.selection/
    jQuery.fn.getSelection = function() {
        var e = (this.jquery) ? this[0] : this;
        return (
            /* mozilla / dom 3.0 */
            ('selectionStart' in e && function() {
                var l = e.selectionEnd - e.selectionStart;
                return { start: e.selectionStart, end: e.selectionEnd, length: l, text: e.value.substr(e.selectionStart, l) };
            }) ||
            /* exploder */
            (document.selection && function() {
                e.focus();
                var r = document.selection.createRange();
                if (r === null) {
                    return { start: 0, end: e.value.length, length: 0 };
                }
                var re = e.createTextRange();
                var rc = re.duplicate();
                re.moveToBookmark(r.getBookmark());
                rc.setEndPoint('EndToStart', re);

                return { start: rc.text.length, end: rc.text.length + r.text.length, length: r.text.length, text: r.text };
            }) ||
            /* browser not supported */
            function() { return null; }
        )();
    };
    jQuery.fn.setSelection = function(start, end) {
        if (!end) {
            end = start;
        }
        return this.each(function() {
            if (this.setSelectionRange) {
                this.focus();
                this.setSelectionRange(start, end);
            } else if (this.createTextRange) {
                var range = this.createTextRange();
                range.collapse(true);
                range.moveEnd('character', end);
                range.moveStart('character', start);
                range.select();
            }
        });
    };

    /**
     * @method reverse
     * @static
     * @param {string} name Route name
     * @param {object} params Additional params for route
     * @description Get URL for a route
     * @return {string} URL for route
     */
    Backbone.Router.prototype.reverse = function (name, params) {
        var urlStub = this.reverseRoutes[name];
        var aliasMatch = urlStub.match(/^alias:(.*)/);
        if (aliasMatch) {
            urlStub = this.reverseRoutes[aliasMatch[1]];
        }
        if (urlStub === undefined) {
            //console.log("WTF - no match for reverse route " + name);
            return "";
        }
        params = params || {};
        for (var param in params) {
            var paramRegex = new RegExp("/[:\\*]"+ param);
            urlStub = urlStub.replace(paramRegex, "/" + params[param]);
        }
        urlStub = "/" + urlStub;
        // why not check value of params[param] and remove there and then?
        urlStub = urlStub.replace(/\/undefined.*/, "");
        //remove unused params
        urlStub = urlStub.replace(/\/[:\*].*/, "");

        return urlStub;
    };

    /**
     * @method reverseWithAuth
     * @static
     * @param {string} name Route name
     * @param {object} params Additional params for route
     * @description Get protected URL for a route
     * @return {string} URL for route
     */
    Backbone.Router.prototype.reverseWithAuth = function(name, params) {
        var routeStub = this.reverse(name, params).replace(/^\//, "");
        var authroute = this.getAuthRoute();
        return this.reverse(authroute, {route: routeStub});
    };

    var requiresLogin = {};

    /**
     * @member {array} urlList
     * @private
     * @description Simple array of URLs visited 
     */
    var urlList = [];

    var BauplanRouterBase = Backbone.Router.extend({

        /**
         * @static
         * @param {object} options
         * @param {object} options.config Key/value pairs of route URL patterns and route options (name, method, authentication)
         * @description Create router instance
         *
         * - Register routes
         * - Register corresponding methods
         * - Register routes requiring authentication
         * - Attach event handlers to allow non-app links to work as normal
         * - Start Backbone.History
         * - Perform stored redirect if needed
         * - Check whether current page requires authentication
         * - Track pageview
         */
        initialize: function (options) {
            this.bauplan.Router = this;
            if (!options) {
                options = {};
            }
            var routes = [];
            for (var routeKey in options.config) {
                routes.unshift(routeKey);
            }
            for (var i = 0, routesLen = routes.length; i < routesLen; i++) {
                var route = routes[i];
                var routeVal = options.config[route];
                if (typeof routeVal === "string") {
                    routeVal = {
                        name: routeVal
                    };
                }
                if (!routeVal.method) {
                    routeVal.method = options.methods[routeVal.name];
                }
                this.route(route, routeVal.name, routeVal.method);
                // TODO: good. but let's add url matching too
                if (routeVal.authentication) {
                    requiresLogin[routeVal.name] = true;
                }
            }
            /*this.on("all", function(route) {
                //alert("all got called");
                //console.log("all", route);
                this.current = route;
            });*/
            var that = this;
            /**
             * @event window:on:click:a
             * @description Handle all triggerings of link elements
             *
             * Allow normal link behaviour if
             *
             * - Link has a target (and not siteinfo)
             * - Link is an email (mailto:)
             * - Link has a class of "external"
             *     - if there is an external method, use that
             *     - otherwise, allow link to load
             * - Link is a fragment identifier (#)
             */
            jQuery(document).on("click", "a", function (e) {
                var a = e.target;
                if (a.tagName.toLowerCase() !== "a") {
                    a = jQuery(a).closest("a");
                }
                if (jQuery(a).attr("target") && jQuery(a).attr("target") !== "siteinfo") {
                    return;
                }
                var url = jQuery(a).attr("href"); //.replace(/^\//, "");
                if (url.match(/^mailto:/)) {
                    return;
                }
                if (jQuery(a).hasClass("external")) {
                    if (that.external) {
                        that.external(url);
                        e.preventDefault();
                        e.stopPropagation();
                    }
                    return;
                }
                // || jQuery(a).hasClass("authentication")
                if (url && url.indexOf("#") === 0) {
                    return;
                }
                that.navigate(url, {trigger: true}); //, replace: true,
                e.preventDefault();
                e.stopPropagation();
            });
            Backbone.history.start({ pushState: true });
            this.urlStack.current = windoc.location.pathname;
            //this.bind("all", this.allRoutes);
            if (this.storedRedirect()) {
                return;
            }
            var curl = document.location.pathname;
            var authdurl = this.checkAuthenticatedUrl(curl, true);
            if (authdurl) {
                return;
            }
            Tracker.pageview(curl);
        },
        /**
         * @static
         * @param {string} route Route name
         * @param {object} [options] Options to pass to this.navigate
         * @param {object} [options.trigger=true] Route triggering
         * @param {object} [options.options] Overriding options
         * @param {object} [options.params] Params to pass to route URL
         * @description Navigate to a route by the name of the route, rather than by URL
         *
         */
        callRoute: function (route, options) {
            options = options || {};
            var params = options;
            if (options.options) {
                options = _.extend({}, options.options);
                delete params.options;
            }
            if (params.params) {
                params = _.extend({}, params.params);
                delete options.params;
            }

            if (options.trigger === undefined) {
                options.trigger = true;
            }
            var url = this.reverse(route, params);
            this.navigate(url, options);
        },
        /**
         * @static
         * @param {string} route Route name
         * @param {object} [options] this.navigate options
         * @description Interrupt any currently invoked route and navigate to the route specified
         */
        override: function (route, options) {
            var r = this;
            setTimeout(function(){
                r.callRoute(route, options);
            }, 1);
        },
        /**
         * @static
         * @description Get a redirect route based on whether the user has registered or not
         * @return {string} Authentication redirect route
         */
        getAuthRoute: function () {
            var authroute = BauplanAuthentication.get("registered") ? "login" : "register";
            authroute += "-redirect";
            return authroute;
        },
        /**
         * @static
         * @param {string} url URL which requires authentication
         * @param {boolean} [replace] Whether to replace the previous entry in the user agent’s history
         * @description  Navigate to a route where the user can authenticate before proceeding to the desired URL
         */
        callRouteWithAuth: function (url, replace) {
            this.callRoute(this.getAuthRoute(), {
                params: {
                    route: url
                },
                options: {
                    trigger: true,
                    replace: replace
                }
            });
        },
        /**
         * @static
         * @param {string} url URL to look up
         * @description Get the route that a URL resolves to
         * @return {string} Route name
         */
        getRoute: function (url) {
            url = url.replace(/^\//, "");
            var BHH = Backbone.history.handlers;
            for (var b = 0, BHHLen = BHH.length; b < BHHLen; b++) {
                handler = BHH[b];
                if (handler.route.test(url)) {
                    return handler.name;
                }
            }
        },
        /**
         * @static
         * @param {string} url URL to check
         * @param {boolean} [replace] Whether to replace the previous entry in the user agent’s history
         * @description  Checks whether a URL needs authentication
         *
         * If it does, and the user is not authenticated, performs a redirect to an authentication page.
         *
         * Once the user has authenticated, they will be redirected to the origally requested URL
         */
        checkAuthenticatedUrl: function (url, replace) {
            url = url.replace(/^\//, "");
            var gatekeeper = requiresLogin[this.getRoute(url)];
            if (gatekeeper && BauplanAuthentication && !BauplanAuthentication.get("loggedIn")) {
                this.callRouteWithAuth(url, replace);
                return true;
            }
            return false;
        },
        /**
         * @static
         * @access private
         * @description  For storing app's URL previous and current history
         */
        urlStack: {},
        /**
         * @static
         * @return {array} List of app URLs in order visited
         */
        getUrlList: function() {
            return urlList;
        },
        /**
         * @static
         * @param {string|object} name Name of previous route
         * @param {object} options XXXX
         * @param {boolean} [options.trigger=true] Whether to trigger the route
         * @param {boolean} [options.replace=true] Whether to replace the URL in the history
         * @param {boolean} [options.route] Route to use for URL
         * @param {boolean} [options.params] Params to pass to Route reversing
         * @param {boolean} [options.url] Explicit URL to use
         * @description Navigate to the app’s idea of the previous route
         */
        previous: function (name, options) {
            if (typeof name === "object") {
                options = name;
            }
            options = options || {
                trigger: true,
                replace: true
            };
            var url;
            if (name) {
                url = this.previousStack[name];
            } else {
                url = this.urlStack.previous;
            }
            if (!url && options.route) {
                url = this.reverse(options.route, options.params);
            }
            if (!url && options.url) {
                url = options.url;
            }
            url = url || "/";
            this.navigate(url, options);
        },
        /**
         * @static
         * @access private
         * @description  Registry for storing app’s previous state
         */
        previousStack : {},
        /**
         * @static
         * @param {string} name Route name
         * @param {boolean} [ignore] Ignore this route
         * @description Update previous route stack
         */
        setPrevious: function(name, ignore) {
            this.previousStack[name] = this.urlStack.previous;
        },
        /**
         * @static
         * @description Empty method to be overriden if stored redirect functionality is desired
         */
        storedRedirect: function() {},
        /**
         * @static
         * @override
         * @param {string} url URL to invoke
         * @param {object} options XXXX
         * @description Overrides Backbone.Router.prototype.navigate
         *
         * - checks whether route is protected and if so, whether the user has the right permissions
         * - redirects to any stored redirect URL
         * - redirects to locked page if needed
         * - updates previous and current url stacks
         * - tracks pageview
         * - sets referrer if needed
         * - prevents invoking empty URLs
         */
        navigate: function(url, options) {
            if (BauplanAuthentication.locked()) {
                // better have alocked route then, eh?
                url = this.reverse("locked");
            }
            // console.log("navigate", url); // enable for debug?
            if (this.storedRedirect.apply(this, arguments)) {
                return;
            }
            if (!url) {
                //console.log("uh oh root");
                return;
            }
            if (!this.checkAuthenticatedUrl(url)) {
                this.urlStack.previous = this.urlStack.current;
                this.urlStack.current = url; // arguments[0]
                if (options.track !== false) {
                    Tracker.pageview(url);
                }
                if (options.referrer !== false) {
                    this.referrer = this.urlStack.previous || windoc.referrer;
                }
                Backbone.Router.prototype.navigate.apply(this, arguments);
            }
        },
        /**
         * @static
         * @override
         * @param {string} route URL pattern
         * @param {string} name Name of route
         * @param {function} callback Callback function for Backbone.Router.prototype.route
         * @description Register a route and update Backbone history
         *
         * Overrides Backbone.Router.prototype.route
         */
        route: function (route, name, callback) {
            this.reverseRoute(route, name);
            Backbone.Router.prototype.route.call(this, route, name, callback);
            // God, this is awful, but surely better than copying and pasting Backbone.Router.prototype.route
            var BHH = Backbone.history.handlers;
            BHH[0].name = name;
        },
        /**
         * @static
         * @private
         * @param {string} route URL pattern
         * @param {string} name Name of route
         * @description  Add route URL pattern to reversed route registry
         */
        reverseRoute: function (route, name) {
            //this.reverseRoutes = this.reverseRoutes || {};
            this.reverseRoutes[name] = route;
        },
        /**
         * @static
         * @description  Registry for reversed routes
         */
        reverseRoutes: {}

    });

    // Along with the awful copy and paste, maybe it's time for Bauplan.History
    /**
     * @override
     * @static
     * @param {arguments} arguments
     * @description  Patch Backbone.History.prototype.loadUrl to enable maintaining urlList
     */
    var loadUrl = Backbone.History.prototype.loadUrl;
    Backbone.History.prototype.loadUrl = function () {
        var matched = loadUrl.apply(this, arguments);
        //Tracker.pageview(this.fragment);
        urlList.push("/" + this.fragment);
        return matched;
    };

    return BauplanRouterBase;
});