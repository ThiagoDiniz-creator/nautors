const bookTour = async (tourId) => {
  // 1) Get checkout session from API.
  const checkoutSession = await axios(
    `http://localhost:8000/api/v1/bookings/checkout-session/${tourId}`,
    { method: 'GET' }
  );

  // 2) Create checkout form
  window.location.href = checkoutSession.data.url;
};

const bookBtnEl = document.querySelector('#book-tour');
if (bookBtnEl) {
  bookBtnEl.addEventListener('click', (e) => {
    e.preventDefault();
    e.target.textContent = 'Processing.....';
    const { tourId } = e.target.dataset;
    bookTour(tourId).then();
  });
}
