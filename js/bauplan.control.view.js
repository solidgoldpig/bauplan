define([
        "lodash",
        "thorax",
        "larynx",
        "bauplan.error.view"
    ], function (_, Thorax, Larynx, ErrorView) {
/**
 * @module bauplan%control%view
 * @description ## Control component view
 *
 *     var ControlView = require("bauplan.control.view");
 *
 * Provides default control views and methods to register additional control types, formats and primitives
 * 
 * Any control for an attribute that is registered as having any of these kinds will have that kind’s phase methods executed automatically when the corresponding phase runs
 *
 * #### Kinds
 * 
 * Primitives represent native JSON schema types that can be assigned to a model’s attribute, eg. string, boolean, integer
 *
 * Formats represent format types that can be assigned to a model’s attribute
 *
 * Control types represent a spcecialised control that that can be assigned to a model’s attribute
 *
 * #### Phase methods
 * 
 * All kinds can provide any of the following phase methods as needed
 * - prepare -
 *     does any extra work required to get the value during the control’s initialisation
 * - format -
 *     formats the value to be displayed
 * - normalize -
 *     ensures that value is in the right format
 *     
 *     eg. collates data if in several input fields
 *     or transforms a date string in to an actual date object
 * - validate -
 *     validates the normalized value, adding any errors encountered to an error stack
 *
 * NB. It is preferable to use the {@link template:control%view} template rather than make a new ControlView directly
 * 
 * @extends Thorax.View
 * @return {constructor} ControlView
 */
    /**
     * @method extend
     * @return {constructor} ControlView
     * @static
     * @param {string} [valueAttribute=value] Control property to use to obtain controls’s value
     */
    var ControlView = Thorax.View.extend({
        /**
         * @member {string} name=control View name
         */
        name: "control",
        /**
         * @member {string} template=control.view Template key
         */
        template: "control.view",
        /**
         * @member {array} kinds List of control kinds
         */
        kinds: ["primitive", "format", "controltype"],
        /**
         * @member {object} primitives Primitive kind register
         */
        primitives: {},
        /**
         * @member {object} formats Format kind register
         */
        formats: {},
        /**
         * @member {object} controltypes Control type kind register
         */
        controltypes: {},
        /**
         * @member {string} [valueAttribute=value] Control property to use to obtain controls’s value
         */
        valueAttribute: "value",
        /**
         * @method initialize
         * @inner
         * @param {object} options Options
         * 
         * @param {string} options.control-name The name to use for the control inoput’s name (or equivalent)
         * 
         * @param {string} [options.edit=true] Edit mode - whether to render an editable or display version of the control view
         * 
         * @param {string} [options.display=false] Inverse alias for edit. NB. has no effect if edit is defined
         * 
         * @param {object} [options.model] Model to bind to the control (controlmodel). Can also be passed as control-model. If not passed, a new empty Thorax Model is used.
         * 
         * @param {boolean} [options.instant-validate] Whether to perform instant validation on the control
         * 
         * @param {boolean} [options.required=false] Whether the control is required to have a value
         * 
         * @param {boolean} [options.multiline=false] Whether a text input is allowed to have multiple lines
         * 
         * @param {string} [options.value] The initial value for the control. If not provided the control will retrieve the value from the control model using the control's name (control-name) as the property
         * 
         * @param {string} [options.control-id] Value to use for control’s id. If not provided the control will use control-{{controlname}}
         * 
         * @param {string} [options.phrasekey] Phrasekey to use for control.
         *
         * If not provided the control will attempt to use
         * - {{controlmodel._phrasekey}}
         * - model.{{controlmodel._model}}.{{controlname}}
         * 
         * @param {string} [options.label] Text for control’s label.
         * 
         * If not provided the control will attempt to use {{phrasekey}}.label as a lookup key, falling back to using the controlname if none is found
         * 
         * @param {string} [options.placeholder] Text to use for placeholder
         * 
         * If not provided the control will attempt to use {{phrasekey}}.placeholder
         * 
         * @param {string} [options.note] Text for control’s note.
         * 
         * If not provided the control will attempt to use {{phrasekey}}.note
         * 
         * @param {boolean} [options.control-keyup=false] Whether to validate on keyup
         * 
         * @param {string} [options.control-type] Overrides any controltype that may have been specified by the controlmodel’s schema
         * 
         * @param {string} [options.control-primitive] Overrides any primitive that may have been specified by the controlmodel’s schema
         * 
         * @param {string} [options.control-format] Overrides any format that may have been specified by the controlmodel’s schema
         * 
         * @param {viewmodel} [options.parent] The parent view this control should belong to
         *
         * @description
         * - Determines whether mode is edit or display
         *     - if schema property has fixed, then the control is uneditable and mode will always be display
         * - Sets empty controlmodel if none passed
         * - Sets dirty model
         * - Removes any property prefixed with control-
         * - Adds relevant initialization methods
         * - Applies relevant prepare methods
         * - Attaches schema
         * - Creates clean model for control
         * - Create messages model for control
         * - Update model
         */
        initialize: function(options) {
            var newoptions = _.extend({}, options);
            options = newoptions;
            //console.log("control.view.init da noo", options, "this", this);

            // set this.controlparent to default parent in context since this.parent doesn't exist yet
            this.controlparent = options.parent;

            this.edit = options.edit;
            if (this.edit === undefined) {
                this.edit = !options.display;
            }
            // but is it fixed?

            this.controlname = options["control-name"];
            var controlname = this.controlname;
            this.controlmodel = options.model || options["control-model"] || new Thorax.Model();
            var controlmodel = this.controlmodel;
            // or indeed, get it from this.controlparent.model!!!!!

            this.dirtymodel = new Thorax.Model(controlmodel ? _.extend({}, controlmodel.attributes) : {});

            //var schemaProperties;
            var schema = controlmodel ? controlmodel.schema : undefined;
            //var schemaProperties = schema.properties;
            var schemaControl;
            var fixedControl;
            if (schema && schema.properties && schema.properties[controlname]) {
                schemaControl = schema.properties[controlname];
            }
            this.controlschema = schemaControl;
            this.primitive = "string";
            this.controloptions = {};
            if (this.controlschema) {
                if (this.controlschema.type) {
                    this.primitive = this.controlschema.type;
                }
                if (this.controlschema.format) {
                    this.format = this.controlschema.format;
                }
                if (this.controlschema.controltype) {
                    this.controltype = this.controlschema.controltype;
                }
                if (this.controlschema.controloptions) {
                    this.controloptions = this.controlschema.controloptions;
                }
                fixedControl = this.controlschema.fixed;
            }
            if (this.fixed !== undefined) {
                fixedControl = this.fixed;
            }
            if (fixedControl && controlmodel && controlmodel.get(controlname)) {
                this.edit = false;
            }

            //console.log("schemaControl", schemaControl);

            function getControlParam(key, bool, attributeKeyMap) {
                var param;
                if (options[key] !== undefined) {
                    param = options[key];
                    delete options[key];
                } else {
                    if (schemaControl) {
                        var lookupKey = attributeKeyMap||key;
                        param = schemaControl[lookupKey];
                    }
                }
                if (bool) {
                    param = !!param;
                }
                return param;
            }

            this.keyup = getControlParam("control-keyup", true, "keyup");
            this.instantValidation = getControlParam("instant-validate", true, "instant-validate");
            this.instantValidation = true; // total override for now

            this.required = getControlParam("required", true);
            this.multiline = getControlParam("multiline", true);

            var controlvalue = options.value !== undefined ? options.value : this.controlmodel.get(this.controlname);
            var phrasekey = options.phrasekey;
            if (!phrasekey && controlmodel) {
                phrasekey = controlmodel._phrasekey || "model." + controlmodel._model + "." + controlname;
            }
            this.phrasekey = phrasekey;
            var label = options.label;
            if (label === undefined) {
                label = Larynx.Phrase.get(phrasekey, {_append: "label"}) || controlname;
            }
            this.label = label;

            var id = options["control-id"] || "control-"+this.controlname;

            var placeholder = options.placeholder;
            if (placeholder === undefined) {
                placeholder = Larynx.Phrase.get(phrasekey, {_append: "placeholder"});
            }
            this.placeholder = placeholder; // uh, why?

            var note = options.note;
            if (note === undefined) {
                note = Larynx.Phrase.get(phrasekey, {_append: "note"});
            }

            this.controltype = options["control-type"] || this.controltype || (this.multiline ? "textarea" : "text");

            this.primitive = options["control-primitive"] || this.primitive;
            this.format = options["control-format"] || this.format;

            // this should probably come before this.keyup, instantValidation etc.
            // or rather they should come after this
            // but first, a design decision on whether real-time checking is the default or not
            for (var k in this.kinds) {
                var kind = this.kinds[k];
                var kinds = kind + "s";
                if (this[kinds].initialize) {
                    var extras = this[kinds].initialize[this[kind]] || {};
                    for (var addProp in extras) {
                        this[addProp] = extras[addProp];
                    }
                }
            }

            var control = {
                name: this.controlname,
                controlid: id,
                value: controlvalue,
                label: label
            };
            if (placeholder) {
                control.placeholder = placeholder;
            }
            if (note) {
                control.note = note;
            }

            control = this.preparePrimitive(control, phrasekey, options);
            control = this.prepareFormat(control, phrasekey, options);
            control = this.prepareControl(control, phrasekey, options);


            if (this.controlschema) {
                if (this.controlschema.exactLength) {
                    //this.controlschema.maxLength = this.controlschema.exactLength;
                    //this.controlschema.minLength = this.controlschema.exactLength;
                }
                if (this.controlschema.maxLength) {
                    control.maxlength = this.controlschema.maxLength;
                }
            }

            delete options["control-name"];
            delete options.phrasekey;
            delete options.label;
            delete options["control-type"];
            delete options["control-primitive"];
            delete options["control-format"];
            delete options.edit;
            delete options.display;
            delete options.className;
            delete options["control-model"];
            // delete anything else beginning with control-
            // anything prefixed input- goes for input
            for (var op in options) {
                var pop = op.replace(/^control-/, "");
                if (pop !== op) {
                    this.controloptions[pop] = options[op];
                    delete options[op];
                }
            }

            this.controlschema = this.controlschema || {};
            // hmmmmmm
            control = _.extend({}, options, control);

            var model = new Thorax.Model(control);
            this.setModel(model); //, {render:false});
            this.messages = new Thorax.Model();
            // allow errors, info to be passed explicitly

            this.updateControl(model.get(this.valueAttribute));
        },
        /**
         * @method context
         * @override
         * @description Deletes attributes meant for label and not for control input
         * 
         * Assigns template to text.{{mode}} if controltype does not have a template
         *
         * Overrides Thorax.View.prototype.context
         * @return {object} View attributes
         */
        context: function() {
            this.controlparent = this.controlparent || this.parent;
            this.controldirtymodel = this.controlparent.dirtymodel;
            var attrs = _.extend({}, this.model.attributes);
            attrs.attributes = _.extend({}, this.model.attributes);
            attrs.attributes.id = attrs.attributes.controlid;
            delete attrs.attributes.controlid;
            delete attrs.attributes.label;
            delete attrs.placeholder;
            attrs.controltype = this.controltype;
            var tmpltype =  "." + (this.edit ? "edit" : "display");
            var tmpl = this.controltype + tmpltype;
            if (!Thorax.templates[tmpl]) {
                // could check for multiline and set to textarea?
                tmpl = "text" + tmpltype;
            }
            attrs.controltemplate = tmpl;
            return attrs;
        },
        /**
         * @member {boolean} controlError Whether the control has an error
         * @private
         * @inner
         */
        controlError: false,
        /**
         * @member {boolean} controlErrorFlag Whether the control should display an error
         * @private
         * @inner
         */
        controlErrorFlag: false,
        /**
         * @member {array} errorDisplayStack Array of errors for control
         * @private
         * @inner
         */
        errorDisplayStack: undefined,
        /**
         * @method startErrorReport
         * @private
         * @inner
         * @description  Notes the existence of any previous errors and resets this.controlError, this.controlErrorFlag and this.errorDisplayStack
         */
        startErrorReport: function() {
            this.hadError = this.getError();
            this.controlError = false;
            this.controlErrorFlag = false;
            this.errorDisplayStack = undefined;
        },
        /**
         * @method  addError
         * @param {string} err  Error name (can be a phrasekey)
         * @param {object} options Following options
         * @param {boolean} [options.display=false] Whether to display error
         * @param {boolean} [options.forceDisplay=false] Whether to force display
         * @param {string} [options.method=push] Method to use to add error to stack
         * @description Sets this.controlError to true
         * If the error is to be displayed also sets this.controlErrorFlag and adds the error to this.errorDisplayStack using the method specified (push by default)
         */
        addError: function (err, options) {
            //console.log("addError - this", this, "this.controlError", this.controlError);
            options = options || {};
            this.controlError = true;
            if (options.forceDisplay) {
                options.display = true;
            }
            if (options.flag) {
                this.controlErrorFlag = true;
            } else if (options.display !== false) {
                this.controlErrorFlag = true;
                this.errorDisplayStack = this.errorDisplayStack || [];
                this.errorDisplayStack[options.method || "push"](err);
            }
        },
        /**
         * @method getError
         * @return {boolean} Whether control has an error
         */
        getError: function() {
            return this.controlError;
        },
        /**
         * @method getDisplayErrors
         * @private
         * @inner
         * @return {array} List of errors to be displayed for the control
         */
        getDisplayErrors: function() {
            return this.errorDisplayStack;
        },
        /**
         * @method prepareMethod
         * @private
         * @inner
         * @param  {string} kind      Name of kind
         * @param  {control} control   Control view object
         * @param  {string} [phrasekey] Optional phrasekey for lookups
         * @param  {object} options   Additional options
         * @description  Generic handler for applying kinds prepare methods to control
         * @return {control}  Updated control
         */
        prepareMethod: function (kind, control, phrasekey, options) {
            var actualMethod = "prepare";
            //if ()
            var kinds = kind + "s";
            if (this[kinds].prepare && this[kinds].prepare[this[kind]]) {
                control = this[kinds].prepare[this[kind]].apply(this, [control, phrasekey, options]);
            }
            return control;
        },
        /**
         * @method preparePrimitive
         * @private
         * @inner
         * @param  {control} control   Control view object
         * @param  {string} [phrasekey] Optional phrasekey for lookups
         * @param  {object} options   Additional options
         * @description  Passes params to {@link module:bauplan%control%view~prepareMethod}
         * @return {control}  Updated control
         */
        preparePrimitive: function (control, phrasekey, options) {
            return this.prepareMethod("primitive", control, phrasekey, options);
        },
        /**
         * @method prepareFormat
         * @private
         * @inner
         * @param  {control} control   Control view object
         * @param  {string} [phrasekey] Optional phrasekey for lookups
         * @param  {object} options   Additional options
         * @description  Passes params to {@link module:bauplan%control%view~prepareMethod}
         * @return {control}  Updated control
         */
        prepareFormat: function (control, phrasekey, options) {
            return this.prepareMethod("format", control, phrasekey, options);
        },
        /**
         * @method prepareControl
         * @private
         * @inner
         * @param  {control} control   Control view object
         * @param  {string} [phrasekey] Optional phrasekey for lookups
         * @param  {object} options   Additional options
         * @description  Passes params to {@link module:bauplan%control%view~prepareMethod}
         * @return {control}  Updated control
         */
        prepareControl: function (control, phrasekey, options) {
            return this.prepareMethod("controltype", control, phrasekey, options);
        },
        /**
         * @method registeredMethod
         * @private
         * @inner
         * @param  {*} value Control value
         * @param  {string} kind      Name of kind
         * @param  {control} control   Control view object
         * @param  {object} options   Additional options
         * @description  Generic handler for applying kinds methods to control
         * @return {control}  Updated control
         */
        registeredMethod: function (value, kind, method, options) {
            var kinds = kind + "s";
            if (this[kinds][method] && this[kinds][method][this[kind]]) {
                value = this[kinds][method][this[kind]].apply(this, [value, options]);
            }
            return value;
        },
        /**
         * @method normalizeMethod
         * @private
         * @inner
         * @param  {*} value Control value
         * @param  {string} kind   Name of kind
         * @description  Generic normalize method handler for kinds.
         * Passes params to {@link module:bauplan%control%view~registeredMethod}
         * @return {*}  Updated value
         */
        normalizeMethod: function (value, kind) {
            return this.registeredMethod(value, kind, "normalize");
        },
        /**
         * @method normalizePrimitive
         * @private
         * @inner
         * @param  {*} value Control value
         * @description  Passes params to {@link module:bauplan%control%view~normalizeMethod}
         * @return {*}  Updated value
         */
        normalizePrimitive: function(value) {
            return this.normalizeMethod(value, "primitive");
        },
        /**
         * @method normalizeFormat
         * @private
         * @inner
         * @param  {*} value Control value
         * @description  Passes params to {@link module:bauplan%control%view~normalizeMethod}
         * @return {*}  Updated value
         */
        normalizeFormat: function (value) {
            //console.log("normalizeFormat", this.normalizeMethod(value, "format"));
            return this.normalizeMethod(value, "format");
        },
        /**
         * @method normalizeControlType
         * @private
         * @inner
         * @param  {*} value Control value
         * @description  Passes params to {@link module:bauplan%control%view~normalizeMethod}
         * @return {*}  Updated value
         */
        normalizeControlType: function (value) {
            return this.normalizeMethod(value, "controltype");
        },
        /**
         * @method normalizeControl
         * @private
         * @inner
         * @param  {*} value Control value
         * @description  Calls {@link module:bauplan%control%view~normalizePrimitive}, {@link module:bauplan%control%view~normalizeFormat}, {@link module:bauplan%control%view~normalizeControlType}
         * @return {*}  Updated value
         */
        normalizeControl: function (value) {
            value = this.normalizePrimitive(value);
            value = this.normalizeFormat(value);
            value = this.normalizeControlType(value);
            return value;
        },
        /** 
         * @method  validateRequired
         * @param  {*} value  Control value
         * @param  {object} options Additonal validation options
         * @description  Returns whether or not a control has a value
         * 
         * If the field is required the following values are treated as absent
         * 
         * - undefined
         * - empty string
         * - false if primitive is boolean
         * - null if primitive is not null
         * 
         * If the value is absent and the control is required, a required error is added to the control unless
         * 
         * - the control model either had no previous value for the property
         * - options.forecDisplay is true
         *
         * Id the field is not required, absent is calculated based on the truthiness of the value
         * 
         * @return {boolean}  absent Whether control has no value
         */
        validateRequired: function (value, options) {
            var absent;
            if (this.required) {
                if (value === undefined) {
                    absent = true;
                } else if (value === "") {
                    absent = true;
                } else if (value === false && this.primitive === "boolean") {
                    absent = true;
                } else if (value === null && this.primitive !== "null") {
                    absent = true;
                }
            }
            if (absent) {
                // if it previously had a value or we really want to know
                var newoptions = {};
                var display = !!(this.controlmodel.get(this.controlname) || options.forceDisplay);
                if (options.forceDisplay) {
                    display = true;
                }
                //newoptions.display 
                //console.log("display", display, this.controlname, this.controltype);
                this.addError("required", {display: display});
            }
            // cheeky! if it's not required and has no value, don't do any of the other validation
            // NB. normalisation should make sure that value isn't a different kind of falsy
            if (!value && !this.required) {
                absent = true;
            }
            return absent;
        },
        /**
         * @method validateMethod
         * @private
         * @inner
         * @param  {*} value Control value
         * @param  {string} kind   Name of kind
         * @param  {object} options  Additional validation options
         * @description  Generic validation method for kinds.
         * Passes params to {@link module:bauplan%control%view~registeredMethod}
         * @return {errorModel}  messages
         */
        validateMethod: function (value, kind, options) {
            this.registeredMethod(value, kind, "validate", options);
            return this.messages;
        },
        /**
         * @method validatePrimitive
         * @private
         * @inner
         * @param  {*} value Control value
         * @param  {object} options  Additional validation options
         * @description  Generic validation method for kinds.
         * Passes params to {@link module:bauplan%control%view~validateMethod}
         * @return {errorModel}  messages
         */
        validatePrimitive: function (value, options) {
            return this.validateMethod(value, "primitive", options);
        },
        /**
         * @method validateFormat
         * @private
         * @inner
         * @param  {*} value Control value
         * @param  {object} options  Additional validation options
         * @description  Generic validation method for kinds.
         * Passes params to {@link module:bauplan%control%view~validateMethod}
         * @return {errorModel}  messages
         */
        validateFormat: function (value, options) {
            return this.validateMethod(value, "format", options);
        },
        /**
         * @method validateControlType
         * @private
         * @inner
         * @param  {*} value Control value
         * @param  {object} options  Additional validation options
         * @description  Generic validation method for kinds.
         * Passes params to {@link module:bauplan%control%view~validateMethod}
         * @return {errorModel}  messages
         */
        validateControlType: function (value, options) {
            return this.validateMethod(value, "controltype", options);
        },
        /**
         * @method validateControl
         * @private
         * @inner
         * @param  {*} value Control value
         * @param  {object} options  Additional validation options
         * @param  {string} [options.error]  Manually passed error name/phrasekey
         * @param  {boolean} [options.rendered=true]  Whether to flag up any error
         * @param  {boolean} [options.forceDisplay=true]  Whether to force the display of any error
         * @param  {boolean} [options.norevalidation=false]  Whether to trigger revalidation of all the parent view's controls
         * @description  Does nothing if in display mode
         *
         * - Clears previous errors
         * - Trims string values
         * - Normalizes value
         * - Adds error explicitly passed in options
         * - Calls
         *     - this.validateRequired
         *     - this.validatePrimitive
         *     - this.validateFormat
         *     - this.validateControlType
         * - call flagError if appropriate
         * - silently sets dirtymodel
         * - silently sets controldirtymodel (if there is one)
         * - if value has changed, sets controlparent's initialValues to false
         * - updates parent view if appropriate
         * @return {*}  Updated value
         */
        validateControl: function (value, options) {
            if (!this.edit) {
                return value;
            }
            this.startErrorReport();
            // TODO: stick T12 in here and add to String.prototype
            if (typeof value === "string") {
                value = value.replace(/^\s+/,"").replace(/\s+$/,"");
            }
            value = this.normalizeControl(value);
            if (options.error) {
                this.addError(options.error, options);
            } else {
                var absentRequired = this.validateRequired(value, options);
                if (!absentRequired) {
                    this.validatePrimitive(value, options);
                    //if (this.co) Do generics stuff here
                    this.validateFormat(value, options);
                    this.validateControlType(value, options);
                }
            }
            if (!options.rendered) {
                var flagit;
                if (options.forceDisplay) {
                    flagit = this.getError();
                }
                this.flagError(flagit);
            }

            // in case we need to know the value that failed to get validated,
            // ie. what's the current state of the control
            this.dirtymodel.set(this.valueAttribute, value, {silent:true});
            if (this.controldirtymodel) {
                this.controldirtymodel.set(this.controlname, value, {silent:true});
            }

            /*var hasError = this.getError();
            if (!hasError && !options.norevalidation) {
                console.log("updating", this.controlname, options);
                // why set this if it's the first time through and nothing's changed?
                this.model.set(this.valueAttribute, value, {silent:true});
                // why did this need force?
                // if so, an invalid state can be set
                // MO currently is, all good, update the model and then just save it
                // the model will always be in a good state since we don't allow trash to be saved
                // therefore must check that none of the contained control views of the page has an error
                // - but if a control is not dirty but invalid we must perform a validation of all controls first
                //if (options.force) {
                    // a) options.silent
                    // b) move to validateControl along with the dirty model
                    // need to be able to reinsert the cursor at the right place if we do the move
                    // otherwise we go in to loop of if silent, won't get notifications
                    // if not silent, everything gets triggered for re-rendering
                    // good job, I already wrote some code to do that
                    // c) likewise, why isn't updateParent in validateControl?
                    // then this becomes just a display thang / forceValidate / showValidate
                    var silence = true;
                    if (value !== this.controlmodel.get(this.controlname)) {
                        this.controlparent.initialValues = false;
                        this.controlmodel.set(this.controlname, value, {silent:silence});
                    }
                //}
            }
            this.updateParent(options);*/
            //!this.getError() && 
            //console.log(this.controlname, "error", this.getError(), value, this.controlmodel.get(this.controlname));
            if (this.controlparent && value !== this.controlmodel.get(this.controlname)) {
                this.controlparent.initialValues = false;
            }

            if (!options.norevalidation) {
                this.updateParent(options);
            }

            return value;
        },
        /**
         * @method flagError
         * @private
         * @inner
         * @param  {boolean} [hasError=false] Whether to show an error.
         * Forced to true if this.controlErrorFlag
         * @description Toggles control-error class on control view element
         * 
         */
        flagError: function (hasError) {
            if (hasError === undefined) {
                hasError = false;
            }
            if (this.controlErrorFlag) {
                hasError = true;
            }
            // Do not toggle if this all resolves to true
            if (!hasError && this.getError() && this.hadError) {
                if (this.getDisplayErrors()) {
                    return;
                }
            }
            this.$el.toggleClass("control-error", hasError);
        },
        /**
         * @method  displayErrors
         * @param  {string} value Control's value
         * @description Looks up and computes error templates
         *
         * Checks in turn for the a i18n phrase for the keys and uses the first non-empty value
         * 
         * 1. {{phrasekey}}.error.{{error}} (as key for phrase lookup)
         * 2. control.error.{{error}} (as key for phrase lookup)
         * 3. {{error}} (as is)
         *
         * eg. if there was an oops error on the bar property of the foo model
         *
         * 1. model.foo.bar.error.oops
         * 2. control.error.oops
         * 3. "oops"
         *
         * The control's name, label and value are passed to Larynx Phrase where they can be used for substitution purposes
         */
        displayErrors: function (value) {
            var displayErrors = this.getDisplayErrors();
            if (displayErrors) {
                for (var err = 0; err < displayErrors.length; err++) {
                    var errorBundle = {
                        _append: "error",
                        _appendix: displayErrors[err],
                        name: this.controlname,
                        label: this.label,
                        value: value
                    };
                    displayErrors[err] = Larynx.Phrase.get(this.phrasekey, errorBundle) || Larynx.Phrase.get("control", errorBundle) || displayErrors[err];
                }
                this.messages.set("error", displayErrors);
            } else {
                this.messages.unset("error");
            }
        },
        /**
         * @method  updateControl
         * @param  {*} value   Control value.
         * If passed as an object, will get the value using this.getValue() and set options to value’s value
         * @param  {object} options Update options
         * @description  Validate the control
         * Display errors (if any)
         * If no error
         * - update model silently
         * - update control model if changed (silently if the option is set)
         */
        updateControl: function (value, options) {
            /*if (!this.controlparent) {
                return;
            }*/
            if (typeof value === "object") {
                options = value;
                value = this.getValue();
            }
            options = options || {};

            // TODO: Here goes proper validation.
            // Either use JSV or have a bunch of validation functions that can return an array of error codes
            // Apart from not supporting the uri-ification of included schemas like JSV does, I like the second way more
            // Also, have a pre-filter here. After all we set the value on the actual object
            // This also allows composite controls to do their stuff

            value = this.validateControl(value, options);

            this.displayErrors(value);

            var hasError = this.getError();
            if (!hasError) {
                // why set this if it's the first time through and nothing's changed?
                this.model.set(this.valueAttribute, value, {silent:true});
                // why did this need force?
                // if so, an invalid state can be set
                // MO currently is, all good, update the model and then just save it
                // the model will always be in a good state since we don't allow trash to be saved
                // therefore must check that none of the contained control views of the page has an error
                // - but if a control is not dirty but invalid we must perform a validation of all controls first
                //if (options.force) {
                    // a) options.silent
                    // b) move to validateControl along with the dirty model
                    // need to be able to reinsert the cursor at the right place if we do the move
                    // otherwise we go in to loop of if silent, won't get notifications
                    // if not silent, everything gets triggered for re-rendering
                    // good job, I already wrote some code to do that
                    // c) likewise, why isn't updateParent in validateControl?
                    // then this becomes just a display thang / forceValidate / showValidate
                    if (value !== this.controlmodel.get(this.controlname)) {
                        //this.controlparent.initialValues = false;
                        var silence = this.controloptions.silent || false;
                        this.controlmodel.set(this.controlname, value, {silent:silence});
                    }
                //}
            }
            // TODO: actualErrors vs displayErrors

            // should be in validateControl
            //this.updateParent(options);

        },
        /**
         * @method  instantValidateControl
         * @private
         * @inner
         * @param  {*} value   Control's value
         * @param  {object} [options] Validation options
         * @description Calls validation on a control immediately and updates parent view
         */
        instantValidateControl: function (value, options) {
            options = _.extend({instantValidate:true}, options);
            this.messages.unset("error");
            this.validateControl(value, options);
            if (!this.getError() && this.hadError) {
                this.messages.unset("error");
            }
            // should be in validateControl - but check on them options
            this.updateParent();
        },
        /**
         * @method  updateParent
         * @private
         * @inner
         * @param  {object} [options] Options
         * @param  {boolean} [options.norevalidation] Whether to prevent revalidation
         * @description If the control has a parent view
         * - disable parent view form if it has an error
         * - revalidate all parent view controls if the control previously had an error
         */
        updateParent: function (options) {
            // move the parent model (and dirtymodel) sets here?
            if (this.controlparent) {
                if (this.getError()) {
                    this.controlparent.disableForm();
                } else if (true || this.hadError) {
                    if (!options || !options.norevalidation) {
                        this.controlparent.validateAllControls();
                    }
                }
            }
        },
        /**
         * @method getValue
         * @description Returns control value irrespective of control type
         * @return {*} The control's current value
         */
        getValue: function () {
            var value;
            var $el = this.$el.find("input, textarea, select");
            if ($el.length) {
                value = $el.val();
                if (this.valueAttribute === "checked") {
                    value = $el.is(":checked");
                }
            } else {
                // is this really any good?
                value = this.model.get(this.valueAttribute);
            }
            return value;
        },
        /**
         * @todo  EVENTS
         */
        events: {
            //"focus input": function (e) {
            //    console.log(e, this.$el.find("input").get(0));
            //},
            "change input, textarea, select": function(e) {
                var value = this.getValue();
                // hang on - this gets called when the input value is updated
                // can we prevent a double dip here?
                this.updateControl(value);
            },
            "keyup input, textarea": function(e) {
                var value = this.getValue();
                if (this.keyup) {
                    this.updateControl(value);
                } else if (this.instantValidation) {
                    this.instantValidateControl(value);
                }
            },
            "keydown input": function(e) {
                var restrictinput = this.restrictinput || this.primitive;
                if (restrictinput === "integer" || restrictinput === "number" || restrictinput === "payment-card") {
                    if (e.altKey) {
                        e.preventDefault();
                        e.stopPropagation();
                        return false;
                    }
                }
            },
            "keypress input[type=text]": function(e) {
                var abort;
                var restrictinput = this.restrictinput || this.primitive;
                // gah, this.keypress
                if (this.keypress) {
                } else if (restrictinput === "integer") {
                    abort = ((e.charCode < 48 || e.charCode > 57) && e.charCode !== 13);
                } else if (restrictinput === "number") {
                    abort = ((e.charCode < 48 || e.charCode > 57) && e.charCode !== 13 && e.charCode !== 46);
                    if (!abort) {
                        var val = this.getValue();
                        abort = (e.charCode === 46 && val.indexOf(".") !== -1);
                    }
                } else if (restrictinput === "payment-card") {
                    abort = ((e.charCode < 48 || e.charCode > 57) && e.charCode !== 13 && e.charCode !== 32 && e.charCode !== 45);
                }
                if (abort) {
                    e.preventDefault();
                    e.stopPropagation();
                    return false;
                }
            },
            "keypress input": function(e) {
                var cp = this.controlparent;
                if (e.charCode === 13 && cp) {
                    cp.validateAllControls({update:true});
                    if (cp.hasNoErrors && !cp.disabled) {
                        cp.saveForm(cp.saveOptions, e);
                    }
                }
            }
        }
    });


    /**
     * @method addMethod
     * @private
     * @inner
     * @param {object} attrs
     * @description Attaches method of right kind to control
     */
    function addMethod (attrs) {
        attrs.kind = attrs.kind || "controltype";
        var kindplural = attrs.kind+"s";
        if (!ControlView.prototype[kindplural]) {
            ControlView.prototype[kindplural] = {};
        }
        var kinds = ControlView.prototype[kindplural];
        var method = attrs.method;
        if (!kinds[method]) {
            kinds[method] = {};
        }
        kinds[method][attrs.name] = attrs.fn;
    }
    /**
     * @method addTypeMethods
     * @private
     * @inner
     * @param {object} attrs
     * @description  Generic handler to allow additonal controls to add kinds methods
     *
     * Checks the existence of the following methods and, if found, adds it to the control
     * - initialize
     * - prepare
     * - normalize
     * - validate
     */
    function addTypeMethods (attrs) {
        var methods = ["prepare", "normalize", "validate", "initialize"];
        for (var i = 0; i < methods.length; i++) {
            var method = methods[i];
            if (attrs[method]) {
                attrs.method = methods[i];
                attrs.fn = attrs[method];
                addMethod(attrs);
            }
        }
    }
    /**
     * @method addControlType
     * @param {object} attrs
     * @static
     * @description  Allows additonal controls to add controltypes
     */
    ControlView.addControlType = function (attrs) {
        attrs.kind = "controltype";
        addTypeMethods(attrs);
    };
    /**
     * @method addPrimitive
     * @param {object} attrs
     * @static
     * @description  Allows additonal controls to add primitives
     */
    ControlView.addPrimitive = function(attrs) {
        attrs.kind = "primitive";
        addTypeMethods(attrs);
    };
    /**
     * @method addFormat
     * @param {object} attrs
     * @static
     * @description  Allows additonal controls to add formats
     */
    ControlView.addFormat = function (attrs) {
        attrs.kind = "format";
        addTypeMethods(attrs);
    };
    /**
     * @method addNormalization
     * @param {object} attrs
     * @static
     * @description  Allows additonal controls to add normalization methods
     */
    ControlView.addNormalization = function (attrs) {
        attrs.method = "normalize";
        addMethod(attrs);
    };
    /**
     * @method addPreparation
     * @param {object} attrs
     * @static
     * @description  Allows additonal controls to add preparation methods
     */
    ControlView.addPreparation = function (attrs) {
        attrs.method = "prepare";
        addMethod(attrs);
    };
    /**
     * @method addValidation
     * @param {object} attrs
     * @static
     * @description  Allows additonal controls to add validation methods
     */
    ControlView.addValidation = function (attrs) {
        attrs.method = "validate";
        addMethod(attrs);
    };

    return ControlView;

});