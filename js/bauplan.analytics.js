define([], function () {
/**
 * @module bauplan%analytics
 * @description ## Google Analytics
 *
 *     var Analytics = require("bauplan.analytics");
 *
 * or as part of the Bauplan bundle
 *
 *     var Bauplan = require("bauplan");
 *     var Analytics = Bauplan.Analytics;
 *
 * To record a pageview
 * 
 *     Analytics.pageview("/foo");
 *
 * To record a transaction
 *
 *     Analytics.transaction();
 *
 * These methods should not usually be called directly, since they are called from within the corresponding methods in {@link module:bauplan%tracker}
 *
 * @return {instance} Analytics
 * @see module:bauplan%tracker
 */

    var ga;

    var Analytics = {};

    /**
     * @method pageview
     * @param {string} url URL to be recorded
     * @description Record a pageview
     * @instance
     */
    Analytics.pageview = function (url) {
        if (!/^\//.test(url)) {
            url = "/" + url;
        }

        // legacy version
        //if (window._gaq !== undefined) {
        //    window._gaq.push(["_trackPageview", url]);
        //}

        // Analytics.js
        if (ga === undefined) {
            if (window.GoogleAnalyticsObject && window.GoogleAnalyticsObject !== "ga") {
                ga = window.GoogleAnalyticsObject;
            } else {
                ga = window.ga;
            }
        }
        if (ga !== undefined) {
            ga("send", "pageview", url);
        }

    };
    /**
     * @method transaction
     * @param {object} transaction Transaction details to be recorded
     * @description Record a transaction
     * @instance
     */
    Analytics.transaction = function (transaction) {
        if (ga !== undefined) {
            ga("require", "ecommerce");
            var manifest = transaction.manifest;
            delete transaction.manifest;
            ga("ecommerce:addTransaction", transaction);
            while (manifest) {
                var item = transaction.manifest.shift();
                item.id = transaction.id;
                ga("ecommerce:addItem", item);
            }
            ga("ecommerce:send");
            ga("ecommerce:clear");
        }
    };
 
    return Analytics;
});