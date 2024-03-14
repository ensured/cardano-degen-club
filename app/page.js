import HeroLandingPage from "../components/HeroLandingPage"
import HomePage from "../components/HomePage"

export const metadata = {
  title: "Punycode Converter",
}

export default function IndexPage() {
  return (
    <div>
      <HeroLandingPage />
      <HomePage />
    </div>
  )
}
