define(function(require){
/**
* @module default%control
* @description ## Default controls
*
* #### Primitives
*
* - {@link control:number}
* - {@link control:integer}
* - {@link control:boolean}
*
* #### Formats
* 
* - {@link control:email}
* - {@link control:payment-card}
* 
* #### Control types
* 
* - {@link control:checkbox}
* - {@link control:select}
* - {@link control:date}
* - {@link control:payment-date-start}
* - {@link control:payment-date-expiry}
*
* @see template:control%view
* @see module:bauplan%control%view
*
* @requires module:bauplan%control%view
* @requires jQuery
* @requires Lodash
* @requires Moment
* @requires datejs
* @requires Larynx
*/
    var ControlView = require("bauplan.control.view");
    var Larynx = require("larynx");
    var jQuery = require("jquery");
    var Moment = require("moment");
    var _ = require("underscore");
    var Bauplan = require("bauplan");
    require("datejs");
    var DateJS = Date;

    /**
     * @method normalizeNumber
     * @description Ensure a number is a number
     * @param  {*} value Value to be normalised
     * @return {number} Number or undefined
     */
    var normalizeNumber = function(value) {
        if (!value && value !== 0) {
            return undefined;
        }
        var newvalue = 1 * value;
        return isNaN(newvalue) ? value : newvalue;
    };

    /**
     * @member numberInit
     * Provides number validation methods and ensures instant validation
     * @property  {boolean} instantValidation see {@link module:default%control~instantValidation}
     * @property  {function} numberValidation see {@link module:default%control~numberValidation}
     * @return {object} NumberMethods
     */
    var numberInit = {
        /**
         * @member {boolean} instantValidation
         */
        instantValidation: true,
        /**
         * @method numberValidation
         * @description Checks a number to see that it validates against any of the following validation constraints set on the property’s schema:
         * 
         * - multipleOf
         * - maximum
         * - exclusiveMaximum
         * - minimum
         * - exclusiveMinimum
         * - maxLength
         * - minLength
         * - exactLength
         *
         * #### Error codes
         * 
         * - {{primitive}}.not-multiple-of
         * - {{primitive}}.more-than-maximum
         * - {{primitive}}.more-than-exclusive-maximum
         * - {{primitive}}.less-than-minimum
         * - {{primitive}}.less-than-exclusive-minimum
         * - {{primitive}}.maxlength
         * - {{primitive}}.minlength
         *
         * (where primitive is this.primitive)
         */
        numberValidation: function(value, options) {
            options = options || {};
            if (options.display === undefined && !this.model.get(this.valueAttribute)) {
                options.display = false;
            }
            var schema = this.controlschema;
            if (schema.multipleOf) {
                if (value/schema.multipleOf !== parseInt(value/schema.multipleOf, 10)) {
                    this.addError(this.primitive+".not-multiple-of");
                }
            }
            if (schema.maximum) {
                if (schema.exclusiveMaximum) {
                    if (value >= schema.maximum) {
                        this.addError(this.primitive+".more-than-exclusive-maximum");
                    }
                } else if (value < schema.maximum) {
                    this.addError(this.primitive+".more-than-maximum");
                }
            } else if (schema.minimum) {
                if (schema.exclusiveMinimum) {
                    if (value <= schema.minimum) {
                        this.addError(this.primitive+".less-than-exclusive-minimum");
                    }
                } else if (value < schema.minimum) {
                    this.addError(this.primitive+".less-than-minimum");
                }
            }
            var maxLength = schema.maxLength || schema.exactLength;
            if (maxLength) {
                if (("" + value).length > maxLength) {
                    this.addError(this.primitive+".maxlength", options);
                }
            }
            var minLength = schema.minLength || schema.exactLength;
            if (minLength) {
                if (("" + value).length < minLength) {
                    this.addError(this.primitive+".minlength", options);
                }
            }
        }
    };
    /**
    * @control number
    * @controlkind primitive
    * @description Checks that input is a number
    *
    * Output a control with the name "foo" that only accepts numbers
    * 
    *     {{control "foo" control-primitive="number"}}
    *
    * or just
    *
    *     {{control "foo"}}
    *
    * if the type property for the "foo" property in the model schema has been set to "number"
    *
    * #### Error codes
    * 
    * - number.not-a-number
    * - Plus those provided by {@link module:default%control~numberValidation}
    *
    * @see template:control%view
    * @see module:bauplan%control%view
    */
    ControlView.addPrimitive({
        name: "number",
        /**
         * @method initialize
         * @memberof control:number
         * @description {@link module:default%control~numberInit}
         */
        initialize: numberInit,
        /**
         * @method normalize
         * @memberof control:number
         * @description {@link module:default%control~normalizeNumber}
         */
        normalize: normalizeNumber,
        /**
         * @method validate
         * @memberof control:number
         * @param {number} value
         * @description Checks:
         * 
         * - number
         * - {@link module:default%control~numberValidation}
         */
        validate: function(value, options) {
            // if (this.getError()) { return; }
            if (value && typeof value !== "number") {
                this.addError("number.not-a-number");
            }
            this.numberValidation(value, options);
        }
    });
    /**
    * @control integer
    * @controlkind primitive
    * @description Checks that input is an integer
    *
    * Output a control with the name "foo" that only accepts integers
    * 
    *     {{control "foo" control-primitive="integer"}}
    *
    * or just
    *
    *     {{control "foo"}}
    *
    * if the type property for the "foo" property in the model schema has been set to "integer"
    *
    * #### Error codes
    * 
    * - integer.not-a-number
    * - integer.not-an-integer
    *
    * @see template:control%view
    * @see module:bauplan%control%view
    */
    ControlView.addPrimitive({
        name: "integer",
        /**
         * @method initialize
         * @memberof control:integer
         * @description {@link module:default%control~numberInit}
         */
        initialize: numberInit,
        /**
         * @method normalize
         * @memberof control:integer
         * @description {@link module:default%control~normalizeNumber}
         */
        normalize: normalizeNumber,
        /**
         * @method validate
         * @memberof control:integer
         * @param {number} value
         * @param {object} [options]
         * @description Checks:
         * 
         * - number
         * - integer
         * - {@link module:default%control~numberValidation}
         */
        validate: function(value, options) {
            if (typeof value !== "number") {
                this.addError("integer.not-a-number");
            } else if (parseInt(value, 10) !== value) {
                this.addError("integer.not-an-integer");
            }
            this.numberValidation(value, options);
        }
    });
    /**
    * @control boolean
    * @controlkind primitive
    * @description Checks that input is boolean via checkbox
    *
    * Output a control with the name "foo" that ensures the value returned is boolean
    * 
    *     {{control "foo" control-primitive="boolean"}}
    *
    * or just
    *
    *     {{control "foo"}}
    *
    * if the type property for the "foo" property in the model schema has been set to "boolean"
    *
    * Additionally makes the control type checkbox
    *
    * @see template:control%view
    * @see module:bauplan%control%view
    */
    ControlView.addPrimitive({
        name: "boolean",
        /**
         * @method initialize
         * @memberof control:boolean
         * @description Sets controltype to checkbox
         */
        initialize: {
            controltype: "checkbox"
        },
        //normalize: normalizeNumber,
        //validate: function(value) {
        //}
    });


    /**
    * @control email
    * @controlkind format
    * @description Checks that input is a validly formatted email address
    *
    * Output a control with the name "foo" that only accepts input matching an email address
    * 
    *     {{control "foo" control-format="email"}}
    *
    * or just
    *
    *     {{control "foo"}}
    *
    * if the format property for the "foo" property in the model schema has been set to "email"
    *
    * #### Error codes
    * 
    * - email.no-at-symbol
    * - email.invalid
    * 
    * @see template:control%view
    * @see module:bauplan%control%view
    */
    var emailpattern = /^(([A-Z0-9_\.\-])+\+){0,1}([A-Z0-9_\.\-])+\@(([A-Z0-9\-])+\.)+[A-Z0-9]{2,6}$/i;
    ControlView.addFormat({
        name: "email",
        /**
         * @method initialize
         * @memberof control:email
         * @description Sets instantValidation to true
         */
        initialize: {
            instantValidation: true
        },
        /**
         * @method validate
         * @memberof control:email
         * @param {number} value
         * @param {object} [options]
         * @description Checks:
         * 
         * - contains @
         * - matches email regex
         */
        validate: function(value, options) {
            var erroropts = {};
            if (options.instantValidate && !this.model.get("value")) {
                erroropts.display = false;
            }
            if (value.indexOf("@") === -1) {
                this.addError("email.no-at-symbol", erroropts);
            } else if (!emailpattern.test(value)) {
                this.addError("email.invalid", erroropts);
            }
        }
    });


    /**
    * @control checkbox
    * @controlkind controltype
    * @description Outputs a checkbox control
    *
    * Output a checkbox control with the name "foo"
    * 
    *     {{control "foo" control-type="checkbox"}}
    *
    * or just
    *
    *     {{control "foo"}}
    *
    * if the controltype property for the "foo" property in the model schema has been set to "checkbox"
    *
    * Succesful control sends value
    *
    * @todo  explain how value gets defined
    *
    * @see template:control%view
    * @see module:bauplan%control%view
    */
    ControlView.addControlType({
        name: "checkbox",
        /**
         * @method initialize
         * @memberof control:checkbox
         * @description Sets valueAttribute to checked
         */
        initialize: {
            valueAttribute: "checked"
        },
        /**
         * @method prepare
         * @memberof control:checkbox
         * @description Uses valueAttribute to ensure correct value is set
         */
        prepare: function(control, phrasekey, options) {
            var value = (this.primitive === "boolean" ? true : Larynx.Phrase.getString(phrasekey, {_append: "value"})) || true;
            control.checked = control.value === value;
            control.value = value;
            if (!this.edit) {
                var dvalue = "" + (!!control.checked);
                var appends = {
                    _append: "value",
                    _appendix: dvalue
                };
                control.value = Larynx.Phrase.getString(phrasekey, appends) || Larynx.Phrase.getString("control.checkbox", appends) || dvalue;
            }
            return control;
        },
        /**
         * @method normalize
         * @memberof control:checkbox
         * @description Massages values of non-boolean controls
         */
        normalize: function(value) {
             if (this.primitive !== "boolean") {
                value = value ? this.model.get("value") : "";
            }
            return value;
        }
    });


    // jsonschema-types.txt for missing primitives, formats and generics
    // radio and checkbox groups, single checkbox

    /**
    * @control password-new
    * @controlkind controltype
    * @description Ensures conditions for submitting a new password have been met
    *
    * Output a new password control with the name "foo"
    * 
    *     {{control "foo" control-type="password-new"}}
    *
    * or just
    *
    *     {{control "foo"}}
    *
    * if the controltype property for the "foo" property in the model schema has been set to "password-new"
    *
    * #### Error codes
    * 
    * - password.old-password-required
    * - password.no-confirmation
    * - password.passwords-do-not-match
    *
    * @see template:control%view
    * @see module:bauplan%control%view
    */
    ControlView.addControlType({
        name: "password-new",
        /**
         * @method validate
         * @memberof control:password-new
         * @param {string} value
         * @description Checks
         *
         * - old password has been provided (if not creating a brand new password)
         * - new password has been entered
         * - new password has been confirmed and matched
         */
        validate: function(value, options) {
            if (!this.controlparent) {
                return;
            }
            options = options || {};
            if (options.norevalidation) {
                return;
            }
            //console.log("parent view", this.controlparent);
            /*if (this.controlparent) {
                if (this.controlname === "password-new") {
                    var confirm = 
                }

                console.log("parent view kids", this.controlparent.children);
            }*/

            if (this.controlname === "password-old") {
                // if !value and password-new (or rather password) has a value
                if (!value) {
                    this.addError("password.old-password-required");
                }
                return;
            }

            // could pass 
            if (this.controlname === "password-new") {
                var confirmview = jQuery("[name=password-confirm]").view();
                confirmview.instantValidateControl(jQuery("[name=password-confirm]").val(), {prompted: true});
                // could spot this - but not doing so at the moment
                return;
            }

            var confirm = jQuery.trim(value); // nortygnorty
            var password = jQuery.trim(jQuery("[name=password-new]").val());

            if (password && !confirm) {
                var display = true; // won't display in any case, because only validating and not unpdating
                this.addError("password.no-confirmation", {display:display});
            } else if (confirm) {
                if (password !== confirm) {
                    this.addError("password.passwords-do-not-match");
                } else if (password) {
                    //console.log("We actually have a password and should be setting it");
                }
            }
        }
    });


    /**
    * @control select
    * @controlkind controltype
    * @description Select control
    *
    * Output a select control with the name "foo"
    * 
    *     {{control "foo" control-type="select"}}
    *
    * or just
    *
    *     {{control "foo"}}
    *
    * if the controltype property for the "foo" property in the model schema has been set to "select"
    *
    * @todo  Provide brief overview of options/values/selected
    * @see template:control%view
    * @see module:bauplan%control%view
    */
    ControlView.addControlType({
        name: "select",
        /**
         * @method prepare
         * @memberof control:checkbox
         * @description Marshalls options and values
         * 
         * Checks for any values which may exist in the resource bundle properties files.
         * 
         * If so, the result is passed to Larynx.Phrase using the property’s phrase key appended with ".values"
         * 
         * Any resulting string (if any) is then split using commas as the delimiter.
         */
        prepare: function(control, phrasekey, options) {
            var valueStr = Larynx.Phrase.getString(phrasekey, {_append: "values"});

            control.options = options.options || [];
            control.values = options.values || [];
            if (valueStr) {
                var fvalues = valueStr.replace(/,\s+/g, ",").split(",");
                _.each(fvalues, function(a){
                    control.values.push(a);
                    var optionStr = Larynx.Phrase.getString(phrasekey, {_append: "option", _appendix:a});
                    control.options.push(optionStr);
                });
            }

            control.cue = Larynx.Phrase.getString(phrasekey, {_append: "cue"});

            return control;
        },
        /**
         * @method normalize
         * @memberof control:checkbox
         * @description Removes initial select cue option if present when an option with an actual value is selected
         */
        normalize: function(value) {
            // not really normalization - this should really be handled on the event
            if (value !== "" && value !== null && value !== undefined) {
                var $view = this.$el;
                $view.find(".select-cue").remove();
            }
            return value;
        }
    });

    /**
     * @method monthYearValue
     * @memberof control:payment-date-expiry
     * @inner
     * @param  {string} value       Value to be formatted
     * @param  {string} [phrasekey] Key to use for phrase lookup
     * @todo  phrasekey param looks wrong and pointless
     * @return {string}             Formatted month/year
     */
    var monthYearValue = function(value, phrasekey) {
        var format = "MMM YYYY";
        return moment(value).format(format);
    };
    /**
     * @method monthYearPrepare
     * @memberof control:payment-date-expiry
     * @inner
     * @param  {control} control
     * @param  {object} options
     * @return {control} Updated control
     */
    var monthYearPrepare = function(control, options) {
        var expiryValues = {};
        var dateValue;
        if (control.value) {
            dateValue = Moment(control.value);
        }
        if (options.edit) {
            if (dateValue) {
                expiryValues.month = dateValue.month();
                expiryValues.year = dateValue.year();
            }
        } else {
            control.value = dateValue ? dateValue.format("MMM YYYY") : "";
            return control;
        }
        // good to get this from options.options too?
        var currentDate;
        if (options.date) {
            currentDate = moment(options.date, options.dateformat);
        }
        if (!currentDate || !currentDate.isValid()) {
            currentDate = moment();
        }

        var currentMonth = currentDate.month() + 1;
        var currentYear = currentDate.year();
        var months = [];
        var monthcount = moment("Dec", "MMM");
        options.cc = true;
        for (var mon = 0; mon < 12; mon++) {
            var mval = mon + 1;
            var mvaldisplay = monthcount.add("M", 1).format("MMM");
            if (options.cc) {
                mvaldisplay = (mval < 10 ? "0" : "") + mval;
            }
            months.push({
                content: mvaldisplay,
                value: mval
            });
        }
        var datakey = "data-" + control.name;
        var month = {
            name: control.name + "-month",
            value: expiryValues.month + 1,
            options: months,
            "data-current-month": currentMonth
        };
        month[datakey] = "month";

        if (options.yearoffset) {
            currentYear -= options.yearoffset;
        }
        var years = [];
        var yearsBefore = options.yearsbefore || 0;
        var yearsAfter = options.years || 5;
        if (yearsAfter < 0) {
            yearsBefore = yearsAfter * -1;
        }
        if (yearsBefore) {
            yearsBefore *= -1;
            yearsAfter = options.yearsafter || 0;
            if (!yearsAfter) {
                options.exclude = "future";
            }
            yearsBefore += 1;
            yearsAfter += 1;
        } else {
            options.exclude = "past";
        }

        for (var i = yearsBefore; i < yearsAfter; i++) {
            var yeardata = currentYear + i;
            if (options.cc) {
                yeardata = {
                    value: yeardata,
                    content: yeardata.toString().substr(2)
                };
            }
            years.push(yeardata);
        }

        if (options.reverse) {
            years = years.reverse();
        }
        var year = {
            name: control.name + "-year",
            value: expiryValues.year,
            options: years,
            "data-current-year": currentYear
        };
        year[datakey] = "year";
        if (options.exclude) {
            year["data-exclude"] = options.exclude;
        }
        control.month = month;
        control.year = year;
        return control;
    };
    /**
     * @method monthYearNormalize
     * @memberof control:payment-date-expiry
     * @inner
     * @param  {string} value
     * @return {string} Normalised date
     */
    var monthYearNormalize = function(value) {
        var $view = this.$el;
        if (!$view) {
            return value;
        }
        var $monthControl = $view.find("[data-" + this.controlname + "=month]");
        var $yearControl = $view.find("[data-" + this.controlname + "=year]");
        var month = $monthControl.val();
        var year = $yearControl.val();
        /*var checks = {
            future: function(stored, value) {
                return stored < value;
            },
            past: function(stored, value) {
                return stored > value;
            }
        };
        function checkMonth(stored, value, exclude) {
            return checks[exclude](stored, value * 1);
        }
        var exclude = $yearControl.attr("data-exclude");
        if (exclude) {
            if (year === $yearControl.attr("data-current-year")) {
                var currentMonth = $monthControl.attr("data-current-month") * 1;
                $monthControl.find("option").each(function(){
                    if (checkMonth(currentMonth, this.value, exclude)) {
                        jQuery(this).attr("disabled", "disabled");
                    }
                });
                if (checkMonth(currentMonth, month, exclude)) {
                    month = currentMonth;
                    $monthControl.val(currentMonth);
                }
            } else {
                $monthControl.find("[disabled]").removeAttr("disabled");
            }
        }*/

        if (!month || !year) {
            return value;
        }
        value = Moment(month + " " + year, "M YYYY").format();
        return value;
    };
    /**
     * @method monthYearValidate
     * @memberof control:payment-date-expiry
     * @inner
     * @param  {string} value
     * @param  {object} [options]
     * @description
     *
     * #### Error codes
     * 
     * - month-year.invalid-{{exclude}}
     *
     * @return {boolean} Validation status
     */
    var monthYearValidate = function(value, options) {
        //if (options.display === undefined && !this.dirtymodel.get(this.valueAttribute)) {
        if (options.rendered) {
            options.display = false;
        }
        //var display = {};
        //if (!options.rendered && this.model.get(this.valueAttribute) === this.dirtymodel.get(this.valueAttribute)) {
        /*if (!options.rendered && this.model.get(this.valueAttribute)
        //if (options.initialValues) {
            display.display = false;
        }*/
        var $view = this.$el;
        var $monthControl = $view.find("[data-" + this.controlname + "=month]");
        var $yearControl = $view.find("[data-" + this.controlname + "=year]");
        var month = $monthControl.val();
        var year = $yearControl.val();
        var checks = {
            future: function(stored, value) {
                return stored < value;
            },
            past: function(stored, value) {
                return stored > value;
            }
        };
        function checkMonth(stored, value, exclude) {
            return checks[exclude](stored, value * 1);
        }
        var exclude = $yearControl.attr("data-exclude");
        if (exclude) {
            if (year === $yearControl.attr("data-current-year")) {
                var currentMonth = $monthControl.attr("data-current-month") * 1;
                if (checkMonth(currentMonth, month, exclude)) {
                    this.addError("month-year.invalid-"+exclude, options);
                }
            }
        }
    };

    /**
    * @control payment-date-expiry
    * @controlkind controltype
    * @description Using this format denotes a property as an expiry date and causes its control to allow the input of a month and year
    * 
    * Ensures expiry date is in the future
    *
    * Output a expiry date control with the name "foo"
    * 
    *     {{control "foo" control-type="payment-date-expiry"}}
    *
    * or just
    *
    *     {{control "foo"}}
    *
    * if the controltype property for the "foo" property in the model schema has been set to "payment-date-expiry"
    *
    * #### Error codes
    * 
    * - provided by {@link module:default%control~monthYearValidate}
    *
    * @see control:payment-date-start
    * @see control:payment-card
    * @see template:control%view
    * @see module:bauplan%control%view
    */
    ControlView.addControlType({
        name: "payment-date-expiry",
        /**
         * @method display
         * @memberof control:payment-date-expiry
         * @description {@link control:payment-date-expiry~monthYearValue}
         */
        display: monthYearValue,
        /**
         * @method prepare
         * @memberof control:payment-date-expiry
         * @description Passes options to {@link control:payment-date-expiry~monthYearPrepare}
         */
        prepare: function(control, phrasekey, options) {
            var monthYearOptions = {
                edit: this.edit,
                phrasekey: phrasekey,
                options: options,
                years: 20
            };
            return monthYearPrepare(control, monthYearOptions);
        },
        /**
         * @method normalize
         * @memberof control:payment-date-expiry
         * @description {@link control:payment-date-expiry~monthYearNormalize}
         */
        normalize: function() {
            return monthYearNormalize.apply(this, arguments);
        },
        /**
         * @method validate
         * @memberof control:payment-date-expiry
         * @description {@link control:payment-date-expiry~monthYearValidate}
         */
        validate: monthYearValidate
    });



    /**
    * @control payment-date-start
    * @controlkind controltype
    * @description Using this format denotes a property as a start date and causes its control to allow the input of a month and year
    * 
    * Ensures start date is in the past
    *
    * Output a start date control with the name "foo"
    * 
    *     {{control "foo" control-type="payment-date-start"}}
    *
    * or just
    *
    *     {{control "foo"}}
    *
    * if the controltype property for the "foo" property in the model schema has been set to "payment-date-start"
    *
    * #### Error codes
    * 
    * - provided by {@link module:default%control~monthYearValidate}
    *
    * NB. shares methods with {@link control:payment-date-expiry} against which the methods are documented
    *
    * @see control:payment-date-expiry
    * @see control:payment-card
    * @see template:control%view
    * @see module:bauplan%control%view
    */
    ControlView.addControlType({
        name: "payment-date-start",
        /**
         * @method display
         * @memberof control:payment-date-start
         * @description {@link control:payment-date-expiry~monthYearValue}
         */
        display: monthYearValue,
        /**
         * @method prepare
         * @memberof control:payment-date-start
         * @description Passes options to {@link control:payment-date-expiry~monthYearPrepare}
         */
        prepare: function(control, phrasekey, options) {
            var monthYearOptions = {
                edit: this.edit,
                phrasekey: phrasekey,
                options: options,
                //date: "1920 31 03",
                //dateformat: "YYYY DD MM",
                years: -10,
                //yearsbefore: 10,
                //yearsafter: 10,
                reverse: true
            };
            return monthYearPrepare(control, monthYearOptions);
        },
        /**
         * @method normalize
         * @memberof control:payment-date-start
         * @description {@link control:payment-date-expiry~monthYearNormalize}
         */
        normalize: function() {
            return monthYearNormalize.apply(this, arguments);
        },
        /**
         * @method validate
         * @memberof control:payment-date-start
         * @description {@link control:payment-date-expiry~monthYearValidate}
         */
        validate: monthYearValidate
    });



    /**
     * @method adjustMonth
     * @memberof control:date
     * @inner
     * @param  {number} m Month
     * @description  Prepends month with 0 if less than 10
     * @return {string}
     */
    function adjustMonth(m) {
        m = m * 1;
        if (m <  10) {
            m = "0" + m;
        }
        return m;
    }
    /**
     * @method adjustYear
     * @memberof control:date
     * @inner
     * @param  {number} m Year
     * @description Sets years entered as less
     *
     * eg.
     *
     *     adjustYear(15) -> 2015
     *     adjustYear(1986) -> 1986
     *  
     * @return {number}
     */
    function adjustYear(m) {
        m = m * 1;
        if (m <  100) {
            m = 2000 + m;
        }
        return m;
    }
    /**
     * @method dateValidateHelper
     * @memberof control:date
     * @inner
     * @param  {control} control Control object
     * @param  {string} type    Whether date is before or after
     * @param  {string} value   Date value to validate
     *
     * #### Error codes
     * 
     * - date.{{type}}
     * - {{control.options[type]}}.error
     * 
     * @return {boolean}
     */
    function dateValidateHelper (control, type, value) {
        var controloptions = control.controloptions;
        if (controloptions[type]) {
            var when = controloptions[type];
            if (typeof when === "string") {
                var d = new moment(when);
                if (!d.isValid()) {
                    var match = when.match(/(\d+)(\w+)/);
                    var matchmethod = type === "after" ? "add" : "subtract";
                    var mwhen = moment()[matchmethod](match[1], match[2]);
                    when = mwhen._d.toISOString();
                    //controloptions[type] = when;
                }
            }
            if (type === "after") {
                var x = when;
                when = value;
                value = x;
            }
            if (value > when) {
                var error = controloptions[type+".error"] || "date."+type;
                control.addError(error);
            }
        }
    }

    /**
    * @control date
    * @controlkind controltype
    * @todo  Provide better explanation for normalize
    * @todo  Provide som example expected input -> output
    * @description Allows freeform input of dates
    *
    * Output a date control with the name "foo"
    * 
    *     {{control "foo" control-type="date"}}
    *
    * or just
    *
    *     {{control "foo"}}
    *
    * if the controltype property for the "foo" property in the model schema has been set to "date"
    *
    * #### Error codes
    *
    * - date.invalid
    * - plus those provided by {@link control:date~dateValidateHelper}
    *
    * @see template:control%view
    * @see module:bauplan%control%view
    */
    ControlView.addControlType({
        name: "date",
        /**
         * @method initialize
         * @memberof control:date
         * @description Sets instantValidation to false
         */
        initialize: {
            instantValidation: false
        },
        /**
         * @method prepare
         * @memberof control:date
         * @param {control} control Control object
         * @param {string} phrasekey Phrase key to provide format
         * @param {object} options
         * @description Sets correct format for date type
         * 
         * - is it just month/year?
         */
        prepare: function(control, phrasekey, options) {
            if (this.controloptions.datetype === "month-year") {
                this.monthyear = true;
                this.controloptions.format = "MMM YYYY";
                //delete options.datetype;
            }
            if (!this.controloptions.format) {
                this.controloptions.format = "D MMM YYYY";
            }
            //control.value = (new Date()).toISOString();
            return control;
        },
        /**
         * @method normalize
         * @memberof control:date
         * @param {string} value Date string to be normalized
         * @description Somewhat hardcore regexxing that requires much better explanation
         */
        normalize: function (value) {
            if (value) {
                value = value.trim();
            }
            if (value) {
                //|| this.controloptions.monthyear
                if (this.monthyear) {
                    value = value.replace(/^(\d{2})(\d{2}|\d{4})$/, function(m, m1, m2) {
                        if (m1 * 1 > 12) {
                            if (m2.length === 2) {
                                return m2  + "/" + m1 + "/01";
                            }
                            return m2.substr(2,2) + "/" + m1 + m2.substr(0,2) + "/01";
                        }
                        return m1 + "/01/" + m2;
                    });

                    value = value.replace(/^(\d+)\s*(?:\s|\.|\/)\s*(\d+)$/, function (m, m1, m2) {
                        if (m1 * 1 > 12) {
                            return adjustMonth(m2) + "/01/" + adjustYear(m1);
                        }
                        return adjustMonth(m1) + "/01/" + adjustYear(m2);
                    });
                    value = value.replace(/^(\d{1,2})\s*(?:\s|\.|\/)\s*(\w+)$/, function (m, m1, m2) {
                        return "01 " + m2 + " " + adjustYear(m1);
                    });
                    value = value.replace(/^(\w+)\s*(?:\s|\.|\/)\s*(\d{1,2})$/, function (m, m1, m2) {
                        return "01 " + m1 + " " + adjustYear(m2);
                    });
                } else {

                    value = value.replace(/^(\d{2})(\d{2})$/, function(m, m1, m2) {
                        return m1 + "/" + m2;
                    });
                    value = value.replace(/^(\d{2})(\d{2})(\d{2}|\d{4})$/, function(m, m1, m2, m3) {
                        return m1 + "/" + m2 + "/" + m3;
                    });

                    value = value.replace(/^(\d+)\s*(?:\s|\.|\/)\s*(\d+)$/, function (m, m1, m2) {
                        if (m1 * 1 > 31 || m2 * 1 > 12) {
                            return m;
                        }
                        return m2 + "/" + m1;
                    });
                    value = value.replace(/^(\d+)\s*(?:\s|\.|\/)\s*(\d+)\s*(?:\s|\.|\/)\s*(\d+)$/, function (m, m1, m2, m3) {
                        if (m1 * 1 > 31 || m2 * 1 > 12) {
                            return m;
                        }
                        return m2 + "/" + m1 + "/" + m3;
                    });
                }

                var m;
                if (value.match(/.*T(\d{2}:)*\d{2}\.\d+Z{0,1}$/)) {
                    m = Moment(value);
                }
                if (!m) {
                    var pvalue = DateJS.parse(value);
                    if (pvalue) {
                        m = Moment(pvalue);
                    }
                }
                if (m && m.isValid()) {
                    value = m.toISOString();
                    var displayval = m.format(this.controloptions.format);
                    var that = this;
                    setTimeout(function(){
                        that.$el.find("input").val(displayval);
                    }, 0);
                }
            }
            return value;
        },
        zformat: function (value) {
            if (value) {
                value = Moment(value).format("DD MMM YYYY");
            }
            //console.log("formatting date");
            //value = "12 Jan 1997";
            return value;
        },
        /**
         * @method validate
         * @memberof control:date
         * @param  {string} value   Date to be validated
         * @param  {object} options Validation options
         * @description Checks
         *
         * - invalid date string
         * - {@link control:date~dateValidateHelper}
         */
        validate: function(value, options) {
            if (!Moment(value).isValid()) {
                this.addError("date.invalid");
            }
            dateValidateHelper(this, "before", value);
            dateValidateHelper(this, "after", value);
        }
    });

/*
Test numbers
http://www.worldpay.com/support/kb/bg/testandgolive/tgl5103.html
http://support.virtuemart-solutions.com/index.php?_m=knowledgebase&_a=viewarticle&kbarticleid=88
http://www.ballyhoo.ltd.uk/Sage-Pay-Test-Credit-Card-Number.html
http://blog.rac.me.uk/2009/02/12/techy-test-credit-and-debit-card-numbers/
http://www.freeformatter.com/credit-card-number-generator-validator.html
http://www.getcreditcardnumbers.com/
http://en.wikipedia.org/wiki/Bank_card_number
http://en.wikipedia.org/wiki/List_of_Bank_Identification_Numbers
https://www.bindb.com/
credit v debit
view-source:https://web.archive.org/web/20130118122930/http://eflo.net/mod10.htm
*/

    /**
     * @member cardtypes
     * @memberof control:payment-card
     * @inner
     * @description Card types object
     *
     * Types defined
     *
     * - amex
     * - dinersclubcarteblanche
     * - dinersclubinternational
     * - jcb
     * - laser
     * - visaprepaid
     * - visaelectron
     * - visadebit
     * - visa
     * - mastercard
     * - maestro
     * - discover
     *
     * @property {regex} pattern a regex matching the card type
     * @property {number|array} length acceptable lengths of number for card type
     * @property {number} [ccv=3] How many digits the security code (CCV|CVV|SC) should be
     * 
     */
    var cardtypes = {
        amex: {
            pattern: /^3[47]/,
            length: 15,
            ccv: 4
        },
        dinersclubcarteblanche: {
            pattern: /^30[0-5]/,
            length: 14
        },
        dinersclubinternational: {
            pattern: /^36/,
            length: 14
        },
        jcb: {
            pattern: /^35(2[89]|[3-8][0-9])/,
            length: 16
        },
        laser: {
            pattern: /^(6304|670[69]|6771)/,
            length: [16, 17, 18, 19],
            type: "debit"
        },
        visaprepaid: {
            pattern: /^(405851|405856|410489|418122|420792|475743|476072|497766)/,
            length: 16,
            type: "debit"
        },
        visaelectron: {
            pattern: /^(4026|417500|4405|4508|4844|491(3|7)|491880)/,
            length: 16,
            type: "debit"
        },
        visadebit: {
            pattern:/^4(01106|01180|013|01795|02802|029|035|03675|03677|03897|04137|04645|05625|05670|05919|060|06632|07441|09908|10773|11636|117|124|1298[45]|14051|14588|15231|15461|15981|16724|18238|18370|19672|20719|20767|20792|20841|20984|213|21473|21494|216|2176[456]|22127|238|23953|23966|251|2543[56]|256|25914|26579|27342|27557|28208|28332|28418|28454|29475|29531|29805,429812|30552|30605|30763|312|3193[012]|31935|31940|31947|3262[456789]|32630|32732|32901|32937|329386|329387|32995|33991|34256|34257|34258|35225|356|35760|36618|36742|37737|382|41104|42729|42730|42742|42790|430|435|43420|43438|43469|451|45785|46053|46106|46157|46261|46268|46272|46274|46277|46278|46279|46291|470|47452|479|48027|48156|48360|490|492|49533|506|507|50875|51368|536|53978|53979|54202|543|54434|54742|549|551|55451|557|560|56351|56403|56406|56413|56414|56432|56445|56475|56726|56735|56738|568|569|58109|58440|585|60005|62239|62263|62288|64944|65345|65858|65859|65861|65901|65904|65921|65942|65943|65944|65946|68805|69568|70132|70758|72409|73099|73354|736|744|74480|75034|75055|75110|75114|75116|75117|75118|75126|75127|75128|75129|75130|75131|75132|75423|75637|75714|75747|760|76[1234]|76225|76559|77462|77548|77596|779|78200|78880|79056|79213|79293|79348|797|79884|800|80119|80686|815|828|82840|83512|83531|83564|83741|841|84823|85342|854|85751|86290|88839|892|90077|90292|903|905|909|911|91859|921|92181|92182|92183|92184|925|929|93414|936|94120|95055|97766|98022|98864|98857|99811)/,
            length: [16,19],
            type: "debit"
        },
        visa: {
            pattern: /^4\d{3}/,
            length: [13,16]
        },
        // can also have 13 digits
        // add \d{3} to prevent early match against visaelectron
        // or add min chars to match against
        // visa debit?
        mastercard: {
            pattern: /^5[1-5]/,
            length: 16
        },
        maestro: {
            pattern: /^(5018|5020|5038|5612|5893|6304|6759|676[1-3]|0604|6390)/,
            length: [12, 13, 14, 15, 16, 17, 18, 19],
            type: "debit"
            //additionalfields: ["startdate", "issuenumber"]
        },
        discover: {
            pattern: /^(6011|622(12[6-9]|1[3-9][0-9]|[2-8][0-9]{2}|9[0-1][0-9]|92[0-5]|64[4-9])|65)/,
            length: 16
        }
    };
    var ccvDefault = 3;

    /**
     * @member acceptable
     * @memberof control:payment-card
     * @inner
     * @description List of acceptable card types
     *
     * By default
     *
     * - visa
     * - mastercard
     *
     * To override, see {@link control:payment-card}
     */
    var acceptable = ["visa", "mastercard"];
    try {
        acceptable = Bauplan.Config.config.clientdefaults.cardtypes;
    } catch (e) {}


    /**
     * @member additionalfields
     * @memberof control:payment-card
     * @inner
     * @description List of card types which require additional fields (start date, issue number)
     *
     * - maestro
     */
    var additionalfields = ["maestro"];

    for (var ct in cardtypes) {
        if (!cardtypes.type) {
            cardtypes.type = [];
        }
        cardtypes.type.push(ct);
        if (!cardtypes.acceptable) {
            cardtypes.acceptable = [];
        }
        cardtypes.acceptable[ct] = true;
    }
    if (acceptable && acceptable.length) {
        cardtypes.acceptable = {};
        for (var ca = 0, accLength = acceptable.length; ca < accLength; ca++) {
            cardtypes.acceptable[acceptable[ca]] = true;
        }
    }

    /**
     * @method getCardType
     * @memberof control:payment-card
     * @inner
     * @param  {number} input Card long number
     * @return {string} Card type
     */
    var getCardType = function(input) {
        var matched;
        var shortest = 0;
        for (var i = 0, ctLength = cardtypes.type.length; i < ctLength; i++) {
            var cardtype = cardtypes.type[i];
            var matchee = input.match(cardtypes[cardtype].pattern);
            if (matchee && (matchee[0].length > shortest)) {
                shortest = matchee[0].length;
                matched = cardtype;
            }
        }
        return matched;
    };

    /**
     * @method getValidCardType
     * @memberof control:payment-card
     * @inner
     * @param  {number} input Card long number
     * @return {boolean} Whether rard type is acceptable
     */
    var getValidCardType = function(input) {
        var cardtype = getCardType(input);
        return cardtypes.acceptable[cardtype] || false;
    };

    /**
     * @method getValidLength
     * @memberof control:payment-card
     * @inner
     * @param  {number} input Card long number
     * @param  {string} cardtype Card type
     * @return {boolean} Whether input is of correct length
     */
    var getValidLength = function(input, cardtype) {
        var validLength = false;
        if (!cardtype) {
            cardtype = getCardType(input);
        }
        if (!cardtype) {
            return validLength;
        }
        var validLengths = cardtypes[cardtype].length;
        var length = input.length * 1;
        if (typeof validLengths === "number") {
            validLength = length === validLengths;
        } else {
            for (var i = 0; i < validLengths.length; i++) {
                if (length === validLengths[i]) {
                    validLength = true;
                    break;
                }
            }
        }
        return validLength;
    };

    /**
     * @method getValidLuhn
     * @memberof control:payment-card
     * @inner
     * @param  {number} input Card long number
     * @return {boolean} Whether input passes Luhn check
     */
    var getValidLuhn = function(input) {
        var digits = input.split("").reverse();
        var sum = 0;
        //for (var n = 0, _j = 0, dLength = digits.length; _j < dLength; n = ++_j) {
        for (var n = 0, dLength = digits.length; n < dLength; n++) {
            var digit = digits[n];
            digit = +digit;
            if (n % 2) {
                digit *= 2;
                if (digit < 10) {
                    sum += digit;
                } else {
                    sum += digit - 9;
                }
            } else {
                sum += digit;
            }
        }
        return sum % 10 === 0;
    };
    (function($){
        function zapClass($el, regex) {
            $el.removeClass(function(index, css) {
                return (css.match(regex) || []).join(" ");
            });
        }
        $.fn.removePrefixedClass = function(prefix) {
            var prefixregex = new RegExp("\\b" + prefix + "\\S+", "g");
            zapClass(this, prefixregex);
            return this;
        };
        $.fn.removeSuffixedClass = function(suffix) {
            var suffixregex = new RegExp("\\S+" + suffix + "\\b", "g");
            zapClass(this, suffixregex);
            return this;
        };
    })(jQuery);


    /**
    * @control payment-card
    * @controlkind format
    * @description Card number input control
    *
    * If set as format for a property, treats the property as a card’s long number (PAN).
    *
    * Output a date control with the name "foo"
    * 
    *     {{control "foo" control-format="payment-card"}}
    *
    * or just
    *
    *     {{control "foo"}}
    *
    * if the format property for the "foo" property in the model schema has been set to "payment-card"
    *
    * Allows input to contain both spaces and dashes.
    *
    * Validates number entered against acceptable card types, displaying relevant errors.
    *
    * Adds a class representing cardtype matched.
    * 
    * Ensures that a valid CCV (CVV/SCV) is set dependent on the card type.
    * 
    * Currently, the format expects the CCV property to be named *ccv*.
    *
    * To change the acceptable card types, send as part of BauplanData:
    * 
    *     var BauplanData = {
    *         …
    *         clientdefaults: {
    *             cardtypes: [
    *                 "visa",
    *                 "mastercard",
    *                 "amex"
    *             ]
    *         }
    *
    * #### Error codes
    * 
    * - payment-card.undefined-card-type
    * - payment-card.invalid-card-type
    * - payment-card.invalid-length
    * - payment-card.invalid-luhn
    * 
    * @see control:payment-date-expiry
    * @see control:payment-date-start
    * @see template:control%view
    * @see module:bauplan%control%view
    */
    ControlView.addFormat({
        name: "payment-card",
        initialize: {
            instantValidation: true,
            restrictinput: "payment-card",
            showAdditionalFields: function(on) {
                this.controlparent.$el.toggleClass("show-additional", on);
                if (!on) {
                    this.model.unset("issuenumber");
                    this.controlmodel.unset("issuenumber");
                    this.model.unset("startdate");
                    this.controlmodel.unset("startdate");
                }
            },
            showCCV: function(cardType) {
                if (this.controlparent) {
                    var $el = this.controlparent.$el;
                    var ccvLength = cardType ? cardtypes[cardType].ccv : ccvDefault;
                    var $ccvEl = $el.find("[name=ccv]");
                    $ccvEl.view().controlschema.exactLength = ccvLength;
                    if ($ccvEl.attr("maxlength") !== ccvLength) {
                        $ccvEl.attr("maxlength", ccvLength);
                        var ccvPH = "";
                        for (var i = 0; i < ccvLength; i++) {
                            ccvPH += "•";
                        }
                        $ccvEl.attr("placeholder", ccvPH);
                    }
                }
            },
            showCardType: function(cardType) {
                var $el = this.$el;
                var cardprefix = "card-type-";
                if (cardType) {
                    var cardTypeClass = cardprefix + cardType;
                    if (!$el.hasClass(cardTypeClass)) {
                        $el.removePrefixedClass(cardprefix);
                        $el.addClass(cardTypeClass);
                    }
                } else {
                    $el.removePrefixedClass(cardprefix);
                }
                this.showCCV(cardType);
            },
            hideCardType: function() {
                this.showCardType();
            }
        },
        normalize: function(value) {
            if (value) {
                value = "" + value;
                value = value.replace(/[ -]/g, "");
            }
            if (!value) {
                this.hideCardType();
            }
            return value;
        },
        validate: function(value, options) {
            var erroropts = {};
            if (options.instantValidate && !this.model.get("value")) {
                erroropts.display = false;
            }
            // this should really be in control.view
            if (!this.controlparent || !this.controlparent.$el) {
                return;
            }

            var cardType = getCardType(value);
            if (!cardType) {
                this.addError("payment-card.undefined-card-type", erroropts);
                this.hideCardType();
                this.showAdditionalFields(false);
                return;
            } else {
                this.showCardType(cardType);
                //this.addInfo("payment-card.card-type");
            }
            var validCardType = getValidCardType(value);
            if (!validCardType) {
                this.addError("payment-card.invalid-card-type", erroropts);
                this.showAdditionalFields(false);
                return;
            }
            var showAdditional = !!cardtypes[cardType].additionalfields; //_.contains(additionalfields, cardType);
            this.showAdditionalFields(showAdditional);

            var validLength = getValidLength(value);
            if (!validLength) {
                this.addError("payment-card.invalid-length", erroropts);
                return;
            }
            var validLuhn = getValidLuhn(value);
            if (!validLuhn) {
                this.addError("payment-card.invalid-luhn", erroropts);
            } else {
                this.controlmodel.set("cardtype", cardType);
            }
        }
    });

});
