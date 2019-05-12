var checkout = new function(){
	var self = this;

	this.checkoutHandler = null;

	this.handleToken = function(token){
		$.ajax({
			url: '/charge',
			method: 'POST',
			contentType: "application/json",
			data: JSON.stringify(token),
			success: function(order){
				console.log("Purchase succeeded:");
				window.location.href = '/order/' + order.order_id;
			},
			error: function(err){ console.log(err) }
		})
	}

	this.handle = function(amount){
		self.checkoutHandler.open({
			name: "Turing Shop",
			token: self.handleToken,
			amount: amount
		});
	}

	this.init = function(){
		self.checkoutHandler = StripeCheckout.configure({
	      key: "pk_test_IlbrYLW1RrSydoXKqlMR7no3",
	      locale: "auto"
	    });
	}
}