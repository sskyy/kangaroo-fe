app_module.controller('user.FloatingIpCtrl',
    ['$scope', 'FloatingIpPool', 'EventCenter',
     function ($scope, FloatingIpPool, EventCenter) {
        $scope.$emit('load_start');
        $scope.floating_ips = FloatingIpPool.fetch(function (res) {
            $scope.$emit('load_complete');
            return res;
        });
        
        $scope.open_allocate_ip = function () {
            $scope.allocate_ip_shown = true;
        };
        $scope.open_associate_ip = function () {
            $scope.associate_ip_shown = true;
            $scope.$broadcast('associate_ip_shown');
        };
        $scope.open_confirm_dialog = function () {
            $scope.confirm_dialog_shown = true;
        };
        $scope.open_disassociate_ip = function () {
            $scope.disassociate_ip_shown = true;
        };
        $scope.release_ip = function () {
            for(var i=0; i < $scope.selectedItems.length; i++) {
                var selected = $scope.selectedItems[i];
                EventCenter.trigger('floating_ip:release', selected.id)
            }
            $scope.selectedItems.splice(0, $scope.selectedItems.length);
        };
        $scope.disassociate_ip = function () {
            var selected = $scope.selectedItems[0],
                data = {'action': 'disassociate', 'instance_uuid': selected.instance_id};
            EventCenter.trigger('floating_ip:disassociate', selected.id, data);
        };
        //grid options
        $scope.selectedItems = [];
        $scope.gridOptions = {
            angridStyle: "th-list",
            multiSelectWithCheckbox: true,
            data: "floating_ips",
            columnDefs: [{field: 'ip', displayName: 'IP'},
                         {field: 'instance_id', displayName: "Instance Id"},
                         {field: 'pool', displayName: "Pool"}],
            selectedItems: $scope.selectedItems
        };
        $scope.$watch('gridOptions.selectedItems', function (newValue) {
            $scope.selectedItems = newValue;
        });

        $scope.$on('cache_change:floating_ip', function () {
          $scope.floating_ips = FloatingIpPool.fetch();
        });
}]);
