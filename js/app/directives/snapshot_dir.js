app_directives
    .directive("updateSnapshot", ['SnapshotPool', 'EventCenter',
      function (SnapshotPool, EventCenter) {
        return {
            restrict: 'E',
            replace: true,
            scope: {
                updateSnapshotShown: "="
            },
            templateUrl: "/static/js/templates/project/snapshot/update_snapshot.html",
            link: function (scope, element, attrs) {
                scope.update_snapshot = function () {
                    var data = {
                        'name': scope.snapshot_name,
                        'is_public': false, //current no publick is support
                        'disk_format': scope.disk_format,
                        'container_format': scope.container_format,
                    };
                    EventCenter.trigger('snapshot:update', scope.$parent.selectedItems[0].id, data);
                    scope.close_update_snapshot();
                };
                scope.close_update_snapshot = function () {
                    scope.updateSnapshotShown = false;
                };
                scope.$on("update_snapshot_shown", function () {
                    var selected_item =  scope.$parent.selectedItems[0]; 
                    scope.snapshot_name = selected_item.name;
                    scope.kernel_id = selected_item.properties.kernel_id;
                    scope.ramdisk_id = selected_item.properties.ramdisk_id;
                    scope.architecture = selected_item.properties.architecture;
                    scope.container_format = selected_item.container_format;
                    scope.disk_format = selected_item.disk_format;
                });
            }
        };
    }]);
