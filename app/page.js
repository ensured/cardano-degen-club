import HeroLandingPage from "../components/HeroLandingPage"
import HomePage from "../components/HomePage"

export const metadata = {
  title: "Punycode Converter",
}

export default function IndexPage() {
  return (
    <div>
      <HeroLandingPage />
      <div className="h-20 bg-gradient-to-b from-gray-100 to-white shadow-xl shadow-secondary dark:from-gray-800 dark:to-background dark:shadow-none"></div>
      <HomePage />
    </div>
  )
}
