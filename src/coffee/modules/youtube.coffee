define ->

  searchSubs: (query) ->
    $.ajax
      dataType: 'JSONP'
      url: "https://gdata.youtube.com/feeds/api/channels?v=2&alt=json&max-results=10&q=#{query}"
