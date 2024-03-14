import { z } from "zod"

export const FormDataSchema = z.object({
  name: z
    .string()
    .min(2, { message: "Name must be at least 2 characters" })
    .max(26, { message: "Name must be less than 26 characters" }),
  feedback: z
    .string()
    .min(16, { message: "Message must be at least 16 characters" })
    .max(250, { message: "Message must be less than 250 characters" }),
})
