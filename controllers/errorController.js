// O Express sabe que essa é uma função de error handling pois ela recebe quatro parâmetros.
module.exports = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';
  res.status(err.statusCode).json({ status: 'fail', message: err.message });
};
