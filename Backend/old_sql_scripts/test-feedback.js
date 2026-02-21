fetch('http://localhost:6001/api/studentet/2/idet/1/feedback')
  .then(async (res) => {
    console.log('status', res.status);
    console.log(await res.text());
    process.exit(0);
  })
  .catch((err) => {
    console.error('request failed', err);
    process.exit(1);
  });
