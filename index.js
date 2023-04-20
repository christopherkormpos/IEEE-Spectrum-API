//npm run start
const port = process.env.PORT || 8000
const axios = require('axios')
const cheerio = require('cheerio')
const express = require('express')
const cors = require('cors')
const app = express()
app.use(cors())

const url = 'https://spectrum.ieee.org/type/news/'


//when we request https://ieeespectrumapi.azurewebsites.net/api we get this response
app.get('/api', (req, res) => {
    axios(url)
        .then(response => {
            const html = response.data
            const $ = cheerio.load(html) //use of Cheerio dependency
            const articles = []
            $('.widget', html).each(function () {
                const newsTitle = removeSpacesAndNewlines($(this).find('h2').text())
                const newsTimetoRead = $(this).find('.time-to-read').text() || '3 min read'
                const newsSubHeadline = $(this).find('h3').text()
                const newsUrl = $(this).find('.widget__headline-text').attr('href')
                const newsImgSrc = $(this).find('img').attr('data-runner-src')
                    || 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/65/No-Image-Placeholder.svg/1200px-No-Image-Placeholder.svg.png'
                //if newsImgSrc is undefined it will set it to the No Image Available png from the link
                const newsImgAlt = $(this).find('img').attr('alt')
                const newsDatePublished = modifyString($(this).find('.social-date').text())
                const newsLikes = $(this).find('.like-button').attr('data-post-likes')
                const unfilteredSections = $(this).find('.all-related-sections').find('a').map(function () {
                    return $(this).text();
                }).get();

                let newsIsSponsored = false

                //Simple check for when an article is sponsored the newsIsSponsored value to change to true
                for (let k = 0; k < unfilteredSections.length; k++) {
                    if (unfilteredSections[k] === 'Sponsored Article') {
                        newsIsSponsored = true
                    }
                }
                //Filter the unfiltered newsSections array so that the values are probable IEEE Spectrum Topics 
                let newsSections = []
                for (let i = 0; i < unfilteredSections.length; i++) {
                    if (unfilteredSections[i] !== 'Type' && unfilteredSections[i] !== 'Topic' && unfilteredSections[i] !== 'News' && unfilteredSections[i] !== 'Sponsored Article') {
                        newsSections.push(unfilteredSections[i])
                    }
                }

                articles.push({
                    newsTitle,
                    newsSubHeadline,
                    newsUrl,
                    newsDatePublished,
                    newsTimetoRead,
                    newsSections,
                    newsImgSrc,
                    newsImgAlt,
                    newsLikes,
                    newsIsSponsored
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

//Function that removes \n and spaces from the raw strings. Function call on newsTitle
function removeSpacesAndNewlines(str) {
    str = str.trim();
    str = str.replace(/\n/g, '');
    return str;
}

//Function that checks if there is an 'm' or 'h' on a string. If true the string becomes string + 'ago'
//Function call on newsDatePublished
function modifyString(str) {
    const match = str.match(/^(\d+)([mh]?)$/);
    if (match) {
        const num = match[1];
        const unit = match[2];
        const unitStr = unit === 'm' ? 'm' : unit === 'h' ? 'h' : '';
        const newStr = num + unitStr + ' ago';
        return newStr;
    } else {
        return str;
    }
}
app.listen(port, () => console.log(`Server running on port ${port}`))