app_module.controller('user.MonitorCtrl',
    ['$scope', 'InstancesResource', '$filter',
     function ($scope, InstancesResource, $filter) {
        window.monitor = {
            options: {},
            unit_map: {
                cpu: '%',
                blk_read: 'bytes',
                blk_write: 'bytes',
                nic_outgoing: 'bytes',
                nic_incoming: 'bytes',
                vmnetwork: 'bytes'
            },
        };
        $scope.cpuSourceList = [{value:'demo_CPU'},{value:'default'}];

        $scope.products = [{'name': 'all', 'type': 'all'}, 
                           {'name': 'compute', 'type': 'compute'}];
        $scope.display_product = $scope.products[0].type;

        $scope.metrics = [
                            {'name': 'cpu', 'type': 'cpu'},
                            {'name': 'blk read', 'type': 'blk_read'},
                            {'name': 'blk write', 'type': 'blk_write'},
                            {'name': 'vmnetwork', 'type': 'vmnetwork'},
                            {'name': 'nic incoming', 'type': 'nic_incoming'},
                            {'name': 'nic outgoing', 'type': 'nic_outgoing'}];

        $scope.display_metric = $scope.metrics[0].type;

        $scope.monitor_items = [];
        $scope.data_load = false;
        $scope.$emit('load_start');
        InstancesResource.list_resource.fetch({}, function (instances) {
            $scope.$emit('load_complete');
            for (var i = 0; i < instances.length; i++) {
                var instance = instances[i];
                $scope.monitor_items.push({
                    'resource_name': instance.name,
                    'metrics' : $scope.metrics.map(function(metric){
                        return metric.type == 'all' ? null : metric.type;
                    }),
                    'id' : instance.id
                })
            }
            $scope.all_monitor_items = $scope.monitor_items;
            $scope.data_load = true;
        });

        $scope.gridOptions =  {
            angridStyle: "th-list",
            multiSelectWithCheckbox: true,
            data: 'monitor_items',
            columnDefs: [{field: 'resource_name', displayName: 'Resource'},
                         {field: 'metrics', displayName: 'Metrics',columnTemplete:$filter('moniter_metrics_format')()}],
            selectedItems: $scope.selectedItems
        };

        $scope.statistic_methods = ['avg', 'sum', 'max', 'min'];
        $scope.statistic_method = $scope.statistic_methods[0];
        $scope.time_ranges = [60, 360, 1440, 10080];
        $scope.time_range = $scope.time_ranges[0];
        $scope.time_periods = [1, 5, 60, 360];
        $scope.time_period = $scope.time_periods[1];


        $scope.$on('metric selected',function( e, Instance, metric){
            $scope.selectedItems = [Instance];
            $scope.selected_uuid = Instance.id;
            $scope.current_metric = metric;
            window.monitor.options.id = Instance.id;
            window.monitor.options.metric = metric;
            window.monitor.options.unit = window.monitor.unit_map[metric];
        })
}]);
