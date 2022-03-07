//global connection variables
let db;
const indexedDB = indexedDB.open('PWA_budget_tracker', 1);

//runs if upgrade required
request.onupgradeneeded = function(i) {
    const db = i.target.result;
    db.createObjectStore('new_tracker', { autoIncrement: true });
};

//when online then run updateData
request.onsuccess = function(i) {
    db = i.target.result;
    if (navigator.online) {
        uploadData();
    }
};

//if error in upload throw error code
request.onerror = function (i) {
    console.log(i.target.errorCode);
};

//hold data until server is back online
function saveData(data) {
    const trans = db.transaction(['new_trans'], 'readwrite');
    const BudgetObjStore = trans.objectStore('new_trans');

    BudgetObjStore.add(data);
};

//calls to run when server is back online. puts saved data onto server
function uploadData() {
    const trans = db.transaction(['new_trans'], 'readwrite');
    const budgetObjStore = trans.objectStore('new_trans');
    const getAll = budgetObjStore.getAll();

    getAll.onSuccess = function() {
        if (getAll.result.length > 0) {
            fetch('api/trans', {
                method: 'POST',
                body: JSON.stringify(getAll.result),
                headers: {
                    Accept: 'application/json, text/plain, */*',
                    'Content_type': 'application/json'
                }
            })
            .then(response => response.json())
            .then(serverResponse => {
                if (serverResponse.message) {
                    throw new Error(serverResponse)
            }
            const trans = db.transaction(['new_trans'], 'readwrite');
            const budgetObjStore = trans.objectStore('new_trans');
            budgetObjStore.clear();
            alert('Saved transactions have been submitted to server!')
            })
            .catch(err => {
                console.log(err);
            });
        }
    }
}

//listens for server to be back online
window.addEventListener('online', uploadData)