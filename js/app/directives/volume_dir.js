app_directives
    .directive('createVt', ['EventCenter', function (EventCenter) {
        return {
            restrict: 'E',
            replace: true,
            scope: {
                modalShown: "="
            },
            templateUrl: '/static/js/templates/admin/volume/create_vt.html',
            link: function (scope, elem, attrs) {
                scope.closeModal = function () {
                    scope.modalShown = false;
                };
                scope.submit = function () {
                  EventCenter.trigger('volume_type:create', {'name': scope.name});
                  scope.closeModal();
                };
            }
        };
    }])
    .directive('vtExist', ['VolumeTypePool', function (VolumeTypePool) {
      return {
        restrict: 'A',
        require: 'ngModel',
        link: function (scope, elem, attrs, ctrl) {
          scope.vt_name_valid = function (name) {
            var valid = VolumeTypePool.fetch(function (vts) {
              for(var i=0; i < vts.length; i++) {
                if (vts[i].name == name) return false;
              }
              return true;
            });
            return valid;
          };

          ctrl.$parsers.unshift(function (value) {
            if (scope.vt_name_valid(value)) {
              ctrl.$setValidity('vt_exit', true);
              return value;
            }
            ctrl.$setValidity('vt_exit', false);
            return value;
          });
        }
      }
    }])
    .directive('createVolume',
        ['redirect', 'VolumePool', 'VolumeTypePool',
         'VolumeSnapshotPool', 'form_valid', 'EventCenter',
          function (redirect, VolumePool, VolumeTypePool,
                    VolumeSnapshotPool, form_valid,
                    EventCenter) {
        return {
            restrict: 'E',
            replace: true,
            scope: {
                modalShown: '=',
                createFromSnapshot: '@'
            },
            templateUrl: '/static/js/templates/project/volume/create_volume.html',
            link: function (scope, elem, attr) {
                scope.closeModal = function () {
                    scope.modalShown = false;
                };
                VolumePool.fetch();
                scope.submit = function () {
                    var data = {
                        name: scope.name,
                        description: scope.description,
                        volume_type: scope.volume_type,
                        size: scope.size      
                    };
                    if (scope._createFromSnapshot) {
                        data['snapshot_id'] = scope.snapshot_id;
                    };
                    EventCenter.trigger('volume:create', data);
                    scope.closeModal();
                    if (scope._createFromSnapshot) {
                      redirect('/app/volume');
                    }
                };
                scope.volume_types = VolumeTypePool.fetch();
                scope.form_invalid = function () {
                    return scope.volume_type === undefined? true :false;
                };
                scope._createFromSnapshot = eval(attr.createFromSnapshot || false);
                scope.$watch('modalShown', function (newVal) {
                    if (!newVal) return;
                    if (!scope.createFromSnapshot) return;
                    scope.volume_snapshots = [];
                    VolumeSnapshotPool.fetch(function (vs_list) {
                        angular.forEach(vs_list, function (snapshot) {
                            if (snapshot.id == scope.$parent.selectedItems[0].id) {
                                this.push({'id': snapshot.id, 'name': snapshot.name + "("+ snapshot.size + "GB)"});
                                scope.snapshot_id = snapshot.id;
                            }
                        }, scope.volume_snapshots);
                    });
                });
            }
        };
    }])
    .directive('editAttachment', ['InstancePool', 'EventCenter', function (InstancePool, EventCenter) {
        return {
            restrict: 'E',
            replace: true,
            scope: {
                modalShown: '=',
            },
            templateUrl: '/static/js/templates/project/volume/edit_attachment.html',
            link: function (scope, elem, attr) {
                scope.closeModal = function () {scope.modalShown = false;}
                scope.form_invalid = function () {
                    return scope.instance_id === undefined ? true : false;
                };
                scope.submit = function () {
                    var id = scope.$parent.selectedItems[0].id;
                    var data = {action: 'attach',
                                instance_id: scope.instance_id,
                                device: scope.device,
                                id: id};
                    EventCenter.trigger('volume:attach', id, data);
                    scope.closeModal();
                }
                scope.$watch('modalShown', function (newVal) {
                    if (!newVal) return ;
                    InstancePool.fetch(function (res) {
                        scope.instance_list = res;
                    });
                });
            }
        };
    }])
    .directive('editDetachment', ['EventCenter', function (EventCenter) {
        return {
            restrict: 'E',
            replace: true,
            scope: {
                modalShown: '=',
            },
            templateUrl: '/static/js/templates/project/volume/edit_detachment.html',
            link: function (scope, elem, attr) {
                scope.closeModal = function () {scope.modalShown = false};
                scope.submit = function () {
                    var selected = scope.$parent.selectedItems[0];
                    var data = {action: 'detach',
                                instance_id: selected.attachments[0].server_id,
                                id: selected.id};
                    EventCenter.trigger('volume:detach', selected.id, data);
                    scope.closeModal();
                };
                scope.$watch('modalShown', function (val) {
                    if (!val) return;
                    var attachment = scope.$parent.selectedItems[0].attachments[0];
                    scope.instance_name = attachment.instance_name;
                    scope.device = attachment.device;
                });
            }
        };
    }])
    .directive('createVolumeSnapshot', ['redirect', 'VolumeSnapshotPool', 'EventCenter', function (redirect, VolumeSnapshotPool, EventCenter) {
        return {
            restrict: 'E',
            replace: true,
            scope: {
                modalShown: '=',
            },
            templateUrl: '/static/js/templates/project/volume/create_volume_snapshot.html',
            link: function (scope, elem, attr) {
                VolumeSnapshotPool.fetch(); // for create action
                scope.closeModal = function () {scope.modalShown = false;}
                scope.submit = function () {
                    var data = {volume_id: scope.$parent.selectedItems[0].id,
                                name: scope.name,
                                description: scope.description};
                    //VolumeSnapshotsResource.list_resource.create(data, null, function () {
                    //    redirect('/app/volume_snapshot');
                    //});
                    EventCenter.trigger('volume_snapshot:create', data);
                    scope.closeModal();
                };
            }
        };
    }]);
