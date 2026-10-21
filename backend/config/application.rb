require_relative "boot"
require "rails/all"

Bundler.require(*Rails.groups)

module FramesportsApi
  class Application < Rails::Application
    config.load_defaults 8.0
    config.api_only = true
    config.active_job.queue_adapter = :async
    config.active_storage.service = :local
    config.hosts.clear if Rails.env.development?
  end
end
