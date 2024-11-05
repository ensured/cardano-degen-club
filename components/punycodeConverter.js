import punycode from "punycode/";

const punycodeConverter = (text) => {
  // Validate input
  if (typeof text !== 'string') {
    return "Input must be a string";
  }

  // check if text is punycode
  if (text.startsWith("xn--")) {
    // convert punycode to unicode
    try {
      return punycode.toUnicode(text);
    } catch (error) {
      return `${error}`;
    }
  }

  // convert unicode to punycode
  try {
    return punycode.toASCII(text);
  } catch (error) {
    return `Error converting unicode to punycode: ${error.message}`;
  }
}

export default punycodeConverter;
