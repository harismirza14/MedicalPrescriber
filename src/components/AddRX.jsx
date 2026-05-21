import { useState, useMemo, useEffect } from "react";
import allData from "../data/medications.json";

// ─── Pull data from JSON ─────────────────────────────────────────────────────
const MEDICATION_LIST = allData.medicationList;
const DOSE_OPTIONS = allData.doseOptions;
const PHARMACY_DATA = allData.pharmaciesByZip;
const DEFAULT_ZIP = "22903"; // could also be stored in JSON if needed

// ─── Step Indicator ──────────────────────────────────────────────────────────
function StepIndicator({ currentStep }) {
  const steps = [
    { num: 1, label: "Select" },
    { num: 2, label: "Detail" },
    { num: 3, label: "Review" },
  ];

  return (
    <div className="flex items-center gap-1 text-sm font-medium">
      {steps.map((step, idx) => {
        const isActive = step.num === currentStep;
        const isCompleted = step.num < currentStep;
        const colorClass =
          isActive || isCompleted ? "text-blue-600" : "text-gray-400";
        return (
          <span key={step.num} className="flex items-center gap-1">
            {idx > 0 && <span className="text-gray-300 mx-0.5">→</span>}
            <span className={colorClass}>
              {step.num}. {step.label}
            </span>
          </span>
        );
      })}
    </div>
  );
}

// ─── Step 1 – Select Medication ──────────────────────────────────────────────
function StepSelect({ selectedMed, onSelect, onCancel, onContinue }) {
  const [search, setSearch] = useState("");

  const filtered = useMemo(
    () =>
      MEDICATION_LIST.filter((m) =>
        m.toLowerCase().includes(search.toLowerCase())
      ),
    [search]
  );

  return (
    <div className="flex flex-col h-full">
      <div className="px-5 pb-3">
        <input
          type="text"
          placeholder="Search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>

      <div className="flex-1 overflow-y-auto px-5 space-y-1 min-h-0">
        {filtered.map((med) => {
          const isSelected = selectedMed === med;
          return (
            <label
              key={med}
              onClick={() => onSelect(med)}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-md cursor-pointer border transition-colors ${
                isSelected
                  ? "bg-blue-50 border-blue-200"
                  : "bg-white border-transparent hover:bg-gray-50"
              }`}
            >
              <div
                className={`w-4 h-4 rounded-sm border-2 flex items-center justify-center flex-shrink-0 transition-colors ${
                  isSelected
                    ? "border-blue-600 bg-blue-600"
                    : "border-gray-400 bg-white"
                }`}
              >
                {isSelected && (
                  <svg
                    className="w-2.5 h-2.5 text-white"
                    fill="none"
                    viewBox="0 0 10 10"
                    stroke="currentColor"
                    strokeWidth={2.5}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M1.5 5l2.5 2.5 4.5-4.5"
                    />
                  </svg>
                )}
              </div>
              <span className="text-sm text-gray-800">{med}</span>
            </label>
          );
        })}

        {filtered.length === 0 && (
          <p className="text-sm text-gray-400 text-center py-8">
            No medications found
          </p>
        )}
      </div>

      <div className="px-5 pt-4 pb-5 border-t border-gray-100 flex justify-between gap-3 mt-auto">
        <button
          onClick={onCancel}
          className="flex-1 px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
        >
          Cancel
        </button>
        <button
          onClick={onContinue}
          disabled={!selectedMed}
          className={`flex-1 px-4 py-2 rounded-md text-sm font-medium text-white transition-colors ${
            selectedMed
              ? "bg-blue-600 hover:bg-blue-700"
              : "bg-blue-300 cursor-not-allowed"
          }`}
        >
          Continue
        </button>
      </div>
    </div>
  );
}

// ─── Step 2 – Medication Details ─────────────────────────────────────────────
function StepDetail({ selectedMed, formData, setFormData, onBack, onContinue }) {
  const handleChange = (field, value) =>
    setFormData((prev) => ({ ...prev, [field]: value }));

  const inputCls =
    "w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent";
  const labelCls = "block text-xs font-medium text-gray-600 mb-1";

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto px-5 pb-3 min-h-0 space-y-4">
        <div>
          <label className={labelCls}>Drug</label>
          <input
            type="text"
            value={formData.drug || selectedMed}
            onChange={(e) => handleChange("drug", e.target.value)}
            className={inputCls}
          />
        </div>
        <div>
          <label className={labelCls}>Quantity</label>
          <input
            type="text"
            placeholder="Enter quantity"
            value={formData.quantity || ""}
            onChange={(e) => handleChange("quantity", e.target.value)}
            className={inputCls}
          />
        </div>
        <div>
          <label className={labelCls}>Dose</label>
          <select
            value={formData.dose || ""}
            onChange={(e) => handleChange("dose", e.target.value)}
            className={`${inputCls} bg-white`}
          >
            <option value="">Select item</option>
            {DOSE_OPTIONS.map((d) => (
              <option key={d} value={d}>{d}</option>
            ))}
          </select>
        </div>
        <div>
          <label className={labelCls}>Frequency</label>
          <input
            type="text"
            placeholder="Enter or Select Frequency"
            value={formData.frequency || ""}
            onChange={(e) => handleChange("frequency", e.target.value)}
            className={inputCls}
          />
        </div>
        <div>
          <label className={labelCls}>Duration</label>
          <input
            type="text"
            placeholder="Enter Duration"
            value={formData.duration || ""}
            onChange={(e) => handleChange("duration", e.target.value)}
            className={inputCls}
          />
        </div>
        <div>
          <label className={labelCls}>Sig (Directions)</label>
          <textarea
            placeholder="Enter Sig (Directions)"
            value={formData.sig || ""}
            onChange={(e) => handleChange("sig", e.target.value)}
            rows={3}
            className={`${inputCls} resize-none`}
          />
        </div>
        <div>
          <label className={labelCls}>Dispense Amount</label>
          <input
            type="text"
            placeholder="Enter Dispense Amount"
            value={formData.dispenseAmount || ""}
            onChange={(e) => handleChange("dispenseAmount", e.target.value)}
            className={inputCls}
          />
        </div>
        <div>
          <label className={labelCls}>Associated Diagnoses</label>
          <textarea
            placeholder="Enter Associated Diagnoses"
            value={formData.diagnoses || ""}
            onChange={(e) => handleChange("diagnoses", e.target.value)}
            rows={3}
            className={`${inputCls} resize-none`}
          />
        </div>
      </div>

      <div className="px-5 pt-4 pb-5 border-t border-gray-100 flex justify-between gap-3 mt-auto">
        <button
          onClick={onBack}
          className="flex-1 px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
        >
          Back
        </button>
        <button
          onClick={onContinue}
          className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-md text-sm font-medium text-white transition-colors"
        >
          Continue
        </button>
      </div>
    </div>
  );
}

// ─── Pharmacy Card ────────────────────────────────────────────────────────────
function PharmacyCard({ pharmacy, isSelected, onSelect }) {
  return (
    <div
      onClick={() => onSelect(pharmacy)}
      className={`p-3 rounded-lg border cursor-pointer transition-all ${
        isSelected
          ? "border-blue-500 bg-blue-50"
          : "border-gray-200 bg-white hover:border-blue-300 hover:bg-gray-50"
      }`}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2.5 flex-1 min-w-0">
          <div
            className={`w-4 h-4 rounded-full border-2 flex-shrink-0 flex items-center justify-center transition-colors ${
              isSelected ? "border-blue-600" : "border-gray-300"
            }`}
          >
            {isSelected && <div className="w-2 h-2 rounded-full bg-blue-600" />}
          </div>
          <div className="min-w-0">
            <p
              className={`text-sm font-semibold leading-tight ${
                isSelected ? "text-blue-700" : "text-gray-800"
              }`}
            >
              {pharmacy.name}
            </p>
            <p className="text-xs text-gray-500 mt-0.5 truncate">
              {pharmacy.address}
            </p>
            <p className="text-xs text-gray-500">{pharmacy.phone}</p>
          </div>
        </div>
        <span
          className={`text-xs font-medium px-2 py-0.5 rounded-full flex-shrink-0 mt-0.5 ${
            pharmacy.hours.toLowerCase().includes("24")
              ? "bg-green-100 text-green-700"
              : "bg-gray-100 text-gray-600"
          }`}
        >
          {pharmacy.hours}
        </span>
      </div>
    </div>
  );
}

// ─── Step 3 – Review & Submit ─────────────────────────────────────────────────
function StepReview({ selectedMed, formData, onBack, onSendRx }) {
  const [zipInput, setZipInput] = useState(DEFAULT_ZIP);
  const [activeZip, setActiveZip] = useState(DEFAULT_ZIP);
  const [pharmacies, setPharmacies] = useState(
    () => PHARMACY_DATA[DEFAULT_ZIP] || []
  );
  const [selectedPharmacy, setSelectedPharmacy] = useState(null);
  const [noResults, setNoResults] = useState(false);

  const handleZipSearch = () => {
    const zip = zipInput.trim();
    const results = PHARMACY_DATA[zip];
    setActiveZip(zip);
    if (results && results.length > 0) {
      setPharmacies(results);
      setNoResults(false);
    } else {
      setPharmacies([]);
      setNoResults(true);
    }
    setSelectedPharmacy(null);
  };

  const reviewFields = [
    { label: "Medication", value: formData.drug || selectedMed },
    { label: "Dose", value: formData.dose || "—" },
    { label: "Frequency", value: formData.frequency || "—" },
    { label: "Duration", value: formData.duration || "—" },
    { label: "Refills", value: "0" },
    { label: "Sig", value: formData.sig || "—" },
  ];

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto px-5 pb-3 min-h-0 space-y-5">
        {/* Review Card */}
        <div className="border border-gray-200 rounded-lg p-4 bg-gray-50 space-y-2">
          {reviewFields.map(({ label, value }) => (
            <div key={label} className="flex justify-between text-sm">
              <span className="text-gray-500 font-medium w-24 flex-shrink-0">
                {label}
              </span>
              <span className="text-gray-800 text-right">{value}</span>
            </div>
          ))}
        </div>

        {/* Choose Pharmacy */}
        <div>
          <h3 className="text-sm font-semibold text-gray-700 mb-3">
            Choose Pharmacy
          </h3>

          <div className="flex gap-2 mb-4">
            <input
              type="text"
              placeholder="Search by zip code"
              value={zipInput}
              onChange={(e) => setZipInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleZipSearch()}
              className="flex-1 border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              onClick={handleZipSearch}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-md transition-colors"
            >
              Search
            </button>
          </div>

          {pharmacies.length > 0 && (
            <p className="text-xs text-gray-400 mb-2">
              Showing pharmacies near{" "}
              <span className="font-medium text-gray-500">{activeZip}</span>
            </p>
          )}

          {noResults && (
            <div className="text-center py-6 text-sm text-gray-400">
              No pharmacies found for zip code{" "}
              <span className="font-medium text-gray-500">"{activeZip}"</span>
            </div>
          )}

          <div className="space-y-2">
            {pharmacies.map((pharmacy) => (
              <PharmacyCard
                key={pharmacy.id}
                pharmacy={pharmacy}
                isSelected={selectedPharmacy?.id === pharmacy.id}
                onSelect={setSelectedPharmacy}
              />
            ))}
          </div>
        </div>
      </div>

      <div className="px-5 pt-4 pb-5 border-t border-gray-100 flex justify-between gap-3 mt-auto">
        <button
          onClick={onBack}
          className="flex-1 px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
        >
          Back
        </button>
        <button
          onClick={() => onSendRx(selectedPharmacy)}
          disabled={!selectedPharmacy}
          className={`flex-1 px-4 py-2 rounded-md text-sm font-medium text-white transition-colors ${
            selectedPharmacy
              ? "bg-blue-600 hover:bg-blue-700"
              : "bg-blue-300 cursor-not-allowed"
          }`}
        >
          Send RX
        </button>
      </div>
    </div>
  );
}

// ─── Main Wizard ──────────────────────────────────────────────────────────────
export default function AddRx({ isOpen, onClose, onMedicationAdded }) {
  const [step, setStep] = useState(1);
  const [selectedMed, setSelectedMed] = useState(null);
  const [formData, setFormData] = useState({});

  useEffect(() => {
    if (isOpen) {
      setStep(1);
      setSelectedMed(null);
      setFormData({});
    }
  }, [isOpen]);

  const handleClose = () => {
    setStep(1);
    setSelectedMed(null);
    setFormData({});
    onClose();
  };

  const handleSendRx = (pharmacy) => {
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

    const newMed = {
      id: `med-${Date.now()}`,
      name: formData.drug || selectedMed,
      dosage: formData.dose || "",
      form: "Tablet",
      type: "send-rx",
      instructions: formData.sig || "",
      status: "success",
      statusLabel: `Sent ${dateStr} at ${timeStr}`,
      prescriber: "EVA Bond Prescriber",
      pharmacy: pharmacy.name,
      patientNote: "",
      discontinuedOn: null,
      discontinueReason: null,
      externalPrescriber: null,
      frequency: formData.frequency || "",
      duration: formData.duration || "",
      quantity: formData.quantity || "",
      dispenseAmount: formData.dispenseAmount || "",
      diagnoses: formData.diagnoses || "",
      refills: 0,
    };

    onMedicationAdded(newMed);
    handleClose();
  };

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black/30 z-40" onClick={handleClose} />

      <div className="fixed right-0 top-0 h-full w-[420px] max-w-full bg-white shadow-2xl z-50 flex flex-col">
        <div className="px-5 pt-5 pb-4 border-b border-gray-100 flex-shrink-0">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-base font-semibold text-gray-900">
              New Medication
            </h2>
            <button
              onClick={handleClose}
              className="w-7 h-7 flex items-center justify-center rounded-full text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          <StepIndicator currentStep={step} />

          {step === 2 && (
            <p className="mt-3 text-sm font-semibold text-gray-800">
              {selectedMed}
            </p>
          )}
        </div>

        <div className="flex flex-col flex-1 min-h-0 pt-4">
          {step === 1 && (
            <StepSelect
              selectedMed={selectedMed}
              onSelect={setSelectedMed}
              onCancel={handleClose}
              onContinue={() => {
                setFormData((prev) => ({ ...prev, drug: selectedMed }));
                setStep(2);
              }}
            />
          )}

          {step === 2 && (
            <StepDetail
              selectedMed={selectedMed}
              formData={formData}
              setFormData={setFormData}
              onBack={() => setStep(1)}
              onContinue={() => setStep(3)}
            />
          )}

          {step === 3 && (
            <StepReview
              selectedMed={selectedMed}
              formData={formData}
              onBack={() => setStep(2)}
              onSendRx={handleSendRx}
            />
          )}
        </div>
      </div>
    </>
  );
}