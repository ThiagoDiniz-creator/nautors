const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');
const Tour = require('../models/tourModel');

exports.getCheckoutSession = catchAsync(async (req, res) => {
  // 1) Get the currently booked tour
  const tour = await Tour.findById(req.params.tourId);
  if (!tour) {
    return new AppError("Could'nt find the request tour!", 404);
  }

  // 2) Create the checkout session
  const paymentIntent = await stripe.paymentIntents.create({
    automatic_payment_methods: {
      enabled: true,
    },
    amount: tour.price * 100,
    currency: 'usd',
  });

  // 3) Create the session as response
  res.status(200).json({ clientSecret: paymentIntent.client_secret });
});
