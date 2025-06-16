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
let slideUp = (target, duration = 500, showmore = 0) => {
  if (!target.classList.contains("--slide")) {
    target.classList.add("--slide");
    target.style.transitionProperty = "height, margin, padding";
    target.style.transitionDuration = duration + "ms";
    target.style.height = `${target.offsetHeight}px`;
    target.offsetHeight;
    target.style.overflow = "hidden";
    target.style.height = showmore ? `${showmore}px` : `0px`;
    target.style.paddingTop = 0;
    target.style.paddingBottom = 0;
    target.style.marginTop = 0;
    target.style.marginBottom = 0;
    window.setTimeout(() => {
      target.hidden = !showmore ? true : false;
      !showmore ? target.style.removeProperty("height") : null;
      target.style.removeProperty("padding-top");
      target.style.removeProperty("padding-bottom");
      target.style.removeProperty("margin-top");
      target.style.removeProperty("margin-bottom");
      !showmore ? target.style.removeProperty("overflow") : null;
      target.style.removeProperty("transition-duration");
      target.style.removeProperty("transition-property");
      target.classList.remove("--slide");
      document.dispatchEvent(new CustomEvent("slideUpDone", {
        detail: {
          target
        }
      }));
    }, duration);
  }
};
let slideDown = (target, duration = 500, showmore = 0) => {
  if (!target.classList.contains("--slide")) {
    target.classList.add("--slide");
    target.hidden = target.hidden ? false : null;
    showmore ? target.style.removeProperty("height") : null;
    let height = target.offsetHeight;
    target.style.overflow = "hidden";
    target.style.height = showmore ? `${showmore}px` : `0px`;
    target.style.paddingTop = 0;
    target.style.paddingBottom = 0;
    target.style.marginTop = 0;
    target.style.marginBottom = 0;
    target.offsetHeight;
    target.style.transitionProperty = "height, margin, padding";
    target.style.transitionDuration = duration + "ms";
    target.style.height = height + "px";
    target.style.removeProperty("padding-top");
    target.style.removeProperty("padding-bottom");
    target.style.removeProperty("margin-top");
    target.style.removeProperty("margin-bottom");
    window.setTimeout(() => {
      target.style.removeProperty("height");
      target.style.removeProperty("overflow");
      target.style.removeProperty("transition-duration");
      target.style.removeProperty("transition-property");
      target.classList.remove("--slide");
      document.dispatchEvent(new CustomEvent("slideDownDone", {
        detail: {
          target
        }
      }));
    }, duration);
  }
};
let slideToggle = (target, duration = 500) => {
  if (target.hidden) {
    return slideDown(target, duration);
  } else {
    return slideUp(target, duration);
  }
};
function dataMediaQueries(array, dataSetValue) {
  const media = Array.from(array).filter((item) => item.dataset[dataSetValue]).map((item) => {
    const [value, type = "max"] = item.dataset[dataSetValue].split(",");
    return { value, type, item };
  });
  if (media.length === 0) return [];
  const breakpointsArray = media.map(({ value, type }) => `(${type}-width: ${value}px),${value},${type}`);
  const uniqueQueries = [...new Set(breakpointsArray)];
  return uniqueQueries.map((query) => {
    const [mediaQuery, mediaBreakpoint, mediaType] = query.split(",");
    const matchMedia = window.matchMedia(mediaQuery);
    const itemsArray = media.filter((item) => item.value === mediaBreakpoint && item.type === mediaType);
    return { itemsArray, matchMedia };
  });
}
function spollers() {
  const spollersArray = document.querySelectorAll("[data-fls-spollers]");
  if (spollersArray.length > 0) {
    let initSpollers2 = function(spollersArray2, matchMedia = false) {
      spollersArray2.forEach((spollersBlock) => {
        spollersBlock = matchMedia ? spollersBlock.item : spollersBlock;
        if (matchMedia.matches || !matchMedia) {
          spollersBlock.classList.add("--spoller-init");
          initSpollerBody2(spollersBlock);
        } else {
          spollersBlock.classList.remove("--spoller-init");
          initSpollerBody2(spollersBlock, false);
        }
      });
    }, initSpollerBody2 = function(spollersBlock, hideSpollerBody = true) {
      let spollerItems = spollersBlock.querySelectorAll("details");
      if (spollerItems.length) {
        spollerItems.forEach((spollerItem) => {
          let spollerTitle = spollerItem.querySelector("summary");
          if (hideSpollerBody) {
            spollerTitle.removeAttribute("tabindex");
            if (!spollerItem.hasAttribute("data-fls-spollers-open")) {
              spollerItem.open = false;
              spollerTitle.nextElementSibling.hidden = true;
            } else {
              spollerTitle.classList.add("--spoller-active");
              spollerItem.open = true;
            }
          } else {
            spollerTitle.setAttribute("tabindex", "-1");
            spollerTitle.classList.remove("--spoller-active");
            spollerItem.open = true;
            spollerTitle.nextElementSibling.hidden = false;
          }
        });
      }
    }, setSpollerAction2 = function(e) {
      const el = e.target;
      if (el.closest("summary") && el.closest("[data-fls-spollers]")) {
        e.preventDefault();
        if (el.closest("[data-fls-spollers]").classList.contains("--spoller-init")) {
          const spollerTitle = el.closest("summary");
          const spollerBlock = spollerTitle.closest("details");
          const spollersBlock = spollerTitle.closest("[data-fls-spollers]");
          const oneSpoller = spollersBlock.hasAttribute("data-fls-spollers-one");
          const scrollSpoller = spollerBlock.hasAttribute("data-fls-spollers-scroll");
          const spollerSpeed = spollersBlock.dataset.flsSpollersSpeed ? parseInt(spollersBlock.dataset.flsSpollersSpeed) : 500;
          if (!spollersBlock.querySelectorAll(".--slide").length) {
            if (oneSpoller && !spollerBlock.open) {
              hideSpollersBody2(spollersBlock);
            }
            !spollerBlock.open ? spollerBlock.open = true : setTimeout(() => {
              spollerBlock.open = false;
            }, spollerSpeed);
            spollerTitle.classList.toggle("--spoller-active");
            slideToggle(spollerTitle.nextElementSibling, spollerSpeed);
            if (scrollSpoller && spollerTitle.classList.contains("--spoller-active")) {
              const scrollSpollerValue = spollerBlock.dataset.flsSpollersScroll;
              const scrollSpollerOffset = +scrollSpollerValue ? +scrollSpollerValue : 0;
              const scrollSpollerNoHeader = spollerBlock.hasAttribute("data-fls-spollers-scroll-noheader") ? document.querySelector(".header").offsetHeight : 0;
              window.scrollTo(
                {
                  top: spollerBlock.offsetTop - (scrollSpollerOffset + scrollSpollerNoHeader),
                  behavior: "smooth"
                }
              );
            }
          }
        }
      }
      if (!el.closest("[data-fls-spollers]")) {
        const spollersClose = document.querySelectorAll("[data-fls-spollers-close]");
        if (spollersClose.length) {
          spollersClose.forEach((spollerClose) => {
            const spollersBlock = spollerClose.closest("[data-fls-spollers]");
            const spollerCloseBlock = spollerClose.parentNode;
            if (spollersBlock.classList.contains("--spoller-init")) {
              const spollerSpeed = spollersBlock.dataset.flsSpollersSpeed ? parseInt(spollersBlock.dataset.flsSpollersSpeed) : 500;
              spollerClose.classList.remove("--spoller-active");
              slideUp(spollerClose.nextElementSibling, spollerSpeed);
              setTimeout(() => {
                spollerCloseBlock.open = false;
              }, spollerSpeed);
            }
          });
        }
      }
    }, hideSpollersBody2 = function(spollersBlock) {
      const spollerActiveBlock = spollersBlock.querySelector("details[open]");
      if (spollerActiveBlock && !spollersBlock.querySelectorAll(".--slide").length) {
        const spollerActiveTitle = spollerActiveBlock.querySelector("summary");
        const spollerSpeed = spollersBlock.dataset.flsSpollersSpeed ? parseInt(spollersBlock.dataset.flsSpollersSpeed) : 500;
        spollerActiveTitle.classList.remove("--spoller-active");
        slideUp(spollerActiveTitle.nextElementSibling, spollerSpeed);
        setTimeout(() => {
          spollerActiveBlock.open = false;
        }, spollerSpeed);
      }
    };
    var initSpollers = initSpollers2, initSpollerBody = initSpollerBody2, setSpollerAction = setSpollerAction2, hideSpollersBody = hideSpollersBody2;
    document.addEventListener("click", setSpollerAction2);
    const spollersRegular = Array.from(spollersArray).filter(function(item, index, self) {
      return !item.dataset.flsSpollers.split(",")[0];
    });
    if (spollersRegular.length) {
      initSpollers2(spollersRegular);
    }
    let mdQueriesArray = dataMediaQueries(spollersArray, "flsSpollers");
    if (mdQueriesArray && mdQueriesArray.length) {
      mdQueriesArray.forEach((mdQueriesItem) => {
        mdQueriesItem.matchMedia.addEventListener("change", function() {
          initSpollers2(mdQueriesItem.itemsArray, mdQueriesItem.matchMedia);
        });
        initSpollers2(mdQueriesItem.itemsArray, mdQueriesItem.matchMedia);
      });
    }
  }
}
window.addEventListener("load", spollers);
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
    window.data = JSON.stringify(data);
    let activeIndex = -1;
    let currentFiltered = [];
    function sortItems(items, searchValue, input2) {
      const commands = ["open", "open-e"];
      const fullList = ["data"];
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
        li.classList.add("find-item");
        li.textContent = item;
        li.classList.toggle("active", i === activeIndex);
        li.addEventListener("click", () => {
          input2.value = item;
          suggestionsList.innerHTML = "";
          stat(input2.value, data);
        });
        suggestionsList.appendChild(li);
      });
    }
    document.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        stat(input.value, data);
        setTimeout(() => {
          input.value = "";
          suggestionsList.innerHTML = "";
        }, 500);
      }
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
    function stat(value, data2) {
      if (value === "data") {
        const universityMap = {};
        data2.mais.forEach((item) => {
          const university = item.university;
          const fullName = item.values[0];
          const intrakValue = item.values[4];
          const zapisValue = item.values[5];
          if (!university) return;
          if (!universityMap[university]) {
            universityMap[university] = {
              university,
              total: 0,
              intrak: [],
              zapis: []
            };
          }
          universityMap[university].total += 1;
          if (intrakValue !== "Подав") {
            universityMap[university].intrak.push(fullName);
          }
          if (zapisValue !== "Подав") {
            universityMap[university].zapis.push(fullName);
          }
        });
        const finalResult = Object.values(universityMap);
        renderInfo(finalResult);
      }
    }
    function renderInfo(datalocal, name) {
      {
        const containerInfo = document.querySelector(".info");
        containerInfo.innerHTML = "";
        const title = document.createElement("h3");
        title.classList.add("info__title");
        title.textContent = "Статистика";
        containerInfo.appendChild(title);
        const subTitle = document.createElement("h4");
        subTitle.classList.add("info__subtitle");
        subTitle.textContent = `Всього подано студентів: ${datalocal.reduce((acc, item) => acc + item.total, 0)}, підписаних студентів: ${data.studenty.length}`;
        containerInfo.appendChild(subTitle);
        const items = document.createElement("div");
        items.classList.add("info__items");
        containerInfo.appendChild(items);
        datalocal.forEach((item) => {
          const card = document.createElement("div");
          card.classList.add("info__card");
          const title2 = document.createElement("h5");
          title2.classList.add("info__card-title");
          title2.textContent = `${item.university} : ${item.total} студент`;
          card.appendChild(title2);
          const div = document.createElement("div");
          div.classList.add("spollers");
          div.setAttribute("data-fls-spollers", "");
          for (const key of ["zapis", "intrak"]) {
            if (item[key].length > 0) {
              const details = document.createElement("details");
              details.classList.add("spollers__item");
              const summary = document.createElement("summary");
              summary.classList.add("spollers__title");
              summary.textContent = `Не подані ${key}: ${item[key].length}`;
              details.appendChild(summary);
              const spollersBody = document.createElement("div");
              spollersBody.classList.add("spollers__body");
              item[key].forEach((el) => {
                const spollersStudent = document.createElement("p");
                spollersStudent.classList.add("spollers__student");
                spollersStudent.textContent = el;
                spollersBody.appendChild(spollersStudent);
              });
              details.appendChild(spollersBody);
              div.appendChild(details);
            }
          }
          card.appendChild(div);
          items.appendChild(card);
        });
        const subTitle2 = document.createElement("h4");
        subTitle2.classList.add("info__subtitle");
        subTitle2.textContent = `Cтуденти, якіх немає в MAIS/AIS`;
        containerInfo.appendChild(subTitle2);
        const capitalize = (word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
        const formatName = (surname, name2) => {
          return `${capitalize(surname)} ${capitalize(name2)}`;
        };
        const normalizeName = (surname, name2) => {
          return [surname, name2].map((p) => p.trim().toLowerCase()).sort().join(" ");
        };
        const allStudents = data.studenty.map((arr) => ({
          normalized: normalizeName(arr[1], arr[2]),
          display: formatName(arr[1], arr[2])
        }));
        const nameToUniversities = {};
        data.mais.forEach((item) => {
          const raw = item.values[0];
          const university = item.university;
          if (!raw || !university) return;
          const parts = raw.trim().toLowerCase().split(/\s+/);
          if (parts.length < 2) return;
          const normalized = normalizeName(parts[0], parts[1]);
          const displayName = formatName(parts[0], parts[1]);
          if (!nameToUniversities[normalized]) {
            nameToUniversities[normalized] = {
              display: displayName,
              universities: /* @__PURE__ */ new Set()
            };
          }
          nameToUniversities[normalized].universities.add(university);
        });
        const multipleUniStudents = [];
        for (const [_, info] of Object.entries(nameToUniversities)) {
          if (info.universities.size >= 2) {
            multipleUniStudents.push({
              name: info.display,
              universities: Array.from(info.universities)
            });
          }
        }
        const allMaisNames = Object.keys(nameToUniversities);
        const notSubmittedStudents = allStudents.filter((stud) => !allMaisNames.includes(stud.normalized)).map((stud) => stud.display);
        notSubmittedStudents.forEach((name2) => {
          const studentNoneUniky = document.createElement("p");
          studentNoneUniky.classList.add("info__text");
          studentNoneUniky.textContent = name2;
          containerInfo.appendChild(studentNoneUniky);
        });
        const subTitle3 = document.createElement("h4");
        subTitle3.classList.add("info__subtitle");
        subTitle3.textContent = `Cтуденти, які подалися в 2+ університети`;
        containerInfo.appendChild(subTitle3);
        multipleUniStudents.forEach((name2) => {
          const studentManyUniky = document.createElement("p");
          studentManyUniky.classList.add("info__text");
          studentManyUniky.textContent = `${name2.name}: ${name2.universities.join(", ")}`;
          containerInfo.appendChild(studentManyUniky);
        });
        spollers();
      }
    }
    input.addEventListener("input", (event) => {
      sortItems(data.studenty, input.value, input);
    });
  });
});
