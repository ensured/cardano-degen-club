import punycode from "punycode/";

const punycodeConverter = (text) => {
  // check if text is punycode
  if (text.startsWith("xn--")) {
    // convert punycode to unicode
    return punycode.toUnicode(text)
  }
  // convert unicode to punycode
  return punycode.toASCII(text)
}

export default punycodeConverter
