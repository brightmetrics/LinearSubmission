import { createRoot } from 'react-dom/client';

if (CURRENT_PAGE === "index") {
    const id: string = "app";
    // Clear the existing HTML content
    document.body.innerHTML = `<div id="${id}"></div>`;

    // Render your React component instead

    const root = createRoot(document.getElementById(id)!);
    root.render(<h1>Hello, world</h1>);
}
