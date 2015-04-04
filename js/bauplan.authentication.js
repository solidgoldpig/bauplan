define([
        "thorax",
        "jquery"
    ], function (Thorax, jQuery) {
/**
 * @module bauplan%authentication
 * @extends Thorax.Model
 * @return {instance} BauplanAuthentication
 * @description ## Authentication instance
 *
 *     var Authentication = require("bauplan.authentication");
 *
 * or as part of the Bauplan bundle
 *
 *     var Bauplan = require("bauplan");
 *     var Authentication = Bauplan.Authentication;
 *
 * To find out whether the user is logged in
 *
 *     var logged = Authentication.loggedIn();
 *
 * To find out whether the user is registered
 *
 *     var registered = Authentication.registered();
 *
 * To find out whether the user is logged in through a third party
 *
 *     var registered = Authentication.viaExternalProvider();
 *
 * To find out whether the user’s account is locked
 *
 *     var locked = Authentication.locked();
 *
 * To find out whether the user is geoblocked
 *
 *     var geoblocked = Authentication.geoBlocked();
 *
 * To find out whether the user has failed age verification
 *
 *     var ageblocked = Authentication.ageverificationBlocked();
 
 * Additionally, the authentication instance provides access to the following user info 
 * - session
 * - provider
 * - entry
 * 
 * @listens module:bauplan%authentication~change:registered
 * @listens module:bauplan%authentication~change:loggedIn
 *
 * @see module:bauplan%authentication%controller
 * @see module:bauplan
 */

    /**
     * @function setRegisteredCookie
     */
    function setRegisteredCookie() {
        jQuery.cookie("registered", true, {path:"/"});
    }

    var BauplanAuthentication = Thorax.Model.extend({
        /**
        * @property {boolean} loggedIn=false
        * @property {boolean} registered=false
        * @property {boolean} loggedIn=false
        * @property {boolean} geoblocked=false
        */
        defaults: {
            loggedIn: false,
            registered: false,
            locked: false,
            geoblocked: false
        },
        /**
        * @description Marshalls data from BauplanData
        *
        * Alternatively, checks for presence of cookie
        */
        initialize: function() {
            BauplanData = BauplanData || {};
            if (!BauplanData.registered) {
                BauplanData.registered = jQuery.cookie("registered");
                if (BauplanData.registered) {
                    BauplanData.previouslyRegistered = true;
                    // which achieves what?
                }
            } else {
                setRegisteredCookie();
                if (BauplanData.session) {
                    BauplanData.provider = BauplanData.session.provider;
                    BauplanData.entry = BauplanData.session.entry;
                }
            }
            this.set(BauplanData);
            BauplanData = {};
        },
        /**
        * @description Returns whether user's account is locked
        * @return {boolean}
        * @instance
        */
        locked: function() {
            return !!this.get("locked");
        },
        /**
        * @description Returns whether user's account is geo-blocked
        * @return {boolean}
        * @instance
        */
        geoBlocked: function() {
            return !!this.get("geoblocked");
        },
        /**
        * @description Returns whether user has failed age verification
        * @return {boolean}
        * @instance
        */
        ageverificationBlocked: function() {
            return this.get("ageverified") === false;
        },
        /**
        * @description Returns whether user is logged in
        * @return {boolean}
        * @instance
        */
        loggedIn: function() {
            return !!this.get("loggedIn");
        },
        /**
        * @description Returns whether user is registered
        * @return {boolean}
        * @instance
        */
        registered: function() {
            return !!this.get("registered");
        },
        /**
        * @description Returns whether user is logged in via a third party
        * @return {boolean}
        * @instance
        */
        viaExternalProvider: function() {
            var provider = this.get("provider");
            return this.loggedIn() && provider && provider !== "local";
        }
    });

    var auth = new BauplanAuthentication();
    /**
     * @event change:registered
     * @description When user has succesfully registered
     */
    auth.on("change:registered", setRegisteredCookie);
    /**
     * @event change:loggedIn
     * @description When user logs in or out
     */
    auth.on("change:loggedIn", function() {
        if (!this.get("loggedIn")) {
            this.unset("provider");
            this.unset("session");
        } else {
            this.set("provider", "local");
            // ha! but we don't have a corresponding session to set here
            // login should return more than just congratulations
        }
    });
    return auth;
});