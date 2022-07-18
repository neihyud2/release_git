const express = require('express')
const path = require('path')
const axios = require('axios')
const cheerio = require('cheerio')
const app = express()

app.use(express.json())
app.use(express.urlencoded({ extended: true }))

app.set('view engine', 'pug')
app.set('views', './views')

app.use(express.static(path.join(__dirname, 'public')))

app.get('/', async (req, res) => {
    res.render('home')
})

app.post('/', getData)

async function getData(req, res) {
    var url = req.body.urlgit
    // var url = 'https://github.com/Guardsquare/proguard'
    console.log(url)
    try { } catch (err) { console.log(err) }
    const arrSubUrl = url.split('/')
    var baseApiUrl = `https://api.github.com/repos/${arrSubUrl[3]}/${arrSubUrl[4]}`
    var urlReleases = `${baseApiUrl}/releases`
    const { data } = await axios.get(urlReleases)
    // console.log(data[0])
    const releases = data.map((obj) => {
        return {
            html_url: obj.html_url,
            changelog: obj.body,
            tag_name: obj.tag_name,
            target_commitish: obj.target_commitish,
            published_at: obj.published_at
        }
    })

    const infoCommits = []
    for (var release of releases) {
        const urlCommits = baseApiUrl + `/compare/${release.tag_name}...${release.target_commitish}`
        const { data } = await axios.get(urlCommits)
        const commits = data.commits.map((itemCommit) => {
            return {
                message: itemCommit.commit.message,
                committer_name: itemCommit.commit.name,
                committer_date: itemCommit.commit.date,
                codeHref: itemCommit.html_url
            }
        })
        release.commits = commits
        infoCommits.push(release)
    }
    res.json(infoCommits)
    console.log(infoCommits)

}
// getData()

app.listen(8080, () => console.log('You listening port 8080'))