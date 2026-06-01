import { useState, useMemo, useEffect } from "react";
import allData from "../data/medications.json";
// import { useBodyScrollLock } from "../layouts/BodyScrollLock";

const MEDICATION_LIST = allData.medicationList;
const DOSE_OPTIONS    = allData.doseOptions;
const PHARMACY_DATA   = allData.pharmaciesByZip;
const DEFAULT_ZIP     = "22";

// ─── Step Indicator ───────────────────────────────────────────────────────────
function StepIndicator({ currentStep }) {
  const steps = ["Select", "Detail", "Review"];
  return (
    <div className="flex items-center gap-2 mt-1">
      {steps.map((label, i) => {
        const num      = i + 1;
        const isActive = num === currentStep;
        const isDone   = num < currentStep;
        const filled   = isActive || isDone;
        return (
          <span key={label} className="flex items-center gap-1.5">
            {i > 0 && <span className="text-gray-300 text-xs">→</span>}
            <span
              className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold leading-none flex-shrink-0 ${
                filled ? "bg-pink-500 text-white" : "border border-gray-300 text-gray-400"
              }`}
            >
              {num}
            </span>
            <span
              className={`text-sm font-medium ${
                isActive ? "text-pink-500" : isDone ? "text-gray-700" : "text-gray-400"
              }`}
            >
              {label}
            </span>
          </span>
        );
      })}
    </div>
  );
}

// ─── Step 1: Select ───────────────────────────────────────────────────────────
function StepSelect({ selectedMed, onSelect, onCancel, onContinue }) {
  const [search, setSearch] = useState("");

  const filtered = useMemo(
    () => MEDICATION_LIST.filter(m => m.toLowerCase().includes(search.toLowerCase())),
    [search]
  );

  return (
    <div className="flex flex-col h-full min-h-0">
      <div className="px-6 pb-3">
        <input
          type="text"
          placeholder="Search"
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>

      <div className="flex-1 overflow-y-auto px-6 space-y-1 min-h-0">
        {filtered.map(med => {
          const isSelected = selectedMed === med;
          return (
            <label
              key={med}
              onClick={() => onSelect(med)}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-md cursor-pointer border transition-colors ${
                isSelected ? "bg-blue-50 border-blue-200" : "bg-white border-transparent hover:bg-gray-50"
              }`}
            >
              <div
                className={`w-4 h-4 rounded-sm border-2 flex items-center justify-center flex-shrink-0 transition-colors ${
                  isSelected ? "border-blue-600 bg-blue-600" : "border-gray-400 bg-white"
                }`}
              >
                {isSelected && (
                  <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 10 10" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M1.5 5l2.5 2.5 4.5-4.5" />
                  </svg>
                )}
              </div>
              <span className="text-sm text-gray-800">{med}</span>
            </label>
          );
        })}
        {filtered.length === 0 && (
          <p className="text-sm text-gray-400 text-center py-8">No medications found</p>
        )}
      </div>

      <div className="px-6 pt-4 pb-5 border-t border-gray-100 flex items-center justify-between mt-auto">
        <button onClick={onCancel} className="text-sm font-medium text-blue-500 hover:text-blue-600">
          Cancel
        </button>
        <button
          onClick={onContinue}
          disabled={!selectedMed}
          className={`px-5 py-2 rounded-md text-sm font-medium transition-colors ${
            selectedMed ? "bg-blue-600 text-white hover:bg-blue-700" : "bg-gray-100 text-gray-400 cursor-not-allowed"
          }`}
        >
          Continue
        </button>
      </div>
    </div>
  );
}

// ─── Step 2: Detail ───────────────────────────────────────────────────────────
function StepDetail({ selectedMed, formData, setFormData, onBack, onContinue, isEditMode }) {
  const handleChange = (field, value) =>
    setFormData(prev => ({ ...prev, [field]: value }));

  const [drugSearch, setDrugSearch]     = useState(formData.drug || selectedMed || "");
  const [showDrugList, setShowDrugList] = useState(false);

  useEffect(() => {
    setDrugSearch(formData.drug || selectedMed || "");
  }, [formData.drug, selectedMed]);

  const filteredDrugs = useMemo(
    () =>
      drugSearch.trim()
        ? MEDICATION_LIST.filter(m =>
            m.toLowerCase().includes(drugSearch.toLowerCase())
          ).slice(0, 8)
        : [],
    [drugSearch]
  );

  // FIX 2: No validation against MEDICATION_LIST — any typed value is valid.
  // The Continue button is always enabled as long as drugSearch is non-empty.
  const canContinue = drugSearch.trim().length > 0;

  const inputCls = "w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white";
  const labelCls = "block text-sm font-medium text-gray-700 mb-1";

  return (
    <div className="flex flex-col h-full min-h-0">
      <div className="flex-1 overflow-y-auto px-6 pb-3 min-h-0 space-y-4">

        <div className="flex items-center justify-between">
          <span className="text-sm font-semibold text-gray-800">
            {formData.drug || selectedMed || "New Medication"}
          </span>
          <span className="text-xs font-medium text-pink-500">
            {isEditMode ? "Editing" : "In progress"}
          </span>
        </div>

        {/* Drug — autocomplete with clear button (FIX 2 + FIX 3) */}
        <div className="relative">
          <label className={labelCls}>Drug</label>
          <div className="relative">
            <input
              type="text"
              placeholder="Search for a drug"
              value={drugSearch}
              onChange={e => {
                setDrugSearch(e.target.value);
                handleChange("drug", e.target.value);
                setShowDrugList(true);
              }}
              onFocus={() => setShowDrugList(true)}
              onBlur={() => setTimeout(() => setShowDrugList(false), 150)}
              // FIX 2: pr-8 makes room for the × button; no other restriction
              className={`${inputCls} pr-8`}
            />
            {/* FIX 3: Clear button — only visible when there is text */}
            {drugSearch && (
              <button
                type="button"
                onMouseDown={e => {
                  e.preventDefault(); // prevent input blur before click registers
                  setDrugSearch("");
                  handleChange("drug", "");
                  setShowDrugList(false);
                }}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 text-base leading-none p-0.5"
                aria-label="Clear drug"
              >
                ×
              </button>
            )}
          </div>
          {showDrugList && filteredDrugs.length > 0 && (
            <ul className="absolute z-10 left-0 right-0 mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-48 overflow-y-auto">
              {filteredDrugs.map(drug => (
                <li
                  key={drug}
                  onMouseDown={() => {
                    setDrugSearch(drug);
                    handleChange("drug", drug);
                    setShowDrugList(false);
                  }}
                  className="px-3 py-2 text-sm text-gray-800 hover:bg-blue-50 cursor-pointer"
                >
                  {drug}
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={labelCls}>Quantity</label>
            <input
              type="text"
              placeholder="Enter Quantity"
              value={formData.quantity || ""}
              onChange={e => handleChange("quantity", e.target.value)}
              className={inputCls}
            />
          </div>
          <div>
            <label className={labelCls}>Dose</label>
            <select
              value={formData.dose || ""}
              onChange={e => handleChange("dose", e.target.value)}
              className={inputCls}
            >
              <option value="">Select item</option>
              {DOSE_OPTIONS.map(d => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={labelCls}>Frequency</label>
            <input
              type="text"
              placeholder="Enter or Select Frequency"
              value={formData.frequency || ""}
              onChange={e => handleChange("frequency", e.target.value)}
              className={inputCls}
            />
          </div>
          <div>
            <label className={labelCls}>Duration</label>
            <div className="relative">
              <input
                type="text"
                placeholder="Enter Duration"
                value={formData.duration || ""}
                onChange={e => handleChange("duration", e.target.value)}
                className={`${inputCls} pr-12`}
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400 pointer-events-none">
                Days
              </span>
            </div>
          </div>
        </div>

        <div>
          <label className={labelCls}>Sig</label>
          <input
            type="text"
            placeholder="Enter Sig (Directions)"
            value={formData.sig || ""}
            onChange={e => handleChange("sig", e.target.value)}
            className={inputCls}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={labelCls}>Dispense Amount</label>
            <input
              type="text"
              placeholder="Enter Dispense Amount"
              value={formData.dispenseAmount || ""}
              onChange={e => handleChange("dispenseAmount", e.target.value)}
              className={inputCls}
            />
          </div>
          <div>
            <label className={labelCls}>Refills</label>
            <select
              value={formData.refills ?? 0}
              onChange={e => handleChange("refills", Number(e.target.value))}
              className={inputCls}
            >
              {[0, 1, 2, 3, 4, 5].map(n => (
                <option key={n} value={n}>{n}</option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className={labelCls}>Associated Diagnoses</label>
          <input
            type="text"
            placeholder=""
            value={formData.diagnoses || ""}
            onChange={e => handleChange("diagnoses", e.target.value)}
            className={inputCls}
          />
        </div>
      </div>

      <div className="px-6 pt-4 pb-5 border-t border-gray-100 flex items-center justify-between mt-auto">
        <button onClick={onBack} className="text-sm font-medium text-blue-500 hover:text-blue-600">
          {isEditMode ? "Cancel" : "Back"}
        </button>
        {/* FIX 2: disabled only when drug field is empty, not when it's a custom value */}
        <button
          onClick={onContinue}
          disabled={!canContinue}
          className={`px-5 py-2 rounded-md text-sm font-medium transition-colors ${
            canContinue
              ? "bg-blue-600 hover:bg-blue-700 text-white"
              : "bg-gray-100 text-gray-400 cursor-not-allowed"
          }`}
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
        isSelected ? "border-blue-500 bg-blue-50" : "border-gray-200 bg-white hover:border-blue-300 hover:bg-gray-50"
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
            <p className={`text-sm font-semibold leading-tight ${isSelected ? "text-blue-700" : "text-gray-800"}`}>
              {pharmacy.name}
            </p>
            <p className="text-xs text-gray-500 mt-0.5 truncate">{pharmacy.address}</p>
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

// ─── Step 3: Review ───────────────────────────────────────────────────────────
function StepReview({ selectedMed, formData, onBack, onSendRx, initialPharmacy }) {
  const [zipInput, setZipInput]     = useState(DEFAULT_ZIP);
  const [activeZip, setActiveZip]   = useState(DEFAULT_ZIP);
  const [pharmacies, setPharmacies] = useState(() => PHARMACY_DATA[DEFAULT_ZIP] || []);
  const [noResults, setNoResults]   = useState(false);

  // FIX 1: Check if initialPharmacy exists in the default zip list.
  // If found → pre-select it. If not found → use a synthetic "ghost" entry
  // so the user sees it selected and can either keep it or search for another.
  const defaultList = PHARMACY_DATA[DEFAULT_ZIP] || [];
  const matchedInDefault = initialPharmacy
    ? defaultList.find(p => p.name === initialPharmacy) ?? null
    : null;

  // Ghost entry: a display-only object representing a pharmacy outside the default zip
  const ghostPharmacy = initialPharmacy && !matchedInDefault
    ? { id: "__ghost__", name: initialPharmacy, address: "Outside default zip area", phone: "", hours: "" }
    : null;

  const [selectedPharmacy, setSelectedPharmacy] = useState(
    matchedInDefault ?? ghostPharmacy ?? null
  );

  const handleZipSearch = () => {
    const zip     = zipInput.trim();
    const results = PHARMACY_DATA[zip];
    setActiveZip(zip);
    if (results && results.length > 0) {
      setPharmacies(results);
      setNoResults(false);
    } else {
      setPharmacies([]);
      setNoResults(true);
    }
    // FIX 1: Don't wipe selectedPharmacy on zip search — let the user
    // explicitly pick a new one from the results if they want to change it.
  };

  // All pharmacies shown in the list — prepend ghost if it exists
  // so the user can see and re-confirm the current pharmacy at the top
  const displayList = ghostPharmacy
    ? [ghostPharmacy, ...pharmacies]
    : pharmacies;

  const reviewFields = [
    { label: "Medication", value: formData.drug || selectedMed },
    { label: "Dose",       value: formData.dose      || "—" },
    { label: "Frequency",  value: formData.frequency || "—" },
    { label: "Duration",   value: formData.duration  ? `${formData.duration} Days` : "—" },
    { label: "Refills",    value: formData.refills   ?? 0 },
    { label: "Sig",        value: formData.sig        || "—" },
  ];

  return (
    <div className="flex flex-col h-full min-h-0">
      <div className="flex-1 overflow-y-auto px-6 pb-3 min-h-0 space-y-5">

        <div className="border border-gray-200 rounded-lg overflow-hidden">
          {reviewFields.map(({ label, value }) => (
            <div key={label} className="flex px-4 py-2.5 border-b border-gray-100 last:border-0">
              <span className="text-sm text-gray-500 w-28 flex-shrink-0">{label}</span>
              <span className="text-sm font-medium text-gray-800">{String(value)}</span>
            </div>
          ))}
        </div>

        <div>
          <h3 className="text-sm font-semibold text-gray-700 mb-3">Choose Pharmacy</h3>

          {/* FIX 1: Banner shown only when the current pharmacy isn't in the default zip */}
          {ghostPharmacy && (
            <div className="flex items-start gap-2 mb-3 px-3 py-2.5 bg-amber-50 border border-amber-200 rounded-md">
              <svg className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
              </svg>
              <p className="text-xs text-amber-700">
                Current pharmacy <span className="font-semibold">"{initialPharmacy}"</span> is not listed
                for zip <span className="font-semibold">{DEFAULT_ZIP}</span>. You can keep it or search
                a different zip to select another.
              </p>
            </div>
          )}

          <div className="flex gap-2 mb-4">
            <input
              type="text"
              placeholder="Search by zip code"
              value={zipInput}
              onChange={e => setZipInput(e.target.value)}
              onKeyDown={e => e.key === "Enter" && handleZipSearch()}
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
            {displayList.map(pharmacy => (
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

      <div className="px-6 pt-4 pb-5 border-t border-gray-100 flex items-center justify-between mt-auto">
        <button onClick={onBack} className="text-sm font-medium text-blue-500 hover:text-blue-600">
          Back
        </button>
        <button
          onClick={() => onSendRx(selectedPharmacy)}
          disabled={!selectedPharmacy}
          className={`px-5 py-2 rounded-md text-sm font-medium transition-colors ${
            selectedPharmacy
              ? "bg-blue-600 text-white hover:bg-blue-700"
              : "bg-gray-100 text-gray-400 cursor-not-allowed"
          }`}
        >
          Send RX
        </button>
      </div>
    </div>
  );
}

// ─── Main Wizard ──────────────────────────────────────────────────────────────
export default function AddRx({
  isOpen,
  onClose,
  onMedicationAdded,
  initialData = null,
}) {
  //  useBodyScrollLock(isOpen); 
  const isEditMode = !!initialData;

  const [step, setStep]               = useState(1);
  const [selectedMed, setSelectedMed] = useState(null);
  const [formData, setFormData]       = useState({});

  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        setSelectedMed(initialData.drug);
        setFormData({
          drug:           initialData.drug           || "",
          dose:           initialData.dosage          || "",
          sig:            initialData.instructions    || "",
          quantity:       initialData.quantity        || "",
          frequency:      initialData.frequency       || "",
          duration:       initialData.duration        || "",
          dispenseAmount: initialData.dispenseAmount  || "",
          diagnoses:      initialData.diagnoses       || "",
          refills:        initialData.refills         ?? 0,
          pharmacy:       initialData.pharmacy        || "",
        });
        setStep(2);
      } else {
        setSelectedMed(null);
        setFormData({});
        setStep(1);
      }
    }
  }, [isOpen, initialData]);

  const handleClose = () => {
    setStep(1);
    setSelectedMed(null);
    setFormData({});
    onClose();
  };

  const handleSendRx = (pharmacy) => {
    const now     = new Date();
    const dateStr = now.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
    const timeStr = now.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true });

    const newMed = {
      id:                initialData?.id ?? `med-${Date.now()}`,
      name:              formData.drug           || selectedMed,
      dosage:            formData.dose           || "",
      form:              "Tablet",
      type:              "send-rx",
      instructions:      formData.sig            || "",
      status:            "success",
      statusLabel:       `Sent ${dateStr} at ${timeStr}`,
      prescriber:        "EVA Bond Prescriber",
      pharmacy:          pharmacy.name,
      patientNote:       "",
      discontinuedOn:    null,
      discontinueReason: null,
      externalPrescriber: null,
      frequency:         formData.frequency      || "",
      duration:          formData.duration       || "",
      quantity:          formData.quantity       || "",
      dispenseAmount:    formData.dispenseAmount || "",
      diagnoses:         formData.diagnoses      || "",
      refills:           formData.refills        ?? 0,
    };

    onMedicationAdded(newMed);
    handleClose();
  };

  const stepSubtitle = {
    1: "Step 1 - select medication",
    2: "Step 2 - medication details",
    3: "Step 3 - review",
  }[step];

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black/40 z-40" onClick={handleClose} />
      <div className="fixed inset-y-0 right-0 z-50 w-full max-w-sm bg-white shadow-2xl flex flex-col">
        <div className="flex flex-col flex-1 min-h-0">

          <div className="px-6 pt-5 pb-4 border-b border-gray-100 flex-shrink-0">
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-lg font-bold text-gray-900">
                  {isEditMode ? "Edit Medication" : "New Medication"}
                </h2>
                <p className="text-xs text-gray-400 mt-0.5">{stepSubtitle}</p>
                <StepIndicator currentStep={step} />
              </div>
              <button
                onClick={handleClose}
                className="w-7 h-7 flex items-center justify-center rounded-full text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors mt-0.5"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          <div className="flex flex-col flex-1 min-h-0 pt-4 overflow-hidden">
            {step === 1 && (
              <StepSelect
                selectedMed={selectedMed}
                onSelect={setSelectedMed}
                onCancel={handleClose}
                onContinue={() => {
                  setFormData(prev => ({ ...prev, drug: selectedMed }));
                  setStep(2);
                }}
              />
            )}
            {step === 2 && (
              <StepDetail
                selectedMed={selectedMed}
                formData={formData}
                setFormData={setFormData}
                onBack={() => (isEditMode ? handleClose() : setStep(1))}
                onContinue={() => setStep(3)}
                isEditMode={isEditMode}
              />
            )}
            {step === 3 && (
              <StepReview
                selectedMed={selectedMed}
                formData={formData}
                onBack={() => setStep(2)}
                onSendRx={handleSendRx}
                initialPharmacy={initialData?.pharmacy ?? null}
              />
            )}
          </div>

        </div>
      </div>
    </>
  );
}