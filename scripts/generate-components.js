import fs from "fs";
import path from "path";

const baseDir = path.join(
  process.cwd(),
  "apps",
  "frontend",
  "components"
);

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

function ensureDir(dir) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
    console.log("Created directory:", dir);
  }
}

function createComponentFile(dir, name) {
  const filePath = path.join(dir, `${name}.tsx`);

  if (fs.existsSync(filePath)) {
    console.log("Skipping existing:", filePath);
    return;
  }

  const content = `export function ${name}({ className = "" }: { className?: string }) {
  return (
    <div className={className}>
      {/* ${name} component */}
    </div>
  );
}
`;

  fs.writeFileSync(filePath, content);
  console.log("Created component:", filePath);
}

function createIndexFile(dir, components) {
  const indexPath = path.join(dir, "index.ts");

  const exports = components
    .map((c) => `export * from "./${c}";`)
    .join("\n");

  fs.writeFileSync(indexPath, exports);
  console.log("Created index:", indexPath);
}

function run() {
  console.log("Generating component structure...");

  ensureDir(baseDir);

  for (const folder of Object.keys(structure)) {
    const folderDir = path.join(baseDir, folder);
    ensureDir(folderDir);

    const components = structure[folder];

    components.forEach((component) =>
      createComponentFile(folderDir, component)
    );

    createIndexFile(folderDir, components);
  }

  console.log("\n✨ Component structure generated successfully!");
}

run();
