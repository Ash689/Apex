function generate8DigitToken() {
    return Math.floor(10000000 + Math.random() * 90000000).toString();
}

module.exports = generate8DigitToken;
  