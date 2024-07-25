import { createRoot } from "react-dom/client";
import { ReactElement } from "react";

const pageId = "form";
const content = document.getElementById(pageId);
if (content) {
  const root = createRoot(content);
  root.render(createContent());
}

function createContent(): ReactElement {
  return <FormContent />
}

export function FormContent() {
  return (
    <>
      Name <input type="text" name="name"/>
      Age <input type="number" name="age"/>
      <input type="submit" value="Submit" />
    </>
  )
}
