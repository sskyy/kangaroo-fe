
describe('Unit testing for swift', function() {
    var $compile;
    var $rootScope;
 
    beforeEach(module('AppDirectives'));
 
    beforeEach(inject(function(_$compile_, _$rootScope_){
      $compile = _$compile_;
      $rootScope = _$rootScope_;
    }));
    
    it('check path is working or not', function() {
    	var scope = $rootScope.$new();
    	scope.data = [{name:'a'},{name:'b'}];
        var element = $compile("<div swiftList swift-data-name='data'></div>")(scope);
        expect(element.children("span").length).toEqual(2);
        alert( element.html() );
    });
});

