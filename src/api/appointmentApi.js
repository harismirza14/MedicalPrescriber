import client from './client';

export const createAppointment = async (data) => {
  const res = await client.post('/appointments', data);
  return res.data;
};

export const fetchPatientAppointments = async (patientId, { page = 1, limit = 5} = {}) => {
  const res = await client.get(`/patients/${patientId}/appointments`, { params: { page, limit } });
  return res.data; 
};

export const fetchPrescriberAppointments = async (prescriberId, { page = 1, limit = 5} = {}) => {
  const res = await client.get(`/prescribers/${prescriberId}/appointments`, { params: { page, limit } });
  return res.data;
};

export const cancelAppointment = async (appointmentId) => {
  const res = await client.patch(`/appointments/${appointmentId}/cancel`);
  return res.data;
};

export const completeAppointment = async (appointmentId) => {
  const res = await client.patch(`/appointments/${appointmentId}/complete`);
  return res.data;
};
export const updateChiefComplaint = async (appointmentId, chiefComplaint) => {
  const res = await client.patch(`/appointments/${appointmentId}/chief-complaint`, { chief_complaint: chiefComplaint });
  return res.data;
};

export const rescheduleAppointment = async (appointmentId, { appointment_date, start_time, end_time }) => {
  const res = await client.patch(`/appointments/${appointmentId}/reschedule`, {
    appointment_date,
    start_time,
    end_time,
  });
  return res.data;
};