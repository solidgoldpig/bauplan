define([
        "thorax"
    ], function (Thorax) {
/**
 * @module bauplan%collection
 * @extends Thorax.Collection
 * @return {constructor} BauplanCollection
 * @description  ## Generic collection
 *
 *     var BauplanCollection = require("bauplan.collection");
 *
 * or as part of the Bauplan bundle
 *
 *     var Bauplan = require("bauplan");
 *     var BauplanCollection = Bauplan.Collection;
 *
 * Create and instantiate a new collection class
 *
 *     var FooCollection = Bauplan.Collection.extend({});
 *     var foocollectioninstance = new FooCollection();
 *
 * Create a collection that requires authentication
 *
 *     var AuthenticatedFooCollection = Bauplan.Collection.extend({
 *         _collection: "authfoo",
 *         authenticated: true
 *     });
 *     
 * Set a collection’s endpoint URL
 *
 *     var RestFooCollection = Bauplan.Collection.extend({
 *         _collection: "restfoo",
 *         url: "/foos"
 *     });
 *     
 * Set a collection’s model
 *
 *     var FooModel = require("foo.model");
 *     var ModelFooCollection = Bauplan.Collection.extend({
 *         _collection: "restfoo",
 *         model: FooModel
 *     });
 *
 * @listens module:bauplan%authentication~change:loggedIn
 */
    var BauplanCollection = Thorax.Collection.extend(
        /**
         * @method extend
         * @return {constructor} Collection
         * @static
         * @param {object} [options] Constructor options
         * @param {string} [options._collection] Model name
         * @param {model} [options.model] Collection model
         * @param {boolean} [options.authenticated=false] Whether this collection requires authentication
         * NB. not necessary to set this if the collection model is protected
         * @param {string|function} [options.url] URL for collection endpoint…
         * @param {string} [options.urlRoot] … or URL stub for use with instance _id
         */
    {
        /**
         * @method initialize
         * @override
         * @description Passes values and options to the constructor when creating a new instance
         *
         * Creates attribute whitelist on first initialization and fetches unstance values if necesary
         * @param {array} [models] Initial models to instantiate collection with
         * @param {object} [options] Additional options
         * @param {string} [options.selector] Selector key
         * @param {string} [options.selectorType] SelectorType key
         * @param {string} [options.fromID] fromID key
         * @param {string} [options.fromType] fromType key
         * @param {string} [options.hasID] hasID key
         * @param {string} [options.hasType] hasType key
         */
        initialize: function(models, options) {
            models = models || [];
            options = options || {};
            if (this.authenticated || this.model.authenticated) {
                var that = this;
                this.Authentication = this.bauplan.Authentication;
                this.Authentication.on("change:loggedIn", function() {
                    if (this.loggedIn()) {
                        that.fetch();
                    } else {
                        that.reset();
                    }
                });
            }

            if (options) {
                if (options.selector) {
                    this.selector = options.selector;
                }
                if (options.selectorType) {
                    this.selectorType = options.selectorType;
                }
                if (options.fromID) {
                    this.fromID = options.fromID;
                }
                if (options.fromType) {
                    this.fromType = options.fromType;
                }
                if (options.hasID) {
                    this.hasID = options.hasID;
                }
                if (options.hasType) {
                    this.hasType = options.hasType;
                }
            }
            if (this.fromID && this.fromType) {
                this.url = this.urlRoot + "/from/" + this.fromType + "/" +this.fromID;
            } else if (this.hasID && this.hasType) {
                this.url = this.urlRoot + "/has/" + this.hasType + "/" +this.hasID;
            } else if (this.selectorType && this.selector) {
                this.url = this.urlRoot + "/selector/" + this.selectorType + "/" +this.selector;
            }

            this.fetch();
        },
        /**
         * @static
         * @override
         * @description  Overrides Thorax.Collection.prototype.fetch
         *
         * Prevented from being called if:
         * - authentication is required
         */
        fetch: function() {
            if (!this.Authentication || this.Authentication.loggedIn()) {
                Thorax.Collection.prototype.fetch.apply(this, arguments);
            }
        }

    });

    return BauplanCollection;
});