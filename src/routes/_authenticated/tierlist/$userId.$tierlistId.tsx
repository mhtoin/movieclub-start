import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_authenticated/tierlist/$userId/$tierlistId')({
  component: RouteComponent,
})

function RouteComponent() {
  const { userId, tierlistId } = Route.useParams()
  return <div>Hello "/_authenticated/tierlist/{userId}/{tierlistId}"!</div>
}
