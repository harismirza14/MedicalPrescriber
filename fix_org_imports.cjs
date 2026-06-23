const fs = require('fs');
const path = require('path');

const dirs = [
  'd:\\OfficeWork\\medications-app\\src\\components\\organisms',
];

function processDirectory(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      processDirectory(fullPath);
    } else if (fullPath.endsWith('.jsx')) {
      let content = fs.readFileSync(fullPath, 'utf8');
      
      // We only want to adjust `../../store`, `../../api`, etc. if they exist.
      // But we should just replace `../../` with `../../../` for standard folders.
      let modified = false;
      const replaces = [
        { from: /\.\.\/\.\.\/store\//g, to: '../../../store/' },
        { from: /\.\.\/\.\.\/api\//g, to: '../../../api/' },
        { from: /import ExternalRxDrawer from '\.\/ExternalRxDrawer'/g, to: "import ExternalRxDrawer from '../ExternalRxDrawer/ExternalRxDrawer'" },
        { from: /import MedicationActionDrawer from '\.\/MedicationActionDrawer'/g, to: "import MedicationActionDrawer from '../MedicationActionDrawer/MedicationActionDrawer'" },
      ];

      for (const r of replaces) {
        if (r.from.test(content)) {
          content = content.replace(r.from, r.to);
          modified = true;
        }
      }

      if (modified) {
        fs.writeFileSync(fullPath, content);
        console.log('Fixed imports in ' + fullPath);
      }
    }
  }
}

for (const dir of dirs) {
  processDirectory(dir);
}
