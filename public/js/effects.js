const hideAlert = () => {
  const el = document.querySelector('.alert');
  if (el) {
    el.parentElement.removeChild(el);
  }
};

// The type is either success or error
const showAlert = (type, message) => {
  hideAlert();
  const markup = document.createElement('div');
  markup.classList.add('alert', `alert--${type}`);
  markup.innerText = message;
  document.querySelector('body').insertAdjacentElement('afterbegin', markup);
  setTimeout(hideAlert, 5000);
};