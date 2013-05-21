app_directives
    .directive('quotaitem', ['$filter', function ($filter) {
        // quota item in overview page
        return {
            restrict: 'E',
            replace: true,
            scope: {
                resourceName: "=",
                resourceRawLimit: "=", // raw limit data
                resourceRawUsed: "=", // raw used data
                flavorSelected: "=",
                copies: "=",
            },
            template: "<div class='quota_item_wrapper'>" +
                          "<div class='quota_title clearfix'>" +
                            "<a class='title'>" +
                                "{{resourceName|i18n}}(<span>{{format_display(resourceRawUsedScoped)}} {{'used'|i18n}}</span>)" +
                            "</a>" +
                            "<p class='limit' ng-hide='resourceRawLimit == null'>" +
                                "{{format_display(resourceRawLimit)}} total" +
                            "</p>" +
                          "</div>" +
                          "<div class='quota_bar'>" +
                              "<div class='progress progress-striped active'>" +
                                "<div class='bar' ng-class='{\"bar-warning\": resourcePercent>50 && resourcePercent<100, \"bar-danger\": resourcePercent>=100}' style='width: {{resourcePercent}}%'>" +
                                "</div>" +
                              "</div>" +
                          "</div>" +
                      "</div>"
            ,
            link: function (scope, elem, attrs) {
                var gb_format_filter = $filter('gb_format'),
                    mb_format_filter = $filter('mb_format');
                scope.format_display = function (value) {
                    if (scope.resourceName == 'gigabytes') {
                        return gb_format_filter(value);
                    } else if (scope.resourceName == 'ram') {
                        return mb_format_filter(value);
                    }
                    return value;
                }
                scope.$watch('resourceRawUsed', function (raw_used) {
                    if (raw_used !== undefined) {
                        scope.resourceRawUsedScoped = raw_used; // only work in the directive
                    }
                });
                scope.$watch('resourceRawUsedScoped', function (raw_used_scoped) {
                    if (raw_used_scoped !== undefined && raw_used_scoped !== null ) {
                        scope.resourcePercent = scope.resourceRawUsedScoped / scope.resourceRawLimit * 100;
                    }
                });
                scope.$watch('flavorSelected', function (flavor) {
                    if (flavor !== undefined && scope.copies !== undefined) {
                        var origin_used = parseInt(scope.resourceRawUsed),
                            copies = scope.copies;
                        if (scope.resourceName == 'cores') {
                            scope.resourceRawUsedScoped = origin_used + parseInt(flavor.vcpus) * copies;
                        } else if (scope.resourceName == 'gigabytes') {
                            scope.resourceRawUsedScoped = origin_used + parseInt(flavor.disk) * copies; //disk or ephemeral ?
                        } else if (scope.resourceName == 'instances') {
                            scope.resourceRawUsedScoped = origin_used + 1 * copies;
                        } else if (scope.resourceName == 'ram') {
                            scope.resourceRawUsedScoped = origin_used + parseInt(flavor.ram) * copies;
                        } else {
                            scope.resourceRawUsedScoped = origin_used;
                        }
                    }
                });
                scope.$watch('copies', function (copies) {
                    if (copies !== undefined && scope.flavorSelected !== undefined) {
                        var origin_used = parseInt(scope.resourceRawUsed),
                            flavor = scope.flavorSelected;
                        if (scope.resourceName == 'cores') {
                            scope.resourceRawUsedScoped = origin_used + parseInt(flavor.vcpus) * copies;
                        } else if (scope.resourceName == 'gigabytes') {
                            scope.resourceRawUsedScoped = origin_used + parseInt(flavor.disk) * copies; //disk or ephemeral ?
                        } else if (scope.resourceName == 'instances') {
                            scope.resourceRawUsedScoped = origin_used + 1 * copies;
                        } else if (scope.resourceName == 'ram') {
                            scope.resourceRawUsedScoped = origin_used + parseInt(flavor.ram) * copies;
                        } else {
                            scope.resourceRawUsedScoped = origin_used;
                        }
                    }
                });
            }
        }
    }])
    .directive('launchnode', function () {
        // node for launch instance in overview page
        return {
            restrict: 'E',
            replace: true,
            scope: {
                availableInstance: "=",
                onClick: "&", // click to open launch instance dialog
            },
            template: "<div class='node large' ng-click='onClick()'>" +
                        "<div class='node-inner launch'>" +
                            "<span class='content'>" +
                                "<div>" +
                                    "<h1>" +
                                        "{{availableInstance}}" +
                                    "</h1>" +
                                    "<q>" +
                                        "{{'available'|i18n}}" +
                                    "</q>" +
                                "</div>" +
                                "<div>" +
                                    "<h1>" +
                                        "+" +
                                    "</h1>" +
                                    "<q>" +
                                        "{{'launch'|i18n}}" +
                                    "</q>" +
                                "</div>" +
                            "</span>" +
                        "</div>" +
                      "</div>",
        };
    })
    .directive('instancenode', [function () {
        // node for instance in overview page
        return {
            restrict: 'E',
            scope: {
                name: "=",
                instanceUuid: "=",
                flavorName: "=",
                status: "=",
                uptime: "="
            },
            replace: true,
            template: "<div class='node large'>" +
                                "<div class='node-inner' ng-class='status|instance_class_filter'>" +
                                    "<span class='content'>" +
                                        "<div>{{name}}</div>" +
                                        "<div>{{flavorName}}</div>" +
                                        "<div>{{'uptime'|i18n}}:{{uptime|uptime_format}}</div>"+
                                    "</span>" +
                                "</div>" +
                              "</div>",
        };
    }]);
