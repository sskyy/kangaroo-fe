describe("CommonService",function(){

	beforeEach(module('CommonService'));

	it('event service total test', inject(function (EventCenter){
		var commonArg1 = 'test1';
		var commonArg2 = 'test2';

		EventCenter.on('namespace:update',function( arg1, arg2 ){
			expect(arg1).toBe(commonArg1);
			expect(arg2).toBe(commonArg2);
		})

		EventCenter.trigger('namespace:update', commonArg1, commonArg2 );

	}))

})