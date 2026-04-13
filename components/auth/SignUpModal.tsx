'use client'

import { SignUp } from '@clerk/nextjs'
import AuthModal from './AuthModal'

interface SignUpModalProps {
  isOpen: boolean
  onClose: () => void
  onSwitchToSignIn: () => void
}

export default function SignUpModal({ isOpen, onClose, onSwitchToSignIn }: SignUpModalProps) {
  return (
    <AuthModal isOpen={isOpen} onClose={onClose}>
      <div className="flex flex-col items-center gap-4">
        <SignUp
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
          Already have an account?{' '}
          <button
            onClick={onSwitchToSignIn}
            className="text-green-400 hover:text-green-300 font-medium transition-colors"
          >
            Sign in
          </button>
        </p>
      </div>
    </AuthModal>
  )
}
