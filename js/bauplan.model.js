define([
        "underscore",
        "thorax",
        "bauplan.authentication"
    ], function (_, Thorax, BauplanAuthentication) {
/**
 * @module bauplan%model
 * @extends Thorax.Model
 * @return {constructor} BauplanModel
 * @description  ## Generic model
 *
 *     var BauplanModel = require("bauplan.model");
 *
 * or as part of the Bauplan bundle
 *
 *     var Bauplan = require("bauplan");
 *     var BauplanModel = Bauplan.Model;
 *
 * Create and instantiate a new model class
 *
 *     var FooModel = Bauplan.Model.extend({});
 *     var fooinstance = new FooModel();
 *
 * Create a model that requires authentication
 *
 *     var AuthenticatedFooModel = Bauplan.Model.extend({
 *         _model: "authfoo",
 *         authenticated: true
 *     });
 *     
 * Set a model’s endpoint URL
 *
 *     var RestFooModel = Bauplan.Model.extend({
 *         _model: "restfoo",
 *         url: "/foo"
 *     });
 *     
 * Pass properties to a model
 *
 *     var PropsFooModel = Bauplan.Model.extend({
 *         _model: "propsfoo",
 *         properties: {
 *             foo: {
 *                  type: "integer",
 *                  exactLength: 3,
 *                  required: true
 *              }
 *          }
 *     });
 *
 * @listens module:bauplan%authentication~change:loggedIn
 */
    /**
     * @method extend
     * @return {constructor} Model
     * @static
     * @param {object} [options] Constructor options
     * @param {string} [options._model] Model name
     * @param {boolean} [options.authenticated=false] Whether this model requires authentication
     * @param {string|function} [options.url] URL for model endpoint…
     * @param {string} [options.urlRoot] … or URL stub for use with instance _id
     * @param {object} [options.schema] JSON Schema for model to use…
     * @param {object} [options.properties] … or lazily generate schema from properties
     * @param {boolean} [options.nofetch] Never fetch values from the endpoint
     * @param {string} [options.idAttribute=_id] Value to use for the model’s idAttribute. Based on assumption that most communication will be with a MongoDB-backed endpoint
     */
    var BauplanModel = Thorax.Model.extend({
        idAttribute: "_id",
        /**
         * @static
         * @override
         * @description  Overrides Thorax.Model.prototype.fetch
         *
         * Prevented from being called if:
         * - this.nofetch
         * - authentication is required
         */
        fetch: function () {
            if (!this.nofetch && (!this.Authentication || this.Authentication.loggedIn())) {
                Thorax.Model.prototype.fetch.apply(this, arguments);
            }
        },
        /**
         * @method initialize
         * @override
         * @description Passes values and options to the constructor when creating a new instance
         *
         * Creates attribute whitelist on first initialization and fetches unstance values if necesary
         * @param {object} attrs
         * @param {object} options
         * @param {boolean} [options.fetch=false] Whether to fetch instance values from endpoint
         */
        initialize: function (attrs, options) {
            options = options || {};

            if (this.authenticated) {
                var that = this;
                this.Authentication = BauplanAuthentication;
                /**
                 */
                this.Authentication.on("change:loggedIn", function() {
                    if (this.loggedIn()) {
                        // maybe not a good idea to reuse the fetch property (refetch? refetchAfterAuth? but why not?)
                        if (options.fetch) {
                            that.fetch();
                        }
                    } else {
                        that.clear();
                    }
                });
            }

            var proto = this.constructor.prototype;
            if (!proto.schema && proto.properties) {
                proto.schema = {
                    properties: proto.properties
                };
            }
            var schema = proto.schema;
            if (schema && !proto.schemaProcessed) {
                proto.schemaProcessed = true;
                if (!schema.id) {
                    schema.id = proto._model;
                }
                var schemaname = schema.id;
                schema.type = schema.type || "object";
                schema.$schema = schema.$schema || "http://json-schema.org/draft-04/schema#";
                schema.additionalProperties = schema.additionalProperties || false;
                for (var prop in schema.properties) {
                    var property = schema.properties[prop];
                    if (!property.id) {
                        property.id = schemaname + "." + prop;
                    }
                    if (!property.type) {
                        property.type = "string";
                    }
                }
                if (schema.additionalProperties === false) {
                    var whitelist = {};
                    for (var wprop in schema.properties) {
                        whitelist[wprop] = true;
                    }
                    proto.propertyMap = whitelist;
                }
            }

            if (options.fetch) {
                this.fetch();
            } else if (attrs && attrs[this.idAttribute] && _.keys(attrs).length === 1) {
                this.fetch();
            }
        },
        /**
         * @static
         * @override
         * @description Clears the attributes of an instance and any corresponding instance in the memoized register enabling atrributes to be loaded from the server again if necessary
         * 
         * Overrides Thorax.Model.prototype.clear
         * @param {object} args
         */
        clear: function() {
            this.unmemoize("clear", arguments);
        },
        /**
         * @static
         * @override
         * @description Destroys an instance and any corresponding instance in the memoized register
         * 
         * Overrides Thorax.Model.prototype.destroy
         * @param {object} args
         */
        destroy: function() {
            this.unmemoize("destroy", arguments);
        },
        /**
         * @static
         * @description  Generic helper function for syncing instances and the memoization register
         * @param {string} method
         * @param {object} args
         */
        unmemoize: function(method, args) {
            var zapMemo = function (memoname, id, count) {
                count = count || 1;
                if (BauplanModel.memo[memoname] && BauplanModel.memo[memoname][id]) {
                    delete BauplanModel.memo[memoname][id];
                    setTimeout(function() {
                        zapMemo(memoname, id, count + 1);
                    }, 100 * count);
                }
            };
            var id = this.get(this.idAttribute);
            var memoname = this.constructor.prototype._model;
            Thorax.Model.prototype[method].apply(this, args);
            if (BauplanModel.memo[memoname] && BauplanModel.memo[memoname][id]) {
                BauplanModel.memo[memoname][id].attributes = {};
            }
            // fine, but what happens if not undirtied before next actual retrieval?
            /*if (!BauplanModel.dirty[memoname]) {
                BauplanModel.dirty[memoname] = {};
            }
            BauplanModel.dirty[memoname][id] = true;*/
            zapMemo(memoname, id);
        },
        /**
         * @static
         * @description Returns instance’s attributes based on whitelist provided by model’s schema properties
         * @return {object} Whitelisted attributes
         */
        getAttributes: function (dump) {
            var attrs = _.extend({}, this.attributes);
            if (this.propertyMap) {
                for (var prop in attrs) {
                    if (!this.propertyMap[prop]) {
                        delete attrs[prop];
                    }
                }
            }
            return attrs;
        }
    });
    BauplanModel.memo = {};
    BauplanModel.dirty = {};
    /**
     * @instance
     * @param {function} Model
     * @description Returns a memoized version of Bauplan.Model
     * @return {function} MemoizedModel
     */
    BauplanModel.memoize = function (Model) {
        var modelname = Model.prototype._model;
        BauplanModel.memo[modelname] = {};
        var memo = BauplanModel.memo[modelname];
        var memoizedModel = function (attrs, options) {
            var idAttribute = Model.prototype.idAttribute;
            var object;
            options = options || {};
            if (!attrs) {
                object = new Model();
                // is this necessary?
                object.on("sync", function(){
                    memo[this.get(idAttribute)] = this;
                });
                return object;
            }
            var matchOn = options.matchOn || idAttribute;
            if (typeof attrs === "string" || typeof attrs === "number") {
                var stashOptions = attrs;
                attrs = {};
                attrs[matchOn] = stashOptions;
            }
            if (matchOn === idAttribute) {
                object = memo[attrs[idAttribute]];
                if (object) {
                    object.set(attrs);
                }
            } else if (attrs[matchOn]) {
                for (var cached in memo) {
                    var objectCheck = memo[cached];
                    //console.log("matching", matchOn, attrs[matchOn], objectCheck.attributes[matchOn]);
                    if (attrs[matchOn] === objectCheck.attributes[matchOn]) {
                        object = objectCheck;
                        break;
                    }
                }
            }
            /*if (BauplanModel.dirty[modelname] && BauplanModel.dirty[modelname][object.get(idAttribute)]) {
                delete memo[object.get(idAttribute)];
                object = undefined;
            }*/

            if (!object) {
                // if we searched by another key, don't make a new object. Or rather, not until we can get objects by other keys
                if (matchOn === idAttribute) {
                    if (!options.hasOwnProperty("parse")) {
                        options.parse = true;
                    }
                    object = new Model(attrs, options);
                    if (attrs[idAttribute]) {
                        memo[attrs[idAttribute]] = object;
                    }
                    object.on("sync", function(){
                        memo[this.get(idAttribute)] = this;
                    });
                }
            }

            return object;
        };
        if (Model.prototype.authenticated) {
            memoizedModel.authenticated = true;
        }

        return memoizedModel;
    };

    return BauplanModel;
});