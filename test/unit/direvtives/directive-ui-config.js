describe('test uiconfig', function () {

	describe('Unit testing uiconfig directive', function() {
		// $('.nav-list').trigger('mouseover');
		// expect($('icon-cog').css('display')).toBe('inline-block');

		// $('.nav-list').trigger('mouseout');
		// expect($('icon-cog').css('display')).toBe('none');
	   
	    var $compile;
	    var $rootScope;
	 
	    // Load the AppDirectives module, which contains the directive
	    beforeEach(module('AppDirectives'));
	 
	    // Store references to $rootScope and $compile
	    // so they are available to all tests in this describe block
	    beforeEach(inject(function(_$compile_, _$rootScope_){
	      // The injector unwraps the underscores (_) from around the parameter names when matching
	      $compile = _$compile_;
	      $rootScope = _$rootScope_;
	    }));
	    
	    it('Replaces the element with the appropriate content', function() {
	        // Compile a piece of HTML containing the directive
	        var element = $compile("<div><i class='icon-cog icon-white'></i><div><i id='up'></i><p>Some_config <input type='checkbox'/></p><p class='btn btn-small btn-primary pull-right' ng-click='show()'>{{title}}</p></div></div>")($rootScope);
	        // Check that the compiled element contains the templated content
	        expect(element.html()).toContain("config");
	    });
	});

	describe('Unit testing sortable directive', function() {
	   
	    var $compile;
	    var $rootScope;
	 
	    // Load the AppDirectives module, which contains the directive
	    beforeEach(module('AppDirectives'));
	 
	    // Store references to $rootScope and $compile
	    // so they are available to all tests in this describe block
	    beforeEach(inject(function(_$compile_, _$rootScope_){
	      // The injector unwraps the underscores (_) from around the parameter names when matching
	      $compile = _$compile_;
	      $rootScope = _$rootScope_;
	    }));
	    
	    it('Replaces the element with the appropriate content', function() {
	        // Compile a piece of HTML containing the directive
        	var template = "<div>" +
			           			"<li class='menu-header' ng-click='toggle_panel()' ng-class='{\"active\": has_item_selected()}'>" +
			                     "<i class='icon-th-list'></i>"+
			                     "<i ng-class='{\"icon-chevron-down\": folded == false, \"icon-chevron-right\": folded == true}' ></i>" +
			                     "{{group.name|i18n}}" +
			                   "</li>" +
			                   "<ul ui-sortable=\"{axis:\'y\',cursor:\'move\'}\" class='nav'>" +
			                     "<li draggable='true' ng-repeat='panel in group.panels' ng-class='{\"active\": selectedPanel == panel.name}'>" +
			                       "<a ng-href='/app/{{panel.name}}' >" +
			                           "{{panel.name|i18n}}" + 
			                       "</a>" +
			                     "</li>" +
			                   "</ul>" +
			                  "</div>";
	        var element = $compile(template)($rootScope);
	        // Check that the compiled element contains the templated content
	        expect(element.html()).toContain("ui-sortable");
	    });
	});

});


