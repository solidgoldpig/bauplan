define([
        "underscore",
        "thorax",
        "larynx"
    ], function (_, Thorax, Larynx) {
/**
 * @module bauplan%view
 * @extends Thorax.View
 * @return {constructor} BauplanView
 * @description  ## Generic view
 *
 *     var BauplanView = require("bauplan.view");
 *
 * or as part of the Bauplan bundle
 *
 *     var Bauplan = require("bauplan");
 *     var BauplanView = Bauplan.View;
 *
 * To create and instantiate a new view class
 *
 *     var FooView = Bauplan.View.extend({
 *         name: "foo"
 *     });
 *     var fooviewinstance = new FooView();
 *
 * #### View templates
 * 
 * In the example above, FooView automatically uses a template named "foo.view".
 *
 * To create a view that uses a non-default view template
 *
 *     var FooTemplateView = Bauplan.View.extend({
 *         name: "foo",
 *         template: "bar.view"
 *     });
 *
 * #### View models
 *
 * To create a view that uses the bar model
 *
 *     var FooModelView = Bauplan.View.extend({
 *         name: "foo",
 *         model: Bar
 *     });
 *
 * To create a view that requires a more complex context than simply the model view’s attributes
 *
 *     var FooContextView = Bauplan.View.extend({
 *         name: "foo",
 *         model: Bar,
 *         context: function () {
 *             var attributes = _.extend({}, someOtherObject, this.model.attributes);
 *             delete attributes.notneeded;
 *             return attributes;
 *         }
 *     });
 *
 * NB. this is standard Thorax behaviour
 *
 * ### Saving the view model
 *
 * Without any further intervention, a view form will, when submitted, save the view model and then redirect to the previous route. But often, that will not be sufficient.
 * 
 * NB. views do not need to have a form and do not need to save
 * 
 * #### Post-save redirecting
 * 
 * To create a view that redirects to the "bar" route on success and "baz" on error
 *
 *     var FooRedirectView = Bauplan.View.extend({
 *         name: "foo",
 *         successRoute: "bar",
 *         errorRoute: "baz"
 *     });
 *
 * or alternatively
 * 
 *     var FooRedirectAltView = Bauplan.View.extend({
 *         name: "foo",
 *         saveOptions: {
 *             success: {
 *                 route: "bar"
 *             },
 *             error: {
 *                 route: "baz"
 *             }
 *          }
 *     });
 *
 * #### Post-save callbacks
 * 
 * To create a view that calls bar() on success and baz() on error
 *
 *     var FooCallbackView = Bauplan.View.extend({
 *         name: "foo",
 *         successCallback: bar,
 *         errorCallback: baz
 *     });
 *
 * or alternatively
 * 
 *     var FooCallbackAltView = Bauplan.View.extend({
 *         name: "foo",
 *         saveOptions: {
 *             success: {
 *                 callback: bar
 *             },
 *             error: {
 *                 callback: baz
 *             }
 *         }
 *     });
 *
 * #### Saving without propagating to endpoint
 * 
 * To create a view that does not save the model to the server and executes its success handler immediately
 *
 *     var FooNoSaveView = Bauplan.View.extend({
 *         name: "foo",
 *         saveOptions: {
 *             save: false
 *         }
 *     });
 *
 * #### Overriding default save and outcome handling methods
 * 
 * To create a view that has custom methods for saving and dealing with the outcomes
 *
 *     var FooCustomMethodsView = Bauplan.View.extend({
 *         name: "foo",
 *         saveForm: function (options) { … },
 *         onSuccess: function (model, response, options) { … },
 *         onError: function (model, response, options) { … }
 *     });
 *
 * #### Preventing view refreshing
 * 
 * To create a view that does not re-render when its model updates
 *
 *     var FooNoRenderOnUpdateView = Bauplan.View.extend({
 *         name: "foo",
 *         renderUpdate: false
 *     });
 *
 * #### Instance methods of note
 *
 * ##### Checking and enabling the view form
 * 
 *     - {@link module:bauplan%view#validateAllControls}
 *     - {@link module:bauplan%view#enableForm}
 *     - {@link module:bauplan%view#disableForm}
 *
 * ##### Accessing child control views of the view
 * 
 *     - {@link module:bauplan%view#getControl}
 *     - {@link module:bauplan%view#addControlError}
 *
 * ##### View navigation
 * 
 *     - {@link module:bauplan%view#previous}
 * 
 * @listens module:bauplan%view~click:saveSelector
 * @listens module:bauplan%view~click:cancelSelector
 * @listens module:bauplan%view~on:rendered
 *
 * @see module:bauplan%control%view
 */

    /**
     * @event window:on:mouseenter
     * @description Faux-focuses elements as the mouse moves over them and removes focus from any focused control of kinds, input[type=text], input[type=password], textarea
     *
     * This gets around blur events causing 2 clicks to be required on buttons
     *
     * Applies to a, button, [type=submit], label
     */
    var stashFocused;
    var elementsToBlur = "a, button, [type=submit], label";
    jQuery(document).on("mouseenter", elementsToBlur, function() {
        var focused = jQuery(":focus");
        if (focused.view() && focused.view().name === "control" && focused.eq(0).is("input[type=text], input[type=password], textarea")) {
            stashFocused = focused;
            if (stashFocused.is(":in-viewport")) {
                stashFocused.addClass("faux-focused");
            }
            stashFocused.blur();
        }
    });
    /**
     * @event window:on:click
     * @description Un-faux-focuses elements and removes focus on any previously focused control
     *
     * Applies to a, button, [type=submit], label
     */
    jQuery(document).on("click", elementsToBlur, function() {
        if (stashFocused) {
            stashFocused.removeClass("faux-focused");
            stashFocused = null;
        }
    });
    /**
     * @event window:on:mouseleave
     * @description Un-faux-focuses elements and resets focus on any previously focused control
     *
     * Applies to a, button, [type=submit], label
     */
    jQuery(document).on("mouseleave", elementsToBlur, function() {
        if (stashFocused && stashFocused.is(":in-viewport")) {
            stashFocused.focus();
            stashFocused.removeClass("faux-focused");
            stashFocused = null;
        }
    });

    var Bauplan;
    var BauplanView = Thorax.View.extend(
        /**
         * @method extend
         * @return {constructor} View
         * @static
         * @param {object} options Constructor options
         * @param {string} options.name=default View name
         * @param {string} [options.template] View template - defaults to view name
         * @param {contructor} [options.model] View model or collection. An object or array can be passed instead to create respectively a model or collection automatically
         * @param {string} [options.saveSelector=[name=action-submit]] CSS selector to match save|submit element
         * @param {string} [options.cancelSelector=[name=action-cancel]] CSS selector to match cancel element
         * @param {boolean} [options.initialValues=true] Denotes that the form’s initial values should not constitute a form in a valid state
         * @param {function} [options.context] Explicitly override Thorax.View.prototype.context
         * @param {function} [options.saveForm] Explicitly override default saveForm method
         * @param {function} [options.onSuccess] Explicitly override default onSuccess method
         * @param {function} [options.onError] Explicitly override default onError method
         * @param {object} [options.saveOptions] Options to pass to post-success handler
         * @param {boolean} [options.saveOptions.save=true] Save the model to the endpoint. If false, skip straight to the onSuccess method
         * @param {object} [options.saveOptions.success] Success handler options
         * @param {string} [options.saveOptions.success.route] Success redirect route if successRoute has not been defined
         * @param {function} [options.saveOptions.success.callback] Success callback if successCallback has not been defined
         * @param {object} [options.saveOptions.error] Error handler options
         * @param {string} [options.saveOptions.error.route] Error redirect route if successRoute has not been defined
         * @param {function} [options.saveOptions.error.callback] Error callback if errorCallback has not been defined
         * @param {string} [options.successRoute] Explicit route to redirect to post success
         * @param {string} [options.errorRoute] Explicit route to redirect to post error
         * @param {function} [options.successCallback] Explicit callback post success
         * @param {function} [options.errorCallback] Explicit callback error
         * @param {boolean} [renderUpdate=true] Whether to render view when the model updates
         */
    {
        name: "default",
        /**
         * @override
         * @description Suppresses Thorax.View.prototype.populate since control views provide that functionality
         */
        populate: function(){},
        saveSelector: "[name=action-submit]",
        cancelSelector: "[name=action-cancel]",
        saveOptions: {},
        initialValues: true,
        //postRender: function(e) {
        //    this.validateAllControls();
        //},

        /**
         * @method constructor
         * @private
         * @static
         * @param {arguments} arguments Applied to Thorax.View
         * @description  Sets:
         *
         * - layoutmodel
         * - template (defaulting to name + ".view")
         * - controlmodel
         */
        constructor: function () {
            this.layoutmodel = new Thorax.LayoutViewModel(this.name);
            if (!this.template) {
                this.template = this.name + ".view";
            }
            if (this.bauplan) {
                Bauplan = this.bauplan;
            }
            if (this.controlmodel) {
                this.model = this.controlmodel;
                this.renderUpdate = false;
            }
            //Thorax.View.prototype.constructor.apply(this, arguments);
            Thorax.View.apply(this, arguments);
            if (this.model && this.renderUpdate !== undefined) {
                var model = this.model;
                this.setModel();
                this.setModel(model, {render: this.renderUpdate});
            }
        },
        /**
         * @private
         * @description Creates a parallel instance to track changes
         */
        setDirtyModel: function () {
            this.dirtymodel = new Thorax.Model( _.extend({}, this.model ? this.model.attributes : {}));
        },
        /**
         * @method validateAllControls
         * @instance
         * @param {object} [options]
         * @param {boolean} [options.update] Whether to update the controls
         * @param {boolean} [options.validate] Whether to validate the controls
         * @description Validates all view controls and enables or disables the form accordingly
         */
        validateAllControls: function (options) {
            options = options || {};
            options.norevalidation = true;
            if (options.update) {
                options.forceDisplay = true;
            }
            var checkmethod;
            if (options.update) {
                checkmethod = "updateControl";
            } else if (options.validate) {
                checkmethod = "validateControl";
            }

            this.hasNoErrors = true;
            var children = this.children;
            for (var view in children) {
                var control = children[view];
                if (control.name !== "control") {
                    continue;
                }
                if (checkmethod) {
                    var value = control.getValue();
                    control[checkmethod](value, options);
                }
                if (control.getError()) {
                    this.hasNoErrors = false;
                }
            }
            this.enableForm(this.hasNoErrors);
        },
        /**
         * @method enableForm
         * @instance
         * @param {boolean} enable Whether to enable or disable form
         * @param {boolean} force Whether to force the state chnge
         * @description Enables the view form
         */
        enableForm: function (enable, force) {
            var disable = enable === false;
            if (this.initialValues && !force) {
                // if allow to run without model changes, put checks here
                // since dirtymodel combines all model changes that should be ok
                // currently manually unsetting, when a valid change comes through for the model
                // this does not catch the case of the model being put back into its initial state
                disable = true;
            }
            this.disabled = disable;
            // would be better if this triggered a change to the actions view
            this.$el.find(this.saveSelector).toggleClass("disabled", disable);
        },
        /**
         * @method disableForm
         * @instance
         * @description Disables the view form
         */
        disableForm: function() {
            this.enableForm(false);
        },
        /**
         * @method getControl
         * @instance
         * @param {string} name Control name
         * @description Returns the named control view that is a child of the current view
         * @return {view} ControlView
         */
        getControl: function (name) {
            var kids = this.children;
            for (var kid in kids) {
                if (kids[kid].controlname === name) {
                    return kids[kid];
                }
            }
        },
        /**
         * @method addControlError
         * @instance
         * @param {string} name Control name
         * @param {error} error Error to display
         * @param {object} [options]
         * @description Display an error on the named control
         */
        addControlError: function (name, error, options) {
            var control = this.getControl(name);
            options = options || {};
            options.error = error;
            options.norevalidation = true;
            control.updateControl(options);
        },
        /**
         * @method onHandle
         * @instance
         * @param {string} type=success|error Type of result
         * @param {model} model Model/collection in a state reflecting the outcome of the save operation
         * @param {XHR} response The full jqXHR response object
         * @param {object} [options] Additional options to be passed to the callback function
         * @description Generic handling of success/error outcomes when saving a model or collection instance
         *
         * #### [success|error]Route
         *
         * #### [success|error]Callback
         */
        onHandle: function (type, model, response, options) {
            var saveOptions = this.saveOptions;
            var handleRoute = this[type+"Route"];
            if (!handleRoute && saveOptions[type]) {
                handleRoute = saveOptions[type].route;
            }
            if (handleRoute) {
                Bauplan.Router.callRoute(handleRoute);
            } else {
                var handleCallback = this[type+"Callback"];
                if (!handleCallback && saveOptions[type]) {
                    handleCallback = saveOptions[type].callback;
                }
                if (handleCallback) {
                    handleCallback.apply(this, [model, response, options]);
                } else {
                    // Do we really always want to go back?
                    // maybe should be check for routePrevious?
                    //Bauplan.Router.previous();
                }
            }

        },
        /**
         * @method onSuccess
         * @instance
         * @param {model} model Model/collection in a state reflecting the successful outcome
         * @param {XHR} response The full jqXHR response object
         * @param {object} options Additional options to be passed to the callback function
         * @description Success wrapper method for {@link module:bauplan%view#onHandle}
         */
        onSuccess: function (model, response, options) {
            this.onHandle("success", model, response, options);
        },
        /**
         * @method errorCallback
         * @instance
         * @param {model} model Model/collection in a state reflecting the outcome
         * @param {XHR} response The full jqXHR response object
         * @param {object} options Additional options to be passed to the callback function
         * @description Default error callback method
         *
         * Displays any error message returned, using it as an internationalisation key if it exists
         *
         * Disables view form submission 
         */
        errorCallback: function (model, response, options) {
            var json = response.responseJSON;
            this.error = json.message || json.messagekey;
            // this should be done elsewhere
            this.error = Larynx.Phrase.get(this.error) || this.error;
            this.model.trigger("change");
            this.disableForm();
        },
        /**
         * @method onError
         * @instance
         * @param {model} model Model/collection in a state reflecting the outcome
         * @param {XHR} response The full jqXHR response object
         * @param {object} options Additional options to be passed to the callback function
         * @description Error wrapper method for {@link module:bauplan%view#onHandle}
         */
        onError: function (model, response, options) {
            this.onHandle("error", model, response, options);
            // maybe this should be in onHandle
            this.hasbeensubmitted = false;
            this.$el.find(this.saveSelector).removeClass("submitting");
            // make it like onSuccess
            /*if (this.errorRoute) {
                Bauplan.Router.callRoute(this.errorRoute);
            } else if (this.errorCallback) {
                this.errorCallback();
            }*/
        },
        /**
         * @method saveForm
         * @instance
         * @param {object} options
         * @description Optionally (by default) save the form’s model and then invoke the handler method for the outcome
         */
        saveForm: function (options) {
            if (this.saveOptions.save === false) {
                this.onSuccess(options);
            } else {
                var that = this;
                var model = this.model;
                model.save(model.attributes, {
                    // should apply arguments
                    success: function(model, response) {
                        that.onSuccess(model, response, options);
                    },
                    error: function(model, response) {
                        that.onError(model, response, options);
                    }
                });
            }
        },
        /**
         * @method previous
         * @instance
         * @param {event} [e] DOM event
         * @description Navigate app to previous route view
         */
        previous: function (e) {
            Bauplan.Router.previous();
        },
        /** 
         * @description Default events to mix in with events if overridden
         */
        defaultEvents: {
            /**
             * @event on:rendered
             * @description Validate all the controls post view rendering
             */
            rendered: function (e) {
                this.validateAllControls({rendered:true});
            }
        },
        /** 
         * @description Basic events for BauplanView
         */
        events: function (e) {
            var viewEvents = _.extend({}, this.defaultEvents);
            /**
             * @event click:saveSelector
             * @description When user attempts to submit the view form
             *
             * - prevents double submission
             * - checks whether it is in a submittable state
             * - provides feedback that it is being submitted
             * - submits it
             */
            viewEvents["click " + this.saveSelector] = function(e) {
                if (this.hasbeensubmitted) {
                    e.preventDefault();
                    e.stopPropagation();
                    return;
                }
                this.validateAllControls({update:true});
                if (this.hasNoErrors && !this.disabled) {
                    this.hasbeensubmitted = true;
                    this.$el.find(this.saveSelector).addClass("submitting");
                    this.saveForm(this.saveOptions, e);
                } else {
                    jQuery(e.target).blur();
                    e.preventDefault();
                    //e.stopPropagation();
                }
            };
            /**
             * @event click:cancelSelector
             * @description When user cancels the view form
             *
             * - discards changes
             * - loads previous view
             */
            viewEvents["click " + this.cancelSelector] = function(e) {
                if (this.cleanModel) {
                    this.model.set(this.cleanModel, {silent:true});
                }
                // NOOOO! We don't always want to go back
                this.previous();
                // alternatively - though a bit expensive possibly
                /*var that = this;
                this.model.fetch({
                    success: function() {
                        that.previous();
                    }
                });*/
            };
            return viewEvents;
        }
    });

    return BauplanView;
});