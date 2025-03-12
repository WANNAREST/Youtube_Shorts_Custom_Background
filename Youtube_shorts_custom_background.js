
function openDB() {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open("ImageStorageDB", 1);
  
      request.onerror = () => reject('Error opening IndexedDB');
      request.onsuccess = (event) => resolve(event.target.result);
  
      request.onupgradeneeded = (event) => {
        const db = event.target.result;
        if (!db.objectStoreNames.contains("images")) {
          const store = db.createObjectStore("images", { keyPath: "id" });
          store.createIndex("base64", "base64", { unique: false });
        }
      };
    });
  }
  
  function storeImage(base64) {
    openDB().then(db => {
      const transaction = db.transaction("images", "readwrite");
      const store = transaction.objectStore("images");
      store.put({ id: "backgroundImage", base64: base64 });
      transaction.oncomplete = () => console.log("Image saved to IndexedDB");
      transaction.onerror = () => console.error("Error saving image to IndexedDB");
    }).catch(err => console.error(err));
  }
  
  function retrieveImage() {
    return new Promise((resolve, reject) => {
      openDB().then(db => {
        const transaction = db.transaction("images", "readonly");
        const store = transaction.objectStore("images");
        const request = store.get("backgroundImage");
        request.onsuccess = (event) => {
          event.target.result ? resolve(event.target.result.base64) : reject('No image found');
        };
        request.onerror = () => reject('Error retrieving image from IndexedDB');
      }).catch(err => reject(err));
    });
  }
  
  (function () {
    'use strict';
  
    const bgContainer = document.createElement('div');
    const selector = document.createElement('div');
    const fileInput = document.createElement('input');
    const iconBase64 = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACQAAAAkCAYAAADhAJiYAAAACXBIWXMAAAsTAAALEwEAmpwYAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAEPSURBVHgB7ZjtDYIwEIYPJmAEHIENGMFR2AQ2gg10A9gANjjvQjW1Ba5WtP3RJ7nYpG/aJ+b4KAAEIpZUPdWMYejZgV0yNbhRFRCWhapioZ4GNcTBwEII8bBYQhkBf8TcP4fISEISSUgiCUkkIYkkJJGEJH4iRA/wguoKPpjvknACtEynlmsdsu/7fyJE0/Xz3fcg0xhLNkLeTwjXg8CsqhQyOrt5byFce2LUYjwuhAwe5b8V6jY2aR0yu3lvIbR7QqdxyFh5byHc7gkdnqvR/YBp9ZMZODx10NRIPyWcy0RbXHQhfTK6O3U6l0kkIQnuoRnCf4p5wf/QHeJhiO6DVU5X+cQDqgHCsKi9K3Z5AJ4wAkK8W5ViAAAAAElFTkSuQmCC";
  
    const setBackground = base64 => {
      bgContainer.style.opacity = 0;
      setTimeout(() => {
        bgContainer.style.backgroundImage = `url(${base64})`;
        bgContainer.style.opacity = 1;
      }, 100);
    }
  
    fileInput.type = 'file';
    fileInput.accept = 'image/png, image/jpeg, image/jpg';
    fileInput.style.display = 'none';
  
    Object.assign(bgContainer.style, {
      "width": "100vw",
      "height": "100vh",
      "position": "fixed",
      "top": 0,
      "left": 0,
      "background-size": "cover",
      "background-repeat": "no-repeat",
      "background-position": "center",
      "z-index": "-1",
      "opacity": 0,
      "transition": "background-image 0.5s ease-in-out, opacity 0.5s ease-in-out"
    });
  
    Object.assign(selector.style, {
      "width": "50px",
      "height": "50px",
      "border-radius": "50%",
      "position": "fixed",
      "right": "16px",
      "bottom": "16px",
      "z-index": "1000",
      "background-image": `url(${iconBase64})`,
      "background-color": "#33afd1",
      "background-position": "center",
      "background-repeat": "no-repeat",
      "background-size": "26px",
      "cursor": "pointer"
    });
  
    document.body.appendChild(bgContainer);
    document.body.appendChild(selector);
    document.body.appendChild(fileInput);
  
    function fileToBase64(file, callback) {
      const reader = new FileReader();
      reader.onloadend = () => callback(reader.result);
      reader.readAsDataURL(file);
    }
  
    fileInput.addEventListener('change', (event) => {
      const file = event.target.files[0];
      if (file) {
        fileToBase64(file, (base64) => {
          setBackground(base64);
          storeImage(base64);
        });
      }
    });
  
    selector.addEventListener('click', () => fileInput.click());
  
    retrieveImage().then(setBackground).catch(console.error);
  })();
  