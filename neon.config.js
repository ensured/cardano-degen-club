// Add this to your database configuration
types: {
  getTypeParser: (oid, format) => {
    if (oid === 1184) {
      // TIMESTAMPTZ
      return (value) => new Date(value + 'Z')
    }
    return defaultTypeParser(oid, format)
  }
}
