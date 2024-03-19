import { headers } from 'next/headers'
import PortForwardChecker from './PortForwardChecker'

const page = () => {
  const headersList = headers()
  const usersIp = headersList.get('x-forwarded-for')
  return <PortForwardChecker usersIp={usersIp} />
}

export default page
