"use client";
import { ClerkProvider } from '@clerk/nextjs'

export default function CustomClerkProvider({children}) {
  return (
    <ClerkProvider publishableKey={"pk_live_Y2xlcmsuY2FyZGFub2RlZ2VuLnNob3Ak"}>
      {children}
    </ClerkProvider>
  );
}

