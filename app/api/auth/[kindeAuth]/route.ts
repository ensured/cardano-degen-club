import { headers } from "next/headers"
import {handleAuth} from "@kinde-oss/kinde-auth-nextjs/server";
import { NextRequest } from "next/server";
export async function GET(request:NextRequest, {params}) {
    const endpoint = params.kindeAuth;
    return handleAuth(request, endpoint);
  }

// export async function GET(request: Request, { params }) {
//   const headersList = headers()
//   const referer = headersList.get("referer")
//   const q = referer ? new URL(referer).searchParams.get("q") : null
//   const endpoint = params.kindeAuth
//   //   console.log(endpoint)
//   return handleAuth(request, endpoint)
// }
