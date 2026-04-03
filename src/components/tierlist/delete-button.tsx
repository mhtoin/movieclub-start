import { Button } from '@/components/ui/button'
import { deleteTierlist } from '@/lib/react-query/mutations/tierlists'
import { tierlistQueries } from '@/lib/react-query/queries/tierlists'
import { Toast } from '@base-ui/react/toast'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Trash2 } from 'lucide-react'

export function DeleteButton({
  tierlistId,
  userId,
  compact = false,
}: {
  tierlistId: string
  userId: string
  compact?: boolean
}) {
  const queryClient = useQueryClient()
  const toastManager = Toast.useToastManager()

  const deleteMutation = useMutation({
    mutationFn: deleteTierlist,
    onSuccess: () => {
      toastManager.add({
        title: 'Deleted',
        description: 'Tierlist removed',
        type: 'success',
      })
      queryClient.invalidateQueries({
        queryKey: tierlistQueries.userSummary(userId).queryKey,
      })
    },
    onError: () => {
      toastManager.add({
        title: 'Error',
        description: 'Failed to delete',
        type: 'error',
      })
    },
  })

  if (compact) {
    return (
      <Button
        variant="ghost"
        size="icon"
        className="h-8 w-8 text-muted-foreground hover:text-destructive"
        onClick={(e) => {
          e.preventDefault()
          e.stopPropagation()
          if (confirm('Delete this tierlist?')) {
            deleteMutation.mutate({ data: { id: tierlistId } })
          }
        }}
      >
        <Trash2 className="h-3.5 w-3.5" />
      </Button>
    )
  }

  return (
    <Button
      variant="ghost"
      size="icon"
      className="text-muted-foreground hover:text-destructive"
      onClick={(e) => {
        e.preventDefault()
        e.stopPropagation()
        if (confirm('Delete this tierlist?')) {
          deleteMutation.mutate({ data: { id: tierlistId } })
        }
      }}
    >
      <Trash2 className="h-4 w-4" />
    </Button>
  )
}
