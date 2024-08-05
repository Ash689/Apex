function validateDateOfBirth(dateOfBirth, minAgeInput) {
    const minAge = minAgeInput;
    const maxAge = 100;
    const dob = new Date(dateOfBirth);
    const now = new Date();
  
    if (isNaN(dob.getTime())) {
      return 'Invalid date format.';
    }
    if (dob > now) {
      return 'Date of birth cannot be in the future.';
    }
  
    const age = now.getFullYear() - dob.getFullYear();
    const monthDifference = now.getMonth() - dob.getMonth();
    const dayDifference = now.getDate() - dob.getDate();
  
    if (monthDifference < 0 || (monthDifference === 0 && dayDifference < 0)) {
      age--;
    }
  
    if (age < minAge) {
      return 'You must be at least 18 years old.';
    }
    if (age > maxAge) {
      return 'Age must be less than 100 years old.';
    }
  
    return null; // No error
}

module.exports = validateDateOfBirth;