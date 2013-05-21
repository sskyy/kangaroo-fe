app_module.controller('TestCtrl',
  ['$scope', 'UiConfigPool', 'EventCenter',
   function ($scope, UiConfigPool, EventCenter) {
      UiConfigPool.fetch(function (res) {
        console.log(res);
      });
      $scope.click = function () {
        EventCenter.trigger('ui_config:save', {'a': 1, 'b': 2})
      };

      $scope.gridOptions = {
          data: "keypairs",
          showFilter: true,
          showSelectionCheckbox: true,
          showColumnMenu: true,
          maintainColumnRatios: true,
          enableColumnResize: true,
          plugins: [new ngGridFlexibleHeightPlugin()],
          selectedItems: $scope.selectedItems,
          columnDefs: [{field: 'name', displayName: "Name"},
                       {field: 'fingerprint', displayName: "Fingerprint"}],
      };
}]);
