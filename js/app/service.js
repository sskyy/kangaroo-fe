'use strict';
angular.module('RestService', ['ngResource', 'AppService'])
    .factory('ApiResource', function () {
        return {
            'enabled_panels': {
                'list': '/resource/panels'
            },
            'region': {
                'list': '/resource/region/list',
            },
            'quota': {
                'list': '/resource/quota/list',
            },
            'instance': {
                'list': '/resource/instance/list',
                'detail': '/resource/instance/detail/:id',
                'console': '/resource/instance/console/',
                'vnc': '/resource/instance/vnc/'
            },
            'vm_usage': {
                'detail': '/resource/vm_usage/detail/:id',
            },
            'volume': {
                'list': '/resource/volume/list',
                'detail': '/resource/volume/detail/:id',
            },
            'flavor': {
                'list': '/resource/flavor/list',
                'detail': '/resource/flavor/detail/:id',
            },
            'image': {
                'list': '/resource/image/list',
                'detail': '/resource/image/detail/:id',
            },
            'snapshot': {
                'list': '/resource/snapshot/list',
                'detail': '/resource/snapshot/detail/:id',
            },
            'security_group': {
                'list': '/resource/security_group/list',
                'detail': '/resource/security_group/detail/:id',
            },
            'keypair': {
                'list': '/resource/keypair/list',
                'detail': '/resource/keypair/detail/:id',
                'create_keypair': '/resource/keypair/create',
            },
            'floating_ip': {
                'list': '/resource/floating_ip/list',
                'detail': '/resource/floating_ip/detail/:id',
                'list_pool': '/resource/floating_ip/list_pool',
            },
            'load_balancer': {
                'list': '/resource/load_balancer/list',
                'detail': '/resource/load_balancer/detail/:id',
            },
            'coupon_code': {
                'list': '/resource/coupon/code_list',
            },
            'coupon_log': {
                'list': '/resource/coupon/log_list',
                'remaining': '/resource/coupon/coupon_remaining',
            },
            'user_crash': {
                'list': '/resource/crash/crash_monthly_log',
                'detail': '/resource/crash/crash_monthly_detail/:id',
                'remaining': '/resource/crash/crash_remaining'
            },
            'volume_type': {
                'list': '/resource/volume_type/list',
                'detail': '/resource/volume_type/detail/:id',
            },
            'volume_snapshot': {
                'list': '/resource/volume_snapshot/list',
                'detail': '/resource/volume_snapshot/detail/:id'
            },
            'admin_node': {
                'list': '/resource/node/list',
                'detail': '/resource/node/detail/:id',
            },
            'admin_instance': {
                'list': '/resource/instance/list',
            },
            'admin_service': {
                'list': '/resource/service/list',
            },
            'admin_project': {
                'list': '/resource/project/list',
                'detail': '/resource/project/detail/:id',
            },
            'admin_user': {
                'list': '/resource/user/list',
                'detail': '/resource/user/detail/:id',
            },
            'admin_quota': {
                'list': '/resource/quota/list',
            },
            'admin_coupon': {
                'code_list': '/resource/coupon/code_list',
            },
            'admin_apply_code': {
                'list': '/resource/apply_code/list',
                'detail': '/resource/apply_code/detail/:id'
            },
        };
    })
    .factory('BaseResource', ['$resource', '$http', '$cookies', 'ApiResource',
                              function ($resource, $http, $cookies, ApiResource) {
        // base resource for all api call
        return function (resource_type, options) {
            var resource_urls, list_resource, detail_resource;
            $http.defaults.headers.common['X-CSRFToken'] = $cookies['csrftoken'];
            $http.defaults.headers.common['Content-Type'] = "application/json;charset=utf-8";

            resource_urls = ApiResource[resource_type];
            list_resource = $resource(resource_urls.list, {}, {
                save_list: {method: 'POST', isArray: true},
            });
            detail_resource = $resource(resource_urls.detail, {id: "@id"}, {
                update: {method: 'PUT'},
                action: {method: 'PUT'}
            });
            detail_resource.remove = function (id, callback, option) {
                this.delete({'id': id}, function (res) {
                    if (option && option.delay_delete) {
                        if (callback) {
                        //callback aims to emit the check_status signal
                            // console.log( id ," with delete callback.", list_resource.cache)
                            callback();
                        }
                    } else {
                        // console.log("no delay_delete")
                        list_resource._delete( id ); //delete resource from list  cache
                    }
                });
            };
            detail_resource.update_data = function (id, data, callback, option) {
                data['id'] = id
                this.update(data, function (res) {
                     if (!option) {
                         if (callback) {
                             callback(res);
                         }
                         list_resource._update_cache(id, res);
                         return;
                     }
                     var refresh = option.refresh;
                     if (refresh) {
                         detail_resource.get({'id': id}, function (res) {
                            if (callback) {
                                callback();
                            }
                            list_resource._update_cache(id, res);
                         });
                         return;
                     };
                });
            }

            list_resource.cache = null;
            list_resource.fetching = false;
            list_resource._tmp_callbacks = [];
            list_resource._update_cache = function (id, item) {
                var cache_index;
                cache_index = this._get_by_uuid(id, true).index;
                if( item == undefined ){
                    this.cache.splice( cache_index, 1 );
                }else{
                    this.cache[cache_index] = item;
                }
            };
            list_resource._get_by_uuid = function (id, cache) {
                if (cache == true) {
                    for (var i = 0 ; i < this.cache.length; i++) {
                        if ( this.cache[i] && this.cache[i].id == id) {
                            return {
                                'item': cache[i],
                                'index': i
                            };
                        }
                    }
                    return {
                        'item': null,
                        'index': null
                    };
                } else {
                    // get from server
                    var new_item;
                    new_item = detail_resource.get({'id': id});
                    this._update_cache(id, new_item);
                    return {
                        'item': item,
                        'index': null
                    };
                }
            };
            list_resource.fetch = function (params, callback) {
                // if you have a callback, must make params = {}
                params = params === undefined ? {} : params;
                var from_cache = params.from_cache;
                if (from_cache === undefined) {
                    from_cache = 2;
                }
                delete params.from_cache;

                var no_update_cache = params.no_update_cache;
                if (no_update_cache !== undefined) {
                    delete params.no_update_cache;
                }
                switch (from_cache)
                {
                    case 0:  // get from cache
                        if (typeof callback === 'function') {
                            callback(this.cache);
                        }
                        return this.cache;
                        break;
                    case 1: // get from server
                        var $this = this;
                        $this.fetching = true;
                        if( $this.cache == null ){
                            $this.cache = [];
                        }
                        this.query(params, function (res) {
                            if(no_update_cache) {
                                //don't update the cache
                            }else {
                                // update cache
                                $this.cache.splice(0, $this.cache.length);
                                for (var i=0; i < res.length; i++) {
                                    $this.cache.push(res[i]);
                                }
                            }
                            $this.fetching = false;
                            if (typeof callback === 'function') {
                                callback( $this.cache, res );
                            }
                            if( $this._tmp_callbacks.length != 0 ){
                                var _tmp_callbacks = $this._tmp_callbacks.splice(0)
                                for( var i in _tmp_callbacks ){
                                    if( typeof _tmp_callbacks[i] ==='function' ){
                                        _tmp_callbacks[i]( $this.cache, res );
                                    }
                                }
                            }
                        }, function (err) {
                            if (err.status == 403 || err.status.status == 401) {
                                window.location.reload();
                            }
                        });
                        return $this.cache;
                        break;
                    case 2: // get from cache, if nothing in cache, get from server
                        if ( this.cache !== null && !this.fetching ){
                            params.from_cache = 0;
                            return this.fetch(params, callback);
                        }
                        if( this.fetching ){
                            this._tmp_callbacks.push(callback);
                            return this.cache;
                        }
                        params.from_cache = 1;
                        return this.fetch(params, callback);
                        break;
                }
            };
            list_resource._delete = function (id) {
                var index = this._get_by_uuid(id, true).index;
                if (index !== undefined) {
                    return this.cache.splice(index, 1);
                }
                return null;
            };
            list_resource.create = function (data, options, callback) {
                var perform_callback = function (res) {
                    if (typeof(callback) == 'function') {
                        callback(res);
                    }
                }, save_data = function () {
                    list_resource.save(data, function (res) {
                        list_resource.cache.push(res);
                        perform_callback(res);
                    });
                };

                if (options) {
                    if (options.multi) {
                        // server return multi obj
                        this.save_list(data, function (res) {
                            for (var i=0; i <res.length; i++) {
                                list_resource.cache.push(res[i]);
                            }
                            perform_callback(res);
                            return;
                        });
                    } else if (options.refresh_based_on_count) {
                        // reload all data if count > 1
                        var count = data['count'];
                        if (count == 1) {
                            save_data();
                        } else {
                            list_resource.save(data, function (res) {
                                list_resource.fetch({'from_cache': 1}, perform_callback);
                            });
                        }
                        return;
                    }
                } else {
                    save_data();
                }
            };
            return {
                'list_resource': list_resource,
                'detail_resource': detail_resource,
            };
        };
    }])
    .factory('CouponCodeResource', ['BaseResource', function (BaseResource) {
        var base_resource = new BaseResource('coupon_code');
        return {
            'list_resource': base_resource.list_resource,
        }
    }])
    .factory('CouponLogResource', ['$resource', 'ApiResource', 'BaseResource',
            function ($resource, ApiResource, BaseResource) {
        var base_resource = new BaseResource('coupon_log');
        base_resource.remaining_resource = $resource(ApiResource['coupon_log']['remaining']);
        return {
            'list_resource': base_resource.list_resource,
            'remaining_resource': base_resource.remaining_resource
        }
    }])
    .factory('CrashResource', ['$resource', 'ApiResource', 'BaseResource', function ($resource, ApiResource, BaseResource) {
        var base_resource;
        base_resource = new BaseResource('user_crash');
        base_resource.remaining_resource = $resource(ApiResource['user_crash']['remaining']);
        return {
            'list_resource':  base_resource.list_resource,
            'detail_resource': base_resource.detail_resource,
            'remaining_resource': base_resource.remaining_resource
        };
    }])
    .factory('PanelGroupsResource', ['BaseResource', function (BaseResource) {
        var PanelGroups;
        PanelGroups = new BaseResource('enabled_panels').list_resource;
        return PanelGroups;
    }])
    .factory('RegionsResource', ['BaseResource', function (BaseResource) {
        var base_resource = new BaseResource('region');
        return {
            'list_resource': base_resource.list_resource,
            'detail_resource': base_resource.detail_resource
        };
    }])
    .factory('QuotasResource', ['BaseResource', function (BaseResource) {
        var list_resource;
        list_resource = new BaseResource('quota').list_resource;
        return {
            'list_resource': list_resource,
        };
    }])
    .factory('InstancesResource', ['BaseResource', function (BaseResource) {
        var base_resource = new BaseResource('instance');
        base_resource = new BaseResource('instance');
        return {
            'list_resource': base_resource.list_resource,
            'detail_resource': base_resource.detail_resource
        };
    }])
    .factory('VmUsagesResource', ['BaseResource', function (BaseResource) {
        var base_resource;
        base_resource = new BaseResource('vm_usage');
        return {
            'detail_resource': base_resource.detail_resource,
        };
    }])
    .factory('VolumesResource', ['BaseResource', function (BaseResource) {
        var base_resource;
        base_resource = new BaseResource('volume');
        return {
            'list_resource': base_resource.list_resource,
            'detail_resource': base_resource.detail_resource
        }
    }])
    .factory('VolumeTypesResource', ['BaseResource', function (BaseResource) {
        var base_resource;
        base_resource = new BaseResource('volume_type');
        return {
            'list_resource': base_resource.list_resource,
            'detail_resource': base_resource.detail_resource
        };
    }])
    .factory('VolumeSnapshotsResource', ['BaseResource', function (BaseResource) {
        var base_resource;
        base_resource = new BaseResource('volume_snapshot');
        return {
            'list_resource': base_resource.list_resource,
            'detail_resource': base_resource.detail_resource
        }
    }])
    .factory('FlavorsResource', ['BaseResource', function (BaseResource) {
        var base_resource;
        base_resource = new BaseResource('flavor');
        return {
            'list_resource': base_resource.list_resource,
            'detail_resource': base_resource.detail_resource
        }
    }])
    .factory('ImagesResource', ['BaseResource', function (BaseResource) {
        var base_resource;
        base_resource = new BaseResource('image');
        return {
            'list_resource': base_resource.list_resource,
            'detail_resource': base_resource.detail_resource
        };
    }])
    .factory('SnapshotsResource', ['BaseResource', function (BaseResource) {
        var base_resource;
        base_resource = new BaseResource('snapshot');
        return {
            'list_resource': base_resource.list_resource,
            'detail_resource': base_resource.detail_resource
        };
    }])
    .factory('SecurityGroupsResource', ['BaseResource', function (BaseResource) {
        var base_resource;
        base_resource = new BaseResource('security_group');
        return {
            'list_resource': base_resource.list_resource,
            'detail_resource': base_resource.detail_resource
        };
    }])
    .factory('KeypairsResource', ['BaseResource', function (BaseResource) {
        var base_resource;
        base_resource = new BaseResource('keypair');
        return {
            'list_resource': base_resource.list_resource,
            'detail_resource': base_resource.detail_resource
        };
    }])
    .factory('FloatingIpsResource', ['BaseResource', '$resource', 'ApiResource',
            function (BaseResource, $resource, ApiResource) {
        var base_resource;
        base_resource = new BaseResource('floating_ip');
        base_resource.pool_resource = $resource(ApiResource['floating_ip'].list_pool);
        return {
            'list_resource': base_resource.list_resource,
            'detail_resource': base_resource.detail_resource,
            'pool_resource': base_resource.pool_resource
        };
    }]).
    factory('LoadBalancersResource', ['BaseResource', function (BaseResource) {
        var base_resource;
        base_resource = new BaseResource('load_balancer');
        return {
            'list_resource': base_resource.list_resource,
            'detail_resource': base_resource.detail_resource
        };
    }])
    .factory('AdminNodesResource', ['BaseResource', function (BaseResource) {
        var base_resource;
        base_resource = new BaseResource('admin_node');
        return {
            'list_resource': base_resource.list_resource,
            'detail_resource': base_resource.detail_resource
        };
    }])
    .factory('AdminInstancesResource', ['BaseResource', function (BaseResource) {
        var list_resource;
        list_resource = new BaseResource('admin_instance').list_resource;
        return {
            'list_resource': list_resource,
        };
    }])
    .factory('AdminServicesResource', ['BaseResource', function (BaseResource) {
        var list_resource;
        list_resource = new BaseResource('admin_service').list_resource;
        return {
            'list_resource': list_resource,
        };
    }])
    .factory('AdminProjectsResource', ['BaseResource', function (BaseResource) {
        var base_resource;
        base_resource = new BaseResource('admin_project');
        return {
            'list_resource': base_resource.list_resource,
            'detail_resource': base_resource.detail_resource
        };
    }])
    .factory('AdminUsersResource', ['BaseResource', function (BaseResource) {
        var base_resource;
        base_resource = new BaseResource('admin_user');
        return {
            'list_resource': base_resource.list_resource,
            'detail_resource': base_resource.detail_resource
        }
    }])
    .factory('AdminQuotasResource', ['BaseResource', function (BaseResource) {
        var list_resource;
        list_resource = new BaseResource('admin_quota').list_resource;
        return {
            'list_resource': list_resource,
        };
    }])
    .factory('AdminApplyCodesResource', ['BaseResource', function (BaseResource) {
        var base_resource;
        base_resource = new BaseResource('admin_apply_code');
        return {
            'list_resource': base_resource.list_resource,
            'detail_resource': base_resource.detail_resource
        };
    }]);


angular.module('AppService', ['AppFilter'])
    .factory('init_quotas', function () {
        //init quotas: xxx:{'used': xxx, 'limit': xxx}
        return function (needed_quotas, quota_data) {
            var quotas = {};

            for (var i = 0; i < needed_quotas.length; i++) {
                quotas[needed_quotas[i]] = {'raw_used': null, 'raw_limit': null};
            }

            for (var i = 0;i < quota_data.length; i++) {
                var quota = quota_data[i];
                if (quotas[quota.name] !== undefined) {
                    quotas[quota.name]['raw_limit'] = quota.limit;
                }
            }
            return quotas;
        };
    })
    .factory('get_instance_quotas', function () {
        // include cores, instances, gigabytes, ram
        return function (quotas, instances) {
            quotas['instances']['raw_used'] = instances.length;
            var cores = 0, gigabytes = 0, ram = 0;
            for (var i = 0; i < instances.length; i++) {
                cores += instances[i].flavor.vcpus;
                ram += instances[i].flavor.ram;
            }
            quotas['cores']['raw_used'] = cores;
            quotas['ram']['raw_used'] = ram;
            return quotas;
        };
    })
    .factory('combine_instance_flavor', function () {
        // combine instance and flavor based on flavor id
        return function (instances, flavors) {
            for (var i = 0; i < instances.length; i++) {
                var instance = instances[i],
                    flavor_id = instance.flavor.id;
                for (var j = 0; j < flavors.length; j++) {
                    var flavor = flavors[j];
                    if (flavor.id == flavor_id) {
                        instance.flavor = flavor;
                    }
                }
            }
            return instances;
        };
    })
    .factory('date_formatter', function() {
        // console.log('load date formatter service');
        Date.prototype.format = function(format) {
            var o = {
                "M+": this.getMonth() + 1,
                //month
                "d+": this.getDate(),
                //day
                "h+": this.getHours(),
                //hour
                "m+": this.getMinutes(),
                //minute
                "s+": this.getSeconds(),
                //second
                "q+": Math.floor((this.getMonth() + 3) / 3),
                //quarter
                "S": this.getMilliseconds() //millisecond
            }
            if(/(y+)/.test(format)) format = format.replace(RegExp.$1, (this.getFullYear() + "").substr(4 - RegExp.$1.length));
            for(var k in o) if(new RegExp("(" + k + ")").test(format)) format = format.replace(RegExp.$1, RegExp.$1.length == 1 ? o[k] : ("00" + o[k]).substr(("" + o[k]).length));
            return format;
        }
        return function() {};
    })
    .factory('check_status', function () {
        return {
            instance_status_stable: function (status) {
               var stable_status = ['active', 'sleeping', 'error'];
               if (stable_status.indexOf(status) != -1) {
                   return true;
               }
               return false;
            },
            image_status_stable: function (status) {
                var stable_status = ['active', 'error'];
                if (stable_status.indexOf(status) != -1) {
                    return true;
                }
                return false;
            },
            lb_status_stable: function (status) {
                var stable_status = ['active', 'error'];
                if (stable_status.indexOf(status) != -1) {
                    return true;
                }
                return false;
            },
            volume_snapshot_status_stable: function (status) {
                var stable_status = ['active', 'error'];
                if (stable_status.indexOf(status) != -1) {
                    return true;
                }
                return false;
            },
            volume_status_stable: function (status) {
                var stable_status = ['active', 'error', 'sleeping'];
                if (stable_status.indexOf(status) != -1) {
                    return true;
                }
                return false;
            }
        };
    })
    .factory('is_dough_enabled', ['$cookies', function ($cookies) {
        return function () {
            if ($cookies.dough_enabled == 'True') return true;
            return false;
        };
    }])
    .factory('is_kanyun_enabled', ['$cookies', function ($cookies) {
        return function () {
            if ($cookies.kanyun_enabled == 'True') return true;
            return false;
        };
    }])
    .factory('is_loadbalance_enabled', ['$cookies', function ($cookies) {
        return function () {
            if ($cookies.loadbalance_enabled == 'True') return true;
            return false;
        };
    }])
    .factory('form_valid', function () {
        return function (elem) {
            var form = $(elem);
            var inputs = form.find('input.ng-invalid');
            return inputs.length == 0? true: false;
        };
    })
    .factory('redirect', ['$timeout', '$location', function ($timeout, $location) {
        return function (path) {
            if (path != $location.path()) {
                $timeout(function () {$location.path(path)}, 500);
            }
        };
    }]);
