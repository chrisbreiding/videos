
guard 'coffeescript', :input => 'src/coffee', :output => 'public/js'

guard 'compass' do
  watch(/^src\/(.*)\.s[ac]ss/)
end

guard 'shell' do
  watch %r{^.*(?<=\/)(.+\.hb$)} do |m|
    template_path = m[0]
    template = m[1]
    output = "public/templates/#{template}.js"
    system "node_modules/.bin/handlebars -a #{template_path} -f #{output}"
    n template, "Compiling Template", 0==$? ? :success : :failed
  end
end
