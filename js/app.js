class CaloriesTracker {
  constructor() {
    this._calorieLimit = Storage.getCalorieLimit();
    this._totalCalories = Storage.getTotalCalories(0);
    this._meals = Storage.getMeals();
    this._workouts = Storage.getWorkouts();

    this._displayCalorieLimit();
    this._displayProgressBar();
    this._renderDisplay();
  }

  addMeal(meal) {
    this._meals.push(meal);
    Storage.saveMeal(meal);
    this._totalCalories += meal.calories;
    Storage.updateTotalCalories(this._totalCalories);
    this._renderDisplay();

    this._displayNewMeal(meal);
  }

  removeMeal(id) {
    const index = this._meals.findIndex((meal) => meal.id === id);
    if (index !== -1) {
      const meal = this._meals[index];
      this._totalCalories -= meal.calories;
      Storage.updateTotalCalories(this._totalCalories);
      this._meals.splice(index, 1);
      Storage.removeMeal(id);
      this._renderDisplay();
    }
  }

  addWorkout(workout) {
    this._workouts.push(workout);
    Storage.saveWorkout(workout);
    this._totalCalories -= workout.calories;
    Storage.updateTotalCalories(this._totalCalories);
    this._renderDisplay();
    this._displayNewWorkout(workout);
  }

  _displayNewMeal(meal) {
    const mealsEl = document.getElementById("meal-items");
    const mealEl = document.createElement("div");
    mealEl.classList.add("card", "my-3");
    mealEl.setAttribute("data-id", meal.id);
    mealEl.innerHTML = `
    <div class="card-body">
    <div class="d-flex justify-content-between align-items-center">
      <h4 class="mx-1">${meal.name}</h4>
      <div
        class="bg-primary text-white text-center px-2 px-sm-5 fs-1 rounded-2"
      >
        ${meal.calories}
      </div>
      <button class="delete btn btn-danger btn-sm mx-2">
        <i class="fa-solid fa-xmark"></i>
      </button>
    </div>
  </div>
    `;

    mealsEl.appendChild(mealEl);
  }

  _displayNewWorkout(workout) {
    const workoutsEl = document.getElementById("workout-items");
    const workoutEl = document.createElement("div");
    workoutEl.setAttribute("data-id", workout.id);
    workoutEl.classList.add("card", "my-3");
    workoutEl.innerHTML = `
    <div class="card-body">
    <div class="d-flex justify-content-between align-items-center">
      <h4 class="mx-1">${workout.name}</h4>
      <div
        class="bg-warning text-white text-center px-2 px-sm-5 fs-1 rounded-2"
      >
        ${workout.calories}
      </div>
      <button class="delete btn btn-danger btn-sm mx-2">
        <i class="fa-solid fa-xmark"></i>
      </button>
    </div>
  </div>
    `;
    workoutsEl.appendChild(workoutEl);
  }

  loadItems() {
    this._meals.forEach((meal) => this._displayNewMeal(meal));
    this._workouts.forEach((workout) => this._displayNewWorkout(workout));
  }

  removeWorkout(id) {
    const index = this._workouts.findIndex((workout) => workout.id === id);
    if (index !== -1) {
      const workout = this._workouts[index];
      this._totalCalories += workout.calories;
      Storage.updateTotalCalories(this._totalCalories);
      this._workouts.splice(workout, 1);
      Storage.removeWorkout(id);
      this._renderDisplay();
    }
  }

  reset() {
    this._totalCalories = 0;
    this._meals = [];
    this._workouts = [];
    this._renderDisplay();

    // clear local storage
    Storage.clearAll();
  }

  setLimit(limit) {
    this._calorieLimit = limit;
    this._displayCalorieLimit();
    this._renderDisplay();
  }

  _displayCalorieLimit() {
    const calorieLimitEl = document.getElementById("calories-limit");
    calorieLimitEl.innerHTML = this._calorieLimit;
  }

  _displayTotalCalories() {
    const totalCaloriesEl = document.getElementById("calories-total");
    totalCaloriesEl.innerHTML = this._totalCalories;
  }

  _displayCaloriesConsumed() {
    const caloriesConsumedEl = document.getElementById("calories-consumed");
    caloriesConsumedEl.innerHTML = this._meals.reduce((acc, meal) => {
      return acc + meal.calories;
    }, 0);
  }

  _displayCaloriesBurned() {
    const caloriesBurnedEl = document.getElementById("calories-burned");
    caloriesBurnedEl.innerHTML = this._workouts.reduce((acc, workout) => {
      return acc + workout.calories;
    }, 0);
  }

  _displayCaloriesRemaining() {
    const caloriesRemainingEl = document.getElementById("calories-remaining");
    const remaining = this._calorieLimit - this._totalCalories;
    caloriesRemainingEl.innerHTML = remaining;

    const progressEl = document.getElementById("progress-bar");

    if (remaining <= 0) {
      caloriesRemainingEl.parentElement.parentElement.classList.remove(
        "bg-light"
      );
      caloriesRemainingEl.parentElement.parentElement.classList.add(
        "bg-danger"
      );

      progressEl.classList.remove("bg-success");
      progressEl.classList.add("bg-danger");
    } else {
      caloriesRemainingEl.parentElement.parentElement.classList.remove(
        "bg-danger"
      );
      caloriesRemainingEl.parentElement.parentElement.classList.add("bg-light");

      progressEl.classList.remove("bg-danger");
      progressEl.classList.add("bg-success");
    }
  }

  _displayProgressBar() {
    const progressEl = document.getElementById("progress-bar");
    const percentage = (this._totalCalories / this._calorieLimit) * 100;
    const progress = Math.min(percentage, 100);
    progressEl.style.width = `${progress}%`;
  }

  _renderDisplay() {
    this._displayTotalCalories();
    this._displayCaloriesConsumed();
    this._displayCaloriesBurned();
    this._displayCaloriesRemaining();
    this._displayProgressBar();
  }
}

class Meal {
  constructor(name, calories) {
    this.id = Math.random().toString(16).slice(2);
    this.name = name;
    this.calories = calories;
  }
}

class Workout {
  constructor(name, calories) {
    this.id = Math.random().toString(16).slice(2);
    this.name = name;
    this.calories = calories;
  }
}

class Storage {
  static getCalorieLimit(limit = 2000) {
    let calorieLimit;
    if (localStorage.getItem("calorieLimit")) {
      calorieLimit = localStorage.getItem("calorieLimit");
    } else {
      calorieLimit = limit;
    }
    return calorieLimit;
  }
  static setCalorieLimit(limit) {
    localStorage.setItem("calorieLimit", limit);
  }

  static getTotalCalories(calories = 0) {
    let totalCalories;
    if (localStorage.getItem("totalCalories")) {
      totalCalories = localStorage.getItem("totalCalories");
    } else {
      totalCalories = calories;
    }
    return totalCalories;
  }

  static updateTotalCalories(calories) {
    localStorage.setItem("totalCalories", calories);
  }

  static getMeals() {
    let meals;
    if (localStorage.getItem("meals")) {
      meals = JSON.parse(localStorage.getItem("meals"));
    } else {
      meals = [];
    }
    return meals;
  }

  static getWorkouts() {
    let workouts;
    if (localStorage.getItem("workouts")) {
      workouts = JSON.parse(localStorage.getItem("workouts"));
    } else {
      workouts = [];
    }
    return workouts;
  }

  static saveMeal(meal) {
    const meals = Storage.getMeals();
    meals.push(meal);
    localStorage.setItem("meals", JSON.stringify(meals));
  }

  static saveWorkout(workout) {
    const workouts = Storage.getWorkouts();
    workouts.push(workout);
    localStorage.setItem("workouts", JSON.stringify(workouts));
  }

  static removeMeal(id) {
    const meals = Storage.getMeals();
    meals.forEach((meal, index) => {
      if (meal.id === id) {
        meals.splice(index, 1);
      }
    });
    localStorage.setItem("meals", JSON.stringify(meals));
  }

  static removeWorkout(id) {
    const workouts = Storage.getWorkouts();
    workouts.forEach((workout, index) => {
      if (workout.id === id) {
        workouts.splice(index, 1);
      }
    });
    localStorage.setItem("workouts", JSON.stringify(workouts));
  }
  static clearAll() {
    localStorage.removeItem("totalCalories");
    localStorage.removeItem("meals");
    localStorage.removeItem("workouts");
  }
}

class App {
  constructor() {
    this._tracker = new CaloriesTracker();
    this._tracker.loadItems();
    // add event listeners and bind this
    document
      .getElementById("add-meal")
      .addEventListener("submit", this._newItem.bind(this, "meal"));
    document
      .getElementById("add-workout")
      .addEventListener("submit", this._newItem.bind(this, "workout"));

    document
      .getElementById("meal-items")
      .addEventListener("click", this._removeItem.bind(this, "meal"));

    document
      .getElementById("workout-items")
      .addEventListener("click", this._removeItem.bind(this, "workout"));

    document
      .getElementById("filter-meals")
      .addEventListener("keyup", this._filterItems.bind(this, "meal"));

    document
      .getElementById("filter-workouts")
      .addEventListener("keyup", this._filterItems.bind(this, "workout"));

    document
      .getElementById("reset")
      .addEventListener("click", this._reset.bind(this));

    document
      .getElementById("limit-form")
      .addEventListener("submit", this._setLimit.bind(this));
  }

  _newItem(type, e) {
    e.preventDefault();
    const name = document.getElementById(`${type}-name`);
    const calories = document.getElementById(`${type}-calories`);

    // input validation
    if (!name.value || !calories.value) {
      alert("Please fill all fields");
      return;
    }

    if (type === "meal") {
      const meal = new Meal(name.value, Number(calories.value));
      this._tracker.addMeal(meal);
    } else {
      const workout = new Workout(name.value, Number(calories.value));
      console.log(workout);
      this._tracker.addWorkout(workout);
    }

    name.value = "";
    calories.value = "";

    //close add meal collapse
    const converted = type.slice(0, 1).toUpperCase() + type.slice(1);
    const addItemCollapse = document.getElementById(`Add-${converted}`);
    const bsCollapse = new bootstrap.Collapse(addItemCollapse, {
      toggle: true,
    });
  }

  _removeItem(type, e) {
    if (
      e.target.classList.contains("delete") ||
      e.target.classList.contains("fa-xmark")
    ) {
      const id = e.target.closest(".card").getAttribute("data-id");
      if (confirm("Are you sure?")) {
        type === "meal"
          ? this._tracker.removeMeal(id)
          : this._tracker.removeWorkout(id);

        // remove item from the DOM
        e.target.closest(".card").remove();
      }
    }
  }
  _filterItems(type, e) {
    const value = e.target.value.toLowerCase();
    document.querySelectorAll(`#${type}-items .card`).forEach((meal) => {
      const mealName = meal.firstElementChild.firstElementChild.textContent;
      if (mealName.includes(value)) {
        meal.style.display = "block";
      } else {
        meal.style.display = "none";
      }
    });
  }

  _reset() {
    this._tracker.reset();
    // remove meal and workout items from DOM
    document.getElementById("meal-items").innerHTML = "";
    document.getElementById("workout-items").innerHTML = "";
  }

  _setLimit(e) {
    e.preventDefault();
    const limit = document.getElementById("limit");
    this._tracker.setLimit(Number(limit.value));

    // set calorie limit in local storage
    Storage.setCalorieLimit(limit.value);

    //close limit modal
    const limitModal = document.getElementById("limit-modal");
    const bsModal = bootstrap.Modal.getInstance(limitModal);
    bsModal.hide();
  }
}

const app = new App();
