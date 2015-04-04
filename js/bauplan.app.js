define([
        "lodash",
        "jquery",
        "bauplan",
        "larynx",
        "socket.io",
        "app.setup"
    ], function (_, jQuery, Bauplan, Larynx, SocketIO, AppSettings) {
/**
 * @module bauplan%app
 * @description ## Application instance
 *
 *     var App = require("bauplan.app");
 *
 * or as part of the Bauplan bundle
 *
 *     var Bauplan = require("bauplan");
 *     var App = Bauplan.App;
 *
 * To set or get the app locale
 * 
 *     App.locale("fr");
 *     var loc = App.locale(); // "fr"
 *
 * To (re-)render the entire app
 *
 *     App.render();
 *
 * This module performs the grunt work once all configuration and dependencies have been loaded
 *
 * - loads app settings from app.setup (if any)
 * - sets app’s root view
 *   - name
 *   - id
 *   - template
 * - sets app locale/lang
 *
 * - renders app
 *
 * - calls callback (if any)
 *
 * @see  module:app%setup
 * 
 * @return {instance} App
 */

    /**
     * @member {Object} settings
     * @property {string} [name=main.layout] Main layout name
     * @property {string} [id=main-layout] Main layout id
     * @property {string} [template={{name}}.view] Main layout template
     * @property {string} [element=#app] DOM target element
     * @property {string} [locale=en] Default locale
     * @property {function} [initialized] Post-initialization function
     */
    var settings = {
        name: "main.layout",
        id: "main-layout",
        element: "#app",
        locale: "en"
    };
    settings = _.extend(settings, AppSettings);
    settings.template = settings.template || settings.name + ".view";

    var App = {
        /**
         * @method render
         * @description Renders the entire application from the root view
         * @instance
         * @memberOf module:bauplan%app
         */
        render: function() {
            var mainLayout = new Bauplan.View(settings);
            var $el = jQuery(settings.element);
            $el.html("");
            mainLayout.appendTo($el);
        },
        /**
         * @description Set/get app locale
         * @param {string} [loc] Value of locale
         * @return {string} Value of locale
         * @instance
         * @memberOf module:bauplan%app
         */
        locale: function (loc) {
            if (loc) {
                locale = loc;
                Larynx.locale(loc);
            }
            return Larynx.locale();
        }
    };
    App.locale(settings.locale);

    /*if (!jQuery.cookie("entry")) {
        jQuery.cookie("entry", JSON.stringify({
            referrer: document.referrer,
            timestamp: (new Date()).toISOString()
        }), { path: "/" });
    }*/

    App.render();
    // not sure this shouldn't be in the router code, but what ho!
    if (settings.initialized) {
        settings.initialized();
    }

    Bauplan.App = App;
    if (Bauplan.Config.callback) {
        Bauplan.Config.callback();
    }

    return App;

});