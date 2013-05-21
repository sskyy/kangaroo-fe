app_module.controller('admin.VolumeCtrl', 
  ['$scope', 'VolumePool', 'VolumeTypePool', 'EventCenter',
   function ($scope, VolumePool, VolumeTypePool, EventCenter) {
      $scope.$emit('load_start');
      $scope.volumes = VolumePool.fetch(function (res) {
          $scope.$emit('load_complete');
          return res;
      });
      $scope.selectedItems = [];
      $scope.volumegridOptions = {
          angridStyle: "th-list",
          data: 'volumes',
          multiSelectWithCheckbox: true,
          columnDefs: [{field: 'tenant_name', displayName: 'Project'},
                       {field: 'host', displayName: 'host'},
                       {field: 'name', displayName: 'Name'},
                       {field: 'size', displayName: 'Size'},
                       {field: 'abs_status', displayName: 'status', columnFilter: 'status_icon_filter'},
                       {field: 'volume_type', displayName: 'Type'},
                       {field: 'attachments', displayName: 'Attached To', columnFilter: 'volume_attach_filter'}],
          selectedItems: $scope.selectedItems
      };
      $scope.$watch('volumegridOptions.selectedItems', function (newValue) {
          $scope.selectedItems = newValue;
      });

      $scope.open_confirm_dialog = function () {
          $scope.confirm_dialog_shown = true;
      };

      $scope.delete_volumes = function () {
          angular.forEach($scope.selectedItems, function (selected) {
            EventCenter.trigger('volume:remove', selected.id);
          });
      };

      $scope.volume_types = VolumeTypePool.fetch();

      $scope.selectedVT = [];
      $scope.volumeTypeGridOptions = {
          angridStyle: "th-list",
          data: 'volume_types',
          multiSelectWithCheckbox: true,
          columnDefs: [{field: 'name', displayName: 'Name'}],
          selectedItems: $scope.selectedVT
      };

      $scope.$watch('volumeTypeGridOptions.selectedItems', function (newValue) {
          $scope.selectedVT = newValue;
      });

      $scope.open_confirm_dialog2 = function () {
          $scope.confirm_dialog_shown2 = true;
      };

      $scope.delete_volume_types = function () {
          for (var i=0; i < $scope.selectedVT.length; i++) {
            EventCenter.trigger('volume_type:remove', $scope.selectedVT[i].id);
          }
      };

      $scope.create_vt = function () {
          $scope.create_vt_shown = true;
      };

      $scope.$on('cache_change:volume_type', function () {
        $scope.volume_types = VolumeTypePool.fetch();
      });

      $scope.$on('cache_change:volume', function () {
        $scope.volumes = VolumePool.fetch();
      });
}]);
