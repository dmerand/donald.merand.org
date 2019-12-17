#Author: Donald L. Merand

local_site_dir = "."
assets_dir = "#{local_site_dir}/assets"
css_dir = "#{assets_dir}/css"

task :default => "watch:all"

namespace :sync do
  desc "send to donald.merand.org"
  task :push => [:tachyons, :'compile:all'] do
    system 'rsync -avzI _site/ dlm:public_html/donald.merand.org/'
  end

  desc "get Tachyons"
  task :tachyons do
    system "curl https://cdn.lab.explo.org/css/tachyons.min.css -o #{css_dir}/tachyons.min.css"
  end
end


namespace :compile do
  #you'll be needing scss and/or coffeescript in your path for this to work
  scss_compile = "scss --update #{ENV['SCSS_OPTIONS']} #{css_dir}"
  jekyll_compile = "bundle exec jekyll build"

  desc "Compile SCSS files in #{css_dir}"
  task :scss do
    directory css_dir
    sh scss_compile
  end

  desc "Compile Jekyll"
  task :jekyll do
    sh jekyll_compile
  end

  desc 'Compile all assets'
  task :all => [:scss, :jekyll] do
    puts "All assets compiled!"
  end
end


namespace :watch do
  # you'll be needing scss in your path for this to work
  scss_watch = "scss --watch #{ENV['SCSS_OPTIONS']} #{css_dir}"
  jekyll_watch = "bundle exec jekyll build --watch"

  desc "Watch #{css_dir} for changes"
  task :scss do
    puts "watching in #{css_dir}"
    directory css_dir
    system scss_watch
  end

  desc "Watch Jekyll action"
  task :jekyll do
    puts "jekyll watching"
    system jekyll_watch
  end

  #copied/hacked this code from https://github.com/imathis/octopress/blob/master/Rakefile
  desc "Watch all assets for changes"
  task :all do
    puts "monitoring assets for changes and auto-compiling..."
    directory css_dir
    scss_pid = Process.spawn(scss_watch)
    jekyll_pid = Process.spawn(jekyll_watch)

    trap("INT") {
      [scss_pid, jekyll_pid].each { |pid| Process.kill(9, pid) rescue Errno::ESRCH }
      exit 0
    }

    [scss_pid, jekyll_pid].each { |pid| Process.wait(pid) }
  end
end
