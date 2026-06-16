import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import {
  fetchPrescriptions as fetchPrescriptionsApi,
  createPrescription as createPrescriptionApi,
  updatePrescription as updatePrescriptionApi,
  discontinuePrescription as discontinuePrescriptionApi,
  recontinuePrescription as recontinuePrescriptionApi,
} from "../api/prescriptionApi";

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
  return `${dateStr} at ${timeStr}`;
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
  pharmacy_zip: dbMed.pharmacy_zip,
  prescriber_id: dbMed.prescriber_id,
  prescriber: dbMed.prescriber_name,
  prescriber_name: dbMed.prescriber_name,
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
  external_prescriber: dbMed.external_prescriber ?? null,
  externalPrescriber: dbMed.external_prescriber ?? null,
  patient_name: dbMed.patient_name,
  patient_id: dbMed.patient_id,
});

export const fetchPrescriptions = createAsyncThunk(
  "medications/fetch",
  async ({ patientId, prescriberId }) => {
    return await fetchPrescriptionsApi(patientId, prescriberId);
  },
);

export const addPrescription = createAsyncThunk(
  "medications/add",
  async (prescriptionData, { rejectWithValue }) => {
    try {
      return await createPrescriptionApi(prescriptionData);
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  },
);

export const updatePrescription = createAsyncThunk(
  "medications/update",
  async ({ id, updates }, { rejectWithValue }) => {
    try {
      return await updatePrescriptionApi(id, updates);
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  },
);

export const discontinuePrescription = createAsyncThunk(
  "medications/discontinue",
  async ({ id, reason }, { rejectWithValue }) => {
    try {
      return await discontinuePrescriptionApi(id, reason);
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  },
);

export const recontinuePrescription = createAsyncThunk(
  "medications/recontinue",
  async ({ id }, { rejectWithValue }) => {
    try {
      return await recontinuePrescriptionApi(id);
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
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
    builder.addCase(fetchPrescriptions.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(fetchPrescriptions.fulfilled, (state, action) => {
      state.loading = false;
      state.list = action.payload.map(transformPrescription);
    });
    builder.addCase(fetchPrescriptions.rejected, (state, action) => {
      state.loading = false;
      state.error = action.error.message;
    });

    builder.addCase(addPrescription.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(addPrescription.fulfilled, (state, action) => {
      state.loading = false;
      const transformed = transformPrescription(action.payload);
      state.list.unshift(transformed);
    });
    builder.addCase(addPrescription.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload || action.error.message;
    });

    builder.addCase(updatePrescription.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(updatePrescription.fulfilled, (state, action) => {
      state.loading = false;
      const transformed = transformPrescription(action.payload);
      const index = state.list.findIndex((m) => m.id === transformed.id);
      if (index !== -1) state.list[index] = transformed;
    });
    builder.addCase(updatePrescription.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload || action.error.message;
    });

    builder.addCase(discontinuePrescription.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(discontinuePrescription.fulfilled, (state, action) => {
      state.loading = false;
      const transformed = transformPrescription(action.payload);
      const index = state.list.findIndex((m) => m.id === transformed.id);
      if (index !== -1) state.list[index] = transformed;
    });
    builder.addCase(discontinuePrescription.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload || action.error.message;
    });

    builder.addCase(recontinuePrescription.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(recontinuePrescription.fulfilled, (state, action) => {
      state.loading = false;
      const transformed = transformPrescription(action.payload);
      const index = state.list.findIndex((m) => m.id === transformed.id);
      if (index !== -1) state.list[index] = transformed;
    });
    builder.addCase(recontinuePrescription.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload || action.error.message;
    });
  },
});

export const { clearError, setInitialMedications } = medicationsSlice.actions;
export default medicationsSlice.reducer;
