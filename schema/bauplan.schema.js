define(function(require) {
    var Schemas = require("schema.loader");
    var JSV = require("jsv").JSV;
    var _ = require("underscore");
        //jsonschemaversion = require("json.schema");

    var JSVENV = JSV.createEnvironment();
    for (var schema in Schemas) {
        JSVENV.validate(undefined, Schemas[schema]);
    }

    var defaultOptions = {
        initialize: function(options) {
            /*this._schema = options.schema;
            this.schema = options.schema;*/
        },
        validate: function () {
            if (this.schema) {
                delete this.errors;
                var json = this.toJSON();
                //delete json.schema;
                var report = JSVENV.validate(json, this.schema);
                if (report.errors.length) {
                    this.errors = report;
                    return report;
                } else {
                    return;
                }
                //var Schemas = require("schema.loader"); var twont = new SchemaModel({schema: Schemas.test}); twont.set("tata", "x"); twont.set("lala", 36); twont.validate()
                //twont.set("tata", 36); twont.validate()
            }
        }
    };
    var Thorax = require("thorax");
    var SchemaModel = function(schema, extendOptions, modelOptions) {

        extendOptions = _.extend({}, defaultOptions, extendOptions, {schema: schema});

        var model = new (Thorax.Model.extend(extendOptions))(modelOptions);

        return model;
    };
    window.SchemaModel = SchemaModel;

    var Backbone = require("backbone");
    Backbone.Model.prototype.validate = defaultOptions.validate;
    Backbone.Model.prototype.pinitialize = function(options) {
        console.log(options, arguments);
        options = options || {};
        this.schema = options.schema;
    };
    console.log("JSV - pinitialize?????");
    return JSVENV;
    /*var JSVENV = JSV.createEnvironment("json-schema-draft-03");
    return JSVENV;*/

});