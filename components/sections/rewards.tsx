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

  // ---------------- CREATE MODAL STATE ----------------
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [draftTitle, setDraftTitle] = useState('')
  const [draftTaskInput, setDraftTaskInput] = useState('')
  const [draftTasks, setDraftTasks] = useState<string[]>([])

  // ---------------- DRAG STATE ----------------
  const [draggedId, setDraggedId] = useState<string | null>(null)

  const handleDrop = (targetId: string) => {
    if (!draggedId || draggedId === targetId) return

    setRewards(prev => {
      const draggedIndex = prev.findIndex(r => r.id === draggedId)
      const targetIndex = prev.findIndex(r => r.id === targetId)

      if (draggedIndex === -1 || targetIndex === -1) return prev

      const updated = [...prev]
      const [removed] = updated.splice(draggedIndex, 1)
      updated.splice(targetIndex, 0, removed)

      return updated
    })

    setDraggedId(null)
  }

  // ---------------- ADD TASKS IN DRAFT ----------------
  const addDraftTask = () => {
    if (!draftTaskInput.trim()) return
    setDraftTasks(prev => [...prev, draftTaskInput.trim()])
    setDraftTaskInput('')
  }

  const removeDraftTask = (index: number) => {
    setDraftTasks(prev => prev.filter((_, i) => i !== index))
  }

  // only used for localStorage safety
  const [mounted, setMounted] = useState(false)

  // ---------------- LOAD ----------------
  useEffect(() => {
    setMounted(true)

    try {
      const saved = localStorage.getItem(STORAGE_KEY)
      if (saved) setRewards(JSON.parse(saved))
    } catch (err) {
      console.error('Failed to load rewards:', err)
    }
  }, [])

  // ---------------- SAVE ----------------
  useEffect(() => {
    if (!mounted) return
    localStorage.setItem(STORAGE_KEY, JSON.stringify(rewards))
  }, [rewards, mounted])

  // ---------------- CREATE REWARD ----------------
  const addReward = () => {
    if (!draftTitle.trim()) return

    const newReward: Reward = {
      id: crypto.randomUUID(),
      title: draftTitle,
      tasks: draftTasks.map(t => ({
        id: crypto.randomUUID(),
        text: t,
        done: false
      }))
    }

    setRewards(prev => [...prev, newReward])

    setDraftTitle('')
    setDraftTasks([])
    setDraftTaskInput('')
    setShowCreateModal(false)
  }

  // ---------------- ADD TASK (existing rewards) ----------------
  const [newTaskText, setNewTaskText] = useState('')
  const [selectedRewardId, setSelectedRewardId] = useState<string | null>(null)

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
    setSelectedRewardId(null)
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

  // ---------------- DELETE ----------------
  const deleteReward = (rewardId: string) => {
    setRewards(prev => prev.filter(r => r.id !== rewardId))
  }

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

      {/* CREATE BUTTON */}
      <button
        onClick={() => setShowCreateModal(true)}
        className="px-3 py-2 text-sm rounded bg-primary text-primary-foreground"
      >
        Create Reward
      </button>

      {/* CREATE MODAL */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center">
          <div className="bg-card p-4 rounded-lg w-full max-w-md space-y-3">

            <h3 className="font-semibold">Create Reward</h3>

            <input
              className="w-full border rounded px-3 py-2 text-sm"
              placeholder="Reward title"
              value={draftTitle}
              onChange={e => setDraftTitle(e.target.value)}
            />

            <div className="flex gap-2">
              <input
                className="flex-1 border rounded px-3 py-1 text-sm"
                placeholder="Add task..."
                value={draftTaskInput}
                onChange={e => setDraftTaskInput(e.target.value)}
              />
              <button
                onClick={addDraftTask}
                className="px-3 py-1 text-sm rounded bg-muted border"
              >
                Add
              </button>
            </div>

            {/* draft task list */}
            <div className="space-y-1">
              {draftTasks.map((t, i) => (
                <div key={i} className="flex justify-between text-sm">
                  <span>{t}</span>
                  <button
                    onClick={() => removeDraftTask(i)}
                    className="text-red-500 text-xs"
                  >
                    remove
                  </button>
                </div>
              ))}
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setShowCreateModal(false)}
                className="px-3 py-1 text-sm border rounded"
              >
                Cancel
              </button>

              <button
                onClick={addReward}
                className="px-3 py-1 text-sm rounded bg-primary text-primary-foreground"
              >
                Save
              </button>
            </div>

          </div>
        </div>
      )}

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
            draggable
            onDragStart={() => setDraggedId(reward.id)}
            onDragOver={e => e.preventDefault()}
            onDrop={() => handleDrop(reward.id)}
          >

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

            {/* TASKS */}
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