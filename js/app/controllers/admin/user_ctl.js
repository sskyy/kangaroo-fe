app_module.controller('admin.UserCtrl',
    ['$scope', '$filter', 'UserPool', 'EventCenter',
     function ($scope, $filter, UserPool, EventCenter) {
        $scope.$emit('load_start');
        $scope.users = UserPool.fetch(function (res) {
            $scope.$emit('load_complete');
            return res;
        });
        
        $scope.open_create_user = function () {
            $scope.is_edit = false;
            $scope.create_user_shown = true;
        };

        $scope.open_confirm_dialog = function () {
            $scope.confirm_dialog_shown = true;
        };

        $scope.open_edit_user = function () {
            $scope.is_edit = true;
            $scope.create_user_shown = true;
        };

        $scope.delete_users = function () {
            for (var i=0; i < $scope.selectedItems.length; i++) {
                var selected = $scope.selectedItems[i];
                EventCenter.trigger('user:remove', selected.id);
            }
            $scope.selectedItems.splice(0, $scope.selectedItems.length);
        };

        $scope.selectedItems = [];
        $scope.gridOptions = {
            angridStyle: "th-list",
            multiSelectWithCheckbox: true,
            data: 'users',
            columnDefs: [{field: 'name', displayName: 'Name'},
                         {field: 'email', displayName: 'Email'},
                         {field: 'enabled', displayName: 'Enabled'}],
            selectedItems: $scope.selectedItems
        };
        $scope.$watch('gridOptions.selectedItems', function (newValue) {
            $scope.selectedItems = newValue;
            if($scope.selectedItems.length == 0)
                return;
            $scope.displayItem = $scope.selectedItems[0];
        });

        $scope.$on('cache_change:user', function () {
          $scope.users = UserPool.fetch();
        });
}]);
