// Shows how many beforeinput, input and change events each field with a
// `data-log` attribute has received, so you can confirm the page saw an edit.
for (const field of document.querySelectorAll("[data-log]")) {
  const counts = { beforeinput: 0, input: 0, change: 0 };
  const output = document.createElement("div");
  output.className = "log";
  const render = () => {
    output.textContent = Object.entries(counts)
      .map(([type, count]) => `${type}: ${count}`)
      .join("   ");
  };
  for (const type of Object.keys(counts)) {
    field.addEventListener(type, () => {
      counts[type]++;
      render();
    });
  }
  render();
  field.after(output);
}
