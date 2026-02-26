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
        <DialogPopup className="p-0 overflow-hidden">
          <div className="relative flex flex-col">
            <div className="flex flex-col space-y-1.5 text-center sm:text-left p-6 pb-0">
              <h2 className="text-2xl font-semibold leading-none tracking-tight">
                Welcome
              </h2>
              <p className="text-sm text-muted-foreground mt-2">
                Login to your account or create a new one to continue.
              </p>
            </div>
            <div className="p-6 pt-4">
              <LoginForm />
            </div>
            <DialogClose className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-4 w-4"
              >
                <path d="M18 6 6 18" />
                <path d="m6 6 12 12" />
              </svg>
              <span className="sr-only">Close</span>
            </DialogClose>
          </div>
        </DialogPopup>
      </DialogPortal>
    </DialogRoot>
  )
}
