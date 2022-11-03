document.querySelector('#logout').addEventListener('click', async () => {
  try {
    const res = await axios({
      url: '/api/v1/users/logout',
      method: 'get',
    });

    if (res.status === 200) {
      showAlert('success', 'Logged out successfully!');
      location.reload(true);
    } else {
      showAlert('error', 'You are not currently logged in!');
    }
  } catch (err) {
    showAlert('error', 'No internet connection!');
  }
});
