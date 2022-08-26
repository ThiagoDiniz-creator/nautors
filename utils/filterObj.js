module.exports = (object, desiredFields) => {
  const arrayOfProperties = Object.entries(object);
  const filteredProperties = arrayOfProperties.filter((el) =>
    desiredFields.some((field) => field === el[0])
  );
  const filteredObj = Object.fromEntries(filteredProperties);
  return filteredObj;
};
