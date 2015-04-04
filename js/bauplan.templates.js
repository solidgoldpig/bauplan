define([
        "handlebars"
    ], function (Handlebars) {
/**
 * @module bauplan%templates
 * @description ## Templates
 * 
 * Loads and compiles template files for use by Handlebars
 *
 * @return {instance} BauplanTemplates
 */
    var BauplanTemplates = {
        templates: {},
        raw: {},
        /**
        * @param {function} callback
        */
        init: function (callback) {
            this.load(this.Config.config.templates, callback);
        },
        /**
         * @method load
         * @instance
         * @description Load template files for app
         * @param {object} templates Template path key/value pairs
         * @param {function} callback
         */
        load: function BauplanTemplatesLoad (templates, callback) {
            var paths = this.Require.paths(templates, {
                suffix: "template",
                extension: "hbs"
            });
            var Templates = this;
            this.Require.load(paths, {
                plugin: "text",
                paths: paths,
                keys: paths.originalkeys,
                /**
                 * @method filterTemplate
                 * @inner
                 * @param  {string} template Raw template string
                 * @description Turns controls into view helpers
                 * @return {function} Filtered template string
                 */
                filterTemplate: function BauplanFilterTemplate (template) {
                    template = template.replace(/\{\{control ([^ \{}]+)( ([^\{]+?)){0,1}\}\}/g,
                            function(m, m1, m2) {
                            var controlname = m1.replace(/"/g, "");
                            var controlclass = "control control-" + controlname;
                            m2 = m2 || "";
                            if (m2.indexOf("edit=") === -1) {
                                m2 += " edit=edit";
                            }
                            if (m2.indexOf("display=") === -1) {
                                m2 += " display=display";
                            }
                            if (m2.indexOf("control-model=") === -1) {
                                m2 += " control-model=model";
                            }
                            var newtmpl = '{{view "control" class="' + controlclass + '" control-name=' + m1 + " " + m2 + '}}';
                            return newtmpl;
                        });
                    return template;
                },
                /**
                 * @method processValue
                 * @inner
                 * @param  {string} value Template string
                 * @param  {object} bundle
                 * @param  {string} bundle.key
                 * @param  {array} bundle.keys
                 * @param  {string} bundle.value
                 * @description Filters template and compiles string
                 *
                 * Invoked by {@link module:bauplan%require}
                 * @return {function} Compiled template
                 */
                processValue: function(value, bundle, options) {
                    var template = bundle.key;
                    if (value !== Templates.raw[template]) {
                        Templates.raw[template] = value;
                        value = this.filterTemplate(value);
                        Templates.templates[template] = Handlebars.compile(value);
                        Handlebars.templates[template] = Templates.templates[template];
                    }
                    return Templates.templates[template];
                },
                /**
                 * @method callback
                 * @inner
                 * @param  {object} templates Object of compiled templates
                 * @return {object} Compiled templates
                 */
                callback: function (templates) {
                    callback(templates);
                }
            });
        }
    };
    return BauplanTemplates;
});