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
  createCustomer(form, (err, customer) => {
    if (err) {}
    createCharge(customer, form, (err, charge) => {
      if (err) {}
      callback(null, charge);
      console.log("Customer " + charge.source.name + " successfully charged $" + charge.amount / 100 + "." );
    });
  });
}

function createCustomer(form, callback) {
  stripe.customers.create({
    email: form.stripeEmail,
    source: form.stripeToken
  }, function(err, customer) {
      if (err) {}
      callback(null, customer);
    }
  )
}

function createCharge(customer, form, callback) {
  stripe.charges.create({
    amount: form.stripeAmount,
    currency: "usd",
    customer: customer.id,
  }, function(err, charge) {
      if (err) {}
      callback(null, charge);
    }
  )
}

// Form submission
app.post('/thanks', function (req, res) {
  buyGiftCard(req.body, (err, done) => {
    if (err) {}
    // console.log(done);
    // res.render("thanks.ejs");
  });
})

// Listening
app.listen(process.env.PORT || 7000);
