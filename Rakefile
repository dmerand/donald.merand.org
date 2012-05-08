#Author: Donald L. Merand
#Taken and modified from https://github.com/exploration/faces-of-explo/blob/master/Rakefile

local_site_dir = "."
assets_dir = "#{local_site_dir}/assets"
scripts_dir = "#{assets_dir}/scripts"
css_dir = "#{assets_dir}/css"


#usually I'm developing, and I just want all of my assets to compile as I work...
task :default => "watch:all"


namespace :compile do
  #you'll be needing scss and/or coffeescript in your path for this to work
  scss_compile = "scss --update #{ENV['SCSS_OPTIONS']} #{css_dir}"
  coffee_compile = "coffee -c #{ENV['COFFEE_OPTIONS']} #{scripts_dir}"

  desc "Compile SCSS files in #{css_dir}"
  task :scss do
    directory css_dir
    sh scss_compile
  end

  desc "Compile CoffeeScript files in #{scripts_dir}"
  task :coffee do
    directory scripts_dir
    sh coffee_compile
  end

  desc 'Compile all assets'
  task :all => [:scss, :coffee] do
    puts "All assets compiled!"
  end
end


namespace :watch do
  #you'll be needing scss and/or coffeescript in your path for this to work
  scss_watch = "scss --watch #{ENV['SCSS_OPTIONS']} #{css_dir}"
  coffee_watch = "coffee -w -c #{ENV['COFFEE_OPTIONS']} #{scripts_dir}" 

  desc "Watch #{css_dir} for changes"
  task :scss do
    puts "watching in #{css_dir}"
    directory css_dir
    system scss_watch
  end

  desc "Watch #{scripts_dir} for changes"
  task :coffee do
    directory scripts_dir
    system coffee_watch
  end

  #copied/hacked this code from https://github.com/imathis/octopress/blob/master/Rakefile
  desc "Watch all assets for changes"
  task :all do
    puts "monitoring assets for changes and auto-compiling..."
    directory css_dir
    directory scripts_dir
    scssPid = Process.spawn(scss_watch)
    coffeePid = Process.spawn(coffee_watch)

    trap("INT") {
      [scssPid, coffeePid].each { |pid| Process.kill(9, pid) rescue Errno::ESRCH }
      exit 0
    }

    [scssPid, coffeePid].each { |pid| Process.wait(pid) }
  end
end
