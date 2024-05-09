const generateUniqueId = async () => {
  let uniqueEmployeeId = "";
  let isUnique = false;
  while (!isUnique) {
    // Generate a random 6-digit number
    const randomNumber = Math.floor(100000 + Math.random() * 900000);
    uniqueEmployeeId = randomNumber.toString();

    // Check if the generated employeeId already exists in the database
    const existingEmployee = await Lead.findOne({
      employeeId: uniqueEmployeeId,
    });

    // If the employeeId does not exist, mark it as unique
    if (!existingEmployee) {
      isUnique = true;
    }
  }
  return uniqueEmployeeId;
};

module.exports = generateUniqueId;
