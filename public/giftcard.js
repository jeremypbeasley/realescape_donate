$( document ).ready(function() {

  // TESTING ONLY: FORM AUTO FILL

  $('[name="customer_name"]').val("John Smith");
  $('[name="from_name"]').val("John Smith");
  $('[name="customer_phone"]').val("2064567890");
  $('[name="recipient_name"]').val("Jane Doe");
  $('[name="recipient_message"]').val("Just for being great and all.");
  $('#ShipToPickup').prop("checked", true);
  $('[name="shipping_address_line1"]').val("171 Lake Washington Blvd E");
  $('[name="shipping_address_line2"]').val("");
  $('[name="shipping_address_city"]').val("Seattle");
  $('[name="shipping_address_state"]').val("Washington");
  $('[name="shipping_address_country"]').val("United States");
  $('[name="shipping_address_postal_code"]').val("98112");
  $('[name="stripeEmail"]').val("jeremy@bsley.com");
  $('#cc').val("4242424242424242");
  $('#ccm').val("12");
  $('#ccy').val("19");
  $('#cvv').val("123");
  $('.FormItem').addClass("active");
  $('.InputGiftAmount').val("123");

  // Populates "You will be charged.." dialogue before submit button

  var shippingCost = 0;
  var enteredAmount;

  function showTotalCharge() {
    if (enteredAmount) {
      totalCharge = enteredAmount + shippingCost;
      $("#YouWillBeCharged").show().text("You will be charged a total of $" + totalCharge + ".00");
    }
  }

  $("#YouWillBeCharged").hide()
  $(".GiftAmount input").keyup(function() {
      enteredAmount = Number($(this).val());
      if (enteredAmount) {
        showTotalCharge();
      } else {
        $("#YouWillBeCharged").hide().text("");
      };
  }).keyup();

  // SHIPPING INFO TOGGLE

  $(".ShippingInformation").hide();

  $('.ShippingSelector').click(function() {
    if($('#ShipToMe').is(':checked')) {
      $(".ShippingInformation").show();
      shippingCost = 4;
      showTotalCharge();
    }
    if ($('#ShipToRecipient').is(':checked')) {
      $(".ShippingInformation").show();
      shippingCost = 4;
      showTotalCharge();
    }
    if ($('#ShipToPickup').is(':checked')) {
      $(".ShippingInformation").hide();
      shippingCost = 0;
      showTotalCharge();
    }
  });

  // CLEVER ANIMATED INPUT FIELDS

  $('input.InputText').each(function() {
    $(this).on('focus', function() {
      $(this).parent('.FormItem').addClass('active');
    });
    $(this).on('blur', function() {
      if ($(this).val().length == 0) {
       $(this).parent('.FormItem').removeClass('active');
      }
      if ($(this).val() != '') {
        $(this).parent('.FormItem').addClass('active');
      }
    });
  });

  // CLEVER ANIMATED SELECT FIELDS

  $('.StateLabel').click(function() {
    $('.StateSelector select').focus();
    $('.StateSelector select').addClass("Active");
  });

  $('.StateSelector select').each(function() {
    $(this).on('focus', function() {
      $('.StateLabel').addClass("Active");
      $(this).removeClass("Default");
    });
  });

});

// ERASE ADDRESS AUTOCOMPLETE IF "PICK UP AT CANLIS" IS SELECTED

$('#ShipToPickup').click(function() {
  $('[name="shipping_address_line1"]').val("");
  $('[name="shipping_address_line2"]').val("");
  $('[name="shipping_address_city"]').val("");
  $('[name="shipping_address_state"]').val("");
  $('[name="shipping_address_country"]').val("");
  $('[name="shipping_address_postal_code"]').val("");
});


// FORM VALIDATION & ERROR MESSAGES

Stripe.setPublishableKey('pk_test_Gbu2akKhNgGjbKi4LPxOOWqc');

$("#payment-form").submit(function(event) {
  $("#payment-form").validate({
    rules: {
      stripeAmount: {
        required: true,
        digits: true
      },
      customer_name: {
        required: true
      },
      stripeEmail: {
        required: true,
        email: true
      },
      customer_phone: {
        required: true,
        digits: true
      },
      recipient_name: {
        required: true,
      },
      shipping_preference: {
        required: true,
      },
      shipping_address_line1: {
        required: ["#ShipToMe:checked", "#ShipToRecipient:checked"]
      },
      shipping_address_city: {
        required: ["#ShipToMe:checked", "#ShipToRecipient:checked"]
      },
      shipping_address_state: {
        required: ["#ShipToMe:checked", "#ShipToRecipient:checked"],
        // equals: ["AL", "AK", "AZ"],
      },
      shipping_address_postal_code: {
        required: ["#ShipToMe:checked", "#ShipToRecipient:checked"]
      },
    },
    messages: {
      stripeAmount: {
        required: "Please tell us how much you you'd like on your gift card.",
        digits: "Please enter a valid whole number."
      },
      customer_name: {
        required: "We'll need your name, please."
      },
      stripeEmail: {
        required: "We'll need your email address in case we have to contact you about your card.",
        email: "Your email address must be in the format of name@domain.com"
      },
      customer_phone: {
        required: "We'll need your phone in case we have to contact you.",
        digits: "Please enter your phone number with only numbers and no spaces."
      },
      recipient_name: {
        required: "Please tell us who this gift card is for.",
      },
      shipping_preference: {
        required: "Please let us know how you'd like your card delivered.",
      },
      shipping_address_line1: {
        required: "Please enter a valid address."
      },
      shipping_address_city: {
        required: "Please enter a valid city name."
      },
      shipping_address_state: {
        required: "Please select a state.",
        // equals: "Please select a valid state."
      },
      shipping_address_postal_code: {
        required: "Please enter a valid ZIP code."
      },
    },
    errorPlacement: function(error, element) {
      if (element.is(":radio")) {
        error.prependTo(element.parents('.ShippingPreference'));
        // error.append('#ShippingHeadline');
      }
      else {
        error.insertAfter(element);
      }
    }
  });
  if(!$("#payment-form").valid()){
    // console.log("aint valid");
    $('body, html').animate({ scrollTop: 0 }, 200);
    event.preventDefault();
    return false;
  }
  if($("#payment-form").valid()){
    // console.log("is valid");
    // Disable the submit button to prevent repeated clicks:
    $(this).find('.SubmitButton').prop('disabled', true);
    // make the submit button spinning to show progress
    $(this).find('.SubmitButton').addClass('Loading');
    // Request a token from Stripe:
    Stripe.card.createToken($("#payment-form"), stripeResponseHandler);
    // Prevent the form from being submitted:
    return false;
  }
});

function renderErrors(errorString) {
  $('body, html').animate({ scrollTop: 0 }, 200);
  $('.FormErrorsCont').show();
  setTimeout(function(){
    $('.FormErrorsCont').addClass("Active");
    $('.FormErrors').addClass("Active");
    $('.FormErrors').text(errorString);
  }, 400);
}

// SENDING FORM

function stripeResponseHandler(status, response) {
  var $form = $('#payment-form');
  if (response.error) {
    renderErrors(response.error.message);
    $form.find('.submit').prop('disabled', false);
  } else {
    var token = response.id;
    $form.append($('<input type="hidden" name="stripeToken">').val(token));
    console.log(token);
    setTimeout(function(){
      $('.SubmitButton').removeClass('Loading');
      $('.SubmitButton').addClass('Complete');
    }, 1000);
    setTimeout(function(){
      $form.get(0).submit();
    }, 1000);
  }
};
