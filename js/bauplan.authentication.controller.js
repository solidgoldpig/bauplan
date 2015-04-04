define([
        "bauplan.controller",
        "bauplan.authentication"
    ], function (BauplanController, BauplanAuthentication) {
/**
 * @module bauplan%authentication%controller
 * @extends module:bauplan%controller
 * @return {instance} BauplanAuthenticationController
 * @description ## Authentication controller
 * Separate from {@link module:bauplan%authentication} to prevent circular dependency loop in {@link module:bauplan%router%base}
 *
 *     var AuthenticationController = require("bauplan.authentication.controller");
 *
 * or as part of the Bauplan bundle
 *
 *     var Bauplan = require("bauplan");
 *     var AuthenticationController = Bauplan.AuthenticationController;
 *
 * To authenticate a user (and redirect to view that had required authentication)
 *
 *     AuthenticationController.authenticate(true);
 *
 * To deauthenticate a user (and redirect to logout view)
 *
 *     AuthenticationController.deauthenticate();
 *
 * @see module:bauplan%authentication
 */
    var AuthenticationController = BauplanController.extend({
        _model: "authentication.controller",
        /**
         * @description Authenticates user and redirects to view that required authentication
         * @param {boolean} registered Whether the user has been reigistered (erm...?)
         * @param {boolean} [noredirect] Whether to prevent redirect after authentication
         * @instance
         * @fires module:bauplan%authentication~change:registered
         * @fires module:bauplan%authentication~change:loggedIn
         */
           //* - {@link module:bauplan%authentication~setRegisteredCookie}
        authenticate: function(registered, noredirect) {
            // registered performs no useful function, maybe I intended this to call deauthenticate if false
            BauplanAuthentication.set("loggedIn", true);
            BauplanAuthentication.set("registered", true);
            if (!noredirect && !BauplanAuthentication.additional) {
                this.redirect();
            }
        },
        /**
         * @description Deauthenticates the user and redirects to logged out view
         * @instance
         * @fires module:bauplan%authentication~change:loggedIn
         */
        deauthenticate: function() {
            BauplanAuthentication.set("loggedIn", false);
            this.bauplan.Router.callRoute("logout", {trigger: true, replace: true});
        },
        /**
         * @description Redirects user to URL that prompted authentication (or the home page if none)
         * @innerstance
         */
        redirect: function() {
            if (BauplanAuthentication.loggedIn()) {
                var redirectUrl = BauplanAuthentication.get("redirectUrl") || this.bauplan.Router.reverse("root");
                // should we unset this always?
                BauplanAuthentication.unset("redirectUrl");
                // and maybe we should be storing a route instead? Hmmm, but how
                this.bauplan.Router.navigate(redirectUrl, {trigger: true, replace: true});
            }
        }
    });

    return new AuthenticationController();
});