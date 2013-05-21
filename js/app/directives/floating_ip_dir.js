app_directives
    .directive('allocateIp', ['FloatingIpPoolPool', 'EventCenter',
        function (FloatingIpPoolPool, EventCenter) {
        return {
            restrict: 'E',
            replace: true,
            scope: {
                allocateIpShown: "="
            },
            templateUrl: '/static/js/templates/project/floating_ip/allocate_ip.html',
            link: function (scope, elem, attr) {
                scope.$watch('allocateIpShown', function (newValue) {
                    if (!newValue) return;
                    scope.pool_list = FloatingIpPoolPool.fetch(function (pools) {
                            scope.ip_pool = pools[0];
                            return pools;
                    });
                });
                scope.submit_allocate_ip = function () {
                    var data = {'pool': scope.ip_pool.name};
                    EventCenter.trigger('floating_ip:allocate', data);
                    scope.closeModal();
                };
                scope.closeModal = function () {
                    scope.allocateIpShown = false;
                };
            }
        };   
    }])
    .directive('associateIp', ['FloatingIpPool', 'InstancePool', 'EventCenter',
        function (FloatingIpPool, InstancePool, EventCenter) {
        return {
            restrict: 'E',
            replace: true,
            scope: {
                associateIpShown: "="
            },
            templateUrl: '/static/js/templates/project/floating_ip/associate_ip.html',
            link: function (scope, elem, attr) {
                scope.submit = function () {
                    data = {"action": 'associate', 'instance_uuid': scope.instance_uuid};
                    EventCenter.trigger('floating_ip:associate', scope.$parent.selectedItems[0].id, data);
                    scope.closeModal();
                };
                scope.$watch('associateIpShown', function (nValue, oValue) {
                    if (nValue === oValue) return;
                    scope.instance_list = InstancePool.fetch(function (instances) {
                        scope.instance_uuid = instances[0].id;
                        return instances;
                    });
                });
                scope.closeModal = function () {
                    scope.associateIpShown = false;
                };
                scope.$on('associate_ip_shown', function () {
                    scope.floating_ip = scope.$parent.selectedItems[0].ip;
                });
            }
        };
    }]);
