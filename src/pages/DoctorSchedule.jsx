import React from "react";

const dummyAppointments = [
  { id: 1, patientName: "Ali Rehman", time: "10:00 AM", date: "Today" },
  { id: 2, patientName: "Maria Khan", time: "11:30 AM", date: "Today" },
  { id: 3, patientName: "Hammad Hassan", time: "2:00 PM", date: "Tomorrow" },
];

export default function DoctorSchedule() {
  return (
    <div className="p-6 max-w-3xl mx-auto w-full">
      <h1 className="text-2xl font-bold mb-4">Schedule</h1>
      <p className="text-sm text-gray-500 mb-4">
        Placeholder data — real scheduling isn't wired up yet.
      </p>
      <div className="space-y-3">
        {dummyAppointments.map((appt) => (
          <div
            key={appt.id}
            className="bg-white border border-gray-200 rounded-lg p-4 flex justify-between items-center"
          >
            <div>
              <p className="font-semibold text-gray-900">{appt.patientName}</p>
              <p className="text-sm text-gray-500">{appt.date}</p>
            </div>
            <p className="text-sm font-medium text-blue-600">{appt.time}</p>
          </div>
        ))}
      </div>
    </div>
  );
}