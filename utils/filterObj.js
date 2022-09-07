module.exports = (object, desiredFields) => {
  const arrayOfProperties = Object.entries(object);
  const filteredProperties = arrayOfProperties.filter(([el]) =>
    desiredFields.includes(el)
  );
  // eslint-disable-next-line node/no-unsupported-features/es-builtins
  return Object.fromEntries(filteredProperties);
};
