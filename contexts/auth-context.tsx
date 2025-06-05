"use client"

import type React from "react"

import { createContext, useEffect, useState } from "react"
import type { User } from "@supabase/supabase-js"
import { supabase } from "@/lib/supabase"

interface AuthContextType {
  user: User | null
  loading: boolean
  signInWithEmail: (email: string) => Promise<void>
  signInWithGoogle: () => Promise<void>
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
      setLoading(false)
    })
  }, [])

  const signInWithEmail = async (email: string) => {
    // Removed emailRedirectTo to prevent any redirects
    const { error } = await supabase.auth.signInWithOtp({
      email,
    })
    if (error) throw error
  }

  const signInWithGoogle = async () => {
    // Removed redirectTo to prevent any redirects
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
    })
    if (error) throw error
  }

  const signOut = async () => {
    await supabase.auth.signOut()
  }

  return (
    <AuthContext.Provider value={{ user, loading, signInWithEmail, signInWithGoogle, signOut }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchUser() {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      setUser(user)
      setLoading(false)
    }

    fetchUser()

    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user || null)
      // No redirects - just update state
    })

    return () => {
      authListener.subscription.unsubscribe()
    }
  }, [])

  const signInWithGoogle = async () => {
    // Removed redirectTo to prevent any redirects
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
    })
    if (error) throw error
  }

  const signOut = async () => {
    await supabase.auth.signOut()
  }

  return {
    user,
    loading,
    signOut,
    supabase,
    signInWithGoogle,
  }
}