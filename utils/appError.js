class AppError extends Error {
  constructor(message, statusCode) {
    // O super irá obter da classe que está herdando o elemento message, que também faz parte do constructor do Error.
    super(message);
    // O super irá definir o this.message com o valor da message que foi recebida.

    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
    this.isOperational = true;

    // Essa operação irá garantir que a classe AppError não seja inclusa no stack trace
    // , que é o 'trajeto' que é percorrido entre o erro e onde estamos.
    Error.captureStackTrace(this, this.constructor);
  }
}

module.exports = AppError;
