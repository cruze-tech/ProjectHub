'use client'
import { Channel } from '@/types'

interface SidebarProps {
  channels: Channel[]
  activeChannel: string
  onChannelSelect: (id: string) => void
}

export default function Sidebar({ channels, activeChannel, onChannelSelect }: SidebarProps) {
  return (
    <div className="w-64 bg-slate-800 text-white flex flex-col h-full">
      {/* Project Header */}
      <div className="p-4 border-b border-slate-700">
        <h1 className="font-bold text-lg">NGO Workspace</h1>
        <p className="text-slate-400 text-sm">Community Mental Wellbeing Program</p>
      </div>

      {/* Channels */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-3">
          <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-2">Channels</h2>
          <ul className="space-y-1">
            {channels.map((channel) => (
              <li key={channel.id}>
                <button
                  onClick={() => onChannelSelect(channel.id)}
                  className={`w-full text-left px-3 py-2 rounded-md text-sm flex items-center gap-2 transition-colors ${
                    activeChannel === channel.id
                      ? 'bg-slate-700 text-white'
                      : 'text-slate-300 hover:bg-slate-700/50'
                  }`}
                >
                  <span className="text-slate-400">#</span>
                  {channel.name}
                </button>
              </li>
            ))}
          </ul>
        </div>

        {/* Team Members */}
        <div className="p-3 border-t border-slate-700">
          <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-2">Team</h2>
          <ul className="space-y-2 text-sm">
            <li className="flex items-center gap-2 text-slate-300">
              <span className="w-2 h-2 bg-green-500 rounded-full"></span>
              Amina Osei
              <span className="text-xs text-slate-500">Program Officer</span>
            </li>
            <li className="flex items-center gap-2 text-slate-300">
              <span className="w-2 h-2 bg-green-500 rounded-full"></span>
              David Mensah
              <span className="text-xs text-slate-500">Field Coord.</span>
            </li>
            <li className="flex items-center gap-2 text-slate-300">
              <span className="w-2 h-2 bg-yellow-500 rounded-full"></span>
              Grace Achieng
              <span className="text-xs text-slate-500">M&E Officer</span>
            </li>
          </ul>
        </div>
      </div>

      {/* Current User */}
      <div className="p-3 border-t border-slate-700 bg-slate-900">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-indigo-500 rounded-full flex items-center justify-center text-sm font-medium">
            AO
          </div>
          <div>
            <p className="text-sm font-medium">Amina Osei</p>
            <p className="text-xs text-slate-400">Program Officer</p>
          </div>
        </div>
      </div>
    </div>
  )
}
