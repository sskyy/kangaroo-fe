//directive
angular.module('anGrid.directives', ['anGrid.services', 'anGrid.filters', 'ngSanitize'], ['$compileProvider', function($compileProvider){
    //directive angrid
    $compileProvider.directive('angrid', ['$compile', 'widthServices', 'setDefaultOption', function($compile, widthServices, setDefaultOption) {
        var angrid = {
            //A transclude linking function pre-bound to the correct transclusion scope:
            transclude: true,
            //scope must be true so that we can use $scope.$eval('string')
            scope: true,
            controller: ['$scope', '$element', '$attrs', function($scope, $element, $attrs, $transclude ) {
                var root = this;
                //there are there three local variables
                //$scope.option  ------ as the children scope of the controller which has angrid
                //$scope.theData ------ to update the grid data, we need to $scope.theData = $scope.$eval($scope.option.data)
                //this.config ------- set default parameters of angrid, this is this controller's object, can not be read by parent controller
                $scope.option = $scope.$eval($attrs.angrid);
                //set the default params of angrid
                this.config = setDefaultOption($scope.option);
                //set width
                widthServices($scope.option.columnDefs);
                //set the the default params to $scope.option
                //I can not do this by just write "$scope.option = this.config"
                $scope.option.angridStyle =                this.config.angridStyle;
                $scope.option.canSelectRows =              this.config.canSelectRows;
                $scope.option.multiSelect =                this.config.multiSelect;
                $scope.option.displaySelectionCheckbox =   this.config.displaySelectionCheckbox;
                $scope.option.selectWithCheckboxOnly =     this.config.selectWithCheckboxOnly;
                $scope.option.multiSelectWithCheckbox =    this.config.multiSelectWithCheckbox;
                $scope.option.columnDefs =                 this.config.columnDefs;
                $scope.option.enableSorting =              this.config.enableSorting;
                $scope.option.selectedItems =              this.config.selectedItems;
                $scope.option.searchFilter =               this.config.searchFilter;
                $scope.option.searchHighlight =            this.config.searchHighlight;
                $scope.option.searchHighlight =            this.config.caseSensitive;
                $scope.option.showFooter =                 this.config.showFooter;
                $scope.option._orderByPredicate =          this.config._orderByPredicate;
                $scope.option._orderByreverse =            this.config._orderByreverse;
                
                //$scope.angrid is only use in angrid's scope
                $scope.angrid = {};
                $scope.angrid.hasFooterClass = $scope.option.showFooter ? "hasFooter" : "";
                
                
                //watch the data change, 
                //To study the ng-grid
                // if it is a string we can watch for data changes. otherwise you won't be able to update the grid data
                var prevlength = 0;
                var dataWatcher = function (a) {
                    if (typeof $scope.option.data == "string") {
                        prevlength = a ? a.length:0;
                        $scope.thedata = $scope.$eval($scope.option.data) || [];
                        root.config.data = $scope.thedata;
                    }
                };
                $scope.$parent.$watch($scope.option.data, dataWatcher);
                $scope.$parent.$watch($scope.option.data + '.length', function(a) {
                    if (a != prevlength) {
                        dataWatcher($scope.$eval($scope.option.data));
                    }
                });

                $scope.$on('anrowData change',function(){
                    console.log( 'row change' );
                });
                
            }],
            template:
                //TODO: to complie templete
                '<div class="anGrid instance {{option.angridStyle}}">' +
                    '<div class="anHead"><!-- thead -->' +
                        '<ul>' +
                            '<anhead sort-field="option._orderByPredicate" sort-reverse="option._orderByreverse" selects="option.selectedItems"></anhead>' + 
                        '</ul>' +
                    '</div>' +
                    '<div class="anBody {{angrid.hasFooterClass}}"><!-- tbody -->' +
                        '<ul>' +
                            '<anrow ng-repeat="rowdata in thedata | orderBy:option._orderByPredicate:option._orderByreverse | filter:search" anrow-data="rowdata" selects="option.selectedItems" search-filter="option.searchFilter" ></anrow>' + 
                        '</ul>' +
                    '</div>' +
                    '<div class="anFooter" ng-show="option.showFooter">'+
                        '<div class="btn-group filter"><input id="inputIcon" type="text" ng-model="option.searchFilter" /><i class="icon-search"></i></div>' +
                    '</div>' +
                    '<div class="expression">' +
                    '{{ search.$ = option.searchFilter }}'+
                    '</div>' +
                '</div>',
            replace: true
        };
        return angrid;
    }]);
    //directive anRow, this is part of angrid
    $compileProvider.directive('anrow', ['$compile', function($compile) {
        return {
            require: '^angrid',
            restrict: 'E',
            transclude: true,
            scope: { 
                anrowData: "=anrowData",
                selectedItems: "=selects",
                searchFilter: "=searchFilter" 
            },
            template:
            //TODO: to complie templete
              '<li ng-click="anrow.toggleSelectedFuc($event)" ng-class="anrow.rowCssClassFuc()" ng-mouseenter="anrow.hovered=true" ng-mouseleave="anrow.hovered=false" ></li>',
            replace: true,

            link: function($scope, $element, $attrs, $angridCtrl){
                $scope.anrowColumns = $angridCtrl.config.columnDefs;
                $scope.anrowData.selected = false;
                // default option object
                $scope.anrow = angular.extend({             
                    hovered: false,
                    rowCssClassFuc: function(){
                        var rowCssClass = "";
                        if(typeof($scope.anrowData.selected) === undefined)
                            return;
                        rowCssClass = $scope.anrowData.selected ? "selected" : "";
                        rowCssClass += this.hovered ? " hover" : "";
                        return rowCssClass;
                    },
                    checkboxClassFuc: function(){
                        if(typeof($scope.anrowData.selected) === undefined)
                            return;
                        return $scope.anrowData.selected ? "dijitCheckBox dijitCheckBoxChecked" : "dijitCheckBox";
                    },
                    //multiSelect
                    multiSelectFuc: function(){
                        if ($scope.anrowData.selected){
                            $scope.anrowData.selected = false;
                            var oldselectedItems = $angridCtrl.config.selectedItems;
                            $scope.selectedItems = [];
                            angular.forEach(oldselectedItems, function(row){
                                if(row.selected) 
                                    $scope.selectedItems.push(row);
                            }); 
                        }else{
                            $scope.anrowData.selected = true;
                            $scope.selectedItems.push($scope.anrowData);
                        }
                    },
                    //SingleSelect
                    singleSelectFuc: function(){
                        if ($scope.anrowData.selected){
                            if($scope.selectedItems.length > 1){
                                angular.forEach($angridCtrl.config.data, function(rowdata){
                                    rowdata.selected = false;
                                });
                                $scope.selectedItems = [];
                                $scope.anrowData.selected = true;
                                $scope.selectedItems.push($scope.anrowData);
                            }else{
                                $scope.anrowData.selected = false;
                                $scope.selectedItems = [];
                            }
                            
                        }else{
                            angular.forEach($angridCtrl.config.data, function(rowdata){
                                rowdata.selected = false;
                            });
                            $scope.anrowData.selected = true;
                            $scope.selectedItems = [];
                            $scope.selectedItems.push($scope.anrowData);
                        }
                    },
                    //return selected rows' data to $angridCtrl.config.selectedItems
                    toggleSelectedFuc: function($event){
                        if (!$angridCtrl.config.canSelectRows) {
                            return;
                        }
                        if(typeof($scope.anrowData.selected) === undefined){
                            return;
                        }
                        //we use the attribute named dir to justify user clicked checkbox or not in a row
                        if($angridCtrl.config.selectWithCheckboxOnly && $event.target.dir != "checkbox"){
                            return;
                        }
                        if($angridCtrl.config.multiSelect){
                            if($angridCtrl.config.multiSelectWithCheckbox === true && $event.target.dir!= "checkbox" ){
                                this.singleSelectFuc();
                            }else{
                                this.multiSelectFuc();
                            }
                        }else{
                            this.singleSelectFuc();
                        }
                    }
                }, $scope.anrow);
                
                //set the realy row templete
                var checkbox = $angridCtrl.config.displaySelectionCheckbox === true ? 
                               '<div class="anCheckbox"><span dir="checkbox" ng-class="anrow.checkboxClassFuc()"></span></div>' :
                               '';
                var row = checkbox + 
                          '<ol class="clearfix">' +
                              '<ancell ng-repeat="col in anrowColumns" row-data="anrowData" col-data="col" search-filter="searchFilter"></ancell>' + 
                          '</ol>';  
                $element.append($compile(row)($scope)); 

            }
        };
    }]);
    //directive ancell, this is part of angrid
    $compileProvider.directive('ancell', ['$compile', '$filter', function($compile, $filter) {
        return {
            require: '^angrid',
            restrict: 'E',
            transclude: true,
            scope: {
                rowData: "=rowData",
                colData: "=colData",
                searchFilter: "=searchFilter"
            },
            template: '<li class="{{colData.cssClass}}" ng-style="colData._style" title="{{title}}"></li>',
            replace: true,
            link: function($scope, $element, $attrs, $angridCtrl) {
                if ($scope.colData.columnFilter !== '') {
                    var colFilter = $filter($scope.colData.columnFilter);
                    $scope.title = colFilter($scope.rowData[$scope.colData.field]);
                } else {
                    $scope.title = $scope.rowData[$scope.colData.field];
                }
                //console.log($angridCtrl);
                $scope.caseSensitive = $angridCtrl.config.caseSensitive;
                var filter = $scope.colData.columnFilter === '' ? '' : ' | ' + $scope.colData.columnFilter;
                var templete = 
                    filter === "" ?
                    '<span ng-bind-html-unsafe="rowData[colData.field] | highlight:searchFilter:caseSensitive"></span>' :
                    //ng-bind-html can only accept string argument
                    '<span ng-bind-html="rowData[colData.field]'+ filter + '"></span>';
                templete = 
                    $scope.colData.columnTemplete ? 
                    $scope.colData.columnTemplete : 
                    templete;
                //Angular's jQuery lite provides the following methods:
                $element.append($compile(templete)($scope));
            }   
        };
    }]);
    //directive anhead, this is part of angrid
    $compileProvider.directive('anhead', ['$compile', function($compile) {
        return {
            require: '^angrid',
            restrict: 'E',
            transclude: true,
            template: '<li></li>',
            replace: true,
            scope: {
                sortfield: "=sortField",
                sortreverse: "=sortReverse",
                selectedItems: "=selects"
            },
            link: function($scope, $element, $attrs, $angridCtrl) {
                $scope.anhead = angular.extend({
                    selectAll: false,
                    columnDefs: $angridCtrl.config.columnDefs,
                    toggleSelectAllFuc: function(){
                        if(!$angridCtrl.config.canSelectRows || !$angridCtrl.config.displaySelectionCheckbox ){
                            return;
                        }
                        //$angridCtrl.config.selectedItems = [];
                        $scope.selectedItems = [];
                        if(!this.selectAll){
                            this.selectAll = true;
                            angular.forEach($angridCtrl.config.data, function(row){
                                row.selected = true;
                                //$angridCtrl.config.selectedItems.push(row);
                                $scope.selectedItems.push(row);
                            });
                        }else{
                            this.selectAll = false;
                            angular.forEach($angridCtrl.config.data, function(row){
                                row.selected = false;
                            });
                        }
                    },
                    sortFuc : function(col){
                        if(!$angridCtrl.config.enableSorting || !col.sortable ){
                            return;
                        }
                        
                        angular.forEach(this.columnDefs, function(c){
                            c._sortIconflag = false;
                        });
                        col._sortIconflag = true;
                        $scope.sortfield = col.field;
                        $scope.sortreverse = !$scope.sortreverse;
                        $scope.caret = $scope.sortreverse ? 'caretdown' : 'caretup';
                    },
                    headCellCssFuc : function(col){
                        var cssClass = col.sortable === true ? "sortable " : " ";
                        cssClass += col.cssClass;
                        return cssClass;
                    }
                }, $scope.anhead);
                
                //set the realy head row templete
                var checkbox = $angridCtrl.config.displaySelectionCheckbox === true ? 
                               '<div class="anCheckbox" ng-click="anhead.toggleSelectAllFuc()"><span class="dijitCheckBox" ng-class="{\'dijitCheckBoxChecked\': anhead.selectAll}"></span></div>' :
                               '';
                var row = checkbox + 
                          '<ol>' +
                              '<li ng-repeat="col in anhead.columnDefs" ng-class="anhead.headCellCssFuc(col)"  ng-class="{\'sortable\': col.sortable}" ng-style="{{col._style}}" ng-click="anhead.sortFuc(col)">{{col.displayName|i18n}}<span ng-class="caret" ng-show="col._sortIconflag"></span></li>' +
                          '</ol>';
                $element.append($compile(row)($scope)); 
            }
        };
    }]);
}]);


//services
angular.module('anGrid.services', [])
    .factory('setDefaultOption', function(){
        return function(option){
            angular.forEach(option.columnDefs, function(col, i){
                col = angular.extend({
                    field:                   '',         //data name
                    displayName:             this.field, //displayname, the title of the columnDefs
                    cssClass:                '',         //the css of column, defined the width, left ( postion: absolute )
                    width:                   '',         //the substitutes of cssClass, defined the width from 0% to 100%
                    sortable:                true,       //column sortable or not
                    columnFilter:            '',         //costom column filter for a column
                    columnTemplete:          false,      //if use it, it will replace the default ancell template, you'd better know the structure of angrid
                    _sortIconflag:           false,      //the flag that decide display the sortIcon or not, you should not set
                    _style:                  ''
                }, col);
                option.columnDefs.splice(i, 1, col);
            });
            // default config object, config is a global object of angrid
            option = angular.extend({
                angridStyle:                 'th-list', //angrid style, such as th-list, th, th-large
                canSelectRows:               true,      //the flag that decide user can select rows or not
                multiSelect:                 true,      //the flag that decide user can select multiple rows or not
                displaySelectionCheckbox:    true,      //the flag that decide checkbox of each line display or not
                selectWithCheckboxOnly:      false,     //the flag that decide user can only select rows by click checkbox or not
                multiSelectWithCheckbox:     false,     //the flag that decide user can only multi-select rows by click checkbox or not
                columnDefs:                  [],        //this is just reminding that option has to have an attr named columnDefs
                enableSorting:               true,      //This is a main switch that decide user can sort rows by column or not ( however, each column has its own switch )
                selectedItems:               [],        //return the data of select rows
                searchFilter:                "",        //search filter
                searchHighlight:             false,     //search text hightlight
                caseSensitive:               true,      //hightlight case Sensitive
                showFooter:                  false,     //show footer or not
                _orderByPredicate:           "",        //the orderby field name
                _orderByreverse:             false      //the orderby reverse flag
            }, option);
            
            return option;
        };   
    })
    .factory('widthServices', function(){
        return function(columnDefs){
            var left = 0;
            var oldutil = '';
            angular.forEach(columnDefs, function(col, i){
                //only use width without cssClass will not show currect th & th-large style of anGrid
                //I suppose to use cssClass to set width when you need different angridStyle,
                //so I wish you use width when you only need an simple default list
                var t = parseFloat(col.width);
                if(isNaN(t)){
                    //if there is no cssClass or no width, we will set average width for each column
                    if(col.cssClass === ''){
                        if(col.width === '' || col.width === 'auto'){
                            var res = 100 - left;
                            var average = (oldutil == "%") ?
                                res/(columnDefs.length - i) :
                                100/columnDefs.length;
                            //col._style = 'left: '+ left + '%' +'; width:' + average + '%';
                            col._style = {left: left + '%', width: average + '%'};
                            left += average;
                        }else{
                            throw "you would better use percentage (\"10%\",\"20%\", etc...) to use remaining width of grid";
                        }
                    }
                }else{
                    //if we set width as cssClass = '20%' or '20px', '20em', 20, etc... 
                    var util = col.width.substr(t.toString().length);
                    util = (util === '') ? 'px' : util;
                    oldutil = (i === 0) ? util : oldutil;
                    if(util != oldutil){
                        throw "you must set the same util of width, you would better use percentage (\"10%\",\"20%\", etc...)";
                    }
                    //col._style = 'left: '+ left + util +'; width: '+ col.width;
                    col.style = {left: left + util, width: col.width};
                    left += t;
                }
            });
        };   
    });
    
angular.module('anGrid.filters', [])
    .filter('tostring', function () {
        return function (input) {
            //input type: string, number(int, float, NaN), boolean, object(object, array, null), function, undefined 
            switch ( typeof(input)) {
                case "undefined":
                    return "undefined";
                case "function": 
                //you'd better not use function, just use filter
                    return input();
                default:
                    if(input === null){
                        return "null";
                    }
                    return input.toString();
            }
        };
    })
    //most of filters are custom filter, you should define them yourself and inject them into angrid
    //in angrid we only support a little easy filter
    //'checkmark', return character of right or wrong 
    .filter('checkmark', function () {
        return function (input) {
            return input ? '\u2714' : '\u2718';
        };
    })
    //'reverse', reverse the string
    .filter('reverse', function() {
        return function(input, uppercase) {
          var out = "";
          for (var i = 0; i < input.length; i++) {
            out = input.charAt(i) + out;
          }
          // conditional based on optional argument
          if (uppercase) {
            out = out.toUpperCase();
          }
          return out;
        };
     })
    /**
     * Wraps the
     * @param text {string} haystack to search through
     * @param search {string} needle to search for
     * @param [caseSensitive] {boolean} optional boolean to use case-sensitive searching
     */
    .filter('highlight', function () {
        return function (text, search, caseSensitive) {
            if (search || angular.isNumber(search)) {
                text = text.toString();
                search = search.toString();
                if (caseSensitive) {
                    return text.split(search).join('<span class="ui-match">' + search + '</span>');
                } else {
                    return text.replace(new RegExp(search, 'gi'), '<span class="ui-match">$&</span>');
                }
            } else {
                if (typeof(text) == 'boolean') {
                    return text.toString();
                }
              return  text;
            }
        };
    });
     
angular.module('anGrid', ['anGrid.services', 'anGrid.directives', 'anGrid.filters']);

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
    }]);

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

var app_directives = angular.module('AppDirectives', ['AppService', 'CommonService', 'RestService', 'RestServiceV2']);

app_directives
  .directive('usagePieChart', function () {
      return {
          restrict: 'E',
          replace: true,
          scope: {
              chartId: '@',
              chartTitle: '@',
          },
          template: '<div class="usage_chart_wrapper">' +
                        '<div class="usage_chart" id="{{chartId}}">' +
                            '<div class="usage_percent">' +
                              '{{usage}}' +
                            '</div>' +
                        '</div>' +
                        '<div class="usage_chart_label">' +
                              "{{chartTitle|i18n}}" +
                        '</div>' +
                    '</div>',
          link: function (scope, elem, attrs) {

              scope.render = function () {
                  $.jqplot(attrs.chartId, [[['a',1], ['b', 2]] ], {
                      grid: {
                          background: 'white',
                          borderWidth: '0',
                          borderColor: 'white',
                          shadow: false
                      },
                      seriesDefaults: {
                          renderer: $.jqplot.DonutRenderer,
                          rendererOptions: {
                              sliceMargin: 3,
                              startAngle: -90,
                              showDataLabels: false,
                          }
                      },
                      seriesColors: ['#59ad58', '#d9ecd8'],
                  });
                  scope.$apply(function () {
                      var selected_node = scope.$parent.selectedItems[0],
                      chartId = attrs.chartId;
                      if (chartId == 'cpu_usage') {
                          scope.usage = selected_node.cpu;
                      } else if (chartId == 'mem_usage') {
                          scope.usage = selected_node.mem_percent;
                      } else if (chartId == 'disk_usage') {
                          scope.usage = selected_node.disk_percent;
                      }
                  });
              };
          },
      }
  })
  .directive('vmNode', function () {
      return {
          restrict: 'E',
          replace: true,
          template: "<div>" +
                      "<div class='vm_node_active'>" +
                      "</div>" +
                    "</div>",
      };
  });

app_directives
  .directive('topbardropdown', ['$location', function ($location) {
        // nav bar item
        return {
            restrict: 'E',
            scope: {
                items: "=",
                iconleft: "@",
                iconright: "@",
            },
            replace: true,
            template:   '<span class="btn" data-toggle="dropdown" href="#">' +
                            '<i ng-show="iconleft" class="iconleft {{iconcolor}} {{iconleft}}"></i>' +
                            '<span>' +
                                '{{items[0].name|i18n}}' +
                            '</span>' +
                            '<i ng-show="iconright" class="iconright {{iconcolor}} {{iconright}}"></i>' +
                            '<ul ng-show="items.length > 1" class="dropdown-menu" role="menu" aria-labelleby="dLabel">' +
                                '<li ng-repeat="item in items">' +
                                    '<a ng-click="item_click(item)" ng-hide="$index == 0" >{{item.name|i18n}}' +
                                    '</a>' +
                                '</li>' +
                            '</ul>' +
                        '</span>',
            link: function (scope, elem, attrs) {
                scope.view_change = function (item) {
                    $location.path(item.link);
                };
                scope.iconcolor = "icon-black";
                var a = $(elem[0]),
                    ul = $(elem.children('.dropdown-menu')[0]),
                    iconleft = a.find('.iconleft'),
                    iconright = a.find('.iconright'),
                    iconrightclass = attrs.iconright;


                scope.hovered = false;
                elem.mouseenter(function () {
                    elem.siblings().children('.dropdown-menu.open').removeClass('open');
                    elem.addClass("open");
                });
                
                var hideLock = null;
                elem.mouseleave(function () {
                    if( elem.hasClass('open') ){
                        hideLock = window.setTimeout(function(){
                            elem.removeClass('open');
                        },100)    
                    }
                });
                
                ul.mouseenter( function() {
                    if( hideLock !== null ){
                        window.clearTimeout( hideLock );
                    }
                })

                ul.mouseleave( function(){
                    if( elem.hasClass('open') ){
                        elem.removeClass('open');
                    }
                })

                scope.item_click = function (item) {
                    if (item.callback == undefined) {
                        scope.view_change(item);
                    } else {
                        item.callback(item);
                    }
                };
            }
        };
    }])
    .directive('sidepanel', function () {
        // sidepanel item
        return {
            restrict: 'E',
            scope: {
                group: "=",
                selectedPanel: "=",
            },
            replace: true,
            template: "<div class='nav-group'>" +
                       "<li class='menu-header' ng-click='toggle_panel()' ng-class='{\"active\": has_item_selected()}'>" +
                         "<i class='icon-th-list'></i>"+
                         "<i ng-class='{\"icon-chevron-down\": folded == false, \"icon-chevron-right\": folded == true}' ></i>" +
                         "{{group.name|i18n}}" +
                       "</li>" +
                       "<ul ui-sortable='{axis:\"y\"}' class='nav'>" +
                         "<li ng-repeat='panel in group.panels' ng-class='{\"active\": selectedPanel == panel.name}'>" +
                           "<a ng-href='/app/{{panel.name}}' class='sidebar-{{panel.name}}'>" +
                               "<i class='icon-icon'></i>" +
                               "{{panel.name|i18n}}" +
                           "</a>" +
                         "</li>" +
                       "</ul>" +
                      "</div>",
            link: function (scope, elem, attrs) {
                scope.folded = false;
                scope.has_item_selected = function () {
                    // check whethe the selected panel is in the group
                    for (var i = 0; i < scope.group.panels.length; i++) {
                        var panel = scope.group.panels[i];
                        if (panel.name == scope.selectedPanel) {
                            return true;
                        }
                    }
                    return false;
                };
                scope.toggle_panel = function () {
                    if (scope.folded) {
                        $(elem).find('.nav').slideDown();
                        scope.folded = false;
                    } else {
                        $(elem).find('.nav').slideUp();
                        scope.folded = true;
                    }
                };

            },
        };
    })
    .directive('confirmDialog', function () {
        return {
            restrict: 'E',
            scope: {
                title: "@",
                msg: "@",
                action: "&",
                confirmDialogShown: "=",
            },
            templateUrl: "/static/js/templates/common/confirmDialog.html",
            link: function (scope, elem, attrs) {
                scope.close_modal = function () {
                    scope.confirmDialogShown = false;
                };
                scope.perform_action = function () {
                    scope.submitted = true;
                    scope.action();
                    scope.close_modal();
                };

                scope.$watch('confirmDialogShown', function (value) {
                    //called when ui-modal is shown
                    if (value) {
                        scope.submitted = false;
                    }
                });
                if (attrs.title) {
                    scope._title = attrs.title;
                } else {
                    scope._title = "Confirm";
                }
                if (attrs.msg) {
                    scope._msg = attrs.msg;
                } else {
                    scope._msg = "Confirm to delete?";
                }
            }
        };
    })
    .directive('stdCenterWrapper', function() {
        return {
            restrict: 'C',
            link: function (scope, elem, attrs) {
                
                $(elem).height($('body').height()-120);
                if( elem.find('.buttom_region').length != 0 ){
                    scope.height = Math.max(130, $('#panel_center').height()/3);
                    $(elem)
                        .splitter({type: 'h', 
                        sizeTop: scope.height});

                    var pushheight = function () {
                        if(scope.height == null)
                            scope.height = elem.find('.upper_region').height();
                        elem.find('.upper_region').height('100%');
                        scope.$broadcast('pushheight');
                    };
                    var popheight = function () {
                        elem.find('.upper_region').height(scope.height);
                        scope.height = null;
                        scope.$broadcast('popheight');
                    }

                    if(elem.hasClass('activable')){
                        pushheight();
                    }

                    scope.$watch('selectedItems', function (value) {
                        if(value && value.length == 1)
                        {
                            elem.addClass('active');
                            if(elem.hasClass('activable'))
                                popheight();
                        }
                        else
                        {
                            elem.removeClass('active');
                            if(elem.hasClass('activable'))
                                pushheight();
                        }
                    })
                }else{
                    elem.find('.upper_region').height('100%');
                }
                
            }
        }
    })
    .directive('dropDownBtn', function () {
        return {
            restrict: 'A',
            scope: {
                disabled: "=",
                onClick: "&",
            },
            link: function (scope, elem, attrs) {
                var e = $(elem);
                e.on('click', function () {
                    if (scope.disabled) {
                        return ;
                    }
                    scope.onClick();
                });

                scope.$watch('disabled', function (newValue) {
                    if (newValue) {
                        e.addClass('dropdown-btn-disabled');
                    } else {
                        e.removeClass('dropdown-btn-disabled');
                    };
                });

                scope.label_toggle = function (option) {
                    var type = option.type;
                    if (type == 'toggle_pause') {
                        if (scope.$parent.selectedItems.length != 1) {
                            return "Pause Instance";
                        }   
                        if (scope.$parent.selectedItems[0].status == 'paused') {
                            return 'Unpause Instance';
                        }
                        return 'Pause Instance';
                    } else if (type == 'toggle_suspend') {
                        if (scope.$parent.selectedItems.length != 1) {
                            return "Suspend Instance";
                        }
                        if (scope.$parent.selectedItems[0].status == 'suspended') {
                            return "Resume Instance";
                        }
                        return "Suspend Instance";
                    } else if (type == 'toggle_stop') {
                        if (scope.$parent.selectedItems.length != 1) {
                            return "Stop";
                        }
                        if (scope.$parent.selectedItems[0].status == 'shutoff'){
                            return "Start Instance";
                        }
                        return "Stop Instance";
                    }
                };
            },
        };
    })
    .directive('pageLoader', function () {
        return {
            restrict: 'E',
            replace: true,
            template: "<div class='page-loader hide'>" +
                        "<span>loading..</span>" +
                      "</div>",
            link: function (scope, elem, attr) {
                scope.$on('load_complete', function () {
                    $(elem).addClass('hide');
                });

                scope.$on('load_start', function () {
                    $(elem).removeClass('hide');
                });
            }
        };
    })
    .directive('notifyWindow', ['$timeout', function ($timeout) {
        return {
            restrict: 'E',
            replace: true,
            templateUrl: '/static/js/templates/common/notify.html',
            link: function (scope, elem, attr) {
                var current_time = function () {
                    var d = new Date();
                    return d.getHours() + ':' + d.getMinutes() + ':' + d.getSeconds();
                };
                scope.msgs = {
                    data: [],
                    push: function (m, level) {
                        this.data.push({
                            date: current_time(),
                            msg: m,
                            level: level
                        });
                    },
                    clean: function () {
                        this.data = []; 
                    }
                };
                scope.$on('log_msg', function (evt, msg, level) {
                    level = level || 'info';
                    scope.msgs.push(msg, level);
                    !scope.display_full && $(elem).find('.notify_min a').fadeOut().fadeIn();
                    $timeout(function () {
                        var last_msg = $(elem).find('.msg_wrapper').last()[0]
                        last_msg && last_msg.scrollIntoViewIfNeeded();
                    }, 100)
                });
            }
        };
    }])
    .directive('uiConfig', function(){
        return {
            restrict: 'A',
            replace: true,
            transclude: true,
            template: "<div><i class='icon-cog'></i><div class='trans-box' ng-transclude><i class='ui-up-arrow'></i></div> </div>",
            link: function(scope, element, attrs) {
                $('.ui-config i').hide();
                $(element).parent().hover(
                    function(){
                        $('.ui-config i').fadeIn();
                    },
                    function(){
                        $('.ui-config i').fadeOut();
                        $('.ui-config div').slideUp(200);
                    }
                );

                $('.ui-config i').on('click',function(){
                $('.ui-config div').slideToggle(200);
                })
            }
        }
    });

app_directives
  .directive('createApplyCode', ['EventCenter', function (EventCenter) {
      return {
          restrict: 'E',
          replace: true,           
          scope: {
              'createApShown': '='
          },
          templateUrl: '/static/js/templates/admin/apply_code/create_ap.html',
          link: function (scope, elem, attrs) {
              scope.submit = function () {
                  var data = {'count': scope.count};
                  EventCenter.trigger('apply_code:create', data);
                  scope.close_create_ap_modal();
              };
              scope.close_create_ap_modal = function () {
                  scope.createApShown = false;
              };   
          }
      };
  }]);

app_directives
    .directive('chart', function() {

        var linker = function(scope, elem, attrs) {
                var page=0;
                var render_paging = function() {
                        if(attrs.withPaging === undefined) return;
                        elem.find('.arrow').click(function(){
                            page+=$(this).hasClass('arrow_left')?-1:1;
                            scope.refresh();
                        });
                    };
                render_paging();

                var x_label_format = function (timestamp) {
                    timestamp = timestamp * 1000;
                    var d = new Date(timestamp),
                        month = d.getMonth() + 1,
                        day = d.getDate(),
                        hour = d.getHours(),
                        min = d.getMinutes();
                    return month + '/' + day +  ' ' + hour + ':' + min;
                };

                var get_time_start = function () {
                    var d = new Date(), time_range;
                    d = d.getTime()/1000;
                    time_range = 60 * scope.timeRange;
                    d = d - time_range;
                    return x_label_format(d);
                };

                scope.resize = function() {
                    if(attrs.width === undefined) scope.width = elem.width();
                    if(attrs.height === undefined) scope.height = elem.height();
                    $('#' + scope.id + "_chart").html('').css({
                        width: scope.width,
                        height: scope.height
                    });

                    elem.addClass('chart');
                };

                var get_query_params = function () {
                    // query params to get data from server
                    return {
                        'id': scope.id,
                        'metric': scope.metric,
                        'statistic_method': scope.statisticMethod,
                        'time_range': scope.timeRange,
                        'time_period': scope.timePeriod
                    };
                };

                var render = function(animate) {

                    if(undefined === $ || undefined === $.jqplot || $('#' + scope.id + "_chart").length == 0) {
                        setTimeout(render, 200);
                        return;
                    }
                    scope.resize();

                    scope.option = {};

                    //std setting
                    scope.option.animate = animate?true:false;
                    scope.option.animateReplot = animate?true:false;

                    scope.option.axes = {
                        xaxis: {
                            renderer: $.jqplot.DateAxisRenderer,
                            tickOptions: {formatString: '%m/%d %H:%M'},
                            min: get_time_start()
                        },
                        yaxis: {
                            tickOptions: {formatString: '%.2f' + window.monitor.options.unit},
                        }
                    };
                    scope.option.series = [
                        {
                            lineWidth:2, 
                            markerOptions: { show: false },
                            rendererOptions: {
                                smooth: true
                            }
                        },
                    ];
                    scope.option.title = attrs.title;
                    if(scope.color() !== undefined) {
                        if(typeof(scope.color()) == 'object') {
                            for(var i in scope.color()) {
                                // console.log('set '+i+'='+scope.color()[i])
                                if(scope.option.series.length <= i) scope.option.series.push({
                                    color: scope.color()[i]
                                });
                                else scope.option.series[i].color = scope.color()[i];
                            }
                        } else {
                            for(var i in scope.option.series)
                            scope.option.series[i].color = scope.color;
                        }
                    }

                    scope.option.highlighter = {
                        show: true,
                        sizeAdjust: 7.5
                    };
                    scope.option.cursor = {
                        show: false,
                        tooltipLocation: 'e'
                    };
                    /**
                    if(scope.source.highlighter) {
                        scope.option.highlighter= {
                            show: true,
                            sizeAdjust: 4
                        };
                        if(typeof scope.source.highlighter == 'object')
                            for(var k in scope.source.highlighter)
                                scope.option.highlighter[k] = scope.source.highlighter[k];
                    }
                    **/
                    var elemid=elemid?elemid:scope.id + "_chart";
                    var jsonurl = '/resource/vm_usage/detail/' + scope.id;
                    var ajaxDataRenderer = function (url) {
                        var res = [[]],
                            params = get_query_params();

                        if (url.indexOf('undefined') !== -1) { // no!
                            return res;
                        }

                        $.ajax({
                            async: false,
                            url: url,
                            data: params,
                            dataType: 'json',
                            success: function (data) {
                                if (data.values.length == 0) {
                                    res[0].push([x_label_format( Date.parse(new Date())/1000 ), 0]);
                                    return res;
                                }
                                var values = data.values;
                                for (var i = 0;i < values.length; i++) {
                                    res[0].push([x_label_format(values[i].x), values[i].y]);
                                }
                            }
                        });
                        return res;
                    };
                    scope.option['dataRenderer'] = ajaxDataRenderer;
                    $.jqplot(elemid, jsonurl, scope.option);

                    var seriesCanvas=elem.find('.jqplot-series-canvas').eq(0);
                    if(seriesCanvas && attrs.withPaging !== undefined) { 
                        var l=elem.find('.arrow.arrow_left').eq(0);
                        l.css({
                            left:seriesCanvas.css('left'),
                            top:seriesCanvas.css('top'),
                            height:seriesCanvas.css('height')
                        });
                        var r=elem.find('.arrow.arrow_right').eq(0);
                        r.css({
                            left:seriesCanvas.css('left').replace('px','')*1
                                +seriesCanvas.css('width').replace('px','')*1
                                -r.width(),
                            top:seriesCanvas.css('top'),
                            height:seriesCanvas.css('height')
                        });
                    }
                };

                var packconfig=function(configoverride){
                    var config=scope.dataconfig();
                    if(config===undefined)
                        config={};
                    if(configoverride)
                        for(var k in configoverride)
                            config[k]=configoverride[k];
                    config.key=scope.datasource;

                    //use inner paging to override config.page
                    if(scope.withPaging!==undefined&&config.page===undefined)
                        config.page=page;
                    return config;
                };

                scope.refresh=function(config){
                    render(true);
                };

                scope.$watch('metric', function (metric) {
                    if (metric === undefined || !scope.chart_shown) return;
                    scope.refresh();
                });
                scope.$watch('id', function (id) {
                    if (id === undefined || !scope.chart_shown) return;
                    scope.refresh();
                });
                scope.$watch('statisticMethod', function (statistic_method) {
                    if (statistic_method === undefined || !scope.chart_shown) return;
                    scope.refresh();
                });
                scope.$watch('timeRange', function (time_range) {
                    if (time_range === undefined || !scope.chart_shown) return;
                    scope.refresh();
                });
                scope.$watch('timePeriod', function (time_period) {
                    if (time_period === undefined || !scope.chart_shown) return;
                    scope.refresh();
                });

                scope.$on('popheight', function () {
                    //refresh the chart when buttom region display"
                    scope.chart_shown = true;
                    scope.refresh();
                });
                scope.$on('pushheight', function () {
                    scope.chart_shown = false;
                });
            };
        return {
            restrict: 'E',
            replace: true,
            scope: {
                charid: "@id",
                width: "@",
                height: "@",
                title: "@",
                color: "&",
                datasource: "@",
                dataconfig: "&",
                withPaging: "@",

                id : '=uuid',
                metric: '=',
                statisticMethod: '=',
                timeRange: '=',
                timePeriod: '='
            },
            template:   '<div class="chart">'
                            +'<div id="{{id}}_chart" style="float:left">'
                                +'<p style="color:#777;text-align:center">loading...</p>'
                            +'</div>'
                            //+'<div class="arrow arrow_left" ng-show="withPaging"><i class="icon-chevron-left"></i></div>'
                            //+'<div class="arrow arrow_right" ng-show="withPaging"><i class="icon-chevron-right"></i></div>'
                        +'</div>',
            link: linker,
        };
    })
    .directive('smallChart', [function () {
        return {
            restrict: 'E',
            replace: true,
            templateUrl: "/static/js/templates/project/monitor/small_chart.html",
            scope: {
                'chartId': '@',
                'metric': '@',
                'id': '=',
                'timeRange': '=',
                'timePeriod': '=',
            },
            link: function (scope, elem, attrs) {
                var chart_init = false;
                var num_formatter = function (num) {
                    return $.jqplot.sprintf('%.2f', num);
                };
                var metric_title_map = {
                    cpu: 'CPU Utilization',
                    blk_read: 'Disk Read',
                    blk_write: 'Disk Write',
                    nic_outgoing: 'Net Out',
                    nic_incoming: 'Net In',
                    vmnetwork: 'Vmnetwork'
                };
                scope.chart_title = metric_title_map[attrs.metric];

                var x_label_format = function (timestamp) {
                    timestamp = timestamp * 1000;
                    var d = new Date(timestamp),
                        month = d.getMonth() + 1,
                        day = d.getDate(),
                        hour = d.getHours(),
                        min = d.getMinutes();
                    return month + '/' + day +  ' ' + hour + ':' + min;
                };

                var get_time_start = function () {
                    var d = new Date(), time_range;
                    d = d.getTime()/1000;
                    time_range = 60 * scope.timeRange;
                    d = d - time_range;
                    return x_label_format(d);
                };

                var get_query_params = function () {
                    // query params to get data from server
                    return {
                        'id': attrs.id,
                        'metric': attrs.metric,
                        'statistic_method': scope.statistic_method,
                        'time_range': scope.timeRange,
                        'time_period': scope.timePeriod
                    };
                };

                var ajaxDataRenderer = function (url) {
                    var res = [[]],
                        params = get_query_params();
                    $.ajax({
                        async: false,
                        url: url,
                        data: params,
                        dataType: 'json',
                        success: function (data) {
                            if (data.values.length == 0) {
                                res[0].push([x_label_format( Date.parse( new Date())/1000), 0]);
                                return ;
                            }
                            var values = data.values;
                            for (var i = 0;i < values.length; i++) {
                                res[0].push([x_label_format(values[i].x), values[i].y]);
                            }
                        }
                    });
                    return res;
                };

                scope.statistic_methods = [
                    {'value': 'avg', 'name': 'average'},
                    {'value': 'max', 'name': 'max'},
                    {'value': 'min', 'name': 'min'},
                    {'value': 'sum', 'name': 'sum'}
                ];
                scope.statistic_method = scope.statistic_methods[0].value;

                scope.statistic_method_changed = function () {
                    scope.render();
                };


                scope.render = function () {
                    var chart_option = {
                        animate: true,
                        animateReplot: true,
                        //title: attrs.metric,
                        grid: {
                            background: 'white',
                        },
                        axesDefaults: {
                            tickOptions: {
                                showGridline: false,
                            }
                        },
                        axes: {
                            xaxis: {
                                renderer: $.jqplot.DateAxisRenderer,
                                tickOptions: {formatString: '%m/%d %H:%M'},
                                min: get_time_start()
                            },
                            yaxis: {
                                tickOptions: {
                                    formatter: function (format, value) {
                                                   var metric = attrs.metric;
                                                   if (metric == 'cpu') {
                                                       return num_formatter(value) + '%';
                                                   } else {
                                                       //b, kb, mb, gb based on value
                                                       if (value < 1024) {
                                                           return num_formatter(value) + 'B';
                                                       } else if (value < 1024 * 1024) {
                                                           return num_formatter(value / 1024) + 'KB';
                                                       } else if (value < 1024 * 1024 * 1024) {
                                                           return num_formatter(value / 1024 / 1024) + 'MB'; 
                                                       } else {
                                                           return num_formatter(value / 1024 / 1024 / 1024) + 'GB';
                                                       }
                                                   }
                                                    //return '%.2f' + unit_map[attrs.metric]
                                               }
                                },
                            }
                        },
                        series: [
                            {
                                lineWidth:2, 
                                markerOptions: { show: false },
                                rendererOptions: {
                                    smooth: true
                                }
                            },
                        ],
                        highlighter: {
                            sizeAdjust: 7.5
                        },
                        cursor: {
                            style: 'pointer',
                            show: true,
                            showTooltip: true,
                            tooltipLocation: 'e'
                        },
                        dataRenderer: ajaxDataRenderer
                    };

                    var jsonurl = '/resource/vm_usage/detail/' + scope.id;
                    $.jqplot.eventListenerHooks.pop();
                    $.jqplot.eventListenerHooks.push(['jqplotClick', function () {
                        scope.monitor_detail = true;
                    }]);

                    if (scope.current_chart !== undefined) {
                        scope.current_chart.destroy();
                    }

                    scope.current_chart = $.jqplot(scope.chartId + '_chart', jsonurl, chart_option);
                    chart_init = true;
                };

                scope.$watch('timeRange', function (value) {
                    if (chart_init) {
                        scope.render();
                    }
                });

                scope.$watch('timePeriod', function (value) {
                    if (chart_init) {
                        scope.render();
                    }
                });
            
            },
        };
    }]);

app_directives
    .directive('createCouponModal', ['CouponCodeResource', function (CouponCodeResource) {
        return {
            restrict: 'E',
            replace: true,
            scope: {
                'modalShown': '='
            },
            templateUrl: '/static/js/templates/admin/coupon/create_coupon.html',
            link: function (scope, elem, attrs) {
                scope.submit = function () {
                    var data = {
                        'value': scope.value,
                        'count': scope.count
                    };
                    CouponCodeResource.list_resource.create(data, {multi: true}, function(){
                        CouponCodeResource.list_resource.fetch({from_cache:1});
                    });
                    scope.close_modal();
                };
                scope.close_modal = function () {
                    scope.modalShown = false;
                }
            },
        };
    }])
    .directive('loadCouponModal', ['CouponLogResource', function (CouponLogResource) {
        return {
            restrict: 'E',
            replace: true,
            scope: {
                'modalShown': '='
            },
            templateUrl: '/static/js/templates/project/balance/load_coupon.html',
            link: function (scope, elem, attrs) {
                scope.submit = function () {
                    var data = {
                        'code': scope.code
                    };
                    CouponLogResource.list_resource.create(data, null, function () {
                        CouponLogResource.remaining_resource.get(function (res) {
                            scope.$parent.coupon_remaining = res['remaining'];
                        })
                        CouponLogResource.list_resource.fetch({'year': new Date().getFullYear(), 'from_cache': 1});
                    });
                    scope.close_modal();
                };
                scope.close_modal = function () {
                    scope.modalShown = false;
                };
            }
        }
    }]);

app_directives
    .directive('createFlavorModal', ['is_dough_enabled', 'FlavorPool', 'EventCenter',
        function (is_dough_enabled, FlavorPool, EventCenter) {
        return {
            restrict: 'E',
            replace: true,           
            scope: {
                'modalShown': '='
            },
            templateUrl: "/static/js/templates/admin/flavor/create_flavor.html",
            link: function (scope, elem, attrs) {
              scope.is_dough_enabled = function () {
                return is_dough_enabled();
              };
                scope.submit = function () {
                    var data = {
                        name: scope.name,
                        vcpu: scope.vcpu,
                        ram: scope.ram,
                        disk: scope.disk,
                        ephemeral: scope.ephemeral,
                        swap: scope.swap
                    };
                    if (scope.is_dough_enabled()) {
                      data['hourly'] = scope.hourly;
                      data['monthly'] = scope.monthly;
                    }
                    EventCenter.trigger('flavor:create', data);
                    scope.close_modal();
                };
                scope.close_modal = function () {
                    scope.modalShown = false;
                };
            }
        }
    }])
    .directive('flavorNameValid', ['FlavorPool', function (FlavorPool) {
        return {
            restrict: 'A',
            require: 'ngModel',
            link: function (scope, elem, attr, ctrl) {
                scope.flavor_name_valid =  function (value) {
                    var flavors = FlavorPool.fetch();
                    for (var i=0; i < flavors.length; i++) {
                        var flavor = flavors[i];
                        if (flavor.name == value) {
                            return false;
                        }
                    }
                    return true;
                };
                ctrl.$parsers.unshift(function (value) {
                    if (scope.flavor_name_valid(value))  {
                        ctrl.$setValidity('flavor_name_valid', true);
                        return value;
                    } 
                    ctrl.$setValidity('flavor_name_valid', false);
                    return value;
                });
            }
        };
    }]);

app_directives
    .directive('allocateIp', ['FloatingIpPoolPool', 'EventCenter',
        function (FloatingIpPoolPool, EventCenter) {
        return {
            restrict: 'E',
            replace: true,
            scope: {
                allocateIpShown: "="
            },
            templateUrl: '/static/js/templates/project/floating_ip/allocate_ip.html',
            link: function (scope, elem, attr) {
                scope.$watch('allocateIpShown', function (newValue) {
                    if (!newValue) return;
                    scope.pool_list = FloatingIpPoolPool.fetch(function (pools) {
                            scope.ip_pool = pools[0];
                            return pools;
                    });
                });
                scope.submit_allocate_ip = function () {
                    var data = {'pool': scope.ip_pool.name};
                    EventCenter.trigger('floating_ip:allocate', data);
                    scope.closeModal();
                };
                scope.closeModal = function () {
                    scope.allocateIpShown = false;
                };
            }
        };   
    }])
    .directive('associateIp', ['FloatingIpPool', 'InstancePool', 'EventCenter',
        function (FloatingIpPool, InstancePool, EventCenter) {
        return {
            restrict: 'E',
            replace: true,
            scope: {
                associateIpShown: "="
            },
            templateUrl: '/static/js/templates/project/floating_ip/associate_ip.html',
            link: function (scope, elem, attr) {
                scope.submit = function () {
                    data = {"action": 'associate', 'instance_uuid': scope.instance_uuid};
                    EventCenter.trigger('floating_ip:associate', scope.$parent.selectedItems[0].id, data);
                    scope.closeModal();
                };
                scope.$watch('associateIpShown', function (nValue, oValue) {
                    if (nValue === oValue) return;
                    scope.instance_list = InstancePool.fetch(function (instances) {
                        scope.instance_uuid = instances[0].id;
                        return instances;
                    });
                });
                scope.closeModal = function () {
                    scope.associateIpShown = false;
                };
                scope.$on('associate_ip_shown', function () {
                    scope.floating_ip = scope.$parent.selectedItems[0].ip;
                });
            }
        };
    }]);

app_directives
    .directive('modalHeader', function () {
        return {
            restrict: 'E',
            replace: true,
            scope: {
                'title': '@'
            },
            templateUrl: '/static/js/templates/common/modal_header.html',
            link: function (scope, elem, attr){
                scope.close = scope.$parent.closeModal;
            }
        };
    })
    .directive('modalFooter', ['form_valid', function (form_valid) {
        return {
            restrict: 'E',
            replace: true,
            scope: {
                cancelText: "@",
                okText: "@",
                formInvalid: "=",
                completeUpload: "="
            },
            templateUrl: '/static/js/templates/common/modal_footer.html',
            link: function (scope, elem, attr) {
                scope._cancelText = attr.cancelText || "Cancel";
                scope._okText = attr.okText || "Create";
                scope.close = scope.$parent.closeModal;
                scope.form_invalid = function () {
                    var parent_form = $(elem).parent('form');
                    if (!form_valid(parent_form[0])) return true;
                    return scope.formInvalid?scope.formInvalid():false;
                };
            }
        };
    }])
    .directive('modalDesc', function () {
        return {
            restrict: 'E',
            replace: true,
            scope: {
                title: "@",
                desc: "@"
            },
            templateUrl: '/static/js/templates/common/modal_desc.html',
            link: function (scope, elem, attr) {
                scope._title = attr.title || "Description";
            }
        };
    })
    .directive('bInput', ['$compile', function ($compile) {
        return {
            restrict: 'E',
            replace: true,
            scope: {
                type: "@",
                label: "@",
                value: "=",
                name: "@",
                placeholder: "@",
                model: "=",
                required: "@",
                validate: "@"
            },
            templateUrl: '/static/js/templates/common/bootstrap_input.html',
            link: function (scope, elem, attr) {
                scope._required = eval(attr.required === undefined?true: attr.required);
                var validate = attr.validate===undefined?'':eval(attr.validate).join(' '),
                    type = attr.type || 'text',
                    placeholder = attr.placeholder|| '',
                    name = attr.name || '';
                var input = '<input ' + 'value="{{value}}" name="' + name + '" type="' + type + '" placeholder="' + placeholder + '" ng-model="model" ng-required="_required" ' + validate +'>' +
                            '</input>';
                $(elem).find('.controls').append($compile(input)(scope));
            }
        };
    }])
    .directive('bSelect', ['$compile', function ($compile) {
        return {
            restrict: 'E',
            replace: true,
            scope: {
                label: "@",
                model: "=",
                name: "@",
                required: "@",
                options: "=",
                optionId: "@",
                optionName: "@"
            },
            templateUrl: '/static/js/templates/common/bootstrap_input.html',
            link: function (scope, elem, attr) {
                scope._required = eval(attr.required||true);
                var optionId = attr.optionId || "id",
                    optionName = attr.optionName || "name",
                    name = attr.name || "";
                var option_str = "item."+ optionId + " as item." + optionName + " for item in options";
                var select = '<select name="' + name + '" ng-model="model" ng-required="_required" ng-options="'+ option_str + '">' +
                             '</select>';
                $(elem).find('.controls').append($compile(select)(scope));
            }
        };
    }])
    .directive('bTextarea', ['$compile', function ($compile) {
        return {
            restrict: 'E',
            replace: true,
            scope: {
                label: "@",
                model: "=",
                required: "@",
            },
            templateUrl: '/static/js/templates/common/bootstrap_input.html',
            link: function (scope, elem, attr) {
                scope._required = eval(attr.required||false);
                var textarea = "<textarea ng-model='model' ng-required='_required'/>"
                $(elem).find('.controls').append($compile(textarea)(scope));
            }
        };
    }]);

app_directives
    .directive('integer', function () {
        // check whether the input it's integer
        var INTEGER_REGEXP = /^\-?\d*$/;
        return {
            require: 'ngModel',
            link: function(scope, elm, attrs, ctrl) {
              ctrl.$parsers.unshift(function(viewValue) {
                if (INTEGER_REGEXP.test(viewValue)) {
                  // it is valid
                  ctrl.$setValidity('integer', true);
                  return viewValue;
                } else {
                  // it is invalid, return undefined (no model update)
                  ctrl.$setValidity('integer', false);
                  return undefined;
                }
              });
            }
        };
    })
    .directive('intRange', function () {
        // check whether a num is in range
        return {
            restrict: 'A',
            require: 'ngModel',
            link: function (scope, element, attrs, ctrl) {
                var range = angular.fromJson(attrs.intRange),
                    min = range[0],
                    max = range[1];
                ctrl.$parsers.unshift(function (value) {
                    if (value < min  || value > max) {
                        ctrl.$setValidity('int_valid', false);
                        return undefined;
                    }
                    ctrl.$setValidity('int_valid', true);
                    return value;
                });
            }
        };
    })
    .directive('sourceValid', function () {
        // directive for check source format
        return {
            restrict: 'A',
            require: 'ngModel',
            link: function (scope, element, attrs, ctrl) {
                ctrl.$parsers.unshift(function (value) {
                    var SOURCE_REG = /^(25[0-5]|2[0-4]\d|[0-1]?\d?\d)(\.(25[0-5]|2[0-4]\d|[0-1]?\d?\d)){3}\/(3[0-2]|[1-2]?\d)$/;
                    if (SOURCE_REG.test(value)) {
                        ctrl.$setValidity('source_valid', true);
                        return value;
                    }
                    ctrl.$setValidity('source_valid', false);
                    return undefined;
                });
            }
        };
    })
    .directive('portRangeValid', function () {
        // directive for check port range in form
        return {
            restrict: 'A',
            require: 'ngModel',
            link: function (scope, element, attrs, ctrl) {
                ctrl.$parsers.unshift(function (value) {
                    var PORT_RANGE_REG = /^(\d+)$|^(\d+)\s*-\s*(\d+)$/,
                        match = PORT_RANGE_REG.exec(value);

                    var check_port_range = function (port) {
                        var min = 1, max = 65535;
                        return port >= min && port <= max;
                    };

                    if (match != null) {
                        if (match[1] != undefined) {
                        //only enter one port
                            if (!check_port_range(match[1])) {
                                ctrl.$setValidity('port_range_valid', false);
                                return undefined;
                            }
                        } else {
                        //enter two port
                            if (!check_port_range(match[2])
                                    || !check_port_range(match[3])) {

                                ctrl.$setValidity('port_range_valid', false);
                                return undefined;
                            }
                            if (match[2] >= match[3]) {
                                ctrl.$setValidity('port_range_valid', false);
                                return undefined;
                            }
                        }
                        ctrl.$setValidity('port_range_valid', true);
                        return value;
                    }
                    ctrl.$setValidity('port_range_valid', false);
                    return undefined;
                });
            }
        };
    });

app_directives
    .directive('createImage', function () {
        return {
            restrict : 'E',
            replace: true,
            scope: {
                modalShown: '='
            },
            templateUrl: '/static/js/templates/admin/image/create_image.html',
            link: function (scope, elem, attr) {
                scope.closeModal = function () {scope.modalShown = false};
                scope.image_formats = [
                    {id: 'aki', name: 'AKI - Amazon Kernel Image'},
                    {id: 'ami', name: 'AMI - Amazon Machine Image'},
                    {id: 'ari', name: 'ARI - Amazzon Ramdisk Image'},
                    {id: 'iso', name: 'ISO - optical Disk Image'},
                    {id: 'qcow2', name: 'QCOW2 - QEMU Emulator'},
                    {id: 'raw', name: 'Raw'},
                    {id: 'vdi', name: 'VDI'},
                    {id: 'vhd', name: 'VHD'},
                    {id: 'vmdk', name: 'VHDK'}
                ];
                scope.form_invalid = function () {
                    if (!scope.disk_format) return true;
                    if (!scope.copy_from && $(elem).find("input[type=file]")[0].value ==  "") return true;
                }
                scope.complete_upload = function (content, result) {
                    console.log(content);
                    console.log(result);
                }
                scope.csrf_token = $.cookie('csrftoken');
            }
        };
    });

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
    }]);

app_directives
    .directive('keypairmodal', ['$timeout', 'ApiList', 'KeypairPool', 'EventCenter', function ($timeout, ApiList, KeypairPool, EventCenter) {
        return {
            restrict: 'E',
            replace: true,
            scope: {
                keypairModalShown: "=",
                importKeypair: "=",
            },
            templateUrl: "/static/js/templates/project/keypair/keypair_modal.html",
            link: function (scope, elem, attrs) {
                scope.key_exist = function (key) {
                  return KeypairPool.fetch(function (keys) {
                            for (var i=0; i < keys.length;i++) {
                              if (keys[i].name == key) return false;
                            }
                            return true;
                          });
                }
                scope.create_url = ApiList.get('keypair', 'create_keypair');
                scope.refresh_keypairs = function () {
                    scope.$parent.keypairs = KeypairPool.query(function(res){
                        scope.$parent.instance_keypair = scope.$parent.keypairs[0];
                        return res;
                    });
                };
                scope.import_keypair = function (keypair_name, public_key) {
                  var data = {'name': keypair_name,
                             'public_key': public_key};
                  EventCenter.trigger('keypair:import', data);
                };
                scope.close_keypair_modal = function () {
                    scope.keypairModalShown = false;
                };
                scope.can_submit=function(keypair_form){
                    return (scope.importKeypair&&
                                keypair_form.keypair_name.$valid&&keypair_form.public_key.$valid
                            )||(
                                (!scope.importKeypair)&&
                                keypair_form.keypair_name&&keypair_form.keypair_name.$valid
                            );
                };
                scope.submit_keypair=function(keypair_form){
                    if (scope.importKeypair) {
                        scope.import_keypair(scope.keypair_name, scope.public_key);
                        scope.close_keypair_modal();
                    } else {
                        (function($){
                            if($('iframe#temp-download').length){
                                $('iframe#temp-download').attr('src',scope.create_url + '/' + scope.keypair_name);
                            } else{
                                $('<iframe></iframe>').attr({
                                    'id' : 'temp-download',
                                    'src' : scope.create_url + '/' + scope.keypair_name
                                }).appendTo('body:eq(0)').hide();
                            }
                        })(jQuery);

                        scope.close_keypair_modal();
                        $timeout(scope.refresh_keypairs, 1000); //waiting
                    }
                };
            },
        };
    }])
    .directive('keypairNameValid', ['KeypairPool', function (KeypairPool) {
        return {
            restrict: 'A',
            require: 'ngModel',
            link: function (scope, element, attrs, ctrl) {
                scope.key_name_valid = function (key_name) {
                    var keys = KeypairPool.fetch();
                    for (var i = 0; i < keys.length; i++) {
                        if (keys[i].name == key_name) {
                            console.log('exist');
                            return false;
                        }
                    }
                    return true;
                };
                ctrl.$parsers.unshift(function (value) {
                    if (scope.key_name_valid(value)) {
                        ctrl.$setValidity('key_name_valid', true);
                        return value;
                    }
                    ctrl.$setValidity('key_name_valid', false);
                    return value;
                });
            },
        };   
    }]);

app_directives
    .directive('loadbalancermodal',
        ['LBPool', 'InstancePool', 'EventCenter',
          function (LBPool, InstancePool, EventCenter) {
        return {
            restrict: 'E',
            replace: true,
            scope: {
                modalShown: "=",
                editLoadBalancer: '='
            },
            templateUrl: "/static/js/templates/project/load_balancer/load_balancer_modal.html",
            link: function (scope, elem, attrs) {
                scope.load_balancer_name="";
                scope.instances = InstancePool.fetch();
                scope.$watch('modalShown', function (newValue) {
                    if (!newValue) return;
                    if (scope.editLoadBalancer) {
                        var selected = scope.$parent.selectedItems[0];
                        scope.id = selected.id;
                        scope.load_balancer_name = selected.name;
                        scope.protocol = selected.protocol;
                        scope.instance_port = selected.instance_port;
                        scope.balancing_method = selected.config.balancing_method;
                        scope.server_name = selected.http_server_names;
                        scope.instance = selected.instance_uuids;
                    }
                });
                scope.submit = function () {
                    var protocol = scope.protocol, data;
                    data = {
                        name: scope.load_balancer_name,
                        protocol: scope.protocol,
                        instance_port: parseInt(scope.instance_port),
                        instance_uuids: scope.instance,
                        config: {
                            'balancing_method': scope.balancing_method,
                            'health_check_target_path': '/',
                            'health_check_timeout_ms': 5000,
                            'health_check_interval_ms': 30000,
                            'health_check_healthy_threshold': 5,
                            'health_check_unhealthy_threshold': 3
                        }
                    };
                    if (protocol == 'http') {
                        data['http_server_names'] = scope.server_name;
                    }
                    if (scope.editLoadBalancer) {
                      EventCenter.trigger('load_balancer:update', scope.id, data);
                    } else {
                      EventCenter.trigger('load_balancer:create', data);
                    }
                    scope.close_modal();
                };
                scope.close_modal = function () {
                    scope.modalShown = false;
                };
                scope.can_submit=function(form){
                    return form.load_balancer_name.$valid
                        &&form.protocol.$valid
                        &&form.instance_port.$valid
                        &&form.balancing_method.$valid
                        &&form.instance.$valid
                        &&(form.protocol.$modelValue=="tcp"||form.server_name.$valid);
                };
            },
        };
    }])
    .directive('loadBalancerNameValid', function () {
        return {
            restrict: 'A',
            require: 'ngModel',
            link: function (scope, element, attrs, ctrl) {
                scope.max_length_limit = function (data) {
                    return data.length<=40;
                };
                scope.illegal_characters = function (data) {
                    return /^[a-zA-Z0-9]*?$/.test(data);
                };
                ctrl.$parsers.unshift(function (value) {
                    ctrl.$setValidity('max_length_limit', scope.max_length_limit(value));
                    ctrl.$setValidity('illegal_characters', scope.illegal_characters(value));
                    return value;
                });
            },
        };   
    })
    .directive('instancePortValid', function () {
        return {
            restrict: 'A',
            require: 'ngModel',
            link: function (scope, element, attrs, ctrl) {
                scope.valid = function (data) {
                    return data>0&&data<=65536;
                };
                ctrl.$parsers.unshift(function (value) {
                    ctrl.$setValidity('valid', scope.valid(value));
                    return value;
                });
            },
        };   
    })
    .directive('serverNameValid', function () {
        return {
            restrict: 'A',
            require: 'ngModel',
            link: function (scope, element, attrs, ctrl) {
                scope.baddomain = function (data) {
                    return /^[a-zA-Z0-9][a-zA-Z0-9]{0,62}(\.[a-zA-Z0-9][a-zA-Z0-9]{0,62})*$/.test(data);
                };
                ctrl.$parsers.unshift(function (value) {
                    if(value !== "")
                        ctrl.$setValidity('baddomain', scope.baddomain(value));
                    return value;
                });
            },
        };
    });

app_directives
    .directive('quotaitem', ['$filter', function ($filter) {
        // quota item in overview page
        return {
            restrict: 'E',
            replace: true,
            scope: {
                resourceName: "=",
                resourceRawLimit: "=", // raw limit data
                resourceRawUsed: "=", // raw used data
                flavorSelected: "=",
                copies: "=",
            },
            template: "<div class='quota_item_wrapper'>" +
                          "<div class='quota_title clearfix'>" +
                            "<a class='title'>" +
                                "{{resourceName|i18n}}(<span>{{format_display(resourceRawUsedScoped)}} {{'used'|i18n}}</span>)" +
                            "</a>" +
                            "<p class='limit' ng-hide='resourceRawLimit == null'>" +
                                "{{format_display(resourceRawLimit)}} total" +
                            "</p>" +
                          "</div>" +
                          "<div class='quota_bar'>" +
                              "<div class='progress progress-striped active'>" +
                                "<div class='bar' ng-class='{\"bar-warning\": resourcePercent>50 && resourcePercent<100, \"bar-danger\": resourcePercent>=100}' style='width: {{resourcePercent}}%'>" +
                                "</div>" +
                              "</div>" +
                          "</div>" +
                      "</div>"
            ,
            link: function (scope, elem, attrs) {
                var gb_format_filter = $filter('gb_format'),
                    mb_format_filter = $filter('mb_format');
                scope.format_display = function (value) {
                    if (scope.resourceName == 'gigabytes') {
                        return gb_format_filter(value);
                    } else if (scope.resourceName == 'ram') {
                        return mb_format_filter(value);
                    }
                    return value;
                }
                scope.$watch('resourceRawUsed', function (raw_used) {
                    if (raw_used !== undefined) {
                        scope.resourceRawUsedScoped = raw_used; // only work in the directive
                    }
                });
                scope.$watch('resourceRawUsedScoped', function (raw_used_scoped) {
                    if (raw_used_scoped !== undefined && raw_used_scoped !== null ) {
                        scope.resourcePercent = scope.resourceRawUsedScoped / scope.resourceRawLimit * 100;
                    }
                });
                scope.$watch('flavorSelected', function (flavor) {
                    if (flavor !== undefined && scope.copies !== undefined) {
                        var origin_used = parseInt(scope.resourceRawUsed),
                            copies = scope.copies;
                        if (scope.resourceName == 'cores') {
                            scope.resourceRawUsedScoped = origin_used + parseInt(flavor.vcpus) * copies;
                        } else if (scope.resourceName == 'gigabytes') {
                            scope.resourceRawUsedScoped = origin_used + parseInt(flavor.disk) * copies; //disk or ephemeral ?
                        } else if (scope.resourceName == 'instances') {
                            scope.resourceRawUsedScoped = origin_used + 1 * copies;
                        } else if (scope.resourceName == 'ram') {
                            scope.resourceRawUsedScoped = origin_used + parseInt(flavor.ram) * copies;
                        } else {
                            scope.resourceRawUsedScoped = origin_used;
                        }
                    }
                });
                scope.$watch('copies', function (copies) {
                    if (copies !== undefined && scope.flavorSelected !== undefined) {
                        var origin_used = parseInt(scope.resourceRawUsed),
                            flavor = scope.flavorSelected;
                        if (scope.resourceName == 'cores') {
                            scope.resourceRawUsedScoped = origin_used + parseInt(flavor.vcpus) * copies;
                        } else if (scope.resourceName == 'gigabytes') {
                            scope.resourceRawUsedScoped = origin_used + parseInt(flavor.disk) * copies; //disk or ephemeral ?
                        } else if (scope.resourceName == 'instances') {
                            scope.resourceRawUsedScoped = origin_used + 1 * copies;
                        } else if (scope.resourceName == 'ram') {
                            scope.resourceRawUsedScoped = origin_used + parseInt(flavor.ram) * copies;
                        } else {
                            scope.resourceRawUsedScoped = origin_used;
                        }
                    }
                });
            }
        }
    }])
    .directive('launchnode', function () {
        // node for launch instance in overview page
        return {
            restrict: 'E',
            replace: true,
            scope: {
                availableInstance: "=",
                onClick: "&", // click to open launch instance dialog
            },
            template: "<div class='node large' ng-click='onClick()'>" +
                        "<div class='node-inner launch'>" +
                            "<span class='content'>" +
                                "<div>" +
                                    "<h1>" +
                                        "{{availableInstance}}" +
                                    "</h1>" +
                                    "<q>" +
                                        "{{'available'|i18n}}" +
                                    "</q>" +
                                "</div>" +
                                "<div>" +
                                    "<h1>" +
                                        "+" +
                                    "</h1>" +
                                    "<q>" +
                                        "{{'launch'|i18n}}" +
                                    "</q>" +
                                "</div>" +
                            "</span>" +
                        "</div>" +
                      "</div>",
        };
    })
    .directive('instancenode', [function () {
        // node for instance in overview page
        return {
            restrict: 'E',
            scope: {
                name: "=",
                instanceUuid: "=",
                flavorName: "=",
                status: "=",
                uptime: "="
            },
            replace: true,
            template: "<div class='node large'>" +
                                "<div class='node-inner' ng-class='status|instance_class_filter'>" +
                                    "<span class='content'>" +
                                        "<div>{{name}}</div>" +
                                        "<div>{{flavorName}}</div>" +
                                        "<div>{{'uptime'|i18n}}:{{uptime|uptime_format}}</div>"+
                                    "</span>" +
                                "</div>" +
                              "</div>",
        };
    }]);

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

app_directives
    .directive('sg', ['$filter', 'EventCenter', function ($filter, EventCenter) {
        return {
            restrict: 'E',
            replace: true,
            scope: {
                modalShown: "=",
                updateSg: "=",
            },
            templateUrl: "/static/js/templates/project/security_group/sg.html",
            link: function (scope, elem, attrs) {
                var i18nFilter = $filter('i18n');
                // tooltip info
                scope.name_not_null = i18nFilter('name not null');
                scope.desc_not_null = i18nFilter('description not null');
                scope.port_range_info = i18nFilter('port range info');
                scope.icmp_type_info = i18nFilter('type info');
                scope.icmp_code_info = i18nFilter('code info');
                scope.source_info = i18nFilter('source info');

                scope.quick_rules=[];
                scope.quick_rules.push([{
                    "name": "SAE Bridge",
                    "protocol": "tcp",
                    "port_range": "1-65535",
                    "source": "0.0.0.0/0"
                  }, {
                    "name": "All TCP",
                    "protocol": "tcp",
                    "port_range": "1-65535",
                    "source": "0.0.0.0/0"
                  }, {
                    "name": "All UDP",
                    "protocol": "udp",
                    "port_range": "1-65535",
                    "source": "0.0.0.0/0"
                  }, {
                    "name": "All ICMP",
                    "protocol": "icmp",
                    "type": "-1",
                    "code": "-1",
                    "source": "0.0.0.0/0"
                }]);
                scope.quick_rules.push([{
                    "name": "SSH",
                    "protocol": "tcp",
                    "port_range": "22",
                    "source": "0.0.0.0/0"
                  }, {
                    "name": "MySQL",
                    "protocol": "tcp",
                    "port_range": "3306",
                    "source": "0.0.0.0/0"
                  }, {
                    "name": "DNS",
                    "protocol": "udp",
                    "port_range": "53",
                    "source": "0.0.0.0/0"
                  }, {
                    "name": "RDP",
                    "protocol": "tcp",
                    "port_range": "3389",
                    "source": "0.0.0.0/0"
                }]);
                scope.quick_rules.push([{
                    "name": "HTTP",
                    "protocol": "tcp",
                    "port_range": "80",
                    "source": "0.0.0.0/0"
                  }, {
                    "name": "HTTPS",
                    "protocol": "tcp",
                    "port_range": "443",
                    "source": "0.0.0.0/0"
                  }, {
                    "name": "POP3",
                    "protocol": "tcp",
                    "port_range": "110",
                    "source": "0.0.0.0/0"
                  }, {
                    "name": "POP3S",
                    "protocol": "tcp",
                    "port_range": "995",
                    "source": "0.0.0.0/0"
                }]);
                scope.quick_rules.push([{
                    "name": "SMTP",
                    "protocol": "tcp",
                    "port_range": "25",
                    "source": "0.0.0.0/0"
                  }, {
                    "name": "SMTPS",
                    "protocol": "tcp",
                    "port_range": "465",
                    "source": "0.0.0.0/0"
                  }, {
                    "name": "IMAP",
                    "protocol": "tcp",
                    "port_range": "143",
                    "source": "0.0.0.0/0"
                  }, {
                    "name": "IMAPS",
                    "protocol": "tcp",
                    "port_range": "993",
                    "source": "0.0.0.0/0"
                }]);

                //rule saving

                scope.rule_categories=[
                    {protocol:'tcp',cols:{'1.protocol':'TCP','2.port_range':'Port Range','3.source':'Source'}},
                    {protocol:'udp',cols:{'1.protocol':'UDP','2.port_range':'Port Range','3.source':'Source'}},
                    {protocol:'icmp',cols:{'1.protocol':'ICMP','2.type':'Type','3.code':'Code','4.source':'Source'}}
                ];

                scope.category_col_order=function(category){
                    var arr=[];
                    for(var c in category.cols)
                    {
                        var ret=/.\.(\w*)/.exec(c);
                        if(arr.length==0&&ret[1]=='protocol')
                        {
                            arr.push('nothing');
                        }
                        else
                        {
                            arr.push(ret[1]);
                        }
                    }
                    return arr;
                };

                scope.rule_mapping=new function(){
                    var data={};
                    var counter={};

                    this.all = function () {
                        return data;
                    }
                    this.count=function(protocol){
                        if(protocol!==undefined)
                            return counter[protocol];
                        return counter.tcp+counter.udp+counter.icmp;
                    };

                    this.add=function(rule){
                        if(typeof(rule)=='Array')
                        {
                            //batch add rules
                            for(var i in rule)
                                this.add(rule[i]);
                            return;
                        }
                        if (rule.protocol === null) return;
                        var key=toKey(rule);
                        if(data[rule.protocol][key]!==undefined)
                        {
                            //rule exists;
                            return;
                        }
                        data[rule.protocol][key]=rule;
                        counter[rule.protocol]++;
                    };

                    this.has=function(rule){
                        var ret=data[rule.protocol][toKey(rule)]!==undefined;
                        return ret;
                    };

                    this.toggle=function(rule){
                        if(this.has(rule))
                            this.remove(rule);
                        else
                            this.add(rule);
                    }

                    this.get=function(protocol){
                        // console.log(data[protocol]);
                        return data[protocol];
                    };

                    this.getRaw=function(inline){
                        if(inline)
                        {
                            var arr=[];
                            for(var p in data)
                            {
                                for(var k in data[p])
                                    arr.push(data[p][k]);
                            }
                            return arr;
                        }
                        return data;
                    }

                    this.remove=function(rule){

                        var key=toKey(rule);
                        if(data[rule.protocol][key]===undefined)
                        {
                            //rule not exists
                            return;
                        }

                        delete data[rule.protocol][key];
                        counter[rule.protocol]--;
                    };

                    this.reset=function(){
                        data={
                            'tcp':{},
                            'udp':{},
                            'icmp':{}
                        };
                        for(var k in data)
                            counter[k]=0;
                    };
                    this.reset();

                    var toKey=function(rule) {
                        switch(rule.protocol)
                        {
                            case 'tcp':
                            case 'udp':
                                //#fix sort by port_range(first num)
                                return (/\d*/.exec(rule.port_range)*1+100000)+'#'+rule.port_range+'@'+rule.source;
                            case 'icmp':
                                return rule.type+'@'+rule.code+'@'+rule.source;
                                break;
                        }
                    };
                };
                scope.create_sg = function (data) {
                  EventCenter.trigger('sg:create', data);
                  scope.close_sg_modal();
                };
                scope.update_sg = function (id, data) {
                    EventCenter.trigger('sg:update', id, data);
                    scope.close_sg_modal();
                };

                scope.$watch('modalShown', function (newValue) {
                    if (newValue) {
                        scope.rule_mapping.reset();
                        if (scope.updateSg) {
                            var rules = scope.$parent.selectedItems[0].rules;
                            for (var i=0; i < rules.length; i++) {
                                var rule = {
                                    'source': rules[i].source,
                                    'protocol': rules[i].ip_protocol,
                                };
                                if (rules[i].ip_protocol == 'icmp') {
                                    rule['type'] = rules[i].from_port;
                                    rule['code'] = rules[i].to_port;
                                } else {
                                    if (rules[i].from_port == rules[i].to_port) {
                                        rule['port_range'] = rules[i].from_port;
                                    } else {
                                        rule['port_range'] = rules[i].from_port + '-' + rules[i].to_port;
                                    }
                                }
                                scope.rule_mapping.add(rule);
                            }
                        }
                    };
                });

                var port_range_format = function (port_range) {
                        var ports = port_range.toString().split('-'),
                            start_port, end_port;
                        if (ports.length == 1) {
                            start_port = end_port = ports[0];
                        } else if (ports.length == 2) {
                            start_port = $.trim(ports[0]);
                            end_port = $.trim(ports[1]);
                        }
                        return {
                            'from_port': start_port,
                            'to_port': end_port
                        };
                };
                scope.close_sg_modal = function () {
                    scope.modalShown = false;
                };
                scope.new_rule=function(sg_form){
                    var ports = port_range_format(sg_form.port_range.$modelValue),
                        port_range;
                    if (ports.from_port == ports.to_port) {
                        port_range = ports.from_port;   
                    } else {
                        port_range =  ports.from_port + '-' + ports.to_port;
                    }
                    scope.rule_mapping.add({
                        protocol: sg_form.protocol.$modelValue,
                        port_range: port_range,
                        type: sg_form.type.$modelValue,
                        code: sg_form.code.$modelValue,
                        source: sg_form.source.$modelValue
                    });
                };
                scope.can_submit=function(sg_form){
                    return (scope.updateSg||sg_form.sg_name&&sg_form.sg_desc
                        &&sg_form.sg_name.$valid&&sg_form.sg_desc.$valid);
                };
                scope.add_rule_valid=function(sg_form){
                    return ((sg_form.protocol.$modelValue=='tcp'
                                ||sg_form.protocol.$modelValue=='udp')
                            &&sg_form.port_range.$valid
                            &&sg_form.source.$valid
                            )
                            ||
                            ((sg_form.protocol.$modelValue=='icmp')
                            &&sg_form.type.$valid
                            &&sg_form.code.$valid
                            &&sg_form.source.$valid
                            );
                };
                scope.submit_sg=function(sg_form){
                    var rules = scope.rule_mapping.getRaw(true),
                        rules_post = [];

                    for (var i=0; i<rules.length; i++) {
                        var rule = rules[i],
                            from_port, to_port;
                        if (rule.protocol == 'icmp') {
                            from_port = rule.type;
                            to_port = rule.code;
                        } else {
                            var port_range = port_range_format(rule.port_range);
                            from_port = port_range.from_port,
                            to_port = port_range.to_port;
                        }
                        rules_post.push({'ip_protocol': rule.protocol,
                                         'from_port': from_port,
                                         'to_port': to_port,
                                         'source': rule.source});

                    }
                    var formdata={
                        rules: rules_post
                    };
                    if(!scope.updateSg)
                    {
                        formdata.name = sg_form.sg_name.$modelValue;
                        formdata.description = sg_form.sg_desc.$modelValue;
                        scope.create_sg(formdata);
                    } else {
                        var id = scope.$parent.selectedItems[0].id;
                        formdata.name = scope.$parent.selectedItems[0].name;
                        formdata.description = scope.$parent.selectedItems[0].description;
                        scope.update_sg(id, formdata);
                    }
                }
            },
        };
    }]);

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

app_directives
  .directive('swiftList', ['EventCenter', function ($EventCenter) {
      return {
          restrict: 'E',
          scope : true,
          replace:true,
          template : '<div class="swift-list">'
           + '<div class="swift-list-paths">'
           + '<span class="swift-list-path" ng-repeate="path in paths">{{path.name}}</span>'
           + '</div><div class="swift-list-grid" ng-grid="{data:\"files\"}"></div></div>',
          link: function ($scope, $elem, $attrs) {
            if( !('swift-data-name' in $attrs ) || !(attrs['swift-data-name']) in $scope.$parent ){
              return;
            }

            $scope.files = $scope.$parent[attrs['swift-data-name']];
            $scope.paths = [];
            $scope.changePath = function( path ){
              $EventCenter.trigger("swift:changePath", path );
            }

            $scope.createFolder = function(){

            }

            $scope.uploadFile = function(){

            }
          }
      };
  }]);
app_directives
    .directive('createUserModal', ['ProjectPool', 'UserPool', 'EventCenter',
        function (ProjectPool, UserPool, EventCenter) {
        return {
            restrict: 'E',
            replace: true,
            scope: {
                'modalShown': '=',
                'isEdit': '=',
                'selectedItems': '='
            },
            templateUrl: '/static/js/templates/admin/user/create_user.html',
            link: function (scope, elem, attrs) {
                scope.submit = function () {
                    var data = {
                        'name': scope.name,
                        'email': scope.email,
                        'password': scope.password,
                        'project_uuid': scope.project_uuid,
                        'enabled': scope.enabled
                    };
                    if (scope.isEdit) {
                      EventCenter.trigger('user:update', scope.$parent.selectedItems[0].id, data);
                    } else {
                      EventCenter.trigger('user:create', data);
                    }
                    scope.close_modal();
                };
                scope.$watch('modalShown', function (newValue) {
                    if (!newValue) return;
                    scope.project_list = ProjectPool.fetch(function (projects) {
                        scope.project_uuid = projects[0].id;
                        return projects;
                    });
                });
                scope.close_modal = function () {
                    scope.modalShown = false;
                };
                scope.can_submit=function(form){
                    return (scope.updateSg||sg_form.sg_name&&sg_form.sg_desc
                        &&sg_form.sg_name.$valid&&sg_form.sg_desc.$valid);
                };
                scope.$watch('modalShown', function() {
                    if(!scope.modalShown)
                        return;
                    var flag = scope.isEdit;
                    var item =  scope.$parent.selectedItems[0]; 

                    scope.name = flag? item.name: '';
                    scope.email = flag? item.email: '';
                    scope.password = '';
                    scope.confirm_password = '';
                    scope.project_uuid = flag? 0: 0;
                    scope.enabled = flag? item.enabled: true;
                    $('#input_name')
                        .attr({'name-valid-except': scope.name});
                    
                    if(flag)
                        $('#create_user_form .help-inline').hide();
                });
            }
        };
    }])
    .directive('nameValid', ['UserPool', function (UserPool) {
        return {
            restrict: 'A',
            require: 'ngModel',
            link: function (scope, element, attrs, ctrl) {
                scope.users = UserPool.fetch(); 
                console.log(scope.users);
                ctrl.$parsers.unshift(function (value) {
                    var isRepeated = false;
                    for(var i=0;i<scope.users.length;i++)
                    {
                        if(scope.users[i].name.toLowerCase() === value.toLowerCase())
                        {
                            isRepeated = true;
                            break;
                        }
                    }
                    var except = $('#input_name').attr('name-valid-except');
                    if(!except)
                        except = "";
                    if(value.toLowerCase() == except.toLowerCase())
                        isRepeated = false;
                    ctrl.$setValidity('repeated', !isRepeated);
                    if(!isRepeated)
                        ctrl.$setValidity('required', true);
                    return value;
                });
            }
        }
    }])
    .directive('sameAsValid', function () {
        return {
            restrict: 'A',
            require: 'ngModel',
            link: function (scope, element, attrs, ctrl) {
                scope.sameAs=attrs.sameAs;
                ctrl.$parsers.unshift(function (value) {
                    // scope.lastValue = value;
                    var isSameAs = $(scope.sameAs).val() == value;
                    if(attrs.sameAsValidOff)
                        isSameAs = false;
                    ctrl.$setValidity('same_as_valid', isSameAs);
                    return value;
                });
                // scope.$watch('sameAs', function () {
                //     ctrl.$setValidity('same_as_valid', scope.sameAs == scope.lastValue);
                // });
            }
        };
    })
    .directive('emailFormatValid', function () {
        return {
            restrict: 'A',
            require: 'ngModel',
            link: function (scope, element, attrs, ctrl) {
                ctrl.$parsers.unshift(function (value) {
                    ctrl.$setValidity('email_format_valid', 
                        value == "" || /.@./.test(value));
                    return value;
                });
            }
        };
    })
    .directive('lengthLimitValid', function () {
        return {
            restrict: 'A',
            require: 'ngModel',
            link: function (scope, element, attrs, ctrl) {
                ctrl.$parsers.unshift(function (value) {
                    if(attrs.lengthMin !== undefined)
                        ctrl.$setValidity('too_short', value.length==0 || value.length >= attrs.lengthMin);
                    if(attrs.lengthMax !== undefined)
                        ctrl.$setValidity('too_long', value.length <= attrs.lengthMax);
                    return value;
                });
                if(scope.lengthMin !== undefined)
                    ctrl.$setValidity('too_short', false);
            }
        };
    });

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

"use strict";
var app_module = angular.module('App',
    ['ui', 'ngCookies', 'bootstrap', 'anGrid', 'RestService', 'RestServiceV2',
     'CommonService', 'AppService', 'AppFilter', 'AppDirectives'])
  .value('ui.config', {
        jq: {
            tooltip: {
                placement: 'right'
            },
            popover: {
                'trigger': 'hover',
                'placement': 'bottom'
            }
        }
  })
  .config(['$routeProvider', '$locationProvider', function ($routeProvider, $locationProvider) {
    $routeProvider
      .when('/app/test', 
        {templateUrl: '/static/js/templates/test.html',
         controller: 'TestCtrl'})
      .when('/app/overview',
        {templateUrl: '/static/js/templates/project/overview/index.html',
         controller: 'user.OverviewCtrl'})
      .when('/app/instance',
        {templateUrl: '/static/js/templates/project/instance/index.html',
         controller: 'user.InstanceCtrl'})
      .when('/app/volume',
        {templateUrl: '/static/js/templates/project/volume/index.html',
         controller: 'user.VolumeCtrl'})
      .when('/app/volume_snapshot',
        {templateUrl: '/static/js/templates/project/volume/snapshot.html',
         controller: 'user.VolumeSnapshotCtrl'})
      .when('/app/image',
        {templateUrl: '/static/js/templates/project/image/index.html',
         controller: 'user.ImageCtrl'})
      .when('/app/snapshot',
        {templateUrl: '/static/js/templates/project/snapshot/index.html',
         controller: 'user.SnapshotCtrl'})
      .when('/app/security_group',
        {templateUrl: '/static/js/templates/project/security_group/index.html',
         controller: 'user.SgCtrl'})
      .when('/app/keypair',
        {templateUrl: '/static/js/templates/project/keypair/index.html',
         controller: 'user.KeypairCtrl'})
      .when('/app/floating_ip',
        {templateUrl: '/static/js/templates/project/floating_ip/index.html',
         controller: 'user.FloatingIpCtrl'})
      .when('/app/load_balancer',
        {templateUrl: '/static/js/templates/project/load_balancer/index.html',
         controller: 'user.LBCtrl'})
      .when('/app/monitor',
        {templateUrl: '/static/js/templates/project/monitor/index.html',
         controller: 'user.MonitorCtrl'})
      .when('/app/billing',
        {templateUrl: '/static/js/templates/project/billing/index.html',
         controller: 'user.BillingCtrl'})
      .when('/app/balance',
        {templateUrl: '/static/js/templates/project/balance/index.html',
         controller: 'user.BalanceCtrl'})
      .when('/app/admin_overview',
        {templateUrl: '/static/js/templates/admin/overview/index.html',
         controller: 'admin.OverviewCtrl'})
      .when('/app/admin_instance',
        {templateUrl: '/static/js/templates/admin/instance/index.html',
         controller: 'user.InstanceCtrl'})
      .when('/app/admin_volume',
        {templateUrl: '/static/js/templates/admin/volume/index.html',
         controller: 'admin.VolumeCtrl'})
      .when('/app/admin_service',
        {templateUrl: '/static/js/templates/admin/service/index.html',
         controller: 'admin.ServiceCtrl'})
      .when('/app/admin_flavor',
        {templateUrl: '/static/js/templates/admin/flavor/index.html',
         controller: 'admin.FlavorCtrl'})
      .when('/app/admin_image',
        {templateUrl: '/static/js/templates/admin/image/index.html',
         controller: 'admin.ImageCtrl'})
      .when('/app/admin_project',
        {templateUrl: '/static/js/templates/admin/project/index.html',
         controller: 'admin.ProjectCtrl'})
      .when('/app/admin_user',
        {templateUrl: '/static/js/templates/admin/user/index.html',
         controller: 'admin.UserCtrl'})
      .when('/app/admin_quota',
        {templateUrl: '/static/js/templates/admin/quota/index.html',
         controller: 'admin.QuotaCtrl'})
      .when('/app/admin_coupon',
        {templateUrl: '/static/js/templates/admin/coupon/index.html',
         controller: 'admin.CouponCtrl'})
      .when('/app/admin_apply_code',
        {templateUrl: '/static/js/templates/admin/apply_code/index.html',
         controller: 'admin.ApplyCodeCtrl'})
      .otherwise({redirectTo: '/app/overview'});
    $locationProvider.html5Mode(true);
  }]);

app_module.controller('AppCtrl',
    ['$window', '$filter', '$timeout', '$scope', '$rootScope',
     '$location', '$cookies', 'PanelGroupsResource',
     'RegionsResource', 'LocaleSetting',
     function ($window, $filter, $timeout, $scope, $rootScope,
               $location, $cookies, PanelGroupsResource,
               RegionsResource, LocaleSetting) {
      var i18nFilter = $filter('i18n');

      if ($cookies.user_console == 'true') {
          $scope.user_console = 'false';
      } else {
          $scope.user_console = 'true';
      }
      $scope.logout = function () {
          // logout app
          $window.location.href = "/accounts/logout/";
      };
      $scope.products = [];
      $scope.regions = [];
      $scope.services = [];
      $scope.user_info =  [{'name': $cookies.username||'User', 'link': '#'},
                           {'name': 'Logout', 'link': '/accounts/logout/',
                            'callback': $scope.logout}];
      var change_lang = function () {
          LocaleSetting.set(this.lang);
      };
      $scope.lang = [
          {'name': i18nFilter('Language')},
          {'name': '简体中文', 'lang': 'zh_CN', 'callback': change_lang},
          {'name': 'English', 'lang': 'en_US', 'callback': change_lang}];
      $scope.help_links = [{'name': 'Document', 'link': '#'}];
      var reset_panel_selected = function (groups) {
          // detect whethe the panel is selected based on current path;
          var current_view = $location.path().substring(5); // remove '/app/'
          for (var i = 0; i< groups.length; i++) {
              var group = groups[i].panels;
              for (var j = 0; j < group.length; j++) {
                  var panel = group[j];
                  if (panel.name == current_view) {
                      $scope.selected_panel = panel.name;
                  }
              }
          }
      };

      $scope.panel_groups = PanelGroupsResource.query(function (res) {
          for (var i = 0; i < res.length; i++) {
              var panel_group = res[i],
                  first_link = '/app/' + panel_group.panels[0].name;
              $scope.products.push({'name': panel_group.name, 'link': first_link});
          }
          reset_panel_selected(res);
      });

      // for top bar items
      RegionsResource.list_resource.fetch({}, function (regions) {
        var region_click = function (region) {
          return function () {
            location.href = location.origin + "/app/region_change/" + "?endpoint=" + region.link + "&region_name=" + region.name;
          };
        }
          for (var i=0;i<regions.length;i++) {
              regions[i].callback = region_click(regions[i]);
          }
          var current_region = null;
          for (var j=0; j < regions.length; j++) {
              var region = regions[j];
              if (region.current) {
                  current_region = region;
                  regions.splice(j, 1);
                  break;
              }
          }
          regions.unshift(current_region);
          $scope.regions = regions;
      });

      $scope.toggle_user_admin_console = function () {
          if ($cookies.user_console == "true") {
              //check to admin console
              document.cookie = "user_console=false; path=/";
          } else {
              //check to user console
              document.cookie = "user_console=true; path=/";
          }
          $window.location.reload();
      };

      $rootScope.$on('$routeChangeStart', function (evt, route) {
          if ($window.ajax_list !== undefined) {
              for (var i=0; i < $window.ajax_list.length; i++) {
                  $timeout.cancel($window.ajax_list[i]);
              }
              $window.ajax_list =  [];
          }
      });

      $rootScope.$on('$routeChangeSuccess', function (evt, route) {
          var current_view = $location.path().substring(5); // remove '/app/'
          $scope.services = [];
          if ($scope.panel_groups.length === 0) {
              // has not be initailed
              return ;
          }
          reset_panel_selected($scope.panel_groups);
      });

}]);

app_module.controller('TestCtrl',
  ['$scope', 'UiConfigPool', 'EventCenter',
   function ($scope, UiConfigPool, EventCenter) {
      UiConfigPool.fetch(function (res) {
        console.log(res);
      });
      $scope.click = function () {
        EventCenter.trigger('ui_config:save', {'a': 1, 'b': 2})
      };

      $scope.gridOptions = {
          data: "keypairs",
          showFilter: true,
          showSelectionCheckbox: true,
          showColumnMenu: true,
          maintainColumnRatios: true,
          enableColumnResize: true,
          plugins: [new ngGridFlexibleHeightPlugin()],
          selectedItems: $scope.selectedItems,
          columnDefs: [{field: 'name', displayName: "Name"},
                       {field: 'fingerprint', displayName: "Fingerprint"}],
      };
}]);

app_module.controller('admin.ApplyCodeCtrl',
  ['$scope', 'ApplyCodePool', 'EventCenter',
   function ($scope, ApplyCodePool, EventCenter) {
      $scope.open_create_ap = function () {
          $scope.create_ap_shown = true;
      };
      $scope.open_confirm_dialog = function () {
          $scope.confirm_dialog_shown = true;
      };
      $scope.delete_aps = function () {
          for (var i=0; i < $scope.selectedItems.length; i++) {
              var selected = $scope.selectedItems[i];
              EventCenter.trigger('apply_code:remove', selected.id);
          }
          //$scope.selectedItems.splice(0, $scope.selectedItems.length);

      };

      $scope.$emit('load_start');
      $scope.apply_codes = ApplyCodePool.fetch(function (res) {
          $scope.$emit('load_complete');
          return res;
      });
      $scope.selectedItems = [];
      $scope.gridOptions = {
          angridStyle: "th-list",
          data: "apply_codes",
          multiSelectWithCheckbox: true,
          columnDefs: [{field: 'id', displayName: 'Code'},
                       {field: 'used_by', displayName: 'Used by'},
                       {field: 'used', displayName: 'Used'},
                       {field: 'used_at', displayName: 'Used At'}],
          selectedItems: $scope.selectedItems,
      };

      $scope.$on('cache_change:apply_code', function () {
        $scope.apply_codes = ApplyCodePool.fetch();
      });
}]);

app_module.controller('admin.CouponCtrl',
  ['$scope', 'CouponCodeResource',
   function ($scope, CouponCodeResource) {
      $scope.$emit('load_start');
      $scope.coupons = CouponCodeResource.list_resource.fetch({}, function () {
          $scope.$emit('load_complete');
      });

      $scope.open_create_coupon = function () {
          $scope.create_coupon_shown = true;
      };

      $scope.selectedItems = [];
      $scope.gridOptions = {
          angridStyle: "th-list",
          multiSelectWithCheckbox: true,
          data: 'coupons',
          columnDefs: [{field: 'code', displayName: 'Code'},
                       {field: 'sn', displayName: 'SN'}],
          selectedItems: $scope.selectedItems
      };
      $scope.$watch('gridOptions.selectedItems', function (newValue) {
          $scope.selectedItems = newValue;
      });
}]);

app_module.controller('admin.FlavorCtrl',
  ['$scope', 'is_dough_enabled', 'FlavorPool', 'EventCenter', '$filter', 
   function ($scope, is_dough_enabled, FlavorPool, EventCenter, $filter) {
        $scope.open_create_flavor = function () {
            $scope.create_flavor_shown = true;
        };

        $scope.open_confirm_dialog = function () {
            $scope.confirm_dialog_shown = true;
        };

        $scope.delete_flavors = function () {
            for (var i=0; i < $scope.selectedItems.length; i++) {
                var selected = $scope.selectedItems[i];
                EventCenter.trigger('flavor:remove', selected.id);
            }
        };

        $scope.$emit('load_start');
        $scope.flavors = FlavorPool.fetch(function (res) {
            $scope.$emit('load_complete');
            return res;
        });
        
        var columnDefs = [{field: 'name', displayName: 'Name'},
                         {field: 'vcpus', displayName: 'Cores'},
                         {field: 'ram', displayName: 'Ram', columnFilter: 'mb_format'},
                         {field: 'disk', displayName: 'Root Disk', columnFilter: 'gb_format'},
                         {field: 'ephemeral', displayName: 'Ephemeral', columnFilter: 'gb_format'},
                         ];
        if (is_dough_enabled()) {
            columnDefs.push({field: 'product_info', displayName: 'Monthly Price', columnFilter: 'month_price'},
                            {field: 'product_info', displayName: 'Hourly Price', columnFilter: 'hour_price'});
        }

        $scope.selectedItems = [];
        $scope.gridOptions = {
            angridStyle: "th-list",
            multiSelectWithCheckbox: true,
            data: 'flavors',
            columnDefs: columnDefs,
            selectedItems: $scope.selectedItems
        };
        $scope.$watch('gridOptions.selectedItems', function (newValue) {
            $scope.selectedItems = newValue;
        });

        $scope.$on('cache_change:flavor', function () {
          $scope.flavors = FlavorPool.fetch();
        });
}]);

app_module.controller('admin.ImageCtrl',
  ['$scope', 'ImagePool', 'EventCenter',
   function ($scope, ImagePool, EventCenter) {
      $scope.$emit('load_start');
      $scope.images = ImagePool.fetch(function (res) {
          $scope.$emit('load_complete');
          return res;
      });
      $scope.open_confirm_dialog = function () {
          $scope.confirm_dialog_shown = true;
          $scope.displayItem
      };
      $scope.open_create_image = function () {
          $scope.create_image_shown = true;
      };
      $scope.delete_images = function () {
          for(var i=0; i < $scope.selectedItems.length; i++) {
              var selected = $scope.selectedItems[i];
              EventCenter.trigger('image:remove', selected.id);
          }
      };
      $scope.selectedItems = [];
      $scope.gridOptions = {
          angridStyle: "th-list",
          multiSelectWithCheckbox: true,
          data: "images",
          columnDefs: [{field: 'name', displayName: 'Name'},
                       {field: 'status', displayName: 'Status', columnFilter: 'image_status_filter' },
                       {field: 'is_public', displayName: 'Public'},
                       {field: 'container_format', displayName: 'Container Format'}],
          selectedItems: $scope.selectedItems,
      };
      $scope.$watch('gridOptions.selectedItems', function (newValue) {
          $scope.selectedItems = newValue;
          if($scope.selectedItems.length == 0)
              return;
          $scope.displayItem = $scope.selectedItems[0];
      });

      $scope.$on('cache_change:image', function () {
        $scope.images = ImagePool.fetch();
      });
}]);

app_module.controller('admin.OverviewCtrl',
  ['$scope', '$location', 'is_kanyun_enabled', 'AdminNodesResource',
   function ($scope, $location, is_kanyun_enabled, AdminNodesResource) {
      if (!is_kanyun_enabled()) {
          $location.path('/app/admin_instance');
      }
      $scope.$emit('load_start');
      $scope.node_list = AdminNodesResource.list_resource.fetch({'from_cache': 1}, function (res) {
          $scope.$emit('load_complete');
      });

      $scope.selectedItems = [];
      
      $scope.gridOptions = {
          angridStyle: "th",
          data: 'node_list',
          multiSelectWithCheckbox: true,
          columnDefs: [
                       //{field: 'id', displayName: 'ID', cssClass:'col1'},
                       {field: 'hostname', displayName: 'Host Name', cssClass:'col1'},
                       {field: 'cpu', displayName: 'CPU', cssClass:'col2'},
                       {field: 'mem', displayName: 'Memory', cssClass:'col3'},
                       {field: 'disk', displayName: 'Disk Capacity', cssClass:'col4'}],
          selectedItems: $scope.selectedItems
      };

      $scope.$watch('gridOptions.selectedItems', function (newValue) {
          $scope.selectedItems = newValue;
      });

      $scope.$on('popheight', function () {
          var selected_node = $scope.selectedItems[0];
          AdminNodesResource.detail_resource.query({'id': selected_node.id, 'get_vm': true}, function (res) {
              $scope.vm_list = res;
          });
          setTimeout(function () {
              angular.element('#cpu_usage').scope().render();
              angular.element('#mem_usage').scope().render();
              angular.element('#disk_usage').scope().render();
          }, 2000);

      });
}]);

app_module.controller('admin.ProjectCtrl',
    ['$scope', 'CouponLogResource', 'CrashResource', 'ProjectPool',
     'UserPool', 'InstancePool', '$filter', 'EventCenter',
     function ($scope, CouponLogResource, CrashResource, ProjectPool,
                UserPool, InstancePool, $filter, EventCenter) {

        $scope.$emit('load_start');
        $scope.projects = ProjectPool.fetch(function (res) {
            $scope.$emit('load_complete');
            return res;
        });
        $scope.project_users = [];

        $scope.quotas = {};
        $scope.quotas['Instances'] = {raw_limit:3,raw_used:1};
        $scope.quotas['Snapshots'] = {raw_limit:30,raw_used:10};
        $scope.quotas['vCPU'] = {raw_limit:30,raw_used:10};
        $scope.quotas['Security Groups'] = {raw_limit:30,raw_used:10};
        $scope.quotas['Memory'] = {raw_limit:30,raw_used:10};
        $scope.quotas['Key Pairs'] = {raw_limit:30,raw_used:10};
        $scope.quotas['Disk'] = {raw_limit:30,raw_used:10};
        $scope.quotas['Floating IPs'] = {raw_limit:30,raw_used:10};
        $scope.quotas['Load Balancers'] = {raw_limit:30,raw_used:10};

        $scope.viewQuotas = $filter('part_filter')($scope.quotas);

        $scope.open_create_project = function () {
            $scope.create_project_shown = true;
        };

        $scope.open_confirm_dialog = function () {
            $scope.confirm_dialog_shown = true;
        };

        $scope.open_edit_project = function () {
            $scope.edit_project_shown = true;
            $scope.$broadcast('edit_project_shown');
        };

        $scope.open_manage_user = function () {
            $scope.manage_user_shown = true;
        };

        $scope.open_modify_quota = function () {
            $scope.modify_quota_shown = true;
            $scope.$broadcast("modify_quota_shown");
        };

        $scope.delete_projects = function () {
            for (var i=0; i < $scope.selectedItems.length;i++) {
                var selected = $scope.selectedItems[i];
                EventCenter.trigger('project:remove', selected.id);
            }
            //$scope.selectedItems.splice(0, $scope.selectedItems.length);
        };

        $scope.selectedItems = [];
        $scope.gridOptions = {
            angridStyle: "th-list",
            multiSelectWithCheckbox: true,
            data: 'projects',
            columnDefs: [
                        // {field: 'id', displayName: 'UUID'},
                         {field: 'name', displayName: 'Name'},
                         {field: 'enabled', displayName: 'Enabled'},
                         {field: 'description', displayName: 'Description'}],
            selectedItems: $scope.selectedItems
        };

        // for project user
        $scope.usersGridOptions = {
            angridStyle: 'th-list',
            multiSelectWithCheckbox: true,
            data: 'project_users',
            columnDefs: [{field: 'id', displayName: 'UUID'},
                         {field: 'name', displayName: 'Name'},
                         {field: 'email', displayName: 'Email'},
                         {field: 'enabled', displayName: 'Enabled'}]
        };

        // for billing pane
        var current_year = new Date().getFullYear(),
            start_year = 2011, select_years = [];
        $scope.selected_year = current_year;
        for (var i=start_year; i <= current_year; i++) {
            select_years.push(i);
        }
        $scope.select_years = select_years;


        $scope.billingGridOptions = {
            angridStyle: "th-list",
            multiSelectWithCheckbox: true,
            data: 'crash_log',
            columnDefs: [{field: 'month', displayName: 'Month'},
                         {field: 'summary', displayName: 'Summary'},
                         {field: 'instance', displayName: 'Instance'},
                         {field: 'network', displayName: 'Network'},
                         {field: 'floating_ip', displayName: 'Floating Ip'}],
            selectedItems: $scope.selectedItems
        };

        // for project instance
        $scope.instancesGridOptions = {
            angridStyle: 'th-list',
            multiSelectWithCheckbox: true,
            data: 'project_instances',
            columnDefs: [{field: 'image_name', displayName: 'OS', width: '5%'},
                         {field: 'name', displayName: 'Name'},
                         {field: 'private_ip', displayName: 'Private Ip'},
                         {field: 'flavor', displayName: 'Flavor', columnFilter: 'flavor_filter'},
                         {field: 'payment_type', displayName: 'Payment Type'},
                         {field: 'status', displayName: 'Status', columnFilter: 'status_filter'},
                         {field: 'ssh_domain', displayName: 'Public Domain'},
                         {field: 'security_groups', displayName: 'Security Groups', columnFilter:'sg_filter'},
                         {field: 'key_name', displayName: 'Key Name'}
                         ],
        };

        $scope.$watch('gridOptions.selectedItems', function (newValue) {
            $scope.selectedItems = newValue;
            if($scope.selectedItems.length == 0)
                return;
            $scope.displayItem = $scope.selectedItems[0];


            var selected_uuid = $scope.selectedItems[0].id;

            UserPool.query_no_cache({'tenant_id': selected_uuid},
                function (users) {
                    $scope.project_users = [];
                    for (var i=0; i < users.length; i++) {
                        $scope.project_users.push(users[i]);
                    }
            });

            InstancePool.query_no_cache({'tenant_id': selected_uuid}, 
                function (instances) {
                    $scope.project_instances = [];
                    for (var i=0; i < instances.length; i++) {
                        $scope.project_instances.push(instances[i]);
                    }
            });

            $scope.coupon_remaining = CouponLogResource.remaining_resource.get({'id': selected_uuid}, function (res) {
                $scope.coupon_remaining = res.remaining;
            });
            $scope.crash_remaining = CrashResource.remaining_resource.get({'id': selected_uuid}, function (res) {
                $scope.crash_remaining = res.remaining;
            });


            $scope.$watch('selected_year', function (newValue) {
                if (newValue !== undefined) {
                    $scope.crash_log = CrashResource.list_resource.fetch({
                        'from_cache': 1,
                        'year': newValue,
                        'id': selected_uuid
                    });
                }
            });

        });
        $scope.$on('cache_change:project', function () {
          $scope.projects = ProjectPool.fetch();
        });
}]);

app_module.controller('admin.QuotaCtrl',
  ['$scope', 'QuotaPool',
   function ($scope, QuotaPool) {
      $scope.$emit('load_start');
      $scope.quotas = QuotaPool.fetch(function (res) {
          $scope.$emit('load_complete');
          return res;
      });

      $scope.selectedItems = [];
      $scope.gridOptions = {
          angridStyle: "th-list",
          multiSelectWithCheckbox: true,
          data: 'quotas',
          columnDefs: [{field: 'name', displayName: 'Name'},
                       {field: 'limit', displayName: 'Limit'}],
          selectedItems: $scope.selectedItems
      };
      $scope.$watch('gridOptions.selectedItems', function (newValue) {
          $scope.selectedItems = newValue;
      });

      $scope.$on('cache_change:quota', function () {
        $scope.quotas = QuotaPool.fetch();
      });
}]);

app_module.controller('admin.ServiceCtrl',
  ['$scope', 'ServicePool', '$filter',
   function ($scope, ServicePool, $filter) {
      $scope.$emit('load_start');
      $scope.service_list = ServicePool.fetch(function (res) {
          $scope.$emit('load_complete');
          console.log(res);
          return res;
      });

      $scope.selectedItems = [];
      $scope.gridOptions = {
          angridStyle: "th-list",
          data: 'service_list',
          multiSelectWithCheckbox: true,
          columnDefs: [{field: 'name', displayName: 'Name'},
                       {field: 'type', displayName: 'Type'},
                       {field: 'host', displayName: 'Host'},
                       {field: 'disabled', displayName: 'Disabled'},
                       {field: 'region', displayName: 'Region'}],
          selectedItems: $scope.selectedItems
      };
      $scope.$watch('gridOptions.selectedItems', function (newValue) {
          $scope.selectedItems = newValue;
      });
}]);

app_module.controller('admin.UserCtrl',
    ['$scope', '$filter', 'UserPool', 'EventCenter',
     function ($scope, $filter, UserPool, EventCenter) {
        $scope.$emit('load_start');
        $scope.users = UserPool.fetch(function (res) {
            $scope.$emit('load_complete');
            return res;
        });
        
        $scope.open_create_user = function () {
            $scope.is_edit = false;
            $scope.create_user_shown = true;
        };

        $scope.open_confirm_dialog = function () {
            $scope.confirm_dialog_shown = true;
        };

        $scope.open_edit_user = function () {
            $scope.is_edit = true;
            $scope.create_user_shown = true;
        };

        $scope.delete_users = function () {
            for (var i=0; i < $scope.selectedItems.length; i++) {
                var selected = $scope.selectedItems[i];
                EventCenter.trigger('user:remove', selected.id);
            }
            $scope.selectedItems.splice(0, $scope.selectedItems.length);
        };

        $scope.selectedItems = [];
        $scope.gridOptions = {
            angridStyle: "th-list",
            multiSelectWithCheckbox: true,
            data: 'users',
            columnDefs: [{field: 'name', displayName: 'Name'},
                         {field: 'email', displayName: 'Email'},
                         {field: 'enabled', displayName: 'Enabled'}],
            selectedItems: $scope.selectedItems
        };
        $scope.$watch('gridOptions.selectedItems', function (newValue) {
            $scope.selectedItems = newValue;
            if($scope.selectedItems.length == 0)
                return;
            $scope.displayItem = $scope.selectedItems[0];
        });

        $scope.$on('cache_change:user', function () {
          $scope.users = UserPool.fetch();
        });
}]);

app_module.controller('admin.VolumeCtrl', 
  ['$scope', 'VolumePool', 'VolumeTypePool', 'EventCenter',
   function ($scope, VolumePool, VolumeTypePool, EventCenter) {
      $scope.$emit('load_start');
      $scope.volumes = VolumePool.fetch(function (res) {
          $scope.$emit('load_complete');
          return res;
      });
      $scope.selectedItems = [];
      $scope.volumegridOptions = {
          angridStyle: "th-list",
          data: 'volumes',
          multiSelectWithCheckbox: true,
          columnDefs: [{field: 'tenant_name', displayName: 'Project'},
                       {field: 'host', displayName: 'host'},
                       {field: 'name', displayName: 'Name'},
                       {field: 'size', displayName: 'Size'},
                       {field: 'abs_status', displayName: 'status', columnFilter: 'status_icon_filter'},
                       {field: 'volume_type', displayName: 'Type'},
                       {field: 'attachments', displayName: 'Attached To', columnFilter: 'volume_attach_filter'}],
          selectedItems: $scope.selectedItems
      };
      $scope.$watch('volumegridOptions.selectedItems', function (newValue) {
          $scope.selectedItems = newValue;
      });

      $scope.open_confirm_dialog = function () {
          $scope.confirm_dialog_shown = true;
      };

      $scope.delete_volumes = function () {
          angular.forEach($scope.selectedItems, function (selected) {
            EventCenter.trigger('volume:remove', selected.id);
          });
      };

      $scope.volume_types = VolumeTypePool.fetch();

      $scope.selectedVT = [];
      $scope.volumeTypeGridOptions = {
          angridStyle: "th-list",
          data: 'volume_types',
          multiSelectWithCheckbox: true,
          columnDefs: [{field: 'name', displayName: 'Name'}],
          selectedItems: $scope.selectedVT
      };

      $scope.$watch('volumeTypeGridOptions.selectedItems', function (newValue) {
          $scope.selectedVT = newValue;
      });

      $scope.open_confirm_dialog2 = function () {
          $scope.confirm_dialog_shown2 = true;
      };

      $scope.delete_volume_types = function () {
          for (var i=0; i < $scope.selectedVT.length; i++) {
            EventCenter.trigger('volume_type:remove', $scope.selectedVT[i].id);
          }
      };

      $scope.create_vt = function () {
          $scope.create_vt_shown = true;
      };

      $scope.$on('cache_change:volume_type', function () {
        $scope.volume_types = VolumeTypePool.fetch();
      });

      $scope.$on('cache_change:volume', function () {
        $scope.volumes = VolumePool.fetch();
      });
}]);

app_module.controller('user.BalanceCtrl',
  ['$scope', 'CrashResource', 'CouponLogResource',
   function ($scope, CrashResource, CouponLogResource) {
      var current_year = new Date().getFullYear(),
          start_year = 2011, select_years = [];
      $scope.selected_year = current_year;
      for (var i=start_year; i <= current_year; i++) {
          select_years.push(i);
      }
      $scope.select_years = select_years;

      CrashResource.remaining_resource.get(function (res) {
          $scope.crash_remaining = res['remaining'];
      });
      CouponLogResource.remaining_resource.get(function (res) {
          $scope.coupon_remaining = res['remaining'];
      });
      $scope.open_load_coupon = function () {
          $scope.load_coupon_shown = true;
      };

      $scope.gridOptions = {
          angridStyle: 'th-list',
          data: 'coupon_log',
          columnDefs: [
              {field: 'date', displayName: 'Date'},
              {field: 'sn', displayName: 'SN'},
              {field: 'value', displayName: 'Coupon Value'}
          ]
      };

      $scope.$watch('selected_year', function (newValue) {
          if (newValue !== undefined) {
              $scope.$emit('load_start');
              CouponLogResource.list_resource.fetch({'year': newValue},
                  function (res) {
                  $scope.coupon_log = res;

                  $scope.$emit('load_complete');
              });
          }
      });
}]);

app_module.controller('user.BillingCtrl',
  ['$scope', 'CrashResource',
   function ($scope, CrashResource) {
      var current_year = new Date().getFullYear(),
          start_year = 2011, select_years = [];
      $scope.selected_year = current_year;
      for (var i=start_year; i <= current_year; i++) {
          select_years.push(i);
      }
      $scope.select_years = select_years;

      $scope.$watch('selected_year', function (newValue) {
          if (newValue !== undefined) {
              $scope.$emit('load_start');
              $scope.crash_log = CrashResource.list_resource.fetch({
                  'from_cache': 1,
                  'year': newValue
              }, function () {
                  $scope.$emit('load_complete');
              });
          }
      });

      $scope.selectedItems = [];
      $scope.gridOptions = {
          angridStyle: "th-list",
          multiSelectWithCheckbox: true,
          data: 'crash_log',
          columnDefs: [{field: 'month', displayName: 'Month'},
                       {field: 'summary', displayName: 'Summary'},
                       {field: 'instance', displayName: 'Instance'},
                       {field: 'network', displayName: 'Network'},
                       {field: 'floating_ip', displayName: 'Floating Ip'}],
          selectedItems: $scope.selectedItems
      };
      $scope.$watch('gridOptions.selectedItems', function (newValue) {
          $scope.selectedItems = newValue;
          if (newValue !== undefined && $scope.selectedItems.length == 1) {
              var month = $scope.selectedItems[0].month,
                  year = $scope.selected_year;
              CrashResource.detail_resource.query({'id': year + '-' + month},
                  function (res) {
                      $scope.billing_detail = res;
              });
          }
      });

      $scope.detailGridOptions = {
          angridStyle: 'th-list',
          data: 'billing_detail',
          columnDefs: [
              {field: 'resource_name', displayName: 'Resource Name'},
              {field: 'resource_type', displayName: 'Resource type'},
              {field: 'price', displayName: 'Price'},
              {field: 'time_from', displayName: 'Start Time'},
              {field: 'time_to', displayName: 'End Time'},
              {field: 'money_cost', displayName: 'Crash Cost'},
              {field: 'coupon_cost', displayName: 'Coupon Cost'},
              {field: 'total_cost', displayName: 'Sum'}
          ]
      };
}])

app_module.controller('user.FloatingIpCtrl',
    ['$scope', 'FloatingIpPool', 'EventCenter',
     function ($scope, FloatingIpPool, EventCenter) {
        $scope.$emit('load_start');
        $scope.floating_ips = FloatingIpPool.fetch(function (res) {
            $scope.$emit('load_complete');
            return res;
        });
        
        $scope.open_allocate_ip = function () {
            $scope.allocate_ip_shown = true;
        };
        $scope.open_associate_ip = function () {
            $scope.associate_ip_shown = true;
            $scope.$broadcast('associate_ip_shown');
        };
        $scope.open_confirm_dialog = function () {
            $scope.confirm_dialog_shown = true;
        };
        $scope.open_disassociate_ip = function () {
            $scope.disassociate_ip_shown = true;
        };
        $scope.release_ip = function () {
            for(var i=0; i < $scope.selectedItems.length; i++) {
                var selected = $scope.selectedItems[i];
                EventCenter.trigger('floating_ip:release', selected.id)
            }
            $scope.selectedItems.splice(0, $scope.selectedItems.length);
        };
        $scope.disassociate_ip = function () {
            var selected = $scope.selectedItems[0],
                data = {'action': 'disassociate', 'instance_uuid': selected.instance_id};
            EventCenter.trigger('floating_ip:disassociate', selected.id, data);
        };
        //grid options
        $scope.selectedItems = [];
        $scope.gridOptions = {
            angridStyle: "th-list",
            multiSelectWithCheckbox: true,
            data: "floating_ips",
            columnDefs: [{field: 'ip', displayName: 'IP'},
                         {field: 'instance_id', displayName: "Instance Id"},
                         {field: 'pool', displayName: "Pool"}],
            selectedItems: $scope.selectedItems
        };
        $scope.$watch('gridOptions.selectedItems', function (newValue) {
            $scope.selectedItems = newValue;
        });

        $scope.$on('cache_change:floating_ip', function () {
          $scope.floating_ips = FloatingIpPool.fetch();
        });
}]);

app_module.controller('user.ImageCtrl',
    ['$scope', 'ImagePool',
     function ($scope, ImagePool) {
        $scope.$emit('load_start');
        $scope.images = ImagePool.fetch(function (res) {
            $scope.$emit('load_complete');
            return res;
        });
        $scope.open_launch_instance = function () {
            if( $scope.selectedItems.length == 0 ){
                return false;
            }
            $scope.launch_instance_shown = true;
            $scope.$broadcast('launch_instance_with_image',
                {'id': $scope.selectedItems[0].id});
        };
        $scope.selectedItems = [];
        $scope.gridOptions = {
            angridStyle: "th-list",
            data: "images",
            multiSelectWithCheckbox: true,
            columnDefs: [{field: 'name', displayName: 'Name'},
                         {field: 'abs_status', displayName: 'Status'},
                         {field: 'is_public', displayName: 'Public'},
                         {field: 'container_format', displayName: 'Container Format'}],
            selectedItems: $scope.selectedItems,
        };

        $scope.gridOptions.columnDefs[1].columnTemplate='<icon keysource="rowData[colData.field]" region="status" ></icon>';

        $scope.$watch("gridOptions.selectedItems", function (newValue) {
            $scope.selectedItems = newValue;
            if($scope.selectedItems.length == 0)
                return;
            $scope.displayItem = $scope.selectedItems[0];
        });
}]);

app_module.controller('user.InstanceCtrl',
    ['$scope', '$filter', 'ApiList', 'InstancePool',
     'FlavorsResource', 'combine_instance_flavor',
     'is_dough_enabled', 'is_loadbalance_enabled', 'is_kanyun_enabled',
     'EventCenter',
     function ($scope, $filter, ApiList, InstancePool,
               FlavorsResource, combine_instance_flavor, 
               is_dough_enabled, is_loadbalance_enabled,
               is_kanyun_enabled, EventCenter) {

        $scope.$emit('load_start');
        $scope.instances = InstancePool.fetch(function (res) {
            $scope.$emit('load_complete');
            return res;
        });

        $scope.launch_instance_shown = false;
        $scope.connect_instance_shown = false;
        //related to directive
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

app_module.controller('user.LBCtrl', 
   ['$scope', 'LBPool', 'EventCenter',
    function ($scope, LBPool, EventCenter) {
        $scope.open_create_loadbalaner_modal = function () {
            $scope.load_balancer_modal_shown = true;
            $scope.edit_load_balancer = false;
        };
        $scope.open_edit_loadbalaner_modal = function () {
            $scope.load_balancer_modal_shown = true;
            $scope.edit_load_balancer = true;
        };
        $scope.close_loadbalancer_modal = function () {
            $scope.load_balancer_modal_shown = false;
        };
        $scope.open_confirm_dialog = function () {
            $scope.confirm_dialog_shown = true;
        };
        $scope.delete_loadbalancer = function () {
            for (var i = 0; i < $scope.selectedItems.length; i++) {
                var selected = $scope.selectedItems[i];
                EventCenter.trigger('load_balancer:remove', selected.id);
            }
        };

        $scope.$emit('load_start');
        $scope.load_balancers = LBPool.fetch(function (res) {
          $scope.$emit('load_complete');
          return res;
        });
        //grid options
        $scope.selectedItems = [];
        $scope.gridOptions = {
            angridStyle: "th-list",
            multiSelectWithCheckbox: true,
            data: "load_balancers",
            columnDefs: [{field: 'name', displayName: "Name"},
                         {field: 'abs_status', displayName: 'Status', columnFilter: 'status_icon_filter'},
                         {field: 'protocol', displayName: 'Protocol'},
                         {field: 'listen_port', displayName: 'Listen Port'},
                         {field: 'instance_port', displayName: 'Instance Port'},
                         {field: 'dns_names', displayName: 'DNS Domain'}],
            selectedItems: $scope.selectedItems
        };
        $scope.$watch('gridOptions.selectedItems', function (newValue) {
            $scope.selectedItems = newValue;
        });

        $scope.$on('cache_change:load_balancer', function () {
          $scope.load_balancers = LBPool.fetch();
        });
}]);

app_module.controller('user.MonitorCtrl',
    ['$scope', 'InstancesResource', '$filter',
     function ($scope, InstancesResource, $filter) {
        window.monitor = {
            options: {},
            unit_map: {
                cpu: '%',
                blk_read: 'bytes',
                blk_write: 'bytes',
                nic_outgoing: 'bytes',
                nic_incoming: 'bytes',
                vmnetwork: 'bytes'
            },
        };
        $scope.cpuSourceList = [{value:'demo_CPU'},{value:'default'}];

        $scope.products = [{'name': 'all', 'type': 'all'}, 
                           {'name': 'compute', 'type': 'compute'}];
        $scope.display_product = $scope.products[0].type;

        $scope.metrics = [
                            {'name': 'cpu', 'type': 'cpu'},
                            {'name': 'blk read', 'type': 'blk_read'},
                            {'name': 'blk write', 'type': 'blk_write'},
                            {'name': 'vmnetwork', 'type': 'vmnetwork'},
                            {'name': 'nic incoming', 'type': 'nic_incoming'},
                            {'name': 'nic outgoing', 'type': 'nic_outgoing'}];

        $scope.display_metric = $scope.metrics[0].type;

        $scope.monitor_items = [];
        $scope.data_load = false;
        $scope.$emit('load_start');
        InstancesResource.list_resource.fetch({}, function (instances) {
            $scope.$emit('load_complete');
            for (var i = 0; i < instances.length; i++) {
                var instance = instances[i];
                $scope.monitor_items.push({
                    'resource_name': instance.name,
                    'metrics' : $scope.metrics.map(function(metric){
                        return metric.type == 'all' ? null : metric.type;
                    }),
                    'id' : instance.id
                })
            }
            $scope.all_monitor_items = $scope.monitor_items;
            $scope.data_load = true;
        });

        $scope.gridOptions =  {
            angridStyle: "th-list",
            multiSelectWithCheckbox: true,
            data: 'monitor_items',
            columnDefs: [{field: 'resource_name', displayName: 'Resource'},
                         {field: 'metrics', displayName: 'Metrics',columnTemplete:$filter('moniter_metrics_format')()}],
            selectedItems: $scope.selectedItems
        };

        $scope.statistic_methods = ['avg', 'sum', 'max', 'min'];
        $scope.statistic_method = $scope.statistic_methods[0];
        $scope.time_ranges = [60, 360, 1440, 10080];
        $scope.time_range = $scope.time_ranges[0];
        $scope.time_periods = [1, 5, 60, 360];
        $scope.time_period = $scope.time_periods[1];


        $scope.$on('metric selected',function( e, Instance, metric){
            $scope.selectedItems = [Instance];
            $scope.selected_uuid = Instance.id;
            $scope.current_metric = metric;
            window.monitor.options.id = Instance.id;
            window.monitor.options.metric = metric;
            window.monitor.options.unit = window.monitor.unit_map[metric];
        })
}]);

app_module.controller('user.OverviewCtrl',
    ['$scope', '$filter', '$cookies', 'init_quotas', 'get_instance_quotas',
     'combine_instance_flavor', 'is_loadbalance_enabled',
     'QuotaPool', 'FlavorPool', 'InstancePool', 'VolumePool', 'SgPool',
     'KeypairPool', 'FloatingIpPool', 'SnapshotPool', 'LBPool',
     'ProjectUsagePool',
     function ($scope, $filter, $cookies, init_quotas, get_instance_quotas,
               combine_instance_flavor, is_loadbalance_enabled,
               QuotaPool, FlavorPool, InstancePool,
               VolumePool, SgPool, KeypairPool, FloatingIpPool,
               SnapshotPool, LBPool, ProjectUsagePool) {
        var quota_items = ['instances', 'cores', 'gigabytes', 'ram', 'floating_ips', 'key_pairs', 'snapshots', 'security_groups'],
            params = {'from_cache': 2}; // pass params manually, because we have a callback
        if (is_loadbalance_enabled()) {
            quota_items.push('load_balancers');
        }
        $scope.open_launch_instance = function () {
            $scope.launch_instance_shown = true;
        };

        QuotaPool.fetch(function (quotas) {
            // instance, sg, keypairs, floating ips quotas are based on quotas
            $scope.quotas = init_quotas(quota_items, quotas);

            FlavorPool.fetch(function (flavors) {
                $scope.flavors = flavors;
                InstancePool.fetch(function (instances){
                    ProjectUsagePool.get({'id': $cookies['project_id']}, function (usage){
                        var _instances = [];
                        angular.forEach(instances, function (ins) {
                             var _usage = usage.server_usages[ins['id']]; 
                             ins['uptime'] = _usage.uptime;
                             ins['memory_mb'] = _usage.memory_mb;
                             ins['hours'] = _usage.hours;
                             ins['vcpus'] = _usage.vcpus;
                             ins['local_gb'] = _usage.local_gb;
                             this.push(ins);
                        }, _instances);
                      $scope.instances = _instances;
                    });
                    $scope.quotas = get_instance_quotas($scope.quotas, instances);
                });
            });


            VolumePool.fetch(function (volumes) {
                var size = 0,
                    gb_format_filter = $filter('gb_format');
                for (var i = 0; i < volumes.length; i++) {
                    size += volumes[i].size;
                }
                $scope.quotas.gigabytes.raw_used = size;
            });

            SgPool.fetch(function (security_groups) {
                $scope.quotas.security_groups.raw_used = security_groups.length;
            });

            KeypairPool.fetch(function (key_pairs) {
                $scope.quotas.key_pairs.raw_used = key_pairs.length;
            });

            FloatingIpPool.fetch(function (floating_ips) {
                $scope.quotas.floating_ips.raw_used = floating_ips.length;
            });

            SnapshotPool.fetch(function (snapshots) {
                $scope.quotas.snapshots.raw_used = snapshots.length;
            });

            if (is_loadbalance_enabled()) {
                LBPool.fetch(function (lbs) {
                    $scope.quotas.load_balancers.raw_used = lbs.length;
                });
            }

        });

        $scope.$on('cache_change:instance', function () {
          $scope.instances = InstancePool.fetch();
        });
}]);

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

app_module.controller('user.SnapshotCtrl',
    ['$scope', 'SnapshotPool', 'EventCenter',
     function ($scope, SnapshotPool, EventCenter) {
        $scope.$emit('load_start');
        $scope.snapshots = SnapshotPool.fetch(function (res) {
            $scope.$emit('load_complete');
            return res;
        });

        $scope.open_launch_instance = function () {
            $scope.launch_instance_shown = true;
            $scope.$broadcast('launch_instance_with_snapshot',
                {'id': $scope.selectedItems[0].id})
        };
        $scope.open_confirm_dialog = function () {
            $scope.confirm_dialog_shown = true;
        };
        $scope.delete_snapshots = function () {
            for (var i=0; i < $scope.selectedItems.length; i++) {
                EventCenter.trigger('snapshot:remove', $scope.selectedItems[i].id);
            }
        };
        $scope.update_snapshot = function () {
            $scope.update_snapshot_shown = true;
            $scope.$broadcast('update_snapshot_shown');
        };
        // grid options
        $scope.selectedItems = [];
        $scope.gridOptions = {
            angridStyle: "th-list",
            multiSelectWithCheckbox: true,
            data: "snapshots",
            columnDefs: [{field: 'name', displayName: 'Name'},
                         {field: 'abs_status', displayName: 'Status', columnFilter: 'status_icon_filter'},
                         {field: 'is_public', displayName: 'Public'},
                         {field: 'container_format', displayName: 'Container Format'}],
            selectedItems: $scope.selectedItems,
        };
        $scope.gridOptions.columnDefs[1].columnTemplate='<icon keysource="rowData[colData.field]" region="status" ></icon>';
        
        $scope.$watch("gridOptions.selectedItems", function (newValue) {
            $scope.selectedItems = newValue;
            if($scope.selectedItems.length == 0)
                return;
            $scope.displayItem = $scope.selectedItems[0];
        });

        $scope.displayItem={};

        $scope.$on('cache_change:snapshot', function () {
          $scope.snapshots = SnapshotPool.fetch();
        });
}]);

app_module.controller('user.VolumeCtrl', 
    ['$scope', 'InstancePool', 'VolumePool', 'EventCenter',
     function ($scope, InstancePool, VolumePool, EventCenter) {
        $scope.$emit('load_start');
        InstancePool.fetch(); // for edit attach
        $scope.volumes = VolumePool.fetch(function (res) {
            $scope.$emit('load_complete');
            return res;
        });

        $scope.selectedItems = [];
        $scope.gridOptions = {
            angridStyle: "th-list",
            data: "volumes",
            multiSelectWithCheckbox: true,
            columnDefs: [{field: 'name', displayName: 'Name'},
                         {field: 'description', displayName: 'Description'},
                         {field: 'size', displayName: 'Size'},
                         {field: 'abs_status', displayName: 'Status', columnFilter: 'status_icon_filter'},
                         {field: 'volume_type', displayName: 'Type'},
                         {field: 'attachments', displayName: 'Attached To', columnFilter: 'volume_attach_filter'}],
            selectedItems: $scope.selectedItems,
        };

        $scope.$watch("gridOptions.selectedItems", function (newValue) {
            $scope.selectedItems = newValue;
        });

        $scope.open_create_volume_modal = function () {
            $scope.create_volume_shown = true;
        };
        $scope.open_confirm_dialog = function () {
            $scope.confirm_dialog_shown = true;
        };
        $scope.open_edit_attachment_modal = function () {
            var selected = $scope.selectedItems[0];
            if (selected.attachments.length==0) {
                $scope.edit_attachment_shown = true;
            } else {
                $scope.edit_detachment_shown = true;
            }
        };
        $scope.open_create_snapshot_modal = function () {
            $scope.create_volume_snapshot_shown = true;
        };

        $scope.delete_volumes = function () {
            for(var i=0;i<$scope.selectedItems.length;i++) {
              EventCenter.trigger('volume:remove', $scope.selectedItems[i].id);
            }
        };

        $scope.$on('cache_change:volume', function () {
          $scope.volumes = VolumePool.fetch();
        });
}]);

app_module.controller('user.VolumeSnapshotCtrl',
    ['$scope', 'VolumeSnapshotPool', 'EventCenter',
     function ($scope, VolumeSnapshotPool, EventCenter) {
        $scope.$emit('load_start');
        $scope.volume_snapshots = VolumeSnapshotPool.fetch(function (res) {
            $scope.$emit('load_complete');
            return res;
        });
        $scope.selectedItems = [];
        $scope.gridOptions = {
            angridStyle: "th-list",
            data: "volume_snapshots",
            multiSelectWithCheckbox: true,
            columnDefs: [{field: 'name', displayName: 'Name'},
                         {field: 'description', displayName: "Description"},
                         {field: 'size', displayName: 'Size'},
                         {field: 'abs_status', displayName: 'Status', columnFilter: 'status_icon_filter'},
                         {field: 'volume_name', displayName: 'Volume Name'}],
            selectedItems: $scope.selectedItems
        };
        $scope.$watch("gridOptions.selectedItems", function (newValue) {
            $scope.selectedItems = newValue;
        });

        $scope.open_confirm_dialog = function () {$scope.confirm_dialog_shown = true};
        $scope.open_create_volume_modal = function () {
            $scope.create_volume_shown = true;
        };
        $scope.delete_volume_snapshots = function () {
          for(var i=0; i< $scope.selectedItems.length; i++) {
            EventCenter.trigger('volume_snapshot:remove', $scope.selectedItems[i].id);
          }
        };

        $scope.$on('cache_change:volume_snapshot', function () {
          $scope.volume_snapshots = VolumeSnapshotPool.fetch();
        });
}]);
