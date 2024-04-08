import CardForm from "../../components/CardForm"

export const metadata = {
  title: "Punycode Converter",
}
const page = () => {
  return (
    <div className="mt-24">
      <CardForm autoFocus={true} />
    </div>
  )
}

export default page
