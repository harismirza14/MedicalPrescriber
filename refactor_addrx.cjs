const fs = require('fs');

const filePath = 'd:\\OfficeWork\\medications-app\\src\\components\\organisms\\AddRX\\AddRX.jsx';
let content = fs.readFileSync(filePath, 'utf8');

// 1. Update imports
content = content.replace(
    "import { addPrescription, updatePrescription, formatStatusLabel } from '../../store/MedicationSlice';",
    "import { addPrescription, updatePrescription, formatStatusLabel } from '../../../store/MedicationSlice';"
);
content = content.replace(
    "import { fetchMedications, fetchPharmaciesByZip } from '../../api/masterDataApi';",
    "import { fetchMedications, fetchPharmaciesByZip } from '../../../api/masterDataApi';\n" +
    "import StepIndicator from '../../molecules/StepIndicator/StepIndicator';\n" +
    "import PharmacyPickerCard from '../../molecules/PharmacyPickerCard/PharmacyPickerCard';\n" +
    "import Input from '../../atoms/Input/Input';\n" +
    "import Select from '../../atoms/Select/Select';\n" +
    "import Label from '../../atoms/Label/Label';\n" +
    "import Button from '../../atoms/Button/Button';"
);

// 2. Remove inline StepIndicator
content = content.replace(/function StepIndicator\(\{ currentStep \}\) \{[\s\S]*?\}\n\n/, '');

// 3. Remove inline PharmacyPickerCard
content = content.replace(/function PharmacyPickerCard\(\{ pharmacy, isSelected, onSelect \}\) \{[\s\S]*?\}\n\n/, '');

// 4. Replace Form inputs in StepSelect
content = content.replace(
    '<input\n          type="text"\n          placeholder="Search"\n          value={search}\n          onChange={(e) => setSearch(e.target.value)}\n          className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"\n        />',
    '<Input\n          type="text"\n          placeholder="Search"\n          value={search}\n          onChange={(e) => setSearch(e.target.value)}\n        />'
);

// 5. Replace inputs in StepDetail
content = content.replace(
    '<label className={labelCls}>Drug</label>',
    '<Label>Drug</Label>'
);
content = content.replace(
    '<input\n              type="text"\n              placeholder="Search for a drug"\n              value={drugSearch}\n              onChange={(e) => {\n                setDrugSearch(e.target.value);\n                handleChange(\'drug\', e.target.value);\n                setShowDrugList(true);\n              }}\n              onFocus={() => setShowDrugList(true)}\n              onBlur={() => setTimeout(() => setShowDrugList(false), 150)}\n              className={`${inputCls} pr-8`}\n            />',
    '<Input\n              type="text"\n              placeholder="Search for a drug"\n              value={drugSearch}\n              onChange={(e) => {\n                setDrugSearch(e.target.value);\n                handleChange(\'drug\', e.target.value);\n                setShowDrugList(true);\n              }}\n              onFocus={() => setShowDrugList(true)}\n              onBlur={() => setTimeout(() => setShowDrugList(false), 150)}\n              className="pr-8"\n            />'
);

// The grid fields
const gridReplacement = `
        <div className="grid grid-cols-2 gap-4">
          <div><Label>Quantity</Label><Input type="text" placeholder="Enter Quantity" value={formData.quantity || ''} onChange={e => handleChange('quantity', e.target.value)} /></div>
          <div><Label>Dose</Label><Select value={formData.dose || ''} onChange={e => handleChange('dose', e.target.value)}><option value="">Select item</option>{DOSE_OPTIONS.map(d => <option key={d} value={d}>{d}</option>)}</Select></div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div><Label>Frequency</Label><Input type="text" placeholder="Enter or Select Frequency" value={formData.frequency || ''} onChange={e => handleChange('frequency', e.target.value)} /></div>
          <div><Label>Duration</Label><div className="relative"><Input type="text" placeholder="Enter Duration" value={formData.duration || ''} onChange={e => handleChange('duration', e.target.value)} className="pr-12" /><span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400">Days</span></div></div>
        </div>

        <div><Label>Sig</Label><Input type="text" placeholder="Enter Sig (Directions)" value={formData.sig || ''} onChange={e => handleChange('sig', e.target.value)} /></div>

        <div className="grid grid-cols-2 gap-4">
          <div><Label>Dispense Amount</Label><Input type="text" placeholder="Enter Dispense Amount" value={formData.dispenseAmount || ''} onChange={e => handleChange('dispenseAmount', e.target.value)} /></div>
          <div><Label>Refills</Label><Select value={formData.refills ?? 0} onChange={e => handleChange('refills', Number(e.target.value))}>{[0,1,2,3,4,5].map(n => <option key={n} value={n}>{n}</option>)}</Select></div>
        </div>

        <div><Label>Associated Diagnoses</Label><Input type="text" value={formData.diagnoses || ''} onChange={e => handleChange('diagnoses', e.target.value)} /></div>
`;

const gridRegex = /<div className="grid grid-cols-2 gap-4">[\s\S]*?Associated Diagnoses<\/label><input type="text" value=\{formData\.diagnoses \|\| ''\} onChange=\{e => handleChange\('diagnoses', e\.target\.value\)\} className=\{inputCls\} \/><\/div>/;
content = content.replace(gridRegex, gridReplacement.trim());

// Update Buttons
content = content.replace(/<button onClick=\{onCancel\} className="text-sm font-medium text-blue-500 hover:text-blue-600">Cancel<\/button>/g, '<Button onClick={onCancel} variant="ghost">Cancel</Button>');
content = content.replace(/<button\n          onClick=\{onContinue\}\n          disabled=\{!selectedMed\}\n          className=\{`px-5 py-2 rounded-md text-sm font-medium \$\{\n            selectedMed \? 'bg-blue-600 text-white hover:bg-blue-700' : 'bg-gray-100 text-gray-400 cursor-not-allowed'\n          \}`\}\n        >\n          Continue\n        <\/button>/g, '<Button onClick={onContinue} disabled={!selectedMed} variant="solid">Continue</Button>');

content = content.replace(/<button onClick=\{onBack\} className="text-sm font-medium text-blue-500 hover:text-blue-600">\{isEditMode \? 'Cancel' : 'Back'\}<\/button>/g, '<Button onClick={onBack} variant="ghost">{isEditMode ? \'Cancel\' : \'Back\'}</Button>');
content = content.replace(/<button onClick=\{onContinue\} disabled=\{!drugSearch.trim\(\)\} className=\{`px-5 py-2 rounded-md text-sm font-medium \$\{drugSearch.trim\(\) \? 'bg-blue-600 hover:bg-blue-700 text-white' : 'bg-gray-100 text-gray-400 cursor-not-allowed'\}`\}>Continue<\/button>/g, '<Button onClick={onContinue} disabled={!drugSearch.trim()} variant="solid">Continue</Button>');

content = content.replace(/<button type="button" onClick=\{onBack\} className="absolute right-4 top-4 text-xs font-bold text-blue-600 hover:text-blue-700">Change<\/button>/g, '<Button onClick={onBack} variant="ghost" className="absolute right-4 top-4">Change</Button>');

content = content.replace(/<button onClick=\{onBack\} disabled=\{loading\} className="text-sm font-bold text-blue-600 hover:text-blue-700 disabled:text-gray-300">Cancel<\/button>/g, '<Button onClick={onBack} disabled={loading} variant="ghost">Cancel</Button>');
content = content.replace(/<button onClick=\{.*?\} disabled=\{!selectedPharmacy \|\| loading\} className=\{`px-6 py-2.5 rounded-lg text-sm font-semibold \$\{selectedPharmacy && !loading \? 'bg-blue-600 text-white hover:bg-blue-700' : 'bg-gray-100 text-gray-400 cursor-not-allowed'\}`\}>\n          \{loading \? 'Saving...' : \(isIsolatedRoute \? 'Update Pharmacy' : 'Send RX'\)\}\n        <\/button>/g, '<Button onClick={() => onSendRx(selectedPharmacy)} disabled={!selectedPharmacy || loading} variant="solid">\n          {loading ? \'Saving...\' : (isIsolatedRoute ? \'Update Pharmacy\' : \'Send RX\')}\n        </Button>');

fs.writeFileSync(filePath, content);
