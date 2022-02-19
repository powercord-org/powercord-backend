import { h } from 'preact'
import { useRouter } from 'preact-router'
import { useEffect, useState } from 'preact/hooks'
import { Endpoints } from '../../../constants'

export default function Manage () {
  const [ route ] = useRouter<{ id: string }>()
  const [ user, setUser ] = useState()

  useEffect(() => {
    fetch(Endpoints.BACKOFFICE_USER(route.matches.id))
      .then((r) => r.json())
      .then((u) => setUser(u.id ? u : null))
  }, [ route.matches.id ])

  console.log(user)

  return (
    <main>
      <h1>Manage user</h1>
    </main>
  )
}
