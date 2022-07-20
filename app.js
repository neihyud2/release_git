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
    var url = req.body.urlgit + '/releases' // path = Guardsquare/proguard/releases
    const hostname = 'https://github.com'
    var { data } = await axios.get(url)
    var $ = cheerio.load(data)
    const numberPage = $('.pagination a[href*="/releases?page"]:nth-last-child(2)').text()

    const pages = []
    for (var i = 1; i <= numberPage; i++) {
        pages.push(i)
    }

    // Get all Releases from pages
    let releases = []
    for (var number of pages) {
        var list = await getListUrl(url + `?page=${number}`, '/releases/tag')
        releases = [...releases, ...list]
    }

    // Get all Url Commits
    for (var release of releases) {
        try {
            var urlRelease = release.href
            var { data } = await axios.get(urlRelease)
            var $ = cheerio.load(data)
            var urlCommit = $('.mr-4.mb-2 a[href*="/compare/"]').attr('href')
            // if (urlCommit) listUrlCommits.push(hostname + urlCommit) // luu y: co phan tu undefined nen can note
            if (urlCommit) {
                var { data } = await axios.get(hostname + urlCommit)

                let $ = cheerio.load(data)
                var loadingCommits = $('[aria-label="Loading Commits"]').attr('src') // root: commit_bucket
                if (loadingCommits) {
                    var urlRange = hostname + loadingCommits
                    var { data } = await axios.get(urlRange)
                    $ = cheerio.load(data)
                }

                let timelineItemsBody = $('.TimelineItem-body') // list: timeline

                const timelineItems = []
                timelineItemsBody.each((idx, el) => {
                    const infoTimeline = {} // obj: title: Commits on Jun 27, 2022, commit: ...
                    infoTimeline.commitDate = $(el).children('h3').text()

                    const infoBaseCommits = [] // luu tung commit
                    const liCommit = $(el).children('ol').children('li') // list li

                    liCommit.each((idx, el) => {
                        const infoBaseCommit = {}
                        infoBaseCommit.subInfoItem = $(el).children('div').children('p').children('a').text()
                        infoBaseCommit.hrefItem = hostname + $(el).children('div').children('p').children('a').attr('href')
                        infoBaseCommit.codeText = $(el).find(`.text-mono`).text().trim()
                        infoBaseCommit.codeHref = hostname + $(el).find(`.text-mono`).attr('href')
                        infoBaseCommit.authCommit = $(el).find(`.color-fg-muted.min-width-0 a:first-child`).text()
                            || $(el).find(`.commit-author.user-mention`).text()
                        infoBaseCommit.authImg = $(el).find(`.AvatarStack-body a:first-child img`).attr('href') || 'https://scontent.fhan14-1.fna.fbcdn.net/v/t1.15752-9/286556594_409294764550121_5720372867886446489_n.png?_nc_cat=110&ccb=1-7&_nc_sid=ae9488&_nc_ohc=hmg4hf4GiPcAX8ZuOqT&_nc_oc=AQlwplkw6pZSBVv3aiyLxjy-FEPLOCDvA7yl3M7zTRx8NyykLbkiZXlEaTd54Xun5GtIvoss2Ub6Okqc691n-KME&_nc_ht=scontent.fhan14-1.fna&oh=03_AVIxXi53FigjzIVMTmfLbh7OU7yadnRBv4v7Mxsnhvzpkg&oe=62F8A43D'
                        infoBaseCommit.relativeTime = $(el).find(`relative-time`).text()

                        infoBaseCommits.push(infoBaseCommit)
                    })

                    infoTimeline.baseCommit = infoBaseCommits
                    timelineItems.push(infoTimeline)
                })
                release.infoCommits = timelineItems
                // break;
            }
        } catch (err) {
            console.log(err)
        }
    }

    // res.json(releases)
    res.render('home', {
        releases,
        // infoCommits
    })
}

async function getListUrl(url, subUrl) {
    try {
        const { data } = await axios.get(url)
        const $ = cheerio.load(data)
        // const listItem = $('a')
        const listItem = $('.Box-body')
        const list = []
        listItem.each((idx, el) => {
            const item = {}
            // const content = html2pug($(el).find('.markdown-body.my-3').html(), { tabs: false, fragment: true });
            const content = $(el).find('.markdown-body.my-3').html();
            item.href = 'https://github.com' + $(el).find('a').attr('href')
            item.name = $(el).find('.flex-1 a:first-child').text()
            item.changelog = content
            if (item.href.includes(subUrl)) {
                list.push(item)
            }
        })
        return list
    } catch (err) {
        console.log(err)
    }
}



app.listen(8080, () => console.log('You listening port 8080'))