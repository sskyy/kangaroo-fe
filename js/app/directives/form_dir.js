app_directives
    .directive('modalHeader', function () {
        return {
            restrict: 'E',
            replace: true,
            scope: {
                'title': '@'
            },
            templateUrl: '/static/js/templates/common/modal_header.html',
            link: function (scope, elem, attr){
                scope.close = scope.$parent.closeModal;
            }
        };
    })
    .directive('modalFooter', ['form_valid', function (form_valid) {
        return {
            restrict: 'E',
            replace: true,
            scope: {
                cancelText: "@",
                okText: "@",
                formInvalid: "=",
                completeUpload: "="
            },
            templateUrl: '/static/js/templates/common/modal_footer.html',
            link: function (scope, elem, attr) {
                scope._cancelText = attr.cancelText || "Cancel";
                scope._okText = attr.okText || "Create";
                scope.close = scope.$parent.closeModal;
                scope.form_invalid = function () {
                    var parent_form = $(elem).parent('form');
                    if (!form_valid(parent_form[0])) return true;
                    return scope.formInvalid?scope.formInvalid():false;
                };
            }
        };
    }])
    .directive('modalDesc', function () {
        return {
            restrict: 'E',
            replace: true,
            scope: {
                title: "@",
                desc: "@"
            },
            templateUrl: '/static/js/templates/common/modal_desc.html',
            link: function (scope, elem, attr) {
                scope._title = attr.title || "Description";
            }
        };
    })
    .directive('bInput', ['$compile', function ($compile) {
        return {
            restrict: 'E',
            replace: true,
            scope: {
                type: "@",
                label: "@",
                value: "=",
                name: "@",
                placeholder: "@",
                model: "=",
                required: "@",
                validate: "@"
            },
            templateUrl: '/static/js/templates/common/bootstrap_input.html',
            link: function (scope, elem, attr) {
                scope._required = eval(attr.required === undefined?true: attr.required);
                var validate = attr.validate===undefined?'':eval(attr.validate).join(' '),
                    type = attr.type || 'text',
                    placeholder = attr.placeholder|| '',
                    name = attr.name || '';
                var input = '<input ' + 'value="{{value}}" name="' + name + '" type="' + type + '" placeholder="' + placeholder + '" ng-model="model" ng-required="_required" ' + validate +'>' +
                            '</input>';
                $(elem).find('.controls').append($compile(input)(scope));
            }
        };
    }])
    .directive('bSelect', ['$compile', function ($compile) {
        return {
            restrict: 'E',
            replace: true,
            scope: {
                label: "@",
                model: "=",
                name: "@",
                required: "@",
                options: "=",
                optionId: "@",
                optionName: "@"
            },
            templateUrl: '/static/js/templates/common/bootstrap_input.html',
            link: function (scope, elem, attr) {
                scope._required = eval(attr.required||true);
                var optionId = attr.optionId || "id",
                    optionName = attr.optionName || "name",
                    name = attr.name || "";
                var option_str = "item."+ optionId + " as item." + optionName + " for item in options";
                var select = '<select name="' + name + '" ng-model="model" ng-required="_required" ng-options="'+ option_str + '">' +
                             '</select>';
                $(elem).find('.controls').append($compile(select)(scope));
            }
        };
    }])
    .directive('bTextarea', ['$compile', function ($compile) {
        return {
            restrict: 'E',
            replace: true,
            scope: {
                label: "@",
                model: "=",
                required: "@",
            },
            templateUrl: '/static/js/templates/common/bootstrap_input.html',
            link: function (scope, elem, attr) {
                scope._required = eval(attr.required||false);
                var textarea = "<textarea ng-model='model' ng-required='_required'/>"
                $(elem).find('.controls').append($compile(textarea)(scope));
            }
        };
    }]);
