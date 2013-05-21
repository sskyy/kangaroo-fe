angular.module('AppFilter', ['RestService'])
    .filter('i18n', ['I18nResource', 'LocaleSetting', function (I18nResource, LocaleSetting) {
        return function (input) {
            var loc, resource, i18n, res, placeholders=[];

            for (var i=1; i < arguments.length; i++) {
              placeholders.push(arguments[i]);
            }

            loc = LocaleSetting.current();
            i18n = I18nResource(loc);
            res = i18n[input] !== undefined ? i18n[input] : input;
            if (placeholders.length > 0) {
              res = vsprintf(res, placeholders);
            }
            return res;
        };
    }])
    .filter('uptime_format', ['$filter', function ($filter) {
      var i18n = $filter('i18n'),
          sed = 60, min = sed * 60,
          hour = min * 24,
          min_label = i18n('miniute'),
          hour_label = i18n('hour'),
          day_label = i18n('day');
      return function (value){
        if (value < sed) 
          return 0 + min_label;
        else if (value < min)
          return value + min_label;
        else if (value < hour) {
          var _hour = parseInt(value / 60 / 60),
              _minute = parseInt((value - 3600 * _hour) / 60);
          return _hour + hour_label + ',' +
                 _minute + min_label;
        } else {
          var _day = parseInt(value / 60 / 60 / 24),
              _hour = parseInt((value - 86400 * _day) / 60 / 60),
              _minute = parseInt((value - 86400 *_day - 3600 * _hour) / 60);
          if (_hour > 0)
            return _day + day_label + ',' +
                   _hour + hour_label + ',' +
                   _minute + min_label;
          return _day + day_label + ',' +
                 _minute + min_label;
        }
      }
    }])
    .filter('gb_format', function () {
        return function (value) {
            if( ! parseInt( value ) ){
                value = "0"
            }
            return value + "GB";
        };
    })
    .filter('mb_format', function () {
        return function (value) {
            if( ! parseInt( value ) ){
                value = "0"
            }
            if (value < 1024) {
                return value + "MB";
            } else {
                return value / 1024 + "GB";
            }
        };
    })
    .filter('month_price', function () {
        return function (value) {
            if (!value) return 0;
            var monthly = value.monthly;
            if (monthly) {
                return monthly.price + '';
            }
            return 0;
        };
    })
    .filter('hour_price', function () {
        return function (value) {
            if (!value) return 0;
            var hourly = value.hourly;
            if (hourly) {
                return hourly.price + '';
            }
            return 0;
        }
    })
    .filter('image_status_filter', function () {
        return function (value) {
            return value.status;
        }
    })
    .filter('flavor_filter', function () {
        return function (value) {
            var name = value.name,
                ram = value.ram,
                ephemeral = value.ephemeral,
                vcpus = value.vcpus,
                disk = value.disk;
            return name + '| ram:' + ram + 'MB| ephemeral:' + ephemeral + 'GB| vcpus:' + vcpus + '| disk:' + disk + 'GB';
        };
    })
    .filter('payment_type_filter', function () {
        return function (value) {
            if( !value ){
                return '';
            }
            var product_info = value.product_info;
            if (!product_info){
                return '';
            }
            var payment_type = product_info.payment_type;
            if (payment_type == 'hourly') {
                return product_info.hourly.price + '/' + 'hour';
            } else if (payment_type == 'monthly'){
                return product_info.monthly.price + '/' + 'month';
            } else {
                return '';
            }
            // return payment_type?payment_type:'';
        };
    })
    .filter('distri_filter', function () {
        return function (value) {
            return "<span class='os-icon-" + value.distri + "'></span>";
        };
    })
    .filter('status_icon_filter', function () {
      return function (value) {
          return "<span class='status-icon-" + value + "'></span>";
      }
    })
    .filter('sg_filter', function () {
        return function (value) {
            if (!value) return;
            var sg_list = [];
            for (var i=0; i < value.length; i++) {
                sg_list.push(value[i].name);
            }
            return sg_list.join(',');
        };
    })
    .filter('part_filter', function () {
        return function (raw, parts) {
            if(parts === undefined)
                parts = 2;
            var data = [];
            for(var i = 0; i < parts; i++)
                data[i] = {};
            var index = 0;
            for(var k in raw)
                data[(i++)%parts][k] = raw[k];
            return data;
        }
    })
    .filter('anGrid_copy_filter',function(){
        return function( options ){
            return "<span class='copy_column'>\
                <span class='copy_text'>{{rowData[colData.field]}}</span>\
                <span class='copy_btn'>\
                    <a ng-init='$parent.$parent.$parent.$parent.$parent."+options.anGridCopyInitFn+"( rowData[colData.field] )'\
                        ng-click='$parent.$parent.$parent.$parent.$parent." + options.anGridCopyFn + "($event, rowData[colData.field])' class='btn btn-small  "+options.anGridCopyClass+"'\
                        >{{'Copy' | i18n}}\
                    </a>\
                </span>\
            </span>";
        }
    })
    .filter('operation_connect_filter',function(){
        return function( id ){
            return "<span class='btn btn-small' ng-click='open_connect_instance()'>{{'Connect'|i18n}}</span>"
        }
    })
    .filter('moniter_metrics_format',function(){
        return function(){
            return "<a ng-repeat='metric in rowData[\"metrics\"]' ng-click=\"$emit('metric selected', rowData, metric )\" class='metric'>{{metric}}</a>"
        }
    })
    .filter('instance_class_filter',function(){
        return function( status ){
            var map = {
                'sleeping' : 'gray',
                'error': 'red',
                'building': 'yellow'
            }
            if( status in map ){
                return map[status]
            }
            return ''
        }
    })
    .filter('instance_status_filter',function(){
        return function( status ){
            return ("status" in status ) ? status.real_status : status ;
        }
    })
    .filter('volume_attach_filter', function () {
        return function ( attachments ) {
            if (!attachments || attachments.length == 0) return;
            var result = [];
            for (var i=0; i < attachments.length; i++) {
                result.push("attach to <strong>" + attachments[i].instance_name + "</strong> on " + attachments[i].device)
            }
            return result.join('<br/>');
        }
    })
    ;
