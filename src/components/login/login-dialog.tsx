import { Button } from '../ui/button'
import {
  DialogBackdrop,
  DialogClose,
  DialogPopup,
  DialogPortal,
  DialogRoot,
  DialogTrigger,
} from '../ui/dialog'
import LoginForm from './login-form'

export default function LoginDialog() {
  return (
    <DialogRoot>
      <DialogTrigger>
        <Button variant="primary">Login or Sign Up</Button>
      </DialogTrigger>
      <DialogPortal>
        <DialogBackdrop />
        <DialogPopup>
          <div className="flex flex-col gap-4">
            <LoginForm />
            <div className="flex justify-end gap-4">
              <DialogClose>
                <Button variant="secondary">Close</Button>
              </DialogClose>
            </div>
          </div>
        </DialogPopup>
      </DialogPortal>
    </DialogRoot>
  )
}
