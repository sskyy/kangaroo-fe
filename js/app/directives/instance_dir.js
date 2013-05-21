app_directives
    .directive('launchInstance', ['$filter', 'combine_instance_flavor', 'init_quotas', 'get_instance_quotas', 'is_dough_enabled',
                                  'VolumePool', 'QuotaPool', 'SnapshotPool', 'ImagePool',
                                  'KeypairPool', 'SgPool', 'InstancePool', 'FlavorPool', 'CouponLogResource',
                                  'CrashResource', 'EventCenter',
                                  function ($filter, combine_instance_flavor, init_quotas, get_instance_quotas, is_dough_enabled,
                                            VolumePool, QuotaPool, SnapshotPool, ImagePool,
                                            KeypairPool, SgPool, InstancePool,
                                            FlavorPool, CouponLogResource, CrashResource,
                                            EventCenter) {
        return {
            restrict: 'E',
            replace: true,
            scope: {
                modalShown: "=launchInstanceShown",
            },
            templateUrl: "/static/js/templates/project/instance/launch_instance.html",
            link: function (scope, elem, attrs) {
                scope.snapshots = [];
                scope.images = [];
                scope.payment_type='hourly';
                scope.snapshots = SnapshotPool.fetch(function (snapshots) {
                    (snapshots.length > 0) && (scope.snapshot_uuid = snapshots[0].id);
                    return snapshots;
                });
                scope.images = ImagePool.fetch(function (images) {
                    (images.length > 0) && (scope.image_uuid = images[0].id);
                    return images;
                });
                scope.keypairs = KeypairPool.fetch(function (keypairs) {
                    (keypairs.length > 0) && (scope.instance_keypair = keypairs[0]);
                    return keypairs;
                });

                scope.$on('cache_change:keypair', function () {
                  scope.keypairs = KeypairPool.fetch();
                });
                
                scope.security_groups = SgPool.fetch();
                scope.$on('cache_change:sg', function () {
                  scope.security_groups = SgPool.fetch();
                });
                QuotaPool.fetch(function (quotas) {
                    scope.quotas = init_quotas(['instances', 'cores', 'gigabytes', 'ram'], quotas)
                    InstancePool.fetch(function( instances ){
                        scope.instances = instances;
                        scope.quotas = get_instance_quotas(scope.quotas, scope.instances);

                        scope.availableInstance = scope.quotas['instances']['raw_limit'] - scope.quotas['instances']['raw_used'];
                        VolumePool.fetch(function (volumes) {
                            var size = 0;
                            for (var i = 0; i < volumes.length; i++) {
                                size += volumes[i].size;
                            }
                            scope.quotas['gigabytes']['raw_used'] = size;
                        });
                    });
                });

                scope.$watch('modalShown', function (newValue) {
                    if (!newValue)
                        return;

                    if (is_dough_enabled()) {
                        CouponLogResource.remaining_resource.get(function (res) {
                            scope.coupon_remaining = res['remaining']
                        });

                        CrashResource.remaining_resource.get(function (res) {
                            scope.balance_remaining = res['remaining']
                        });
                    }

                });

                scope.is_dough_enabled = is_dough_enabled();

                scope.unable_to_create_instance = function (form) {
                    var flavor_invalid = form.instance_flavor.$invalid,
                        name_invalid = form.instance_name.$invalid,
                        keypair_invalid = form.instance_keypair.$invalid;
                    var need_keypair = scope.need_keypair();
                    if (!need_keypair) {
                        keypair_invalid = false;
                    }
                    if (flavor_invalid || name_invalid || keypair_invalid) {
                        return true;
                    }
                    if (is_dough_enabled()) {
                        var current_remaining = scope.coupon_remaining + scope.balance_remaining;
                        if (scope.current_charge() > current_remaining) {
                            return true;
                        }
                    }
                    return false;
                };
            

                scope.create_instance = function () {
                    var instance_name = scope.instance_name,
                        flavor_uuid = scope.flavorSelected.id,
                        user_data = scope.user_data, 
                        security_groups = scope.instance_sg,
                        instance_count = scope.instance_copies,
                        product_id,
                        image_uuid,
                        need_keypair = scope.need_keypair();
                    if (scope.user_image_type == 'image'){
                        image_uuid = scope.image_uuid;
                    } else {
                        image_uuid = scope.snapshot_uuid;
                    }

                    if (is_dough_enabled()) {
                        product_id = scope.flavorSelected.product_info[scope.payment_type].product_id;
                    }

                    var data = {
                        'name': instance_name,
                        'image_uuid': image_uuid,
                        'flavor_uuid': flavor_uuid,
                        'user_data': user_data,
                        'security_groups': security_groups,
                        'count': instance_count,
                        'product_id': product_id
                    };
                    if (need_keypair) {
                        data['key_uuid'] = scope.instance_keypair.id;
                    }
                    EventCenter.trigger('instance:create', data);
                    scope.close_modal();
                };


                scope.close_modal = function () {
                    // close the dialog
                    scope.modalShown = false;
                };
                scope.$on('launch_instance_with_snapshot', function (targetScope, 
                            currentScope) {
                        scope.user_image_type = "snapshot";
                        scope.snapshot_uuid = currentScope.id;
                });
                scope.$on('launch_instance_with_image', function (targetScope,
                            currentScope) {
                        scope.user_image_type = 'image';
                        scope.image_uuid = currentScope.id;
                });
                scope.$watch('availableInstance', function (new_value, old_value) {
                    scope.instanceCopies = [];
                    for (var i = 1; i <= new_value; i++) {
                        scope.instanceCopies.push(i);
                    }
                    scope.instance_copies = scope.instanceCopies[0];
                });

                scope.flavor_price = function () {
                    if (!is_dough_enabled()) return '';
                    // calcute flavor  price based on payment_type & flavor
                    if (!scope.flavorSelected) {
                        return;
                    }
                    var product =  scope.flavorSelected.product_info[scope.payment_type];
                    return product.price + product.currency + '/' + product.order_unit;
                };

                scope.current_charge = function () {
                    if (!is_dough_enabled()) return 0;
                    if (!scope.flavorSelected) {
                        return;
                    }
                    var product = scope.flavorSelected.product_info[scope.payment_type];
                    return product.price * scope.instance_copies;
                };

                scope.need_keypair = function () {
                    if (scope.images.length == 0) {
                        return true;
                    }
                    if (scope.user_image_type == "image") {
                        var id = scope.image_uuid;
                        var image = null;
                        for (var i=0; i < scope.images.length; i++) {
                            if (scope.images[i].id == id) {
                                image = scope.images[i];
                            }
                        }
                        if (image.os_type == 'windows') {
                            return false;
                        }
                    }
                    return true;
                };

                scope.open_create_sg_modal = function () {
                    scope.sg_modal_shown = true;
                    scope.update_sg = false;
                };
                scope.open_create_keypair_modal = function () {
                    scope.keypair_modal_shown = true;
                    scope.import_keypair = false;
                };
            }
        };
    }])
    .directive('connectInstance', ['$filter', 'ApiList', function ($filter, ApiList) {
        var linker = function (scope, elem, attrs) {
            scope.initTab = navigator.userAgent.indexOf("Window")>0?"windows":"linux";
            var vnc_url = ApiList.get('instance', 'vnc');
            scope.$watch('modalShown', function (newValue) {
                if (!newValue) return;
                scope.keypair = scope.$parent.selectedItems[0].key_name;
                scope.vnc_url = vnc_url + scope.$parent.selectedItems[0].id;
                var ssh_domain = scope.$parent.selectedItems[0].ssh_domain,
                    tmp = ssh_domain.split(':')
                scope.domain = tmp[0];
                scope.port = tmp[1];
            });

            scope.open_vnc = function () {
                window.open(scope.vnc_url);
            };

            scope.closeModal = function () {
                scope.modalShown = false;
            };
            var ngModel = elem.controller('ngModel')
            ngModel.$viewValue = scope.initTab;
            ngModel.$render();
        };
        return {
            restrict: 'E',
            replace: true,
            scope: {
                modalShown: "=",
            },
            templateUrl: "/static/js/templates/project/instance/connect_instance.html",
            link : linker
        }
    }])
	.directive('dropdowntable', ['is_dough_enabled', 'FlavorPool', function(is_dough_enabled, FlavorPool) {
	    return {
            restrict: 'E',
            transclude: true,
            scope: {
            	flavorSelected : '='//object, return select object
            },
            link: function(scope, element) {
                scope.thead = ['name', 'VCPU', 'disk', 'ephemeral', 'ram'];
                scope.data_attr_name = ['name', 'vcpus', 'disk', 'ephemeral', 'ram'];
                if (is_dough_enabled()) {
                    scope.thead.push('hourly', 'monthly');
                    scope.data_attr_name.push('hourly', 'monthly');
                }
                FlavorPool.fetch(function (flavors) {
                  scope.data = [];
                  for (var i=0; i < flavors.length; i++) {
                        var flavor = {'name': flavors[i].name,
                                      'vcpus': flavors[i].vcpus,
                                      'disk': flavors[i].disk,
                                      'ephemeral': flavors[i].ephemeral,
                                      'ram': flavors[i].ram,
                                      'origin_flavor': flavors[i]};
                        if (flavors[i].product_info != null) { //this means dough is available, add price column
                            var hourly = flavors[i].product_info.hourly.price + ' ' + flavors[i].product_info.hourly.currency,
                                monthly = flavors[i].product_info.monthly.price + ' ' + flavors[i].product_info.monthly.currency;
                            flavor['hourly'] = hourly;
                            flavor['monthly'] = monthly;
                        }
                        scope.data.push(flavor);
                    }
                });
                scope.selecting = function(obj){
                    scope.select_show = false;
                    scope.select_value = obj[scope.data_attr_name[0]];
                    scope.flavorSelected = obj.origin_flavor;
                }
            },
            template:
            '<div>' +
            '<input type="text" name="instance_flavor" class="dropdown-select" ng-model="select_value" ng-init="select_show=false" ng-click="select_show=true" readonly="readonly" required>' +
            	'<div  class="dropdown-select-wrapper">' +
                '<table class="dropdown-select-table" ng-show="select_show" ng-model="select_show">' +
                    '<thead>' +
                        '<tr>' +
                            '<th ng-repeat="head in thead">{{head}}</th>' +
                        '</tr>' +
                    '</thead>' +
                    '<tbody>' +
                        '<tr ng-repeat="flavor in data" ng-click="selecting(flavor)">' +
                        	'<td ng-repeat="key in data_attr_name">{{flavor[key]}}</td>' +
                        '</tr>' +
                    '</tbody>' +
                '</table>' +
            '</div>' +
            '</div>',
            replace: true
	    };
    }])
    .directive('editInstance', ['EventCenter', function (EventCenter) {
        return {
            restrict: 'E',
            replace: true,
            scope: {
                modalShown: '=',
            },
            templateUrl: '/static/js/templates/project/instance/edit_instance.html',
            link: function (scope, elem, attr) {
                scope.submit = function () {
                    var data = {'name': scope.name, 'action': 'update'};
                    EventCenter.trigger('instance:action_on_instance', scope.$parent.selectedItems[0].id, data);
                    scope.close_modal();
                };
                scope.close_modal = function () {
                    scope.modalShown = false;
                };
                scope.$watch('modalShown', function (newValue) {
                    if  (newValue) {
                        var selected = scope.$parent.selectedItems[0];
                        scope.name = selected.name;
                    }
                });
            }
        };
    }])
    .directive('takeSnapshot', ['EventCenter', function (EventCenter) {
        return {
            restrict: 'E',
            replace: true,
            scope: {
                modalShown: '=',
            },
            templateUrl: '/static/js/templates/project/instance/take_snapshot.html',
            link: function (scope, elem, attr) {
                scope.submit = function () {
                    var data = {'name': scope.name ,
                                'instance_id': scope.$parent.selectedItems[0].id};
                    EventCenter.trigger('snapshot:create', data);
                    scope.close_modal();
                };
                scope.close_modal = function () {
                    scope.modalShown = false;
                };
            }
        };
    }])
    .factory('InstanceCreate',function( CommonDialog ){
        return function(){
            return CommonDialog({name:'Create Instance', directive:'create-instance'})
        }
    })
    .controller("createInstanceCtrl",function($scope){
        $scope.id = "this is my id"
        $scope.say = function(){console.log("this is mine own")};
    })
    .directive('createInstance', function(){
        return {
            controller : 'createInstanceCtrl',
            templateUrl: "/static/js/templates/project/instance/create_instance.html",
            link : function(){

            }
        }
    })

