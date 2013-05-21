app_module.controller('user.ImageCtrl',
    ['$scope', 'ImagePool',
     function ($scope, ImagePool) {
        $scope.$emit('load_start');
        $scope.images = ImagePool.fetch(function (res) {
            $scope.$emit('load_complete');
            return res;
        });
        $scope.open_launch_instance = function () {
            if( $scope.selectedItems.length == 0 ){
                return false;
            }
            $scope.launch_instance_shown = true;
            $scope.$broadcast('launch_instance_with_image',
                {'id': $scope.selectedItems[0].id});
        };
        $scope.selectedItems = [];
        $scope.gridOptions = {
            angridStyle: "th-list",
            data: "images",
            multiSelectWithCheckbox: true,
            columnDefs: [{field: 'name', displayName: 'Name'},
                         {field: 'abs_status', displayName: 'Status'},
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
}]);
