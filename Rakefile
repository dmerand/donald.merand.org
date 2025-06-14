#Author: Donald L. Merand

local_site_dir = "."
assets_dir = "#{local_site_dir}/assets"
css_dir = "#{assets_dir}/css"
tailwind_compile = "npx tailwindcss -i #{css_dir}/style.css -o #{css_dir}/site.css"

task :default => "watch:all"

namespace :sync do
  desc "send to donald.merand.org"
  task :push => [:'compile:all'] do
    system 'rsync -avzI --exclude="unified-nps/node_modules" _site/ donaldmerand:public_html/donald.merand.org/'
  end
end


namespace :compile do
  jekyll_compile = "bundle exec jekyll build"

  desc "Compile Jekyll"
  task :jekyll do
    sh jekyll_compile
  end

  desc "Compile Tailwind"
  task :tailwind do
    sh tailwind_compile
  end

  desc 'Compile all assets'
  task :all => [:jekyll, :tailwind] do
    puts "All assets compiled!"
  end
end


namespace :watch do
  jekyll_watch = "bundle exec jekyll serve"
  tailwind_watch = "#{tailwind_compile} --watch"

  desc "Watch Jekyll action"
  task :jekyll do
    puts "jekyll watching"
    system jekyll_watch
  end

  desc "Watch Tailwind"
  task "tailwind" do
    puts "tailwind watching"
    system tailwind_watch
  end

  #copied/hacked this code from https://github.com/imathis/octopress/blob/master/Rakefile
  desc "Watch all assets for changes"
  task :all do
    puts "monitoring assets for changes and auto-compiling..."
    jekyll_pid = Process.spawn(jekyll_watch)
    tailwind_pid = Process.spawn(tailwind_watch)

    trap("INT") {
      [jekyll_pid, tailwind_pid].each { |pid| Process.kill(9, pid) rescue Errno::ESRCH }
      exit 0
    }

    [jekyll_pid, tailwind_pid].each { |pid| Process.wait(pid) }
  end
end
