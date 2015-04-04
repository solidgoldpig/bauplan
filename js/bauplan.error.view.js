define([
        "thorax"
    ], function (Thorax) {
/**
* @module bauplan%error%view
* @extends Thorax.View
* @description ## Error handling
*
*     var ErrorView = require("bauplan.error.view");
*
* Inserts an error view, using {@link template:error%view}
*
* Any errors (or warnings or infos) that are set on the parent control view will be displayed automatically.
*
* In normal circumstances, it should be invoked implicitly by {@link module:bauplan%control%view}.
* 
* @return {constuctor} ErrorView
*/
    var ErrorView = Thorax.View.extend({
        /**
        * @constant {string} [name=error]
        */
        name: "error",
        /**
        * @constant {string} [template=error.view]
        */
        template: "error.view",
        /**
        * @param {object} [options]
        */
        initialize: function (options) {
            //this.model = new Thorax.Model();
            this.setModel(options.model);
        }
    });
    return ErrorView;
});

