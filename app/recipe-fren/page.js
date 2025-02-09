import dynamic from 'next/dynamic'
const RecipeFren = dynamic(() => import('./RecipeFren'), { ssr: false })
const page = () => {
  return <RecipeFren />
}

export default page
