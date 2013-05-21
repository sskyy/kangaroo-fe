app_directives
    .directive('integer', function () {
        // check whether the input it's integer
        var INTEGER_REGEXP = /^\-?\d*$/;
        return {
            require: 'ngModel',
            link: function(scope, elm, attrs, ctrl) {
              ctrl.$parsers.unshift(function(viewValue) {
                if (INTEGER_REGEXP.test(viewValue)) {
                  // it is valid
                  ctrl.$setValidity('integer', true);
                  return viewValue;
                } else {
                  // it is invalid, return undefined (no model update)
                  ctrl.$setValidity('integer', false);
                  return undefined;
                }
              });
            }
        };
    })
    .directive('intRange', function () {
        // check whether a num is in range
        return {
            restrict: 'A',
            require: 'ngModel',
            link: function (scope, element, attrs, ctrl) {
                var range = angular.fromJson(attrs.intRange),
                    min = range[0],
                    max = range[1];
                ctrl.$parsers.unshift(function (value) {
                    if (value < min  || value > max) {
                        ctrl.$setValidity('int_valid', false);
                        return undefined;
                    }
                    ctrl.$setValidity('int_valid', true);
                    return value;
                });
            }
        };
    })
    .directive('sourceValid', function () {
        // directive for check source format
        return {
            restrict: 'A',
            require: 'ngModel',
            link: function (scope, element, attrs, ctrl) {
                ctrl.$parsers.unshift(function (value) {
                    var SOURCE_REG = /^(25[0-5]|2[0-4]\d|[0-1]?\d?\d)(\.(25[0-5]|2[0-4]\d|[0-1]?\d?\d)){3}\/(3[0-2]|[1-2]?\d)$/;
                    if (SOURCE_REG.test(value)) {
                        ctrl.$setValidity('source_valid', true);
                        return value;
                    }
                    ctrl.$setValidity('source_valid', false);
                    return undefined;
                });
            }
        };
    })
    .directive('portRangeValid', function () {
        // directive for check port range in form
        return {
            restrict: 'A',
            require: 'ngModel',
            link: function (scope, element, attrs, ctrl) {
                ctrl.$parsers.unshift(function (value) {
                    var PORT_RANGE_REG = /^(\d+)$|^(\d+)\s*-\s*(\d+)$/,
                        match = PORT_RANGE_REG.exec(value);

                    var check_port_range = function (port) {
                        var min = 1, max = 65535;
                        return port >= min && port <= max;
                    };

                    if (match != null) {
                        if (match[1] != undefined) {
                        //only enter one port
                            if (!check_port_range(match[1])) {
                                ctrl.$setValidity('port_range_valid', false);
                                return undefined;
                            }
                        } else {
                        //enter two port
                            if (!check_port_range(match[2])
                                    || !check_port_range(match[3])) {

                                ctrl.$setValidity('port_range_valid', false);
                                return undefined;
                            }
                            if (match[2] >= match[3]) {
                                ctrl.$setValidity('port_range_valid', false);
                                return undefined;
                            }
                        }
                        ctrl.$setValidity('port_range_valid', true);
                        return value;
                    }
                    ctrl.$setValidity('port_range_valid', false);
                    return undefined;
                });
            }
        };
    });
