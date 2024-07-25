import { createRoot } from "react-dom/client";
import { ReactElement } from "react";

const main = document.getElementById("index");
if (main) {
    const root = createRoot(main);
    root.render(createContent());
}

function createContent(): ReactElement {
    return <h1>Hello, world</h1>;
}
