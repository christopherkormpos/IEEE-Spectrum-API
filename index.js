//npm run start
const port = process.env.PORT || 8000
const axios = require('axios')
const cheerio = require('cheerio')
const express = require('express')
const cors = require('cors')
const app = express()
app.use(cors())

const url = 'https://spectrum.ieee.org/type/news/'

const topics = ['Aerospace', 'Artificial Intelligence', 'Biomedical', 'Computing',
    'Consumer Electronics', 'Energy', 'History of Technology', 'Robotics',
    'Semiconductors', 'Sensors', 'Telecommunications', 'Transportation', 'The Institute']

//when we request localhost:[port] we get this response
app.get('/get', (req, res) => {
    axios(url)
        .then(response => {
            const html = response.data
            const $ = cheerio.load(html) //use of Cheerio dependency
            const articles = []
            $('.widget', html).each(function () {
                const newsTitle = $(this).find('h2').text()
                const newsTimetoRead = $(this).find('.time-to-read').text() || '3 min'
                const newsUrl = $(this).find('.widget__headline-text').attr('href')
                const newsImgSrc = $(this).find('img').attr('data-runner-src') || '../images/nia.png' //if newsImgSrc is undefined it will set it to the default No Image Available image src
                const newsDatePublished = $(this).find('.social-date').text()
                let newsSection = $(this).find('.all-related-sections').find('a').text()

                //check if newsSection is a probable IEEE Spectrum topic
                for (let k = 0; k < topics.length; k++) {
                    if (newsSection.includes(topics[k])) {
                        newsSection = topics[k]
                    }
                }


                articles.push({
                    newsTitle,
                    newsUrl,
                    newsTimetoRead,
                    newsDatePublished,
                    newsSection,
                    newsImgSrc
                })
            })
            //Simple check for duplicate objects if any 
            for (let i = 0; i < articles.length; i++) {
                for (let j = 0; j < articles.length; j++) {
                    if ((articles[i].newsTitle === articles[j].newsTitle) && (i !== j)) {
                        articles.splice(j, 1)
                    }
                }


            }




            res.json(articles)
        }).catch(err => {
            res.json(err)
        })
})

app.listen(port, () => console.log(`Server running on port ${port}`))