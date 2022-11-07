const formUpdateUserDataEl = document.querySelector('#update-user-data');
const formUpdateUserPasswordEl = document.querySelector(
  '#update-user-password'
);

// the types are either password or email
const updateSettings = async (e, type) => {
  e.preventDefault();

  let data = {};
  if (type === 'email') {
    const name = document.querySelector('#name').value;
    const email = document.querySelector('#email').value;
    data = { name, email };
  } else if (type === 'password') {
    const passwordCurrent = document.querySelector('#password-current').value;
    const password = document.querySelector('#password').value;
    const passwordConfirm = document.querySelector('#password-confirm').value;
    data = { password, passwordCurrent, passwordConfirm };
  }

  const url =
    type === 'email'
      ? 'api/v1/users/update-me'
      : '/api/v1/users/update-my-password';

  try {
    const result = await axios({
      url,
      method: 'patch',
      data,
    });

    if (result.status === 201) {
      showAlert('success', 'Data updated successfully!');
    } else {
      showAlert('error', `Data failed to update: ${result.message}`);
    }
  } catch (err) {
    showAlert('error', err.response.data.message);
  }
};

formUpdateUserDataEl.addEventListener('submit', async (e) =>
  updateSettings(e, 'email')
);

formUpdateUserPasswordEl.addEventListener('submit', async (e) =>
  updateSettings(e, 'password')
);
