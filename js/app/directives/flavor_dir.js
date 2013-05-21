app_directives
    .directive('createFlavorModal', ['is_dough_enabled', 'FlavorPool', 'EventCenter',
        function (is_dough_enabled, FlavorPool, EventCenter) {
        return {
            restrict: 'E',
            replace: true,           
            scope: {
                'modalShown': '='
            },
            templateUrl: "/static/js/templates/admin/flavor/create_flavor.html",
            link: function (scope, elem, attrs) {
              scope.is_dough_enabled = function () {
                return is_dough_enabled();
              };
                scope.submit = function () {
                    var data = {
                        name: scope.name,
                        vcpu: scope.vcpu,
                        ram: scope.ram,
                        disk: scope.disk,
                        ephemeral: scope.ephemeral,
                        swap: scope.swap
                    };
                    if (scope.is_dough_enabled()) {
                      data['hourly'] = scope.hourly;
                      data['monthly'] = scope.monthly;
                    }
                    EventCenter.trigger('flavor:create', data);
                    scope.close_modal();
                };
                scope.close_modal = function () {
                    scope.modalShown = false;
                };
            }
        }
    }])
    .directive('flavorNameValid', ['FlavorPool', function (FlavorPool) {
        return {
            restrict: 'A',
            require: 'ngModel',
            link: function (scope, elem, attr, ctrl) {
                scope.flavor_name_valid =  function (value) {
                    var flavors = FlavorPool.fetch();
                    for (var i=0; i < flavors.length; i++) {
                        var flavor = flavors[i];
                        if (flavor.name == value) {
                            return false;
                        }
                    }
                    return true;
                };
                ctrl.$parsers.unshift(function (value) {
                    if (scope.flavor_name_valid(value))  {
                        ctrl.$setValidity('flavor_name_valid', true);
                        return value;
                    } 
                    ctrl.$setValidity('flavor_name_valid', false);
                    return value;
                });
            }
        };
    }]);
