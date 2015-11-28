moment = require('moment')
docpadConfig = {
  templateData:
    site:
      title: 'Mickey Mullin'
      tagline: 'Author, Software Engineer, Maker of Pancakes'
      description: 'Official site for the author of the forthcoming novel, Ghostwolf. Mickey also writes software, but that\'s not as much fun to curl up with and dive into with a glass of wine.'
      logo: '/img/logo.png'
      url: 'http://mickeymullin.com'
      cover: '/img/bellevue-trail-eerie.jpg'
      navigation: [
        {
          name: 'Home',
          href: '/',
          section: 'home'
        },
        {
          name: 'About',
          href: '/about.html',
          section: 'about'
        },
        {
          name: 'Ghostwolf',
          href: '/ghostwolf.html',
          section: 'ghostwolf'
        },
        {
          name: 'Teasers',
          href: '/tags/teaser.html',
          section: 'tag-teaser'
        }
      ]
      services:
            buttons: ['FacebookLike']  # used to customise the order of the buttons

            facebookLikeButton:
                applicationId: '266367676718271'
            facebookFollowButton:
                applicationId: '266367676718271'
                username: 'balupton'
            twitterTweetButton: 'MickeyMullin'
            twitterFollowButton: 'MickeyMullin'
            githubFollowButton: 'MickeyMullin'
            #githubStarButton: 'MickeyMullin/mickeymullin.com'
            #quoraFollowButton: 'Mickey-Mullin'
            #travisStatusButton: 'bevry/docpad'
            #furyButton: 'docpad'
            #gittipButton: 'docpad'
            #flattrButton: '344188/balupton-on-Flattr'
            #paypalButton: 'mickey@dreamwolf.us'  # paypal button email id

            disqus: 'mickeymullin'
            #gauges: 'get.gaug.es-id'
            googleAnalytics: 'UA-70144528-1'
            #inspectlet: 'inspectlet-id'
            #mixpanel: 'mixpanel-id'
            #reinvigorate: 'reinvigorate-id'
            #zopim: 'zopim-id'
    author:
      name: 'Mickey Mullin'
      img: '/img/mickey-mullin_20151128_600x600.jpg'
      url: '/about.html'
      href: '/about.html'
      location: 'New Jersey, USA'
      bio: 'Novelist and software engineer in New Jersey, USA'
    getPreparedTitle: -> if @document.title then "#{@document.title} | #{@site.title}" else @site.title
    getDescription: -> if @document.description then "#{@document.description} | #{@site.description}" else @site.description
    bodyClass: -> if @document.isPost then "post-template" else "home-template"
    masthead: (d) ->
      d = d || @document
      if d.cover then d.cover else @site.cover
    isCurrent: (l) ->
      if @document.section is l.section  then ' nav-current'
      else if @document.url is l.href then ' nav-current'
      else ''
    excerpt: (p,w) ->
      w = w || 26
      if p.excerpt then p.excerpt else p.content.replace(/<%.+%>/gi, '').split(' ').slice(0, w).join(' ')
    encode: (s) -> encodeURIComponent(s)
    slug: (s) -> return s.toLowerCase().replace(' ', '-')
    currentYear: -> new Date().getFullYear()
    time: (ts, format) ->
      format = format || 'MMMM DO, YYYY'
      ts = new Date(ts) || new Date()
      moment(ts).format(format)
  collections:
    posts: ->
      @getCollection("html").findAllLive({active:true, isPost: true, isPagedAuto: {$ne: true}}, {postDate: -1}).on "add", (model) ->
        model.setMetaDefaults({layout:"post"})
  plugins:
    tags:
      extension: '.html'
      injectDocumentHelper: (doc) ->
        doc.setMeta { layout: 'tag' }
    rss:
      default:
        collection: 'posts'
        url: '/rss.xml'
}

module.exports = docpadConfig
