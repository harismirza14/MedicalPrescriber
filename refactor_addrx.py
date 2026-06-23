import re

file_path = r'd:\OfficeWork\medications-app\src\components\organisms\AddRX\AddRX.jsx'

with open(file_path, 'r') as f:
    content = f.read()

# 1. Update imports
content = content.replace(
    "import { addPrescription, updatePrescription, formatStatusLabel } from '../../store/MedicationSlice';",
    "import { addPrescription, updatePrescription, formatStatusLabel } from '../../../store/MedicationSlice';"
)
content = content.replace(
    "import { fetchMedications, fetchPharmaciesByZip } from '../../api/masterDataApi';",
    "import { fetchMedications, fetchPharmaciesByZip } from '../../../api/masterDataApi';\n"
    "import StepIndicator from '../../molecules/StepIndicator/StepIndicator';\n"
    "import PharmacyPickerCard from '../../molecules/PharmacyPickerCard/PharmacyPickerCard';\n"
    "import Input from '../../atoms/Input/Input';\n"
    "import Select from '../../atoms/Select/Select';\n"
    "import Label from '../../atoms/Label/Label';\n"
    "import Button from '../../atoms/Button/Button';"
)

# 2. Remove inline StepIndicator
content = re.sub(r'function StepIndicator\(\{ currentStep \}\) \{.*?\n\}\n', '', content, flags=re.DOTALL)

# 3. Remove inline PharmacyPickerCard
content = re.sub(r'function PharmacyPickerCard\(\{ pharmacy, isSelected, onSelect \}\) \{.*?\n\}\n', '', content, flags=re.DOTALL)

# 4. Replace Form inputs in StepSelect
content = content.replace(
    '<input\n          type="text"\n          placeholder="Search"\n          value={search}\n          onChange={(e) => setSearch(e.target.value)}\n          className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"\n        />',
    '<Input\n          type="text"\n          placeholder="Search"\n          value={search}\n          onChange={(e) => setSearch(e.target.value)}\n        />'
)

# 5. Replace inputs in StepDetail
content = content.replace(
    '<label className={labelCls}>Drug</label>',
    '<Label>Drug</Label>'
)
content = content.replace(
    '<input\n              type="text"\n              placeholder="Search for a drug"\n              value={drugSearch}\n              onChange={(e) => {\n                setDrugSearch(e.target.value);\n                handleChange(\'drug\', e.target.value);\n                setShowDrugList(true);\n              }}\n              onFocus={() => setShowDrugList(true)}\n              onBlur={() => setTimeout(() => setShowDrugList(false), 150)}\n              className={`${inputCls} pr-8`}\n            />',
    '<Input\n              type="text"\n              placeholder="Search for a drug"\n              value={drugSearch}\n              onChange={(e) => {\n                setDrugSearch(e.target.value);\n                handleChange(\'drug\', e.target.value);\n                setShowDrugList(true);\n              }}\n              onFocus={() => setShowDrugList(true)}\n              onBlur={() => setTimeout(() => setShowDrugList(false), 150)}\n              className="pr-8"\n            />'
)

# The grid fields
grid_replacement = """
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
"""

old_grid = """
        <div className="grid grid-cols-2 gap-4">
          <div><label className={labelCls}>Quantity</label><input type="text" placeholder="Enter Quantity" value={formData.quantity || ''} onChange={e => handleChange('quantity', e.target.value)} className={inputCls} /></div>
          <div><label className={labelCls}>Dose</label><select value={formData.dose || ''} onChange={e => handleChange('dose', e.target.value)} className={inputCls}><option value="">Select item</option>{DOSE_OPTIONS.map(d => <option key={d} value={d}>{d}</option>)}</select></div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div><label className={labelCls}>Frequency</label><input type="text" placeholder="Enter Frequency" value={formData.frequency || ''} onChange={e => handleChange('frequency', e.target.value)} className={inputCls} /></div>
          <div><label className={labelCls}>Duration</label><div className="relative"><input type="text" placeholder="Enter Duration" value={formData.duration || ''} onChange={e => handleChange('duration', e.target.value)} className={`${inputCls} pr-12`} /><span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400">Days</span></div></div>
        </div>

        <div><label className={labelCls}>Sig</label><input type="text" placeholder="Enter Sig (Directions)" value={formData.sig || ''} onChange={e => handleChange('sig', e.target.value)} className={inputCls} /></div>

        <div className="grid grid-cols-2 gap-4">
          <div><label className={labelCls}>Dispense Amount</label><input type="text" placeholder="Enter Dispense Amount" value={formData.dispenseAmount || ''} onChange={e => handleChange('dispenseAmount', e.target.value)} className={inputCls} /></div>
          <div><label className={labelCls}>Refills</label><select value={formData.refills ?? 0} onChange={e => handleChange('refills', Number(e.target.value))} className={inputCls}>{[0,1,2,3,4,5].map(n => <option key={n} value={n}>{n}</option>)}</select></div>
        </div>

        <div><label className={labelCls}>Associated Diagnoses</label><input type="text" value={formData.diagnoses || ''} onChange={e => handleChange('diagnoses', e.target.value)} className={inputCls} /></div>
"""

# I'll just use regex for the grid replacement to avoid exact whitespace mismatch
grid_regex = r'<div className="grid grid-cols-2 gap-4">.*?Associated Diagnoses</label><input type="text" value=\{formData\.diagnoses \|\| \'\'\} onChange=\{e => handleChange\(\'diagnoses\', e\.target\.value\)\} className=\{inputCls\} /></div>'
content = re.sub(grid_regex, grid_replacement.strip(), content, flags=re.DOTALL)

with open(file_path, 'w') as f:
    f.write(content)
