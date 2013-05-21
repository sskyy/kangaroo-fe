app_module.controller('admin.ImageCtrl',
  ['$scope', 'ImagePool', 'EventCenter',
   function ($scope, ImagePool, EventCenter) {
      $scope.$emit('load_start');
      $scope.images = ImagePool.fetch(function (res) {
          $scope.$emit('load_complete');
          return res;
      });
      $scope.open_confirm_dialog = function () {
          $scope.confirm_dialog_shown = true;
          $scope.displayItem
      };
      $scope.open_create_image = function () {
          $scope.create_image_shown = true;
      };
      $scope.delete_images = function () {
          for(var i=0; i < $scope.selectedItems.length; i++) {
              var selected = $scope.selectedItems[i];
              EventCenter.trigger('image:remove', selected.id);
          }
      };
      $scope.selectedItems = [];
      $scope.gridOptions = {
          angridStyle: "th-list",
          multiSelectWithCheckbox: true,
          data: "images",
          columnDefs: [{field: 'name', displayName: 'Name'},
                       {field: 'status', displayName: 'Status', columnFilter: 'image_status_filter' },
                       {field: 'is_public', displayName: 'Public'},
                       {field: 'container_format', displayName: 'Container Format'}],
          selectedItems: $scope.selectedItems,
      };
      $scope.$watch('gridOptions.selectedItems', function (newValue) {
          $scope.selectedItems = newValue;
          if($scope.selectedItems.length == 0)
              return;
          $scope.displayItem = $scope.selectedItems[0];
      });

      $scope.$on('cache_change:image', function () {
        $scope.images = ImagePool.fetch();
      });
}]);
