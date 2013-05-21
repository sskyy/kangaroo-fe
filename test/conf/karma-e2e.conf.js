basePath = '';

files = [
  ANGULAR_SCENARIO,
  ANGULAR_SCENARIO_ADAPTER,
  '../e2e/*.js',
];

colors = true;

autoWatch = true;

browsers = ['Chrome'];

captureTimeout = 60000;

singleRun = false;
proxies = {
    '/': 'http://localhost:8001',
}
