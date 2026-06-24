const express = require("express");
const cors = require("cors");

const app = express();

app.use(cors());
app.use(express.json());

app.post("/bfhl", (req, res) => {
    const { data } = req.body;

    if (!Array.isArray(data)) {
        return res.status(400).json({
            error: "data must be an array"
        });
    }

    const invalid_entries = [];
    const duplicate_edges = [];

    const graph = {};
    const childParent = {};
    const nodes = new Set();

    const seenEdges = new Set();
    const duplicateRecorded = new Set();

    for (let item of data) {
        item = String(item).trim();

        const regex = /^[A-Z]->[A-Z]$/;

        if (!regex.test(item)) {
            invalid_entries.push(item);
            continue;
        }

        const [parent, child] = item.split("->");

        if (parent === child) {
            invalid_entries.push(item);
            continue;
        }

        if (seenEdges.has(item)) {
            if (!duplicateRecorded.has(item)) {
                duplicate_edges.push(item);
                duplicateRecorded.add(item);
            }
            continue;
        }

        seenEdges.add(item);

        if (childParent[child]) {
            continue;
        }

        childParent[child] = parent;

        nodes.add(parent);
        nodes.add(child);

        if (!graph[parent]) graph[parent] = [];
        graph[parent].push(child);
    }

    const allNodes = [...nodes];
    const visitedGlobal = new Set();

    const hierarchies = [];

    let total_trees = 0;
    let total_cycles = 0;

    let largestDepth = 0;
    let largest_tree_root = "";

    function buildTree(node) {
        const obj = {};

        const children = graph[node] || [];

        for (const child of children) {
            obj[child] = buildTree(child);
        }

        return obj;
    }

    function depth(node) {
        const children = graph[node] || [];

        if (children.length === 0) return 1;

        let maxDepth = 0;

        for (const child of children) {
            maxDepth = Math.max(maxDepth, depth(child));
        }

        return maxDepth + 1;
    }

    function hasCycle(start) {
        const visited = new Set();
        const recStack = new Set();

        function dfs(node) {
            visited.add(node);
            recStack.add(node);

            const children = graph[node] || [];

            for (const child of children) {
                if (!visited.has(child)) {
                    if (dfs(child)) return true;
                } else if (recStack.has(child)) {
                    return true;
                }
            }

            recStack.delete(node);
            return false;
        }

        return dfs(start);
    }

    function collectComponent(start) {
        const component = [];

        const stack = [start];

        while (stack.length) {
            const node = stack.pop();

            if (visitedGlobal.has(node)) continue;

            visitedGlobal.add(node);
            component.push(node);

            const children = graph[node] || [];

            for (const child of children) {
                stack.push(child);
            }

            const parent = childParent[node];

            if (parent) stack.push(parent);
        }

        return component;
    }

    const roots = allNodes.filter(
        node => !Object.keys(childParent).includes(node)
    );

    const processedRoots = new Set();

    for (const root of roots) {
        processedRoots.add(root);

        const component = collectComponent(root);

        const cycle = hasCycle(root);

        if (cycle) {
            total_cycles++;

            hierarchies.push({
                root,
                tree: {},
                has_cycle: true
            });

            continue;
        }

        const d = depth(root);

        total_trees++;

        if (
            d > largestDepth ||
            (d === largestDepth &&
                (largest_tree_root === "" ||
                    root < largest_tree_root))
        ) {
            largestDepth = d;
            largest_tree_root = root;
        }

        hierarchies.push({
            root,
            tree: {
                [root]: buildTree(root)
            },
            depth: d
        });
    }

    for (const node of allNodes) {
        if (visitedGlobal.has(node)) continue;

        const component = collectComponent(node);

        const root = [...component].sort()[0];

        total_cycles++;

        hierarchies.push({
            root,
            tree: {},
            has_cycle: true
        });
    }

    res.json({
        user_id: "piyushsaxena_05092005",
        email_id: "piyush1376.be23@chitkarauniversity.edu.in",
        college_roll_number: "2311981376",
        hierarchies,
        invalid_entries,
        duplicate_edges,
        summary: {
            total_trees,
            total_cycles,
            largest_tree_root
        }
    });
});

const PORT = process.env.PORT || 8000;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});