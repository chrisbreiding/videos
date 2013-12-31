set :css_dir, 'stylesheets'
set :js_dir, 'javascripts'
set :images_dir, 'images'
set :fonts_dir, 'fonts'

activate :ember

configure :development do
  set :debug_assets, true
end

configure :build do
  activate :minify_css
  activate :minify_javascript
  # cache buster
  activate :asset_hash
  # use relative URLs
  activate :relative_assets
end

activate :deploy do |deploy|
  deploy.method = :git
end
