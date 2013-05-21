app_module.controller('user.SnapshotCtrl',
    ['$scope', 'SnapshotPool', 'EventCenter',
     function ($scope, SnapshotPool, EventCenter) {
        $scope.$emit('load_start');
        $scope.snapshots = SnapshotPool.fetch(function (res) {
            $scope.$emit('load_complete');
            return res;
        });

        $scope.open_launch_instance = function () {
            $scope.launch_instance_shown = true;
            $scope.$broadcast('launch_instance_with_snapshot',
                {'id': $scope.selectedItems[0].id})
        };
        $scope.open_confirm_dialog = function () {
            $scope.confirm_dialog_shown = true;
        };
        $scope.delete_snapshots = function () {
            for (var i=0; i < $scope.selectedItems.length; i++) {
                EventCenter.trigger('snapshot:remove', $scope.selectedItems[i].id);
            }
        };
        $scope.update_snapshot = function () {
            $scope.update_snapshot_shown = true;
            $scope.$broadcast('update_snapshot_shown');
        };
        // grid options
        $scope.selectedItems = [];
        $scope.gridOptions = {
            angridStyle: "th-list",
            multiSelectWithCheckbox: true,
            data: "snapshots",
            columnDefs: [{field: 'name', displayName: 'Name'},
                         {field: 'abs_status', displayName: 'Status', columnFilter: 'status_icon_filter'},
                         {field: 'is_public', displayName: 'Public'},
                         {field: 'container_format', displayName: 'Container Format'}],
            selectedItems: $scope.selectedItems,
        };
        $scope.gridOptions.columnDefs[1].columnTemplate='<icon keysource="rowData[colData.field]" region="status" ></icon>';
        
        $scope.$watch("gridOptions.selectedItems", function (newValue) {
            $scope.selectedItems = newValue;
            if($scope.selectedItems.length == 0)
                return;
            $scope.displayItem = $scope.selectedItems[0];
        });

        $scope.displayItem={};

        $scope.$on('cache_change:snapshot', function () {
          $scope.snapshots = SnapshotPool.fetch();
        });
}]);
