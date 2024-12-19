import Animation from "@/components/Animation"

import CardForm from "../../components/CardForm"

export const metadata = {
  title: "Punycode Converter | Unicode & ASCII Conversion Tool",
  description:
    "Convert between Punycode, Unicode, and ASCII characters. Essential tool for handling internationalized domain names and special characters.",
  keywords:
    "punycode converter, unicode converter, ASCII conversion, IDN, domain names, character encoding",
  openGraph: {
    title: "Punycode Converter | Unicode & ASCII Conversion Tool",
    description: "Convert between Punycode, Unicode, and ASCII characters.",
    type: "website",
  },
}

const page = () => {
  return (
    <Animation>
      <main className="mt-14 sm:mt-10">
        <h1 className="sr-only">Punycode and Unicode Converter Tool</h1>
        <CardForm />
      </main>
    </Animation>
  )
}

export default page
