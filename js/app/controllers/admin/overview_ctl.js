app_module.controller('admin.OverviewCtrl',
  ['$scope', '$location', 'is_kanyun_enabled', 'AdminNodesResource',
   function ($scope, $location, is_kanyun_enabled, AdminNodesResource) {
      if (!is_kanyun_enabled()) {
          $location.path('/app/admin_instance');
      }
      $scope.$emit('load_start');
      $scope.node_list = AdminNodesResource.list_resource.fetch({'from_cache': 1}, function (res) {
          $scope.$emit('load_complete');
      });

      $scope.selectedItems = [];
      
      $scope.gridOptions = {
          angridStyle: "th",
          data: 'node_list',
          multiSelectWithCheckbox: true,
          columnDefs: [
                       //{field: 'id', displayName: 'ID', cssClass:'col1'},
                       {field: 'hostname', displayName: 'Host Name', cssClass:'col1'},
                       {field: 'cpu', displayName: 'CPU', cssClass:'col2'},
                       {field: 'mem', displayName: 'Memory', cssClass:'col3'},
                       {field: 'disk', displayName: 'Disk Capacity', cssClass:'col4'}],
          selectedItems: $scope.selectedItems
      };

      $scope.$watch('gridOptions.selectedItems', function (newValue) {
          $scope.selectedItems = newValue;
      });

      $scope.$on('popheight', function () {
          var selected_node = $scope.selectedItems[0];
          AdminNodesResource.detail_resource.query({'id': selected_node.id, 'get_vm': true}, function (res) {
              $scope.vm_list = res;
          });
          setTimeout(function () {
              angular.element('#cpu_usage').scope().render();
              angular.element('#mem_usage').scope().render();
              angular.element('#disk_usage').scope().render();
          }, 2000);

      });
}]);
