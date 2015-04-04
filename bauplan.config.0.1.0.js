define({
    deps: "core.config.0.1.0",
    waitSeconds: 20,
    defaultlang: "en",
    langs: {
        "en": "lang/en",
        "fr": "lang/fr"
    },

    shim: {
        "bauplan": {
            deps: [
                "jquery.cookie",
                "thorax"
            ]
        },
        "bauplan.app": {
            deps: [
                "jquery.cookie",
                "jquery.viewport",
                "bauplan"
            ]
        }
    },

    paths: {
        "bauplan.thorax.patch": "js/bauplan.thorax.patch",
        "bauplan.helpers": "js/bauplan.helpers",
        "bauplan": "js/bauplan",
        "bauplan.load": "js/bauplan.load",
        "bauplan.require": "js/bauplan.require",
        "bauplan.app": "js/bauplan.app",
        "bauplan.ajax": "js/bauplan.ajax",
        "bauplan.authentication": "js/bauplan.authentication",
        "bauplan.model": "js/bauplan.model",
        "bauplan.collection": "js/bauplan.collection",
        "bauplan.view": "js/bauplan.view",
        "bauplan.controller": "js/bauplan.controller",
        "bauplan.authentication.controller": "js/bauplan.authentication.controller",
        "bauplan.layout.controller": "js/bauplan.layout.controller",
        "bauplan.router.base": "js/bauplan.router.base",
        "bauplan.i18n": "js/bauplan.i18n",
        "bauplan.templates": "js/bauplan.templates",
        "bauplan.controls": "js/bauplan.controls",
        "bauplan.tracker": "js/bauplan.tracker",
        "bauplan.analytics": "js/bauplan.analytics",
        "bauplan.feature": "js/bauplan.feature",
        "bauplan.control.view": "js/bauplan.control.view",
        "bauplan.error.view": "js/bauplan.error.view",
        "default.control": "control/default.control",
        "app.setup": "bauplan/js/app.setup"
    },

    templates: {
        "control.view": "template/view/control.view",
        "error.view": "template/view/error.view",
        "default.view": "template/view/default.abstract.view",
        "editblock": "template/template/block-edit.template",
        "block-select": "template/template/block-select.template",
        "password.block": "template/template/password.block.template",
        "actions": "template/control/actions.template",
        "control": "template/control/control.template",
        "control.edit": "template/control/control.edit.template",
        "control.display": "template/control/control.display.template",
        "text.edit": "template/control/text.edit.control",
        "text.display": "template/control/text.display.control",
        "textarea.edit": "template/control/textarea.edit.control",
        "checkbox.edit": "template/control/checkbox.edit.control",
        "password.edit": "template/control/password.edit.control",
        "password-new.edit": "template/control/password-new.edit.control",
        "hidden.edit": "template/control/hidden.edit.control",
        "file.edit": "template/control/file.edit.control",
        "select.edit": "template/control/select.edit.control",
        "date.edit": "template/control/date.edit.control",
        "payment-date-expiry.edit": "template/control/payment-date-expiry.edit.control",
        "payment-date-start.edit": "template/control/payment-date-start.edit.control"
    }
});