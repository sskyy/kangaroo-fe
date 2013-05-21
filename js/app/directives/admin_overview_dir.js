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
