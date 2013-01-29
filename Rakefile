task default: [:test]

task :test do

  current_path = File.realpath(File.dirname(__FILE__))
  mocha = "#{current_path}/node_modules/mocha/bin/mocha"
  pwd = Rake.original_dir()
  specFiles = ARGV.reject {|arg| arg.match(/=/) or !arg.match(/\.(js|coffee)/) }.map {|arg| File.join(pwd, arg.sub(pwd, '')).gsub /\.coffee$/, '.js' }
  if specFiles.length == 0
    specFiles = FileList[File.join(current_path, 'public', '**', '*.spec.js')]
  end
  modules = specFiles.map {|arg| arg.gsub(/.*public\/(.*)\.js/, '\1') }

  Dir.chdir current_path do
    system "NODE_PATH=$NODE_PATH:#{current_path} #{mocha} -R spec spec-manifest.js"
  end

end
