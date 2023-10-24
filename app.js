// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.5.0/firebase-app.js";
import {
  getDatabase,
  ref,
  set,
  push,
  remove,
  onValue,
} from "https://www.gstatic.com/firebasejs/10.5.0/firebase-database.js";

import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7/+esm";

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCKhQ6scCWoihlTV1f4DKB5alJ6fQBX3d4",
  authDomain: "energy-tracker-v2.firebaseapp.com",
  databaseURL:
    "https://energy-tracker-v2-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "energy-tracker-v2",
  storageBucket: "energy-tracker-v2.appspot.com",
  messagingSenderId: "251106768125",
  appId: "1:251106768125:web:6a8a97547466b354a0fa94",
  measurementId: "G-GZN3F0WE6T",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const database = getDatabase();

const databaseReference = ref(database, "item");

// global variables!!!!!!!!!!!!!
// const average = getAverageArray(allItems);
let averageDataSet = [];
const container = document.querySelector(".container");
let allItems = [];
const listEl = document.querySelector("ul");
const inputEl = document.querySelector("input");
const buttonEl = document.querySelector("button");

function addToDatabase(itemToAdd) {
  push(databaseReference, itemToAdd);
}

function emptyDB() {
  remove(databaseReference);
}

function seedDB() {
  emptyDB();
  for (let i = 0; i < 100; i++) {
    let sampleItem = {
      energyLevel: Math.floor(Math.random() * 11),
      currentHour: Math.floor(Math.random() * 24),
    };
    addToDatabase(sampleItem);
  }
}

function appendItemToListEl(itemArray) {
  listEl.innerHTML = "";
  for (let item of itemArray) {
    const newLi = document.createElement("li");
    newLi.innerText = `Current hour: ${item[1].currentHour}, Energy level ${item[1].energyLevel}`;
    newLi.addEventListener("click", () => {
      const exactLocation = ref(database, `item/${item[0]}`);
      remove(exactLocation);
    });
    listEl.append(newLi);
  }
}

onValue(databaseReference, (snapshot) => {
  if (snapshot.exists()) {
    allItems = Object.entries(snapshot.val());

    appendItemToListEl(allItems.reverse());

    getAverageArray(allItems);
    createDataSet();
    populateDataContainer();
  } else {
    allItems = [];
    listEl.innerHTML = "";
  }
});

buttonEl.addEventListener("click", () => {
  const d = new Date();

  let newItem = {
    energyLevel: parseInt(inputEl.value),
    // currentHour: Math.floor(Math.random() * 24),
    currentHour: d.getHours(),
    currentDate: d,
  };
  addToDatabase(newItem);
});

// problema qua: quando inserisco le medie si sballano a bestia
function getAverageArray(allItemsArray) {
  const averageArray = new Array(24).fill([0, 0]);
  for (let i = 0; i < 24; i++) {
    let sum = 0;
    let counter = 0;
    for (let item of allItemsArray) {
      if (item[1].currentHour === i) {
        sum += item[1].energyLevel;
        counter += 1;
      }
    }
    if (counter > 0) {
      averageArray[i] = [i, sum / counter];
    }
  }
  return averageArray;
}

function createDataSet() {
  averageDataSet = [];
  for (let item of getAverageArray(allItems)) {
    averageDataSet.push({
      currentHour: item[0],
      energyLevel: item[1],
    });
  }
}

createDataSet();

function appdendDivToContainer(label, max, height) {
  const newDiv = document.createElement("div");
  newDiv.classList.add("data-column");
  newDiv.innerText = label;

  let divHeight = `${(height / max) * 100}%`;
  newDiv.style.height = divHeight;

  newDiv.style.width = `${320 / 24}px`;

  container.append(newDiv);
}

function populateDataContainer() {
  container.innerHTML = "";
  for (let i = 0; i < averageDataSet.length; i++) {
    let maxValue = 0;
    for (let item of averageDataSet) {
      if (item.energyLevel >= maxValue) {
        maxValue = item.energyLevel;
      }
    }
    let currentValue = averageDataSet[i].energyLevel;
    appdendDivToContainer(i, maxValue, currentValue);
  }
}

populateDataContainer();
