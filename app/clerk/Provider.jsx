"use client";
import { ClerkProvider } from '@clerk/nextjs'

export default function CustomClerkProvider({children}) {
  return (
    <ClerkProvider>
      {children}
    </ClerkProvider>
  );
}

