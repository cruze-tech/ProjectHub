'use client'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { Channel, Message, Task, Milestone, TeamMember } from '@/types'
import Sidebar from '@/components/Sidebar'
import ChatPanel from '@/components/ChatPanel'
import TasksPanel from '@/components/TasksPanel'

export default function Home() {
  const [channels, setChannels] = useState<Channel[]>([])
  const [messages, setMessages] = useState<Message[]>([])
  const [tasks, setTasks] = useState<Task[]>([])
  const [milestones, setMilestones] = useState<Milestone[]>([])
  const [members, setMembers] = useState<TeamMember[]>([])
  const [activeChannel, setActiveChannel] = useState<string>('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadData()
  }, [])

  useEffect(() => {
    if (!activeChannel) return

    const subscription = supabase
      .channel('messages')
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'messages',
        filter: `channel_id=eq.${activeChannel}`
      }, (payload) => {
        const newMsg = payload.new as Message
        setMessages(prev => {
          if (prev.find(m => m.id === newMsg.id)) return prev
          return [...prev, newMsg]
        })
      })
      .subscribe()

    return () => {
      subscription.unsubscribe()
    }
  }, [activeChannel])

  const loadData = async () => {
    const [channelsRes, membersRes, milestonesRes, tasksRes] = await Promise.all([
      supabase.from('channels').select('*').order('name'),
      supabase.from('team_members').select('*'),
      supabase.from('milestones').select('*').order('due_date'),
      supabase.from('tasks').select('*').order('due_date')
    ])

    if (channelsRes.data) {
      setChannels(channelsRes.data)
      if (channelsRes.data.length > 0) {
        setActiveChannel(channelsRes.data[0].id)
        loadMessages(channelsRes.data[0].id)
      }
    }
    if (membersRes.data) setMembers(membersRes.data)
    if (milestonesRes.data) setMilestones(milestonesRes.data)
    if (tasksRes.data) setTasks(tasksRes.data)

    setLoading(false)
  }

  const loadMessages = async (channelId: string) => {
    const { data } = await supabase
      .from('messages')
      .select('*')
      .eq('channel_id', channelId)
      .order('created_at')

    if (data) setMessages(data)
  }

  const handleChannelSelect = (channelId: string) => {
    setActiveChannel(channelId)
    loadMessages(channelId)
  }

  // Message handlers
  const handleNewMessage = (message: Message) => {
    setMessages(prev => {
      if (prev.find(m => m.id === message.id)) return prev
      return [...prev, message]
    })
  }

  const handleDeleteMessage = (messageId: string) => {
    setMessages(prev => prev.filter(m => m.id !== messageId))
  }

  // Task handlers
  const handleTaskUpdate = (updatedTask: Task) => {
    setTasks(prev => prev.map(t => t.id === updatedTask.id ? updatedTask : t))
  }

  const handleTaskCreate = (newTask: Task) => {
    setTasks(prev => [...prev, newTask])
  }

  const handleTaskDelete = (taskId: string) => {
    setTasks(prev => prev.filter(t => t.id !== taskId))
  }

  // Milestone handlers
  const handleMilestoneUpdate = (updatedMilestone: Milestone) => {
    setMilestones(prev => prev.map(m => m.id === updatedMilestone.id ? updatedMilestone : m))
  }

  const handleMilestoneCreate = (newMilestone: Milestone) => {
    setMilestones(prev => [...prev, newMilestone])
  }

  const handleMilestoneDelete = (milestoneId: string) => {
    setMilestones(prev => prev.filter(m => m.id !== milestoneId))
  }

  const activeChannelData = channels.find(c => c.id === activeChannel) || null

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-slate-100">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
          <p className="text-slate-500">Loading workspace...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="h-screen flex bg-slate-100">
      <Sidebar
        channels={channels}
        activeChannel={activeChannel}
        onChannelSelect={handleChannelSelect}
      />
      <ChatPanel
        channel={activeChannelData}
        messages={messages}
        members={members}
        onNewMessage={handleNewMessage}
        onDeleteMessage={handleDeleteMessage}
      />
      <TasksPanel
        tasks={tasks}
        milestones={milestones}
        members={members}
        onTaskUpdate={handleTaskUpdate}
        onTaskCreate={handleTaskCreate}
        onTaskDelete={handleTaskDelete}
        onMilestoneUpdate={handleMilestoneUpdate}
        onMilestoneCreate={handleMilestoneCreate}
        onMilestoneDelete={handleMilestoneDelete}
      />
    </div>
  )
}
