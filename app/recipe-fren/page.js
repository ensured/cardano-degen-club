import dynamic from 'next/dynamic'
const RecipeFren = dynamic(() => import('./RecipeFren'))
const page = () => {
  return <RecipeFren />
}

export default page
