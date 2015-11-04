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
    author:
      name: 'Mickey Mullin'
      img: ''
      url: '/'
      location: 'New Jersey, USA',
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
