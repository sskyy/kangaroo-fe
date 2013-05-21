app_module.controller('admin.FlavorCtrl',
  ['$scope', 'is_dough_enabled', 'FlavorPool', 'EventCenter', '$filter', 
   function ($scope, is_dough_enabled, FlavorPool, EventCenter, $filter) {
        $scope.open_create_flavor = function () {
            $scope.create_flavor_shown = true;
        };

        $scope.open_confirm_dialog = function () {
            $scope.confirm_dialog_shown = true;
        };

        $scope.delete_flavors = function () {
            for (var i=0; i < $scope.selectedItems.length; i++) {
                var selected = $scope.selectedItems[i];
                EventCenter.trigger('flavor:remove', selected.id);
            }
        };

        $scope.$emit('load_start');
        $scope.flavors = FlavorPool.fetch(function (res) {
            $scope.$emit('load_complete');
            return res;
        });
        
        var columnDefs = [{field: 'name', displayName: 'Name'},
                         {field: 'vcpus', displayName: 'Cores'},
                         {field: 'ram', displayName: 'Ram', columnFilter: 'mb_format'},
                         {field: 'disk', displayName: 'Root Disk', columnFilter: 'gb_format'},
                         {field: 'ephemeral', displayName: 'Ephemeral', columnFilter: 'gb_format'},
                         ];
        if (is_dough_enabled()) {
            columnDefs.push({field: 'product_info', displayName: 'Monthly Price', columnFilter: 'month_price'},
                            {field: 'product_info', displayName: 'Hourly Price', columnFilter: 'hour_price'});
        }

        $scope.selectedItems = [];
        $scope.gridOptions = {
            angridStyle: "th-list",
            multiSelectWithCheckbox: true,
            data: 'flavors',
            columnDefs: columnDefs,
            selectedItems: $scope.selectedItems
        };
        $scope.$watch('gridOptions.selectedItems', function (newValue) {
            $scope.selectedItems = newValue;
        });

        $scope.$on('cache_change:flavor', function () {
          $scope.flavors = FlavorPool.fetch();
        });
}]);
