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
    
    // Страница рецепта (режим просмотра)
    recipeTitle: document.getElementById("recipeTitle"),
    recipeImageContainer: document.getElementById("recipeImageContainer"),
    recipeImage: document.getElementById("recipeImage"),
    ingredientsList: document.getElementById("ingredientsList"),
    instructionsList: document.getElementById("instructionsList"),
    editRecipeBtn: document.getElementById("editRecipeBtn"),
    recipeViewMode: document.getElementById("recipeViewMode"),
    
    // Режим редактирования
    recipeEditMode: document.getElementById("recipeEditMode"),
    editRecipeName: document.getElementById("editRecipeName"),
    editRecipeImage: document.getElementById("editRecipeImage"),
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
    
    // Если это страница рецепта - загружаем данные
    if (window.location.pathname.includes("recipe.html")) {
        loadRecipePage();
    }
}

// ======================
// Основные функции
// ======================

function loadRecipes() {
    state.recipes = getRecipesFromStorage();
    
    // Если рецептов нет - создаем демо-рецепт
    if (state.recipes.length === 0) {
        state.recipes = [
            {
                id: Date.now(),
                title: "Блинчики",
                image: "https://source.unsplash.com/random/800x600/?pancakes",
                ingredients: "Мука - 200 г\nЯйца - 2 шт.\nМолоко - 300 мл\nСахар - 2 ст.л.\nСоль - щепотка",
                instructions: "1. Смешайте все ингредиенты\n2. Взбейте до однородности\n3. Жарьте на разогретой сковороде\n4. Подавайте с вареньем или сметаной"
            }
        ];
        saveRecipesToStorage();
    }
    
    if (elements.recipesGrid) {
        renderRecipes(state.recipes);
    }
}

function renderRecipes(recipes) {
    elements.recipesGrid.innerHTML = recipes.map(recipe => `
        <div class="recipe-card" onclick="openRecipe(${recipe.id})">
            ${recipe.image ? `<img src="${recipe.image}" alt="${recipe.title}">` : ''}
            <h3>${recipe.title}</h3>
        </div>
    `).join("");
}

function openRecipe(id) {
    window.location.href = `recipe.html?id=${id}`;
}

function loadRecipePage() {
    const recipeId = getRecipeIdFromUrl();
    const recipe = getRecipeById(recipeId);
    
    if (!recipe) {
        window.location.href = "index.html";
        return;
    }
    
    state.currentRecipeId = recipeId;
    
    // Заполняем данные рецепта
    elements.recipeTitle.textContent = recipe.title;
    
    // Изображение (показываем только если есть)
    if (recipe.image) {
        elements.recipeImage.src = recipe.image;
        elements.recipeImageContainer.classList.remove("hidden");
    } else {
        elements.recipeImageContainer.classList.add("hidden");
    }
    
    // Ингредиенты
    elements.ingredientsList.innerHTML = recipe.ingredients
        .split("\n")
        .filter(item => item.trim() !== "")
        .map(item => `<li>${item}</li>`)
        .join("");
    
    // Инструкции
    elements.instructionsList.innerHTML = recipe.instructions
        .split("\n")
        .filter(step => step.trim() !== "")
        .map(step => `<li>${step}</li>`)
        .join("");
}

function enableEditMode() {
    const recipe = getRecipeById(state.currentRecipeId);
    
    // Заполняем форму редактирования
    elements.editRecipeName.value = recipe.title;
    elements.editRecipeImage.value = recipe.image || "";
    elements.editRecipeIngredients.value = recipe.ingredients;
    elements.editRecipeInstructions.value = recipe.instructions;
    
    // Переключаем режимы
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
    const image = elements.editRecipeImage.value.trim();
    const ingredients = elements.editRecipeIngredients.value.trim();
    const instructions = elements.editRecipeInstructions.value.trim();
    
    if (!title || !ingredients || !instructions) {
        alert("Заполните все обязательные поля!");
        return;
    }
    
    // Обновляем рецепт
    const index = state.recipes.findIndex(r => r.id === state.currentRecipeId);
    if (index !== -1) {
        state.recipes[index] = {
            ...state.recipes[index],
            title,
            image: image || null,
            ingredients,
            instructions
        };
        
        saveRecipesToStorage();
        loadRecipePage(); // Перезагружаем данные
        disableEditMode();
    }
}

// ======================
// Работа с хранилищем
// ======================

function getRecipesFromStorage() {
    const data = localStorage.getItem(CONFIG.STORAGE_KEY);
    return data ? JSON.parse(data) : [];
}

function saveRecipesToStorage() {
    localStorage.setItem(CONFIG.STORAGE_KEY, JSON.stringify(state.recipes));
}

function getRecipeById(id) {
    return state.recipes.find(recipe => recipe.id === parseInt(id));
}

// ======================
// Вспомогательные функции
// ======================

function getRecipeIdFromUrl() {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get("id");
}

function showPasswordModal(callback) {
    state.passwordCallback = callback;
    elements.passwordModal.style.display = "flex";
    elements.passwordInput.value = "";
    elements.passwordError.textContent = "";
    elements.passwordInput.focus();
}

function hidePasswordModal() {
    elements.passwordModal.style.display = "none";
}

function checkPassword() {
    if (elements.passwordInput.value === CONFIG.PASSWORD) {
        hidePasswordModal();
        if (state.passwordCallback) {
            state.passwordCallback();
        }
    } else {
        elements.passwordError.textContent = "Неверный пароль!";
    }
}

function searchRecipes() {
    const searchTerm = elements.searchInput.value.toLowerCase();
    const filtered = state.recipes.filter(recipe => 
        recipe.title.toLowerCase().includes(searchTerm) ||
        recipe.ingredients.toLowerCase().includes(searchTerm) ||
        recipe.instructions.toLowerCase().includes(searchTerm)
    );
    renderRecipes(filtered);
}

// ======================
// Обработчики событий
// ======================

function setupEventListeners() {
    // Главная страница
    if (elements.addRecipeBtn) {
        elements.addRecipeBtn.addEventListener("click", () => {
            showPasswordModal(() => {
                window.location.href = "recipe.html?new=true";
            });
        });
    }
    
    if (elements.searchBtn && elements.searchInput) {
        elements.searchBtn.addEventListener("click", searchRecipes);
        elements.searchInput.addEventListener("keyup", (e) => {
            if (e.key === "Enter") searchRecipes();
        });
    }
    
    // Страница рецепта
    if (elements.editRecipeBtn) {
        elements.editRecipeBtn.addEventListener("click", () => {
            showPasswordModal(() => {
                enableEditMode();
            });
        });
    }
    
    // Режим редактирования
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
    
    // Закрытие модального окна при клике вне его
    window.addEventListener("click", (e) => {
        if (e.target === elements.passwordModal) {
            hidePasswordModal();
        }
    });
}

// Глобальные функции для использования в HTML
window.openRecipe = openRecipe;
