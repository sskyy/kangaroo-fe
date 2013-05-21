basePath = '../../kangaroo/static';

files = [
  JASMINE,
  JASMINE_ADAPTER,
  'js/lib/jquery.1.9.1.js',
  //'js/lib/jquery-migrate-1.1.1.js',
  //'js/lib/jquery.splitter.sws.kangaroo.js',
  //'js/lib/jquery.cookie.js',
  'js/lib/angular/angular.js',
  'js/lib/angular/angular-cookies.js',
  'js/lib/angular/angular-loader.js',
  'js/lib/angular/angular-resource.js',
  'js/lib/angular/angular-sanitize.js',
  'js/lib/angular/angular-mocks.js',
  //'js/lib/ng-upload.min.js',
  //'js/lib/angular-ui/angular-ui.js',
  //'js/lib/angular/angular.bootstrap.rebuild.js',
  //'bootstrap/js/bootstrap-modal.js',
  //'bootstrap/js/bootstrap-dropdown.js',
  //'bootstrap/js/bootstrap-tooltip.js',
  'js/app/directive.js',
  'js/app/service.js',
  'js/app/service_v2.js',
  'js/app/filter.js',
  'js/app/directives/app_dir.js',
  'js/app/directives/swift_dir.js',
  '../../test/unit/directive-swift.js',
];

colors = true;

autoWatch = true;

browsers = ['Chrome'];


junitReporter = {
  outputFile: 'test_out/unit.xml',
  suite: 'unit'
};
