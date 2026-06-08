'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'

import { Sidebar } from '@/components/sidebar'
import { Header } from '@/components/header'
import { AddCardModal } from '@/components/add-card-modal'

import { DashboardSection } from '@/components/sections/dashboard/dashboard-section'
import { CardAnalysis } from '@/components/sections/card-analysis'
import { TradeTree } from '@/components/sections/trade-tree'
import { ChaseCards } from '@/components/sections/chase-cards'
import { UpcomingSets } from '@/components/sections/upcoming-sets'
import { Rewards } from '@/components/sections/rewards'
import { CollectionSection } from '@/components/sections/collection'
import { AnalyticsSection } from '@/components/sections/analytics'
import { SettingsSection } from '@/components/sections/settings'

import { supabase } from '@/lib/supabaseClient'

export default function Home() {
  const router = useRouter()
  const searchParams = useSearchParams()

  // ✅ ACTIVE TAB NOW COMES FROM URL
  const activeTab = searchParams.get('tab') || 'dashboard'

  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [user, setUser] = useState<any>(null)
  const [addOpen, setAddOpen] = useState(false)

  // SESSION TRACKING
  useEffect(() => {
    const getSession = async () => {
      const { data } = await supabase.auth.getSession()

      const sessionUser = data.session?.user ?? null
      setUser(sessionUser)

      if (!sessionUser) {
        router.push('/auth')
      }
    }

    getSession()

    const { data: listener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        const sessionUser = session?.user ?? null
        setUser(sessionUser)

        if (!sessionUser) {
          router.push('/auth')
        }
      }
    )

    return () => {
      listener.subscription.unsubscribe()
    }
  }, [router])

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    setUser(null)
    router.push('/auth')
  }

  return (
    <div className="flex min-h-screen bg-background">

      {/* SIDEBAR */}
      <div
        className={`fixed inset-y-0 left-0 z-50 lg:relative lg:z-0 transform transition-transform duration-200 ease-in-out ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        <Sidebar
          activeTab={activeTab}
          onTabChange={(tab) => {
            router.push(`/?tab=${tab}`)   // (temporary safe behavior)
            setSidebarOpen(false)
          }}
          onAddCard={() => setAddOpen(true)}
          userEmail={user?.email}
        />
      </div>

      {/* MAIN */}
      <div className="flex-1 flex flex-col min-w-0">

        <Header onMenuToggle={() => setSidebarOpen(!sidebarOpen)} />

        <main className="flex-1 p-6 overflow-auto">

          {/* HEADER */}
          <div className="mb-6 space-y-4">

            <div>
              <h1 className="text-2xl font-bold">Dashboard</h1>
              <p className="text-muted-foreground mt-1">
                Track your trading card collection performance
              </p>
            </div>

            {user && (
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">
                  Logged in as: {user.email}
                </span>

                <button
                  onClick={handleSignOut}
                  className="px-3 py-1 rounded bg-red-600 text-white text-xs"
                >
                  Sign Out
                </button>
              </div>
            )}
          </div>

          {/* TABS */}
          {activeTab === 'dashboard' && (
            <DashboardSection userId={user?.id} />
          )}

          {activeTab === 'collection' && (
            <CollectionSection userId={user?.id} />
          )}

          {activeTab === 'analytics' && (
            <AnalyticsSection />
          )}

          {activeTab === 'card-analysis' && (
            <CardAnalysis />
          )}

          {activeTab === 'trade-tree' && (
            <TradeTree />
          )}

          {activeTab === 'chase-cards' && (
            <ChaseCards />
          )}

          {activeTab === 'upcoming-sets' && (
            <UpcomingSets />
          )}

          {activeTab === 'rewards' && (
            <Rewards />
          )}

        </main>
      </div>

      {/* MODAL */}
      <AddCardModal
        userId={user?.id}
        open={addOpen}
        onClose={() => setAddOpen(false)}
        onSuccess={() => {
          console.log('card added')
        }}
      />
    </div>
  )
}