const fs = require('fs');
const path = require('path');

const directories = [
  'd:\\OfficeWork\\medications-app\\src\\pages',
  'd:\\OfficeWork\\medications-app\\src\\components\\templates',
  'd:\\OfficeWork\\medications-app\\src\\components\\organisms',
];

const replacements = [
  { from: /components\/pharmacy\/PDMPCard/g, to: 'components/organisms/PDMPCard/PDMPCard' },
  { from: /components\/pharmacy\/PharmacyCard/g, to: 'components/organisms/PharmacyCard/PharmacyCard' },
  { from: /components\/prescriptions\/MedicationCard/g, to: 'components/organisms/MedicationCard/MedicationCard' },
  { from: /components\/prescriptions\/AddMedicationModal/g, to: 'components/organisms/AddMedicationModal/AddMedicationModal' },
  { from: /components\/prescriptions\/AddRX/g, to: 'components/organisms/AddRX/AddRX' },
  { from: /components\/prescriptions\/ExternalRxDrawer/g, to: 'components/organisms/ExternalRxDrawer/ExternalRxDrawer' },
  { from: /components\/prescriptions\/UpdateMedicationDrawer/g, to: 'components/organisms/UpdateMedicationDrawer/UpdateMedicationDrawer' },
  { from: /components\/pharmacy\/PharmacySelectDrawer/g, to: 'components/organisms/PharmacySelectDrawer/PharmacySelectDrawer' },
  { from: /components\/prescriptions\/MedicationActionDrawer/g, to: 'components/organisms/MedicationActionDrawer/MedicationActionDrawer' },
  { from: /components\/prescriptions\/DisContinueDrawer/g, to: 'components/organisms/DisContinueDrawer/DisContinueDrawer' },
  { from: /components\/prescriptions\/ReContinueDrawer/g, to: 'components/organisms/ReContinueDrawer/ReContinueDrawer' },
  { from: /components\/layout\/Sidebar/g, to: 'components/templates/Sidebar/Sidebar' },
  { from: /components\/layout\/DashboardLayout/g, to: 'components/templates/DashboardLayout/DashboardLayout' },
];

function processDirectory(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      processDirectory(fullPath);
    } else if (fullPath.endsWith('.jsx')) {
      let content = fs.readFileSync(fullPath, 'utf8');
      let modified = false;
      
      for (const r of replacements) {
        if (r.from.test(content)) {
          content = content.replace(r.from, r.to);
          modified = true;
        }
      }
      
      if (modified) {
        fs.writeFileSync(fullPath, content);
        console.log('Updated ' + fullPath);
      }
    }
  }
}

for (const dir of directories) {
  processDirectory(dir);
}
