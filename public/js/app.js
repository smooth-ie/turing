
var app = new function(){
	var self = this;

	this.form = null;
	this.orig_orm = null;

	this.filter_form_change = function(){
	    if(self.form.serialize() !== self.orig_form){
	    	// filters modified -> enable submit
	    	$('#filter-submit').removeClass('disabled').removeAttr('disabled');
	    }else{
	    	// disable submit
	    	$('#filter-submit').addClass('disabled').attr('disabled', 'disabled');
	    }
	}

	this.check_filter_form = function(){
		self.form = $('#filter-form'),
		self.orig_form = self.form.serialize();
		self.form.find('* :input').on('change input', self.filter_form_change);
	}

	this.range = function(){
		$('.slider-input').jRange({
		    from: 0,
		    to: 30,
		    step: 1,
		    scale: [0,15,30],
		    format: '%s',
		    width: 160,
		    showLabels: true,
		    isRange : true
		}).on('change', function(){
			var range = $(this).val().split(',');
			$('#min-input').val(parseInt(range[0]));
			$('#max-input').val(parseInt(range[1]));
		});
	}

	this.selector_click = function(){
		var rt = $(this).closest('.selector-root');
		var one = (rt.attr('input-type') == 'one');

		if(one){
			rt.find('.selected').removeClass('selected');
			$(this).addClass('selected');
			$(rt.attr('input-id')).val(rt.find('.selected').attr('data-value'));
		}else{
			if($(this).hasClass('selected')){
				$(this).removeClass('selected');
			}else{
				$(this).addClass('selected');
			}

			let selected = [];
			rt.find('.selected').each(function(){
				selected.push(parseInt($(this).attr('data-value')));
			})
			$(rt.attr('input-id')).val(JSON.stringify(selected));
			self.filter_form_change();
		}
	}

	this.product_thumbnail_click = function(){
		$(this).closest('.thumbnails').find('.product-thumbnail').removeClass('selected');
		$(this).addClass('selected');
		var url = $(this).attr('src');
		$('.product-image').animate({opacity: 0.0}, 100, 'swing', function(){
			$('.product-image').css('background-image', 'url(' + url + ')').animate({opacity: 1.0}, 100);
		})
		
	}

	this.toggle_search = function(){
		if($(this).hasClass('active')){
			$('.search-bar').slideUp();
			$(this).removeClass('active');
		}else{
			$('.search-bar').slideDown();
			$(this).addClass('active');
		}
	}
	this.init = function(){
		$('.selector').on('click', self.selector_click);
		self.range();
		self.check_filter_form();
		$('.product-thumbnail').on('click', self.product_thumbnail_click);
		$('.search-button').on('click', self.toggle_search);
		quantity_picker.init();
		cart.init();
	}
}


$(app.init);