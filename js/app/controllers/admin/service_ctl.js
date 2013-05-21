app_module.controller('admin.ServiceCtrl',
  ['$scope', 'ServicePool', '$filter',
   function ($scope, ServicePool, $filter) {
      $scope.$emit('load_start');
      $scope.service_list = ServicePool.fetch(function (res) {
          $scope.$emit('load_complete');
          console.log(res);
          return res;
      });

      $scope.selectedItems = [];
      $scope.gridOptions = {
          angridStyle: "th-list",
          data: 'service_list',
          multiSelectWithCheckbox: true,
          columnDefs: [{field: 'name', displayName: 'Name'},
                       {field: 'type', displayName: 'Type'},
                       {field: 'host', displayName: 'Host'},
                       {field: 'disabled', displayName: 'Disabled'},
                       {field: 'region', displayName: 'Region'}],
          selectedItems: $scope.selectedItems
      };
      $scope.$watch('gridOptions.selectedItems', function (newValue) {
          $scope.selectedItems = newValue;
      });
}]);
