'use client'

import { useUser, SignInButton, SignOutButton } from '@clerk/nextjs'
import Link from 'next/link'

export default function AuthButton() {
  const { isSignedIn, isLoaded } = useUser()

  if (!isLoaded) return null

  if (isSignedIn) {
    return (
      <div className="flex items-center gap-3">
        <Link href="/dashboard" className="text-sm text-[#1D9E75] font-medium hover:underline">
          Dashboard
        </Link>
        <Link href="/saved" className="text-sm text-gray-500 hover:text-[#1D9E75] transition-colors">
          Sauvegardés
        </Link>
        <SignOutButton>
          <button className="text-sm text-gray-400 hover:text-gray-600 transition-colors">
            Déconnexion
          </button>
        </SignOutButton>
      </div>
    )
  }

  return (
    <SignInButton mode="modal">
      <button className="text-sm px-3 py-1.5 rounded-lg border border-[#1D9E75] text-[#1D9E75] hover:bg-[#1D9E75] hover:text-white transition-colors">
        Connexion
      </button>
    </SignInButton>
  )
}
