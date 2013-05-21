app_module.controller('admin.CouponCtrl',
  ['$scope', 'CouponCodeResource',
   function ($scope, CouponCodeResource) {
      $scope.$emit('load_start');
      $scope.coupons = CouponCodeResource.list_resource.fetch({}, function () {
          $scope.$emit('load_complete');
      });

      $scope.open_create_coupon = function () {
          $scope.create_coupon_shown = true;
      };

      $scope.selectedItems = [];
      $scope.gridOptions = {
          angridStyle: "th-list",
          multiSelectWithCheckbox: true,
          data: 'coupons',
          columnDefs: [{field: 'code', displayName: 'Code'},
                       {field: 'sn', displayName: 'SN'}],
          selectedItems: $scope.selectedItems
      };
      $scope.$watch('gridOptions.selectedItems', function (newValue) {
          $scope.selectedItems = newValue;
      });
}]);
