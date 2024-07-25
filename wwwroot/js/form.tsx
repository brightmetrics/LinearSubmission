import { createRoot } from "react-dom/client";
import { ReactElement } from "react";

const main = document.getElementById("form");
if (main) {
    const root = createRoot(main);
    root.render(createContent());
}

function createContent(): ReactElement {
    return <Form />
}

export function Form() {
    return <h1>Hello form</h1>;
}
