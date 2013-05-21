app_module.controller('user.KeypairCtrl',
    ['$scope', 'KeypairPool', 'EventCenter',
     function ($scope, KeypairPool, EventCenter) {
        $scope.keypair_modal_shown = false;
        $scope.open_create_keypair_modal = function () {
            $scope.keypair_modal_shown = true;
            $scope.import_keypair = false;
        };
        $scope.open_import_keypair_modal = function () {
            $scope.keypair_modal_shown = true;
            $scope.import_keypair = true;
        };
        $scope.open_confirm_dialog = function () {
            $scope.confirm_dialog_shown = true;
        };
        $scope.delete_keypairs = function () {
            for (var i = 0; i < $scope.selectedItems.length; i++) {
                var selected = $scope.selectedItems[i];
                EventCenter.trigger('keypair:remove', selected.id);
            }
            $scope.selectedItems.splice(0, $scope.selectedItems.length);
        };

        $scope.$emit('load_start');
        $scope.keypairs  = KeypairPool.fetch(function (res) {
            $scope.$emit('load_complete');
            return res;
        });


        //grid options
        $scope.selectedItems = [];
        $scope.gridOptions = {
            angridStyle: "th-list",
            multiSelectWithCheckbox: true,
            data: "keypairs",
            columnDefs: [{field: 'name', displayName: "Name"},
                         {field: 'fingerprint', displayName: "Fingerprint"}],
            selectedItems: $scope.selectedItems
        };
        $scope.$watch('gridOptions.selectedItems', function (newValue) {
            $scope.selectedItems = newValue;
        });

        $scope.$on('cache_change:keypair', function () {
          $scope.keypairs = KeypairPool.fetch();
        });
}]);
