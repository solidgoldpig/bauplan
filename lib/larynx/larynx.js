(function (moduleFactory) {
    if(typeof exports === "object") {
        module.exports = moduleFactory(require("handlebars.choice"), require("handlebars.filter"), require("handlebars.phrase"), require("handlebars.el"), require("handlebars.el.form"), require("handlebars.moment"), require("handlebars.numeral"));
    } else if (typeof define === "function" && define.amd) {
        define(["handlebars.choice", "handlebars.filter", "handlebars.phrase", "handlebars.el", "handlebars.el.form", "handlebars.moment", "handlebars.numeral"], moduleFactory);
    }
}(function (Choice, Filter, Phrase, ElHelper, ElFormHelper, MomentHelper, NumeralHelper) {
/**
 * @module larynx
 * @description  Convenience object
 *
 *     var Larynx = require("larynx");
 *
 * - [handlebars.phrase](http://phrase.handlebars.solidgoldpig.com)
 * - [handlebars.choice](http://choice.handlebars.solidgoldpig.com)
 * - [handlebars.filter](http://filter.handlebars.solidgoldpig.com)
 * - [handlebars.el](http://el.handlebars.solidgoldpig.com)
 * - [handlebars.el.form](http://el.form.handlebars.solidgoldpig.com)
 * - [handlebars.moment](http://moment.handlebars.solidgoldpig.com)
 * - [handlebars.numeral](http://numeral.handlebars.solidgoldpig.com)
 *
 * Register Larynx helpers
 *
 *     var Handlebars = require("handlebars");
 *     Larynx.registerHelpers(Handlebars);
 *
 * @returns {object} Larynx instance
 */

    var locale = "default";

    var Larynx = {
        /**
         * @member {object} Choice
         * @static
         * @description Yanks in choice
         */
        Choice: Choice,
        /**
         * @member {object} Filter
         * @static
         * @description Yanks in choice
         */
        Filter: Filter,
        /**
         * @member {object} Phrase
         * @static
         * @description Yanks in choice
         */
        Phrase: Phrase,
        /**
         * @member {object} El
         * @static
         * @description Yanks in el
         */
        El: ElHelper,
        /**
         * @member {object} ElForm
         * @static
         * @description Yanks in el-*
         */
        ElForm: ElFormHelper,
        /**
         * @member {object} Moment
         * @static
         * @description Yanks in moment
         */
        Moment: MomentHelper,
        /**
         * @member {object} Numeral
         * @static
         * @description Yanks in numeral
         */
        Numeral: NumeralHelper,
        /**
         * @method locale
         * @static
         * @param {string} [loc] [description]
         * @description Get or set default locale used by Larynx
         *
         * If called without loc parameter, returns locale
         *
         * If called with loc parameter, sets locale for Larynx and
         *
         * - Larynx.Phrase
         * - Larynx.Choice
         * - Larynx.Filter
         *
         * @returns {string} Larynx’s locale
         */
        locale: function (loc) {
            if (loc) {
                locale = loc;
                this.Choice.locale(loc);
                this.Filter.locale(loc);
                this.Phrase.locale(loc);
            }
            return locale;
        },
        /**
         * @method registerHelpers
         * @static
         * @param {object} hbars Handlebars instance
         * @description Register Larynx helpers with Handlebars
         *
         * - phrase
         * - choose
         * - choice
         * - filter
         * - el
         * - el-checkbox
         * - el-field
         * - el-fieldset
         * - el-file
         * - el-form
         * - el-hidden
         * - el-label
         * - el-message
         * - el-password
         * - el-radio
         * - el-select
         * - el-submit
         * - el-text
         * - el-textarea
         * - moment
         * - duration
         * - byte
         * - currency
         * - number
         * - numeral
         * - ordinal
         */
        registerHelpers: function (hbars) {
            this.Choice.registerHelpers(hbars);
            this.Filter.registerHelper(hbars);
            this.Phrase.registerHelper(hbars);
            this.El.registerHelper(hbars);
            this.ElForm.registerHelpers(hbars);
            this.Moment.registerHelpers(hbars);
            this.Numeral.registerHelpers(hbars);
        }
    };

    return Larynx;

}));