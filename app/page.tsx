'use client'

import { useEffect, useState } from 'react'

import { Sidebar } from '@/components/sidebar'
import { Header } from '@/components/header'
import { addCard } from '@/lib/addCard'

import { DashboardSection } from '@/components/sections/dashboard/dashboard-section'
import { CardAnalysis } from '@/components/sections/card-analysis'
import { TradeTree } from '@/components/sections/trade-tree'
import { ChaseCards } from '@/components/sections/chase-cards'
import { UpcomingSets } from '@/components/sections/upcoming-sets'
import { Rewards } from '@/components/sections/rewards'

import { supabase } from '@/lib/supabaseClient'
import { useRouter } from 'next/navigation'

export default function Home() {
  const router = useRouter()

  const [activeTab, setActiveTab] = useState('dashboard')
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [user, setUser] = useState<any>(null)

  const handleAddTestCard = async () => {
  const result = await addCard({
    name: 'Test Card',
    game: 'pokemon',
    set: 'Test Set',
    year: 2024,
    condition: 'mint',
    marketValue: 100,
    purchasePrice: 50,
    quantity: 1,
    rarity: 'Test Rare',
    imageUrl: '',
    user_id: user?.id
  })

  // optional debug
  console.log('CARD INSERTED:', result)
}

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    setUser(null)
    router.push('/auth')
  }

  // SESSION TRACKING
  useEffect(() => {
    const getSession = async () => {
      const { data } = await supabase.auth.getSession()
      setUser(data.session?.user ?? null)

      if (!data.session?.user) {
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

  return (
    <div className="flex min-h-screen bg-background">

      {/* Sidebar */}
      <div
        className={`fixed inset-y-0 left-0 z-50 lg:relative lg:z-0 transform transition-transform duration-200 ease-in-out ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        <Sidebar
          activeTab={activeTab}
          onTabChange={setActiveTab}
          onAddCard={handleAddTestCard}
        />
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">

        <Header onMenuToggle={() => setSidebarOpen(!sidebarOpen)} />

        <main className="flex-1 p-6 overflow-auto">

          {/* HEADER AREA */}
          <div className="mb-6 space-y-4">

            <div>
              <h1 className="text-2xl font-bold">Dashboard</h1>
              <p className="text-muted-foreground mt-1">
                Track your trading card collection performance
              </p>
            </div>

            {/* USER STATUS + SIGN OUT */}
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

          {activeTab === 'card-analysis' && <CardAnalysis />}
          {activeTab === 'trade-tree' && <TradeTree />}
          {activeTab === 'chase-cards' && <ChaseCards />}
          {activeTab === 'upcoming-sets' && <UpcomingSets />}
          {activeTab === 'rewards' && <Rewards />}

        </main>
      </div>
    </div>
  )
}