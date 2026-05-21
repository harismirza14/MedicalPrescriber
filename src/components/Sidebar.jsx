import React from 'react'
import { NavLink } from 'react-router-dom'

const navItems = [
  { label: 'Medications', path: '/medications' },
]

export default function Sidebar() {
  return (
    <aside className="w-64 h-screen bg-white border-l border-gray-200 flex flex-col fixed right-0 top-0 overflow-y-auto">
      {/* Patient Info */}
      <div className="p-4 border-b border-gray-100">
        <div className="mb-3">
          <p className="font-bold text-lg text-gray-900 leading-tight">Olivia Rhye</p>
          <p className="text-sm text-gray-500 mt-0.5">089765 - 10/28/1985</p>
        </div>

        <div className="space-y-2">
          <div>
            <p className="text-sm font-semibold text-gray-800">Next appointment</p>
            <p className="text-sm text-gray-600">Not Scheduled</p>
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-800">Visit Frequency</p>
            <p className="text-sm text-gray-600">Weekly</p>
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-800">Insurance</p>
            <p className="text-sm text-gray-600">Aetna</p>
          </div>
        </div>

        {/* <button
          className="mt-2 text-sm text-blue-600 hover:text-blue-800 cursor-pointer bg-transparent border-none p-0"
          onClick={() => console.log('More information clicked')}
        >
          More information
        </button> */}
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-3 px-2">
        <ul className="space-y-0.5">
          {navItems.map((item) => (
            <li key={item.path}>
              <NavLink
                to={item.path}
                className={({ isActive }) =>
                  `block px-3 py-2 rounded-md text-sm transition-colors duration-100 ${
                    isActive
                      ? 'bg-blue-50 text-blue-700 font-medium'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`
                }
              >
                {item.label}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  )
}
