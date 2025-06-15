(function polyfill() {
  const relList = document.createElement("link").relList;
  if (relList && relList.supports && relList.supports("modulepreload")) {
    return;
  }
  for (const link of document.querySelectorAll('link[rel="modulepreload"]')) {
    processPreload(link);
  }
  new MutationObserver((mutations) => {
    for (const mutation of mutations) {
      if (mutation.type !== "childList") {
        continue;
      }
      for (const node of mutation.addedNodes) {
        if (node.tagName === "LINK" && node.rel === "modulepreload")
          processPreload(node);
      }
    }
  }).observe(document, { childList: true, subtree: true });
  function getFetchOpts(link) {
    const fetchOpts = {};
    if (link.integrity) fetchOpts.integrity = link.integrity;
    if (link.referrerPolicy) fetchOpts.referrerPolicy = link.referrerPolicy;
    if (link.crossOrigin === "use-credentials")
      fetchOpts.credentials = "include";
    else if (link.crossOrigin === "anonymous") fetchOpts.credentials = "omit";
    else fetchOpts.credentials = "same-origin";
    return fetchOpts;
  }
  function processPreload(link) {
    if (link.ep)
      return;
    link.ep = true;
    const fetchOpts = getFetchOpts(link);
    fetch(link.href, fetchOpts);
  }
})();
window.addEventListener("DOMContentLoaded", () => {
  const sheetId = "1ROazjZqlqZq4CPEY4Gb-TnH2iiN_Q9ytyw1GNl4Z214";
  const sheets = [
    {
      name: "Studenty",
      process: (rows) => rows.map((row) => {
        const firstThreeCells = row.c.slice(0, 3);
        return firstThreeCells.map((cell) => {
          const v = cell == null ? void 0 : cell.v;
          if (typeof v === "boolean") return v ? "подав" : "не подав";
          return v;
        });
      })
    },
    {
      name: "prihlaska",
      process: (rows) => {
        let lastNonEmptyFirstCol = "";
        return rows.slice(1).map((row) => {
          const firstFourCells = row.c.slice(0, 4).map((cell, colIndex) => {
            const v = (cell == null ? void 0 : cell.v) ?? "";
            if (colIndex === 0) {
              if (v === "") return lastNonEmptyFirstCol;
              lastNonEmptyFirstCol = v;
            }
            return v;
          });
          return firstFourCells;
        }).filter((row) => {
          return row.some((value) => value !== null && value !== "");
        });
      }
    },
    {
      name: "Doc",
      process: (rows) => {
        return rows.slice(1).map((row) => {
          const cells = row.c;
          return cells.map((cell, index) => {
            const v = (cell == null ? void 0 : cell.v) ?? "";
            if (index < 2) {
              return v;
            } else {
              return v !== "";
            }
          });
        }).filter((row) => {
          return row.some((value) => value !== null && value !== "");
        });
      }
    },
    {
      name: "MAIS",
      process: (rows) => {
        const universityList = ["TUKE", "STU", "UPJS", "UNIBA", "UKF", "UNIZA", "UNIPO", "TNUNI", "TUZVO", "UCM", "TRUNI", "UMB"];
        const mainArray = [];
        rows.forEach((row, indexR) => {
          if (!row || !row.c) return;
          row.c.forEach((el, index) => {
            const value = (el == null ? void 0 : el.v) ?? "";
            if (universityList.includes(value)) {
              const lastBlock = mainArray.findLast((b) => b.startCol === index);
              if (lastBlock) {
                lastBlock.finishRow = indexR;
              }
              mainArray.push({
                value,
                startRow: indexR,
                finishRow: rows.length,
                startCol: index,
                finishCol: index + 6
              });
            }
          });
        });
        const results = [];
        mainArray.forEach((block) => {
          const tempRows = [];
          for (let r = block.startRow; r < block.finishRow; r++) {
            const row = rows[r];
            if (!row || !row.c) continue;
            const sliced = row.c.slice(block.startCol, block.finishCol + 1).map((cell) => (cell == null ? void 0 : cell.v) ?? "");
            const isEmptyRow = sliced.every((val) => val === "");
            if (!isEmptyRow) {
              tempRows.push(sliced);
            }
          }
          const filteredCols = tempRows[0] ? tempRows[0].map((_, colIdx) => tempRows.some((row) => row[colIdx] !== "")) : [];
          const cleanedRows = tempRows.map(
            (row) => row.filter((_, colIdx) => filteredCols[colIdx])
          );
          const slicedRows = cleanedRows.slice(2);
          slicedRows.forEach((rowData, i) => {
            results.push({
              university: block.value,
              rowIndex: block.startRow + i + 2,
              // +2 щоб відповідало справжньому рядку
              values: rowData
            });
          });
        });
        return results;
      }
    }
  ];
  function fetchSheet(sheet) {
    const url = `https://docs.google.com/spreadsheets/d/${sheetId}/gviz/tq?tqx=out:json&sheet=${sheet.name}`;
    return fetch(url).then((res) => res.text()).then((text) => {
      const json = JSON.parse(text.substring(47).slice(0, -2));
      const rows = json.table.rows;
      const cols = json.table.cols;
      const data = sheet.process(rows, cols);
      return data;
    });
  }
  async function loadData() {
    const data = Promise.all(sheets.map((sheet) => fetchSheet(sheet))).then((allData) => {
      const dataBySheetName = sheets.reduce((acc, sheet, i) => {
        acc[sheet.name.toLocaleLowerCase()] = allData[i];
        return acc;
      }, {});
      return dataBySheetName;
    }).catch((err) => {
      console.error("Помилка при завантаженні:", err);
    });
    return data;
  }
  const input = document.querySelector(".input");
  loadData().then((data) => {
    input.addEventListener("input", (event) => {
      sortItems(data.studenty, input.value, input);
    });
  });
  let activeIndex = -1;
  let currentFiltered = [];
  function sortItems(items, searchValue, input2) {
    const commands = ["open", "data"];
    const fullList = [];
    items.forEach((student) => {
      commands.forEach((cmd) => {
        fullList.push(`${cmd}-${student[1].toLowerCase()}-${student[2].toLowerCase()}`);
      });
    });
    currentFiltered = fullList.filter(
      (item) => typeof item === "string" && item.toLowerCase().includes(searchValue)
    );
    if (input2.value.length === 0) {
      suggestionsList.innerHTML = "";
    }
    currentFiltered = currentFiltered.slice(0, 10);
    activeIndex = -1;
    renderSuggestions(input2);
  }
  function renderSuggestions(input2) {
    suggestionsList.innerHTML = "";
    if (input2.value.length === 0 || currentFiltered.length === 0) return;
    currentFiltered.forEach((item, i) => {
      const li = document.createElement("li");
      li.textContent = item;
      li.classList.toggle("active", i === activeIndex);
      li.addEventListener("click", () => {
        input2.value = item;
        suggestionsList.innerHTML = "";
      });
      suggestionsList.appendChild(li);
    });
  }
  document.addEventListener("keydown", (e) => {
    if (!currentFiltered.length) return;
    if (e.key === "ArrowDown") {
      activeIndex = (activeIndex + 1) % currentFiltered.length;
      renderSuggestions(input);
    } else if (e.key === "ArrowUp") {
      activeIndex = (activeIndex - 1 + currentFiltered.length) % currentFiltered.length;
      renderSuggestions(input);
    } else if (e.key === "Enter") {
      if (activeIndex >= 0 && currentFiltered[activeIndex]) {
        input.value = currentFiltered[activeIndex];
        suggestionsList.innerHTML = "";
        e.preventDefault();
      }
    }
  });
});
