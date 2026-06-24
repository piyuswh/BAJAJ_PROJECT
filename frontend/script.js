async function submitData() {

    const input = document
        .getElementById("input")
        .value
        .trim();

    if (!input) {
        alert("Please enter relationships");
        return;
    }

    const data = input
        .split(",")
        .map(item => item.trim())
        .filter(item => item);

    try {

        const response = await fetch(
            "https://bajaj-project-max0.onrender.com/bfhl", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ data })
            }
        );

        if (!response.ok) {
            throw new Error("Server Error");
        }

        const result = await response.json();

        renderSummary(result.summary);
        renderHierarchies(result.hierarchies);
        renderErrors(
            result.invalid_entries,
            result.duplicate_edges
        );

    } catch (error) {

        document.getElementById("summary").innerHTML = `
            <div class="summary-card">
                <h3>Error</h3>
                <p style="font-size:16px;color:red;">
                    ${error.message}
                </p>
            </div>
        `;

        document.getElementById("hierarchies").innerHTML = "";
        document.getElementById("errors").innerHTML = "";

        console.error(error);
    }
}

function renderSummary(summary) {

    document.getElementById("summary").innerHTML = `
        <div class="summary-card">
            <h3>Total Trees</h3>
            <p>${summary.total_trees}</p>
        </div>

        <div class="summary-card">
            <h3>Total Cycles</h3>
            <p>${summary.total_cycles}</p>
        </div>

        <div class="summary-card">
            <h3>Largest Root</h3>
            <p>${summary.largest_tree_root || "-"}</p>
        </div>
    `;
}

function renderHierarchies(hierarchies) {

    const container =
        document.getElementById("hierarchies");

    container.innerHTML = "";

    hierarchies.forEach(item => {

                const card = document.createElement("div");

                card.className = "hierarchy-card";

                card.innerHTML = `
            <div class="hierarchy-header">

                <h3>Root Node: ${item.root}</h3>

                <span class="badge ${
                    item.has_cycle
                        ? "cycle-badge"
                        : "tree-badge"
                }">
                    ${
                        item.has_cycle
                        ? "Cycle"
                        : `Depth ${item.depth}`
                    }
                </span>

            </div>

            <div class="tree-visual">
                <pre>${JSON.stringify(
                    item.tree,
                    null,
                    2
                )}</pre>
            </div>
        `;

        container.appendChild(card);
    });
}

function renderErrors(
    invalidEntries,
    duplicateEdges
) {

    let html = "";

    if (invalidEntries.length > 0) {

        html += `
            <div class="error-card">
                <h3>Invalid Entries</h3>

                <ul class="error-list">
                    ${invalidEntries
                        .map(
                            item =>
                                `<li>❌ ${item}</li>`
                        )
                        .join("")}
                </ul>

            </div>
        `;
    }

    if (duplicateEdges.length > 0) {

        html += `
            <div class="error-card">
                <h3>Duplicate Edges</h3>

                <ul class="error-list duplicate-list">
                    ${duplicateEdges
                        .map(
                            item =>
                                `<li>⚠️ ${item}</li>`
                        )
                        .join("")}
                </ul>

            </div>
        `;
    }

    document.getElementById("errors").innerHTML = html;
}