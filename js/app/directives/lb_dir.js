app_directives
    .directive('loadbalancermodal',
        ['LBPool', 'InstancePool', 'EventCenter',
          function (LBPool, InstancePool, EventCenter) {
        return {
            restrict: 'E',
            replace: true,
            scope: {
                modalShown: "=",
                editLoadBalancer: '='
            },
            templateUrl: "/static/js/templates/project/load_balancer/load_balancer_modal.html",
            link: function (scope, elem, attrs) {
                scope.load_balancer_name="";
                scope.instances = InstancePool.fetch();
                scope.$watch('modalShown', function (newValue) {
                    if (!newValue) return;
                    if (scope.editLoadBalancer) {
                        var selected = scope.$parent.selectedItems[0];
                        scope.id = selected.id;
                        scope.load_balancer_name = selected.name;
                        scope.protocol = selected.protocol;
                        scope.instance_port = selected.instance_port;
                        scope.balancing_method = selected.config.balancing_method;
                        scope.server_name = selected.http_server_names;
                        scope.instance = selected.instance_uuids;
                    }
                });
                scope.submit = function () {
                    var protocol = scope.protocol, data;
                    data = {
                        name: scope.load_balancer_name,
                        protocol: scope.protocol,
                        instance_port: parseInt(scope.instance_port),
                        instance_uuids: scope.instance,
                        config: {
                            'balancing_method': scope.balancing_method,
                            'health_check_target_path': '/',
                            'health_check_timeout_ms': 5000,
                            'health_check_interval_ms': 30000,
                            'health_check_healthy_threshold': 5,
                            'health_check_unhealthy_threshold': 3
                        }
                    };
                    if (protocol == 'http') {
                        data['http_server_names'] = scope.server_name;
                    }
                    if (scope.editLoadBalancer) {
                      EventCenter.trigger('load_balancer:update', scope.id, data);
                    } else {
                      EventCenter.trigger('load_balancer:create', data);
                    }
                    scope.close_modal();
                };
                scope.close_modal = function () {
                    scope.modalShown = false;
                };
                scope.can_submit=function(form){
                    return form.load_balancer_name.$valid
                        &&form.protocol.$valid
                        &&form.instance_port.$valid
                        &&form.balancing_method.$valid
                        &&form.instance.$valid
                        &&(form.protocol.$modelValue=="tcp"||form.server_name.$valid);
                };
            },
        };
    }])
    .directive('loadBalancerNameValid', function () {
        return {
            restrict: 'A',
            require: 'ngModel',
            link: function (scope, element, attrs, ctrl) {
                scope.max_length_limit = function (data) {
                    return data.length<=40;
                };
                scope.illegal_characters = function (data) {
                    return /^[a-zA-Z0-9]*?$/.test(data);
                };
                ctrl.$parsers.unshift(function (value) {
                    ctrl.$setValidity('max_length_limit', scope.max_length_limit(value));
                    ctrl.$setValidity('illegal_characters', scope.illegal_characters(value));
                    return value;
                });
            },
        };   
    })
    .directive('instancePortValid', function () {
        return {
            restrict: 'A',
            require: 'ngModel',
            link: function (scope, element, attrs, ctrl) {
                scope.valid = function (data) {
                    return data>0&&data<=65536;
                };
                ctrl.$parsers.unshift(function (value) {
                    ctrl.$setValidity('valid', scope.valid(value));
                    return value;
                });
            },
        };   
    })
    .directive('serverNameValid', function () {
        return {
            restrict: 'A',
            require: 'ngModel',
            link: function (scope, element, attrs, ctrl) {
                scope.baddomain = function (data) {
                    return /^[a-zA-Z0-9][a-zA-Z0-9]{0,62}(\.[a-zA-Z0-9][a-zA-Z0-9]{0,62})*$/.test(data);
                };
                ctrl.$parsers.unshift(function (value) {
                    if(value !== "")
                        ctrl.$setValidity('baddomain', scope.baddomain(value));
                    return value;
                });
            },
        };
    });
