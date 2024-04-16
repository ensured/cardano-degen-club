import { headers } from "next/headers"
import { handleAuth } from "@kinde-oss/kinde-auth-nextjs/server"

export const GET = handleAuth()

// export async function GET(request: Request, { params }) {
//   const headersList = headers()
//   const referer = headersList.get("referer")
//   const q = referer ? new URL(referer).searchParams.get("q") : null
//   const endpoint = params.kindeAuth
//   //   console.log(endpoint)
//   return handleAuth(request, endpoint)
// }
