app_module.controller('user.VolumeCtrl', 
    ['$scope', 'InstancePool', 'VolumePool', 'EventCenter',
     function ($scope, InstancePool, VolumePool, EventCenter) {
        $scope.$emit('load_start');
        InstancePool.fetch(); // for edit attach
        $scope.volumes = VolumePool.fetch(function (res) {
            $scope.$emit('load_complete');
            return res;
        });

        $scope.selectedItems = [];
        $scope.gridOptions = {
            angridStyle: "th-list",
            data: "volumes",
            multiSelectWithCheckbox: true,
            columnDefs: [{field: 'name', displayName: 'Name'},
                         {field: 'description', displayName: 'Description'},
                         {field: 'size', displayName: 'Size'},
                         {field: 'abs_status', displayName: 'Status', columnFilter: 'status_icon_filter'},
                         {field: 'volume_type', displayName: 'Type'},
                         {field: 'attachments', displayName: 'Attached To', columnFilter: 'volume_attach_filter'}],
            selectedItems: $scope.selectedItems,
        };

        $scope.$watch("gridOptions.selectedItems", function (newValue) {
            $scope.selectedItems = newValue;
        });

        $scope.open_create_volume_modal = function () {
            $scope.create_volume_shown = true;
        };
        $scope.open_confirm_dialog = function () {
            $scope.confirm_dialog_shown = true;
        };
        $scope.open_edit_attachment_modal = function () {
            var selected = $scope.selectedItems[0];
            if (selected.attachments.length==0) {
                $scope.edit_attachment_shown = true;
            } else {
                $scope.edit_detachment_shown = true;
            }
        };
        $scope.open_create_snapshot_modal = function () {
            $scope.create_volume_snapshot_shown = true;
        };

        $scope.delete_volumes = function () {
            for(var i=0;i<$scope.selectedItems.length;i++) {
              EventCenter.trigger('volume:remove', $scope.selectedItems[i].id);
            }
        };

        $scope.$on('cache_change:volume', function () {
          $scope.volumes = VolumePool.fetch();
        });
}]);
