define([
        "lodash",
        "thorax",
        "bauplan"
    ], function (_, Thorax, Bauplan) {
/**
 * @description ## Thorax patches
 *
 * Adds Thorax.LayoutViewModel
 *
 * Adds Thorax.ViewWithLayoutModel (for use by {@link module:bauplan%layout%controller})
 *
 * (Both aliased to Bauplan)
 *
 * ### Layout view helper
 *
 * Provides the glue which allows layout views to be inserted declaratively and the contained views to be updated or changed (for instance, simply by navigating to another route)
 *
 *     {{layout view=view options=viewOptions}}
 *
 * See {@link module:bauplan%helpers} and {@link module:bauplan%layout%controller} for more details
 *
 * @module bauplan%thorax%patch
 */
    function createRegistryWrapper(klass, hash) {
        var $super = klass.extend;
        klass.extend = function() {
            var child = $super.apply(this, arguments);
            if (child.prototype.name) {
                hash[child.prototype.name] = child;
            }
            return child;
        };
    }

    /**
     * @member {object} LayoutViews
     * @description  Registry for layout views
     * @private
     */
    Thorax.LayoutViews = {};
    createRegistryWrapper(Thorax.LayoutView, Thorax.LayoutViews);

    /**
     * @member {object} LayoutViewModels
     * @description  Registry for layout view models
     * @private
     */
    Thorax.LayoutViewModels = {};
    /**
     * @method LayoutViewModel
     * @instance
     * @param {string} layoutName Name of the layout view model
     * @param {object} [options] Options to pass to the layout view model
     * @description  Allows layout view models to be referenced and got by name
     *
     * Changes to the layout view model update the ViewWithLayoutModel it is attached to
     * @return {instance} LayoutViewModel
     */
    Thorax.LayoutViewModel = function(layoutName, options) {
        if (!Thorax.LayoutViewModels[layoutName]) {
            var mod = new Thorax.Model(options);
            mod.layoutid = layoutName;
            Thorax.LayoutViewModels[layoutName] = mod;
        }
        return Thorax.LayoutViewModels[layoutName];
    };
    /**
     * @method ViewWithLayoutModel
     * @instance
     * @param {string} name Name of the layout view model
     * @param {object} [options] Options to pass to the view used by the ViewWithLayoutModel
     * @return {instance} ViewWithLayoutModel
     */
    Thorax.ViewWithLayoutModel = function(name, options) {
        var mainOptions = {
            name: name,
            model: new Thorax.LayoutViewModel(name)
        };
        if (options) {
            mainOptions = _.extend({}, mainOptions, options);
        }
        if (!mainOptions.template) {
            mainOptions.template = name + ".view";
        }

        return Thorax.View.extend(mainOptions);
    };
    Bauplan.ViewWithLayoutModel = Thorax.ViewWithLayoutModel;

    return Thorax;
});