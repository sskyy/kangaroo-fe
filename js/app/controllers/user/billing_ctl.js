app_module.controller('user.BillingCtrl',
  ['$scope', 'CrashResource',
   function ($scope, CrashResource) {
      var current_year = new Date().getFullYear(),
          start_year = 2011, select_years = [];
      $scope.selected_year = current_year;
      for (var i=start_year; i <= current_year; i++) {
          select_years.push(i);
      }
      $scope.select_years = select_years;

      $scope.$watch('selected_year', function (newValue) {
          if (newValue !== undefined) {
              $scope.$emit('load_start');
              $scope.crash_log = CrashResource.list_resource.fetch({
                  'from_cache': 1,
                  'year': newValue
              }, function () {
                  $scope.$emit('load_complete');
              });
          }
      });

      $scope.selectedItems = [];
      $scope.gridOptions = {
          angridStyle: "th-list",
          multiSelectWithCheckbox: true,
          data: 'crash_log',
          columnDefs: [{field: 'month', displayName: 'Month'},
                       {field: 'summary', displayName: 'Summary'},
                       {field: 'instance', displayName: 'Instance'},
                       {field: 'network', displayName: 'Network'},
                       {field: 'floating_ip', displayName: 'Floating Ip'}],
          selectedItems: $scope.selectedItems
      };
      $scope.$watch('gridOptions.selectedItems', function (newValue) {
          $scope.selectedItems = newValue;
          if (newValue !== undefined && $scope.selectedItems.length == 1) {
              var month = $scope.selectedItems[0].month,
                  year = $scope.selected_year;
              CrashResource.detail_resource.query({'id': year + '-' + month},
                  function (res) {
                      $scope.billing_detail = res;
              });
          }
      });

      $scope.detailGridOptions = {
          angridStyle: 'th-list',
          data: 'billing_detail',
          columnDefs: [
              {field: 'resource_name', displayName: 'Resource Name'},
              {field: 'resource_type', displayName: 'Resource type'},
              {field: 'price', displayName: 'Price'},
              {field: 'time_from', displayName: 'Start Time'},
              {field: 'time_to', displayName: 'End Time'},
              {field: 'money_cost', displayName: 'Crash Cost'},
              {field: 'coupon_cost', displayName: 'Coupon Cost'},
              {field: 'total_cost', displayName: 'Sum'}
          ]
      };
}])
