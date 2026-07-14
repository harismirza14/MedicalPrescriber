import client from "./client";

export const createAppointment = async (data) => {
  const res = await client.post("/appointments", data);
  return res.data;
};

export const fetchPatientAppointments = async (patientId) => {
  const res = await client.get(`/patients/${patientId}/appointments`);
  return res.data;
};

export const fetchPrescriberAppointments = async (prescriberId) => {
  const res = await client.get(`/prescribers/${prescriberId}/appointments`);
  return res.data;
};

export const cancelAppointment = async (appointmentId) => {
  const res = await client.patch(`/appointments/${appointmentId}/cancel`);
  return res.data;
};