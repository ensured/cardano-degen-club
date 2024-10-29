import { Config } from "tailwindcss"

declare module "tailwindcss/types/config" {
  interface ScreensConfig {
    xxs: string
    xs: string
  }
}
