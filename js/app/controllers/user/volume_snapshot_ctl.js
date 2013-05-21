app_module.controller('user.VolumeSnapshotCtrl',
    ['$scope', 'VolumeSnapshotPool', 'EventCenter',
     function ($scope, VolumeSnapshotPool, EventCenter) {
        $scope.$emit('load_start');
        $scope.volume_snapshots = VolumeSnapshotPool.fetch(function (res) {
            $scope.$emit('load_complete');
            return res;
        });
        $scope.selectedItems = [];
        $scope.gridOptions = {
            angridStyle: "th-list",
            data: "volume_snapshots",
            multiSelectWithCheckbox: true,
            columnDefs: [{field: 'name', displayName: 'Name'},
                         {field: 'description', displayName: "Description"},
                         {field: 'size', displayName: 'Size'},
                         {field: 'abs_status', displayName: 'Status', columnFilter: 'status_icon_filter'},
                         {field: 'volume_name', displayName: 'Volume Name'}],
            selectedItems: $scope.selectedItems
        };
        $scope.$watch("gridOptions.selectedItems", function (newValue) {
            $scope.selectedItems = newValue;
        });

        $scope.open_confirm_dialog = function () {$scope.confirm_dialog_shown = true};
        $scope.open_create_volume_modal = function () {
            $scope.create_volume_shown = true;
        };
        $scope.delete_volume_snapshots = function () {
          for(var i=0; i< $scope.selectedItems.length; i++) {
            EventCenter.trigger('volume_snapshot:remove', $scope.selectedItems[i].id);
          }
        };

        $scope.$on('cache_change:volume_snapshot', function () {
          $scope.volume_snapshots = VolumeSnapshotPool.fetch();
        });
}]);
