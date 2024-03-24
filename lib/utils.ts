import { clsx, type ClassValue } from "clsx"
import { toast } from "sonner"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function CheckForNotificiationsPermission() {
  if (!("Notification" in window)) {
    alert("This browser does not support desktop notification")
  } else if (Notification.permission === "granted") {
    console.log("Notification permissions already granted")
  } else if (Notification.permission !== "denied") {
    Notification.requestPermission().then((permission) => {
      if (permission === "granted") {
        console.log("Notification permissions granted")
        const notification = new Notification("Notifications enabled!", {
          body: `You will now receive notifications when new listings are found`,
          icon: "/favicon.ico",
        })
      } else if (permission === "denied") {
        toast(
          "Notifications disabled, you will not recieve push notifications",
          {
            duration: 3000,
          }
        )
      }
    })
  }
}

export function extractRecipeName(url: string) {
  const recipePath = url.split("/")[4]
  const lastDashIndex = recipePath.lastIndexOf("-")
  const cleanedName =
    lastDashIndex !== -1 ? recipePath.substring(0, lastDashIndex) : recipePath

  const capitalizedString = cleanedName
    .split("-")
    .join(" ")
    .replace(/(^|\s)\S/g, (char) => char.toUpperCase())

  return capitalizedString
}
