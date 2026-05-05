#!/usr/bin/env node

const fs = require("fs");
const path = require("path");

// ------------------------------------------------------
// BASE DIRECTORY
// ------------------------------------------------------
const baseDir = path.join(__dirname, "..", "apps", "frontend", "components");

// ------------------------------------------------------
// COMPONENT STRUCTURE
// ------------------------------------------------------
const structure = {
  ui: ["Skeleton", "Button", "Input", "Card", "Badge", "Spinner"],
  layout: ["Navbar", "Sidebar", "Footer", "AdminSidebar", "ShopHeader"],
  "data-display": ["Table", "DataCard", "StatusPill", "Timeline"],
  forms: ["Form", "TextField", "Select", "Checkbox", "PhoneInput"],
  shop: ["ProductCard", "ProductGallery", "AddToCartButton", "Price"],
  admin: ["DashboardCard", "Metric", "ReservationRow", "QueueStatsCard"],
  feedback: ["Toast", "Alert", "EmptyState"],
  shared: ["Modal", "Drawer", "Tabs", "Pagination"],
};

// ------------------------------------------------------
// TEMPLATES
// ------------------------------------------------------
const baseTemplate = (name) => `import clsx from "clsx";

export function ${name}({ className = "", ...props }) {
  return (
    <div className={clsx("rounded border border-gray-200 p-3 bg-white", className)} {...props}>
      <span className="text-gray-400 text-sm">${name} component</span>
    </div>
  );
}
`;

const uiTemplate = (name) => {
  if (name === "Skeleton") {
    return `export function Skeleton({ className = "" }) {
  return <div className={\`animate-pulse bg-gray-200 rounded \${className}\`} />;
}
`;
  }

  if (name === "Spinner") {
    return `export function Spinner() {
  return (
    <div className="animate-spin h-5 w-5 border-2 border-gray-300 border-t-transparent rounded-full" />
  );
}
`;
  }

  return baseTemplate(name);
};

const layoutTemplate = (name) => `export function ${name}() {
  return (
    <div className="p-4 border-b bg-white">
      <span className="text-gray-500">${name}</span>
    </div>
  );
}
`;

const dataDisplayTemplate = (name) => {
  if (name === "Table") {
    return `export function Table() {
  return (
    <div className="border rounded p-4 text-gray-400 text-sm">
      Table placeholder
    </div>
  );
}
`;
  }

  if (name === "Timeline") {
    return `export function Timeline() {
  return (
    <div className="space-y-4">
      {[...Array(3)].map((_, i) => (
        <div key={i} className="border-l-2 pl-4">
          <div className="h-3 w-1/3 bg-gray-200 rounded mb-1" />
          <div className="h-3 w-1/2 bg-gray-200 rounded" />
        </div>
      ))}
    </div>
  );
}
`;
  }

  return baseTemplate(name);
};

const formTemplate = (name) => {
  if (name === "TextField") {
    return `export function TextField({ label }) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-sm text-gray-600">{label}</label>
      <input className="border rounded px-3 py-2" />
    </div>
  );
}
`;
  }

  return baseTemplate(name);
};

// ------------------------------------------------------
// TEMPLATE SELECTOR
// ------------------------------------------------------
function getTemplate(folder, name) {
  switch (folder) {
    case "ui":
      return uiTemplate(name);
    case "layout":
      return layoutTemplate(name);
    case "data-display":
      return dataDisplayTemplate(name);
    case "forms":
      return formTemplate(name);
    default:
      return baseTemplate(name);
  }
}

// ------------------------------------------------------
// FILESYSTEM HELPERS
// ------------------------------------------------------
function ensureDir(dir) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
    console.log("📁 Created directory:", dir);
  }
}

function createComponentFile(dir, name, folder) {
  const filePath = path.join(dir, `${name}.tsx`);

  if (fs.existsSync(filePath)) {
    console.log("⏭️  Skipping existing:", filePath);
    return;
  }

  const content = getTemplate(folder, name);
  fs.writeFileSync(filePath, content);
  console.log("✨ Created component:", filePath);
}

function createIndexFile(dir, components) {
  const indexPath = path.join(dir, "index.ts");
  const exports = components.map((c) => `export * from "./${c}";`).join("\n");

  fs.writeFileSync(indexPath, exports);
  console.log("🧩 Created index:", indexPath);
}

// ------------------------------------------------------
// MAIN
// ------------------------------------------------------
function run() {
  console.log("🚀 Generating component structure...\n");
  console.log("Writing to:", baseDir, "\n");

  ensureDir(baseDir);

  for (const folder of Object.keys(structure)) {
    const folderDir = path.join(baseDir, folder);
    ensureDir(folderDir);

    const components = structure[folder];

    components.forEach((component) =>
      createComponentFile(folderDir, component, folder)
    );

    createIndexFile(folderDir, components);
  }

  console.log("\n🎉 Component structure generated successfully!");
}

run();
