import { useDeleteUserMutation } from '@/lib/react-query/mutations/users'
import { Button } from '@/components/ui/button'
import {
  DialogBackdrop,
  DialogClose,
  DialogPopup,
  DialogPortal,
  DialogRoot,
  DialogTrigger,
} from '@/components/ui/dialog'
import { AlertTriangle, Trash2 } from 'lucide-react'
import * as React from 'react'

export function DeleteAccountDialog() {
  const [confirmationText, setConfirmationText] = React.useState('')
  const [isOpen, setIsOpen] = React.useState(false)
  const deleteMutation = useDeleteUserMutation()

  const expectedText = 'DELETE'
  const isConfirmed = confirmationText === expectedText

  const handleDelete = () => {
    if (!isConfirmed) return
    deleteMutation.mutate()
  }

  return (
    <DialogRoot open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="destructive" size="sm" className="gap-2">
          <Trash2 className="h-4 w-4" />
          Delete Account
        </Button>
      </DialogTrigger>
      <DialogPortal>
        <DialogBackdrop opacity="heavy" />
        <DialogPopup size="default" className="max-w-md">
          <div className="space-y-6">
            <div className="flex items-start gap-4">
              <div className="shrink-0">
                <div className="h-12 w-12 rounded-full bg-destructive/10 flex items-center justify-center">
                  <AlertTriangle className="h-6 w-6 text-destructive" />
                </div>
              </div>
              <div>
                <h2 className="text-lg font-semibold text-foreground">
                  Delete Account
                </h2>
                <p className="text-sm text-muted-foreground mt-1">
                  This action cannot be undone. All your data will be
                  permanently deleted.
                </p>
              </div>
            </div>

            <div className="bg-destructive/5 border border-destructive/20 rounded-lg p-4 space-y-3">
              <p className="text-sm font-medium text-foreground">
                The following will be permanently deleted:
              </p>
              <ul className="text-sm text-muted-foreground space-y-1.5">
                <li>• Your profile and account information</li>
                <li>• Your shortlists and movie selections</li>
                <li>• Your tierlists and movie rankings</li>
                <li>• Your connected OAuth accounts</li>
              </ul>
              <div className="border-t border-destructive/20 pt-3 mt-3">
                <p className="text-sm text-muted-foreground">
                  <span className="text-foreground font-medium">Reviews</span>{' '}
                  will remain on the platform but will be anonymized.
                </p>
              </div>
            </div>

            <div className="space-y-3">
              <p className="text-sm font-medium">
                To confirm, type <span className="font-bold">DELETE</span> in
                the box below:
              </p>
              <input
                type="text"
                value={confirmationText}
                onChange={(e) => setConfirmationText(e.target.value)}
                placeholder="Type DELETE to confirm"
                className="w-full px-3 py-2 rounded-md border border-input bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-1"
                autoFocus
              />
            </div>

            <div className="flex gap-3 pt-2">
              <DialogClose
                render={<Button variant="outline" className="flex-1" />}
              >
                Cancel
              </DialogClose>
              <Button
                variant="destructive"
                className="flex-1"
                disabled={!isConfirmed || deleteMutation.isPending}
                loading={deleteMutation.isPending}
                onClick={handleDelete}
              >
                {deleteMutation.isPending ? 'Deleting...' : 'Delete Account'}
              </Button>
            </div>
          </div>
        </DialogPopup>
      </DialogPortal>
    </DialogRoot>
  )
}
