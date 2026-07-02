import React from "react";

const dummyAppointments = [
  { id: 1, patientName: "Ali Rehman", time: "10:00 AM", date: "Today" },
  { id: 2, patientName: "Maria Khan", time: "11:30 AM", date: "Today" },
  { id: 3, patientName: "Hammad Hassan", time: "2:00 PM", date: "Tomorrow" },
];

export default function DoctorSchedule() {
  return (
    <div className="p-6 max-w-3xl mx-auto w-full dark:bg-gray-900 min-h-screen">
      <h1 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">Schedule</h1>
      <div className="space-y-3">
        {dummyAppointments.map((appt) => (
          <div
            key={appt.id}
            className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4 flex justify-between items-center transition-colors"
          >
            <div>
              <p className="font-semibold text-gray-900 dark:text-white">{appt.patientName}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">{appt.date}</p>
            </div>
            <p className="text-sm font-medium text-blue-600 dark:text-blue-400">{appt.time}</p>
          </div>
        ))}
      </div>
    </div>
  );
}