//
var siteURL = document.location.origin;
var rootURL = config.urls.root;
var templatesURL = config.urls.templates;


// Init
const client = ShopifyBuy.buildClient({
	domain: 'land-stories.myshopify.com',
	storefrontAccessToken: '1a697ef59debf95309275a34556990e6'
});

var $layout = $('.shop__layout'),
	collectionHandle = $layout.attr('data-collection-name');


// Fetch products from specfic collection
function buildCollectionProducts(collection) {

	client.shop.fetchInfo().then(function(shop) {

		$layout.empty();

		$.each(collection.products, function(index, product) {

			if (product.variants[0].available != false) {

				console.log('product ↓');
				console.log(product);

				var productImages = '';
				$.each(product.images, function(i, val) {
					if (i === 0) return true; // Skip the first image
					productImages += '<div class="each__slide"><img src="' + val.src + '" /></div>';
				});

				var $product = $('<div class="col-xs-12 col-sm-6 col-md-4 product" />').attr('id', 'product-' + product.id).attr('data-variant-id', product.variants[0].id),
					img = $('<a class="fund buy" href="#"><span>Buy</span></a><div class="image" href="#"><img src="' + product.images[0].src + '" /></div>'),
					$meta = $('<div class="meta" />');
					zoom = `<a class="zoom is--gallery" data-gallery='` + productImages + `' href="#"><img src="` + templatesURL + `img/symbol__zoom.svg" /></a>`,
					title = '<h3>' + product.title + '</h3>',
					text = '<div class="text">' + product.descriptionHtml + '</div>',
					price = '<p class="price">' + parseFloat(product.variants[0].price).toLocaleString(navigator.language, {style: 'currency', currency: shop.currencyCode}) + '</p>';

				$meta.append(zoom, title, text, price);
				$product.append(img, $meta);

				$layout.append($product);

			}

		});

		$('.loader').removeClass('is--loading');

	});

}


// Get collection handle from page, then find collection ID based on this then build collection products
client.collection.fetchByHandle(collectionHandle).then(function(collection) {
	//console.log('collection ↓');
	//console.log(collection);
	var collectionID = collection.id;
	client.collection.fetchWithProducts(collectionID).then(function(collection) {
		//console.log('collection ↓');
		//console.log(collection);
		buildCollectionProducts(collection);
	});
});



//
$(document).on('click', 'a[href="#"].buy', function(e) {
	e.preventDefault();

	$('.loader').addClass('is--loading');

	var $this = $(this),
		$product = $this.parents('.product'),
		variantID = $product.attr('data-variant-id');

	var lineItemsToAdd = [{
		variantId: variantID,
		quantity: 1
	}];

	console.log(lineItemsToAdd);

	client.checkout.create().then(function(checkout) {

		var checkoutID = checkout.id;
		console.log('checkout ↓');
		console.log(checkout);

		client.checkout.addLineItems(checkoutID, lineItemsToAdd);

		client.shop.fetchInfo().then(function(shop) {
			window.location.href = checkout.webUrl;
		});

	});

});
