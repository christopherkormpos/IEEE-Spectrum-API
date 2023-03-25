const feedDisplay = document.querySelector('#feed')

fetch('http://localhost:8000/')
    .then(response => {return response.json()})
    .then(data => {
        data.forEach(article => {
            const articleItem = `<div>
            <h3>` + article.newsTitle + `</h3>
            <p>` + article.newsUrl + `</p>
            <p>` + article.newsTimetoRead + `</p>
            <p>`+  article.newsDatePublished +`</p>
            <p>`+  article.newsSection +`</p>
            <img src = ` + article.newsImgSrc +`>
            </div>`
            feedDisplay.insertAdjacentHTML("beforeend", articleItem)
        })
    })
    .catch(err => console.log(err))
