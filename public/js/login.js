/* eslint-disable */
const login = async (email, password) => {
  try {
    const result = await axios({
      url: '/api/v1/users/signin',
      method: 'post',
      data: { email, password },
    });

    if (result.status === 200) {
      document.cookie = `jwt=${result.data.token}`;
      window.setTimeout(() => location.assign('/'), 1500);
      showAlert('success', 'You are successfully logged in!');
    }
  } catch (err) {
    if(err)
      showAlert('error', err.message);
  }
}



document.querySelector('form.form').addEventListener('submit', async (e) => {
  e.preventDefault();

  const email = document.querySelector('#email').value;
  const password = document.querySelector('#password').value;

  login(email, password);
});



