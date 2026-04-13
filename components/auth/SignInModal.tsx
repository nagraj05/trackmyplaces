'use client'

import { SignIn } from '@clerk/nextjs'
import AuthModal from './AuthModal'

interface SignInModalProps {
  isOpen: boolean
  onClose: () => void
  onSwitchToSignUp: () => void
}

export default function SignInModal({ isOpen, onClose, onSwitchToSignUp }: SignInModalProps) {
  return (
    <AuthModal isOpen={isOpen} onClose={onClose}>
      <div className="flex flex-col items-center gap-4">
        <SignIn
          routing="hash"
          fallbackRedirectUrl="/map"
          appearance={{
            elements: {
              rootBox: 'w-full',
              card: 'shadow-2xl rounded-2xl',
            },
          }}
        />
        <p className="text-slate-400 text-sm pb-2">
          Don&apos;t have an account?{' '}
          <button
            onClick={onSwitchToSignUp}
            className="text-green-400 hover:text-green-300 font-medium transition-colors"
          >
            Sign up free
          </button>
        </p>
      </div>
    </AuthModal>
  )
}
