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
    recipeImage: document.getElementById("recipeImage"),
    ingredientsList: document.getElementById("ingredientsList"),
    instructionsList: document.getElementById("instructionsList"),
    editRecipeBtn: document.getElementById("editRecipeBtn"),
    
    // Редактирование
    editTitle: document.getElementById("editTitle"),
    recipeName: document.getElementById("recipeName"),
    recipeIngredients: document.getElementById("recipeIngredients"),
    recipeInstructions: document.getElementById("recipeInstructions"),
    saveRecipeBtn: document.getElementById("saveRecipeBtn")
};

// Текущее состояние
let state = {
    recipes: [],
    currentRecipeId: null,
    passwordCallback: null
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
    
    // Если это страница редактирования - загружаем данные
    if (window.location.pathname.includes("edit-recipe.html")) {
        loadEditPage();
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
            <img src="${recipe.image || 'https://source.unsplash.com/random/300x200/?food'}" alt="${recipe.title}">
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
    elements.recipeImage.src = recipe.image || "https://source.unsplash.com/random/800x600/?food";
    
    // Ингредиенты
    elements.ingredientsList.innerHTML = recipe.ingredients
        .split("\n")
        .map(item => `<li>${item}</li>`)
        .join("");
    
    // Инструкции
    elements.instructionsList.innerHTML = recipe.instructions
        .split("\n")
        .map(step => `<li>${step}</li>`)
        .join("");
}

function loadEditPage() {
    const recipeId = getRecipeIdFromUrl();
    
    if (recipeId) {
        // Редактирование существующего рецепта
        const recipe = getRecipeById(recipeId);
        if (!recipe) {
            window.location.href = "index.html";
            return;
        }
        
        state.currentRecipeId = recipeId;
        elements.editTitle.textContent = "Редактировать рецепт";
        elements.recipeName.value = recipe.title;
        elements.recipeIngredients.value = recipe.ingredients;
        elements.recipeInstructions.value = recipe.instructions;
    } else {
        // Создание нового рецепта
        state.currentRecipeId = null;
        elements.editTitle.textContent = "Новый рецепт";
    }
}

function saveRecipe() {
    const title = elements.recipeName.value.trim();
    const ingredients = elements.recipeIngredients.value.trim();
    const instructions = elements.recipeInstructions.value.trim();
    
    if (!title || !ingredients || !instructions) {
        alert("Заполните все поля!");
        return;
    }
    
    const recipeData = {
        id: state.currentRecipeId || Date.now(),
        title,
        ingredients,
        instructions,
        image: "https://source.unsplash.com/random/800x600/?food," + title.toLowerCase()
    };
    
    // Обновляем или добавляем рецепт
    if (state.currentRecipeId) {
        // Обновление
        const index = state.recipes.findIndex(r => r.id === state.currentRecipeId);
        if (index !== -1) {
            state.recipes[index] = recipeData;
        }
    } else {
        // Добавление
        state.recipes.push(recipeData);
    }
    
    saveRecipesToStorage();
    window.location.href = "index.html";
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

// ======================
// Обработчики событий
// ======================

function setupEventListeners() {
    // Главная страница
    if (elements.addRecipeBtn) {
        elements.addRecipeBtn.addEventListener("click", () => {
            showPasswordModal(() => {
                window.location.href = "edit-recipe.html";
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
                window.location.href = `edit-recipe.html?id=${state.currentRecipeId}`;
            });
        });
    }
    
    // Редактирование
    if (elements.saveRecipeBtn) {
        elements.saveRecipeBtn.addEventListener("click", saveRecipe);
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

function searchRecipes() {
    const searchTerm = elements.searchInput.value.toLowerCase();
    const filtered = state.recipes.filter(recipe => 
        recipe.title.toLowerCase().includes(searchTerm) ||
        recipe.ingredients.toLowerCase().includes(searchTerm) ||
        recipe.instructions.toLowerCase().includes(searchTerm)
    );
    renderRecipes(filtered);
}

// Глобальные функции для использования в HTML
window.openRecipe = openRecipe;