define([
        "bauplan.model"
    ], function (BauplanModel) {
/**
 * @module bauplan%controller
 * @extends module:bauplan%model
 * @return {constructor} BauplanController
 * @description ## Generic controller
 * Simply returns a {@link module:bauplan%model}
 *
 *     var BauplanController = require("bauplan.controller");
 *
 * or as part of the Bauplan bundle
 *
 *     var Bauplan = require("bauplan");
 *     var BauplanController = Bauplan.Controller;
 *
 * Create a controller
 *
 *     var FooController = Bauplan.Controller.extend({
 *         …
 *     });
 *     
 */
    var BauplanController = BauplanModel.extend({});
    return BauplanController;
});