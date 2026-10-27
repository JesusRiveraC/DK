
document.addEventListener("DOMContentLoaded", () => {
  const fileInput = document.getElementById("excelFile");

  // La página principal no tiene controles de Excel.
  if (!fileInput) return;

  const fileName = document.getElementById("fileName");
  const uploadStatus = document.getElementById("uploadStatus");
  const previewSection = document.getElementById("previewSection");
  const sheetTitle = document.getElementById("sheetTitle");
  const rowCount = document.getElementById("rowCount");
  const table = document.getElementById("excelTable");
  const clearButton = document.getElementById("clearFile");

  fileInput.addEventListener("change", async () => {
    const file = fileInput.files[0];

    if (!file) return;

    const extension = file.name.split(".").pop().toLowerCase();

    if (!["xlsx", "xls"].includes(extension)) {
      showError("Selecciona un archivo Excel .xlsx o .xls.");
      return;
    }

    if (typeof XLSX === "undefined") {
      showError(
        "No se pudo cargar el lector de Excel. " +
        "Comprueba tu conexión a Internet y recarga la página."
      );
      return;
    }

    fileName.textContent = "Archivo seleccionado: " + file.name;
    uploadStatus.textContent = "Leyendo archivo...";
    uploadStatus.className = "upload-status";
    previewSection.hidden = true;

    try {
      const buffer = await file.arrayBuffer();

      const workbook = XLSX.read(buffer, {
        type: "array",
        cellDates: true
      });

      if (!workbook.SheetNames.length) {
        throw new Error("El archivo no contiene hojas.");
      }

      const firstSheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[firstSheetName];

      const rows = XLSX.utils.sheet_to_json(worksheet, {
        header: 1,
        defval: "",
        raw: false
      });

      if (!rows.length) {
        throw new Error("La primera hoja está vacía.");
      }

      renderTable(rows);

      sheetTitle.textContent = firstSheetName;

      const columnCount = Math.max(
        0,
        ...rows.map(row => row.length)
      );

      rowCount.textContent =
        `Filas encontradas: ${rows.length}. ` +
        `Columnas encontradas: ${columnCount}.`;

      previewSection.hidden = false;
      uploadStatus.textContent = "Excel cargado correctamente.";
      uploadStatus.className = "upload-status success";

    } catch (error) {
      console.error("Error al leer el Excel:", error);
      showError(
        error.message || "No se pudo leer el archivo seleccionado."
      );
    }
  });

  function renderTable(rows) {
    const thead = table.querySelector("thead");
    const tbody = table.querySelector("tbody");

    thead.replaceChildren();
    tbody.replaceChildren();

    const columnCount = Math.max(
      0,
      ...rows.map(row => row.length)
    );

    const headerRow = document.createElement("tr");

    for (let column = 0; column < columnCount; column++) {
      const th = document.createElement("th");
      th.textContent = rows[0][column] ?? "";
      headerRow.appendChild(th);
    }

    thead.appendChild(headerRow);

    rows.slice(1, 101).forEach(row => {
      const tr = document.createElement("tr");

      for (let column = 0; column < columnCount; column++) {
        const td = document.createElement("td");
        td.textContent = row[column] ?? "";
        tr.appendChild(td);
      }

      tbody.appendChild(tr);
    });
  }

  function showError(message) {
    uploadStatus.textContent = message;
    uploadStatus.className = "upload-status error";
    previewSection.hidden = true;
  }

  clearButton.addEventListener("click", () => {
    fileInput.value = "";
    fileName.textContent = "Formatos permitidos: .xlsx y .xls";
    uploadStatus.textContent = "";
    uploadStatus.className = "upload-status";

    previewSection.hidden = true;
    table.querySelector("thead").replaceChildren();
    table.querySelector("tbody").replaceChildren();
  });
});
