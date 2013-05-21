app_directives
    .directive('createProjectModal', ['EventCenter', function (EventCenter) {
        return {
            restrict: 'E',
            replace: true,
            scope: {
                'modalShown': '='
            },
            templateUrl: '/static/js/templates/admin/project/create_project.html',
            link: function (scope, elem, attrs) {
                scope.submit = function () {
                    var data = {
                        'name': scope.name,
                        'description': scope.description,
                        'enabled': scope.enabled
                    };
                    EventCenter.trigger('project:create', data);
                    scope.close_modal();
                };
                scope.close_modal = function () {
                    scope.modalShown = false;
                };
            }
        }
    }])
    .directive('editProjectModal', ['EventCenter', function (EventCenter) {
        return {
            restrict: 'E',
            replace: true,
            scope: {
                'modalShown': '='
            },
            templateUrl: '/static/js/templates/admin/project/edit_project.html',
            link: function (scope, elem, attrs) {
                scope.submit = function () {
                    var data = {
                        'action': 'update_info',
                        'name': scope.name,
                        'description': scope.description,
                        'enabled': scope.enabled
                    };
                    EventCenter.trigger('project:update', scope.$parent.selectedItems[0].id, data);
                    scope.close_modal();
                };
                scope.close_modal = function () {
                    scope.modalShown = false;
                }
                scope.$on('edit_project_shown', function () {
                    var selected_item  = scope.$parent.selectedItems[0];
                    scope.name = selected_item.name;
                    scope.description = selected_item.description;
                    scope.enabled = selected_item.enabled;
                });
            }
        };
    }])
    .directive('manageProjectModal', [function () {
        return {
            restrict: 'E',
            replace: true,
            scope: {
                'modalShown': '='
            },
            templateUrl: '/static/js/templates/admin/project/manage_project.html',
            link: function (scope, elem, attrs) {
                scope.close_modal = function () {
                    scope.modalShown = false;
                }
            }
        };
    }])
    .directive('modifyQuotaModal', ['ProjectPool', 'EventCenter', function (ProjectPool, EventCenter) {
        return {
            restrict: 'E',
            replace: true,
            scope: {
                'modalShown': '='
            },
            templateUrl: '/static/js/templates/admin/project/modify_quota.html',
            link: function (scope, elem, attrs) {
                scope.get_quota = function () {
                    ProjectPool.get_list({'id': scope.$parent.selectedItems[0].id, 'action': 'get_quota'}, function (quota_data) {
                        for (var i=0; i < quota_data.length; i++) {
                            var quota = quota_data[i];
                            scope[quota.name] = quota.limit;
                        }
                    });
                };
                scope.submit = function () {
                    var data = {
                        'action': 'update_quota',
                        'injected_file_content_bytes': scope.injected_file_content_bytes,
                        'metadata_items': scope.metadata_items,
                        'injected_files': scope.injected_files,
                        'gigabytes': scope.gigabytes,
                        'ram': scope.ram,
                        'floating_ips': scope.floating_ips,
                        'instances': scope.instances,
                        'volumes': scope.volumes,
                        'cores': scope.cores
                    };
                    EventCenter.trigger('project:update_quota', scope.$parent.selectedItems[0].id, data);
                    scope.close_modal();
                };
                scope.close_modal = function () {
                    scope.modalShown = false;
                }
                scope.$on('modify_quota_shown', function () {
                    scope.get_quota();
                });
            }
        };
    }]);
