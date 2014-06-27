set :domain, ENV['DEPLOY_HOST'] || 'vag'
set :deploy_to, '/opt/apps/eyespend-web'

def rsync_cache
  "#{settings.deploy_to}/shared/deploy"
end

run = lambda do |*cmd|
  cmd = cmd[0] if cmd[0].is_a?(Array)
  print_command cmd.join(" ") if simulate_mode? || verbose_mode?
  Kernel.system *cmd unless simulate_mode?
end

task :prepare do
  run.('grunt')
end

namespace :rsync do
  task :stage do
    rsync = %w[rsync -az -e ssh --delete --recursive --delete-excluded --exclude .git* ./app/]

    user = settings.user + "@" if settings.user
    host = settings.domain
    rsync << "#{user}#{host}:#{rsync_cache}"

    run.(rsync)
  end

  task :deploy => :stage do
    queue! %(rsync -a --delete --recursive --delete-excluded --exclude .git* "#{rsync_cache}/" ".")
  end
end

task :setup do
  queue! %[mkdir -p "#{deploy_to}/"]
  queue! %[mkdir -p "#{rsync_cache}"]
end

task :deploy do
  deploy do
    invoke "prepare"
    invoke "rsync:deploy"
  end
end
