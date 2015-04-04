define([
        "jquery",
        "thorax"
    ], function (jQuery, Thorax) {
/**
 * @module bauplan%layout%controller
 * @description View and SubView handling
 *
 *     var LayoutController = require("bauplan.layout.controller");
 *
 * or as part of the Bauplan bundle
 *
 *     var Bauplan = require("bauplan");
 *     var LayoutController = Bauplan.LayoutController;
 *
 * Set the view of the ViewWithLayoutModel named "foo" to "bar"
 *
 *     foo.view template
 *     …
 *     {layout view=view}
 *     …
 *     LayoutController.set("foo", "bar");
 *     
 * The result is as if a view helper calling "bar.view" had been inserted to "foo.view" which can be switched or updated without any effect on the other elements in foo.view.
 *
 * See the example app for a basic demonstration of this.
 *
 * If only one argument is passed, the ViewWithLayoutModel is set to the default ("site-content")
 * 
 * So the following call sets the view in "site-content" to "foo"
 * 
 *     LayoutController.set("foo");
 *
 * Setting the same view again is ignored 
 * 
 *     LayoutController.set("foo"); -> Does not run
 *
 * Additional variables can be passed through to the view that is set. In this case, the "'article" view is loaded, with the options passed to initialize set to viewOptions
 *
 *     {layout view=view options=viewOptions}
 *     …
 *     LayoutController.set({
 *         view: "article",
 *         viewOptions: {
 *             article: "foo",
 *             redacted: true
 *         }
 *     });
 *
 * setScroll will not only set the chosen view, but also sets the viewport back to top of the document
 * 
 *     LayoutController.setScroll("login");
 *
 * ### Existing subviews
 *
 * If the subview to be loaded in context is already present and has a setLayout method, then that method will be executed instead of reinstantiating the subview. This enables lightweight udpates such as setting and removing classes rather than having to rerender the view
 *
 * @return {instance} LayoutController
 */
    var BauplanLayoutController = {
        defaultlayoutview: "site-content",
        /**
         * @method updateLayoutView
         * @private
         * @instance
         * @param {string|model} viewModel
         * @param {object|string} viewValues
         * @param {string} layoutId
         * @description Generic layout setting handler 
         */
        updateLayoutView: function (viewModel, viewValues, layoutId) {

            if (viewModel) {
                if (typeof viewValues === "string") {
                    viewValues =  {
                        view: viewValues
                    };
                }
                if (!viewValues.view) {
                    viewValues.view = "default";
                    var vvvOptions = viewValues.viewOptions;
                    if (vvvOptions) {
                        if (vvvOptions.name && !vvvOptions.template) {
                            var vvvtemplate = vvvOptions.name;
                            if (!vvvtemplate.match(/\.view$/)) {
                                vvvtemplate += ".view";
                            }
                            vvvOptions.template = vvvtemplate;
                        }
                    }
                }
                //console.log(viewModel.layoutid, viewValues, layoutId);
                if (viewModel.layoutid === this.defaultlayoutview) {
                    if (viewValues.view) {
                        //jQuery('body').addClass("active-view-"+viewValues.view);
                        //alternatively, after we've rendered
                        // check to see parent and set automagickally
                    }
                }

                var viewElement = function(view) {
                    return jQuery('[data-view-name="'+view+'"]');
                };
                var isViewInDocument = function(view) {
                    return !!viewElement(view).closest("body").length;
                };

                var checkInDocument = function(view) {
                    //console.log("checkInDocument", view);
                    if (typeof view !== "string") {
                        return;
                    }
                    if (!isViewInDocument(view)) {
                        setTimeout(function(){
                            checkInDocument(view);
                        }, 0);
                    } else {
                        var actualView = viewElement(view).view();
                        //console.log("actualView", view, actualView, actualView.postRender);
                        if (actualView && actualView.postRender) {
                            actualView.postRender();
                        }
                    }
                };

                var skipValues = {};
                for (var prop in viewValues) {
                    if (viewValues[prop] === viewModel.get(prop)) {
                        //delete viewValues[prop];
                        skipValues[viewValues[prop]] = true;
                    } else {
                        // doesn't handle nested views
                        // and it would be good to recurse back up
                    /*    var propVal = viewModel.get(prop);
                        if (typeof propVal === "string") {
                            var previousView = viewElement(propVal).view();
                            if (previousView && previousView.preRemove) {
                                preRemoves.push(previousView.preRemove);
                            }
                        }
                    */
                    }
                }

                var updateModel = function() {
                    for (var layoutProp in viewValues) {
                        if (typeof viewValues[layoutProp] === "string") {
                            var viewEl = viewElement(viewValues[layoutProp]);
                            if (viewEl.view() && viewEl.view().setLayout) {
                                viewEl.view().setLayout();
                                delete viewValues[layoutProp];
                            }
                        }
                    }
                    viewModel.set(viewValues);
                    var layoutid = viewModel.layoutid;
                    for (var newProp in viewValues) {
                        checkInDocument(viewValues[newProp]);
                        if (newProp.match(/view/i) && typeof viewValues[newProp] === "string") {
                            var layoutPrefix = "layoutview-"+layoutid+"-active-"+newProp+"-";
                            var activeClass = layoutPrefix + viewValues[newProp];
                            var body = jQuery("body");
                            if (!body.hasClass(activeClass)) {
                                if (body.removePrefixedClass) {
                                body.removePrefixedClass(layoutPrefix);
                                }
                                body.addClass(activeClass);
                            }
                        }
                    }
                };

                // great, but, erm, view.children?
                var removeChildViews = function(view, callback, skip) {
                    view = view.view();
                    var childViews = [];
                    view.$("[data-view-name]").each(function(){
                        var that = jQuery(this);
                        if (that.parent().closest("[data-view-name]").get(0) === view.el) {
                            if (!skip || !skip[that.attr("data-view-name")]) {
                                childViews.push(that);
                            }
                        }
                    });
                    var childCount = childViews.length;
                    var currentCallback = function() {
                        var preRemove = view.preRemove;
                        if (preRemove) {
                            preRemove(callback);
                        } else {
                            callback();
                        }
                    };
                    var childCallback = function() {
                        childCount--;
                        if (childCount < 1) {
                            currentCallback();
                        }
                    };
                    if (childCount) {
                        for (var v = 0; v < childViews.length; v++) {
                            removeChildViews(childViews[v], childCallback);
                        }
                    } else {
                        currentCallback();
                    }
                };

                var layoutView = viewElement(viewModel.name);
                if (layoutView.length) {
                    removeChildViews(layoutView, updateModel, skipValues);
                } else {
                    updateModel();
                }
            }

        },

        /**
         * @method set
         * @instance
         * @param {string} [layout=this.defaultlayoutview]
         * @param {string|object} view
         * @param {string} [view.view] View name
         * @param {object} [view.viewOptions] View options
         * @description Set the view of a ViewWithLayoutModel
         */
        // maybe it would be better to do set(layout, view, viewOptions)
        // and therefore set(view, viewOptions)
        // if arguments.length === 3, definitely an explicit layout call
        // if args.length === 2, is arguments[1] an object?
        // if args.length === 1, definitely an implicit defaultlayoutview call
        // er, no. Think it through again Alex
        // what would happen if calling an explicit sub-layout? ;)
        // but maybe set(x, y, z, zoptions)?
        // where y is set in x, z is set in y and on. No options for any bar the last view though.
        // Think on, young *cough* Padawan
        // ...
        // ...
        // more to the point, if defaultlayoutview alone is called, by default set should scrollTop
        // and it should be explicit to not invoke the scrollTopping
        set: function(layout, view) {
            if (arguments.length === 1) {
                view = arguments[0];
                layout = this.defaultlayoutview;
            }
            var Bauplan = this.bauplan;
            if (Bauplan.Authentication.locked() && view !== "locked") {
                setTimeout(function(){
                    Bauplan.Router.callRoute("locked", {trigger:true});
                }, 1);
                return;
            }
            var that = this;
            var currentScrollTop = view.scrolltop ? 0 : jQuery(document).scrollTop();
            var doSetting = function() {
                var layoutViewModel = new Thorax.LayoutViewModel(layout);
                that.updateLayoutView(layoutViewModel, view);
                jQuery(document).scrollTop(currentScrollTop);
            };
            doSetting();
            /*if (typeof view === "object" && view.scrolltop) {
                doSetting();
                //jQuery("html, body").animate({ scrollTop: 0 }, 250, doSetting);
            } else {
                doSetting();
            }*/
        },



        /**
         * @method setScroll
         * @instance
         * @param {string|object} view
         * @param {string} [view.view] View name
         * @param {object} [view.viewOptions] View options
         * @description Set the view of the default ViewWithLayoutModel and scroll to the top of the document
         */
        setScroll: function(view) {
            if (typeof view === "string") {
                view = {
                    view: view
                };
            }
            view.scrolltop = true;
            this.set(view);
        },

        /**
         * @method genericView
         * @instance
         * @param {string} template
         * @description  Loads the default view using the named template
         */
        genericView: function (template) {
            this.set({
                viewOptions: {
                    name: template
                }
            });
        }
    };

    return BauplanLayoutController;
});