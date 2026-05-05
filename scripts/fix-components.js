const fs = require("fs");
const path = require("path");

const ROOT = path.resolve(__dirname, "..", "apps", "frontend", "components");

function ensureDir(p) {
  if (!fs.existsSync(p)) fs.mkdirSync(p, { recursive: true });
}

function renameIfExists(from, to) {
  if (fs.existsSync(from)) {
    console.log(`Renaming: ${from} -> ${to}`);
    fs.renameSync(from, to);
  }
}

function moveIfExists(from, to) {
  if (fs.existsSync(from)) {
    ensureDir(path.dirname(to));
    console.log(`Moving: ${from} -> ${to}`);
    fs.renameSync(from, to);
  }
}

function writeIndex(folder, exportsList) {
  const dir = path.join(ROOT, folder);
  ensureDir(dir);
  const indexPath = path.join(dir, "index.ts");
  const content =
    exportsList.map((name) => `export * from "./${name}";`).join("\n") + "\n";

  console.log(`Writing index: ${indexPath}`);
  fs.writeFileSync(indexPath, content, "utf8");
}

function main() {
  const uiDir = path.join(ROOT, "ui");
  const formsDir = path.join(ROOT, "forms");

  ensureDir(uiDir);
  ensureDir(formsDir);

  // 1. Normalize UI filenames
  renameIfExists(path.join(uiDir, "Badge.tsx"), path.join(uiDir, "badge.tsx"));
  renameIfExists(path.join(uiDir, "Button.tsx"), path.join(uiDir, "button.tsx"));
  renameIfExists(path.join(uiDir, "Card.tsx"), path.join(uiDir, "card.tsx"));
  renameIfExists(path.join(uiDir, "Input.tsx"), path.join(uiDir, "input.tsx"));
  renameIfExists(path.join(uiDir, "Label.tsx"), path.join(uiDir, "label.tsx"));
  renameIfExists(path.join(uiDir, "Skeleton.tsx"), path.join(uiDir, "skeleton.tsx"));
  renameIfExists(path.join(uiDir, "Spinner.tsx"), path.join(uiDir, "spinner.tsx"));
  renameIfExists(path.join(uiDir, "Textarea.tsx"), path.join(uiDir, "textarea.tsx"));
  renameIfExists(path.join(uiDir, "slider.tsx"), path.join(uiDir, "slider.tsx"));

  // 2. Normalize forms filenames
  renameIfExists(path.join(formsDir, "Checkbox.tsx"), path.join(formsDir, "checkbox.tsx"));
  renameIfExists(path.join(formsDir, "Combobox.tsx"), path.join(formsDir, "combobox.tsx"));
  renameIfExists(path.join(formsDir, "Form.tsx"), path.join(formsDir, "form.tsx"));
  renameIfExists(path.join(formsDir, "PhoneInput.tsx"), path.join(formsDir, "phone-input.tsx"));
  renameIfExists(path.join(formsDir, "Radio-group.tsx"), path.join(formsDir, "radio-group.tsx"));
  renameIfExists(path.join(formsDir, "Select.tsx"), path.join(formsDir, "select.tsx"));
  renameIfExists(path.join(formsDir, "TextField.tsx"), path.join(formsDir, "text-field.tsx"));
  renameIfExists(path.join(formsDir, "file-upload.tsx"), path.join(formsDir, "file-upload.tsx"));

  // 3. Move primitives from forms → ui
  moveIfExists(path.join(formsDir, "checkbox.tsx"), path.join(uiDir, "checkbox.tsx"));
  moveIfExists(path.join(formsDir, "combobox.tsx"), path.join(uiDir, "combobox.tsx"));
  moveIfExists(path.join(formsDir, "radio-group.tsx"), path.join(uiDir, "radio-group.tsx"));
  moveIfExists(path.join(formsDir, "select.tsx"), path.join(uiDir, "select.tsx"));

  // 4. Ensure Card exists
  const cardPath = path.join(uiDir, "card.tsx");
  if (!fs.existsSync(cardPath)) {
    console.log(`Creating placeholder card: ${cardPath}`);
    fs.writeFileSync(
      cardPath,
      `import { cn } from "@/lib/cn";
import React from "react";

export function Card({ className, ...props }) {
  return (
    <div
      className={cn(
        "rounded-md border border-border bg-bg p-4 shadow-sm",
        className
      )}
      {...props}
    />
  );
}
`,
      "utf8"
    );
  }

  // 5. Regenerate ui/index.ts
  writeIndex("ui", [
    "badge",
    "button",
    "card",
    "checkbox",
    "combobox",
    "input",
    "label",
    "radio-group",
    "select",
    "skeleton",
    "slider",
    "spinner",
    "textarea"
  ]);

  // 6. Regenerate forms/index.ts
  writeIndex("forms", [
    "form",
    "text-field",
    "phone-input",
    "file-upload"
  ]);

  console.log("✅ Components normalized and barrel files regenerated.");
}

main();
