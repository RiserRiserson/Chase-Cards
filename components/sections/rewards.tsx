'use client'

import { useEffect, useState } from 'react'

type RewardTask = {
  id: string
  text: string
  done: boolean
}

type Reward = {
  id: string
  title: string
  tasks: RewardTask[]
}

const STORAGE_KEY = 'chasecards_rewards'

export function Rewards() {
  const [rewards, setRewards] = useState<Reward[]>([])
  const [newTitle, setNewTitle] = useState('')
  const [newTaskText, setNewTaskText] = useState('')
  const [selectedRewardId, setSelectedRewardId] = useState<string | null>(null)

  // ✅ NEW: prevents overwriting localStorage before it loads
  const [loaded, setLoaded] = useState(false)

  // ---------------- LOAD ----------------
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY)

      if (saved) {
        setRewards(JSON.parse(saved))
      }
    } catch (err) {
      console.error('Failed to load rewards:', err)
    }

    setLoaded(true)
  }, [])

  // ---------------- SAVE ----------------
  useEffect(() => {
    if (!loaded) return

    localStorage.setItem(STORAGE_KEY, JSON.stringify(rewards))
  }, [rewards, loaded])

  // ---------------- CREATE REWARD ----------------
  const addReward = () => {
    if (!newTitle.trim()) return

    const newReward: Reward = {
      id: crypto.randomUUID(),
      title: newTitle,
      tasks: []
    }

    setRewards(prev => [...prev, newReward])
    setNewTitle('')
  }

  // ---------------- ADD TASK ----------------
  const addTask = (rewardId: string) => {
    if (!newTaskText.trim()) return

    setRewards(prev =>
      prev.map(r =>
        r.id === rewardId
          ? {
              ...r,
              tasks: [
                ...r.tasks,
                {
                  id: crypto.randomUUID(),
                  text: newTaskText,
                  done: false
                }
              ]
            }
          : r
      )
    )

    setNewTaskText('')
  }

  // ---------------- TOGGLE TASK ----------------
  const toggleTask = (rewardId: string, taskId: string) => {
    setRewards(prev =>
      prev.map(r =>
        r.id === rewardId
          ? {
              ...r,
              tasks: r.tasks.map(t =>
                t.id === taskId ? { ...t, done: !t.done } : t
              )
            }
          : r
      )
    )
  }

  // ---------------- DELETE REWARD ----------------
  const deleteReward = (rewardId: string) => {
    setRewards(prev => prev.filter(r => r.id !== rewardId))
  }

  // ---------------- COMPLETION CHECK ----------------
  const isComplete = (reward: Reward) =>
    reward.tasks.length > 0 &&
    reward.tasks.every(t => t.done)

  return (
    <div className="p-6 space-y-6">

      {/* HEADER */}
      <div>
        <h2 className="text-xl font-semibold">Rewards</h2>
        <p className="text-muted-foreground mt-1">
          Set goals and complete tasks to unlock rewards
        </p>
      </div>

      {/* CREATE REWARD */}
      <div className="border rounded-lg p-4 space-y-3 bg-card">

        <input
          className="w-full border rounded px-3 py-2 text-sm"
          placeholder="New reward title (e.g. Buy a graded rookie card)"
          value={newTitle}
          onChange={e => setNewTitle(e.target.value)}
        />

        <button
          onClick={addReward}
          className="px-3 py-1 text-sm rounded bg-primary text-primary-foreground"
        >
          Create Reward
        </button>
      </div>

      {/* LIST */}
      <div className="space-y-4">

        {rewards.length === 0 && (
          <p className="text-sm text-muted-foreground">
            No rewards created yet.
          </p>
        )}

        {rewards.map(reward => (
          <div
            key={reward.id}
            className="border rounded-lg p-4 bg-card space-y-3"
          >

            {/* HEADER */}
            <div className="flex items-center justify-between">

              <div className="space-y-1">
                <div className="font-medium flex items-center gap-2">

                  {reward.title}

                  {isComplete(reward) && (
                    <span className="text-xs px-2 py-0.5 rounded bg-green-100 text-green-700">
                      Completed
                    </span>
                  )}

                </div>

                <div className="text-xs text-muted-foreground">
                  {reward.tasks.filter(t => t.done).length} / {reward.tasks.length} tasks complete
                </div>
              </div>

              <button
                onClick={() => deleteReward(reward.id)}
                className="text-xs text-red-500"
              >
                Delete
              </button>

            </div>

            {/* TASK LIST */}
            <div className="space-y-2">

              {reward.tasks.map(task => (
                <label
                  key={task.id}
                  className="flex items-center gap-2 text-sm"
                >
                  <input
                    type="checkbox"
                    checked={task.done}
                    onChange={() => toggleTask(reward.id, task.id)}
                  />
                  <span className={task.done ? 'line-through text-muted-foreground' : ''}>
                    {task.text}
                  </span>
                </label>
              ))}

            </div>

            {/* ADD TASK */}
            <div className="flex gap-2">

              <input
                className="flex-1 border rounded px-3 py-1 text-sm"
                placeholder="Add task..."
                value={selectedRewardId === reward.id ? newTaskText : ''}
                onChange={e => {
                  setSelectedRewardId(reward.id)
                  setNewTaskText(e.target.value)
                }}
              />

              <button
                onClick={() => addTask(reward.id)}
                className="px-3 py-1 text-sm rounded bg-muted border"
              >
                Add
              </button>

            </div>

          </div>
        ))}

      </div>
    </div>
  )
}