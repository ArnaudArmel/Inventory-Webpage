
const tableBody = document.getElementById("productTableBody");
const loadingMessage = document.getElementById("loadingMessage");
const errorMessage = document.getElementById("errorMessage");
const resultsMessage = document.getElementById("resultsMessage");

const searchInput = document.getElementById("searchInput");
const categoryFilter = document.getElementById("categoryFilter");
const stockFilter = document.getElementById("stockFilter");
const clearButton = document.getElementById("clearButton");
const storageKey = "inventoryFilters";
const previousButton = document.getElementById("previousButton");
const nextButton = document.getElementById("nextButton");
const pageInfo = document.getElementById("pageInfo");

const productPerPageSelect =
    document.getElementById("productPerPageSelect");

let allProducts = [];
let currentPage = 1;
let productsPerPage = 5;

// Retrieve product data
async function loadProducts() {
    try {
        const response = await fetch("products.json");

        if (!response.ok) {
            throw new Error("Could not load products.json");
        }

        const products = await response.json();

       
allProducts = products;

populateCategories(allProducts);
restoreFilters();
applyFilters();

loadingMessage.hidden = true;

    } catch (error) {
        loadingMessage.hidden = true;
        errorMessage.textContent =
            "Unable to load products. Please check your files and try again.";
        errorMessage.hidden = false;

        console.error(error);
    }
}

// Add categories to the dropdown
function populateCategories(products) {
    const categories = [];

    products.forEach(function(product) {
        if (!categories.includes(product.category)) {
            categories.push(product.category);
        }
    });

    categories.sort();

    categories.forEach(function(category) {
        const option = document.createElement("option");

        option.value = category;
        option.textContent = category;

        categoryFilter.appendChild(option);
    });
}

// Filter products


function saveFilters() {
    const filters = {
        search: searchInput.value,
        category: categoryFilter.value,
        inStock: stockFilter.checked
    };

    sessionStorage.setItem(storageKey, JSON.stringify(filters));
}


function restoreFilters() {
    const savedFilters = sessionStorage.getItem(storageKey);

    if (savedFilters) {
        const filters = JSON.parse(savedFilters);

        searchInput.value = filters.search || "";
        categoryFilter.value = filters.category || "all";
        stockFilter.checked = filters.inStock === true;
    }
}


function applyFilters() {
    currentPage = 1;
    saveFilters();
    displayProducts(getFilteredProducts());
}


// Display products in the table

function displayProducts(products) {
    tableBody.innerHTML = "";

    const totalPages = Math.ceil(products.length / productsPerPage);

    if (totalPages === 0) {
        currentPage = 0;
    } else if (currentPage < 1) {
        currentPage = 1;
    } else if (currentPage > totalPages) {
        currentPage = totalPages;
    }

    const startIndex = (currentPage - 1) * productsPerPage;
    const endIndex = startIndex + productsPerPage;

    const productsToDisplay = products.slice(startIndex, endIndex);

    productsToDisplay.forEach(function(product) {
        const row = document.createElement("tr");

        row.innerHTML = `
            <td>
                <img src="${product.image}"
                     alt="${product.name}"
                     width="60">
            </td>
            <td>${product.name}</td>
            <td>${product.category}</td>
            <td>${product.price.toLocaleString("en-CA", {
                style: "currency",
                currency: "CAD"
            })}</td>
            <td>${product.stock}</td>
            <td>${product.unit}</td>
        `;

        tableBody.appendChild(row);
    });

    if (products.length === 0) {
        resultsMessage.textContent = "No products match your filters.";
    } else {
        resultsMessage.textContent =
            "Total matching products: " + products.length;
    }

    if (totalPages === 0) {
        pageInfo.textContent = "Page 0 of 0";
    } else {
        pageInfo.textContent =
            "Page " + currentPage + " of " + totalPages;
    }

    previousButton.disabled = currentPage <= 1;
    nextButton.disabled = currentPage === 0 || currentPage >= totalPages;
}


// React to filter changes
searchInput.addEventListener("input", applyFilters);
categoryFilter.addEventListener("change", applyFilters);
stockFilter.addEventListener("change", applyFilters);
productPerPageSelect.addEventListener("change", function() {
    productsPerPage = Number(productPerPageSelect.value);
    currentPage = 1;
    displayProducts(getFilteredProducts());
});

clearButton.addEventListener("click", function() {
    searchInput.value = "";
    categoryFilter.value = "all";
    stockFilter.checked = false;

    currentPage = 1;
    displayProducts(getFilteredProducts());

    sessionStorage.removeItem(storageKey);
});



function getFilteredProducts() {
    const searchText = searchInput.value.toLowerCase().trim();
    const selectedCategory = categoryFilter.value;
    const onlyInStock = stockFilter.checked;

    return allProducts.filter(function(product) {
        const matchesName = product.name
            .toLowerCase()
            .includes(searchText);

        const matchesCategory =
            selectedCategory === "all" ||
            product.category === selectedCategory;

        const matchesStock =
            !onlyInStock || product.stock > 0;

        return matchesName && matchesCategory && matchesStock;
    });
}


previousButton.addEventListener("click", function() {
    currentPage--;
    displayProducts(getFilteredProducts());
});

nextButton.addEventListener("click", function() {
    currentPage++;
    displayProducts(getFilteredProducts());
});


// Start the application
loadProducts();
