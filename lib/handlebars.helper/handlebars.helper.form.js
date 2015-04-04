(function (moduleFactory) {
    if(typeof exports === "object") {
        module.exports = moduleFactory(require("lodash"), require("larynx"), require("handlebars"), require("handlebars.el"));
    } else if(typeof define === "function" && define.amd) {
        define(["underscore", "larynx", "handlebars", "handlebars.el"], moduleFactory);
    }
}(function(_, Larynx) {

    var FormHelpers = function (Handlebars, prefix) {
        var CONTROLCLASS = {
            edit: "edit",
            display: "display"
        };

        var helpers = {};

        var formDefaults = {
            "el-tag": "form",
            "method": "post",
            "el-escape": false
        }; 
        // TODO wizard
        helpers["el-form"] = function() {
            var args = Array.prototype.slice.call(arguments);
            var options = args.pop();
            var hash = options.hash;
            var model = hash.model;
            delete hash.model;
            var wizard = hash.wizard;
            delete hash.wizard;

            hash = _.extend({}, hash.attributes, hash);
            delete hash.attributes;
            hash = _.extend({}, formDefaults, hash);
            options.hash = hash;

            var that = this || {};
            that.model = model;
            that.wizardSchema = wizard;
            return Handlebars.helpers.el.apply(that, [options]);
        };

        //TODO - submit, fieldset, field, group, field, form
        // redo el to include el- on attributes
 
        function inputHelper () {
            var args = Array.prototype.slice.call(arguments);
            var hash = args[args.length-1].hash;
            hash["el-tag"] = "input";
            hash.type = args.shift();
            // display rather than edit mode
            if (hash["el-control"] !== undefined && hash["el-control"] === false) {
                for (var prop in hash.attributes) {
                    if (hash[prop] === undefined) {
                        hash[prop] = hash.attributes[prop];
                    }
                }
                delete hash.attributes;
                hash["el-tag"] = "p";
                if (hash.content === undefined) {
                    if (hash.type === "checkbox") {
                        var checked = !!hash.checked;
                        hash.content = checked.toString();
                    } else {
                        hash.contents = hash.value;
                    }
                    delete hash.value;
                    delete hash.id;
                    delete hash.name;
                    delete hash.type;
                }
            }
            delete hash["el-control"];
            var output = Handlebars.helpers.el.apply(this, args);
            return output;
        }

        helpers["el-text"] = function() {
            var args = Array.prototype.slice.call(arguments);
            args.unshift("text");
            return inputHelper.apply(this, args);
        };

        helpers["el-checkbox"] = function() {
            var args = Array.prototype.slice.call(arguments);
            args.unshift("checkbox");
            args[args.length-1].hash["el-fallback-value"] = true;
            return inputHelper.apply(this, args);
        };

        helpers["el-radio"] = function() {
            var args = Array.prototype.slice.call(arguments);
            args.unshift("radio");
            return inputHelper.apply(this, args);
        };

        helpers["el-password"] = function() {
            var args = Array.prototype.slice.call(arguments);
            args.unshift("password");
            return inputHelper.apply(this, args);
        };

        helpers["el-file"] = function() {
            var args = Array.prototype.slice.call(arguments);
            args.unshift("file");
            return inputHelper.apply(this, args);
        };

        helpers["el-hidden"] = function() {
            var args = Array.prototype.slice.call(arguments);
            args.unshift("hidden");
            return inputHelper.apply(this, args);
        };

        helpers["el-submit"] = function() {
            var args = Array.prototype.slice.call(arguments);
            args.unshift("submit");
            return inputHelper.apply(this, args);
        };

        function normaliseParamArray (param) {
             if (param !== undefined) {
                if (typeof param !== "object") {
                    param = [param];
                }
                for (var item in param) {
                    param[item] = param[item].toString();
                }
            }
            return param;
        }

        helpers["el-select"] = function() {
            //TODO
            // map, mapcontent, mapvalue, optgroups
            var args = Array.prototype.slice.call(arguments);
            var options = args[args.length-1];
            var optionsHash = options.hash;
            //var optionsHash = args[args.length-1].hash;
            optionsHash = _.extend({}, optionsHash.attributes, optionsHash);
            delete optionsHash.attributes;
            options.hash = optionsHash;

            var output = "";
            var selected = optionsHash.selected;
            var value = optionsHash.value;
            var optionsDisabled = optionsHash["options-disabled"];
            var cue = optionsHash.cue;
            var opts = optionsHash.options;
            var vals = optionsHash.values;
            if (!opts) {
                opts = vals;
            }
            delete optionsHash.selected;
            delete optionsHash.value;
            delete optionsHash["options-disabled"];
            delete optionsHash.cue;
            delete optionsHash.options;
            delete optionsHash.values;

            if (selected === undefined) {
                selected = value;
            }

            selected = normaliseParamArray(selected);
            optionsDisabled = normaliseParamArray(optionsDisabled);

            var hasSelected;
            for (var i in opts) {
                var optionArgs = opts[i];
                if (typeof optionArgs !== "object") {
                    optionArgs = {
                        content: optionArgs
                    };
                }
                if (vals && vals[i] !== undefined) {
                    optionArgs.value = vals[i];
                } else if (optionArgs.value === undefined) {
                    optionArgs.value = optionArgs.content;
                }
                optionArgs.value = optionArgs.value.toString();
                if (selected !== undefined) {
                    optionArgs.selected = _.intersection(selected, [optionArgs.value]).length > 0;
                    if (!hasSelected) {
                        hasSelected = optionArgs.selected;
                    }
                }

                if (optionsDisabled) {
                    optionArgs.disabled = _.intersection(optionsDisabled, [optionArgs.value]).length > 0;
                }

                opts[i] = optionArgs;
            }

            // No need for a cue if we have a genuine selection
            if (!hasSelected && cue) {
                if (typeof cue !== "object") {
                    cue = {
                        content: cue,
                        "class": "select-cue",
                        "selected": true,
                        "disabled": true
                    };
                }
                opts.unshift(cue);
            }

            for (var opt in opts) {
                opts[opt]["el-tag"] = "option";
                output += Handlebars.helpers.el.apply(this, [{hash:opts[opt]}]);
            }
            optionsHash["el-tag"] = "select";
            optionsHash.content = output;
            optionsHash["el-escape"] = false;
            output = Handlebars.helpers.el.apply(this, args);
            return output;
        };

        helpers["el-textarea"] = function() {
            var args = Array.prototype.slice.call(arguments);
            var hash = args[args.length-1].hash;
            if (hash["el-control"] !== undefined && hash["el-control"] === false) {
                hash = _.extend({}, hash.attributes, hash);
                delete hash.attributes;
                hash["el-tag"] = "p";
                hash["content"] = hash["value"];
                delete hash["value"];
                delete hash["name"];
                delete hash["placeholder"];
                args[args.length-1].hash = hash;
            } else {
                hash = _.extend({}, hash.attributes, hash);
                delete hash.attributes;
                if (!hash["el-content"]) {
                    hash["el-content"] = hash["value"];
                    delete hash["value"];
                }
                hash["el-tag"] = "textarea";
                if (!hash.placeholder && hash["el-phrase-key"]) {
                    hash.placeholder = Larynx.Phrase.get(hash["el-phrase-key"]+"."+"placeholder");
                }
                args[args.length-1].hash = hash;
            }
            var output = Handlebars.helpers.el.apply(this, args);
            return output;
        };

        helpers["el-label"] = function() {
            var args = Array.prototype.slice.call(arguments);
            var hash = args[args.length-1].hash;
            hash["el-tag"] = "label";
            if (hash.edit !== undefined && hash.edit === false) {
                hash["el-tag"] = "h3";
                delete hash["for"];
            }
            delete hash.edit;
            var output = Handlebars.helpers.el.apply(this, args);
            return output;
        };

        function legendOutput (leg) {
            return "<legend><span>" + leg + "</span></legend>";
        }

        helpers["el-fieldset"] = function() {
            var args = Array.prototype.slice.call(arguments);
            var hash = args[args.length-1].hash;
            hash["el-tag"] = "fieldset";
            hash["el-escape"] = false;
            if (hash.legend) {
                hash["el-content-before"] = legendOutput(hash.legend);
                delete hash.legend;
            }
            var output = Handlebars.helpers.el.apply(this, args);
            return output;
        };

        helpers["el-message"] = function() {
            var args = Array.prototype.slice.call(arguments);
            var field = args.shift();
            var type = args.shift();
            var messages = args.shift();

            if (! _.isArray(messages)) {
                messages = [messages];
            }
            var listArgs = {
                content: messages,
                "el-wrap": "li",
                "el-tag": "ul"
            };
            var messagesOutput = Handlebars.helpers.el({
                hash: listArgs
            });
            var messageHeading = Larynx.Phrase.get("field.message.heading." + type, {
                field: field,
                count: messages.length
            });
            if (messageHeading) {
                messagesOutput = "<h2>" + messageHeading + "</h2>" + messagesOutput;
            }
            var messageBundle = {
                "el-tag": "div",
                "class": "control-" + type,
                "content": messagesOutput,
                "el-escape": false
            };

            var messageOutput = Handlebars.helpers.el({
                hash: messageBundle
            });

            return messageOutput;

        };

        function marshallNamespacedAttributes(namespace, attributes) {
            if (attributes[namespace] === undefined) {
                attributes[namespace] = {};
            } else if (typeof attributes[namespace] === "string") {
                attributes[namespace] = {
                    content: attributes[namespace]
                };
            }
            var nameSpAlias = attributes[namespace];
            for (var prop in attributes) {
                if (prop.indexOf(namespace+"-") === 0) {
                    var mappedProp = prop.split(namespace+"-")[1];
                    nameSpAlias[mappedProp] = attributes[prop];
                    delete attributes[prop];
                }
            }
            return attributes;
        }
        helpers["el-field"] = function() {
            var blocks = {};
            var blockList = [
                "label",
                "legend",
                "introduction",
                "description",
                "help",
                "extra",
                "error",
                "warning",
                "info"
            ];
            var editBlockOrder = [
                "introduction",
                "label",
                "description",
                "help",
                "main",
                "error",
                "warning",
                "info",
                "extra"
            ];
            var displayBlockOrder = [
                "label",
                "main"
            ];
            var blockMessage = {
                error: true,
                warning: true,
                info: true
            };

            var args = Array.prototype.slice.call(arguments);
            var options = args[args.length-1];
            var hash = options.hash;
            hash = _.extend({}, hash.attributes, hash);
            delete hash.attributes;

            var inputType;

            hash = marshallNamespacedAttributes("input", hash);
            hash = marshallNamespacedAttributes("help", hash);
            hash = marshallNamespacedAttributes("error", hash);
            hash = marshallNamespacedAttributes("label", hash);
            hash = marshallNamespacedAttributes("field", hash);

            function getAttr (name) {
                var attr = hash[name];
                delete hash[name];
                return attr;
            }
            function getFieldAttr (name) {
                var attr = hash[name];
                delete hash[name];
                if (attr === undefined) {
                    attr = field[name];
                }
                delete field[name];
                return attr;
            }
            var field = getAttr("field");
            var input = getFieldAttr("input");
            var inputs = getFieldAttr("inputs");
            var labels = getFieldAttr("labels");
            var checked = getFieldAttr("checked");
            var inputsDisabled = getFieldAttr("inputs-disabled");
            var phraseKey = getFieldAttr("phrase-key");
            /*var error = getFieldAttr("error");
            var warning = getFieldAttr("warning");
            var info = getFieldAttr("info");*/

            var model = getFieldAttr("model") || this.model;
            var edit = getFieldAttr("edit");
            var display = getFieldAttr("display");
            // by default, editable
            // edit beats display beats edit on view
            var thisEditable = this.edit === undefined || this.edit;
            if (display === undefined) {
                display = !thisEditable;
            }
            if (edit === undefined) {
                edit = !display;
            }
            var controlType = edit ? "edit" : "display";

            if (field.type) {
                hash.type = hash.type || field.type;
                delete field.type;
            }
            if (hash.type) {
                inputType = hash.type;
                delete hash.type;
            }
            if (hash.name) {
                input.name = hash.name;
                delete hash.name;
            }

            var fieldset = (inputs || labels) ? true : false;

            if (model && input.name) {
                var fieldName = input.name;
                if (!phraseKey && model.phraseKey) {
                    phraseKey = model.phraseKey() + "." + fieldName;
                }
                if (model.schema) {
                    var schema = model.schema;
                    var fieldSchema = schema.properties[fieldName];
                    var fieldArray;
                    if (fieldSchema.type === "array") {
                        fieldArray = true;
                        fieldSchema = fieldSchema.items;
                    }
                    //console.log("fieldSchema", fieldSchema);
                    var fieldOptions;
                    if (fieldSchema["enum"]) {
                        fieldOptions = _.extend([], fieldSchema["enum"]);
                        var fieldLabels = [];
                        for (var fieldOpt in fieldOptions) {
                            var fieldOptValue = fieldOptions[fieldOpt];
                            var fieldOptLabel = Larynx.Phrase.get(phraseKey + ".value." + fieldOptValue + ".label");
                            fieldOptLabel = fieldOptLabel ? fieldOptLabel.toString() : fieldOptValue;
                            fieldLabels.push(fieldOptLabel
                            );
                        }
                        if (inputType === "text") {
                            inputType = fieldArray ? "checkbox" : "radio";
                        }
                        if (inputType === "select") {
                            if (_.isEmpty(input.options) && _.isEmpty(hash.options)) {
                                input.options = fieldLabels;
                                input.values = fieldOptions;
                            }
                        } else {
                            fieldset = true;
                            if (_.isEmpty(inputs)) {
                                inputs = fieldOptions;
                                labels = fieldLabels;
                            }
                        }
                    }
                }
                var modelValue = model.get(fieldName);
                if (modelValue !== undefined) {
                    if (fieldset) {
                        if (checked === undefined) {
                            checked = modelValue;
                        }
                    } else {
                        if (input.value === undefined && inputType !== "checkbox") {
                            input.value = modelValue;
                        }
                    }
                }
                if (inputType === "checkbox") {
                    if (input.value === undefined) {
                        input.value = true;
                    }
                     if (input.checked === undefined) {
                        if (modelValue === input.value) {
                            input.checked = true;
                        }
                    }
                }
                if (inputType === "password" && input.value) {
                    input.placeholder = input.value.replace(/./g, "*");
                    if (edit) {
                        delete input.value;
                    } else {
                        input.value = input.placeholder;
                    }
                }
            }


            for (var block in blockList) {
                var blockKey = blockList[block];
                var blockVal = getFieldAttr(blockKey);
                if (phraseKey) {
                    if (blockVal === undefined || (_.isObject(blockVal) && !_.isArray(blockVal) && !("content" in blockVal))) {
                        blockVal = Larynx.Phrase.get(phraseKey+"." + blockKey, {display:display, edit:edit});
                        if (blockVal) {
                            blockVal = {
                                content: blockVal.toString()
                            };
                        }
                    }
                }
                //console.log("blockKey", blockKey, blockVal);

                if (!(_.isEmpty(blockVal))) {
                    blocks[blockKey] = blockVal;
                }
            }

            var label = blocks.label || {};
            delete blocks.label;
            var legend = blocks.legend;
            delete blocks.legend;

            for (var blockType in blocks) {
                var blockIn = blocks[blockType];
                if (blockMessage[blockType]) {
                    //console.log(blockType, blockIn);
                    blocks[blockType] = Handlebars.helpers["el-message"](input.name, blockType, blockIn);
                } else {
                    blockIn["class"] = "control-" + blockType;
                    if (blockIn.content.charAt(0) !== "<" && true) {
                        blockIn["el-wrap"] = "p";
                    }
                    var attr= {
                        hash: {
                            attributes: blockIn
                        }
                    };
                    blocks[blockType] = Handlebars.helpers.el(attr);
                }
            }

            if (hash["class"]) {
                field["class"] = hash["class"];
                delete hash["class"];
            }
            if (!field["class"]) {
                field["class"] = [];
            }
            if (! _.isArray(field["class"])) {
                field["class"] = [field["class"]];
            }
            field["class"].push("control");
            if (input.name) {
                field["class"].push("control-" + input.name);
            }
            // could do this with defaults in marshallNamespaceAttributes
            if (field["el-escape"] === undefined) {
                field["el-escape"] = false;
            }

            field["content"] = "";
            if (options.fn) {
                field.content = options.fn(this);
                delete options.fn;
                //args[args.length-1] = options;
            } else {
                if (hash.id) {
                    input.id = hash.id;
                }
                if (!input.id) {
                    input.id = "input-" + input.name;
                }

                if (fieldset) {
                    inputType = inputType || "radio";

                    var fieldsetContent = "";

                    if (!inputs) {
                        inputs = labels;
                    }
                    checked = normaliseParamArray(checked);
                    inputsDisabled = normaliseParamArray(inputsDisabled);

                    var name = input.name;
                    for (var i in inputs) {
                        var inputArgs = inputs[i];
                        var labelArgs = {};
                        if (typeof inputArgs !== "object") {
                            inputArgs = {
                                value: inputArgs
                            };
                        }
                        inputArgs.name = inputArgs.name || name;
                        inputArgs.id = inputArgs.id || inputArgs.name + "-" + i;

                        if (labels && labels[i] !== undefined) {
                            labelArgs.content = labels[i];
                        } else {
                            labelArgs.content = inputArgs.value;
                        }
                        labelArgs["for"] = inputArgs.id;

                        inputArgs.value = inputArgs.value.toString();
                        if (checked !== undefined) {
                            inputArgs.checked = _.intersection(checked, [inputArgs.value]).length > 0;
                        }

                        if (inputsDisabled) {
                            inputArgs.disabled = _.intersection(inputsDisabled, [inputArgs.value]).length > 0;
                        }

                        inputs[i] = [inputArgs, labelArgs];

                    }
                    for (var item in inputs) {
                        var fieldsetItemOutput = "";
                        var itemInput = inputs[item][0];
                        itemInput["el-tag"] = "input";
                        fieldsetItemOutput += Handlebars.helpers["el-"+inputType]({hash:itemInput});
                        var itemLabel = inputs[item][1];
                        itemLabel["el-tag"] = "label";
                        fieldsetItemOutput += Handlebars.helpers.el({hash:itemLabel});
                        var fieldsetItemArgs = {
                            hash: {
                                "el-tag": "div",
                                "class": CONTROLCLASS[controlType],
                                "content": fieldsetItemOutput,
                                "el-escape": false
                            }
                        };
                        fieldsetContent += Handlebars.helpers.el(fieldsetItemArgs);
                    }
                    blocks["main"] = fieldsetContent;


                    if (legend) {
                        var fieldsetId = field.id || "control-group-" + input.name + "-label";
                        if (!field.role) {
                            field.role = "group";
                            field["aria-labelledby"] = fieldsetId;
                        }
                        var legendParams = {
                            hash: {
                                "el-tag": "p",
                                content: legend,
                                id: fieldsetId
                            }
                        };
                        legend = Handlebars.helpers.el(legendParams);
                        //fieldsetContent = legendOutput(legend) + fieldsetContent;
                        //fieldsetContent = legend + fieldsetContent;
                        blocks["label"] = legend;
                    }

                /*if (field["el-tag"] === undefined) {
                    field["el-tag"] = "fieldset";
                }*/

                    //field["content"] = fieldsetContent;
                } else {
                    inputType = inputType || "text";
                    if (!label["for"]) {
                        label["for"] = input.id;
                    }
                    if (!label["content"]) {
                        labelContent = input.name;
                        if (labelContent) {
                            labelContent = labelContent.substr(0,1).toUpperCase() + labelContent.substr(1);
                        }
                        label["content"] = labelContent;
                        // using name field.$name.label
                        // using model view.$model.$name.label
                    }
                    label.edit = edit;
                    var labelOutput = Handlebars.helpers["el-label"]({hash:label});
                    blocks["label"] = labelOutput;

                    hash.attributes = input;
                    hash["el-wrap-outer"] = {
                        "el-tag": "div",
                        "class": CONTROLCLASS[controlType]
                    };
                    hash["el-phrase-key"] = phraseKey;
                    hash["el-control"] = edit;
                    args[args.length-1].hash = hash;
                    //var inputOutput = Handlebars.helpers["el-"+inputType]({hash:input});
                    var inputOutput = Handlebars.helpers["el-"+inputType].apply(this, args);

                    blocks["main"] = inputOutput;
                    //field["content"] = labelOutput + inputOutput;
                }

            }

            var blockOrder = edit ? editBlockOrder : displayBlockOrder;
            for (var bk in blockOrder)
            if (blocks[blockOrder[bk]]) {
                field["content"] += blocks[blockOrder[bk]];
            }

            //args[args.length-1].hash = {attributes:attributes};

            //var output = Handlebars.helpers.el.apply(this, args);
            if (field["el-tag"] === undefined) {
                field["el-tag"] = "div";
            }
            var output = Handlebars.helpers.el({hash:{attributes:field}});
            return output;
        };

        for (var prop in helpers) {
            Handlebars.registerHelper(prop, helpers[prop]);
        }

    };

    return {
        registerHelpers: function(handlebars, prefix) {
            FormHelpers(handlebars, prefix);
        }
    };
}));
