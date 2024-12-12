"use client";
import { ClerkProvider } from '@clerk/nextjs'

export default function CustomClerkProvider({children}) {
  return (
    <ClerkProvider publishableKey={"pk_test_c2hpbmluZy1lbXUtNDYuY2xlcmsuYWNjb3VudHMuZGV2JA"}>
      {children}
    </ClerkProvider>
  );
}

