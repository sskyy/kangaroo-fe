app_module.controller('user.BalanceCtrl',
  ['$scope', 'CrashResource', 'CouponLogResource',
   function ($scope, CrashResource, CouponLogResource) {
      var current_year = new Date().getFullYear(),
          start_year = 2011, select_years = [];
      $scope.selected_year = current_year;
      for (var i=start_year; i <= current_year; i++) {
          select_years.push(i);
      }
      $scope.select_years = select_years;

      CrashResource.remaining_resource.get(function (res) {
          $scope.crash_remaining = res['remaining'];
      });
      CouponLogResource.remaining_resource.get(function (res) {
          $scope.coupon_remaining = res['remaining'];
      });
      $scope.open_load_coupon = function () {
          $scope.load_coupon_shown = true;
      };

      $scope.gridOptions = {
          angridStyle: 'th-list',
          data: 'coupon_log',
          columnDefs: [
              {field: 'date', displayName: 'Date'},
              {field: 'sn', displayName: 'SN'},
              {field: 'value', displayName: 'Coupon Value'}
          ]
      };

      $scope.$watch('selected_year', function (newValue) {
          if (newValue !== undefined) {
              $scope.$emit('load_start');
              CouponLogResource.list_resource.fetch({'year': newValue},
                  function (res) {
                  $scope.coupon_log = res;

                  $scope.$emit('load_complete');
              });
          }
      });
}]);
