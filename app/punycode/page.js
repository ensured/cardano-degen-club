import Animation from "@/components/Animation"

import CardForm from "../../components/CardForm"

export const metadata = {
  title: "Punycode Converter",
}
const page = () => {
  return (
    <Animation>
      <div className="mt-24">
        <CardForm autoFocus={true} />
      </div>
    </Animation>
  )
}

export default page
