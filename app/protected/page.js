"use server";

import {
  LoginLink,
  LogoutLink,
  getKindeServerSession,
} from "@kinde-oss/kinde-auth-nextjs/server"
import { Title } from "@radix-ui/react-dialog"

import { CardTitle } from "@/components/ui/card"
import Comments from "@/components/Comments"
import { GetObjectCommand, ListObjectsV2Command, s3Client } from "../../lib/s3"

export async function listFeedbackObjects() {
  try {
    const params = {
      Bucket: process.env.S3_BUCKET_NAME,
      Prefix: "feedback/"
    }

    const response = await s3Client.send(new ListObjectsV2Command(params))
    const feedbackObjects = response.Contents

    return { success: true, feedbackObjects }
  } catch (error) {
    console.error(error)
    return { success: false, message: "Error listing feedback objects" }
  }
}

export async function getFeedbackDataByKey(key) {
  try {
    const params = {
      Bucket: process.env.S3_BUCKET_NAME,
      Key: key,
    }

    const response = await s3Client.send(new GetObjectCommand(params))
    const feedbackDataBuffer = await streamToBuffer(response.Body)

    const feedbackData = JSON.parse(feedbackDataBuffer.toString())

    return { success: true, feedbackData }
  } catch (error) {
    console.error(error)
    return { success: false, message: "Error getting feedback data" }
  }
}
async function streamToBuffer(stream) {
  return new Promise((resolve, reject) => {
    const chunks = []
    stream.on("data", (chunk) => chunks.push(chunk))
    stream.on("end", () => resolve(Buffer.concat(chunks)))
    stream.on("error", (error) => reject(error))
  })
}

function extractTitle(key) {
  // Assuming your file key has a format like "feedback/{name}-{date}.json"
  const parts = key.split("-")
  const title = parts
    .slice(0, parts.length - 1)
    .join("-")
    .replace("feedback/", "")
    .split("-")[0]
  return title
}



const page = async () => {
  const { getUser, isAuthenticated } = getKindeServerSession()
  const user = getUser()
  if (isAuthenticated) {
    if (user?.email === "finalemail417@gmail.com") {

      return (
        <>

          <div className="flex flex-col items-center justify-center">
            <Comments />
          </div>

        </>
      )
    } else {
      return (
        <div className="flex flex-col items-center justify-center pt-40">
          {/* Display feedback data here */}
          <CardTitle>No Comments</CardTitle>
          <LogoutLink className="rounded-md bg-teal-900 p-2 px-5">
            Log out
          </LogoutLink>
        </div>
      )
    }
  }
}
// const { success, feedbackObjects } = await listFeedbackObjects()
// if (success) {
//   if (feedbackObjects) {
//     const feedbackList = await Promise.all(
//       feedbackObjects.map(async (object) => {
//         const { success: getSuccess, feedbackData } =
//           await getFeedbackDataByKey(object.Key)
//         return getSuccess ? feedbackData : null
//       })
//     )
//     return (
//       <div className="flex flex-col items-center justify-center">
//         <CardTitle>Comments</CardTitle>
//         <div className=" flex flex-wrap justify-center">
//           {/* Display feedback data here */}

//           {feedbackList.length > 0 &&
//             feedbackList.map((feedback, index) => (
//               <div key={index} style={commentStyle}>
//                 <p>
//                   <strong>Date:</strong> {feedback.date}
//                 </p>
//                 <p>
//                   <strong>Name: </strong>
//                   {extractTitle(feedbackObjects[index].Key)}
//                 </p>
//                 <p>
//                   <strong>Feedback: </strong> {feedback.feedback}
//                 </p>
//               </div>
//             ))}
//           <LogoutLink className="mx-20 flex w-full items-center justify-center rounded-md bg-teal-700 p-2 px-5 text-slate-50 dark:bg-teal-700 dark:text-slate-950">
//             Log out
//           </LogoutLink>
//         </div>
//       </div>
//     )
//   } else {
//     return (
//       <div className="flex flex-col items-center justify-center pt-40">
//         {/* Display feedback data here */}
//         <CardTitle>No Comments</CardTitle>
//         <LogoutLink className="rounded-md bg-teal-900 p-2 px-5">
//           Log out
//         </LogoutLink>
//       </div>
//     )
//   }


// return (
//   <div className="flex flex-col items-center justify-center pt-40">
//     {user ? (
//       <>
//         {user.given_name}, this page is restricted.
//         <LogoutLink>Log out</LogoutLink>
//       </>
//     ) : (
//       <>
//         <h2>Not authenticated</h2>
//         <LoginLink className="rounded-md bg-teal-900 p-2 px-5">
//           Log in
//         </LoginLink>
//       </>
//     )}
//   </div>
// )
// }

export default page
