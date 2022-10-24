document.querySelector('form.form').addEventListener('submit', async (e) => {
  e.preventDefault();

  const email = document.querySelector('#email').value;
  const password = document.querySelector('#password').value;

  const result = await axios({
    url: '/api/v1/users/signin',
    method: 'post',
    data: { email, password },
  });

  if (result.status == 200) {
    document.cookie = `jwt=${result.data.token}`;
  }

  // const result = await fetch('/api/v1/users/signin', {
  //   method: 'post',
  //   body: JSON.stringify({ email, password }),
  //   headers: {
  //     Accept: 'application/json',
  //     'Content-Type': 'application/json',
  //   },
  // });
});
