import { highlightSearchTerm } from "./highlight-search-term.js";

document.addEventListener("DOMContentLoaded", function () {
  const input = document.getElementById("bibsearch");
  if (!input) return;

  // actual bibsearch logic
  const filterItems = (searchTerm) => {
    searchTerm = searchTerm.toLowerCase().trim();
    document.querySelectorAll(".publications .unloaded").forEach((element) => element.classList.remove("unloaded"));

    // highlight-search-term
    if (typeof CSS !== "undefined" && CSS.highlights && typeof Highlight !== "undefined") {
      const nonMatchingElements = highlightSearchTerm({ search: searchTerm, selector: ".bibliography > li" });
      if (nonMatchingElements == null) {
        return;
      }
      nonMatchingElements.forEach((element) => {
        element.classList.add("unloaded");
      });
    } else {
      // Simply add unloaded class to all non-matching items if Browser does not support CSS highlights
      document.querySelectorAll(".bibliography > li").forEach((element) => {
        const text = element.innerText.toLowerCase();
        if (text.indexOf(searchTerm) == -1) {
          element.classList.add("unloaded");
        }
      });
    }

    document.querySelectorAll("h2.bibliography").forEach(function (element) {
      let iterator = element.nextElementSibling; // get next sibling element after h2, which can be h3 or ol
      let hideFirstGroupingElement = true;
      // iterate until next group element (h2), which is already selected by the querySelectorAll(-).forEach(-)
      while (iterator && iterator.tagName !== "H2") {
        if (iterator.tagName === "OL") {
          const ol = iterator;
          const unloadedSiblings = ol.querySelectorAll(":scope > li.unloaded");
          const totalSiblings = ol.querySelectorAll(":scope > li");

          if (unloadedSiblings.length === totalSiblings.length) {
            // Only hide a subgroup heading, never a preceding list with matching entries.
            const heading = ol.previousElementSibling;
            if (heading && /^H[3-6]$/.test(heading.tagName)) heading.classList.add("unloaded");
            ol.classList.add("unloaded"); // Add the '.unloaded' class to the OL itself
          } else {
            hideFirstGroupingElement = false; // there is at least some visible entry, don't hide the first grouping element
          }
        }
        iterator = iterator.nextElementSibling;
      }
      // Add unloaded class to first grouping element (e.g. year) if no item left in this group
      if (hideFirstGroupingElement) {
        element.classList.add("unloaded");
      }
    });
  };

  let timeoutId;
  const updateInputField = () => {
    clearTimeout(timeoutId);
    let hashValue = window.location.hash.substring(1);
    try {
      hashValue = decodeURIComponent(hashValue);
    } catch {
      // Keep malformed URL fragments searchable instead of stopping the script.
    }
    input.value = hashValue;
    filterItems(hashValue);
  };

  // Only start searching if there's been no input for 300 ms.
  input.addEventListener("input", function () {
    clearTimeout(timeoutId); // Clear the previous timeout
    const searchTerm = this.value;
    timeoutId = setTimeout(() => filterItems(searchTerm), 300);
  });

  window.addEventListener("hashchange", updateInputField); // Update the filter when the hash changes

  updateInputField(); // Update filter when page loads
});
