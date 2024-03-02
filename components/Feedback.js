// import FeedBackDrawer from "./FeedbackClient"
import { PutObjectCommand, s3Client } from "../lib/s3"

function getCurrentShorthandDate() {
  const currentDate = new Date();
  const day = currentDate.getDate();
  const month = currentDate.getMonth() + 1; // Months are zero-based
  const year = currentDate.getFullYear();

  // Pad single-digit day and month with leading zeros
  const paddedDay = day < 10 ? `0${day}` : day;
  const paddedMonth = month < 10 ? `0${month}` : month;

  // Format the date as YYYY-MM-DD
  const shorthandDate = `${year}-${paddedMonth}-${paddedDay}`;

  return shorthandDate;
}



const putObjectInS3Bucket = async (text) => {
  const date = getCurrentShorthandDate()
  try {
    const jsonData = JSON.stringify({ date, text })
    const params = {
      Bucket: process.env.S3_BUCKET_NAME,
      Key: `feedback/${getCurrentShorthandDate(date)}.json`,
      Body: jsonData,
    }

    const res = await s3Client.send(new PutObjectCommand(params))
    console.log(res)
  } catch (error) {
    console.log(error)
  }
  return
}

const Feedback = async () => {
  await putObjectInS3Bucket("GET YOUR WEBSITE CLEANER!!")

  return (
    <div className="container">
      <div className="flex flex-col justify-center items-center text-slate-500">
        test
      </div>
    </div>
  )
}

export default Feedback
