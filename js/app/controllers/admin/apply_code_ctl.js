app_module.controller('admin.ApplyCodeCtrl',
  ['$scope', 'ApplyCodePool', 'EventCenter',
   function ($scope, ApplyCodePool, EventCenter) {
      $scope.open_create_ap = function () {
          $scope.create_ap_shown = true;
      };
      $scope.open_confirm_dialog = function () {
          $scope.confirm_dialog_shown = true;
      };
      $scope.delete_aps = function () {
          for (var i=0; i < $scope.selectedItems.length; i++) {
              var selected = $scope.selectedItems[i];
              EventCenter.trigger('apply_code:remove', selected.id);
          }
          //$scope.selectedItems.splice(0, $scope.selectedItems.length);

      };

      $scope.$emit('load_start');
      $scope.apply_codes = ApplyCodePool.fetch(function (res) {
          $scope.$emit('load_complete');
          return res;
      });
      $scope.selectedItems = [];
      $scope.gridOptions = {
          angridStyle: "th-list",
          data: "apply_codes",
          multiSelectWithCheckbox: true,
          columnDefs: [{field: 'id', displayName: 'Code'},
                       {field: 'used_by', displayName: 'Used by'},
                       {field: 'used', displayName: 'Used'},
                       {field: 'used_at', displayName: 'Used At'}],
          selectedItems: $scope.selectedItems,
      };

      $scope.$on('cache_change:apply_code', function () {
        $scope.apply_codes = ApplyCodePool.fetch();
      });
}]);
