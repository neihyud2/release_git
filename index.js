const $ = document.querySelector.bind(document)
const $$ = document.querySelectorAll.bind(document)

const btnSearch = $('.btn-search')

// const app = {
//     getFind: async function() {
//         const inputUrl = $('.url-input') 
//         btnSearch.onclick = (e) => {
//             e.preventDefault()

//         }
//     },


// }

// app.getFind()
const url = 'http://localhost:8080/'

var inputUrl = $('.url-input')
// btnSearch.onclick = async (e) => {
//     e.preventDefault()
//     var data = inputUrl.value
//     console.log(inputUrl.value)
//     var options = {
//         method: 'POST',
//         headers: {
//             'Content-Type': 'application/json',
//         },
//         body: JSON.stringify(inputUrl.value),
//         mode: 'no-cors',
//     }
//     fetch(url, options)
//         // .then(response => response.json())
//         .then((data) => {
//             console.log('success: ', data)
//         })
//         .catch(err => console.log('Request Failed', err));
// }


