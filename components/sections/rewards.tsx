'use client'

import {
  useEffect,
  useState,
  type CSSProperties,
  type DragEvent,
  type KeyboardEvent
} from 'react'

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

type DraggedTask = {
  rewardId: string
  taskId: string
}

const STORAGE_KEY = 'chasecards_rewards'

export function Rewards() {
  const [rewards, setRewards] = useState<Reward[]>([])
  const [mounted, setMounted] = useState(false)

  // ---------------- CREATE MODAL STATE ----------------
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [draftTitle, setDraftTitle] = useState('')
  const [draftTaskInput, setDraftTaskInput] = useState('')
  const [draftTasks, setDraftTasks] = useState<string[]>([])

  // ---------------- ADD TASK STATE ----------------
  const [newTaskText, setNewTaskText] = useState('')
  const [selectedRewardId, setSelectedRewardId] = useState<string | null>(
    null
  )

  // ---------------- EDIT TASK STATE ----------------
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null)
  const [editingRewardId, setEditingRewardId] = useState<string | null>(
    null
  )
  const [editingTaskText, setEditingTaskText] = useState('')

  // ---------------- REWARD DRAG STATE ----------------
  const [draggedRewardId, setDraggedRewardId] = useState<string | null>(
    null
  )

  // ---------------- TASK DRAG STATE ----------------
  const [draggedTask, setDraggedTask] = useState<DraggedTask | null>(null)

  // ---------------- LOAD ----------------
  useEffect(() => {
    setMounted(true)

    try {
      const saved = localStorage.getItem(STORAGE_KEY)

      if (saved) {
        setRewards(JSON.parse(saved))
      }
    } catch (error) {
      console.error('Failed to load rewards:', error)
    }
  }, [])

  // ---------------- SAVE ----------------
  useEffect(() => {
    if (!mounted) return

    localStorage.setItem(STORAGE_KEY, JSON.stringify(rewards))
  }, [rewards, mounted])

  // ---------------- CREATE MODAL ----------------
  const closeCreateModal = () => {
    setShowCreateModal(false)
    setDraftTitle('')
    setDraftTaskInput('')
    setDraftTasks([])
  }

  // ---------------- ADD TASKS IN DRAFT ----------------
  const addDraftTask = () => {
    const taskText = draftTaskInput.trim()

    if (!taskText) return

    setDraftTasks(previous => [...previous, taskText])
    setDraftTaskInput('')
  }

  const removeDraftTask = (index: number) => {
    setDraftTasks(previous =>
      previous.filter((_, taskIndex) => taskIndex !== index)
    )
  }

  const handleDraftTaskKeyDown = (
    event: KeyboardEvent<HTMLInputElement>
  ) => {
    if (event.key !== 'Enter') return

    event.preventDefault()
    addDraftTask()
  }

  // ---------------- CREATE REWARD ----------------
  const addReward = () => {
    const title = draftTitle.trim()

    if (!title) return

    const newReward: Reward = {
      id: crypto.randomUUID(),
      title,
      tasks: draftTasks.map(taskText => ({
        id: crypto.randomUUID(),
        text: taskText,
        done: false
      }))
    }

    setRewards(previous => [...previous, newReward])
    closeCreateModal()
  }

  // ---------------- ADD TASK ----------------
  const addTask = (rewardId: string) => {
    const taskText = newTaskText.trim()

    if (!taskText || selectedRewardId !== rewardId) return

    setRewards(previous =>
      previous.map(reward =>
        reward.id === rewardId
          ? {
              ...reward,
              tasks: [
                ...reward.tasks,
                {
                  id: crypto.randomUUID(),
                  text: taskText,
                  done: false
                }
              ]
            }
          : reward
      )
    )

    setNewTaskText('')
    setSelectedRewardId(null)
  }

  const handleNewTaskKeyDown = (
    event: KeyboardEvent<HTMLInputElement>,
    rewardId: string
  ) => {
    if (event.key !== 'Enter') return

    event.preventDefault()
    addTask(rewardId)
  }

  // ---------------- TOGGLE TASK ----------------
  const toggleTask = (rewardId: string, taskId: string) => {
    setRewards(previous =>
      previous.map(reward =>
        reward.id === rewardId
          ? {
              ...reward,
              tasks: reward.tasks.map(task =>
                task.id === taskId
                  ? {
                      ...task,
                      done: !task.done
                    }
                  : task
              )
            }
          : reward
      )
    )
  }

  // ---------------- EDIT TASK ----------------
  const startEditTask = (rewardId: string, task: RewardTask) => {
    setEditingRewardId(rewardId)
    setEditingTaskId(task.id)
    setEditingTaskText(task.text)
  }

  const cancelEditTask = () => {
    setEditingRewardId(null)
    setEditingTaskId(null)
    setEditingTaskText('')
  }

  const saveTaskEdit = () => {
    const taskText = editingTaskText.trim()

    if (!editingRewardId || !editingTaskId || !taskText) return

    setRewards(previous =>
      previous.map(reward =>
        reward.id === editingRewardId
          ? {
              ...reward,
              tasks: reward.tasks.map(task =>
                task.id === editingTaskId
                  ? {
                      ...task,
                      text: taskText
                    }
                  : task
              )
            }
          : reward
      )
    )

    cancelEditTask()
  }

  const handleEditTaskKeyDown = (
    event: KeyboardEvent<HTMLInputElement>
  ) => {
    if (event.key === 'Enter') {
      event.preventDefault()
      saveTaskEdit()
    }

    if (event.key === 'Escape') {
      event.preventDefault()
      cancelEditTask()
    }
  }

  // ---------------- DELETE TASK ----------------
  const deleteTask = (rewardId: string, taskId: string) => {
    setRewards(previous =>
      previous.map(reward =>
        reward.id === rewardId
          ? {
              ...reward,
              tasks: reward.tasks.filter(task => task.id !== taskId)
            }
          : reward
      )
    )

    if (
      editingRewardId === rewardId &&
      editingTaskId === taskId
    ) {
      cancelEditTask()
    }
  }

  // ---------------- REORDER REWARDS ----------------
  const handleRewardDragStart = (
    event: DragEvent<HTMLButtonElement>,
    rewardId: string
  ) => {
    setDraggedRewardId(rewardId)
    event.dataTransfer.effectAllowed = 'move'
    event.dataTransfer.setData('text/plain', rewardId)
  }

  const handleRewardDrop = (targetRewardId: string) => {
    if (
      !draggedRewardId ||
      draggedRewardId === targetRewardId ||
      draggedTask
    ) {
      return
    }

    setRewards(previous => {
      const draggedIndex = previous.findIndex(
        reward => reward.id === draggedRewardId
      )

      const targetIndex = previous.findIndex(
        reward => reward.id === targetRewardId
      )

      if (draggedIndex === -1 || targetIndex === -1) {
        return previous
      }

      const updatedRewards = [...previous]
      const [removedReward] = updatedRewards.splice(draggedIndex, 1)

      updatedRewards.splice(targetIndex, 0, removedReward)

      return updatedRewards
    })

    setDraggedRewardId(null)
  }

  const handleRewardDragEnd = () => {
    setDraggedRewardId(null)
  }

  // ---------------- REORDER TASKS ----------------
  const handleTaskDragStart = (
    event: DragEvent<HTMLButtonElement>,
    rewardId: string,
    taskId: string
  ) => {
    event.stopPropagation()

    setDraggedTask({
      rewardId,
      taskId
    })

    setDraggedRewardId(null)

    event.dataTransfer.effectAllowed = 'move'
    event.dataTransfer.setData(
      'text/plain',
      JSON.stringify({
        rewardId,
        taskId
      })
    )
  }

  const handleTaskDrop = (
    event: DragEvent<HTMLDivElement>,
    rewardId: string,
    targetTaskId: string
  ) => {
    event.preventDefault()
    event.stopPropagation()

    if (
      !draggedTask ||
      draggedTask.rewardId !== rewardId ||
      draggedTask.taskId === targetTaskId
    ) {
      return
    }

    setRewards(previous =>
      previous.map(reward => {
        if (reward.id !== rewardId) return reward

        const draggedIndex = reward.tasks.findIndex(
          task => task.id === draggedTask.taskId
        )

        const targetIndex = reward.tasks.findIndex(
          task => task.id === targetTaskId
        )

        if (draggedIndex === -1 || targetIndex === -1) {
          return reward
        }

        const updatedTasks = [...reward.tasks]
        const [removedTask] = updatedTasks.splice(draggedIndex, 1)

        updatedTasks.splice(targetIndex, 0, removedTask)

        return {
          ...reward,
          tasks: updatedTasks
        }
      })
    )

    setDraggedTask(null)
  }

  const handleTaskDragEnd = () => {
    setDraggedTask(null)
  }

  // ---------------- DELETE REWARD ----------------
  const deleteReward = (rewardId: string) => {
    const confirmed = window.confirm('Delete this reward?')

    if (!confirmed) return

    setRewards(previous =>
      previous.filter(reward => reward.id !== rewardId)
    )

    if (selectedRewardId === rewardId) {
      setSelectedRewardId(null)
      setNewTaskText('')
    }

    if (editingRewardId === rewardId) {
      cancelEditTask()
    }
  }

  // ---------------- PROGRESS ----------------
  const getCompletedTaskCount = (reward: Reward) =>
    reward.tasks.filter(task => task.done).length

  const getProgressPercentage = (reward: Reward) => {
    if (reward.tasks.length === 0) return 0

    return Math.round(
      (getCompletedTaskCount(reward) / reward.tasks.length) * 100
    )
  }

  const getProgressStyle = (
  percentage: number
): CSSProperties => ({
  background: `conic-gradient(
    var(--primary) 0% ${percentage}%,
    var(--muted) ${percentage}% 100%
  )`
})

  const isComplete = (reward: Reward) =>
    reward.tasks.length > 0 &&
    reward.tasks.every(task => task.done)

  if (!mounted) {
    return (
      <div className="p-6 text-sm text-muted-foreground">
        Loading...
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      {/* HEADER */}
      <div>
        <h2 className="text-2xl font-semibold">Rewards</h2>

        <p className="text-muted-foreground mt-1">
          Set goals and complete tasks to unlock rewards
        </p>
      </div>

      {/* CREATE BUTTON */}
      <button
        type="button"
        onClick={() => setShowCreateModal(true)}
        className="px-3 py-2 text-sm rounded bg-primary text-primary-foreground"
      >
        Create Reward
      </button>

      {/* CREATE MODAL */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-card border p-4 rounded-lg w-full max-w-md space-y-3">
            <h3 className="font-semibold">Create Reward</h3>

            <input
              className="w-full border rounded px-3 py-2 text-sm"
              placeholder="Reward title"
              value={draftTitle}
              onChange={event => setDraftTitle(event.target.value)}
            />

            <div className="space-y-1">
              {draftTasks.map((taskText, index) => (
                <div
                  key={`${taskText}-${index}`}
                  className="flex items-center justify-between gap-3 text-sm"
                >
                  <span className="min-w-0 wrap-break-word">
                    {taskText}
                  </span>

                  <button
                    type="button"
                    onClick={() => removeDraftTask(index)}
                    className="text-red-500 text-xs shrink-0"
                  >
                    remove
                  </button>
                </div>
              ))}

              <div className="flex gap-2 pt-2">
                <input
                  className="flex-1 border rounded px-3 py-1 text-sm"
                  placeholder="Add task..."
                  value={draftTaskInput}
                  onChange={event =>
                    setDraftTaskInput(event.target.value)
                  }
                  onKeyDown={handleDraftTaskKeyDown}
                />

                <button
                  type="button"
                  onClick={addDraftTask}
                  className="px-3 py-1 text-sm rounded bg-muted border"
                >
                  Add
                </button>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={closeCreateModal}
                className="px-3 py-1 text-sm border rounded"
              >
                Cancel
              </button>

              <button
                type="button"
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

        {rewards.map(reward => {
          const completedTaskCount = getCompletedTaskCount(reward)
          const progressPercentage = getProgressPercentage(reward)

          return (
            <div
              key={reward.id}
              className={`border rounded-lg p-4 bg-card space-y-3 ${
                draggedRewardId === reward.id ? 'opacity-50' : ''
              }`}
              onDragOver={event => event.preventDefault()}
              onDrop={() => handleRewardDrop(reward.id)}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3 min-w-0">
                  <button
                    type="button"
                    draggable
                    onDragStart={event =>
                      handleRewardDragStart(event, reward.id)
                    }
                    onDragEnd={handleRewardDragEnd}
                    className="mt-0.5 cursor-grab active:cursor-grabbing text-muted-foreground hover:text-foreground shrink-0"
                    aria-label={`Drag ${reward.title}`}
                    title="Drag to reorder reward"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="h-4 w-4"
                      aria-hidden="true"
                    >
                      <circle cx="9" cy="5" r="1" />
                      <circle cx="9" cy="12" r="1" />
                      <circle cx="9" cy="19" r="1" />
                      <circle cx="15" cy="5" r="1" />
                      <circle cx="15" cy="12" r="1" />
                      <circle cx="15" cy="19" r="1" />
                    </svg>
                  </button>

                  <div className="space-y-1 min-w-0">
                    <div className="font-medium flex flex-wrap items-center gap-2">
                      <span className="wrap-break-word">
                        {reward.title}
                      </span>

                      {isComplete(reward) && (
                        <span className="text-xs px-2 py-0.5 rounded bg-green-100 text-green-700">
                          Completed
                        </span>
                      )}
                    </div>

                    <div className="text-xs text-muted-foreground">
                      {completedTaskCount} / {reward.tasks.length}{' '}
                      tasks complete
                    </div>
                  </div>
                </div>

                <div className="flex items-start gap-4 shrink-0">
                  {/* PROGRESS PIE */}
                  <div
                    className="relative h-16 w-16 rounded-full shrink-0"
                    style={getProgressStyle(progressPercentage)}
                    role="img"
                    aria-label={`${progressPercentage}% complete`}
                    title={`${progressPercentage}% complete`}
                  >
                    <div className="absolute inset-2 rounded-full bg-card flex items-center justify-center">
                      <span className="text-xs font-semibold">
                        {progressPercentage}%
                      </span>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => deleteReward(reward.id)}
                    className="text-xs text-red-500 shrink-0"
                  >
                    Delete
                  </button>
                </div>
              </div>

              {/* TASKS */}
              <div className="space-y-2">
                {reward.tasks.map(task => {
                  const isEditing =
                    editingRewardId === reward.id &&
                    editingTaskId === task.id

                  const isDragging =
                    draggedTask?.rewardId === reward.id &&
                    draggedTask.taskId === task.id

                  return (
                    <div
                      key={task.id}
                      className={`flex items-center gap-2 rounded border border-transparent px-2 py-1 ${
                        isDragging
                          ? 'opacity-50 border-border bg-muted/40'
                          : 'hover:border-border'
                      }`}
                      onDragOver={event => {
                        event.preventDefault()
                        event.stopPropagation()
                      }}
                      onDrop={event =>
                        handleTaskDrop(event, reward.id, task.id)
                      }
                    >
                      <button
                        type="button"
                        draggable={!isEditing}
                        onDragStart={event =>
                          handleTaskDragStart(
                            event,
                            reward.id,
                            task.id
                          )
                        }
                        onDragEnd={handleTaskDragEnd}
                        disabled={isEditing}
                        className="cursor-grab active:cursor-grabbing text-muted-foreground hover:text-foreground disabled:cursor-default disabled:opacity-40 shrink-0"
                        aria-label={`Drag task ${task.text}`}
                        title="Drag to reorder task"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          className="h-4 w-4"
                          aria-hidden="true"
                        >
                          <circle cx="9" cy="5" r="1" />
                          <circle cx="9" cy="12" r="1" />
                          <circle cx="9" cy="19" r="1" />
                          <circle cx="15" cy="5" r="1" />
                          <circle cx="15" cy="12" r="1" />
                          <circle cx="15" cy="19" r="1" />
                        </svg>
                      </button>

                      <input
                        type="checkbox"
                        checked={task.done}
                        onChange={() =>
                          toggleTask(reward.id, task.id)
                        }
                        disabled={isEditing}
                        className="shrink-0"
                      />

                      {isEditing ? (
                        <>
                          <input
                            className="flex-1 min-w-0 border rounded px-2 py-1 text-sm"
                            value={editingTaskText}
                            onChange={event =>
                              setEditingTaskText(event.target.value)
                            }
                            onKeyDown={handleEditTaskKeyDown}
                            autoFocus
                          />

                          <button
                            type="button"
                            onClick={saveTaskEdit}
                            className="text-xs text-blue-500 shrink-0"
                          >
                            save
                          </button>

                          <button
                            type="button"
                            onClick={cancelEditTask}
                            className="text-xs text-muted-foreground shrink-0"
                          >
                            cancel
                          </button>
                        </>
                      ) : (
                        <>
                          <span
                            className={`flex-1 min-w-0 wrap-break-word text-sm ${
                              task.done
                                ? 'line-through text-muted-foreground'
                                : ''
                            }`}
                          >
                            {task.text}
                          </span>

                          <button
                            type="button"
                            onClick={() =>
                              startEditTask(reward.id, task)
                            }
                            className="text-xs text-blue-500 shrink-0"
                          >
                            edit
                          </button>

                          <button
                            type="button"
                            onClick={() =>
                              deleteTask(reward.id, task.id)
                            }
                            className="text-xs text-red-500 shrink-0"
                          >
                            delete
                          </button>
                        </>
                      )}
                    </div>
                  )
                })}
              </div>

              {/* ADD TASK */}
              <div className="flex gap-2">
                <input
                  className="flex-1 border rounded px-3 py-1 text-sm"
                  placeholder="Add task..."
                  value={
                    selectedRewardId === reward.id
                      ? newTaskText
                      : ''
                  }
                  onFocus={() => {
                    if (selectedRewardId !== reward.id) {
                      setSelectedRewardId(reward.id)
                      setNewTaskText('')
                    }
                  }}
                  onChange={event => {
                    setSelectedRewardId(reward.id)
                    setNewTaskText(event.target.value)
                  }}
                  onKeyDown={event =>
                    handleNewTaskKeyDown(event, reward.id)
                  }
                />

                <button
                  type="button"
                  onClick={() => addTask(reward.id)}
                  className="px-3 py-1 text-sm rounded bg-muted border"
                >
                  Add
                </button>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}