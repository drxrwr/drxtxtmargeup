const dropzone = document.getElementById("dropzone");
const fileInput = document.getElementById("fileInput");
const chooseFilesBtn = document.getElementById("chooseFiles");
const fileListEl = document.getElementById("fileList");
const totalCountEl = document.getElementById("totalCount");
const downloadBtn = document.getElementById("downloadBtn");
const outputNameInput = document.getElementById("outputName");

let filesData = [];

// Handle pilih file lewat tombol
chooseFilesBtn.addEventListener("click", () => fileInput.click());

// Handle file input
fileInput.addEventListener("change", (e) => handleFiles(e.target.files));

// Handle drag & drop
dropzone.addEventListener("dragover", (e) => {
  e.preventDefault();
  dropzone.classList.add("dragover");
});
dropzone.addEventListener("dragleave", () => dropzone.classList.remove("dragover"));
dropzone.addEventListener("drop", (e) => {
  e.preventDefault();
  dropzone.classList.remove("dragover");
  handleFiles(e.dataTransfer.files);
});

// Baca file TXT
function handleFiles(selectedFiles) {
  Array.from(selectedFiles).forEach((file) => {
    if (file.name.endsWith(".txt")) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target.result.split(/\r?\n/).filter(line => line.trim() !== "");
        filesData.push({ name: file.name, content });
        renderFileList();
      };
      reader.readAsText(file);
    }
  });
}

// Render daftar file
function renderFileList() {
  fileListEl.innerHTML = "";
  let total = 0;

  filesData.forEach((file, index) => {
    total += file.content.length;
    const li = document.createElement("li");
    li.draggable = true;
    li.dataset.index = index;
    li.innerHTML = `<span>${file.name} (${file.content.length} baris)</span>`;
    fileListEl.appendChild(li);
  });

  totalCountEl.textContent = `Total nomor: ${total}`;
  initDragAndDrop();
}

// Drag & Drop reorder
function initDragAndDrop() {
  const listItems = document.querySelectorAll(".file-list li");

  listItems.forEach((li) => {
    li.addEventListener("dragstart", () => {
      li.classList.add("dragging");
    });
    li.addEventListener("dragend", () => {
      li.classList.remove("dragging");
      updateOrder();
    });
  });

  fileListEl.addEventListener("dragover", (e) => {
    e.preventDefault();
    const dragging = document.querySelector(".dragging");
    const afterElement = getDragAfterElement(fileListEl, e.clientY);
    if (afterElement == null) {
      fileListEl.appendChild(dragging);
    } else {
      fileListEl.insertBefore(dragging, afterElement);
    }
  });
}

function getDragAfterElement(container, y) {
  const draggableElements = [...container.querySelectorAll("li:not(.dragging)")];
  return draggableElements.reduce((closest, child) => {
    const box = child.getBoundingClientRect();
    const offset = y - box.top - box.height / 2;
    if (offset < 0 && offset > closest.offset) {
      return { offset: offset, element: child };
    } else {
      return closest;
    }
  }, { offset: Number.NEGATIVE_INFINITY }).element;
}

// Update order filesData setelah drag & drop
function updateOrder() {
  const newOrder = [];
  document.querySelectorAll(".file-list li").forEach((li) => {
    const index = li.dataset.index;
    newOrder.push(filesData[index]);
  });
  filesData = newOrder;
}

// Download gabungan
downloadBtn.addEventListener("click", () => {
  if (filesData.length === 0) {
    alert("Upload file dulu!");
    return;
  }

  let merged = [];
  filesData.forEach(file => {
    merged = merged.concat(file.content);
  });

  const blob = new Blob([merged.join("\n")], { type: "text/plain" });
  const url = URL.createObjectURL(blob);

  let filename = outputNameInput.value.trim();
  if (!filename) {
    filename = `${merged.length}.txt`;
  } else if (!filename.endsWith(".txt")) {
    filename += ".txt";
  }

  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
});
