function ProfileForm({ className }) {
  function formatDateShorthand(dateString) {
    const date = new Date(dateString)
    return `${date.getFullYear()}${padZero(date.getMonth() + 1)}${padZero(
      date.getDate()
    )}-${padZero(date.getHours())}${padZero(date.getMinutes())}${padZero(
      date.getSeconds()
    )}`
  }

  function padZero(number) {
    return number.toString().padStart(2, "0")
  }

  const putObject = async (text) => {
    try {
      const date = new Date().toISOString()
      const jsonData = JSON.stringify({ date, text })
      const params = {
        Bucket: process.env.S3_BUCKET_NAME,
        Key: `feedback/${formatDateShorthand(date)}.json`,
        Body: jsonData,
      }

      await s3Client.send(new PutObjectCommand(params))
    } catch (error) {
      console.log(error)
    }
    return
  }
}

export default putObject
