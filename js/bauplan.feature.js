define(["handlebars"], function (Handlebars) {
/**
* ## Allow code feature to run
*
*     Feature.get("foo")
*
* Feature support is set in initial config passed to app
*
* #### Helper methods
*
*     Feature.set("foo", true)
*
*     Feature.reset("foo")
*
*     Feature.resetAll()
*
* Clears any programatically set values for all features
*
* ### Handlebars helper
*
*     {{#feature "foo"}} ... {{/feature}}
*
* @module bauplan%feature
*/

    // Make sure FEATURES exists
    //if (!window.FEATURES) {
    //    window.FEATURES = {};
    //}
    var FEATURES;

    /*!
    * @access private
    * @namespace
    * For caching Feature lookups
    */
    var FeatureStatus = {};

    var Feature = {};

    /**
     * @method get
     * @instance
     * @param {string} name Name of feature to execute
     * @return boolean
     * @description Returns whether a given feature is supported
    */
    Feature.get = function (name, options) {
        if (!FeatureStatus.hasOwnProperty(name)) {
            // TODO
            // This should check if the value is in flags / wherever
            // If not, call the backend for a response
            if (!FEATURES) {
                FEATURES = Feature.bauplan.Config.config.features || {};
            }
            FeatureStatus[name] = !!FEATURES[name];
        }
        return FeatureStatus[name];
    };
    /**
     * @method set
     * @instance
     * @param {string} name Name of feature to set
     * @param {boolean} val Value of feature
     * @description Change the value of a feature
     */
    Feature.set = function (name, val) {
        if (typeof val !== "boolean") {
            throw "Must pass a Boolean to Feature.set";
        }
        FeatureStatus[name] = val;
    };
    /**
     * @method reset
     * @instance
     * @param {string} name Name of feature to reset to original value
     * @description Reset the value of a single feature to intital configuration
     */
    Feature.reset = function (name) {
        delete FeatureStatus[name];
    };
    /**
     * @method resetAll
     * @instance
     * @description Clear all feature values - resets back to initial configuration
     */
    Feature.resetAll = function () {
        FeatureStatus = {};
    };

    // Register handlebars helper
    Handlebars.registerHelper('feature', function (conditional, options) {
        if (Feature.get(conditional)) {
            return options.fn(this);
        } else {
            return options.inverse(this);
        }
    });

    return Feature;

});