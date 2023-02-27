const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');
const Tour = require('../models/tourModel');
const Booking = require('../models/bookingModel');
const HandlerFactory = require('./handlerFactory');

exports.getCheckoutSession = catchAsync(async (req, res) => {
  // 1) Get the currently booked tour
  const tour = await Tour.findById(req.params.tourId);
  if (!tour) {
    return new AppError("Couldn't find the requested tour!", 404);
  }

  // 2) Create the checkout session
  const session = await stripe.checkout.sessions.create({
    mode: 'payment',
    success_url: `${req.protocol}://${req.get('host')}/?tour=${
      req.params.tourId
    }&user=${req.user.id}&price=${tour.price}`,
    cancel_url: `${req.protocol}://${req.get('host')}/tour/${tour.slug}`,
    customer_email: req.user.email,
    client_reference_id: req.params.tourId,
    line_items: [
      {
        // Currency needs to be in cents
        price_data: {
          currency: 'usd',
          product_data: {
            name: tour.name,
            images: tour.images,
          },
          unit_amount: tour.price * 100,
        },
        quantity: 1,
      },
    ],
  });

  // 3) Create the session as response
  res.status(200).json({
    status: 'success',
    url: session.url,
  });
});

exports.createBookingCheckout = catchAsync(async (req, res, next) => {
  // This is only temporary, because it's insecure.
  const { tour, user, price } = req.query;
  if (!tour || !user || !price) return next();

  await Booking.create({
    tour,
    user,
    price,
  });

  res.redirect(req.originalUrl.split('?')[0]);
});

// Get all the bookings
exports.getAllBookings = HandlerFactory.getAll(Booking);

// Get one specific booking
exports.getBooking = HandlerFactory.getOne(Booking);

// Create directly a booking
exports.createBooking = HandlerFactory.createOne(Booking);

// Update a booking
exports.updateBooking = HandlerFactory.updateOne(Booking);

// Delete a booking
exports.deleteBooking = HandlerFactory.deleteOne(Booking);
