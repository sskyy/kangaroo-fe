app_module.controller('admin.QuotaCtrl',
  ['$scope', 'QuotaPool',
   function ($scope, QuotaPool) {
      $scope.$emit('load_start');
      $scope.quotas = QuotaPool.fetch(function (res) {
          $scope.$emit('load_complete');
          return res;
      });

      $scope.selectedItems = [];
      $scope.gridOptions = {
          angridStyle: "th-list",
          multiSelectWithCheckbox: true,
          data: 'quotas',
          columnDefs: [{field: 'name', displayName: 'Name'},
                       {field: 'limit', displayName: 'Limit'}],
          selectedItems: $scope.selectedItems
      };
      $scope.$watch('gridOptions.selectedItems', function (newValue) {
          $scope.selectedItems = newValue;
      });

      $scope.$on('cache_change:quota', function () {
        $scope.quotas = QuotaPool.fetch();
      });
}]);
