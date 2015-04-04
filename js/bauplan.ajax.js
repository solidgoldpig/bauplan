define([
        "underscore",
        "jquery",
        "backbone",
        "handlebars"
    ], function (_, jQuery, Backbone, Handlebars) {
/**
 * @module bauplan%ajax
 * @extends Backbone.ajax
 * @return Nothing - loaded just for its side effects
 * @description ## Rest handling
 *
 *     require("bauplan.ajax");
 *
 * Allows views to set specific error and success handlers for Backbone's AJAX requests
 *
 * Also intercepts and performs redirects on AJAX responses, both get and post
 *
 * Caching is disabled for all AJAX requests
 */

    jQuery.ajaxSetup ({
        // Disable caching of AJAX requests
        cache: false
    });

    var redirectForm = Handlebars.compile('<form id="{{this.id}}" method="post" action="{{{this.url}}}" style="display: none;">{{#each args}}<input name="{{{@key}}}"  value="{{{this}}}">{{/each}}</form>');
    window.redirectForm = redirectForm;
    Backbone.ajax = function (options) {
        // root + options.url ???

        options.headers = _.extend({}, options.headers, {
            "X-Site-Authentication": "TOKEN-GOES-HERE-AND-BIKE-SHEDDED-NAME"
        });

        var error = options.errorCallback;

        if (!options.error) {
            options.error = function (xhr, status, thrown) {
                console.log("Backbone ajax wrapper error handling", status, thrown, xhr);
            };
        }
        var errorMethod = options.error;
        options.error = function (xhr, status, thrown) {
            var res = xhr.responseJSON;
            if (res && res.status === 302 && res.url) {
                // if display interstitial dialog
                if (res.args || res.method && res.method.match(/post/i)) {
                    res.id = "redirector" + Date.now();
                    var redirector = redirectForm(res);
                    jQuery("body").append(redirector);
                    jQuery("#"+res.id).submit();
                } else {
                    window.document.location = xhr.responseJSON.url;
                }
                return;
            }
            errorMethod(xhr, status, thrown);
        };
        var successMethod = options.success;
        if (successMethod) {
            options.success = function () {
                //console.log("We got some success", arguments);
                successMethod.apply(this, arguments);
            };
        }

        return Backbone.$.ajax.call(Backbone.$, options);
    };

});
