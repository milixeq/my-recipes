// Конфигурация
const CONFIG = {
    PASSWORD: "mili36",
    STORAGE_KEY: "mili-recipes"
};

// DOM элементы
const elements = {
    // Главная страница
    recipesGrid: document.getElementById("recipesGrid"),
    searchInput: document.getElementById("searchInput"),
    searchBtn: document.getElementById("searchBtn"),
    addRecipeBtn: document.getElementById("addRecipeBtn"),
    
    // Модальное окно
    passwordModal: document.getElementById("passwordModal"),
    passwordInput: document.getElementById("passwordInput"),
    confirmPassword: document.getElementById("confirmPassword"),
    passwordError: document.getElementById("passwordError"),
    closeModal: document.querySelector(".close"),
    
    // Страница рецепта
    recipeTitle: document.getElementById("recipeTitle"),
    ingredientsList: document.getElementById("ingredientsList"),
    instructionsList: document.getElementById("instructionsList"),
    editRecipeBtn: document.getElementById("editRecipeBtn"),
    recipeViewMode: document.getElementById("recipeViewMode"),
    
    // Режим редактирования
    recipeEditMode: document.getElementById("recipeEditMode"),
    editRecipeName: document.getElementById("editRecipeName"),
    editRecipeIngredients: document.getElementById("editRecipeIngredients"),
    editRecipeInstructions: document.getElementById("editRecipeInstructions"),
    saveChangesBtn: document.getElementById("saveChangesBtn"),
    cancelEditBtn: document.getElementById("cancelEditBtn")
};

// Текущее состояние
let state = {
    recipes: [],
    currentRecipeId: null,
    passwordCallback: null,
    isEditMode: false
};

// Инициализация приложения
document.addEventListener("DOMContentLoaded", () => {
    initApp();
});

function initApp() {
    loadRecipes();
    setupEventListeners();
    
    if (window.location.pathname.includes("recipe.html")) {
        loadRecipePage();
    }
}

// ======================
// Основные функции
// ======================

function loadRecipes() {
    const savedRecipes = localStorage.getItem(CONFIG.STORAGE_KEY);
    state.recipes = savedRecipes ? JSON.parse(savedRecipes) : [
        {
            id: 1,
            title: "Блинчики",
            ingredients: "Мука - 200 г\nЯйца - 2 шт.\nМолоко - 300 мл",
            instructions: "1. Смешать ингредиенты\n2. Жарить на сковороде\n3. Подавать с джемом"
        }
    ];
    
    if (elements.recipesGrid) {
        renderRecipes();
    }
}

function renderRecipes() {
    elements.recipesGrid.innerHTML = state.recipes.map(recipe => `
        <div class="recipe-card" onclick="openRecipe(${recipe.id})">
            <h3>${recipe.title}</h3>
            <p>${recipe.ingredients.split("\n")[0]}...</p>
        </div>
    `).join("");
}

function openRecipe(id) {
    window.location.href = `recipe.html?id=${id}`;
}

function loadRecipePage() {
    const recipeId = parseInt(new URLSearchParams(window.location.search).get("id"));
    const recipe = state.recipes.find(r => r.id === recipeId);
    
    if (!recipe) {
        window.location.href = "index.html";
        return;
    }
    
    state.currentRecipeId = recipeId;
    
    elements.recipeTitle.textContent = recipe.title;
    elements.ingredientsList.innerHTML = recipe.ingredients.split("\n").map(i => `<li>${i}</li>`).join("");
    elements.instructionsList.innerHTML = recipe.instructions.split("\n").map(s => `<li>${s}</li>`).join("");
}

function enableEditMode() {
    const recipe = state.recipes.find(r => r.id === state.currentRecipeId);
    
    elements.editRecipeName.value = recipe.title;
    elements.editRecipeIngredients.value = recipe.ingredients;
    elements.editRecipeInstructions.value = recipe.instructions;
    
    elements.recipeViewMode.style.display = "none";
    elements.recipeEditMode.style.display = "block";
    state.isEditMode = true;
}

function disableEditMode() {
    elements.recipeViewMode.style.display = "block";
    elements.recipeEditMode.style.display = "none";
    state.isEditMode = false;
}

function saveRecipeChanges() {
    const title = elements.editRecipeName.value.trim();
    const ingredients = elements.editRecipeIngredients.value.trim();
    const instructions = elements.editRecipeInstructions.value.trim();
    
    if (!title || !ingredients || !instructions) {
        alert("Заполните все поля!");
        return;
    }
    
    const recipeIndex = state.recipes.findIndex(r => r.id === state.currentRecipeId);
    state.recipes[recipeIndex] = {
        ...state.recipes[recipeIndex],
        title,
        ingredients,
        instructions
    };
    
    localStorage.setItem(CONFIG.STORAGE_KEY, JSON.stringify(state.recipes));
    loadRecipePage();
    disableEditMode();
}

function showPasswordModal(callback) {
    state.passwordCallback = callback;
    elements.passwordModal.style.display = "flex";
    elements.passwordInput.value = "";
    elements.passwordError.textContent = "";
}

function hidePasswordModal() {
    elements.passwordModal.style.display = "none";
}

function checkPassword() {
    if (elements.passwordInput.value === CONFIG.PASSWORD) {
        hidePasswordModal();
        state.passwordCallback();
    } else {
        elements.passwordError.textContent = "Неверный пароль!";
    }
}

function searchRecipes() {
    const term = elements.searchInput.value.toLowerCase();
    const filtered = state.recipes.filter(recipe => 
        recipe.title.toLowerCase().includes(term) ||
        recipe.ingredients.toLowerCase().includes(term)
    );
    
    elements.recipesGrid.innerHTML = filtered.map(recipe => `
        <div class="recipe-card" onclick="openRecipe(${recipe.id})">
            <h3>${recipe.title}</h3>
            <p>${recipe.ingredients.split("\n")[0]}...</p>
        </div>
    `).join("");
}

function setupEventListeners() {
    // Главная страница
    if (elements.addRecipeBtn) {
        elements.addRecipeBtn.addEventListener("click", () => {
            showPasswordModal(() => {
                const newId = Date.now();
                state.recipes.push({
                    id: newId,
                    title: "Новый рецепт",
                    ingredients: "",
                    instructions: ""
                });
                localStorage.setItem(CONFIG.STORAGE_KEY, JSON.stringify(state.recipes));
                openRecipe(newId);
                setTimeout(enableEditMode, 100);
            });
        });
    }
    
    if (elements.searchBtn) {
        elements.searchBtn.addEventListener("click", searchRecipes);
        elements.searchInput.addEventListener("keypress", (e) => {
            if (e.key === "Enter") searchRecipes();
        });
    }
    
    // Страница рецепта
    if (elements.editRecipeBtn) {
        elements.editRecipeBtn.addEventListener("click", () => {
            showPasswordModal(enableEditMode);
        });
    }
    
    if (elements.saveChangesBtn) {
        elements.saveChangesBtn.addEventListener("click", saveRecipeChanges);
    }
    
    if (elements.cancelEditBtn) {
        elements.cancelEditBtn.addEventListener("click", disableEditMode);
    }
    
    // Модальное окно
    if (elements.confirmPassword) {
        elements.confirmPassword.addEventListener("click", checkPassword);
    }
    
    if (elements.closeModal) {
        elements.closeModal.addEventListener("click", hidePasswordModal);
    }
    
    window.addEventListener("click", (e) => {
        if (e.target === elements.passwordModal) {
            hidePasswordModal();
        }
    });
}

// Глобальные функции
window.openRecipe = openRecipe;
