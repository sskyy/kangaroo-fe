app_module.controller('user.InstanceCtrl',
    ['$scope', '$filter', 'ApiList', 'InstancePool',
     'FlavorsResource', 'combine_instance_flavor',
     'is_dough_enabled', 'is_loadbalance_enabled', 'is_kanyun_enabled',
     'EventCenter','InstanceCreate',
     function ($scope, $filter, ApiList, InstancePool,
               FlavorsResource, combine_instance_flavor, 
               is_dough_enabled, is_loadbalance_enabled,
               is_kanyun_enabled, EventCenter, InstanceCreate) {

        $scope.$emit('load_start');
        $scope.instances = InstancePool.fetch(function (res) {
            $scope.$emit('load_complete');
            return res;
        });

        $scope.launch_instance_shown = false;
        $scope.connect_instance_shown = false;
        //related to directive
        $scope.createInstance = function(){
            var newInstance = InstanceCreate()
            console.log( newInstance );
        }

        //code under here will be deprated.

        $scope.open_launch_instance = function () {
            $scope.launch_instance_shown = true;
        };

        $scope.open_connect_instance = function () {
            $scope.connect_instance_shown = true;
        };

        $scope.open_edit_instance = function () {
            $scope.edit_instance_shown = true;
        };

        $scope.open_console_output = function  () {
            window.open(ApiList.get('instance', 'console') + $scope.selectedItems[0].id);
        };

        $scope.open_take_snapshot = function () {
            $scope.take_snapshot_shown = true;
        };

        $scope.open_confirm_dialog = function () {
            $scope.confirm_dialog_shown = true;
        };
        
        //actions on instance
        $scope.delete_instances = function () {
            angular.forEach( $scope.selectedItems, function( selected ) {
              EventCenter.trigger('instance:remove', selected.id);
            });
        };

        $scope.action_on_instance = function (option) {
            var type = option.type, data;
            var selected = $scope.selectedItems[0];
            if (type == 'toggle_pause') {
                if (selected.status == 'paused') {
                    data = {'action': 'unpause'};
                } else {
                    data = {'action': 'pause'};
                }
            } else if (type == 'toggle_suspend') {
                if (selected.status == 'suspended') {
                    data = {'action': 'resume'};
                } else {
                    data = {'action': 'suspend'};
                }
            } else if (type == "reboot") {
                data = {'action': 'reboot'};
            } else if (type == "toggle_stop") {
                if (selected.status == 'shutoff') {
                    data = {'action': 'start'};
                } else {
                    data = {'action': 'stop'};
                }
            }
            angular.forEach($scope.selectedItems, function (selected) {
                data.id = selected.id;
                EventCenter.trigger("instance:action_on_instance", selected.id, data);
            });
        };

        $scope.check_action_disabled = function (option) {
            var type = option.type;

            if ($scope.selectedItems.length === 0) return true;
            var selected = $scope.selectedItems[0];
            if (['building', 'deleting', 'transition', 'error'].indexOf(selected.abs_status) != -1) {
                return true;
            }

            if (type == 'reboot') {
                return false;
            }

            if ($scope.selectedItems.length != 1) {
                return true;
            }

            //only active and  sleeping status make sense
            if (type == 'take_snapshot' || type == 'view_log') {
                if (selected.status !== 'active') {
                    return true;
                }
            } else if (type == 'toggle_pause') {
                if (['paused', 'active'].indexOf(selected.status) == -1) {
                    return true;
                } 
            } else if (type == 'toggle_suspend') {
                if (['suspended', 'active'].indexOf(selected.status) == -1) {
                    return true;
                }
            } else if (type == 'toggle_stop') {
                if (['shutoff', 'active'].indexOf(selected.status) == -1) {
                    return true;
                }
            }
            return false;
        };

        // for grid options
        var copyFilterOptions = {
            anGridCopyFn:'copy_text',
            anGridCopyClass:'ZeroClipboardBtn',
            anGridCopyInitFn:'copy_init'
        };

        var columnDefs = [
                            {field: 'name', displayName: 'Name'},
                            {field: 'private_ip', displayName: 'Private Ip'},
                            {field: 'abs_status', displayName: 'Status', columnFilter: 'status_icon_filter'},
                            {field: 'flavor', displayName: 'Flavor', columnFilter: 'flavor_filter'},
                            {field: 'image', displayName: 'OS', columnFilter: 'distri_filter'},
                            {field: 'security_groups', displayName: 'Security Groups', columnFilter:'sg_filter'},
                            // {field: 'key_name', displayName: 'Key Name'}
                         //{field: 'power_state', displayName: 'Power'},
                         //{field: 'task_state', displayName: 'Task State'},
                         ];
        if (is_loadbalance_enabled()) {
            // columnDefs.push({field: 'ssh_domain', displayName: 'Public Domain', columnTemplete: $filter('anGrid_copy_filter')(copyFilterOptions)});
            columnDefs.push({field: 'ssh_domain', displayName: 'Public Domain'});
        }

        // columnDefs.push({field: 'id', displayName: 'Actions', columnTemplete:$filter('operation_connect_filter')()});

        $scope.selectedItems = [];
        $scope.gridOptions = {
            angridStyle: "th-list",
            multiSelectWithCheckbox: true,
            data: "instances",
            columnDefs: columnDefs,
            selectedItems: $scope.selectedItems,
        };

        $scope[copyFilterOptions.anGridCopyInitFn] = function( $last ){
            window.setTimeout(function(){
                var Eles = angular.element('.'+copyFilterOptions.anGridCopyClass);
                if( Eles.length != 0 ){
                    Eles.each(function(){
                        var _clip = new ZeroClipboard();

                        _clip.on('mousedown', function(client, args){

                            var scope = angular.element(this).scope()
                            _clip.setText( angular.element(this).scope().rowData.ssh_domain);
                            angular.element( this ).click();

                        });


                        _clip.on('complete', function( client,args){
                            console.log( args.text);
                            alert( $filter('i18n')('Copy Success') );
                        })
                        _clip.glue( angular.element(this) );
                    });
                }
            })
        }

        $scope[copyFilterOptions.anGridCopyFn] = function( e, text ){
            e.stopPropagation();
        }


        $scope.$watch('gridOptions.selectedItems', function (newValue) {
            $scope.selectedItems = newValue;
            if($scope.selectedItems.length == 0)
                return;
            $scope.displayItem = $scope.selectedItems[0];
            $scope.selected_uuid = $scope.selectedItems[0].id
        });

        $scope.time_ranges = [{'value': 60, 'name': '1 hour'},
                              {'value': 360, 'name': '6 hours'},
                              {'value': 1440, 'name': '1 day'},
                              {'value': 10080, 'name': '1 week'}];
        $scope.time_range = $scope.time_ranges[1].value;

        $scope.time_periods = [{'value': 1, 'name': '1 min'},
                               {'value': 5, 'name': '5 mins'},
                               {'value': 60, 'name': '60 mins'},
                               {'value': 360, 'name': '6 hours'}];
        $scope.time_period = $scope.time_periods[1].value;

        $scope.$on('popheight', function () {
            if (is_kanyun_enabled()) {
                setTimeout(function () {
                    angular.element($('#cpu_chart')).scope().render();
                }, 2000);

                setTimeout(function () {
                    angular.element($('#blk_read_chart')).scope().render();
                }, 2000);

                setTimeout(function () {
                    angular.element($('#blk_write_chart')).scope().render();
                }, 2000);

                setTimeout(function () {
                    angular.element($('#vmnetwork_chart')).scope().render();
                }, 2000);

                setTimeout(function () {
                    angular.element($('#nic_incoming_chart')).scope().render();
                }, 2000);

                setTimeout(function () {
                    angular.element($('#nic_outgoing_chart')).scope().render();
                }, 2000);
            }
        });

        $scope.$on('cache_change:instance', function () {
          $scope.instances = InstancePool.fetch();
        });
}]);
