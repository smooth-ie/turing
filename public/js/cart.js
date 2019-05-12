var quantity_picker = new function(){
	var self = this;

	this.change = function(){
		var rt = $(this).closest('.quantity-picker');
		var change = ($(this).hasClass('inc') ? 1 : -1);
		var curr = parseInt(rt.find('input').val());
		var next = Math.max(1, curr + change);
		rt.find('input').val(next);
		rt.find('.quantity-val').text(String(next));
	}

	this.init = function(){
		$('.qty-btn').on('click', self.change);
	}
}


var cart = new function(){
	var self = this;

	this.on_submit = function(e){
		e.preventDefault();
		$.ajax({
			url: '/cart/create',
			method: 'GET',
			data: $(this).serialize(),
			complete: function(res){
				$('.bag').html(res.responseText);
				self.inner_bag_events(true);
				self.open();
			}
		});
	}

	this.open = function(){
		$('.bag').addClass('active').find('.cart-dropdown').slideDown();
	}

	this.toggle = function(){
		let rt = $(this).closest('.bag');
		if(rt.hasClass('active')){
			rt.removeClass('active').find('.cart-dropdown').slideUp();
		}else{
			rt.addClass('active').find('.cart-dropdown').slideDown();
		}
	}

	this.remove_line = function(){

		var rt = $(this).closest('.line-item');
		var oid = rt.attr('data-oid');
		$.ajax({
			url: '/cart/delete/' + oid,
			method: 'GET',
			complete: function(res){
				$('.bag').html(res.responseText);
				self.inner_bag_events(true);
			}
		})
	}

	this.update_line = function(){
		var change = ($(this).hasClass('inc') ? 1 : -1);
		var next = parseInt($(this).closest('.quantity-picker').find('.line-quantity').val()) + change;
		var oid = $(this).closest('.line-item').attr('data-oid');
		$.ajax({
			url: '/cart/update/' + oid + '/' + next,
			method: 'GET',
			complete: function(res){
				$('.bag').html(res.responseText);
				self.inner_bag_events(true);
			}
		})
	}



	this.inner_bag_events = function(picker){
		$('.bag-button, .cart-close').on('click', self.toggle);
		$('.remove-line').on('click', self.remove_line);
		$('.line-update').on('click', self.update_line);
	}

	this.init = function(){
		console.log('cart js init');
		$('#cart-form').on('submit', self.on_submit);
		self.inner_bag_events(false);
	}
}
