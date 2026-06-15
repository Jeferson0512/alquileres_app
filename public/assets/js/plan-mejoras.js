const STORAGE_KEY = "planMejorasV1";

function loadState() {
    try {
        return JSON.parse(localStorage.getItem(STORAGE_KEY)) || {};
    } catch {
        return {};
    }
}

function saveState(state) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function updateProgress() {
    const checkboxes = document.querySelectorAll(".task-item input[type='checkbox']");
    const total = checkboxes.length;
    const done = document.querySelectorAll(".task-item input[type='checkbox']:checked").length;
    const pct = total ? Math.round((done / total) * 100) : 0;

    document.getElementById("progressFill").style.width = pct + "%";
    document.getElementById("progressText").textContent = `${done} de ${total} completados (${pct}%)`;
}

function init() {
    const state = loadState();
    const checkboxes = document.querySelectorAll(".task-item input[type='checkbox']");

    checkboxes.forEach(cb => {
        const id = cb.dataset.id;
        if (state[id]) {
            cb.checked = true;
            cb.closest(".task-item").classList.add("done");
        }

        cb.addEventListener("change", () => {
            const current = loadState();
            current[id] = cb.checked;
            saveState(current);
            cb.closest(".task-item").classList.toggle("done", cb.checked);
            updateProgress();
        });
    });

    updateProgress();
}

document.addEventListener("DOMContentLoaded", init);
