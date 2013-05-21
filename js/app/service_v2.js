angular.module('RestServiceV2', ['CommonService'])
    .factory('I18nResource', ['$resource', 'ApiResource', function ($resource, ApiResource) {
        // base resource for i18n call
        var lang_resources = {
            'zh_CN' : $resource('/static/js/app/locale/zh_CN.json'),
            'en_US' : $resource('/static/js/app/locale/en_US.json')
        };

        return function (locale) {
            var locale = lang_resources[locale] !== undefined ? 
                        locale : 'zh_CN';
            if(typeof lang_resources[locale] === 'function')
                lang_resources[locale] = lang_resources[locale].get();
            return lang_resources[locale];
        };
    }])
  .factory('ApiList', function () {
    var urls = {
        'panel': {
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
        'sg': {
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
        'floating_ip_pool': {
          'list': '/resource/floating_ip/list_pool'
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
        'service': {
          'list': '/resource/service/list',
      },
        'project': {
          'list': '/resource/project/list',
          'detail': '/resource/project/detail/:id',
      },
        'user': {
          'list': '/resource/user/list',
          'detail': '/resource/user/detail/:id',
      },
        'admin_coupon': {
          'code_list': '/resource/coupon/code_list',
      },
        'apply_code': {
          'list': '/resource/apply_code/list',
          'detail': '/resource/apply_code/detail/:id'
      },
        'user_metadata': {
          'ui_config': '/resource/user_metadata/ui_config'
      },
        'project_usage': {
          'list': '/resource/project_usage/list',
          'detail': '/resource/project_usage/detail/:id',
      }
    };
    return {
      get: function (name/*resource name*/, resource_type/*default to list type*/) {
        resource_type = resource_type?resource_type:'list';
        return urls[name][resource_type];
      }
    };
  })
  .factory('CacheService', ['$rootScope', function ($rootScope) {
    var caches = {};

    var cacheFactory = function (cacheId, options) {
      if (cacheId in caches) {
        throw Error('cacheId ' + cacheId + ' taken');
      }

      this.size = 0,
      this.stats = angular.extend({}, options, {id: cacheId}),
      this.data = {},
      this.init = false;
      this.dump_data = [],
      this.cacheId = cacheId;
      var that = this;
      caches[this.cacheId] = {
        cache_change_event: 'cache_change:' + that.cacheId,

        size: function () {
          return that.size;
        },

        init: function () {
          return that.init;
        },

        load: function (init_data) {
           for (var i=0;i<init_data.length; i++) {
            that.data[init_data[i].id] = init_data[i];
           }
           that.init = true;
        },

        dump: function () {
          that.dump_data.splice(0, that.dump_data.length);
          angular.forEach(that.data, function (value, key) {
            this.push(value);
          }, that.dump_data);
          return that.dump_data;
        },

        put: function(key, value) {

          if (angular.isUndefined(value)) return;
          if (!(key in that.data)) that.size++;
          that.data[key] = value;

          !that.init && (that.init = true);
          $rootScope.$broadcast(this.cache_change_event, {'action': 'put', 'id': key});
          return value;
        },

        get: function(key) {
          return that.data[key];
        },

        remove: function(key) {
          delete that.data[key];
          that.size--;
          $rootScope.$broadcast(this.cache_change_event, {'action': 'remove', 'id': key});
        },

        removeAll: function() {
          that.init = false;
          that.data = {};
          that.size = 0;
          $rootScope.$broadcast(this.cache_change_event);
        },

        destroy: function() {
          that.data = null;
          that.stats = null;
          delete caches[cacheId];
        },

        info: function() {
          return angular.extend({}, that.stats, {size: that.size});
        }
      };
      return caches[this.cacheId];

    }

    cacheFactory.info = function() {
      var info = {};
      angular.forEach(caches, function(cache, cacheId) {
        info[cacheId] = cache.info();
      });
      return info;
    };

    cacheFactory.get = function(cacheId) {
      return caches[cacheId];
    };

    return cacheFactory;
  }])
  .factory('ResourcePool', ['$resource', '$http', '$cookies', '$window', 'ApiList', 'CacheService', 'CheckStatusService', 'LogCenter', function ($resource, $http, $cookies, $window, ApiList, CacheService, CheckStatusService, LogCenter) {
    var csrftoken = $cookies['csrftoken'];
    $http.defaults.headers.common['X-CSRFToken'] = csrftoken;
    return function (name) {
      var that = this;
      this.resource_url = ApiList.get(name);
      this.detail_url = ApiList.get(name, 'detail');
      this.cache = new CacheService(name); // allocate a cache pool to each resource

      var error_handle = function (resp) {
        var status_code = resp.status;
        if (status_code == 400) {
          //TODO report msg
          LogCenter.error(resp.data);
        } else if (status_code == 401 || status_code == 403){
          // I logout in server first, reload the page will logout user in browser
          $window.location.reload();
        } else if (status_code == 404) {
          // TODO resource is not found
        } else if (status_code == 413) {
          // TODO overlimit
          LogCenter.warn(resp.data);
        } else {
          LogCenter.warn(resp.data);
        }
      };

      var add_error_handle = function (arg) {
        var a1 = arg[0], a2 = arg[1], a3 = arg[2], a4 = arg[3];
        switch(arg.length) {
          case 4:
            //alread has error handle
            return [a1, a2, a3, a4];
          case 3:
            if (angular.isFunction(arg[1])) {
              // param, success, error
              return [a1, a2, a3];
            } else {
              // param, data, success
              return [a1, a2, a3, error_handle];
            }
          case 2:
            if (angular.isFunction(arg[0])) {
              // success, error
              return [a1, a2];
            } else if (angular.isFunction(arg[1])){
              // param, success
              return [a1, a2, error_handle];
            } else {
              // param, data
              return [a1, a2, angular.noop, error_handle];
            }
          case 1:
            if (angular.isFunction(arg[0])) {
              // success
              return [a1, error_handle];
            } else {
              // param
              return [a1, angular.noop, error_handle];
            }
          default:
            return [angular.noop, error_handle];
        }
      };

      var check_status = function (data, getter) {
        // if item is not in stable status, start checking it.
        if (angular.isString(data)) return data;
        angular.forEach(data, function (item) {
          if (item.in_stable !== undefined && !item.in_stable) {
            CheckStatusService(item.id, name);
          }
        });
        return data;;
      };

      var transformToCache = function (data, getter) {
        // put data into cache after fetch it
        if (angular.isString(data)) return data;
        that.cache.load(data);
        return that.cache.dump();
      };
      this.req = $resource(this.resource_url, {}, {
        'save_multi': { // return a list resp
          method: 'POST',
          isArray: true
        },
        'fetch': {
          method: 'GET',
          isArray: true,
          transformResponse: [$http.defaults.transformResponse[0],
                              check_status,
                              transformToCache]
        }
      });
      this.detail_req = $resource(this.detail_url, {},
          {
            'update': {
              method: 'PUT'
            },
            'get_list': {
              method: 'GET',
              isArray: true
            }
        });
      this.fetch = function () {
        if (that.cache.init()) {
          var cache = that.cache.dump();
          switch (arguments.length) {
          case 4:
            return arguments[3](cache);
          case 3:
            return arguments[2](cache);
          case 2:
            return arguments[1](cache);
          case 1:
            if (angular.isFunction(arguments[0])) {
              return arguments[0](cache);
            } else {
              return cache;
            }
          default:
            return cache;
          }
        } else {
          var arg_list = add_error_handle(arguments);
          return that.req.fetch.apply(that, arg_list);
        }
      };
      this.query = function () {
        that.cache.removeAll();
        return that.req.fetch.apply(that, arguments);
      };
      this.query_no_cache = function () {
        var arg_list = add_error_handle(arguments);
        return that.req.query.apply(that, arg_list);
      };
      this.save = function () {
        var arg_list = add_error_handle(arguments);
        that.req.save.apply(that, arg_list);
      };
      this.save_multi = function () {
        var arg_list = add_error_handle(arguments);
        that.req.save_multi.apply(that, arg_list);
      };

      this.remove = function () {
        var arg_list = add_error_handle(arguments);
        that.detail_req.remove.apply(that, arg_list);
      };

      this.update = function () {
        var arg_list = add_error_handle(arguments);
        that.detail_req.update.apply(that, arg_list);
      };

      this.get = function () {
        var arg_list = add_error_handle(arguments);
        that.detail_req.get.apply(that, arg_list);
      };
      this.get_list = function () {
        var arg_list = add_error_handle(arguments);
        that.detail_req.get_list.apply(that, arg_list);
      };

    };
  }])
  .factory('CheckStatusService', ['$rootScope', '$http', '$timeout', 'ApiList', 'EventCenter',
      function($rootScope, $http, $timeout, ApiList, EventCenter) {
    var task_list = {
      queue: {},
      push: function (resource_id, timeout_promise) {
        if (resource_id in this.queue) {
          $timeout.cancel(this.queue[resource_id]);
        }
        this.queue[resource_id] = timeout_promise;
      },
      cancel: function (resource_id) {
        if (resource_id in this.queue) {
          $timeout.cancel(this.queue[resource_id]);
          delete this.queue[resource_id];
        }
      },
      clear: function () {
        for (var i=0; i < this.queue.length; i++) {
          $timeout.cancel(this.queue[i]);
        }
        this.queue = {};
      }
    };

    var check_status = function (id, resource_type) {
      var resource_url = ApiList.get(resource_type, 'detail')
      resource_url = resource_url.slice(0, resource_url.length-3) + id;
      var check_interval = 2000;

      var check = function () {
          var timeout_promise = $timeout(function () {
              return $http.head(resource_url);
            }, check_interval);

          timeout_promise.then(function (res) {
            var data = res.data,
                status_code = res.status,
                headerGetter = res.headers;
            if (status_code == 202) {
              var x_status = headerGetter('x-status'),
                x_realstatus = headerGetter('x-realstatus'),
                x_task = headerGetter('x-task');
              // TODO trigger msg about current status info
              check(); // check again
            } else {
              task_list.cancel(id);
              EventCenter.trigger(resource_type + ':check_stop', id);
              return; // stop check status
            }
          }, function (res) {
            var data = res.data,
                status_code = res.status,
                headerGetter = res.headers;
            if (status_code == 404) {
              EventCenter.trigger(resource_type + ':resource_removed', id);
              return;
            }
          });
          task_list.push(id, timeout_promise);
        };

      check(); // start check status
    };


    check_status.clean_task = function () {
      task_list.clear();
    };
    return check_status;
  }])
  .factory('CouponCodePool', ['ResourcePool', function (ResourcePool) {
  }])
  .factory('CouponLogPool', ['ResourcePool', function (ResourcePool) {
  }])
  .factory('CrashPool', ['ResourcePool', function (ResourcePool) {
  }])
  .factory('PanelGroupPool', ['ResourcePool', function (ResourcePool) {
    var panel_group_pool = new ResourcePool('panel');
    return panel_group_pool;
  }])
  .factory('RegionPool', ['ResourcePool', function (ResourcePool) {
    var region_pool = new ResourcePool('region');
    return region_pool;
  }])
  .factory('QuotaPool', ['ResourcePool', function (ResourcePool) {
    var quota_pool = new ResourcePool('quota');
    return quota_pool;
  }])
  .factory('FlavorPool', ['ResourcePool', 'EventCenter', 'LogCenter',
      function (ResourcePool, EventCenter, LogCenter) {
    var flavor_pool = new ResourcePool('flavor');

    var create = function (data) {
      flavor_pool.save(data, function (res) {
        flavor_pool.cache.put(res.id, res);
        LogCenter.created_resource('flavor', res.name);
      });
    };

    var remove = function (id) {
      flavor_pool.remove({'id': id}, function () {
        var cache = flavor_pool.cache.get(id);
        LogCenter.deleted_resource('flavor', cache.name);
        flavor_pool.cache.remove(id);
      });
    };

    EventCenter.on('flavor:create', create);
    EventCenter.on('flavor:remove', remove);
    return flavor_pool;
  }])
  .factory('ImagePool', ['ResourcePool', 'CheckStatusService', 'EventCenter', 'LogCenter',
      function (ResourcePool, CheckStatusService, EventCenter, LogCenter) {
    var image_pool = new ResourcePool('image');
    
    var update = function (id, data) {
      image_pool = image_pool.update({'id': id}, data, function (res) {
        image_pool.cache.put(id, res);
        LogCenter.updated_resource('image', res.name);
      });
    };

    var remove = function (id) {
      image_pool = image_pool.remove({'id': id}, function (res) {
        LogCenter.deleting_resource('image', res.name);
        CheckStatusService(id, 'image');
      });
    };

    EventCenter.on('image:update', update);
    EventCenter.on('image:remove', remove);
    EventCenter.on('image:check_stop', function (id) {
      image_pool.get({'id': id}, function (res) {
        image_pool.cache.put(id, res);
        LogCenter.created_resource('image', res.name);
      });
    });
    EventCenter.on('image:resource_removed', function (id) {
      var cache = image_pool.cache.get(id);
      LogCenter.deleted_resource('image', cache.name);
      image_pool.cache.remove(id);
    });
    return image_pool;
  }])
  .factory('SnapshotPool', ['redirect', 'ResourcePool', 'CheckStatusService',
      'EventCenter', 'LogCenter',
      function (redirect, ResourcePool, CheckStatusService, EventCenter, LogCenter) {
    var snapshot_pool = new ResourcePool('snapshot');
    
    var create = function (data) {
      LogCenter.creating_resource('snapshot', data.name)
      snapshot_pool.save(data, function (res) {
        snapshot_pool.cache.put(res.id, res);
          CheckStatusService(res.id, 'snapshot');
          redirect('/app/snapshot');
      });
    };

    var remove = function (id) {
      LogCenter.deleting_resource('snapshot', id);
      snapshot_pool.remove({'id': id}, function () {
        snapshot_pool.get({'id': id}, function (res) {
          CheckStatusService(id, 'snapshot');
        }, function (res) {
          if (res.status == 404) {
            snapshot_pool.cache.remove(id);
          }
        });
      }); 
    };

    var update = function (id ,data) {
      snapshot_pool.update({'id': id}, data, function (res) {
        snapshot_pool.cache.put(id, res);
        LogCenter.updated_resource('snapshot', res.name);
      });
    };

    EventCenter.on('snapshot:create', create);
    EventCenter.on('snapshot:remove', remove);
    EventCenter.on('snapshot:update', update);
    EventCenter.on('snapshot:check_stop', function (id) {
      snapshot_pool.get({'id': id}, function (res) {
        snapshot_pool.cache.put(id, res);
        LogCenter.created_resource('snapshot', res.name);
      });
    });
    EventCenter.on('snapshot:resource_removed', function (id) {
      var cache = snapshot_pool.cache.get(id);
      LogCenter.deleted_resource('snapshot', cache.name);
      snapshot_pool.cache.remove(id);
    });
    return snapshot_pool;
  }])
  .factory('InstancePool', ['$filter', 'ResourcePool', 'CheckStatusService', 'EventCenter', 'LogCenter',
      function ($filter, ResourcePool, CheckStatusService, EventCenter, LogCenter) {
    var i18n = $filter('i18n');
    var instance_pool = new ResourcePool('instance');
    var create = function (data) {
      if (data.count > 1) {
        LogCenter.info(i8n('creating %d instances', data.count));
      } else {
        LogCenter.creating_resource('instance', data.name);
      }
      instance_pool.save(data, function (res) {
        var count = data.count;
        if (count > 1) {
          instance_pool.query();
        } else {
          // check status
          instance_pool.cache.put(res.id, res);
          CheckStatusService(res.id, 'instance');
        }
      });
    };
    var remove = function (id) {
      var cache = instance_pool.cache.get(id);
      LogCenter.deleting_resource('instance', cache.name);
      instance_pool.remove({'id': id}, function () {
        instance_pool.get({'id': id}, function (res) {
          instance_pool.cache.put(id, res);
          CheckStatusService(id, 'instance');
        }, function (res) {
          if (res.status == 404) {
            LogCenter.deleted_resource('instance', cache.name);
            instance_pool.cache.remove(id);
          }
        });
      });
    };
    var action_on_instance = function (id, data) {
      // update name, pause/unpause, suspend/resume, stop/start, reboot
      var cache = instance_pool.cache.get(id);
      LogCenter.info(i18n('start %s instance:%s', i18n(data.action), cache.name));
      instance_pool.update({'id': id}, data, function (res) {
        // update cache (if it aims to update instance name) else check instance status
          instance_pool.cache.put(id, res);
          if (data.action != 'update') {
            CheckStatusService(id, 'instance');
          }
      });
    };

    EventCenter.on('instance:create', create);
    EventCenter.on('instance:remove', remove);
    EventCenter.on('instance:action_on_instance', action_on_instance);
    EventCenter.on('instance:resource_removed', function (id) {
      var cache = instance_pool.cache.get(id);
      LogCenter.deleted_resource('instance', cache.name);
      instance_pool.cache.remove(id);
    });
    EventCenter.on('instance:check_stop', function (id) {
      instance_pool.get({'id': id}, function (res) {
        // TODO info the instance is suspended/paused/stopped/updated ....
        LogCenter.success(i18n('instance %s is %s', res.name, res.status));
        instance_pool.cache.put(id, res);
      });
    });
    return instance_pool;
  }])
  .factory('SgPool', ['ResourcePool', 'EventCenter', 'LogCenter',
      function (ResourcePool, EventCenter, LogCenter) {
    var sg_pool = new ResourcePool('sg');

    var create = function (data) {
      sg_pool.save(data, function (res) {
        LogCenter.created_resource('sg', res.name);
        sg_pool.cache.put(res.id, res);
      });
    };

    var remove = function (id) {
      sg_pool.remove({'id': id}, function () {
        var cache = sg_pool.cache.get(id);
        LogCenter.deleted_resource('sg', cache.name);
        sg_pool.cache.remove(id);
      });
    };

    var update = function (id, data) {
      sg_pool.update({'id': id}, data, function (res) {
        LogCenter.updated_resource('sg', res.name);
        sg_pool.cache.put(id, res);
      });
    };

    EventCenter.on('sg:create', create);
    EventCenter.on('sg:remove', remove);
    EventCenter.on('sg:update', update);
    return sg_pool;
  }])
  .factory('VmUsagePool', ['ResourcePool', function (ResourcePool) {
  
  }])
  .factory('VolumePool', ['$filter', 'ResourcePool', 'CheckStatusService', 'EventCenter', 'LogCenter',
      function ($filter, ResourcePool, CheckStatusService, EventCenter, LogCenter) {
    var i18n = $filter('i18n');
    var volume_pool = new ResourcePool('volume');
    var create = function (data) {
      volume_pool.save(data, function (res) {
        // add res to volume cache, start check volume status
        volume_pool.cache.put(res.id, res);
        LogCenter.creating_resource('volume', res.name);
        CheckStatusService(res.id, 'volume');
      });
    };
    var remove = function (id) {
      volume_pool.remove({'id': id}, function () {
        //start check volume status, at last, remove it from the cache
        volume_pool.get({'id': id}, function (res) {
          LogCenter.deleting_resource('volume', res.name);
          volume_pool.cache.put(res.id, res);
          CheckStatusService(id, 'volume');
        }, function (res) {
          if (res.status == 404) {
            var cache = volume_pool.cache.get(id);
            LogCenter.deleted_resource('volume', cache.name);
            volume_pool.cache.remove(id);
          }
        });
      });
    };

    var attach = function (id, data) {
      volume_pool.update({'id': id}, data, function (res) {
        volume_pool.cache.put(id, res);
        if (!res.in_stable) {
          CheckStatusService(id, 'volume');
          LogCenter.success(i18n('successfully attached volume %s to instance ', res.name));
        }
      });
    };

    var detach = function (id, data) {
      volume_pool.update({'id': id}, data, function (res) {
        // update cache, start check volume status
        volume_pool.cache.put(id, res);
        if (!res.in_stable) {
          LogCenter.success(i18n('successfully detached volume %s from instance ', res.name));
          CheckStatusService(res.id, 'volume');
        }
      });
    };
    EventCenter.on('volume:create', create);
    EventCenter.on('volume:remove', remove);
    EventCenter.on('volume:attach', attach);
    EventCenter.on('volume:detach', detach);
    EventCenter.on('volume:resource_removed', function (id) {
      var cache = volume_pool.cache.get(id);
      LogCenter.deleted_resource('volume', cache.name);
      volume_pool.cache.remove(id);
    });
    EventCenter.on('volume:check_stop', function (id) {
      volume_pool.get({'id': id}, function (res) {
        // TODO info start attaching/detaching instance from volume
        volume_pool.cache.put(id, res);
      });
    });
    return volume_pool;
  }])
  .factory('VolumeTypePool', ['ResourcePool', 'EventCenter', 'LogCenter',
      function (ResourcePool, EventCenter, LogCenter) {
    var vt_pool = new ResourcePool('volume_type');

    var create = function (data) {
      vt_pool.save(data, function (res) {
        LogCenter.created_resource('volume_type', res.name);
        vt_pool.cache.put(res.id, res);
      });
    };

    var remove = function (id) {
      vt_pool.remove({'id': id}, function () {
        var cache = vt_pool.cache.get(id);
        LogCenter.deleted_resource('volume_type', cache.name);
        vt_pool.cache.remove(id); 
      });
    };
    
    EventCenter.on('volume_type:create', create);
    EventCenter.on('volume_type:remove', remove);
    return vt_pool;
  }])
  .factory('VolumeSnapshotPool', ['redirect', 'ResourcePool', 'CheckStatusService', 'EventCenter', 'LogCenter',
      function (redirect, ResourcePool, CheckStatusService, EventCenter, LogCenter) {
    var volume_snapshot_pool = new ResourcePool('volume_snapshot');

    var create = function (data) {
      volume_snapshot_pool.save(data, function (res) {
        volume_snapshot_pool.cache.put(res.id, res);
        LogCenter.creating_resource('volume_snapshot', res.name);
        CheckStatusService(res.id, 'volume_snapshot');
        redirect('/app/volume_snapshot');
      });
    };

    var remove = function (id) {
      var cache = volume_snapshot_pool.cache.get(id);
      LogCenter.deleting_resource('volume_snapshot', cache.name);
      volume_snapshot_pool.remove({'id': id}, function () {
        volume_snapshot_pool.get({'id': id}, function (res) {
          volume_snapshot_pool.cache.put(id, res);
          CheckStatusService(id, 'volume_snapshot');
        }, function (res) {
          if (res.status == 404) {
            LogCenter.deleted_resource('volume_snapshot', cache.name);
            volume_snapshot_pool.cache.remove(id);
          }
        });
      });
    };
    EventCenter.on('volume_snapshot:create', create);
    EventCenter.on('volume_snapshot:remove', remove);

    EventCenter.on('volume_snapshot:check_stop', function (id) {
      volume_snapshot_pool.get({'id': id}, function (res) {
        volume_snapshot_pool.cache.put(id, res);
      });
    });
    EventCenter.on('volume_snapshot:resource_removed', function (id) {
      var cache = volume_snapshot_pool.cache.get(id);
      LogCenter.deleted_resource('volume_snapshot', cache.name);
      volume_snapshot_pool.cache.remove(id);
    });
    return volume_snapshot_pool;
  }])
  .factory('KeypairPool', ['ResourcePool', 'EventCenter', 'LogCenter', function (ResourcePool, EventCenter, LogCenter) {
    var keypair_pool = new ResourcePool('keypair');
    var import_keypair = function (data) {
      keypair_pool.save(data, function (res) {
        LogCenter.created_resource('keypair', res.name);
        keypair_pool.cache.put(res.id, res);
      });
    };
    var remove = function (id) {
      keypair_pool.remove({'id': id}, function () {
        var cache = keypair_pool.cache.get(id);
        LogCenter.deleted_resource('keypair', cache.name);
        keypair_pool.cache.remove(id);
      });
    };

    EventCenter.on('keypair:remove', remove);
    EventCenter.on('keypair:import', import_keypair);
    return keypair_pool;
  }])
  .factory('FloatingIpPool', ['ResourcePool', 'EventCenter', 'LogCenter',
      function (ResourcePool, EventCenter, LogCenter) {
    var floating_ip_pool = new ResourcePool('floating_ip');

    var allocate_ip = function (data) {
      floating_ip_pool.save(data, function (res) {
        LogCenter.created_resource('floating_ip', res.ip);
        floating_ip_pool.cache.put(res.id, res); 
      });
    };

    var release_ip = function (id) {
      floating_ip_pool.remove({'id': id}, function () {
        var cache = floating_ip_pool.cache.get(id);
        LogCenter.deleted_resource('floating_ip', cache.ip);
        floating_ip_pool.cache.remove(id);
      });
    };

    var associate_ip = function (id, data) {
      floating_ip_pool.update({'id': id}, data, function (res) {
        // TODO info associate instance xxx with ip xxx
        floating_ip_pool.cache.put(id, res);
      });
    };

    var disassociate_ip = function (id, data) {
      floating_ip_pool.update({'id': id}, data, function (res) {
        // TODO info dissociate instance xxx from ip xxx
        floating_ip_pool.cache.put(id, res);
      });
    };

    EventCenter.on('floating_ip:allocate', allocate_ip);
    EventCenter.on('floating_ip:release', release_ip);
    EventCenter.on('floating_ip:associate', associate_ip);
    EventCenter.on('floating_ip:disassociate', disassociate_ip);
    return floating_ip_pool;
  }])
  .factory('FloatingIpPoolPool', ['ResourcePool', function (ResourcePool) {
    var floating_ip_pool_pool = new ResourcePool('floating_ip_pool');
    return floating_ip_pool_pool;
  }])
  .factory('LBPool', ['ResourcePool', 'CheckStatusService', 'EventCenter', 'LogCenter',
      function (ResourcePool, CheckStatusService, EventCenter, LogCenter) {
    var lb_pool = new ResourcePool('load_balancer');
    var create = function (data) {
      lb_pool.save(data, function (res) {
        LogCenter.creating_resource('load_balancer', res.name);
        lb_pool.cache.put(res.id, res);
        CheckStatusService(res.id, 'load_balancer');
      });
    };

    var remove = function (id) {
      var cache = lb_pool.cache.get(id);
      LogCenter.deleting_resource('load_balancer', cache.name);
      lb_pool.remove({'id': id}, function (res) {
        lb_pool.get({'id': id}, function (res) {
          lb_pool.cache.put(id, res);
          CheckStatusService(id, 'load_balancer');
        }, function (res) {
          if (res.status == 404) {
            LogCenter.deleted_resource('load_balancer', cache.name);
            lb_pool.cache.remove(id);
          }
        });
      });
    };

    var update = function (id, data) {
      lb_pool.update({'id': id}, data, function (res) {
        LogCenter.updating_resource('load_balancer', res.name);
        lb_pool.cache.put(id, res);
        CheckStatusService(id, 'load_balancer');
      });
    };

    EventCenter.on('load_balancer:create', create);
    EventCenter.on('load_balancer:remove', remove);
    EventCenter.on('load_balancer:update', update);
    EventCenter.on('load_balancer:resource_removed', function (id) {
      var cache = lb_pool.cache.get(id);
      LogCenter.deleted_resource('load_balancer', cache.name);
      lb_pool.cache.remove(id);
    });
    EventCenter.on('load_balancer:check_stop', function (id) {
      lb_pool.get({'id': id}, function (res) {
        lb_pool.cache.put(id, res);
      });
    });
    return lb_pool;
  }])
  .factory('KanyunNodePool', ['ResourcePool', function (ResourcePool) {
  
  }])
  .factory('ServicePool', ['ResourcePool', function (ResourcePool) {
    var service_pool = new ResourcePool('service');
    return service_pool;
  }])
  .factory('ProjectPool', ['ResourcePool', 'EventCenter', 'LogCenter',
      function (ResourcePool, EventCenter, LogCenter) {
    var project_pool = new ResourcePool('project');

    var create = function (data) {
        project_pool.save(data, function (res) {
          LogCenter.created_resource('project', res.name);
          project_pool.cache.put(res.id, res);
        });
    };

    var remove = function (id) {
      project_pool.remove({'id': id}, function () {
        var cache = project_pool.cache.get(id);
        LogCenter.deleted_resource('project', cache.name);
        project_pool.cache.remove(id);
      });
    };

    var update_project = function (id, data) {
        project_pool.update({'id': id}, data, function (res) {
          LogCenter.updated_resource('project', res.name);
          project_pool.cache.put(id, res);
        });
    };

    var update_quota = function (id, data) {
        project_pool.update({'id': id}, data, function (res) {
          LogCenter.updated_resource('project', res.name);
          project_pool.cache.put(id, res);
        });
    };
    EventCenter.on('project:create', create);
    EventCenter.on('project:remove', remove);
    EventCenter.on('project:update', update_project);
    EventCenter.on('project:update_quota', update_quota);
    return project_pool;
  }])
  .factory('UserPool', ['ResourcePool', 'EventCenter', 'LogCenter',
      function (ResourcePool, EventCenter, LogCenter) {
    var user_pool = new ResourcePool('user');

    var create = function (data) {
      user_pool.save(data, function (res) {
        LogCenter.created_resource('user', res.name);
        user_pool.cache.put(res.id, res);
      });
    };

    var update = function (id, data) {
      user_pool.update({'id': id}, data, function (res) {
        LogCenter.updated_resource('user', res.name);
        user_pool.cache.put(id, res);
      });
    };

    var remove = function (id) {
      user_pool.remove({'id': id}, function () {
        var cache = user_pool.cache.get(id);
        LogCenter.deleted_resource('user', cache.name);
        user_pool.cache.remove(id);
      });
    };

    EventCenter.on('user:create', create);
    EventCenter.on('user:update', update);
    EventCenter.on('user:remove', remove);
    return user_pool;
  }])
  .factory('ApplyCodePool', ['ResourcePool', 'EventCenter', 'LogCenter',
      function (ResourcePool, EventCenter, LogCenter) {
    var apply_code_pool = new ResourcePool('apply_code');

    var create = function (data) {
      apply_code_pool.save_multi(data, function (res) {
        angular.forEach(res, function (item) {
          apply_code_pool.cache.put(item.id, item);
        });
      });
    };

    var remove = function (id) {
      apply_code_pool.remove({'id': id}, function () {
        apply_code_pool.cache.remove(id);
      });
    };

    EventCenter.on('apply_code:create', create);
    EventCenter.on('apply_code:remove', remove);
    return apply_code_pool;
  }])
  .factory('UiConfigPool', ['$resource', 'ApiList', 'EventCenter', 'LogCenter',
      function ($resource, ApiList, EventCenter, LogCenter) {
      var url = ApiList.get('user_metadata', 'ui_config');
      var resource = $resource(url, {}, {
        'fetch': {
          method: 'GET',
          isArray: false
        }
      });
      var save = function (data) {
        data = {'ui_config': data};
        resource.save(data);
      };
      EventCenter.on('ui_config:save', save);
      return resource;
  }])
  .factory('ProjectUsagePool', ['ResourcePool',
      function (ResourcePool) {
      var project_usage_pool = new ResourcePool('project_usage');
      return project_usage_pool;
  }]);

angular.module("CommonService",[])
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
  }])
  .factory('LogCenter', ['$rootScope', '$filter', function ($rootScope, $filter) {
    var i18n = $filter('i18n');
    var debug = function (msg) {
      $rootScope.$broadcast('log_msg', msg, 'debug');
    };

    var info = function (msg) {
      $rootScope.$broadcast('log_msg', msg, 'info');
    };

    var success = function (msg) {
      $rootScope.$broadcast('log_msg', msg, 'success');
    };

    var warn = function (msg) {
      $rootScope.$broadcast('log_msg', msg, 'warn');
    };

    var error = function (msg) {
      $rootScope.$broadcast('log_msg', msg, 'error');
    };

    var creating_resource = function (resource_type, name) {
      var resource_type = i18n(resource_type),
          msg = i18n("creating %s:%s", resource_type, name);
      info(msg);
    };

    var created_resource = function (resource_type, name) {
      var resource_type = i18n(resource_type),
          msg = i18n('created %s:%s', resource_type, name);
      success(msg);
    };
    
    var deleting_resource = function (resource_type, name) {
      var resource_type = i18n(resource_type),
          msg = i18n('deleting %s:%s', resource_type, name);
      info(msg);
    };

    var deleted_resource = function (resource_type, name) {
      var resource_type = i18n(resource_type),
         msg = i18n("deleted %s:%s", resource_type, name);
      success(msg);
    };

    var updating_resource = function (resource_type, name) {
      var resource_type = i18n(resource_type),
          msg = i18n('updating %s:%s', resource_type, name);
      info(msg);
    };

    var updated_resource = function (resource_type, name) {
      var resource_type = i18n(resource_type),
          msg = i18n('updated %s:%s', resource_type, name);
      success(msg);
    };
    return {
      'debug': debug,
      'info': info,
      'success': success,
      'warn': warn,
      'error': error,

      'creating_resource': creating_resource,
      'created_resource': created_resource,
      'deleting_resource': deleting_resource,
      'deleted_resource': deleted_resource,
      'updating_resource': updating_resource,
      'updated_resource': updated_resource
    };
  }])
  .factory("EventCenter",function(){

    var Event = {

      on: function(name, callback, context) {
        if (!eventsApi(this, 'on', name, [callback, context]) || !callback) return this;
        this._events || (this._events = {});
        var events = this._events[name] || (this._events[name] = []);
        events.push({callback: callback, context: context, ctx: context || this});
        return this;
      },

      once: function(name, callback, context) {
        if (!eventsApi(this, 'once', name, [callback, context]) || !callback) return this;
        var self = this;
        var once = _.once(function() {
          self.off(name, once);
          callback.apply(this, arguments);
        });
        once._callback = callback;
        return this.on(name, once, context);
      },

      off: function(name, callback, context) {
        var retain, ev, events, names, i, l, j, k;
        if (!this._events || !eventsApi(this, 'off', name, [callback, context])) return this;
        if (!name && !callback && !context) {
          this._events = {};
          return this;
        }

        names = name ? [name] : _.keys(this._events);
        for (i = 0, l = names.length; i < l; i++) {
          name = names[i];
          if (events = this._events[name]) {
            this._events[name] = retain = [];
            if (callback || context) {
              for (j = 0, k = events.length; j < k; j++) {
                ev = events[j];
                if ((callback && callback !== ev.callback && callback !== ev.callback._callback) ||
                    (context && context !== ev.context)) {
                  retain.push(ev);
                }
              }
            }
            if (!retain.length) delete this._events[name];
          }
        }

        return this;
      },

      trigger: function(name) {
        if (!this._events) return this;
        var args = [].slice.call(arguments, 1);
        if (!eventsApi(this, 'trigger', name, args)) return this;
        var events = this._events[name];
        var allEvents = this._events.all;
        if (events) triggerEvents(events, args);
        if (allEvents) triggerEvents(allEvents, arguments);
        return this;
      },

      stopListening: function(obj, name, callback) {
        var listeners = this._listeners;
        if (!listeners) return this;
        var deleteListener = !name && !callback;
        if (typeof name === 'object') callback = this;
        if (obj) (listeners = {})[obj._listenerId] = obj;
        for (var id in listeners) {
          listeners[id].off(name, callback, this);
          if (deleteListener) delete this._listeners[id];
        }
        return this;
      }

    };

    var eventSplitter = /\s+/;

    var eventsApi = function(obj, action, name, rest) {
      if (!name) return true;

      if (typeof name === 'object') {
        for (var key in name) {
          obj[action].apply(obj, [key, name[key]].concat(rest));
        }
        return false;
      }

      if (eventSplitter.test(name)) {
        var names = name.split(eventSplitter);
        for (var i = 0, l = names.length; i < l; i++) {
          obj[action].apply(obj, [names[i]].concat(rest));
        }
        return false;
      }

      return true;
    };

    var triggerEvents = function(events, args) {
      var ev, i = -1, l = events.length, a1 = args[0], a2 = args[1], a3 = args[2];
      switch (args.length) {
        case 0: while (++i < l) (ev = events[i]).callback.call(ev.ctx); return;
        case 1: while (++i < l) (ev = events[i]).callback.call(ev.ctx, a1); return;
        case 2: while (++i < l) (ev = events[i]).callback.call(ev.ctx, a1, a2); return;
        case 3: while (++i < l) (ev = events[i]).callback.call(ev.ctx, a1, a2, a3); return;
        default: while (++i < l) (ev = events[i]).callback.apply(ev.ctx, args);
      }
    };


    return Event;

  })
  .factory('LocaleSetting', ['$resource', '$locale', '$cookies', '$document', function ($resource, $locale, $cookies, $document) {
        var set = function (locale) {
            $document[0].cookie = "lang=" + locale + ';path=/';
        };
        var current = function () {
            var lang=$cookies['lang'];
            return lang ? lang : $locale.id;
        };
        return {
          'set': set,
          'current': current
        };
    }])
  .factory("CommonDialog",function( $http, $q, $compile, $rootScope ){
    var dialogElement,
      scope = $rootScope.$new(),
      dialogTpl = 
        '<div class="modal hide">'+
          '<div class="modal-header">'+
          '<h3 ng-repeat=\'dialogChild in dialogChildren\' '+
            ' ng-click=\'$setActive(dialogChild.name)\' >{{dialogChild.name}}</h3></div>'+
          '<div class="modal-body">'+
          '<div ng-repeat=\'dialogChild in dialogChildren\' '+
            ' ng-show=\'dialogChild.active\' ng-bind-html-unsafe=\'dialogChild.el\'>'+
          '</div>'+
        '</div>';
    scope.dialogChildren= []

    var lastActive, currentActive;
    scope.$setActive = function( name ){
      console.log("setting active", name)
      for( var i in scope.dialogChildren ){
        if( scope.dialogChildren[i].name == name ){
          scope.dialogChildren[i].active = true
          currentActive = scope.dialogChildren[i]
        }else{
          if( scope.dialogChildren[i].active == true ){
            lastActive = scope.dialogChildren[i]
          }
          scope.dialogChildren[i].active = false
        }
      }
    }

    scope.$getActive = function(){
      return currentActive
    }

    scope.$submit = function(){
      console.log("$submit arguments:", arguments,"current:", currentActive )
    }

    scope.$cancel  = function(){
      var index = getIndex( scope.dialogChildren, "name", currentActive.name )
      scope.dialogChildren.splice( index, 1 )

      console.log("dialog cancel",index)

      if( scope.dialogChildren.length == 0 ){
        dialogElement.addClass('hide');
      }else{
        if( scope.dialogChildren[index] ){
          scope.$setActive( scope.dialogChildren[index].name )
        }else{
          scope.$setActive( scope.dialogChildren[index-1].name)
        }
      }
    }

    scope.$close = function(){
      dialogElement.addClass('hide');
    }

    dialogElement = $compile( dialogTpl)( scope )
    $("body").append( dialogElement )

    /*
    options : {name:'',directive:''}
    */
    return function( options ){
      if( getIndex( scope.dialogChildren, 'name', options.name ) === false ){
        scope.dialogChildren.push( genDialogChild(options.directive, true) )
      }
      scope.$setActive( options.name )
      dialogElement.removeClass('hide');
      function genDialogChild( directive,active ){
        return {
          name : options.name,
          el : $compile("<div "+directive+"></div>")(scope),
          active : active || false
        }
      }
    }

    function getIndex( arr, attr, value ){
      for( var i in arr ){
        if( arr[i][attr] === value ){
          return i;
        }
      }
      return false
    }

  })
