describe( "uiConfig test is here", function () { 
    describe( "hoverTipTool", function () { 
 		it('should show on mouse hover', function(){
 			//element(selector, label).click()
 			$('.nav-list').trigger('mouseover');
 			expect($('.icon-cog').css('display')).toBe('inline-block');
 			
 			$('.nva-list').trigger('mouseout');
 			expect($('.icon-cog').css('display')).toBe('none');

 		});

 		it('should pop up', function () {

 			$('.icon-cog').trigger('click');
 			expect($('.ui-config-popbox').css('display')).toBe('inline-block');
 			$('.icon-cog').trigger('click');
 			expect($('.ui-config-popbox').css('display')).toBe('none');

 		})
    }); 
 
    describe( "uiSortable", function () {
    	it('should be sortable', function(){
    		$('.nav-list').trigger('drag');
            expect(element('.nav-list li').attr('drag')).toBeFalsy();
    	})
    }); 

});

