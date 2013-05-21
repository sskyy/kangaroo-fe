app_module.controller('user.LBCtrl', 
   ['$scope', 'LBPool', 'EventCenter',
    function ($scope, LBPool, EventCenter) {
        $scope.open_create_loadbalaner_modal = function () {
            $scope.load_balancer_modal_shown = true;
            $scope.edit_load_balancer = false;
        };
        $scope.open_edit_loadbalaner_modal = function () {
            $scope.load_balancer_modal_shown = true;
            $scope.edit_load_balancer = true;
        };
        $scope.close_loadbalancer_modal = function () {
            $scope.load_balancer_modal_shown = false;
        };
        $scope.open_confirm_dialog = function () {
            $scope.confirm_dialog_shown = true;
        };
        $scope.delete_loadbalancer = function () {
            for (var i = 0; i < $scope.selectedItems.length; i++) {
                var selected = $scope.selectedItems[i];
                EventCenter.trigger('load_balancer:remove', selected.id);
            }
        };

        $scope.$emit('load_start');
        $scope.load_balancers = LBPool.fetch(function (res) {
          $scope.$emit('load_complete');
          return res;
        });
        //grid options
        $scope.selectedItems = [];
        $scope.gridOptions = {
            angridStyle: "th-list",
            multiSelectWithCheckbox: true,
            data: "load_balancers",
            columnDefs: [{field: 'name', displayName: "Name"},
                         {field: 'abs_status', displayName: 'Status', columnFilter: 'status_icon_filter'},
                         {field: 'protocol', displayName: 'Protocol'},
                         {field: 'listen_port', displayName: 'Listen Port'},
                         {field: 'instance_port', displayName: 'Instance Port'},
                         {field: 'dns_names', displayName: 'DNS Domain'}],
            selectedItems: $scope.selectedItems
        };
        $scope.$watch('gridOptions.selectedItems', function (newValue) {
            $scope.selectedItems = newValue;
        });

        $scope.$on('cache_change:load_balancer', function () {
          $scope.load_balancers = LBPool.fetch();
        });
}]);
