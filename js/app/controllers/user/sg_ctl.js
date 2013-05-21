app_module.controller('user.SgCtrl',
    ['$scope', 'SgPool', 'EventCenter',
     function ($scope, SgPool, EventCenter) {
        $scope.sg_modal_shown = false;
        $scope.open_create_sg_modal = function () {
            $scope.sg_modal_shown = true;
            $scope.update_sg = false;
        };
        $scope.open_update_sg_modal = function () {
            $scope.sg_modal_shown = true;
            $scope.update_sg = true;
        };
        $scope.open_confirm_dialog = function () {
            $scope.confirm_dialog_shown = true;
        };
        $scope.delete_group = function () {
            for (var i=0; i < $scope.selectedItems.length; i++) {
                var selected = $scope.selectedItems[i];
                EventCenter.trigger('sg:remove', selected.id);
                //SecurityGroupsResource.detail_resource.remove(selected.id);
            }
            $scope.selectedItems.splice(0, $scope.selectedItems.length);
        };

        $scope.$emit('load_start');
        $scope.security_groups = SgPool.fetch(function (res) {
            $scope.$emit('load_complete');
            return res;
        });


        //grid options
        $scope.selectedItems = [];
        $scope.gridOptions = {
            angridStyle: "th-list",
            multiSelectWithCheckbox: true,
            data: "security_groups",
            columnDefs: [{field: 'name', displayName: "Name"},
                         {field: 'description', displayName: "Description"}],
            selectedItems: $scope.selectedItems
        };
        $scope.$watch('gridOptions.selectedItems', function (newValue) {
            $scope.selectedItems = newValue;
        });

        $scope.$on('cache_change:sg', function (evt, options) {
          $scope.security_groups = SgPool.fetch();
        });

}]);
