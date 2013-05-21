app_module.controller('user.OverviewCtrl',
    ['$scope', '$filter', '$cookies', 'init_quotas', 'get_instance_quotas',
     'combine_instance_flavor', 'is_loadbalance_enabled',
     'QuotaPool', 'FlavorPool', 'InstancePool', 'VolumePool', 'SgPool',
     'KeypairPool', 'FloatingIpPool', 'SnapshotPool', 'LBPool',
     'ProjectUsagePool',
     function ($scope, $filter, $cookies, init_quotas, get_instance_quotas,
               combine_instance_flavor, is_loadbalance_enabled,
               QuotaPool, FlavorPool, InstancePool,
               VolumePool, SgPool, KeypairPool, FloatingIpPool,
               SnapshotPool, LBPool, ProjectUsagePool) {
        var quota_items = ['instances', 'cores', 'gigabytes', 'ram', 'floating_ips', 'key_pairs', 'snapshots', 'security_groups'],
            params = {'from_cache': 2}; // pass params manually, because we have a callback
        if (is_loadbalance_enabled()) {
            quota_items.push('load_balancers');
        }
        $scope.open_launch_instance = function () {
            $scope.launch_instance_shown = true;
        };

        QuotaPool.fetch(function (quotas) {
            // instance, sg, keypairs, floating ips quotas are based on quotas
            $scope.quotas = init_quotas(quota_items, quotas);

            FlavorPool.fetch(function (flavors) {
                $scope.flavors = flavors;
                InstancePool.fetch(function (instances){
                    ProjectUsagePool.get({'id': $cookies['project_id']}, function (usage){
                        var _instances = [];
                        angular.forEach(instances, function (ins) {
                          if (usage.server_usages !== undefined) {
                             var _usage = usage.server_usages[ins['id']]; 
                             ins['uptime'] = _usage.uptime;
                             ins['memory_mb'] = _usage.memory_mb;
                             ins['hours'] = _usage.hours;
                             ins['vcpus'] = _usage.vcpus;
                             ins['local_gb'] = _usage.local_gb;
                             this.push(ins);
                          } else {
                            this.push(ins);
                          }
                        }, _instances);
                      $scope.instances = _instances;
                    });
                    $scope.quotas = get_instance_quotas($scope.quotas, instances);
                });
            });


            VolumePool.fetch(function (volumes) {
                var size = 0,
                    gb_format_filter = $filter('gb_format');
                for (var i = 0; i < volumes.length; i++) {
                    size += volumes[i].size;
                }
                $scope.quotas.gigabytes.raw_used = size;
            });

            SgPool.fetch(function (security_groups) {
                $scope.quotas.security_groups.raw_used = security_groups.length;
            });

            KeypairPool.fetch(function (key_pairs) {
                $scope.quotas.key_pairs.raw_used = key_pairs.length;
            });

            FloatingIpPool.fetch(function (floating_ips) {
                $scope.quotas.floating_ips.raw_used = floating_ips.length;
            });

            SnapshotPool.fetch(function (snapshots) {
                $scope.quotas.snapshots.raw_used = snapshots.length;
            });

            if (is_loadbalance_enabled()) {
                LBPool.fetch(function (lbs) {
                    $scope.quotas.load_balancers.raw_used = lbs.length;
                });
            }

        });

        $scope.$on('cache_change:instance', function () {
          $scope.instances = InstancePool.fetch();
        });
}]);
