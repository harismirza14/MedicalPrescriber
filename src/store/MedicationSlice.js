import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

const API_BASE = "http://localhost:3000/api";

export function generateMedId(prefix = "med") {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}
export function formatStatusLabel() {
  const now = new Date();
  const dateStr = now.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
  const timeStr = now.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
  return ` ${dateStr} at ${timeStr}`;
}
export function getTodayISO() {
  return new Date().toISOString();
}
const formatDate = (isoString) => {
  if (!isoString) return null;
  const date = new Date(isoString);
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};
const transformPrescription = (dbMed) => ({
  id: dbMed.prescription_id,
  name: dbMed.med_name,
  dosage: dbMed.dosage,
  form: dbMed.form,
  instructions: dbMed.instructions,
  status: dbMed.status,
  statusLabel: dbMed.status_label || formatStatusLabel(),
  pharmacy: dbMed.pharmacy_name,
  prescriber: dbMed.prescriber_name,
  prescriberRole: dbMed.prescriber_role,
  patientNote: dbMed.patient_note,
  discontinuedOn: formatDate(dbMed.discontinued_on),
  discontinueReason: dbMed.discontinue_reason,
  quantity: dbMed.quantity,
  refills: dbMed.refills,
  frequency: dbMed.frequency,
  duration: dbMed.duration,
  dispenseAmount: dbMed.dispense_amount,
  diagnoses: dbMed.diagnoses,
});

export const fetchPrescriptions = createAsyncThunk(
  "medications/fetch",
  async (patientId) => {
    const res = await axios.get(
      `${API_BASE}/patients/${patientId}/prescriptions`,
    );
    return res.data;
  },
);

export const addPrescription = createAsyncThunk(
  "medications/add",
  async (prescriptionData) => {
    const res = await axios.post(`${API_BASE}/prescriptions`, prescriptionData);
    return res.data;
  },
);

export const updatePrescription = createAsyncThunk(
  "medications/update",
  async ({ id, updates }) => {
    const res = await axios.put(`${API_BASE}/prescriptions/${id}`, updates);
    return res.data;
  },
);  

export const discontinuePrescription = createAsyncThunk(
  "medications/discontinue",
  async ({ id, reason }) => {
    const res = await axios.patch(
      `${API_BASE}/prescriptions/${id}/discontinue`,
      { reason },
    );
    return res.data;
  },
);

export const recontinuePrescription = createAsyncThunk(
  "medications/recontinue",
  async ({ id }) => {
    const res = await axios.patch(`${API_BASE}/prescriptions/${id}/recontinue`);
    return res.data;
  },
);

const medicationsSlice = createSlice({
  name: "medications",
  initialState: {
    list: [],
    loading: false,
    error: null,
  },
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setInitialMedications: (state, action) => {
      state.list = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchPrescriptions.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchPrescriptions.fulfilled, (state, action) => {
        state.loading = false;
        state.list = action.payload.map(transformPrescription);
      })
      .addCase(fetchPrescriptions.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })
      .addCase(addPrescription.fulfilled, (state, action) => {
        const transformed = transformPrescription(action.payload);
        state.list.unshift(transformed);
      })

      .addCase(updatePrescription.fulfilled, (state, action) => {
        const transformed = transformPrescription(action.payload);
        const index = state.list.findIndex((m) => m.id === transformed.id);
        if (index !== -1) {
          state.list[index] = transformed;
        } else {
          console.warn("❌ No matching prescription for id", transformed.id);
        }
      })
      // discontinue
      .addCase(discontinuePrescription.fulfilled, (state, action) => {
        const transformed = transformPrescription(action.payload);
        const index = state.list.findIndex((m) => m.id === transformed.id);
        if (index !== -1) {
          state.list[index] = transformed;
        }
      })
      // recontinue
      .addCase(recontinuePrescription.fulfilled, (state, action) => {
        const transformed = transformPrescription(action.payload);
        const index = state.list.findIndex((m) => m.id === transformed.id);
        if (index !== -1) {
          state.list[index] = transformed;
        }
      });
  },
});

export const { clearError, setInitialMedications } = medicationsSlice.actions;
export default medicationsSlice.reducer;
