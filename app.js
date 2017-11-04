// Declare dependencies

require('dotenv').config()
const keyPublishable = process.env.keyPublishable;
const keySecret = process.env.keySecret;
const express = require('express')
const app = express()
const stripe = require("stripe")(keySecret);
stripe.setApiVersion('2017-08-15');
const bodyParser = require('body-parser')
const _ = require("lodash");
const getJSON = require('get-json');
const request = require('superagent');
const nodemailer = require('nodemailer');
const moment = require('moment');

app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());
app.use(express.static('public'));
app.set('view engine', 'ejs');

// Initialize the app

app.get("/", (req, res) =>
  res.render("index.ejs", {keyPublishable}));
  console.log('Listening at http://localhost:7000/')

// Functions to perform transaction with Stripe
function buyGiftCard(form, callback) {
  makeCustomer(form, (err, customer) => {
    if (err) {}
    makeCharge(form, customer, (err, charge) => {
      if (err) {}
      callback(null, charge);
      // mailchimpAddSub(order);
      // sendReceipt(order, order);
    });
  });
}


function makeCustomer(form, callback) {
  stripe.customers.create({
    email: form.stripeEmail,
    source: form.stripeToken
  }, function(err, customer) {
      if (err) {}
      callback(null, customer);
      console.log(customer);
    }
  )
}

function makeCharge(form, customer, callback) {
  stripe.charges.create({
    amount: form.stripeAmount * 100,
    currency: "usd",
    source: customer,
    description: "Charge for john@john.com"
  }, function(err, charge) {
      if (err) {}
      callback(null, charge);
      console.log(charge);
    }
  )
}


// Send a receipt

let transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.googleAppsUsername,
        pass: process.env.googleAppsPassword
    }
});

// Setup email data
function sendReceipt(order, charge) {
  // Shortens full name to first name
  function getFirstName(str) {
    if (str.indexOf(' ') === -1) {
      return str;
    } else {
      return str.substr(0, str.indexOf(' '));
    }
  };
  var firstName = getFirstName(order.metadata.customer_name) + ".";
  var date = new Date("January 25, 2015");
  var charge_amount = (order.items[0].amount / 100).toFixed(2);
  var charge_shipping = ( function() {
    if (order.metadata.shipping_preference !== "pickup") {
      return '4.00';
    } else {
      return '0.00';
    }
  }) ();
  var charge_total = (charge.amount / 100).toFixed(2);
  var date = moment(Date.now()).format('MMMM Do YYYY, h:mm:ss a');
  var address_link = ( function() {
    if (order.shipping.address.line2 !== null) {
      return 'https://www.google.com/maps/place/' + order.shipping.address.line1 + '+' + order.shipping.address.line2 + '+' + order.shipping.address.city + '+' + order.shipping.address.state + '+' + order.shipping.address.postal_code;
    } else {
      return 'https://www.google.com/maps/place/' + order.shipping.address.line1 + '+' + order.shipping.address.city + '+' + order.shipping.address.state + '+' + order.shipping.address.postal_code;
    }
  }) ();
  var shipping_greeting = ( function() {
    if (order.metadata.shipping_preference == "pickup") {
      return 'We&#39;ll have it ready for you in 1-2 business days. <br><br>Feel free to call us at <a href="tel:2062833313" style="color: black;text-decoration: none;">(206) 283-3313</a> to confirm it&apos;s ready before you visit our office. <br><br> Need directions to our office? Click <a href="https://www.google.com/maps/place/Canlis/@47.6430933,-122.3467535,15z" target="_blank">here</a>.';
    }
    if (order.metadata.shipping_preference == "customer") {
      return 'We&#39;ll be shipping it to you in 1-2 business days.';
    }
    if (order.metadata.shipping_preference == "recipient") {
      return 'We&#39;ll be shipping it to ' + getFirstName(order.metadata.recipient_name) + ' in 1-2 business days.';
    }
  }) ();
  let shippingContent = [
    '<p>',
      'Shipping To:<br>',
      '<a href="', address_link, '" style="color: black;text-decoration: none;">',
        order.shipping.address.line1, "&nbsp;",
        order.shipping.address.line2, '<br>',
        order.shipping.address.city, '&#44; ', order.shipping.address.state, '<br>',
        order.shipping.address.postal_code, '</a>',
    '</p>',
  ].join('\n');
  var shipping_section = ( function() {
    if (order.metadata.shipping_preference !== "pickup") {
      return shippingContent;
    } else {
      return;
    }
  }) ();
  let html = [
    '<head>',
      '<meta content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no" name="viewport">',
    '</head>',
    '<style> .im {color: #000000 !important;} </style>',
    '<div class="EmailContainer" style="font-family: &quot;Courier New&quot;, Courier, monospace;font-size: 13px;color: black;background: white;line-height: 150%;max-width: 400px;margin: 30px 0px 60px 0px;">',
      '<hr style="width: 100%;height: 1px;border: none;border-bottom: 1px dashed black;background: transparent;margin: 32px 0px;">',
      '<img class="Logo" src="https://cdn2.dropmarkusercontent.com/39456/a4c04c2d4c01cd3377567b5feba635eda5b2917a/canlislogo.jpg" style="width: 100px;margin: 60px 0px;">',
      '<p>Hello,', firstName, '</p>',
      '<p>Thanks for purchasing a gift card with us. ',
        shipping_greeting,
      '</p>',
      '<p>Order No. #', order.id, '</p>',
      '<hr style="width: 100%;height: 1px;border: none;border-bottom: 1px dashed black;background: transparent;margin: 32px 0px;">',
      '<table style="width: 100%;margin: 0px;padding: 0px;border-spacing: 0px;font-family: &quot;Courier New&quot;, Courier, monospace;font-size: 13px;color: black;">',
        '<tbody>',
          '<tr style="margin: 0px;padding: 0px;border: none;font-family: &quot;Courier New&quot;, Courier, monospace;font-size: 13px;">',
            '<td style="margin: 0px;padding: 0px;border: none;font-family: &quot;Courier New&quot;, Courier, monospace;font-size: 13px;">',
              '<span style="display: block;padding: .5em 0px;">',
                'Gift Card Amount:',
              '</span>',
            '</td>',
            '<td class="Currency" style="margin: 0px;padding: 0px;border: none;font-family: &quot;Courier New&quot;, Courier, monospace;font-size: 13px;text-align: right;">',
              '<span style="display: block;padding: .5em 0px;">$',
                charge_amount,
              '</span>',
            '</td>',
          '</tr>',
          '<tr style="margin: 0px;padding: 0px;border: none;font-family: &quot;Courier New&quot;, Courier, monospace;font-size: 13px;">',
            '<td style="margin: 0px;padding: 0px;border: none;font-family: &quot;Courier New&quot;, Courier, monospace;font-size: 13px;">',
              '<span style="display: block;padding: .5em 0px;">',
                'Shipping:',
              '</span>',
            '</td>',
            '<td class="Currency" style="margin: 0px;padding: 0px;border: none;font-family: &quot;Courier New&quot;, Courier, monospace;font-size: 13px;text-align: right;">',
              '<span style="display: block;padding: .5em 0px;">$',
                charge_shipping,
              '</span>',
            '</td>',
          '</tr>',
          '<tr style="margin: 0px;padding: 0px;border: none;font-family: &quot;Courier New&quot;, Courier, monospace;font-size: 13px;">',
            '<td style="margin: 0px;padding: 0px;border: none;font-family: &quot;Courier New&quot;, Courier, monospace;font-size: 13px;">',
              '<span style="display: block;padding: .5em 0px;">',
                'Total:',
              '</span>',
            '</td>',
            '<td class="Currency" style="margin: 0px;padding: 0px;border: none;font-family: &quot;Courier New&quot;, Courier, monospace;font-size: 13px;text-align: right;">',
              '<span style="display: block;padding: .5em 0px;">$',
                charge_total,
              '</span>',
            '</td>',
          '</tr>',
        '</tbody>',
      '</table>',
      // unable to display this without separate query given that order.pay does not return CC info
      // '<p>Paid via ', charge.source.brand, ' ending in ', charge.source.last4,'</p>',
      '<hr style="width: 100%;height: 1px;border: none;border-bottom: 1px dashed black;background: transparent;margin: 32px 0px;">',
      '<table style="width: 100%;margin: 0px;padding: 0px;border-spacing: 0px;font-family: &quot;Courier New&quot;, Courier, monospace;font-size: 13px;color: black;">',
        '<tbody>',
          '<tr style="margin: 0px;padding: 0px;border: none;font-family: &quot;Courier New&quot;, Courier, monospace;font-size: 13px;">',
            '<td style="margin: 0px;padding: 0px;border: none;font-family: &quot;Courier New&quot;, Courier, monospace;font-size: 13px;">',
              '<span style="display: block;padding: .5em 0px;">',
                'Name:',
              '</span>',
            '</td>',
            '<td class="Currency" style="margin: 0px;padding: 0px;border: none;font-family: &quot;Courier New&quot;, Courier, monospace;font-size: 13px;text-align: right;">',
              '<span style="display: block;padding: .5em 0px;">',
                order.metadata.customer_name,
              '</span>',
            '</td>',
          '</tr>',
          '<tr style="margin: 0px;padding: 0px;border: none;font-family: &quot;Courier New&quot;, Courier, monospace;font-size: 13px;">',
            '<td style="margin: 0px;padding: 0px;border: none;font-family: &quot;Courier New&quot;, Courier, monospace;font-size: 13px;">',
              '<span style="display: block;padding: .5em 0px;">',
                'Email:',
              '</span>',
            '</td>',
            '<td class="Currency" style="margin: 0px;padding: 0px;border: none;font-family: &quot;Courier New&quot;, Courier, monospace;font-size: 13px;text-align: right;">',
              '<span style="display: block;padding: .5em 0px;">',
                '<a href="mailto:', order.email, '" style="color: black;text-decoration: none;">',
                  order.email,
                '</a>',
              '</span>',
            '</td>',
          '</tr>',
          '<tr style="margin: 0px;padding: 0px;border: none;font-family: &quot;Courier New&quot;, Courier, monospace;font-size: 13px;">',
            '<td style="margin: 0px;padding: 0px;border: none;font-family: &quot;Courier New&quot;, Courier, monospace;font-size: 13px;">',
              '<span style="display: block;padding: .5em 0px;">',
                'Date:',
              '</span>',
            '</td>',
            '<td class="Currency" style="margin: 0px;padding: 0px;border: none;font-family: &quot;Courier New&quot;, Courier, monospace;font-size: 13px;text-align: right;">',
              '<span style="display: block;padding: .5em 0px;">',
                '<a href="" style="color: black;text-decoration: none;">',
                  date,
                '</a>',
              '</span>',
            '</td>',
          '</tr>',
        '</tbody>',
      '</table>',
      shipping_section,
      '<hr style="width: 100%;height: 1px;border: none;border-bottom: 1px dashed black;background: transparent;margin: 32px 0px;">',
      '<p>If you have any questions about your card, please call us at <a href="tel:2062833313" style="color: black;text-decoration: none;">(206) 283-3313</a>.</p>',
    '</div>',
  ].join('\n');
  let mailOptions = {
      from: '"Canlis" <no-reply@canlis.com>',
      to: order.email,
      subject: '✉️ Your gift card receipt from Canlis.',
      text: '',
      html: html
  };
  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
        return console.log(error);
    }
    console.log('Email receipt %s sent: %s', info.messageId, info.response);
  });
};

// Form submission
app.post('/thanks', function (req, res) {
  buyGiftCard(req.body, (err, done) => {
    if (err) {}
    // console.log(done);
    res.render("thanks.ejs");
  });
})

// Listening
app.listen(process.env.PORT || 7000);
