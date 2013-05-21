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
