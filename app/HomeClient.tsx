'use client'

import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'

import { Sidebar } from '@/components/sidebar'
import { Header } from '@/components/header'
import { AddCardModal } from '@/components/add-card-modal'

import { DashboardSection } from '@/components/sections/dashboard/dashboard-section'
import { CardAnalysisLayout } from '@/components/card-analysis/CardAnalysisLayout'
import { CardChain } from '@/components/sections/card-chain'
import { ChaseCards } from '@/components/sections/chase-cards'
import { UpcomingEvents } from '@/components/sections/upcoming-events'
import { Rewards } from '@/components/sections/rewards'
import { CollectionSection } from '@/components/sections/collection'
import { AnalyticsSection } from '@/components/sections/analytics'

import { supabase } from '@/lib/supabaseClient'

type Profile = {
  id: string
  display_name: string
  email: string | null
  card_count: number
}

export default function Home() {
  const router = useRouter()

  const [activeTab, setActiveTab] = useState('dashboard')
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [user, setUser] = useState<any>(null)
  const [addOpen, setAddOpen] = useState(false)

  const [profiles, setProfiles] = useState<Profile[]>([])
  const [profilesLoading, setProfilesLoading] = useState(false)

  const [selectedCollectionUserId, setSelectedCollectionUserId] =
    useState<string>('')

  const [collectionSearch, setCollectionSearch] = useState('')

  // ---------------- RESTORE TAB FROM URL ----------------
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)

    let tab = params.get('tab')?.trim()

    if (tab === 'trade-tree') {
      tab = 'card-chain'
    }

    const validTabs = [
      'dashboard',
      'collection',
      'analytics',
      'card-analysis',
      'card-chain',
      'chase-cards',
      'upcoming-events',
      'rewards'
    ]

    if (tab && validTabs.includes(tab)) {
      setActiveTab(tab)
    } else {
      setActiveTab('dashboard')
    }
  }, [])

  // ---------------- SESSION TRACKING ----------------
  useEffect(() => {
    const getSession = async () => {
      const { data } = await supabase.auth.getSession()

      const sessionUser = data.session?.user ?? null

      setUser(sessionUser)

      if (sessionUser) {
        setSelectedCollectionUserId(previous =>
          previous || sessionUser.id
        )
      } else {
        router.push('/auth')
      }
    }

    void getSession()

    const { data: listener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        const sessionUser = session?.user ?? null

        setUser(sessionUser)

        if (sessionUser) {
          setSelectedCollectionUserId(previous =>
            previous || sessionUser.id
          )
        } else {
          setSelectedCollectionUserId('')
          setCollectionSearch('')
          router.push('/auth')
        }
      }
    )

    return () => {
      listener.subscription.unsubscribe()
    }
  }, [router])

  // ---------------- LOAD PROFILE OPTIONS AND CARD COUNTS ----------------
  useEffect(() => {
    if (!user?.id) {
      setProfiles([])
      return
    }

    const loadProfiles = async () => {
      setProfilesLoading(true)

      const [
        { data: profileData, error: profileError },
        { data: cardData, error: cardError }
      ] = await Promise.all([
        supabase
          .from('profiles')
          .select('id, display_name, email')
          .order('display_name', { ascending: true }),

        supabase
          .from('cards')
          .select('user_id')
      ])

      if (profileError) {
        console.error('Unable to load profiles:', profileError)

        setProfiles([])
        setProfilesLoading(false)
        return
      }

      if (cardError) {
        console.error('Unable to load card counts:', cardError)
      }

      const cardCounts = new Map<string, number>()

      for (const card of cardData ?? []) {
        if (!card.user_id) continue

        cardCounts.set(
          card.user_id,
          (cardCounts.get(card.user_id) ?? 0) + 1
        )
      }

      const profilesWithCounts = (profileData ?? []).map(profile => ({
        ...profile,
        card_count: cardCounts.get(profile.id) ?? 0
      }))

      setProfiles(profilesWithCounts)
      setProfilesLoading(false)
    }

    void loadProfiles()
  }, [user?.id])

  const activeCollectionUserId =
    selectedCollectionUserId || user?.id || ''

  const isOwnCollection =
    Boolean(user?.id) &&
    activeCollectionUserId === user.id

  const selectedCollectionProfile = useMemo(
    () =>
      profiles.find(
        profile => profile.id === activeCollectionUserId
      ) ?? null,
    [profiles, activeCollectionUserId]
  )

  const handleSignOut = async () => {
    await supabase.auth.signOut()

    setUser(null)
    setProfiles([])
    setSelectedCollectionUserId('')
    setCollectionSearch('')

    router.push('/auth')
  }

  const handleTabChange = (tab: string) => {
    const normalizedTab =
      tab.trim() === 'trade-tree'
        ? 'card-chain'
        : tab.trim()

    setActiveTab(normalizedTab)
    router.push(`/?tab=${normalizedTab}`)
    setSidebarOpen(false)
  }

  const handleCollectionSearchSubmit = () => {
    if (!collectionSearch.trim()) return

    setActiveTab('collection')
    router.push('/?tab=collection')
    setSidebarOpen(false)
  }

  return (
    <div className="flex min-h-screen bg-background">
      {/* SIDEBAR */}
      <div
        className={`fixed inset-y-0 left-0 z-50 transform transition-transform duration-200 ease-in-out lg:relative lg:z-0 ${
          sidebarOpen
            ? 'translate-x-0'
            : '-translate-x-full lg:translate-x-0'
        }`}
      >
        <Sidebar
          activeTab={activeTab}
          onTabChange={handleTabChange}
          onAddCard={() => {
            if (
              activeTab === 'collection' &&
              !isOwnCollection
            ) {
              setSelectedCollectionUserId(user?.id ?? '')
            }

            setAddOpen(true)
          }}
          userEmail={user?.email}
        />
      </div>

      {/* MAIN */}
      <div className="flex min-w-0 flex-1 flex-col">
        <Header
          onMenuToggle={() => setSidebarOpen(!sidebarOpen)}
          searchValue={collectionSearch}
          onSearchChange={setCollectionSearch}
          onSearchSubmit={handleCollectionSearchSubmit}
          searchPlaceholder="Search collection..."
          searchEnabled
        />

        <main className="flex-1 overflow-auto p-6">
          {/* DASHBOARD HEADER */}
          {activeTab === 'dashboard' && (
            <div className="mb-6 space-y-4">
              <div>
                <h1 className="text-2xl font-bold">
                  Dashboard
                </h1>

                <p className="mt-1 text-muted-foreground">
                  Track your trading card collection performance
                </p>
              </div>

              {user && (
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">
                    Logged in as: {user.email}
                  </span>

                  <button
                    type="button"
                    onClick={handleSignOut}
                    className="rounded bg-red-600 px-3 py-1 text-xs text-white"
                  >
                    Sign Out
                  </button>
                </div>
              )}
            </div>
          )}

          {/* PAGE CONTENT */}
          {activeTab === 'dashboard' ? (
            <DashboardSection userId={user?.id} />
          ) : activeTab === 'collection' ? (
            <div className="space-y-4">
              {/* COLLECTION OWNER SELECTOR */}
              <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border bg-card p-4">
                <div>
                  <div className="text-sm font-semibold">
                    Viewing Collection
                  </div>

                  <div className="text-xs text-muted-foreground">
                    Select a collector to view their cards.
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  {!isOwnCollection && (
                    <span className="rounded border px-2 py-1 text-xs text-muted-foreground">
                      Read only
                    </span>
                  )}

                  <select
                    value={activeCollectionUserId}
                    onChange={event => {
                      setSelectedCollectionUserId(
                        event.target.value
                      )

                      setCollectionSearch('')
                    }}
                    disabled={profilesLoading}
                    className="min-w-48 rounded border bg-background px-3 py-2 text-sm"
                  >
                    {profilesLoading && (
                      <option value="">
                        Loading collectors...
                      </option>
                    )}

                    {!profilesLoading &&
                      profiles.map(profile => (
                        <option
                          key={profile.id}
                          value={profile.id}
                        >
                          {profile.display_name} (
                          {profile.card_count}{' '}
                          {profile.card_count === 1
                            ? 'card'
                            : 'cards'}
                          )
                          {profile.id === user?.id
                            ? ' — You'
                            : ''}
                        </option>
                      ))}
                  </select>
                </div>
              </div>

              <CollectionSection
                userId={activeCollectionUserId}
                readOnly={!isOwnCollection}
                ownerName={
                  selectedCollectionProfile?.display_name ??
                  'Selected collector'
                }
                searchQuery={collectionSearch}
              />
            </div>
          ) : activeTab === 'analytics' ? (
            <AnalyticsSection />
          ) : activeTab === 'card-analysis' ? (
            <CardAnalysisLayout />
          ) : activeTab === 'card-chain' ? (
            <CardChain />
          ) : activeTab === 'chase-cards' ? (
            <ChaseCards />
          ) : activeTab === 'upcoming-events' ? (
            <UpcomingEvents />
          ) : activeTab === 'rewards' ? (
            <Rewards />
          ) : (
            <DashboardSection userId={user?.id} />
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