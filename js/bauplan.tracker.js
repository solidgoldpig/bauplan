define(function(require) {
/**
 * @module bauplan%tracker
 * @description ## Track an event
 * - optionally time how long it took
 * - optionally pass further parameters
 *
 * To load
 *
 *     var Tracker = require("bauplan.tracker");
 *
 * or as part of the Bauplan bundle
 *
 *     var Bauplan = require("bauplan");
 *     var Tracker = Bauplan.Tracker;
 *
 * To track an event named "foo"
 *
 *     Tracker.track("foo");
 *
 * To time an event, call the start method
 *
 *     Tracker.start("foo");
 *
 * If the timer is stil running when track is called, it will be stopped automatically
 *
 * The timer can be stopped manually (but usually stopping automatically should suffice)
 *
 *     Tracker.stop("foo");
 *
 * Three convenience methods exist:
 *
 *     Tracker.completed("foo");
 *     Tracker.aborted("foo");
 *     Tracker.unload("foo");
 *
 * These all call the track method, setting the result parameter to be the name of the method called
 *
 * eg. Tracker.completed => {result: "completed"}
 *
 * All the above methods can be passed an object of optional parameters which will be sent as a JSONified string
 *
 *     Tracker.track("foo", {bar: "baz"});
 *
 * Parameters can be stored at any time before track is called (even before start is called)
 *
 *     Tracker.store("foo", {bar:"baz"});
 *
 * Events can have subevents
 *
 *     Tracker.startSubEvent("foo", "foosub");
 *     Tracker.stopSubEvent("foo", "foosub");
 *
 * Unstopped subevents will be stopped automatically when the stop or track methods are called
 *
 * A key-value pair of the the subevents name and the time elapsed are sent as part of the parameters
 *
 * If the subevent is called more than once during the event, the times are concatenated
 *
 * Additionally, a key-value pair of the order the subevents were triggered in is also sent
 *
 * ### Automatic tracking of events
 * 
 * The following events are tracked:
 * - start of visit
 * - end of visit
 * - all blurs and refocuses of the app window
 * - all clicks
 * - mouseovers on links, inputs of type submit and buttons
 * - unload
 *
 * ### Automatic tracking of untrapped errors
 *
 * Any untrapped errors will be tracked.
 *
 * NB. this cannot track errors that occur before bauplan.tracker is loaded.
 *
 * @return {instance} Tracker
 */
    var _ = require("lodash");
    var jQuery = require("jquery");
    var Backbone = require("backbone");
    var Analytics = require("bauplan.analytics");

    var baseurl = "/api/track";

    /**
     * @access private
     * @function dispatch
     *
     * @description Disptaches Ajax call with sensible defaults
     *
     * @param {object} options
     * @param {string} options.url
     * @param {object|string} [options.data]
     * @param {string} [options.contentType=application/json; charset=utf-8]
     * @param {string} [options.type=PUT]
     * @param {boolean} [options.async=true]
     * @param {function} [options.error]
     */
    var dispatch = function (options) {
        options = _.extend({
            type: "PUT",
            contentType: "application/json; charset=utf-8",
            error:function(){}
        }, options);
        options.url = baseurl + "/" + options.url;
        if (options.contentType.match(/application\/json/)) {
            try {
                options.data = JSON.stringify(options.data || {});
            } catch(e) {
                options.contentType = "text/plain; charset=utf-8";
            }
        }
        if (options.async === undefined) {
            options.async = true;
        }
        Backbone.ajax(options);
    };

    /**
     * @access private
     * @var {object} tracking
     * @property {object} timer Object to store event timers
     * @property {string} data Object to store event data
     */
    var tracking = {
        timer: {},
        data: {}
    };

/* the main function */
    /** @constructor */
    var Tracker = Backbone.Model.extend({
        timefactor: 1000,
        adjustTime: function adjustTime (t) {
            if (this.timefactor) {
                t /= this.timefactor;
            }
            return t;
        },

        /**
         * Send ui event with any parameters passed or previously stored
         *
         * Request is sent to {apiRoot}{baseurl}/{name}
         * Data is an object of key-value pairs serialised as JSON
         *
         * @param {string} name Name of the event for tracking service to use as key
         * @param {object} [params] Parameters to be passed to tracking service
         * @param {boolean} [async=true] Whether tracking call should be asynchronous
         * @instance
         * @memberOf module:bauplan%tracker
         */
        track: function track (name, params, async) {
            if (typeof params === "string") {
                params = {
                    "value": params
                };
            }
            // stop event timer if running
            this.stop(name, params);
            this.store(name, {"%device": this.useragent()});
            var data = this.get(name);

            if (window.less && window.less.env === "development") {
                if (name === "error" || window.tracking !== false) {
                    console.log("TRACK", name, data);
                }
            } else {
                dispatch({url: "client/" + name, data: data, async: async});
            }
        },

        /**
         * Send completed ui event along any parameters passed or previously stored
         *
         * @param {string} name Name of the event for tracking service to use as key
         * @param {object} [params] Parameters to be passed to tracking service
         * @instance
         * @memberOf module:bauplan%tracker
         */
        completed : function trackCompleted (name, params) {
            this.track(name, _.extend(params || {}, {result:"completed"}));
        },

        /**
         * Send aborted ui event along any parameters passed or previously stored
         *
         * @param {string} name Name of the event for tracking service to use as key
         * @param {object} [params] Parameters to be passed to tracking service
         * @instance
         * @memberOf module:bauplan%tracker
         */
        aborted : function trackAborted (name, params) {
            this.track(name, _.extend(params || {}, {result:"aborted"}));
        },

        /**
         * Send ui event interrupted by unload event along any parameters passed or previously stored
         *
         * NB. because of unload event, such events are sent synchronously
         *
         * @param {string} [name] Name of the event for tracking service to use as key
         * @param {object} [params] Parameters to be passed to tracking service
         *
         * If called without name, any running events are stopped and any stored data
         * is sent to the tracking endpoint along with a generic unload tracking event
         * @instance
         * @memberOf module:bauplan%tracker
         */
        unload : function trackUnload (name, params) {
            var url = document.location.pathname;
            if (!name) {
                var pages = this.bauplan.Router.getUrlList();
                this.store("visit", {
                    pages: pages,
                    pagecount: pages.length
                });
                if (pages.length < 2) {
                    this.store("visit", {
                        bounce: true
                    });
                }
                for (var tkey in tracking.timer) {
                    if (tkey.indexOf(":") === -1) {
                        this.unload(tkey);
                    }
                }
                for (var dkey in tracking.data) {
                    if (dkey.indexOf(":") === -1) {
                        this.unload(dkey);
                    }
                }
                this.track("unload", {url:url}, false);
            } else {
                this.track(name, _.extend(params || {}, {result:"unload", url:url}), false);
            }
        },

        /**
         * Store parameters for an event
         *
         * @param {string} name Name of the event to start timer for
         * @param {object} [params] Parameters to be passed to tracking service
         * @instance
         * @memberOf module:bauplan%tracker
         */
        store: function trackStore (name, params) {
            if (tracking.data[name]) {
                params = _.extend({}, tracking.data[name], params);
            }
            tracking.data[name] = params;
        },

        /**
         * Get parameters for an event
         *
         * @param {string} name Name of the event to start timer for
         * @param {boolean} [clear] Whether to clear the stored parameters
         */
        get: function trackGet (name, clear) {
            params = _.extend({}, tracking.data[name]);
            delete tracking.data[name];
            return params;
        },

        /**
         * Start timer for an event
         *
         * @param {string} name Name of the event to start timer for
         * @param {object} [params] Parameters to be passed to tracking service
         * @param {boolean} [reportStarted=false] Whether to report event has started to tracking service
         * @instance
         * @memberOf module:bauplan%tracker
         */
        start: function trackStart (name, params, reportStarted) {
            if (!tracking.timer[name]) {
                tracking.timer[name] = (new Date()).getTime();
            }
            if (params) {
                this.store(name, params);
            }
            if (reportStarted) {
                this.track(name + ".started");
            }

        },

        /**
         * Stop timer for an event
         *
         * @param {string} name Name of the event to stop timer for
         * @param {object} [params] Parameters to be passed to tracking service
         * @instance
         * @memberOf module:bauplan%tracker
         */
        stop: function trackStop (name, params) {
            // stop any subevent currently running and note that it was incomplete
            var currentSubEvent = tracking.data[name+":currentSubEvent"];
            if (currentSubEvent) {
                this.stopSubEvent(name, currentSubEvent);
                this.store(name, {incomplete_subevent: currentSubEvent});
                delete tracking.data[name+":currentSubEvent"];
            }
            // add any subevents to stored parameters
            var subevents = tracking.data[name+":subevents"];
            if (subevents) {
                this.store(name, {subevents: subevents});
                delete tracking.data[name+":subevents"];
            }
            // if timer running for event, work out how long has elapsed
            var started = tracking.timer[name];
            if (started) {
                var stopped = (new Date()).getTime();
                var elapsed = this.adjustTime(stopped - started);
                this.store(name, {time: elapsed});
            }
            delete tracking.timer[name];
            if (params) {
                this.store(name, params);
            }
        },

        /**
         * Start timer for a subevent to be tracked
         *
         * @param {string} eventName Name of the event subevent belongs to
         * @param {string} subEventName Name of the event to start timer for
         * @instance
         * @memberOf module:bauplan%tracker
         */
        startSubEvent: function trackStartSubEvent (eventName, subEventName) {
            tracking.timer[eventName+":"+subEventName] = (new Date()).getTime();
            //NB. as we’re just storing a string, we can currently only have one subevent running
            tracking.data[eventName+":currentSubEvent"] = subEventName;
            var subeventsKey = eventName+":subevents";
            var subevents = tracking.data[subeventsKey] || "";
            tracking.data[subeventsKey] = (subevents ? subevents + "." : "" ) + subEventName;
        },

        /**
         * Stop timer for a subevent
         *
         * @param {string} eventName Name of the event subevent belongs to
         * @param {string} subEventName Name of the event to start timer for
         * @instance
         * @memberOf module:bauplan%tracker
         */
        stopSubEvent: function trackStopSubEvent (eventName, subEventName) {
            // if timer running for subevent, work out how long has elapsed
            var subEventKey = eventName+":"+subEventName;
            var started = tracking.timer[subEventKey];
            if (started) {
                var stopped = (new Date()).getTime();
                var elapsed = this.adjustTime(stopped - started);
                // If subevent is measured more than once, each instance is added 
                // using . as delimiter
                if (tracking.data[eventName] && tracking.data[eventName][subEventName]) {
                    elapsed = tracking.data[eventName][subEventName] + "." + elapsed;
                }
                var subEventParams = {};
                subEventParams[subEventName] = elapsed;
                this.store(eventName, subEventParams);
            }
            delete tracking.timer[subEventKey];
            delete tracking.data[eventName+":currentSubEvent"];
        },


        /**
         * Return details of useragent (viewport dimensions, scroll position, screen, agent, platform)
         *
         * @return object
         */
        useragent: function trackUserAgent () {
            var clientParams = {};
            var docEl = document.documentElement;
            clientParams.viewport = {
                w: docEl.clientWidth,
                h: docEl.clientHeight
            };
            clientParams.scroll = {
                x: docEl.scrollLeft,
                y: docEl.scrollTop
            };
            clientParams.screen = {
                w: (screen.availWidth || screen.width),
                h:(screen.availHeight || screen.height)
            };
            clientParams.agent = navigator.userAgent;
            clientParams.platform = navigator.platform;

            return clientParams;
        },



        /**
         * Send error ui event
         *
         * @param {object} error Error object
         * @instance
         * @memberOf module:bauplan%tracker
         */
        error: function trackError (error) {
            error.url = document.location.pathname;
            error.stack = error.stack;
            this.track("error", { "%error": error });
        },

        /**
         * Send page not found ui event
         *
         * @param {string} [url] The URL that does not exist 
         * @param {string} [referrer] The referrer URL
         * @instance
         * @memberOf module:bauplan%tracker
         */
        notfound: function trackNotFound (url, referrer) {
            if (url.indexOf("/") === -1) {
                url = "/" + url;
            }
            referrer = referrer || window.document.referrer;
            this.track("notfound", {
                url: url,
                referrer: referrer
            });
        },

        /**
         * Send pageview ui event
         *
         * @param {string} [url] URL - if not provided uses the current URL
         * @instance
         * @memberOf module:bauplan%tracker
         */
        pageview: function trackPageView (url) {
            if (!url) {
                url = window.document.location.pathname;
            }
            if (url.indexOf("/") === -1) {
                url = "/" + url;
            }
            if (url === this.currentPageView) {
                // no double-counting
                return;
            }
            this.currentPageView = url;
            Analytics.pageview(url);
            this.track("pageview", { url: url });
        },


        /**
         * Send transaction ui event
         *
         * @param {object} t Transaction details
         *
         * This calls {@link module:bauplan%analytics#transaction}
         * @instance
         * @memberOf module:bauplan%tracker
         */
        transaction: function trackTransaction (t) {
            Analytics.transaction(t);
        },



        /**
         * Send view ui event
         *
         * @param {string} view View name
         * @param {boolean} [append] Alternative tracker URL
         * @instance
         * @memberOf module:bauplan%tracker
         */
        view: function trackView (view, append) {
            var url;
            try {
                url = this.bauplan.Router.reverse(view);
            } catch (e) {
                url = "/track/view/" + view;
            }
            if (append) {
                url += "/" + append;
            }
            this.pageview(url);
        },

        /*!
         * Send click ui event
         *
         * NB. all clicks are registered automatically (or would be if the last line wasn't  commented out)
         *
         * @param {string} node DOM node activated
         * @param {event} e DOM event
         * @instance
         * @memberOf module:bauplan%tracker
         */
        click: function trackClick(node, e) {
            var clickParams = {};
            var nodeTag = node.tagName.toLowerCase();
            if (nodeTag.match(/^(a|button)$/) || jQuery(node).closest("a, button").length) {
                var text = jQuery.trim(jQuery(node).text()).replace(/\s+/g, " ");
                clickParams.text = text;
            }
            var path = jQuery(node).attr("data-csspath") || createSelectorPath(node);
            clickParams.path = path;
            if (nodeTag === "object") {
                if (e) {
                    var objNode = jQuery(node);
                    var objOffset = objNode.offset();
                    clickParams.object = {
                        w: objNode.width(),
                        h: objNode.height(),
                        x: e.pageX - objOffset.left,
                        y: e.pageY - objOffset.top
                    };
                }
            }
            clickParams.body = getNodeSelector(document.getElementsByTagName("body")[0]);
            clickParams.html = getNodeSelector(document.getElementsByTagName("html")[0]);
            if (e) {
                clickParams.coords = {
                    x: e.pageX,
                    y: e.pageY
                };
            }
            //this.track("click", {"%click": clickParams});
        }

});

    /**
     * @function getNodeSelector
     * @access private
     * @description  Get string representing node's CSS selector
     * @param {domnode} node DOM node
     */
    function getNodeSelector (node) {
        var nodeTag = node.tagName.toLowerCase();
        var nodeClass = node.className ? ("." + node.className.replace(/\s+/g, ".")).replace(/\.{2,}/, ".") : "";
        var nodeId = node.id ? "#" + node.id : "";
        var nodeSelector = nodeTag + nodeId + nodeClass;
        return nodeSelector;
    }

    /**
     * @function createSelectorPath
     * @access private
     * @description  Get string representing node's CSS selector path
     *
     * @param {domnode} node DOM node
     */
    function createSelectorPath (node) {
        var path = "";
        var body = document.getElementsByTagName("body")[0];
        while (node.parentNode) {
            if (node === body) {
                node = null;
                break;
            }
            var nodeSelector = getNodeSelector(node);
            if (path) {
                path = " > " + path;
            }
            path = nodeSelector + path;
            node = node.parentNode;
        }
        return path;
    }

    // Create tracker singleton
    var trackerInstance = new Tracker();

    // Attempt to catch unhandled errors and exceptions
    (function(win){
        var callback = null, handler = win.onerror;

        win.tryCatch = function (tryFn, catchFn) {
            callback = catchFn;
            tryFn();
            callback = null;
        };

        win.onerror = function (msg, file, line) {
            var error = new Error(), suppress;
            error.message = msg;
            error.fileName = file;
            error.lineNumber = line;
            if (callback) {
                suppress = callback(error);
                callback = null;
                return suppress === false ? false : true;
            }
            trackerInstance.error(error);
            return handler ? handler.apply(win, arguments) : true;
        };

    })(window);

    // Register events to track automagickally
    jQuery(document).on("mouseover", "a, input[type=submit], button", function () {
        var node = this;
        if (!jQuery(node).attr("data-csspath")) {
            jQuery(node).attr("data-csspath", createSelectorPath(node));
        }
    });
    jQuery(document).on("click", "*", function (e){
        if (this === e.target) {
            trackerInstance.click(this, e);
        }
    });
    jQuery(window).on("beforeunload", function () {
        trackerInstance.unload();
        //return false;
    });

    // Treat blur and refocus events as end and start of subvisits
    var subvisitcount = 0;
    function startVisitSubEvent () {
        subvisitcount++;
        var sub = "visit-"+subvisitcount;
        trackerInstance.startSubEvent("visit", sub);
        trackerInstance.start("subvisit");
    }
    function stopVisitSubEvent () {
        var sub = "visit-"+subvisitcount;
        trackerInstance.stopSubEvent("visit", sub);
        trackerInstance.track("subvisit");
    }
    jQuery(window).on("focus", function () {
        startVisitSubEvent();
    });
    jQuery(window).on("blur", function () {
        stopVisitSubEvent();
    });

    // Track this visit
    trackerInstance.start("visit");
    startVisitSubEvent();


    return trackerInstance;

});
