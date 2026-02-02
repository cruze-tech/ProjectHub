'use client'
import { useState } from 'react'
import { Task, Milestone, TeamMember } from '@/types'
import { supabase } from '@/lib/supabase'
import Modal from './Modal'

interface TasksPanelProps {
  tasks: Task[]
  milestones: Milestone[]
  members: TeamMember[]
  onTaskUpdate: (task: Task) => void
  onTaskCreate: (task: Task) => void
  onTaskDelete: (taskId: string) => void
  onMilestoneUpdate: (milestone: Milestone) => void
  onMilestoneCreate: (milestone: Milestone) => void
  onMilestoneDelete: (milestoneId: string) => void
}

export default function TasksPanel({
  tasks, milestones, members,
  onTaskUpdate, onTaskCreate, onTaskDelete,
  onMilestoneUpdate, onMilestoneCreate, onMilestoneDelete
}: TasksPanelProps) {
  const [expandedMilestone, setExpandedMilestone] = useState<string | null>(milestones[0]?.id || null)
  const [taskModal, setTaskModal] = useState<{ open: boolean; task?: Task; milestoneId?: string }>({ open: false })
  const [milestoneModal, setMilestoneModal] = useState<{ open: boolean; milestone?: Milestone }>({ open: false })
  const [taskForm, setTaskForm] = useState({ title: '', description: '', status: 'todo' as Task['status'], due_date: '', assigned_to: '' })
  const [milestoneForm, setMilestoneForm] = useState({ title: '', description: '', due_date: '' })

  const getMember = (id: string | null) => members.find(m => m.id === id)
  const getTasksByMilestone = (milestoneId: string) => tasks.filter(t => t.milestone_id === milestoneId)

  const getMilestoneProgress = (milestoneId: string) => {
    const milestoneTasks = getTasksByMilestone(milestoneId)
    if (milestoneTasks.length === 0) return 0
    const done = milestoneTasks.filter(t => t.status === 'done').length
    return Math.round((done / milestoneTasks.length) * 100)
  }

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return ''
    return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  }

  const getInitials = (name: string) => name.split(' ').map(n => n[0]).join('')

  const statusColors = {
    todo: 'bg-slate-100 text-slate-600',
    in_progress: 'bg-amber-100 text-amber-700',
    done: 'bg-green-100 text-green-700'
  }

  const statusLabels = {
    todo: 'To Do',
    in_progress: 'In Progress',
    done: 'Done'
  }

  // Task CRUD
  const openTaskModal = (milestoneId: string, task?: Task) => {
    if (task) {
      setTaskForm({
        title: task.title,
        description: task.description || '',
        status: task.status,
        due_date: task.due_date || '',
        assigned_to: task.assigned_to || ''
      })
    } else {
      setTaskForm({ title: '', description: '', status: 'todo', due_date: '', assigned_to: '' })
    }
    setTaskModal({ open: true, task, milestoneId })
  }

  const saveTask = async () => {
    if (!taskForm.title.trim()) return

    if (taskModal.task) {
      const { data, error } = await supabase
        .from('tasks')
        .update({
          title: taskForm.title,
          description: taskForm.description || null,
          status: taskForm.status,
          due_date: taskForm.due_date || null,
          assigned_to: taskForm.assigned_to || null
        })
        .eq('id', taskModal.task.id)
        .select()
        .single()

      if (!error && data) onTaskUpdate(data)
    } else {
      const { data, error } = await supabase
        .from('tasks')
        .insert({
          title: taskForm.title,
          description: taskForm.description || null,
          status: taskForm.status,
          due_date: taskForm.due_date || null,
          assigned_to: taskForm.assigned_to || null,
          milestone_id: taskModal.milestoneId
        })
        .select()
        .single()

      if (!error && data) onTaskCreate(data)
    }
    setTaskModal({ open: false })
  }

  const deleteTask = async (taskId: string) => {
    if (!confirm('Delete this task?')) return
    const { error } = await supabase.from('tasks').delete().eq('id', taskId)
    if (!error) onTaskDelete(taskId)
  }

  // Milestone CRUD
  const openMilestoneModal = (milestone?: Milestone) => {
    if (milestone) {
      setMilestoneForm({
        title: milestone.title,
        description: milestone.description || '',
        due_date: milestone.due_date || ''
      })
    } else {
      setMilestoneForm({ title: '', description: '', due_date: '' })
    }
    setMilestoneModal({ open: true, milestone })
  }

  const saveMilestone = async () => {
    if (!milestoneForm.title.trim()) return

    if (milestoneModal.milestone) {
      const { data, error } = await supabase
        .from('milestones')
        .update({
          title: milestoneForm.title,
          description: milestoneForm.description || null,
          due_date: milestoneForm.due_date || null
        })
        .eq('id', milestoneModal.milestone.id)
        .select()
        .single()

      if (!error && data) onMilestoneUpdate(data)
    } else {
      const { data, error } = await supabase
        .from('milestones')
        .insert({
          title: milestoneForm.title,
          description: milestoneForm.description || null,
          due_date: milestoneForm.due_date || null
        })
        .select()
        .single()

      if (!error && data) onMilestoneCreate(data)
    }
    setMilestoneModal({ open: false })
  }

  const deleteMilestone = async (milestoneId: string) => {
    const milestoneTasks = getTasksByMilestone(milestoneId)
    if (milestoneTasks.length > 0) {
      alert('Cannot delete milestone with tasks. Delete tasks first.')
      return
    }
    if (!confirm('Delete this milestone?')) return
    const { error } = await supabase.from('milestones').delete().eq('id', milestoneId)
    if (!error) onMilestoneDelete(milestoneId)
  }

  return (
    <div className="w-80 bg-slate-50 border-l overflow-y-auto flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b bg-white">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-semibold text-lg">Tasks & Milestones</h2>
            <p className="text-sm text-slate-500">Track project progress</p>
          </div>
          <button
            onClick={() => openMilestoneModal()}
            className="p-1.5 text-indigo-600 hover:bg-indigo-50 rounded"
            title="Add Milestone"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
          </button>
        </div>
      </div>

      {/* Overall Progress */}
      <div className="p-4 bg-white border-b">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium">Overall Progress</span>
          <span className="text-sm text-slate-500">
            {tasks.filter(t => t.status === 'done').length}/{tasks.length} tasks
          </span>
        </div>
        <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
          <div
            className="h-full bg-indigo-500 transition-all duration-300"
            style={{ width: `${tasks.length ? (tasks.filter(t => t.status === 'done').length / tasks.length) * 100 : 0}%` }}
          />
        </div>
      </div>

      {/* Milestones */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {milestones.map((milestone) => {
          const progress = getMilestoneProgress(milestone.id)
          const milestoneTasks = getTasksByMilestone(milestone.id)
          const isExpanded = expandedMilestone === milestone.id

          return (
            <div key={milestone.id} className="bg-white rounded-lg shadow-sm border">
              <div className="p-3">
                <div className="flex items-start justify-between">
                  <button
                    onClick={() => setExpandedMilestone(isExpanded ? null : milestone.id)}
                    className="flex-1 text-left"
                  >
                    <h3 className="font-medium text-sm">{milestone.title}</h3>
                    <p className="text-xs text-slate-500 mt-0.5">Due: {formatDate(milestone.due_date)}</p>
                  </button>
                  <div className="flex items-center gap-1">
                    <span className="text-xs font-medium text-indigo-600 mr-1">{progress}%</span>
                    <button
                      onClick={() => openMilestoneModal(milestone)}
                      className="p-1 text-slate-400 hover:text-slate-600"
                      title="Edit"
                    >
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                      </svg>
                    </button>
                    <button
                      onClick={() => deleteMilestone(milestone.id)}
                      className="p-1 text-slate-400 hover:text-red-500"
                      title="Delete"
                    >
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                    <button
                      onClick={() => setExpandedMilestone(isExpanded ? null : milestone.id)}
                      className="p-1"
                    >
                      <svg
                        className={`w-4 h-4 text-slate-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>
                  </div>
                </div>
                <div className="mt-2 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-indigo-500 transition-all duration-300" style={{ width: `${progress}%` }} />
                </div>
              </div>

              {isExpanded && (
                <div className="px-3 pb-3 space-y-2">
                  {milestoneTasks.map((task) => {
                    const assignee = getMember(task.assigned_to)
                    return (
                      <div key={task.id} className="p-2 bg-slate-50 rounded-md group">
                        <div className="flex items-start gap-2">
                          <input
                            type="checkbox"
                            checked={task.status === 'done'}
                            onChange={async () => {
                              const newStatus = task.status === 'done' ? 'todo' : 'done'
                              const { data } = await supabase
                                .from('tasks')
                                .update({ status: newStatus })
                                .eq('id', task.id)
                                .select()
                                .single()
                              if (data) onTaskUpdate(data)
                            }}
                            className="mt-1 rounded border-slate-300"
                          />
                          <div className="flex-1 min-w-0">
                            <p className={`text-sm ${task.status === 'done' ? 'line-through text-slate-400' : ''}`}>
                              {task.title}
                            </p>
                            <div className="flex items-center gap-2 mt-1">
                              <select
                                value={task.status}
                                onChange={async (e) => {
                                  const { data } = await supabase
                                    .from('tasks')
                                    .update({ status: e.target.value })
                                    .eq('id', task.id)
                                    .select()
                                    .single()
                                  if (data) onTaskUpdate(data)
                                }}
                                className={`text-xs px-1.5 py-0.5 rounded border-0 ${statusColors[task.status]}`}
                              >
                                <option value="todo">To Do</option>
                                <option value="in_progress">In Progress</option>
                                <option value="done">Done</option>
                              </select>
                              {task.due_date && (
                                <span className="text-xs text-slate-500">{formatDate(task.due_date)}</span>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button
                              onClick={() => openTaskModal(milestone.id, task)}
                              className="p-1 text-slate-400 hover:text-slate-600"
                            >
                              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                              </svg>
                            </button>
                            <button
                              onClick={() => deleteTask(task.id)}
                              className="p-1 text-slate-400 hover:text-red-500"
                            >
                              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            </button>
                          </div>
                          {assignee && (
                            <div
                              className="w-6 h-6 rounded-full bg-indigo-500 flex items-center justify-center text-white text-xs flex-shrink-0"
                              title={assignee.name}
                            >
                              {getInitials(assignee.name)}
                            </div>
                          )}
                        </div>
                      </div>
                    )
                  })}
                  <button
                    onClick={() => openTaskModal(milestone.id)}
                    className="w-full p-2 text-sm text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-md flex items-center justify-center gap-1"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    Add Task
                  </button>
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Quick Stats */}
      <div className="p-4 bg-white border-t">
        <div className="grid grid-cols-3 gap-2 text-center">
          <div className="p-2 bg-slate-100 rounded">
            <p className="text-lg font-semibold text-slate-700">{tasks.filter(t => t.status === 'todo').length}</p>
            <p className="text-xs text-slate-500">To Do</p>
          </div>
          <div className="p-2 bg-amber-50 rounded">
            <p className="text-lg font-semibold text-amber-600">{tasks.filter(t => t.status === 'in_progress').length}</p>
            <p className="text-xs text-slate-500">In Progress</p>
          </div>
          <div className="p-2 bg-green-50 rounded">
            <p className="text-lg font-semibold text-green-600">{tasks.filter(t => t.status === 'done').length}</p>
            <p className="text-xs text-slate-500">Done</p>
          </div>
        </div>
      </div>

      {/* Task Modal */}
      <Modal
        isOpen={taskModal.open}
        onClose={() => setTaskModal({ open: false })}
        title={taskModal.task ? 'Edit Task' : 'Add Task'}
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Title</label>
            <input
              type="text"
              value={taskForm.title}
              onChange={(e) => setTaskForm({ ...taskForm, title: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg text-sm"
              placeholder="Task title"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
            <textarea
              value={taskForm.description}
              onChange={(e) => setTaskForm({ ...taskForm, description: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg text-sm"
              rows={2}
              placeholder="Optional description"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Status</label>
              <select
                value={taskForm.status}
                onChange={(e) => setTaskForm({ ...taskForm, status: e.target.value as Task['status'] })}
                className="w-full px-3 py-2 border rounded-lg text-sm"
              >
                <option value="todo">To Do</option>
                <option value="in_progress">In Progress</option>
                <option value="done">Done</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Due Date</label>
              <input
                type="date"
                value={taskForm.due_date}
                onChange={(e) => setTaskForm({ ...taskForm, due_date: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg text-sm"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Assign To</label>
            <select
              value={taskForm.assigned_to}
              onChange={(e) => setTaskForm({ ...taskForm, assigned_to: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg text-sm"
            >
              <option value="">Unassigned</option>
              {members.map((m) => (
                <option key={m.id} value={m.id}>{m.name} - {m.role}</option>
              ))}
            </select>
          </div>
          <div className="flex gap-2 pt-2">
            <button
              onClick={() => setTaskModal({ open: false })}
              className="flex-1 px-4 py-2 border rounded-lg text-sm hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              onClick={saveTask}
              className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm hover:bg-indigo-700"
            >
              {taskModal.task ? 'Save' : 'Add Task'}
            </button>
          </div>
        </div>
      </Modal>

      {/* Milestone Modal */}
      <Modal
        isOpen={milestoneModal.open}
        onClose={() => setMilestoneModal({ open: false })}
        title={milestoneModal.milestone ? 'Edit Milestone' : 'Add Milestone'}
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Title</label>
            <input
              type="text"
              value={milestoneForm.title}
              onChange={(e) => setMilestoneForm({ ...milestoneForm, title: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg text-sm"
              placeholder="Milestone title"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
            <textarea
              value={milestoneForm.description}
              onChange={(e) => setMilestoneForm({ ...milestoneForm, description: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg text-sm"
              rows={2}
              placeholder="Optional description"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Due Date</label>
            <input
              type="date"
              value={milestoneForm.due_date}
              onChange={(e) => setMilestoneForm({ ...milestoneForm, due_date: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg text-sm"
            />
          </div>
          <div className="flex gap-2 pt-2">
            <button
              onClick={() => setMilestoneModal({ open: false })}
              className="flex-1 px-4 py-2 border rounded-lg text-sm hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              onClick={saveMilestone}
              className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm hover:bg-indigo-700"
            >
              {milestoneModal.milestone ? 'Save' : 'Add Milestone'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
