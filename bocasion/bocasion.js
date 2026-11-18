
const excelInput = document.getElementById("excelFile");
const fileNameElement = document.getElementById("fileName");
const storeContainer = document.getElementById("storeContainer");
const resultsSection = document.getElementById("resultsSection");
const resultsInfo = document.getElementById("resultsInfo");
const emptyState = document.getElementById("emptyState");

let currentOrders = [];

excelInput.addEventListener("change", handleExcelUpload);

async function handleExcelUpload(event) {
    const file = event.target.files[0];

    if (!file) return;

    fileNameElement.textContent = "Procesando: " + file.name;

    if (!window.XLSX) {
        alert("No se pudo cargar el lector de Excel. Recarga la página e inténtalo nuevamente.");
        fileNameElement.textContent = "Error al cargar el lector de Excel";
        return;
    }

    try {
        const data = await file.arrayBuffer();
        const workbook = XLSX.read(data, { type: "array" });

        const firstSheet = workbook.Sheets[workbook.SheetNames[0]];

        const rows = XLSX.utils.sheet_to_json(firstSheet, {
            header: 1,
            defval: ""
        });

        if (rows.length < 2) {
            throw new Error("El archivo no contiene suficientes filas.");
        }

        processOrders(rows);

        fileNameElement.textContent = "Archivo cargado: " + file.name;

    } catch (error) {
        console.error(error);
        alert("No se pudo procesar el Excel: " + error.message);
        fileNameElement.textContent = "Error al procesar el archivo";
    }
}

function processOrders(rows) {
    // El formato esperado tiene PRODUCTO en la primera columna.
    const headerRow = rows.findIndex(row =>
        String(row[0] || "").trim().toUpperCase() === "PRODUCTO"
    );

    if (headerRow === -1) {
        throw new Error("No se encontró la columna PRODUCTO en el Excel.");
    }

    const headers = rows[headerRow].map(value => String(value || "").trim());

    const productColumn = headers.findIndex(header =>
        header.toUpperCase() === "PRODUCTO"
    );

    const storeColumns = headers
        .map((header, index) => ({ name: header, index }))
        .filter(column => column.index !== productColumn && column.name !== "");

    const stores = {};

    storeColumns.forEach(store => {
        stores[store.name] = [];
    });

    for (let rowIndex = headerRow + 1; rowIndex < rows.length; rowIndex++) {
        const row = rows[rowIndex];

        const product = String(row[productColumn] || "").trim();

        if (!product) continue;

        storeColumns.forEach(store => {
            const quantity = parseQuantity(row[store.index]);

            if (quantity > 0) {
                const price = findProductPrice(product);

                stores[store.name].push({
                    product,
                    quantity,
                    price
                });
            }
        });
    }

    currentOrders = Object.entries(stores)
        .filter(([store, products]) => products.length > 0)
        .map(([store, products]) => ({
            store,
            products
        }));

    renderOrders();
}

function parseQuantity(value) {
    if (typeof value === "number") {
        return Number.isFinite(value) && value > 0 ? value : 0;
    }

    const text = String(value || "").trim();

    if (!text) return 0;

    const normalized = text.replace(",", ".");
    const quantity = Number(normalized);

    return Number.isFinite(quantity) && quantity > 0 ? quantity : 0;
}

function renderOrders() {
    storeContainer.innerHTML = "";

    if (currentOrders.length === 0) {
        resultsSection.hidden = true;
        emptyState.hidden = false;
        alert("No se encontraron pedidos con cantidades mayores a cero.");
        return;
    }

    const totalProducts = currentOrders.reduce(
        (total, order) => total + order.products.length,
        0
    );

    resultsInfo.textContent =
        `${currentOrders.length} tiendas · ${totalProducts} productos solicitados`;

    currentOrders.forEach((order, index) => {
        const card = document.createElement("article");
        card.className = "store-card";

        const totalUnits = order.products.reduce(
            (total, product) => total + product.quantity,
            0
        );

        const header = document.createElement("div");
        header.className = "store-header";

        const title = document.createElement("div");

        const heading = document.createElement("h3");
        heading.textContent = order.store;

        const description = document.createElement("p");
        description.textContent =
            `${order.products.length} productos · ${totalUnits} unidades`;

        title.append(heading, description);

        const copyButton = document.createElement("button");
        copyButton.className = "copy-button";
        copyButton.textContent = "Copiar pedido";
        copyButton.type = "button";

        copyButton.addEventListener("click", () => {
            copyStoreOrder(index, copyButton);
        });

        header.append(title, copyButton);

        const tableWrapper = document.createElement("div");
        tableWrapper.className = "store-table-wrapper";

        const table = document.createElement("table");
        table.className = "store-table";

        const thead = document.createElement("thead");
        thead.innerHTML = `
            <tr>
                <th>Producto</th>
                <th>Cantidad</th>
                <th>Precio unitario</th>
            </tr>
        `;

        const tbody = document.createElement("tbody");

        order.products.forEach(product => {
            const tr = document.createElement("tr");

            const productCell = document.createElement("td");
            productCell.textContent = product.product;

            const quantityCell = document.createElement("td");
            quantityCell.textContent = product.quantity;

            const priceCell = document.createElement("td");

            if (product.price === null) {
                priceCell.textContent = "REVISAR";
                priceCell.className = "price-review";
            } else {
                priceCell.textContent = formatPrice(product.price);
                priceCell.className = "price";
            }

            tr.append(productCell, quantityCell, priceCell);
            tbody.appendChild(tr);
        });

        table.append(thead, tbody);
        tableWrapper.appendChild(table);

        card.append(header, tableWrapper);
        storeContainer.appendChild(card);
    });

    emptyState.hidden = true;
    resultsSection.hidden = false;
}

function formatPrice(price) {
    return "S/ " + Number(price).toFixed(2);
}

async function copyStoreOrder(index, button) {
    const order = currentOrders[index];

    if (!order) return;

    const lines = [
        "PRODUCTO\tCANTIDAD\tPRECIO UNITARIO"
    ];

    order.products.forEach(product => {
        const price = product.price === null
            ? "REVISAR"
            : formatPrice(product.price);

        lines.push(
            `${product.product}\t${product.quantity}\t${price}`
        );
    });

    const text = lines.join("\n");

    try {
        await navigator.clipboard.writeText(text);

        button.textContent = "¡Copiado!";

        setTimeout(() => {
            button.textContent = "Copiar pedido";
        }, 1800);

    } catch (error) {
        console.error(error);
        alert("No se pudo copiar automáticamente. Intenta abrir la página desde GitHub Pages.");
    }
}
