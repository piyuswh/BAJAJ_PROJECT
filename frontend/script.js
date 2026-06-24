async function submitData() {

    const input = document
        .getElementById("input")
        .value;

    const data = input
        .split(",")
        .map(item => item.trim())
        .filter(item => item !== "");

    try {

        const response = await fetch(
            "http://localhost:8000/bfhl", {
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

        document
            .getElementById("result")
            .textContent =
            JSON.stringify(result, null, 2);

    } catch (error) {

        document
            .getElementById("result")
            .textContent =
            "API Error: " + error.message;
    }
}